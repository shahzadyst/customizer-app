import { redirect, useLoaderData, useNavigate, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { getPricing, addPricing, updatePricing, deletePricing, getFontsUsingPricing } from "../models/signage.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  const url = new URL(request.url);
  const customizerId = url.searchParams.get("customizerId");

  if (id === "new") {
    return {
      pricing: {
        name: "",
        label: "",
        letterPricingType: "fixed",
        shippingType: "flat",
        sizeBoundaries: []
      },
      isNew: true,
      customizerId
    };
  }

  const pricing = await getPricing(session.shop, id);

  if (!pricing) {
    throw new Response("Pricing not found", { status: 404 });
  }

  return { pricing, isNew: false, customizerId };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const { id } = params;

  if (action === "checkDelete") {
    const fontsUsingPricing = await getFontsUsingPricing(session.shop, id);
    return Response.json({ fonts: fontsUsingPricing });
  }

  const url = new URL(request.url);
  const customizerId = url.searchParams.get("customizerId");

  if (action === "delete") {
    await deletePricing(session.shop, id);
    if (customizerId) {
      return redirect(`/app/setting-customizers/${customizerId}?section=pricings`);
    }
    return redirect("/app/pricings");
  }

  if (action === "duplicate") {
    const pricing = await getPricing(session.shop, id);
    const newPricing = {
      ...pricing,
      name: `${pricing.name} (Copy)`,
    };
    delete newPricing._id;
    delete newPricing.updatedAt;
    await addPricing(session.shop, newPricing, pricing.customizerId);
    if (customizerId) {
      return redirect(`/app/setting-customizers/${customizerId}?section=pricings`);
    }
    return redirect("/app/pricings");
  }

  const pricingData = {
    name: formData.get("name"),
    label: formData.get("label"),
    letterPricingType: formData.get("letterPricingType"),
    shippingType: formData.get("shippingType"),
    sizeBoundaries: JSON.parse(formData.get("sizeBoundaries") || "[]"),
  };

  const formCustomizerId = formData.get("customizerId");

  if (id === "new") {
    await addPricing(session.shop, pricingData, formCustomizerId || customizerId);
  } else {
    await updatePricing(session.shop, id, pricingData);
  }

  const redirectCustomizerId = formCustomizerId || customizerId;
  if (redirectCustomizerId) {
    return redirect(`/app/setting-customizers/${redirectCustomizerId}?section=pricings`);
  }

  return redirect("/app/pricings");
};

function SizeBoundaryModal({ isOpen, onClose, onSave, boundary, letterPricingType, shippingType }) {
  const [formData, setFormData] = useState(boundary || {
    maxWidth: "",
    maxHeight: "",
    maxLength: "",
    pricePerLetter: "",
    materialPrice: "",
    signStartPrice: "",
    parcelCost: "",
    pricePerCm2: "",
    pricePerCm3: ""
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const calculatePricePerCm2 = (parcelCost) => {
    const width = 100;
    const height = 80;
    const area = width * height;
    return (parseFloat(parcelCost) / area).toFixed(4);
  };

  const calculateParcelCost = (pricePerCm2) => {
    const width = 100;
    const height = 80;
    const area = width * height;
    return (parseFloat(pricePerCm2) * area).toFixed(2);
  };

  const handleParcelCostChange = (value) => {
    setFormData({
      ...formData,
      parcelCost: value,
      pricePerCm2: value ? calculatePricePerCm2(value) : ""
    });
  };

  const handlePricePerCm2Change = (value) => {
    setFormData({
      ...formData,
      pricePerCm2: value,
      parcelCost: value ? calculateParcelCost(value) : ""
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Size Boundary</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px' }}>📐</span>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Size Boundary</h3>
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
            Defines the maximum dimensions that this size boundary will apply to. Signs that match these dimensions will use this boundary's pricing.{' '}
            <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Learn more</a>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: shippingType === 'volumetric' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Maximum Width</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={formData.maxWidth}
                  onChange={(e) => setFormData({ ...formData, maxWidth: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
                <select
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <option>cm</option>
                  <option>in</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Maximum Height</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={formData.maxHeight}
                  onChange={(e) => setFormData({ ...formData, maxHeight: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
                <select
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <option>cm</option>
                  <option>in</option>
                </select>
              </div>
            </div>
            {shippingType === 'volumetric' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Maximum Length</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={formData.maxLength}
                    onChange={(e) => setFormData({ ...formData, maxLength: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                  <select
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    <option>cm</option>
                    <option>in</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {letterPricingType === 'fixed' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>💰</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Letter Pricing Inputs</h3>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
              Set the pricing inputs for this size boundary.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Price Per Letter
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerLetter}
                    onChange={(e) => setFormData({ ...formData, pricePerLetter: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                  Cost of each letter for this size boundary. <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Find out more</a>
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Sign Start Price <span style={{ fontWeight: 400, color: '#666' }}>(Optional)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.signStartPrice}
                    onChange={(e) => setFormData({ ...formData, signStartPrice: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                  Great for including additional costs (e.g. building cost).
                </p>
              </div>
            </div>
          </div>
        )}

        {letterPricingType === 'material' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>💰</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Letter Material Cost Inputs</h3>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
              Set the material pricing inputs for this size boundary.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Material Price
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.materialPrice}
                    onChange={(e) => setFormData({ ...formData, materialPrice: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                  <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>/cm</span>
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                  Cost per centimeter of material used. <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Find out more</a>
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Sign Start Price <span style={{ fontWeight: 400, color: '#666' }}>(Optional)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.signStartPrice}
                    onChange={(e) => setFormData({ ...formData, signStartPrice: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                  Great for including additional costs (e.g. building cost).
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px' }}>📦</span>
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Sign Dimension Price <span style={{ fontWeight: 400, color: '#666' }}>(Shipping Unit Price)</span>
            </h3>
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
            Your shipping unit price is set to <strong>{shippingType === 'flat' ? 'cm²' : 'cm³'}</strong>.
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
            Enter one of two values below: 1. the parcel cost or 2. Price per {shippingType === 'flat' ? 'cm²' : 'cm³'}, the other value will be calculated automatically.{' '}
            <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Learn more</a>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Parcel Cost
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.parcelCost}
                  onChange={(e) => handleParcelCostChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
              </div>
              <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                Enter the cost of the parcel at 100cm wide x 80cm high. <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Learn more</a>
              </p>
            </div>
            <div style={{ fontSize: '20px', paddingBottom: '28px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#999' }}>=</div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Price per {shippingType === 'flat' ? 'cm²' : 'cm³'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>$</span>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.pricePerCm2}
                  onChange={(e) => handlePricePerCm2Change(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#666' }}>{shippingType === 'flat' ? 'cm²' : 'cm³'}</span>
              </div>
              <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                This value is used to calculate shipping cost based on the sign's final {shippingType === 'flat' ? 'area' : 'volume'}.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePricingModal({ isOpen, onClose, fonts, onConfirmDelete, onGoToFonts }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Remove Fonts Before Deleting Pricing
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
          The following fonts will need to be updated with a different pricing before you can delete.
        </p>

        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '12px',
          background: '#f9f9f9',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          {fonts.map((font, index) => (
            <div key={index} style={{
              padding: '8px 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              borderBottom: index < fonts.length - 1 ? '1px solid #e0e0e0' : 'none'
            }}>
              {font.name}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={onGoToFonts}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Go to Fonts
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PricingEditPage() {
  const { pricing, isNew, customizerId } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [formData, setFormData] = useState(pricing);
  const [showBoundaryModal, setShowBoundaryModal] = useState(false);
  const [editingBoundaryIndex, setEditingBoundaryIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fontsUsingPricing, setFontsUsingPricing] = useState([]);

  const handleAddBoundary = () => {
    setEditingBoundaryIndex(null);
    setShowBoundaryModal(true);
  };

  const handleEditBoundary = (index) => {
    setEditingBoundaryIndex(index);
    setShowBoundaryModal(true);
  };

  const handleSaveBoundary = (boundaryData) => {
    const newBoundaries = [...formData.sizeBoundaries];
    if (editingBoundaryIndex !== null) {
      newBoundaries[editingBoundaryIndex] = boundaryData;
    } else {
      newBoundaries.push(boundaryData);
    }
    setFormData({ ...formData, sizeBoundaries: newBoundaries });
  };

  const handleRemoveBoundary = (index) => {
    const newBoundaries = formData.sizeBoundaries.filter((_, i) => i !== index);
    setFormData({ ...formData, sizeBoundaries: newBoundaries });
  };

  const handleDeleteClick = async () => {
    const checkFormData = new FormData();
    checkFormData.append("action", "checkDelete");

    fetcher.submit(checkFormData, { method: "post" });
  };

  const handleConfirmDelete = () => {
    const deleteFormData = new FormData();
    deleteFormData.append("action", "delete");
    fetcher.submit(deleteFormData, { method: "post" });
  };

  const handleGoToFonts = () => {
    navigate('/app/settings?section=fonts');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("label", formData.label);
    submitFormData.append("letterPricingType", formData.letterPricingType);
    submitFormData.append("shippingType", formData.shippingType);
    submitFormData.append("sizeBoundaries", JSON.stringify(formData.sizeBoundaries));
    fetcher.submit(submitFormData, { method: "post" });
  };

  useEffect(() => {
    if (fetcher.data?.fonts) {
      if (fetcher.data.fonts.length > 0) {
        setFontsUsingPricing(fetcher.data.fonts);
        setShowDeleteModal(true);
      } else if (fetcher.data.fonts.length === 0) {
        handleConfirmDelete();
      }
    }
  }, [fetcher.data]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(customizerId ? `/app/setting-customizers/${customizerId}?section=pricings` : '/app/pricings')}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '0',
            marginBottom: '16px'
          }}
        >
          ← Back to {customizerId ? 'Customizer Settings' : 'Pricings'}
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {isNew ? 'Add New Pricing' : 'Edit Pricing'}
        </h1>
      </div>

      <fetcher.Form method="post" onSubmit={handleSubmit}>
        {customizerId && <input type="hidden" name="customizerId" value={customizerId} />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Advanced Letter Price Settings
            </h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
              A flexible system that allows you to mix and match different calculations to create a pricing model that works for you.{' '}
              <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Find out more.</a>
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Label *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              />
              <p style={{ color: '#666', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                The label is not shown to the customer.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Letter Pricing</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
                Choose how the letter portion of signs price is calculated.
              </p>

              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="letterPricingType"
                  value="fixed"
                  checked={formData.letterPricingType === 'fixed'}
                  onChange={(e) => setFormData({ ...formData, letterPricingType: e.target.value })}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Fixed Cost Per Letter</div>
                  <div style={{ color: '#666', fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>e.g. $5 per letter</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="letterPricingType"
                  value="material"
                  checked={formData.letterPricingType === 'material'}
                  onChange={(e) => setFormData({ ...formData, letterPricingType: e.target.value })}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Letter Material Cost</div>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '4px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                    Accurately trace the midline path of each letter that is part of the sign and use that total length as the material length.
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                    <strong>Formula:</strong> Material Length x Material Price <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Find out more</a>
                  </div>
                </div>
              </label>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Sign Dimension Pricing <span style={{ fontWeight: 400, color: '#666' }}>(Shipping Unit Pricing)</span>
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
                Choose how to price the signs dimensions - is primarily used for shipping price. This is an additional calculation that is applied to the final price of this sign.
              </p>

              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shippingType"
                  value="flat"
                  checked={formData.shippingType === 'flat'}
                  onChange={(e) => setFormData({ ...formData, shippingType: e.target.value })}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>📦</span>
                    <span style={{ fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>CM² - Flat Parcel</span>
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                    <strong>Formula:</strong> ((Width x Height) x Unit Price) <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Learn More</a>
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shippingType"
                  value="volumetric"
                  checked={formData.shippingType === 'volumetric'}
                  onChange={(e) => setFormData({ ...formData, shippingType: e.target.value })}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>📦</span>
                    <span style={{ fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>CM³ - Volumetric Parcel</span>
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4 }}>
                    <strong>Formula:</strong> ((Width x Height x Length) / Volume) * Unit Price <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Learn More</a>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Size Boundaries</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
              Add size boundaries to determine which pricing tier applies to a sign dimension. The pricing inputs you can control are determined by the chosen formulas above.{' '}
              <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Find out more</a>
            </p>

            <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
              Showing {formData.sizeBoundaries.length} Size Boundaries
            </div>

            {formData.sizeBoundaries.map((boundary, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => handleEditBoundary(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>Size Boundary {index + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📐</span>
                      <span style={{ color: '#666' }}>
                        All signs up to and including → {boundary.maxWidth}cm wide × {boundary.maxHeight}cm high
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                      Continue to infinity
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      💰 Start Price: ${boundary.signStartPrice || 0}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      📦 Shipping unit price: ${boundary.pricePerCm2 || 0} per cm² (Parcel Cost: ${boundary.parcelCost || 0})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBoundary(index);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddBoundary}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⊕</span>
              Add size boundary
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            padding: '16px 0'
          }}>
            {!isNew && (
              <>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#d32f2f',
                    border: '1px solid #d32f2f',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    marginRight: 'auto'
                  }}
                >
                  Delete Pricing
                </button>
                <button
                  type="button"
                  onClick={() => fetcher.submit({ action: 'duplicate' }, { method: 'post' })}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Duplicate
                </button>
              </>
            )}
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Save
            </button>
          </div>
        </div>
      </fetcher.Form>

      <SizeBoundaryModal
        isOpen={showBoundaryModal}
        onClose={() => setShowBoundaryModal(false)}
        onSave={handleSaveBoundary}
        boundary={editingBoundaryIndex !== null ? formData.sizeBoundaries[editingBoundaryIndex] : null}
        letterPricingType={formData.letterPricingType}
        shippingType={formData.shippingType}
      />

      <DeletePricingModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        fonts={fontsUsingPricing}
        onConfirmDelete={handleConfirmDelete}
        onGoToFonts={handleGoToFonts}
      />
    </div>
  );
}

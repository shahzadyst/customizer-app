import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getPricings, deletePricing } from "../models/signage.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const pricings = await getPricings(session.shop);

  return { pricings };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "delete") {
    const id = formData.get("id");
    await deletePricing(session.shop, id);
  }

  return { success: true };
};

export default function PricingsPage() {
  const { pricings } = useLoaderData();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
            Price your signs for success
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            We have created a helpful resource to ensure you understand how Advanced Letter pricing works.{' '}
            <a href="#" style={{ color: '#0066cc' }}>Find out more.</a>
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Pricing</h2>
          <s-button variant="primary" onClick={() => navigate('/app/pricings/new')}>
            Add Pricing
          </s-button>
        </div>

        {pricings.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
            <p style={{ marginBottom: '16px' }}>No pricing configurations yet.</p>
            <p style={{ fontSize: '14px' }}>
              Add one or more pricings to target different groupings or types of fonts (e.g. expensive fonts, double line, triple line, italic fonts, etc.).
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Letter Pricing
                    <span style={{ fontSize: '18px', color: '#999', cursor: 'help' }}>ⓘ</span>
                  </div>
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Shipping
                    <span style={{ fontSize: '18px', color: '#999', cursor: 'help' }}>ⓘ</span>
                  </div>
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600 }}>Size Boundaries</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricings.map((pricing) => (
                <tr
                  key={pricing._id.toString()}
                  style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onClick={() => navigate(`/app/pricings/${pricing._id.toString()}`)}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{pricing.name}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {pricing.letterPricingType === 'fixed' ? (
                        <>
                          <span style={{ fontSize: '18px' }}>🔤</span>
                          <span>Fixed Cost</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '18px' }}>📏</span>
                          <span>Material Cost</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>📦</span>
                      <span>CM²</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{
                      background: '#f0f0f0',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500
                    }}>
                      {pricing.sizeBoundaries?.length || 0}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <s-button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      ⋯
                    </s-button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

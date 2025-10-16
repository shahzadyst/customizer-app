import { useNavigate } from "react-router";

export default function PricingSettings({ pricings, customizerId }) {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          Pricing Configurations
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage pricing configurations for this customizer. These pricings are specific to this customizer and can be assigned to individual fonts.
        </p>
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
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Available Pricings</h3>
          <button
            onClick={() => navigate('/app/pricing-settings/new')}
            style={{
              padding: '8px 16px',
              background: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Add Pricing
          </button>
        </div>

        {pricings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>💰</div>
            <p style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 500 }}>No pricing configurations yet</p>
            <p style={{ fontSize: '14px' }}>
              Add pricing configurations to control how fonts are priced in this customizer.
            </p>
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {pricings.map((pricing) => {
              const dbId = pricing._id ? pricing._id.toString() : '';

              return (
                <div
                  key={pricing._id.toString()}
                  onClick={() => navigate(`/app/pricing-settings/${dbId}`)}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
                        {pricing.name}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            color: '#666'
                          }}
                        >
                          {pricing.letterPricingType === 'fixed' ? (
                            <>
                              <span>🔤</span>
                              <span>Fixed Cost</span>
                            </>
                          ) : (
                            <>
                              <span>📏</span>
                              <span>Material Cost</span>
                            </>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            color: '#666'
                          }}
                        >
                          <span>📦</span>
                          <span>CM² Shipping</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            color: '#666'
                          }}
                        >
                          <span>📐</span>
                          <span>{pricing.sizeBoundaries?.length || 0} Size Boundaries</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#999', fontSize: '20px' }}>→</div>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f9fafb',
        border: '1px solid #e0e0e0',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>About Pricing</h4>
        </div>
        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
          Pricing configurations define how your signs are priced based on letter costs, shipping calculations, and size boundaries.
          Each pricing can be assigned to specific fonts to create flexible pricing strategies for different font types or styles.
        </p>
      </div>
    </div>
  );
}

import { useFetcher, useNavigate } from "react-router";
import { useDragReorder } from '../hooks/useDragReorder';

export default function FontSettings({ fonts, pricings = [], customizerId }) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const { items: orderedFonts, getDragProps, MessageComponent } = useDragReorder(
    fonts,
    (newOrder) => {
      return fetcher.submit(
        { action: 'reorderFonts', order: JSON.stringify(newOrder) },
        { method: 'post' }
      );
    },
    {
      successMessage: 'Font order updated! 🎨',
      onSuccess: (newOrder) => {
        console.log('New order:', newOrder);
      },
      onError: (error) => {
        console.error('Reorder failed:', error);
      }
    }
  );

  return (
    <div>
      {MessageComponent} {/* Add this to show success/error messages */}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <s-text size="large" weight="semibold">Fonts</s-text>
        <s-button
          onClick={() => navigate(`/app/font-form/${customizerId}`)}
          variant="primary"
        >
          Add Font
        </s-button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Name</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Family</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Pricing</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Min Height (Lower)</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Min Height (Upper)</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orderedFonts.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                No fonts added yet. Click "Add Font" to get started.
              </td>
            </tr>
          ) : (
            orderedFonts.map((font, index) => {
              const pricing = pricings.find(p => p._id.toString() === font.pricingId);
              return (
                <tr
                  key={font._id.toString()}
                  {...getDragProps(index)}
                  style={{
                    ...getDragProps(index).style,
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div>
                      <s-text weight="semibold">{font.name}</s-text>
                      {font.isCustomFont && (
                        <div style={{
                          display: 'inline-block',
                          marginLeft: '8px',
                          padding: '2px 8px',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          CUSTOM
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text color="subdued">{font.fontFamily}</s-text>
                    {font.fontFileName && (
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                        {font.fontFileName}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {pricing ? (
                      <s-text>{pricing.name}</s-text>
                    ) : (
                      <s-text color="subdued">No pricing</s-text>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <s-text>{font.minHeightSmallest || '-'} cm</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <s-text>{font.minHeightUppercase || '-'} cm</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/app/font-form/${customizerId}?fontId=${font._id.toString()}`)}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Edit
                      </button>
                      <fetcher.Form method="post" style={{ display: 'inline' }}>
                        <input type="hidden" name="action" value="deleteFont" />
                        <input type="hidden" name="id" value={font._id.toString()} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this font?')) {
                              e.preventDefault();
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Delete
                        </button>
                      </fetcher.Form>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

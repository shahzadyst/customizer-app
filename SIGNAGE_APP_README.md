# Signage Customizer Shopify App

A comprehensive Shopify embedded app that allows customers to customize signage products with fonts, colors, sizes, shapes, and mounting options. Built for signage businesses with multi-store support.

## Features

### Admin Features
- **Fonts Management**: Add custom fonts with CSS font families and optional font URLs
- **Colors**: Configure color options with hex values
- **Sizes**: Define size options with dimensions and price modifiers
- **Usage Types**: Set Indoor/Outdoor options
- **Acrylic Shapes**: Manage shape options (Cut Around, Rectangle, Cut to Letter, Acrylic Stand)
- **Backboard Colors**: Configure backboard color choices
- **Hanging Options**: Add mounting options (Wall Mounted Kit, Sign Hanging Kit)
- **Price Modifiers**: Each option can have an additional cost
- **Multi-Store Support**: Each store has its own configuration

### Storefront Features
- **Interactive Customizer Modal**: Beautiful modal interface for customers
- **Real-Time Preview**: See customization changes instantly
- **Custom Text Input**: Customers can enter their custom text
- **Visual Options**: Color swatches and visual selection for all options
- **Price Calculation**: Automatic calculation of additional costs
- **Responsive Design**: Works on all device sizes

## Database Schema

The app uses Supabase with the following tables:

- `stores`: Store information and settings
- `fonts`: Available font options
- `colors`: Color choices
- `sizes`: Size options with dimensions
- `usage_types`: Indoor/Outdoor types
- `acrylic_shapes`: Shape selections
- `backboard_colors`: Backboard color options
- `hanging_options`: Mounting/hanging choices

All tables support:
- Soft enable/disable with `is_active` flag
- Custom display ordering
- Price modifiers (where applicable)
- Multi-store isolation

## Setup Instructions

### 1. Configure Your Options

1. Install the app on your Shopify store
2. Navigate to the **Settings** page in the app
3. Add your customization options:
   - Add fonts (e.g., Arial, Roboto, custom fonts)
   - Add colors with hex values
   - Define sizes with dimensions and pricing
   - Configure usage types (Indoor/Outdoor)
   - Add acrylic shape options
   - Set backboard colors
   - Define hanging/mounting options

### 2. Install the Embed Script

1. Go to the **Embed Script** page in the app
2. Copy the provided script tag
3. Add it to your theme's `theme.liquid` file before the closing `</body>` tag

```html
<script src="YOUR_APP_URL/embed/YOUR_SHOP_DOMAIN" defer></script>
```

### 3. Add Customizer Button to Products

Add this button to your product template where you want customers to customize:

```html
<button class="signage-customizer-btn" data-product-id="{{ product.id }}">
  Customize Signage
</button>
```

### 4. Test the Customizer

1. Visit a product page on your storefront
2. Click the "Customize Signage" button
3. The modal will open with all your configured options
4. Test selecting options and entering custom text
5. Verify the real-time preview updates

## API Endpoints

### Get Store Configuration
```
GET /api/config/:shop
```

Returns all active configuration options for a store. Used by the storefront embed script.

Response:
```json
{
  "success": true,
  "config": {
    "fonts": [...],
    "colors": [...],
    "sizes": [...],
    "usageTypes": [...],
    "acrylicShapes": [...],
    "backboardColors": [...],
    "hangingOptions": [...]
  }
}
```

### Embed Script
```
GET /embed/:shop
```

Returns the JavaScript embed script customized for the specific shop.

## Customization Events

The embed script dispatches a custom event when customers complete their customization:

```javascript
window.addEventListener('signageCustomized', (event) => {
  const customization = event.detail;
  // customization contains:
  // - text: Custom text entered
  // - font: Selected font name
  // - color: Selected color name
  // - size: Selected size name
  // - usageType: Selected usage type
  // - acrylicShape: Selected shape
  // - backboardColor: Selected backboard color
  // - hangingOption: Selected hanging option
  // - totalPrice: Total additional cost
});
```

You can listen to this event to integrate with your cart or save customizations.

## Multi-Store Support

The app automatically supports multiple Shopify stores:

- Each store gets its own configuration database
- Store identification is automatic via Shopify session
- Embed scripts are unique per store
- All data is isolated between stores

## Technical Stack

- **Framework**: React Router 7
- **UI**: Shopify Polaris Web Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Shopify App Bridge
- **Storefront**: Vanilla JavaScript (no dependencies)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
```

## App Structure

```
app/
├── routes/
│   ├── app._index.jsx          # Dashboard/home page
│   ├── app.settings.jsx        # Admin settings management
│   ├── app.embed.jsx           # Embed script instructions
│   ├── api.config.$shop.jsx    # Configuration API endpoint
│   └── embed.$shop.jsx         # JavaScript embed script
├── supabase.server.js          # Supabase client and utilities
└── shopify.server.js           # Shopify authentication
```

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SHOPIFY_APP_URL=your_app_url
```

## Best Practices

1. **Start Simple**: Begin with a few options in each category
2. **Test Thoroughly**: Test the customizer on your storefront before going live
3. **Price Modifiers**: Set realistic price modifiers for each option
4. **Display Order**: Use display order to control option presentation
5. **Active/Inactive**: Use the active flag to temporarily hide options without deleting

## Future Enhancements

Potential features to add:

- Image uploads for logo/graphics
- Template designs
- Order history and saved customizations
- Admin preview of customer customizations
- Bulk import/export of options
- Analytics on popular options
- Integration with fulfillment systems

## Support

For issues or questions about this app, please contact your development team or refer to the Shopify App development documentation.

## License

Proprietary - For use by authorized stores only.

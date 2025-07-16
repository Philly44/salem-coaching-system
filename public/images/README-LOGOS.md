# Adding Logos to the FAQ Generator

## How to Add Your Salem University Logo

1. **Prepare your logo files:**
   - Format: PNG (recommended) or JPG
   - Recommended size: 200-400px width
   - Background: Transparent (for PNG) or white
   - Name your files:
     - `salem-logo.png` - Main logo for PDF header
     - `salem-logo-white.png` - White version for dark backgrounds

2. **Place the logo files in this directory:**
   - Copy your logo files to: `/public/images/`
   - The files will be accessible at: `/images/salem-logo.png`

3. **Update the FAQ generator code:**
   - Open `/src/utils/faqGenerator.ts`
   - Find the comment: `// To add an actual logo later:`
   - Uncomment the line: `doc.addImage('/images/salem-logo.png', 'PNG', 20, 10, 50, 20);`
   - Adjust the parameters as needed:
     - First two numbers (20, 10): X and Y position
     - Last two numbers (50, 20): Width and Height

4. **Logo positioning parameters:**
   ```javascript
   doc.addImage(
     '/images/salem-logo.png',  // Path to logo
     'PNG',                     // Format
     20,                        // X position (from left)
     10,                        // Y position (from top)
     50,                        // Width
     20                         // Height
   );
   ```

5. **Test the logo:**
   - Run a transcript evaluation
   - Download the FAQ PDF
   - Check that the logo appears correctly

## Color Information
- Kelly Green has been implemented: `#009B3A` (RGB: 0, 155, 58)
- This appears in the header, section titles, and footer

## Troubleshooting
- If the logo doesn't appear, check the file path
- Ensure the logo file is in the correct format (PNG/JPG)
- Check browser console for any errors
- The text fallback will display if the logo fails to load
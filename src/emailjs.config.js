// =====================================================================
// EMAILJS CONFIGURATION
// =====================================================================
// To enable real email sending, follow these steps:
//
// 1. Go to https://www.emailjs.com/ and create a FREE account
// 2. Click "Add New Service" → choose Gmail/Outlook → copy the Service ID
// 3. Click "Email Templates" → "Create New Template"
//    Use these template variables in your template:
//      {{to_email}}    - recipient email
//      {{to_name}}     - recipient name
//      {{from_name}}   - e.g. "Shrutika from Abc"
//      {{workspace}}   - workspace name
//      {{role}}        - Member / Admin / Viewer
//      {{invite_link}} - app URL
// 4. Copy the Template ID
// 5. Go to Account → API Keys → copy your Public Key
// 6. Paste all three values below
// =====================================================================

export const EMAILJS_CONFIG = {
  SERVICE_ID:  'YOUR_SERVICE_ID',   // e.g. 'service_abc123'
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID', // e.g. 'template_xyz789'
  PUBLIC_KEY:  'YOUR_PUBLIC_KEY',   // e.g. 'AbCdEfGhIjKlMnOpQr'
};


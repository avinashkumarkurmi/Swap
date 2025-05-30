const tintColorLight = '#2AB69D'; // Eco green for light mode
const tintColorDark = '#2AB69D';  // Consistent brand identity

export const Colors = {
  light: {
    text: '#1F1F1F',             // Primary text color (dark gray)
    textSecondary: '#4B5563',    // Secondary text (medium gray)
    placeholder: '#9CA3AF',      // Placeholder text (light gray)
    background: '#F9FAFB',       // App background (very light gray)
    card: '#FFFFFF',             // Cards or containers (white)
    border: '#E5E7EB',           // Borders and dividers (light gray)
    icon: '#6B7280',             // Icons (gray)
    tint: tintColorLight,        // Primary brand tint (eco green)
    secondary: '#FFD369',        // Accent/yellow for highlights
    tabIconDefault: '#A1A1AA',   // Default tab icon color (gray)
    tabIconSelected: tintColorLight, // Selected tab icon (eco green)
    success: '#22C55E',          // Success messages/indicators (green)
    error: '#EF4444',            // Error messages (red)
    warning: '#F59E0B',          // Warnings (orange)
    info: '#3B82F6',             // Informational (blue)
  },
  dark: {
    text: '#F3F4F6',             // Primary text (light gray)
    textSecondary: '#9CA3AF',    // Secondary text (gray)
    placeholder: '#6B7280',      // Placeholder text (darker gray)
    background: '#111827',       // App background (dark navy)
    card: '#1F2937',             // Cards or containers (dark gray)
    border: '#374151',           // Borders and dividers (dark gray)
    icon: '#9CA3AF',             // Icons (gray)
    tint: tintColorDark,         // Primary brand tint (eco green)
    secondary: '#FFD369',        // Accent/yellow for highlights
    tabIconDefault: '#6B7280',   // Default tab icon color (gray)
    tabIconSelected: tintColorDark, // Selected tab icon (eco green)
    success: '#22C55E',          // Success messages/indicators (green)
    error: '#EF4444',            // Error messages (red)
    warning: '#F59E0B',          // Warnings (orange)
    info: '#3B82F6',             // Informational (blue)
  },
};

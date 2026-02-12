// utils/mpesa.ts

/**
 * Format phone number for M-Pesa
 * Converts to format: 2547XXXXXXXX
 */
export const formatMpesaPhoneNumber = (phone: string): string => {
  let formatted = phone.trim().replace(/\s+/g, '');
  
  // Remove + if present
  if (formatted.startsWith('+')) {
    formatted = formatted.substring(1);
  }
  
  // Add 254 prefix if starts with 0
  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  }
  
  // Ensure starts with 254
  if (!formatted.startsWith('254')) {
    formatted = '254' + formatted;
  }
  
  return formatted;
};

/**
 * Validate phone number for M-Pesa
 */
export const isValidMpesaPhoneNumber = (phone: string): boolean => {
  const formatted = formatMpesaPhoneNumber(phone);
  // Kenyan phone numbers should be 12 digits (254XXXXXXXXX)
  return /^254[17]\d{8}$/.test(formatted);
};

/**
 * Simulate M-Pesa STK Push (for development/testing)
 */
export const simulateMpesaStkPush = async (phone: string, amount: number): Promise<{
  success: boolean;
  checkoutRequestId?: string;
  error?: string;
}> => {
  // This is a simulation - in production, you'd call your backend API
  console.log('Simulating M-Pesa STK Push:', { phone, amount });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success 90% of the time for testing
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    const checkoutRequestId = 'ws_CO_' + Date.now() + Math.random().toString(36).substr(2, 9);
    return {
      success: true,
      checkoutRequestId,
    };
  } else {
    return {
      success: false,
      error: 'STK Push failed. Please try again.',
    };
  }
};
import fetch from 'node-fetch';

// Text.lk SMS API configuration
const SMS_API_KEY = process.env.TEXT_LK_API_KEY || 'placeholder_api_key';
const SMS_SENDER_ID = process.env.TEXT_LK_SENDER_ID || 'ShopEase';
const SMS_API_URL = 'https://api.text.lk/sms/send';

/**
 * Send SMS using Text.lk API
 * @param phone Phone number to send SMS to
 * @param message SMS content
 * @returns Promise with the API response
 */
export async function sendSMS(phone: string, message: string): Promise<any> {
  try {
    // In development mode with placeholder API key, log instead of sending
    if (SMS_API_KEY === 'placeholder_api_key' && process.env.NODE_ENV === 'development') {
      console.log(`[SMS SIMULATION] To: ${phone}, Message: ${message}`);
      return { success: true, simulated: true };
    }

    // Format phone number to include country code if needed
    const formattedPhone = formatPhoneNumber(phone);
    
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_API_KEY}`
      },
      body: JSON.stringify({
        sender_id: SMS_SENDER_ID,
        recipient: formattedPhone,
        message: message
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Format phone number to ensure it has the correct country code
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If the number doesn't start with +, add Sri Lankan country code as default
  // Replace with appropriate country code as needed
  if (!phone.startsWith('+')) {
    // Assuming Sri Lankan numbers
    if (digitsOnly.startsWith('0')) {
      return `+94${digitsOnly.substring(1)}`;
    } else {
      return `+94${digitsOnly}`;
    }
  }
  
  return phone;
}

/**
 * Generate a random OTP code
 * @param length Length of the OTP
 * @returns OTP code
 */
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}

/**
 * Send OTP verification code via SMS
 * @param phone Phone number to send OTP to
 * @param otp OTP code to send
 * @returns Promise with the API response
 */
export async function sendOTPSMS(phone: string, otp: string): Promise<any> {
  const message = `Your ShopEase verification code is: ${otp}. It will expire in 10 minutes.`;
  return sendSMS(phone, message);
}
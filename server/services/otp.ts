import { storage } from '../storage';
import { generateOTP, sendOTPSMS } from './sms';
import { InsertOTP } from '@shared/schema';

// OTP expiration time in minutes
const OTP_EXPIRY_MINUTES = 10;

/**
 * Create and send a new OTP for a user
 * @param userId The user's ID
 * @param phone The user's phone number
 * @returns Object containing the OTP details and send status
 */
export async function createAndSendOTP(userId: number, phone: string): Promise<{ success: boolean; message: string; otpId?: number }> {
  try {
    // Generate a new OTP code
    const otpCode = generateOTP(6);
    
    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
    
    // Create OTP record in database
    const otpData: InsertOTP = {
      userId,
      otp: otpCode,
      expiresAt
    };
    
    const otp = await storage.createOTP(otpData);
    
    // Send OTP via SMS
    const smsResult = await sendOTPSMS(phone, otpCode);
    
    // For development with placeholder API key, we'll consider it a success
    if (smsResult.simulated) {
      return { 
        success: true, 
        message: 'OTP created and simulated in development mode. Check server logs for OTP code.',
        otpId: otp.id
      };
    }
    
    // Check if SMS was sent successfully
    if (smsResult.success) {
      return { 
        success: true, 
        message: 'OTP sent successfully',
        otpId: otp.id
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to send OTP via SMS',
        otpId: otp.id
      };
    }
    
  } catch (error) {
    console.error('Error creating and sending OTP:', error);
    return { success: false, message: 'Error creating and sending OTP' };
  }
}

/**
 * Verify an OTP code for a user
 * @param userId The user's ID
 * @param otpCode The OTP code to verify
 * @returns Boolean indicating if the OTP is valid
 */
export async function verifyOTP(userId: number, otpCode: string): Promise<boolean> {
  try {
    // Validate the OTP
    const isValid = await storage.validateOTP(userId, otpCode);
    
    // If valid, mark as used
    if (isValid) {
      const otp = await storage.getOTPByUserId(userId);
      if (otp) {
        await storage.markOTPAsUsed(otp.id);
      }
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}
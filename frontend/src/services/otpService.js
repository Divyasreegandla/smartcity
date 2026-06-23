// src/services/otpService.js
import api from './api';

const otpService = {
  // Send email OTP
  sendEmailOTP: async (email) => {
    const response = await api.post('/otp/email/send', { email });
    return response.data;
  },

  // Verify email OTP
  verifyEmailOTP: async (email, otp) => {
    const response = await api.post('/otp/email/verify', { email, otp });
    return response.data;
  },

  // Resend email OTP
  resendEmailOTP: async (email) => {
    const response = await api.post('/otp/email/resend', { email });
    return response.data;
  },

  // Check email verification status
  checkEmailVerification: async (email) => {
    const response = await api.get(`/otp/email/status?email=${email}`);
    return response.data;
  },

  // Send mobile OTP
  sendMobileOTP: async (countryCode, mobileNumber) => {
    const response = await api.post('/otp/mobile/send', {
      country_code: countryCode,
      mobile_number: mobileNumber
    });
    return response.data;
  },

  // Verify mobile OTP
  verifyMobileOTP: async (countryCode, mobileNumber, otp) => {
    const response = await api.post('/otp/mobile/verify', {
      country_code: countryCode,
      mobile_number: mobileNumber,
      otp: otp
    });
    return response.data;
  },

  // Resend mobile OTP
  resendMobileOTP: async (countryCode, mobileNumber) => {
    const response = await api.post('/otp/mobile/resend', {
      country_code: countryCode,
      mobile_number: mobileNumber
    });
    return response.data;
  },

  // Check mobile verification status
  checkMobileVerification: async (countryCode, mobileNumber) => {
    const response = await api.get(`/otp/mobile/status?country_code=${countryCode}&mobile_number=${mobileNumber}`);
    return response.data;
  }
};

export default otpService;
// src/components/Billing/OTPModal.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import otpService from '../../services/otpService';

const OTPModal = ({ onVerify, onClose, email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [debugOtp, setDebugOtp] = useState('');

  useEffect(() => {
    // ✅ Send OTP when modal opens
    handleSendOTP();

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await otpService.sendEmailOTP(email);
      console.log('OTP Response:', response); // ✅ Debug log
      
      // ✅ Extract OTP from response
      const otpCode = response.data?.otp || response.otp;
      if (otpCode) {
        setDebugOtp(otpCode);
        toast.success(`OTP sent! Check your email or use: ${otpCode}`);
      } else {
        toast.success('OTP sent to your email!');
      }
    } catch (error) {
      console.error('OTP Error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await otpService.verifyEmailOTP(email, otp);
      toast.success('OTP verified successfully!');
      onVerify();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await otpService.resendEmailOTP(email);
      const otpCode = response.data?.otp || response.otp;
      if (otpCode) {
        setDebugOtp(otpCode);
        toast.success(`OTP resent! Use: ${otpCode}`);
      } else {
        toast.success('OTP resent!');
      }
      setTimer(60);
      setResendDisabled(true);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaShieldAlt className="text-blue-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Verify Your Identity</h2>
          <p className="text-sm text-gray-500">
            OTP sent to <span className="font-medium">{email}</span>
          </p>
          
          {/* ✅ Show OTP for testing */}
          {debugOtp && (
            <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium">
                📧 Your OTP: <span className="text-2xl font-bold tracking-widest">{debugOtp}</span>
              </p>
              <p className="text-xs text-yellow-500 mt-1">Copy this OTP to verify</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-primary-500"
            autoFocus
          />

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {timer > 0 ? `Resend in ${timer}s` : 'OTP expired'}
            </span>
            <button
              onClick={handleResend}
              disabled={resendDisabled || loading}
              className={`text-primary-600 hover:text-primary-700 ${(resendDisabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Resend OTP
            </button>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !otp}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <FaEnvelope className="text-gray-300" />
            <span>Check your spam folder if you don't see the email</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
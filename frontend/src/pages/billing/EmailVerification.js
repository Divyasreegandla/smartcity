// src/pages/billing/EmailVerification.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import { FaEnvelope, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import otpService from '../../services/otpService';

const EmailVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('send');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await otpService.sendEmailOTP(email);
      toast.success('OTP sent to your email!');
      setStep('verify');
      setTimer(60);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await otpService.verifyEmailOTP(email, otp);
      setIsVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/bills'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await otpService.resendEmailOTP(email);
      toast.success('OTP resent!');
      setTimer(60);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
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
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate('/bills')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Email Verification</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {isVerified ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-green-500 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Verified!</h2>
              <p className="text-gray-500">Your email has been verified</p>
            </div>
          ) : step === 'send' ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaEnvelope className="text-blue-500 text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Verify Email</h2>
                <p className="text-sm text-gray-500">We'll send a 6-digit OTP to your email</p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaShieldAlt className="text-yellow-500 text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Enter OTP</h2>
                <p className="text-sm text-gray-500">OTP sent to {email}</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="w-full px-3 py-2 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-primary-500"
                />

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <span className="text-sm text-gray-500">Resend in {timer}s</span>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmailVerification;
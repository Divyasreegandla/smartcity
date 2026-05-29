export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length >= 10 && phoneDigits.length <= 15;
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePincode = (pincode) => {
  if (!pincode) return true;
  return /^\d{4,10}$/.test(pincode);
};
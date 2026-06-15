// Utility function to safely extract error message from any error type
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error response with detail
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // If detail is a string
    if (typeof detail === 'string') {
      return detail;
    }
    
    // If detail is an array (Pydantic validation errors)
    if (Array.isArray(detail)) {
      if (detail.length > 0) {
        // Extract the first error message
        const firstError = detail[0];
        if (firstError.msg) {
          return firstError.msg;
        }
        if (firstError.message) {
          return firstError.message;
        }
      }
      return 'Validation error occurred';
    }
    
    // If detail is an object
    if (typeof detail === 'object') {
      if (detail.msg) return detail.msg;
      if (detail.message) return detail.message;
      return 'Validation error occurred';
    }
  }
  
  // Handle error message
  if (error.message) {
    return error.message;
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An error occurred';
};

// Safe toast error function
export const showErrorToast = (error, toastFn) => {
  const message = getErrorMessage(error);
  toastFn(message);
};
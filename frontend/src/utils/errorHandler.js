// Utility function to safely extract error message from any error type
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error response with detail
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    if (typeof detail === 'string') {
      return detail;
    }
    
    if (Array.isArray(detail)) {
      // Pydantic validation errors - extract the msg
      if (detail[0]?.msg) {
        return detail[0].msg;
      }
      return 'Validation error occurred';
    }
    
    if (typeof detail === 'object') {
      // Try to get msg from object
      if (detail.msg) return detail.msg;
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
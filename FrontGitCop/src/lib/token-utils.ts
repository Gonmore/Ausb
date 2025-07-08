// Utility functions for JWT token handling
export const tokenUtils = {
  isTokenExpired: (token: string): boolean => {
    try {
      if (!token) return true;
      
      // Decode JWT token (without verification, just to read expiration)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp < currentTime;
    } catch (error) {
      console.log('Error decoding token:', error);
      return true; // If we can't decode it, consider it expired
    }
  },

  clearExpiredToken: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    if (tokenUtils.isTokenExpired(token)) {
      localStorage.removeItem('authToken');
      console.log('🕒 Expired token removed from localStorage');
      return true;
    }
    
    return false;
  },

  getValidToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    if (tokenUtils.isTokenExpired(token)) {
      localStorage.removeItem('authToken');
      return null;
    }
    
    return token;
  }
};

const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.startsWith('192.168.') || 
                 window.location.hostname.startsWith('10.');

export const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000/api' : 'https://visionspa.onrender.com/api');

export const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('blob:')) return '';
  const origin = window.location.origin;
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('vision_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    credentials: 'include', // Important for httpOnly cookies
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    if (!res.ok) {
      let serverMsg = `Server error: ${res.status}`;
      try {
        const errData = await res.json();
        if (errData.message) serverMsg = errData.message;
      } catch (e) {
        // Fallback to generic status message
      }
      console.error(`API Error (${endpoint}): ${res.status}`, serverMsg);
      return { success: false, message: serverMsg };
    }
    return await res.json();
  } catch (error) {
    console.error(`Network Error (${endpoint}):`, error);
    return { success: false, message: 'Network connection failed' };
  }
};

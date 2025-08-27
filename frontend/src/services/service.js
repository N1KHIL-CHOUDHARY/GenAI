import axios from 'axios';

// Create a central API client
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});



// Use an interceptor to automatically add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



// --- Authentication ---
const register = (name, email, password) => {
  return apiClient.post('/auth/register', { name, email, password });
};

const login = (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

const logout = () => {
  localStorage.removeItem('token');
};



// --- Documents & Analysis ---
const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};



const getAnalysis = (documentId) => {
  return apiClient.get(`/analysis/${documentId}`);
};




// --- Export all API functions ---
const apiService = {
  register,
  login,
  logout,
  uploadDocument,
  getAnalysis,
};

export default apiService;
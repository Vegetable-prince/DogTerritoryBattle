import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: apiUrl,
});

export default apiClient;

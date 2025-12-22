import axios from 'axios';
import { createMockApi, MockWebSocket, isMockMode } from '../mock/mockApi';

// Check if mock mode is enabled
const MOCK_MODE = isMockMode();

// Konfigurasi URL - fallback ke localhost jika env tidak ada
const HTTP_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
// Ganti protocol http->ws atau https->wss
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export const SOCKET_URL = WS_URL;

// Export MockWebSocket untuk digunakan di RoomContext jika mock mode aktif
export { MockWebSocket, MOCK_MODE };

// Create API instance - mock atau real
let api;

if (MOCK_MODE) {
  console.log('🔧 Running in MOCK MODE - No backend required');
  api = createMockApi();
} else {
  api = axios.create({
    baseURL: HTTP_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor: Sisipkan Token JWT ke setiap request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export const getRoomHistory = async () => {
  const res = await api.get("/rooms/history");
  return res.data;
};

export default api;
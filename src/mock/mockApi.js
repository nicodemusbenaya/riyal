/**
 * Mock API Service
 * Mensimulasikan response backend untuk preview UI tanpa backend
 */

import { DUMMY_USERS, getRandomBotResponse } from './mockData';

// Simulated delay untuk mensimulasikan network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper untuk persist mock user ke localStorage
const MOCK_USER_KEY = 'mockCurrentUser';
const MOCK_ROOM_KEY = 'mockRoom';

const saveMockUser = (user) => {
  if (user) {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
  }
};

const loadMockUser = () => {
  const saved = localStorage.getItem(MOCK_USER_KEY);
  return saved ? JSON.parse(saved) : null;
};

const saveMockRoom = (room) => {
  if (room) {
    localStorage.setItem(MOCK_ROOM_KEY, JSON.stringify(room));
  } else {
    localStorage.removeItem(MOCK_ROOM_KEY);
  }
};

const loadMockRoom = () => {
  const saved = localStorage.getItem(MOCK_ROOM_KEY);
  return saved ? JSON.parse(saved) : null;
};

const MOCK_HISTORY_KEY = 'mockRoomHistory';

const saveMockHistory = (history) => {
  localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history));
};

const loadMockHistory = () => {
  const saved = localStorage.getItem(MOCK_HISTORY_KEY);
  return saved ? JSON.parse(saved) : [];
};

const addToHistory = (roomData) => {
  const history = loadMockHistory();
  const entry = {
    id: Date.now().toString(),
    room_id: roomData.id,
    action: `Room dengan ${roomData.members?.length || 0} anggota`,
    created_at: new Date().toISOString(),
    ...roomData
  };
  history.unshift(entry);
  // Keep only last 10 entries
  const trimmed = history.slice(0, 10);
  saveMockHistory(trimmed);
};

// Mock state - load from localStorage if available
let mockCurrentUser = loadMockUser();
let mockToken = localStorage.getItem('token');
let mockRoom = loadMockRoom();
let mockMessages = [];

// Generate mock token
const generateMockToken = () => {
  const token = 'mock_token_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('token', token); // Save token langsung
  return token;
};

// Generate mock user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 10);
};

/**
 * Mock API handlers yang meniru endpoint backend
 */
const mockHandlers = {
  // ============== AUTH ==============
  'POST /auth/login': async (data) => {
    await delay(500);
    const { email, password } = data;
    
    if (!email || !password) {
      throw { response: { status: 400, data: { detail: 'Email dan password harus diisi' } } };
    }
    
    // Simulasi login sukses
    mockToken = generateMockToken();
    mockCurrentUser = {
      id: generateUserId(),
      email: email,
      name: email.split('@')[0],
      username: email.split('@')[0],
      profileComplete: true,
      role: 'FE Engineer',
      skills: ['React', 'JavaScript'],
      pict: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    // Simpan ke localStorage
    saveMockUser(mockCurrentUser);
    
    return { access_token: mockToken };
  },

  'POST /auth/register': async (data) => {
    await delay(500);
    const { email, name, username, password } = data;
    
    if (!email || !password || !name) {
      throw { response: { status: 400, data: { detail: 'Semua field harus diisi' } } };
    }
    
    return { message: 'Registration successful' };
  },

  'GET /auth/google/login': async () => {
    await delay(300);
    // Di mock mode, langsung simulasikan Google login sukses
    mockToken = generateMockToken();
    mockCurrentUser = {
      id: generateUserId(),
      email: 'mock.google.user@gmail.com',
      name: 'Mock Google User',
      username: 'mockgoogleuser',
      profileComplete: false,
      role: null,
      skills: [],
      pict: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
    };
    
    // Simpan ke localStorage
    saveMockUser(mockCurrentUser);
    
    // Return URL yang akan redirect ke callback dengan token
    return { 
      login_url: `/auth/google/callback?token=${mockToken}` 
    };
  },

  // ============== PROFILE ==============
  'GET /profile/me': async () => {
    await delay(300);
    
    // Reload dari localStorage jika mockCurrentUser null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    if (!mockCurrentUser.profileComplete) {
      throw { response: { status: 404, data: { detail: 'Profile not found' } } };
    }
    
    return {
      user_id: mockCurrentUser.id,
      name: mockCurrentUser.name,
      email: mockCurrentUser.email,
      role: mockCurrentUser.role,
      skill: mockCurrentUser.skills?.join(',') || '',
      pict: mockCurrentUser.pict
    };
  },

  'POST /profile/': async (data) => {
    await delay(400);
    
    // Reload dari localStorage jika mockCurrentUser null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    mockCurrentUser = {
      ...mockCurrentUser,
      name: data.name || mockCurrentUser.name,
      role: data.role || mockCurrentUser.role,
      skills: data.skill ? data.skill.split(',') : mockCurrentUser.skills,
      pict: data.pict || mockCurrentUser.pict,
      profileComplete: true
    };
    
    // Simpan ke localStorage
    saveMockUser(mockCurrentUser);
    
    return { message: 'Profile created successfully' };
  },

  'PUT /profile/': async (data) => {
    await delay(400);
    
    // Reload dari localStorage jika null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    mockCurrentUser = {
      ...mockCurrentUser,
      name: data.name || mockCurrentUser.name,
      role: data.role || mockCurrentUser.role,
      skills: data.skill ? data.skill.split(',') : mockCurrentUser.skills,
      pict: data.pict || mockCurrentUser.pict
    };
    
    // Simpan ke localStorage
    saveMockUser(mockCurrentUser);
    
    return { message: 'Profile updated successfully' };
  },

  'POST /profile/upload-avatar': async () => {
    await delay(800);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    return { url: avatarUrl };
  },

  // ============== MATCHMAKING ==============
  'POST /matchmaking/join': async () => {
    await delay(1000);
    
    // Reload dari localStorage jika null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    // Simulasikan match langsung dengan dummy users
    const teammates = DUMMY_USERS.filter(u => u.role !== mockCurrentUser.role).slice(0, 5);
    
    mockRoom = {
      id: 'room_' + Math.random().toString(36).substring(2, 8),
      leader_id: mockCurrentUser.id,
      members: [
        {
          user_id: mockCurrentUser.id,
          name: mockCurrentUser.name,
          username: mockCurrentUser.username,
          role: mockCurrentUser.role,
          pict: mockCurrentUser.pict
        },
        ...teammates.map(u => ({
          user_id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          pict: u.avatar
        }))
      ],
      status: 'active'
    };
    
    mockMessages = [];
    
    // Simpan room ke localStorage
    saveMockRoom(mockRoom);
    
    // Simulasikan match instan
    return {
      room_id: mockRoom.id,
      leader_id: mockRoom.leader_id,
      members: mockRoom.members
    };
  },

  'GET /matchmaking/status': async () => {
    await delay(300);
    
    if (mockRoom) {
      return { status: 'matched', room_id: mockRoom.id };
    }
    return { status: 'waiting' };
  },

  'POST /matchmaking/leave': async () => {
    await delay(200);
    
    // Save to history jika ada room
    if (mockRoom) {
      addToHistory(mockRoom);
      mockRoom = null;
      saveMockRoom(null);
    }
    
    return { message: 'Left queue' };
  },

  'POST /matchmaking/end-room': async () => {
    await delay(300);
    
    // Reload user jika null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    if (!mockRoom) {
      throw { response: { status: 404, data: { detail: 'No active room' } } };
    }
    
    // Cek apakah user adalah leader
    if (mockRoom.leader_id !== mockCurrentUser.id) {
      throw { response: { status: 403, data: { detail: 'Only room leader can end session' } } };
    }
    
    // End room
    addToHistory(mockRoom);
    mockRoom = null;
    mockMessages = [];
    saveMockRoom(null);
    
    return { message: 'Room session ended successfully' };
  },

  // ============== ROOMS ==============
  'GET /rooms/': async () => {
    await delay(300);
    return mockRoom ? [mockRoom] : [];
  },

  'GET /rooms/my': async () => {
    await delay(300);
    
    if (!mockRoom) {
      throw { response: { status: 404, data: { detail: 'No active room' } } };
    }
    
    return mockRoom;
  },

  'GET /rooms/:id': async (data, params) => {
    await delay(300);
    
    if (mockRoom && mockRoom.id === params.id) {
      return mockRoom;
    }
    
    throw { response: { status: 404, data: { detail: 'Room not found' } } };
  },

  'POST /rooms/:id/leave': async () => {
    await delay(300);
    
    // Save to history before leaving
    if (mockRoom) {
      addToHistory(mockRoom);
    }
    
    mockRoom = null;
    mockMessages = [];
    saveMockRoom(null);
    return { message: 'Left room' };
  },

  'DELETE /rooms/:id/members/me': async () => {
    await delay(300);
    
    // Save to history before leaving
    if (mockRoom) {
      addToHistory(mockRoom);
    }
    
    mockRoom = null;
    mockMessages = [];
    saveMockRoom(null);
    return { message: 'Left room' };
  },

  'GET /rooms/history': async () => {
    await delay(300);
    
    // Reload user jika null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      return [];
    }
    
    return loadMockHistory();
  }
};

/**
 * Parse route pattern dan match dengan URL
 */
const matchRoute = (method, url) => {
  const fullKey = `${method} ${url}`;
  
  // Cek exact match dulu
  if (mockHandlers[fullKey]) {
    return { handler: mockHandlers[fullKey], params: {} };
  }
  
  // Cek pattern match (untuk route dengan parameter seperti /rooms/:id)
  for (const key of Object.keys(mockHandlers)) {
    const [handlerMethod, handlerPath] = key.split(' ');
    if (handlerMethod !== method) continue;
    
    const pathParts = handlerPath.split('/');
    const urlParts = url.split('?')[0].split('/');
    
    if (pathParts.length !== urlParts.length) continue;
    
    const params = {};
    let isMatch = true;
    
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i].startsWith(':')) {
        params[pathParts[i].substring(1)] = urlParts[i];
      } else if (pathParts[i] !== urlParts[i]) {
        isMatch = false;
        break;
      }
    }
    
    if (isMatch) {
      return { handler: mockHandlers[key], params };
    }
  }
  
  return null;
};

/**
 * Mock API instance yang meniru axios
 */
export const createMockApi = () => {
  const mockRequest = async (method, url, data = null) => {
    console.log(`[MOCK API] ${method} ${url}`, data);
    
    const match = matchRoute(method, url);
    
    if (!match) {
      console.warn(`[MOCK API] No handler for ${method} ${url}`);
      throw { response: { status: 404, data: { detail: 'Endpoint not found' } } };
    }
    
    try {
      const result = await match.handler(data, match.params);
      console.log(`[MOCK API] Response:`, result);
      return { data: result };
    } catch (error) {
      console.error(`[MOCK API] Error:`, error);
      throw error;
    }
  };

  return {
    get: (url, config) => mockRequest('GET', url),
    post: (url, data, config) => mockRequest('POST', url, data),
    put: (url, data, config) => mockRequest('PUT', url, data),
    delete: (url, config) => mockRequest('DELETE', url),
    
    interceptors: {
      request: { use: () => {} },
      response: { use: () => {} }
    }
  };
};

/**
 * Mock WebSocket untuk simulasi real-time chat
 */
export class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Simulasikan koneksi sukses
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen({ type: 'open' });
      
      // Kirim users_list setelah connect
      if (mockRoom) {
        setTimeout(() => {
          this.simulateMessage({
            type: 'users_list',
            data: mockRoom.members.map(m => ({
              user_id: m.user_id,
              username: m.username,
              name: m.name,
              role: m.role,
              pict: m.pict
            }))
          });
        }, 500);
      }
    }, 300);
    
    // Simulasikan bot response secara berkala
    this.botInterval = setInterval(() => {
      if (this.readyState === WebSocket.OPEN && mockRoom && Math.random() > 0.7) {
        const randomBot = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
        this.simulateMessage({
          type: 'chat',
          data: {
            user_id: randomBot.id,
            username: randomBot.username,
            name: randomBot.name,
            text: getRandomBotResponse()
          }
        });
      }
    }, 5000);
  }
  
  simulateMessage(payload) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(payload) });
    }
  }
  
  send(data) {
    const parsed = JSON.parse(data);
    console.log('[MOCK WS] Sent:', parsed);
    
    // Echo back chat messages
    if (parsed.type === 'chat' && mockCurrentUser) {
      setTimeout(() => {
        this.simulateMessage({
          type: 'chat',
          data: {
            user_id: mockCurrentUser.id,
            username: mockCurrentUser.username,
            name: mockCurrentUser.name,
            text: parsed.text
          }
        });
      }, 100);
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    clearInterval(this.botInterval);
    if (this.onclose) this.onclose({ type: 'close' });
  }
}

// Reset mock state (useful untuk testing)
export const resetMockState = () => {
  mockCurrentUser = null;
  mockToken = null;
  mockRoom = null;
  mockMessages = [];
  mockMatchmakingQueue = [];
};

// Set mock user langsung (untuk bypass login)
export const setMockUser = (user) => {
  mockCurrentUser = user;
  mockToken = generateMockToken();
};

// Get current mock user
export const getMockUser = () => mockCurrentUser;

// Check if mock mode is enabled
export const isMockMode = () => {
  return process.env.REACT_APP_MOCK_MODE === 'true';
};

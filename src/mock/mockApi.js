/**
 * Mock API Service
 * Mensimulasikan response backend untuk preview UI tanpa backend
 */

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
const MOCK_QUEUE_KEY = 'mockMatchmakingQueue';

const saveMockHistory = (history) => {
  localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history));
};

const loadMockHistory = () => {
  const saved = localStorage.getItem(MOCK_HISTORY_KEY);
  return saved ? JSON.parse(saved) : [];
};

// Queue management untuk real user matchmaking
const saveMockQueue = (queue) => {
  localStorage.setItem(MOCK_QUEUE_KEY, JSON.stringify(queue));
};

const loadMockQueue = () => {
  const saved = localStorage.getItem(MOCK_QUEUE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const addToQueue = (user) => {
  const queue = loadMockQueue();
  // Cek apakah user sudah ada di queue
  const exists = queue.find(u => u.id === user.id);
  if (!exists) {
    queue.push({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      pict: user.pict,
      joinedAt: Date.now()
    });
    saveMockQueue(queue);
  }
  return queue;
};

const removeFromQueue = (userId) => {
  const queue = loadMockQueue();
  const filtered = queue.filter(u => u.id !== userId);
  saveMockQueue(filtered);
  return filtered;
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
    await delay(500);
    
    // Reload dari localStorage jika null
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    if (!mockCurrentUser) {
      throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    }
    
    // Tambahkan user ke queue
    const queue = addToQueue(mockCurrentUser);
    
    // Cek apakah ada cukup user untuk match (minimal 2 user)
    const MIN_USERS_FOR_MATCH = 2;
    
    if (queue.length >= MIN_USERS_FOR_MATCH) {
      // Ambil user untuk room (maksimal 4 user)
      const matchedUsers = queue.slice(0, Math.min(4, queue.length));
      
      // Buat room dengan user yang match
      mockRoom = {
        id: 'room_' + Math.random().toString(36).substring(2, 8),
        leader_id: matchedUsers[0].id, // User pertama jadi leader
        members: matchedUsers.map(u => ({
          user_id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          pict: u.pict
        })),
        status: 'active'
      };
      
      mockMessages = [];
      
      // Simpan room ke localStorage
      saveMockRoom(mockRoom);
      
      // Hapus matched users dari queue
      matchedUsers.forEach(u => removeFromQueue(u.id));
      
      // Return match result
      return {
        room_id: mockRoom.id,
        leader_id: mockRoom.leader_id,
        members: mockRoom.members
      };
    }
    
    // Belum cukup user, return waiting status
    return {
      status: 'waiting',
      queue_position: queue.findIndex(u => u.id === mockCurrentUser.id) + 1,
      queue_size: queue.length,
      message: `Menunggu user lain bergabung... (${queue.length}/${MIN_USERS_FOR_MATCH} user dalam antrian)`
    };
  },

  'GET /matchmaking/status': async () => {
    await delay(300);
    
    // Reload user dari localStorage
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    // Reload room dari localStorage
    if (!mockRoom) {
      mockRoom = loadMockRoom();
    }
    
    // Cek apakah ada room aktif
    if (mockRoom) {
      // Cek apakah user ini adalah member dari room
      const isMember = mockRoom.members.some(m => m.user_id === mockCurrentUser?.id);
      if (isMember) {
        return { 
          status: 'matched', 
          room_id: mockRoom.id,
          id: mockRoom.id,
          leader_id: mockRoom.leader_id,
          members: mockRoom.members
        };
      }
    }
    
    // Cek queue untuk potensi match
    const queue = loadMockQueue();
    const MIN_USERS_FOR_MATCH = 2;
    
    if (queue.length >= MIN_USERS_FOR_MATCH) {
      // Ada cukup user, buat room
      const matchedUsers = queue.slice(0, Math.min(4, queue.length));
      
      mockRoom = {
        id: 'room_' + Math.random().toString(36).substring(2, 8),
        leader_id: matchedUsers[0].id,
        members: matchedUsers.map(u => ({
          user_id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          pict: u.pict
        })),
        status: 'active'
      };
      
      saveMockRoom(mockRoom);
      matchedUsers.forEach(u => removeFromQueue(u.id));
      
      return { 
        status: 'matched', 
        room_id: mockRoom.id,
        id: mockRoom.id,
        leader_id: mockRoom.leader_id,
        members: mockRoom.members
      };
    }
    
    return { 
      status: 'waiting',
      queue_size: queue.length
    };
  },

  'POST /matchmaking/leave': async () => {
    await delay(200);
    
    // Reload user
    if (!mockCurrentUser) {
      mockCurrentUser = loadMockUser();
    }
    
    // Hapus dari queue
    if (mockCurrentUser) {
      removeFromQueue(mockCurrentUser.id);
    }
    
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
    // Reload room dari localStorage jika null
    if (!mockRoom) {
      mockRoom = loadMockRoom();
    }
    return mockRoom ? [mockRoom] : [];
  },

  'GET /rooms/my': async () => {
    await delay(300);
    
    // Reload room dari localStorage jika null
    if (!mockRoom) {
      mockRoom = loadMockRoom();
    }
    
    if (!mockRoom) {
      throw { response: { status: 404, data: { detail: 'No active room' } } };
    }
    
    return mockRoom;
  },

  'GET /rooms/:id': async (data, params) => {
    await delay(300);
    
    // Reload room dari localStorage jika null
    if (!mockRoom) {
      mockRoom = loadMockRoom();
    }
    
    if (mockRoom && String(mockRoom.id) === String(params.id)) {
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
  // WebSocket readyState constants
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Reload room dari localStorage
    const savedRoom = loadMockRoom();
    if (savedRoom) {
      mockRoom = savedRoom;
    }
    
    // Simulasikan koneksi sukses
    setTimeout(() => {
      this.readyState = 1; // OPEN
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
    
    // Tidak ada bot auto-response - hanya real users
  }
  
  simulateMessage(payload) {
    console.log('[MOCK WS] simulateMessage called with:', payload);
    if (this.onmessage) {
      console.log('[MOCK WS] Calling onmessage handler');
      this.onmessage({ data: JSON.stringify(payload) });
    } else {
      console.log('[MOCK WS] No onmessage handler set');
    }
  }
  
  send(data) {
    if (this.readyState !== 1) {
      console.log('[MOCK WS] Cannot send, not connected. readyState:', this.readyState);
      return;
    }
    
    const parsed = JSON.parse(data);
    console.log('[MOCK WS] Sent:', parsed);
    
    // Reload user dari localStorage untuk memastikan data terbaru
    const currentUser = loadMockUser();
    console.log('[MOCK WS] Current user from localStorage:', currentUser);
    
    // Echo back chat messages - use arrow function to preserve 'this'
    if (parsed.type === 'chat' && currentUser) {
      const self = this;
      setTimeout(() => {
        console.log('[MOCK WS] Echoing back message');
        self.simulateMessage({
          type: 'chat',
          data: {
            user_id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            text: parsed.text
          }
        });
      }, 100);
    } else if (parsed.type === 'chat' && !currentUser) {
      console.log('[MOCK WS] No user found in localStorage');
    }
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ type: 'close' });
  }
}

// Reset mock state (useful untuk testing)
export const resetMockState = () => {
  mockCurrentUser = null;
  mockToken = null;
  mockRoom = null;
  mockMessages = [];
  saveMockQueue([]);
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

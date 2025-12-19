import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api, { SOCKET_URL } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';

const RoomContext = createContext(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeRoom, setActiveRoom] = useState(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState('idle'); 
  const [messages, setMessages] = useState([]);
  const [roomHistory, setRoomHistory] = useState([]); // Default empty array
  
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const isSearchingRef = useRef(false); // Ref untuk track status searching

  const cleanupConnection = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startMatchmaking = async () => {
    if (!user) {
      console.log("No user, cannot start matchmaking");
      return;
    }
    
    isSearchingRef.current = true;
    setMatchmakingStatus('searching');
    setMessages([]);

    try {
      // 1. Join Queue
      console.log("Joining matchmaking queue...");
      const response = await api.post('/matchmaking/join');
      const data = response.data;
      
      console.log("Matchmaking response:", data);

      // Cek berbagai kemungkinan response dari backend
      if (data.room_id || data.roomId) {
        // Match instan (sudah cukup user di queue)
        const roomId = data.room_id || data.roomId;
        console.log("Match Found immediately:", roomId);
        handleMatchFound(roomId, data);
      } else if (data.status === 'matched' && data.room) {
        // Format alternatif
        console.log("Match Found (alt format):", data.room);
        handleMatchFound(data.room.id || data.room, data.room);
      } else if (data.status === 'waiting' || data.message) {
        // Masuk antrian, mulai polling
        console.log("Joined Queue, waiting...", data.message || data.status);
        toast({ title: 'Masuk Antrian', description: data.message || 'Mencari tim...' });
        startPollingRoom();
      } else {
        // Default: masuk antrian
        console.log("Joined Queue (default behavior)");
        toast({ title: 'Masuk Antrian', description: 'Mencari tim...' });
        startPollingRoom();
      }

    } catch (error) {
      console.error("Matchmaking error:", error);
      console.error("Error response:", error.response?.data);
      isSearchingRef.current = false;
      setMatchmakingStatus('idle');
      toast({ 
        title: 'Gagal', 
        description: error.response?.data?.detail || error.response?.data?.message || 'Gagal join matchmaking.',
        variant: 'destructive'
      });
    }
  };

  // LOGIKA POLLING CERDAS (SMART POLLING)
  const startPollingRoom = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    console.log("Starting polling for room match...");

    pollingRef.current = setInterval(async () => {
      // Jika sudah tidak dalam status searching, stop polling
      if (!isSearchingRef.current) {
        console.log("Not in searching state (ref), stopping poll");
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        return;
      }

      try {
        // STRATEGI 1: Cek status matchmaking queue
        // Ini endpoint yang memberitahu apakah sudah match atau masih waiting
        try {
            const queueStatus = await api.get('/matchmaking/status');
            console.log("Queue status response:", queueStatus.data);
            if (queueStatus.data) {
                const status = queueStatus.data;
                // Jika sudah match dan ada room_id
                if (status.status === 'matched' && status.room_id) {
                    console.log("Match Found via /matchmaking/status!");
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    handleMatchFound(status.room_id, status);
                    return;
                }
            }
        } catch (e) {
            // Ignore jika endpoint tidak tersedia (404)
            if (e?.response?.status !== 404) {
                console.log("Status check error:", e?.response?.status);
            }
        }

        // STRATEGI 2: Cek endpoint /rooms/my (Untuk semua member yang sudah di-assign ke room)
        try {
            const myRoomRes = await api.get('/rooms/my');
            console.log("/rooms/my response:", myRoomRes.data);
            if (myRoomRes.data && myRoomRes.data.id) {
                console.log("Match Found via /rooms/my!");
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                handleMatchFound(myRoomRes.data.id, myRoomRes.data);
                return;
            }
        } catch (e) {
            // Ignore error 404 from /rooms/my (belum ada room)
            if (e?.response?.status !== 404) {
                console.log("/rooms/my check error:", e?.response?.status);
            }
        }

        // STRATEGI 3: Fallback cek SEMUA room (Untuk Member biasa)
        // Kita ambil semua room dan cari manual apakah user ada di dalamnya
        try {
            const allRoomsRes = await api.get('/rooms/'); // Backend endpoint: GET /rooms/
            const allRooms = allRoomsRes.data;
            console.log("/rooms/ response:", allRooms?.length, "rooms");
            
            if (Array.isArray(allRooms) && allRooms.length > 0) {
                // Cari room dimana user terdaftar sebagai member
                const myRoom = allRooms.find(r => {
                    // Cek leader_id
                    if (r.leader_id === user.id) return true;
                    
                    // Cek jika r.members ada dan user.id ada di dalamnya
                    if (r.members && Array.isArray(r.members)) {
                        return r.members.some(m => 
                            m.user_id === user.id || 
                            m.id === user.id ||
                            m.user?.id === user.id
                        );
                    }
                    
                    // Cek jika r.room_members ada (struktur alternatif)
                    if (r.room_members && Array.isArray(r.room_members)) {
                        return r.room_members.some(m => 
                            m.user_id === user.id || 
                            m.id === user.id
                        );
                    }
                    
                    return false;
                });

                if (myRoom) {
                    console.log("Match Found via /rooms/ list scan!", myRoom);
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    handleMatchFound(myRoom.id, myRoom);
                    return;
                }
            }
        } catch (e) {
            if (e?.response?.status !== 404) {
                console.log("/rooms/ list check error:", e?.response?.status);
            }
        }
        
        console.log("Still waiting for match...");

      } catch (error) {
        console.log("Polling error:", error);
        if (error.response && error.response.status === 401) {
            isSearchingRef.current = false;
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setMatchmakingStatus('idle');
        }
      }
    }, 2000); // Cek setiap 2 detik (lebih responsif)
  };

  const handleMatchFound = (roomId, roomData) => {
    isSearchingRef.current = false; // Stop polling
    setMatchmakingStatus('matched');
    
    // Mapping data member dari backend ke format frontend
    // Coba berbagai format yang mungkin dari backend
    let initialMembers = [];
    
    // Cek berbagai kemungkinan struktur data members
    const membersData = roomData?.members || roomData?.room_members || [];
    
    if (Array.isArray(membersData) && membersData.length > 0) {
        initialMembers = membersData.map(m => {
            // Handle nested user object
            const userData = m.user || m;
            return {
                id: userData.user_id || userData.id || m.user_id || m.id,
                name: userData.name || userData.username || m.username || 'User',
                username: userData.username || userData.name || m.username || 'user',
                role: userData.role || m.role || 'Member',
                avatar: userData.pict || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username || userData.id || m.id}`
            };
        });
    }

    const newActiveRoom = {
        id: roomId.toString(),
        leaderId: roomData?.leader_id || roomData?.leaderId,
        members: initialMembers,
        status: 'active'
    };
    
    console.log("Setting active room:", newActiveRoom);
    setActiveRoom(newActiveRoom);

    connectWebSocket(roomId);
  };

  const connectWebSocket = (roomId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = `${SOCKET_URL}/ws/rooms/${roomId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WS Connected");
      toast({ title: 'Tim Terbentuk!', description: 'Anda telah masuk ke ruang kolaborasi.' });
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleSocketMessage(payload);
      } catch (e) { console.error(e); }
    };

    ws.onclose = () => console.log("WS Disconnected");
    socketRef.current = ws;
  };

  const handleSocketMessage = (payload) => {
    const { type, data } = payload;

    switch (type) {
        case 'users_list':
            // Update list member dari data real-time WebSocket
            setActiveRoom(prev => ({
                ...prev,
                members: data.map(u => ({
                    id: u.user_id,
                    name: u.username,
                    username: u.username,
                    role: 'Member', // Backend belum kirim role via WS
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                }))
            }));
            break;

        case 'chat':
            setMessages(prev => [...prev, {
                id: Date.now(),
                userId: data.user_id,
                username: data.username,
                text: data.text,
                timestamp: new Date(),
                type: 'user'
            }]);
            break;
        default: break;
    }
  };

  const sendMessage = (text) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'chat', text }));
    }
  };

  const cancelMatchmaking = async () => {
    isSearchingRef.current = false;
    cleanupConnection();
    setMatchmakingStatus('idle');
    
    // Coba beritahu backend untuk keluar dari queue
    try {
      await api.post('/matchmaking/leave');
      console.log("Left matchmaking queue");
    } catch (e) {
      // Ignore jika endpoint tidak ada
      console.log("Leave queue endpoint not available or error:", e?.response?.status);
    }
  };

  const leaveRoom = async () => {
    isSearchingRef.current = false;
    cleanupConnection();
    
    // Coba beritahu backend bahwa user keluar dari room
    if (activeRoom?.id) {
      try {
        await api.post(`/rooms/${activeRoom.id}/leave`);
        console.log("Left room:", activeRoom.id);
      } catch (e) {
        console.log("Leave room endpoint error:", e?.response?.status);
      }
    }
    
    setActiveRoom(null);
    setMatchmakingStatus('idle');
    setMessages([]);
  };

  const endSession = () => leaveRoom();

  useEffect(() => { return () => cleanupConnection(); }, []);

  return (
    <RoomContext.Provider value={{
      activeRoom,
      matchmakingStatus,
      messages,
      roomHistory,
      startMatchmaking,
      cancelMatchmaking,
      sendMessage,
      endSession,
      leaveRoom
    }}>
      {children}
    </RoomContext.Provider>
  );
};
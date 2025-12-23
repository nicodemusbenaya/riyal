import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api, { SOCKET_URL, getRoomHistory, MockWebSocket, MOCK_MODE } from "@/services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

const RoomContext = createContext(null);

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
};

export const RoomProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeRoom, setActiveRoom] = useState(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [roomHistory, setRoomHistory] = useState([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isNewMatch, setIsNewMatch] = useState(false);

  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const hasLeftRoomRef = useRef(false);

  /* ===========================
     LOCAL STORAGE SYNC
  ============================ */
  useEffect(() => {
    if (activeRoom) {
      localStorage.setItem("activeRoom", JSON.stringify(activeRoom));
    } else {
      localStorage.removeItem("activeRoom");
    }
  }, [activeRoom]);

  /* ===========================
     RESTORE ROOM
  ============================ */
  const restoreRoom = async () => {
    if (!user || hasLeftRoomRef.current) return;

    const saved = localStorage.getItem("activeRoom");
    if (!saved) return;

    try {
      setIsReconnecting(true);
      setIsNewMatch(false);
      const parsed = JSON.parse(saved);

      const res = await api.get(`/rooms/${parsed.id}`);
      if (res.data) {
        handleMatchFound(parsed.id, res.data, true);
        toast({
          title: "Terhubung kembali",
          description: "Kembali ke room sebelumnya",
        });
      }
    } catch {
      localStorage.removeItem("activeRoom");
    } finally {
      setIsReconnecting(false);
    }
  };

  /* ===========================
     FETCH ROOM HISTORY
  ============================ */
  const fetchRoomHistory = async () => {
    if (!user) return;
    try {
      const data = await getRoomHistory();
      setRoomHistory(data);
    } catch (err) {
      console.error("Fetch room history failed", err);
      setRoomHistory([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    restoreRoom();
    fetchRoomHistory();
  }, [user]);

  /* ===========================
     MATCHMAKING
  ============================ */
  const startMatchmaking = async () => {
    setMatchmakingStatus("searching");
    setMessages([]);

    try {
      const res = await api.post("/matchmaking/join");

      if (res.data?.room_id) {
        // Match langsung ditemukan
        handleMatchFound(res.data.room_id, res.data);
      } else if (res.data?.status === "waiting") {
        // Masih menunggu user lain
        startPolling();
        toast({
          title: "Menunggu user lain",
          description: res.data.message || "Menunggu user lain bergabung ke antrian...",
        });
      } else {
        startPolling();
        toast({
          title: "Mencari tim",
          description: "Sedang mencarikan tim...",
        });
      }
    } catch (err) {
      setMatchmakingStatus("idle");
      toast({
        title: "Gagal",
        description: err.response?.data?.detail || "Matchmaking gagal",
        variant: "destructive",
      });
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get("/matchmaking/status");
        if (res.data?.status === "matched" && res.data?.room_id) {
          clearInterval(pollingRef.current);
          handleMatchFound(res.data.room_id, res.data);
        }
      } catch {}
    }, 2000);
  };

  /* ===========================
     MATCH FOUND
  ============================ */
  const handleMatchFound = async (roomId, roomData, isReconnect = false) => {
    console.log('[RoomContext] handleMatchFound called with:', { roomId, roomData, isReconnect });
    
    setMatchmakingStatus("matched");
    setIsReconnecting(false);
    setIsNewMatch(!isReconnect);

    let detail = roomData;
    if (!roomData.members) {
      console.log('[RoomContext] No members in roomData, fetching from API...');
      const res = await api.get(`/rooms/${roomId}`);
      detail = res.data;
      console.log('[RoomContext] Fetched room detail:', detail);
    }

    const activeRoomData = {
      id: detail.id || roomId,
      leaderId: detail.leader_id,
      status: detail.status,
      members: (detail.members || []).map((m) => ({
        id: m.user_id || m.id,
        name: m.name || m.username || m.user_name,
        username: m.username || m.user_name || m.name,
        role: m.role,
        avatar:
          m.pict || m.avatar || m.picture ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username || m.user_id || m.id}`,
      })),
    };
    
    console.log('[RoomContext] Setting activeRoom:', activeRoomData);
    setActiveRoom(activeRoomData);

    connectWebSocket(roomId || detail.id, isReconnect);
  };

  /* ===========================
     WEBSOCKET
  ============================ */
  const connectWebSocket = (roomId, isReconnect) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Gunakan MockWebSocket jika mock mode aktif
    const wsUrl = `${SOCKET_URL}/ws/rooms/${roomId}?token=${token}`;
    const ws = MOCK_MODE ? new MockWebSocket(wsUrl) : new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[RoomContext] WebSocket connected, readyState:', ws.readyState);
      if (!isReconnect) {
        toast({
          title: "Tim terbentuk",
          description: "Anda masuk ke workspace",
        });
      }
    };

    ws.onmessage = (e) => {
      console.log('[RoomContext] WebSocket message received:', e.data);
      const payload = JSON.parse(e.data);
      
      if (payload.type === "chat") {
        console.log('[RoomContext] Adding chat message:', payload.data);
        
        // Update member username jika belum ada
        const chatUserId = payload.data.user_id;
        const chatUsername = payload.data.username;
        if (chatUserId && chatUsername) {
          setActiveRoom((prevRoom) => {
            if (!prevRoom) return prevRoom;
            const updatedMembers = prevRoom.members.map((m) => {
              if (String(m.id) === String(chatUserId) && (!m.username || m.username.startsWith('User '))) {
                return { ...m, username: chatUsername, name: chatUsername };
              }
              return m;
            });
            return { ...prevRoom, members: updatedMembers };
          });
        }
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            userId: payload.data.user_id,
            username: payload.data.username,
            text: payload.data.text,
          },
        ]);
      } else if (payload.type === "users_list" && payload.data) {
        // Update member list dengan data dari WebSocket
        setActiveRoom((prevRoom) => {
          if (!prevRoom) return prevRoom;
          const updatedMembers = prevRoom.members.map((m) => {
            const wsUser = payload.data.find((u) => String(u.user_id) === String(m.id));
            if (wsUser) {
              return {
                ...m,
                username: wsUser.username || m.username,
                name: wsUser.name || wsUser.username || m.name,
                role: wsUser.role || m.role,
                avatar: wsUser.pict || m.avatar,
              };
            }
            return m;
          });
          return { ...prevRoom, members: updatedMembers };
        });
      }
    };

    ws.onclose = () => {};
    socketRef.current = ws;
  };

  const sendMessage = (text) => {
    console.log('[RoomContext] sendMessage called with:', text);
    console.log('[RoomContext] socketRef.current:', socketRef.current);
    console.log('[RoomContext] readyState:', socketRef.current?.readyState);
    
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === 1)) {
      console.log('[RoomContext] Sending message...');
      socketRef.current.send(JSON.stringify({ type: "chat", text }));
    } else {
      console.log('[RoomContext] WebSocket not ready, cannot send');
    }
  };

  /* ===========================
     LEAVE & END
  ============================ */
  const leaveRoom = async () => {
    hasLeftRoomRef.current = true;

    try {
      await api.post("/matchmaking/leave");
      fetchRoomHistory();
    } catch {}

    socketRef.current?.close();
    setActiveRoom(null);
    setMessages([]);
    setMatchmakingStatus("idle");
    setIsNewMatch(false);
    localStorage.removeItem("activeRoom");

    setTimeout(() => (hasLeftRoomRef.current = false), 500);
  };

  const endSession = async () => {
    hasLeftRoomRef.current = true;

    try {
      await api.post("/matchmaking/end-room");
      fetchRoomHistory();
    } catch (err) {
      toast({
        title: "Gagal",
        description: "Tidak bisa mengakhiri sesi",
        variant: "destructive",
      });
    }

    socketRef.current?.close();
    setActiveRoom(null);
    setMessages([]);
    setMatchmakingStatus("idle");
    setIsNewMatch(false);
    localStorage.removeItem("activeRoom");

    setTimeout(() => (hasLeftRoomRef.current = false), 500);
  };

  const clearAutoNavigate = () => {
    setIsNewMatch(false);
  };

  /* ===========================
     PROVIDER
  ============================ */
  return (
    <RoomContext.Provider
      value={{
        activeRoom,
        matchmakingStatus,
        messages,
        roomHistory,
        isReconnecting,
        isNewMatch,
        startMatchmaking,
        sendMessage,
        leaveRoom,
        endSession,
        fetchRoomHistory,
        clearAutoNavigate,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

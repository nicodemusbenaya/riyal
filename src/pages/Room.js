import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Crown, Send, LogOut, Users, Copy, Loader2, Home } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Room = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeRoom,
    messages,
    sendMessage,
    endSession,
    leaveRoom,
    isReconnecting,
    clearAutoNavigate
  } = useRoom();

  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  // 🔐 cegah redirect saat initial render
  const isInitialLoadRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 🔁 REDIRECT LOGIC (AMAN SAAT REFRESH)
   */
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (isReconnecting) return;

    const hasSavedRoom = localStorage.getItem('activeRoom');
    if (!activeRoom && !hasSavedRoom) {
      navigate('/dashboard');
    }
  }, [activeRoom, isReconnecting, navigate]);

  /**
   * ⏳ LOADING STATE
   */
  if (isReconnecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mb-2">
          Menghubungkan...
        </h2>
        <p className="text-slate-400 text-sm">
          Menghubungkan kembali ke room
        </p>
      </div>
    );
  }

  if (!activeRoom && localStorage.getItem('activeRoom')) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mb-2">
          Memuat Room
        </h2>
        <p className="text-slate-400 text-sm">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  if (!activeRoom) return null;

  const isLeader = activeRoom.leaderId === user?.id;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  const handleEndSession = async () => {
    await endSession();
    toast({
      title: 'Sesi selesai',
      description: 'Room telah ditutup oleh leader.'
    });
    navigate('/dashboard');
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    toast({
      title: 'Keluar dari room',
      description: 'Anda telah meninggalkan tim.'
    });
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    clearAutoNavigate(); // Prevent auto-redirect back to room
    toast({
      title: 'Kembali ke Dashboard',
      description: 'Anda tetap terhubung di room ini.'
    });
    navigate('/dashboard');
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(activeRoom.id);
    toast({
      title: 'Disalin',
      description: 'ID Room disalin ke clipboard.'
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">GroupMatch</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-slate-500">Room:</span>
              <code className="text-sm font-mono font-medium text-slate-700">
                {activeRoom.id ? String(activeRoom.id).slice(-8) : '...'}
              </code>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyRoomId}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0 shadow-sm">
              <Users className="h-3 w-3 mr-1" />
              {activeRoom.members?.length || 0} Anggota
            </Badge>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Team Workspace
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="text-slate-600 hover:text-slate-800">
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            {isLeader && (
              <Button variant="destructive" size="sm" onClick={handleEndSession} className="shadow-sm">
                <Crown className="mr-2 h-4 w-4" /> End Session
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLeaveRoom} className="border-slate-200">
              <LogOut className="mr-2 h-4 w-4" /> Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* Sidebar - Members */}
        <div className="w-72 hidden md:flex bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-teal-50">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-600" /> Anggota Tim ({activeRoom.members?.length || 0})
            </h3>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {(!activeRoom.members || activeRoom.members.length === 0) && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400">Memuat anggota...</p>
              </div>
            )}
            {(activeRoom.members || []).map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-3 p-3 rounded-xl transition-all ${
                  m.id === user?.id 
                    ? 'bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage src={m.avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-sm">
                    {m.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate flex items-center gap-1">
                    {m.id === user?.id ? (
                      <span className="text-cyan-600">(Kamu)</span>
                    ) : (
                      m.name || m.username || `User ${String(m.id).slice(-4)}`
                    )}
                    {m.id === activeRoom.leaderId && (
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {m.role || 'Member'}{m.username && ` • @${m.username}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-600" /> Chat Room
            </h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">Belum ada pesan</p>
                  <p className="text-slate-300 text-xs mt-1">Mulai percakapan dengan timmu!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.userId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm flex-shrink-0">
                      <AvatarFallback className={`text-xs ${isMe ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white' : 'bg-slate-200'}`}>
                        {msg.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                      <p className="text-xs text-slate-400 mb-1 px-1">
                        {isMe ? 'Kamu' : msg.username}
                      </p>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMe 
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-br-md' 
                          : 'bg-slate-100 text-slate-700 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/80 flex gap-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 h-11 bg-white border-slate-200 focus:border-cyan-300 rounded-xl"
            />
            <Button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="h-11 px-5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 rounded-xl shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room;

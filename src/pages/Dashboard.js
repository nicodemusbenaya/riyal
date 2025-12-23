import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Tag,
  Users,
  LogOut,
  Loader2,
  Zap,
  Settings,
  UserCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    startMatchmaking,
    leaveRoom,
    matchmakingStatus,
    roomHistory = [],
    activeRoom,
    isNewMatch,
  } = useRoom();
  const { toast } = useToast();

  /* ===============================
     AUTO NAVIGATE KE ROOM
  =============================== */
  useEffect(() => {
    if (activeRoom && matchmakingStatus === 'matched' && isNewMatch) {
      const t = setTimeout(() => navigate('/room'), 1200);
      return () => clearTimeout(t);
    }
  }, [activeRoom, matchmakingStatus, isNewMatch, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">GroupMatch</h1>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex gap-3 hover:bg-slate-100/80">
                <Avatar className="ring-2 ring-cyan-100">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500">@{user?.username}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile-setup')} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" /> Edit Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: 'Coming soon' })} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Pengaturan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROFILE */}
        <Card className="lg:sticky lg:top-24 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          {/* Profile Header Background */}
          <div className="h-20 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
          <CardContent className="pt-0 text-center relative">
            <Avatar className="mx-auto h-24 w-24 -mt-12 ring-4 ring-white shadow-lg">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold mt-4 text-slate-800">{user?.name}</h3>
            <p className="text-sm text-slate-500">@{user?.username}</p>
            
            <Badge className="mt-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
              {user?.role || 'Member'}
            </Badge>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs uppercase text-slate-400 mb-3 flex items-center justify-center gap-1 font-medium">
                <Tag className="h-3 w-3" /> Skills
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {user?.skills?.length ? (
                  user.skills.map((s, i) => (
                    <Badge key={i} variant="outline" className="bg-slate-50 border-slate-200">{s}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada skill ditambahkan</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MATCHMAKING & HISTORY */}
        <div className="lg:col-span-2 space-y-6">
          {/* MATCHMAKING CARD */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-cyan-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">
                {activeRoom ? '🎉 Tim Aktif!' : 'Siap Cari Tim?'}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {activeRoom
                  ? 'Kamu sudah punya tim aktif. Kembali ke room untuk melanjutkan.'
                  : 'Temukan rekan tim terbaik dengan satu klik'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              {activeRoom ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/room')}
                  className="h-14 px-8 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Kembali ke Room <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : matchmakingStatus === 'searching' ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-100 flex items-center justify-center mx-auto">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
                  </div>
                  <p className="text-slate-600 font-medium">Mencari tim untukmu...</p>
                  <Button variant="outline" onClick={leaveRoom} className="mt-2">
                    Batalkan Pencarian
                  </Button>
                </div>
              ) : matchmakingStatus === 'matched' ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Tim ditemukan!</p>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={startMatchmaking}
                  className="h-14 px-8 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Zap className="mr-2 h-5 w-5" /> Cari Tim Sekarang
                </Button>
              )}
            </CardContent>
          </Card>

          {/* HISTORY */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex gap-2 items-center text-slate-800">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
                Riwayat Tim
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Belum ada riwayat tim
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Riwayat akan muncul setelah kamu bergabung dengan tim
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomHistory.map((r, index) => (
                    <div 
                      key={r.id} 
                      className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">Room #{r.room_id ? String(r.room_id).slice(-6) : index + 1}</p>
                            <p className="text-xs text-slate-500">{r.action}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">Selesai</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

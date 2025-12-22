import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Loader2, UserPlus, Users } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan konfirmasi password sama dengan password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password
    });

    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Silakan login.",
      });
      navigate('/login');
    } else {
      toast({
        title: "Pendaftaran Gagal",
        description: result.error || "Terjadi kesalahan saat mendaftar.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // PERBAIKAN DI SINI JUGA:
  const handleGoogleLogin = async () => {
    try {
      // Langsung panggil tanpa menunggu return value
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: "Gagal memuat login Google.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
            GroupMatch
          </h1>
          <CardTitle className="text-xl font-semibold text-slate-800 pt-2">Buat Akun Baru</CardTitle>
          <CardDescription className="text-slate-500">
            Daftar gratis dan mulai temukan timmu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="johndoe" 
                  value={formData.username}
                  onChange={handleChange}
                  required 
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={formData.email}
                onChange={handleChange}
                required 
                className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Konfirmasi</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-md mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Daftar Sekarang
                </>
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400">atau</span>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full h-11 border-slate-200 hover:bg-slate-50" onClick={handleGoogleLogin}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Daftar dengan Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
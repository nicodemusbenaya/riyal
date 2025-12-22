import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Loader2, LogIn, Users } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      console.log('[LOGIN] Login successful, navigating to dashboard...');
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      // Tambahkan small delay untuk memastikan state sudah update
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } else {
      console.log('[LOGIN] Login failed:', result.error);
      toast({
        title: "Login Gagal",
        description: result.error || "Email atau password salah.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // PERBAIKAN DI SINI:
  const handleGoogleLogin = async () => {
    try {
      // Kita tidak perlu menunggu result atau mengecek success
      // karena browser akan langsung redirect ke Google
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
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
          <CardTitle className="text-xl font-semibold text-slate-800 pt-2">Selamat Datang!</CardTitle>
          <CardDescription className="text-slate-500">
            Masuk untuk menemukan tim impianmu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={formData.email}
                onChange={handleChange}
                required 
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Link to="#" className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Masuk
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
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
            Lanjutkan dengan Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link to="/register" className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline">
              Daftar gratis
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
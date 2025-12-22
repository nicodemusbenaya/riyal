import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ROLES } from '../mock/mockData';
import { User, Calendar, Briefcase, Tag, X, Camera, UserCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // REF PENGUNCI: Bersifat synchronous, mencegah double-submit instan
  const isSubmitting = useRef(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    birthdate: user?.birthdate || '',
    role: user?.role || '',
    skills: user?.skills || [],
    avatar: user?.avatar || ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi untuk menangani upload gambar
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Batas 2MB
        toast({
          title: 'File terlalu besar',
          description: 'Maksimal ukuran file adalah 2MB',
          variant: 'destructive'
        });
        return;
      }

      // Simpan file untuk diupload nanti
      setAvatarFile(file);
      
      // Preview gambar
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault(); // Mencegah form submit saat tekan Enter di input skill
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   e.stopPropagation(); // Hentikan event bubbling
    
  //   // GUARD: Jika sedang submitting (terkunci), hentikan eksekusi segera!
  //   if (isSubmitting.current) return;

  //   if (!formData.name || !formData.birthdate || !formData.role || formData.skills.length === 0) {
  //     toast({
  //       title: 'Data tidak lengkap',
  //       description: 'Silakan lengkapi semua field.',
  //       variant: 'destructive'
  //     });
  //     return;
  //   }
    
  //   // KUNCI PINTU: Set ref true agar klik berikutnya ditolak
  //   isSubmitting.current = true;
  //   setLoading(true);

  //   try {
  //     let avatarUrl = "";
      
  //     // 1. Upload avatar dulu jika ada file baru
  //     if (avatarFile) {
  //       const uploadResponse = await uploadAvatar(avatarFile);
  //       avatarUrl = uploadResponse.avatar_url;
  //       console.log("Avatar uploaded:", avatarUrl);
  //     }
      
  //     // 2. Update profile data dengan avatar_url
  //     await updateProfile({
  //       ...formData,
  //       avatarUrl: avatarUrl
  //     });
      
  //     toast({ title: 'Profil berhasil disimpan!', description: 'Anda dapat mulai mencari tim.' });
  //     navigate('/dashboard');
      
  //   } catch (error) {
  //     console.error("Profile update failed:", error);
  //     toast({
  //       title: 'Gagal Menyimpan',
  //       description: error.response?.data?.detail || 'Terjadi kesalahan saat menyimpan profil.',
  //       variant: 'destructive'
  //     });
      
  //     // BUKA KUNCI: Hanya jika gagal, supaya user bisa coba lagi
  //     // Jika sukses, kita pindah halaman (unmount), jadi tidak perlu set false
  //     isSubmitting.current = false;
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (isSubmitting.current) return;

  if (!formData.name || !formData.birthdate || !formData.role || formData.skills.length === 0) {
    toast({
      title: 'Data tidak lengkap',
      description: 'Silakan lengkapi semua field.',
      variant: 'destructive'
    });
    return;
  }

  isSubmitting.current = true;
  setLoading(true);

  try {
    // 1️⃣ CREATE PROFILE DULU (TANPA AVATAR)
    await updateProfile({
      name: formData.name,
      birthdate: formData.birthdate,
      role: formData.role,
      skills: formData.skills
    });

    // 2️⃣ BARU upload avatar (JIKA ADA)
    if (avatarFile) {
      const uploadResponse = await uploadAvatar(avatarFile);
      console.log("Avatar uploaded:", uploadResponse.avatar_url);
    }

    toast({
      title: 'Profil berhasil disimpan!',
      description: 'Anda dapat mulai mencari tim.'
    });

    navigate('/dashboard');

  } catch (error) {
    console.error("Profile update failed:", error);

    toast({
      title: 'Gagal Menyimpan',
      description: error.response?.data?.detail || 'Terjadi kesalahan saat menyimpan profil.',
      variant: 'destructive'
    });

    isSubmitting.current = false;
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <UserCircle className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">GroupMatch</h1>
          <CardTitle className="text-xl font-bold text-slate-800">Lengkapi Profilmu</CardTitle>
          <CardDescription className="text-slate-500">
            Informasi ini membantu kami menemukan tim yang tepat untukmu
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Bagian Upload Foto Profil */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div 
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={formData.avatar} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-2xl bg-cyan-100 text-cyan-600">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Overlay Edit */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                
                {/* Tombol Kamera Kecil */}
                <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-2 border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Klik untuk mengubah foto</p>
              
              {/* Hidden Input File */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  className="pl-10 bg-slate-50 border-slate-200 focus:ring-cyan-500 focus:border-cyan-500 rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate" className="text-slate-700">Tanggal Lahir</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="birthdate"
                  type="date"
                  className="pl-10 bg-slate-50 border-slate-200 focus:ring-cyan-500 focus:border-cyan-500 rounded-lg"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700">Role</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="pl-10 bg-slate-50 border-slate-200 focus:ring-cyan-500 focus:border-cyan-500 rounded-lg">
                    <SelectValue placeholder="Pilih role Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-slate-700">Skills</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="skills"
                      type="text"
                      placeholder="Tambah skill (contoh: React, Python)"
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-cyan-500 focus:border-cyan-500 rounded-lg"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddSkill}
                    className="border-2 border-slate-200 text-slate-600 hover:border-cyan-500 hover:text-cyan-600 bg-transparent rounded-lg font-medium"
                  >
                    Tambah
                  </Button>
                </div>
                
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-cyan-50 border border-cyan-100 rounded-lg">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-sm font-medium" 
              disabled={loading} // Tetap disabled secara visual
            >
              {loading ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
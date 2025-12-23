import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Users,
  ArrowRight,
  Target,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  Star,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Algoritma cerdas yang mencocokkan Anda dengan rekan tim berdasarkan skill dan preferensi.',
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Komunikasi langsung dengan anggota tim melalui fitur chat real-time yang responsif.',
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Keamanan data terjamin dengan sistem autentikasi dan enkripsi modern.',
    },
  ];

  const benefits = [
    'Temukan rekan tim dengan skill yang saling melengkapi',
    'Proses matchmaking otomatis dan cepat',
    'Chat real-time untuk koordinasi tim',
    'Riwayat tim tersimpan dengan rapi',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 text-cyan-200 opacity-50">
        <Users className="h-20 w-20" />
      </div>
      <div className="fixed top-32 right-10 text-teal-200 opacity-50">
        <Zap className="h-16 w-16" />
      </div>

      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
              GroupMatch
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-800"
            >
              Masuk
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white shadow-md"
            >
              Daftar Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Smart Team Matching
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
          Temukan Tim
        </h2>
        <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mb-6">
          Impian Anda
        </h2>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Platform matchmaking tim berbasis skill yang membantu Anda menemukan rekan kerja yang sempurna untuk proyek Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="h-14 px-8 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login')}
            className="h-14 px-8 border-2 text-lg"
          >
            Sudah Punya Akun
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-slate-100 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl p-8 md:p-12 text-white shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Mengapa Memilih GroupMatch?
              </h3>
              <p className="text-cyan-100 mb-6">
                GroupMatch memudahkan Anda menemukan rekan tim yang tepat dengan teknologi matchmaking berbasis skill.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg"
              >
                Coba Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1000+', label: 'Pengguna Aktif' },
            { value: '500+', label: 'Tim Terbentuk' },
            { value: '4.9', label: 'Rating', icon: Star },
            { value: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="p-6">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent flex items-center justify-center gap-1">
                {stat.value}
                {stat.icon && <stat.icon className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-slate-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
          <CardContent className="p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Siap Bergabung?
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8">
              Daftar sekarang dan temukan rekan tim impian Anda dalam hitungan menit!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="h-14 px-8 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all text-lg"
              >
                Daftar Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-14 px-8 border-2 text-lg"
              >
                Masuk
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">GroupMatch</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 GroupMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  DollarSign, 
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Sparkles,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.3 + 0.1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 160, 102, ${p.alpha})`;
        ctx.fill();
      });
      
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

const FloatingElement = ({ delay, duration, className }: { delay: number; duration: number; className?: string }) => (
  <div 
    className={`absolute animate-float ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {children}
  </div>
);

const PropertyCard3D = ({ delay }: { delay: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative group"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative transition-all duration-500 ease-out"
        style={{
          transform: isHovered ? 'translateY(-10px) rotateX(5deg) rotateY(-5deg)' : 'translateY(0) rotateX(0) rotateY(0)',
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-700/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <GlassCard className="w-72 transform transition-transform duration-500 group-hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Properties</p>
                <p className="text-xl font-semibold text-white">24</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          
          <div className="flex gap-2 mt-4">
            {[40, 65, 45, 80, 55].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-amber-600/50 to-amber-500/30 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color, delay }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: string;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  };
  
  const iconColors: Record<string, string> = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400',
  };

  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${colors[color]} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}
      />
      <GlassCard className="h-full transform transition-all duration-300 group-hover:-translate-y-2">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        
        <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${iconColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </GlassCard>
    </div>
  );
};

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && (user || isDemoMode)) {
      router.push('/dashboard');
    }
  }, [user, loading, router, isDemoMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,160,102,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1)_0%,_transparent_50%)]" />
        <AnimatedBackground />
      </div>

      {/* Floating Geometric Shapes */}
      <FloatingElement delay={0} duration={20} className="top-20 left-[10%] w-32 h-32 border border-amber-500/20 rotate-45 rounded-2xl" />
      <FloatingElement delay={2} duration={25} className="top-40 right-[15%] w-24 h-24 border border-violet-500/20 rounded-full" />
      <FloatingElement delay={4} duration={18} className="bottom-40 left-[20%] w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl rotate-12" />
      <FloatingElement delay={6} duration={22} className="bottom-20 right-[25%] w-20 h-20 border border-emerald-500/20 rotate-12" />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-gray-950/80 backdrop-blur-xl border-b border-white/5 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">PropAgent</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'About'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-gray-400 hover:text-amber-400 text-sm font-medium transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-amber-400 mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Trusted by 500+ property managers</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-tight tracking-tight">
                Property management{' '}
                <span className="relative">
                  <span className="relative z-10 text-amber-400">reimagined</span>
                  <span className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
                </span>
              </h1>
              
              <p className="mt-8 text-xl text-gray-400 max-w-xl leading-relaxed">
                Streamline your rental business with PropAgent. Track tenants, handle maintenance, 
                and manage finances — all in one powerful platform.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 cursor-pointer"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#features" 
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 hover:border-amber-500/50 hover:bg-white/5 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  See Features
                  <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </Link>
              </div>
              
              <div className="mt-10 flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* 3D Visual Elements */}
            <div className={`relative h-[600px] transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Background glow */}
                <div className="absolute w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
                
                {/* 3D Cards Stack - Behind the orbit */}
                <div className="relative w-full h-full z-0">
                  <PropertyCard3D delay={0} />
                  
                  {/* Orbiting Elements around "You" */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {/* Center "You" */}
                    <div className="relative z-20">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                        <span className="text-white font-bold text-lg">You</span>
                      </div>
                      {/* Orbit ring */}
                      <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '20s' }}>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Revenue - orbits around "You" */}
                  <div className="absolute top-20 -right-8 animate-orbit-revenue">
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Revenue</p>
                          <p className="text-lg font-semibold text-white">$18,450</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                  
                  {/* Tenants - orbits around "You" */}
                  <div className="absolute bottom-32 -left-8 animate-orbit-tenants">
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Tenants</p>
                          <p className="text-lg font-semibold text-white">18</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Property Managers' },
              { value: '10K+', label: 'Properties Managed' },
              { value: 'R50M+', label: 'Rent Processed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-semibold text-amber-400 mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-amber-400 mb-6">
              <Star className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-6">
              Everything you need to scale
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              PropAgent gives you all the tools to manage your properties efficiently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Home}
              title="Property Tracking"
              description="Keep all your properties organized with detailed information and status tracking."
              color="amber"
              delay={0}
            />
            <FeatureCard 
              icon={Users}
              title="Tenant Management"
              description="Manage leases, track payments, and communicate with tenants all in one place."
              color="emerald"
              delay={0.1}
            />
            <FeatureCard 
              icon={Wrench}
              title="Maintenance"
              description="Handle repair requests, track work orders, and schedule maintenance easily."
              color="rose"
              delay={0.2}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Financial Reports"
              description="Track income, expenses, and generate detailed financial reports instantly."
              color="violet"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-10">Trusted by leading property companies</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {['Real Estate Co', 'Property Plus', 'HomeKey', 'EstateMaster', 'RentFlow'].map((company, i) => (
              <span 
                key={company} 
                className="text-xl font-semibold text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-amber-400 mb-6">
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No hidden fees. No surprises. Start free, scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
                <p className="text-4xl font-bold text-white mb-4">Free<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <p className="text-gray-400 mb-6">Perfect for getting started</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Up to 5 properties</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />10 tenants</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Basic reports</li>
                </ul>
                <Link href="/register" className="block w-full py-3 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer">Get Started</Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="relative group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-sm font-medium text-white">Most Popular</div>
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative backdrop-blur-xl bg-white/10 border border-amber-500/30 rounded-3xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
                <p className="text-4xl font-bold text-white mb-4">$49<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <p className="text-gray-400 mb-6">For growing property managers</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Unlimited properties</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Unlimited tenants</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Advanced analytics</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Priority support</li>
                </ul>
                <Link href="/register" className="block w-full py-3 text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer">Start Free Trial</Link>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                <p className="text-4xl font-bold text-white mb-4">$149<span className="text-lg font-normal text-gray-400">/mo</span></p>
                <p className="text-gray-400 mb-6">For large property portfolios</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Everything in Pro</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Custom integrations</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Dedicated account manager</li>
                  <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />SLA guarantee</li>
                </ul>
                <Link href="/contact" className="block w-full py-3 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer">Contact Sales</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-amber-400 mb-6">
                <Shield className="w-4 h-4" />
                <span>About PropAgent</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-6">
                Built for South African property managers
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                PropAgent was founded in Cape Town with a simple mission: make property management effortless for landlords and property managers across South Africa.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">500+ Properties</h4>
                    <p className="text-gray-400 text-sm">Currently managed on our platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">2000+ Tenants</h4>
                    <p className="text-gray-400 text-sm">Happy tenants in managed properties</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">24/7 Support</h4>
                    <p className="text-gray-400 text-sm">Local support team based in Cape Town</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-amber-400">R50M+</p>
                    <p className="text-gray-400 mt-1">Rent Collected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-emerald-400">99.9%</p>
                    <p className="text-gray-400 mt-1">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-violet-400">4.9/5</p>
                    <p className="text-gray-400 mt-1">User Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">50+</p>
                    <p className="text-gray-400 mt-1">Cities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <GlassCard className="text-center py-16 px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-8 shadow-xl shadow-amber-500/25">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-semibold text-white mb-6">
              Ready to streamline your rental business?
            </h2>
            <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10">
              Join thousands of property managers who trust PropAgent to run their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 hover:border-amber-500/50 hover:bg-white/5 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">PropAgent</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-4 h-4" />
                <span>POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2024 PropAgent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

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
  Calculator,
  FileCheck,
  UserCheck,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-navy-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 text-navy-700" />
              </div>
              <span className="text-xl font-semibold text-navy-500 font-serif tracking-tight">PropAgent</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'About'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-slate-600 hover:text-navy-500 text-sm font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-slate-600 hover:text-navy-500 text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-700 text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-navy-500 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-gold-400 mb-8">
                <Sparkles className="w-4 h-4" />
                <span>South Africa's #1 Property Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight font-serif">
                Property management{' '}
                <span className="text-gold-400">reimagined</span>
              </h1>
              
              <p className="mt-6 text-lg text-navy-200 max-w-xl leading-relaxed">
                Streamline your rental business with PropAgent. Track tenants, handle maintenance, 
                and manage finances — all in one powerful platform built for South Africa.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-xl cursor-pointer"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="#features" 
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer"
                >
                  See Features
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-navy-200">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-navy-200">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gold-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Properties</p>
                      <p className="text-2xl font-bold text-navy-500">24</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +12%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Revenue</p>
                      <p className="text-2xl font-bold text-navy-500">R48,500</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +8%
                      </p>
                    </div>
                  </div>
                  
                  {/* Mini property list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Home className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">12 Ocean View</p>
                        <p className="text-xs text-slate-500">R12,500/mo</p>
                      </div>
                      <span className="badge badge-success">Paid</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Home className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">45 Main Road</p>
                        <p className="text-xs text-slate-500">R18,000/mo</p>
                      </div>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Home className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">8 Beach Rd</p>
                        <p className="text-xs text-slate-500">R9,800/mo</p>
                      </div>
                      <span className="badge badge-success">Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Shield, label: 'EAAB Compliant' },
              { icon: UserCheck, label: 'FICA Verified' },
              { icon: FileCheck, label: 'SARS Tax Compliant' },
              { icon: Shield, label: 'POPIA Compliant' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <item.icon className="w-5 h-5 text-gold-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-navy-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Property Managers' },
              { value: '10K+', label: 'Properties Managed' },
              { value: 'R50M+', label: 'Rent Processed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gold-400 mb-2 font-serif">{stat.value}</div>
                <div className="text-navy-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-500/10 border border-navy-500/20 rounded-full text-sm text-navy-600 mb-6">
              <Star className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-navy-500 mb-4 font-serif">
              Everything you need to scale
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              PropAgent gives you all the tools to manage your properties efficiently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Home, title: 'Property Tracking', description: 'Keep all your properties organized with detailed information and status tracking.' },
              { icon: Users, title: 'Tenant Management', description: 'Manage leases, track payments, and communicate with tenants all in one place.' },
              { icon: Wrench, title: 'Maintenance', description: 'Handle repair requests, track work orders, and schedule maintenance easily.' },
              { icon: Calculator, title: 'Financial Reports', description: 'Track income, expenses, and generate detailed financial reports instantly.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-navy-500 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-500/10 border border-navy-500/20 rounded-full text-sm text-navy-600 mb-6">
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-navy-500 mb-4 font-serif">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No hidden fees. No surprises. Start free, scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-navy-500 mb-2">Starter</h3>
              <p className="text-4xl font-bold text-navy-500 mb-1">Free</p>
              <p className="text-slate-500 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Up to 5 properties</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />10 tenants</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Basic reports</li>
              </ul>
              <Link href="/register" className="block w-full py-3 text-center border border-navy-500 text-navy-500 font-medium rounded-lg hover:bg-navy-500 hover:text-white transition-colors cursor-pointer">Get Started</Link>
            </div>

            {/* Pro Tier */}
            <div className="relative bg-navy-500 border border-navy-500 rounded-2xl p-8 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-500 text-navy-700 text-sm font-semibold rounded-full">Most Popular</div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <p className="text-4xl font-bold text-gold-400 mb-1">R299<span className="text-lg font-normal text-navy-200">/mo</span></p>
              <p className="text-navy-200 mb-6">For growing property managers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white"><CheckCircle2 className="w-4 h-4 text-gold-400" />Unlimited properties</li>
                <li className="flex items-center gap-2 text-white"><CheckCircle2 className="w-4 h-4 text-gold-400" />Unlimited tenants</li>
                <li className="flex items-center gap-2 text-white"><CheckCircle2 className="w-4 h-4 text-gold-400" />Advanced analytics</li>
                <li className="flex items-center gap-2 text-white"><CheckCircle2 className="w-4 h-4 text-gold-400" />Priority support</li>
              </ul>
              <Link href="/register" className="block w-full py-3 text-center bg-gold-500 text-navy-700 font-semibold rounded-lg hover:bg-gold-400 transition-colors cursor-pointer">Start Free Trial</Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-navy-500 mb-2">Enterprise</h3>
              <p className="text-4xl font-bold text-navy-500 mb-1">R599<span className="text-lg font-normal text-slate-500">/mo</span></p>
              <p className="text-slate-500 mb-6">For large property portfolios</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Everything in Pro</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Custom integrations</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Dedicated account manager</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" />SLA guarantee</li>
              </ul>
              <Link href="/contact" className="block w-full py-3 text-center border border-navy-500 text-navy-500 font-medium rounded-lg hover:bg-navy-500 hover:text-white transition-colors cursor-pointer">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-navy-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-gold-400 mb-6">
                <Shield className="w-4 h-4" />
                <span>About PropAgent</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6 font-serif">
                Built for South African property managers
              </h2>
              <p className="text-lg text-navy-200 mb-8">
                PropAgent was founded in Cape Town with a simple mission: make property management effortless for landlords and property managers across South Africa.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: 'R50M+', label: 'Rent Collected' },
                  { value: '99.9%', label: 'Uptime' },
                  { value: '4.9/5', label: 'User Rating' },
                  { value: '50+', label: 'Cities' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gold-400">{stat.value}</p>
                    <p className="text-navy-200 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gold-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-lg font-semibold text-navy-500 mb-6">Why Property Managers Choose Us</h3>
                <div className="space-y-4">
                  {[
                    'EAAB compliant trust accounting',
                    'FICA document verification',
                    'SARS tax-ready reports',
                    'Property24 integration',
                    'Automated rent collection',
                    '24/7 Local support',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-500 rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-500 rounded-xl mb-6">
              <Home className="w-8 h-8 text-navy-700" />
            </div>
            <h2 className="text-3xl font-semibold text-white mb-4 font-serif">
              Ready to streamline your rental business?
            </h2>
            <p className="text-lg text-navy-200 max-w-xl mx-auto mb-8">
              Join thousands of property managers who trust PropAgent to run their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-navy-700" />
              </div>
              <span className="text-lg font-semibold text-navy-500 font-serif">PropAgent</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="w-4 h-4" />
                <span>POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-500">
              © 2024 PropAgent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
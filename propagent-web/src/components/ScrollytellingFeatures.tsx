'use client';

import { useRef, useEffect, useState } from 'react';
import { 
  Home, 
  Users, 
  Zap, 
  Target, 
  Shield, 
  BarChart3, 
  Wrench,
  TrendingUp,
  FileText,
  Building
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURE_DATA = [
  { 
    title: 'Precision Matching', 
    desc: 'Our AI engine deconstructs listings into 40+ attributes to find the perfect buyer match in milliseconds.',
    icon: Target,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000',
    color: '#84cc16'
  },
  { 
    title: 'Intelligent CRM', 
    desc: 'Automated lead nurturing and predictive follow-ups. Never let a hot deal go cold again.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
    color: '#0ea5e9'
  },
  { 
    title: 'Advanced Analytics', 
    desc: 'Real-time dashboards on yield, vacancy, and market velocity. Data-driven decisions, simplified.',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1000',
    color: '#fbbf24'
  },
  { 
    title: 'Smart Operations', 
    desc: 'Maintenance, inspections and vendor management with AI triage. Property management on autopilot.',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000',
    color: '#6366f1'
  }
];

export default function ScrollytellingFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray('.feature-step');
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${sections.length * 100}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const index = Math.min(
            Math.floor(self.progress * sections.length),
            sections.length - 1
          );
          setActiveIndex(index);
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-charcoal-900">
      <div className="absolute inset-0 grid lg:grid-cols-2">
        {/* Left: Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-20 py-20">
          <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">THE STACK</span>
          
          <div className="relative h-[400px]">
            {FEATURE_DATA.map((feature, i) => (
              <div 
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  i === activeIndex 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
              >
                <div className="mb-8">
                   <div 
                     className="w-16 h-16 flex items-center justify-center mb-6"
                     style={{ backgroundColor: `${feature.color}20` }}
                   >
                     <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                   </div>
                   <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6 leading-tight">
                     {feature.title}
                   </h2>
                   <p className="text-white/50 text-xl leading-relaxed max-w-md font-light">
                     {feature.desc}
                   </p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="h-[2px] w-20 bg-lime-400" />
                   <span className="text-[10px] tracking-widest text-white/30 uppercase font-bold">MODULE 0{i+1}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Indicators */}
          <div className="flex gap-4 mt-20">
             {FEATURE_DATA.map((_, i) => (
               <div 
                 key={i}
                 className={`h-1 transition-all duration-500 ${
                   i === activeIndex ? 'w-12 bg-lime-400' : 'w-4 bg-white/10'
                 }`}
               />
             ))}
          </div>
        </div>

        {/* Right: Visual Showcase */}
        <div className="relative hidden lg:block overflow-hidden bg-charcoal-800">
          {FEATURE_DATA.map((feature, i) => (
            <div 
              key={i}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                i === activeIndex ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-110 rotate-2'
              }`}
            >
              <img 
                src={feature.image} 
                alt={feature.title}
                className="w-full h-full object-cover mix-blend-overlay opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-transparent to-transparent" />
              
              {/* Decorative Elements */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] opacity-20"
                style={{ backgroundColor: feature.color }}
              />
            </div>
          ))}
          
          {/* UI Showcase Overlays */}
          <div className="absolute inset-0 flex items-center justify-center p-20">
             <div className="relative w-full aspect-video bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
                
                {/* Simulated Content that changes */}
                <div className="p-8 pt-12">
                   {activeIndex === 0 && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-4 w-1/3 bg-lime-400/20 rounded" />
                        <div className="grid grid-cols-3 gap-4">
                           <div className="h-20 bg-white/5 rounded" />
                           <div className="h-20 bg-white/5 rounded" />
                           <div className="h-20 bg-white/5 rounded" />
                        </div>
                        <div className="h-32 bg-white/5 rounded flex items-center justify-center">
                           <Target className="w-12 h-12 text-lime-400 opacity-20" />
                        </div>
                     </div>
                   )}
                   {activeIndex === 1 && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-4 w-1/4 bg-sky-400/20 rounded" />
                        <div className="space-y-2">
                           {[1,2,3].map(j => (
                             <div key={j} className="h-12 bg-white/5 rounded flex items-center px-4 gap-4">
                                <div className="w-6 h-6 rounded-full bg-white/10" />
                                <div className="h-2 w-1/2 bg-white/10 rounded" />
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                   {activeIndex === 2 && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-4 w-1/2 bg-yellow-400/20 rounded" />
                        <div className="h-48 flex items-end gap-2 px-4">
                           {[40, 70, 45, 90, 65, 80, 50].map((h, j) => (
                             <div key={j} className="flex-1 bg-white/10 rounded-t" style={{ height: `${h}%` }} />
                           ))}
                        </div>
                     </div>
                   )}
                   {activeIndex === 3 && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-4 w-1/3 bg-indigo-400/20 rounded" />
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-24 bg-white/5 rounded border border-white/10" />
                           <div className="h-24 bg-white/5 rounded border border-white/10" />
                           <div className="h-24 bg-white/5 rounded border border-white/10" />
                           <div className="h-24 bg-white/5 rounded border border-white/10" />
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Marker for GSAP */}
      <div className="feature-step" />
      <div className="feature-step" />
      <div className="feature-step" />
      <div className="feature-step" />
    </div>
  );
}

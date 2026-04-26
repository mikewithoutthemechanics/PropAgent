'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FooterMinimal() {
  return (
    <footer className="bg-[#060810] border-t border-white/5" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#0090c2] flex items-center justify-center">
                <div className="w-4 h-4 bg-[#060810] rounded-sm" />
              </div>
              <span className="text-xl font-extrabold tracking-[0.15em] text-white font-display">AGENT LOOP</span>
            </div>
            <p className="mt-4 text-sm text-white/50 max-w-md leading-relaxed">
              Open 24/7 · The operating system for South African property leaders
            </p>
          </div>

          <div className="flex items-center gap-6" aria-label="Compliance badges">
            {['PPRA', 'POPIA', 'FICA'].map((badge) => (
              <span key={badge} className="px-4 py-2 text-[10px] tracking-[0.2em] font-bold border border-white/10 text-white/50 hover:text-white hover:border-[#00d4ff]/30 transition-all duration-300">
                {badge}
              </span>
            ))}
          </div>

          <nav className="flex items-center gap-6" aria-label="Social links">
            {[
              { name: 'LinkedIn', href: 'https://www.linkedin.com' },
              { name: 'Twitter', href: 'https://twitter.com' },
              { name: 'Instagram', href: 'https://instagram.com' },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-white/50 hover:text-[#00d4ff] transition-colors duration-300 text-sm font-medium"
                aria-label={social.name}
              >
                {social.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Agent Loop. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors flex items-center gap-2 group">
              Back to top
              <ArrowRight className="w-3 h-3 group-hover:translate-y-[-2px] transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Premium accent line with glow */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent"
        style={{ boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
        aria-hidden="true"
      />
    </footer>
  );
}

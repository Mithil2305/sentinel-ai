'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight, Sparkles, AlertCircle, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Reusable Design System Components
import { ActionButton } from '@/components/ui/action-button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('operator@sentinel.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('tier3_analyst');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Emulate JWT authentication handshake
    setTimeout(() => {
      if (email && password) {
        setLoading(false);
        router.push('/dashboard');
      } else {
        setLoading(false);
        setError('Please provide valid SOC operator credentials.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#090909] text-text font-sans p-4">
      {/* Subtle Primary Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-badge blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
 
      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#151515] p-8 rounded-card border border-border relative z-10 shadow-2xl animate-fade-in"
      >
        {/* Top Branding Header */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="h-14 w-14 rounded-card bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-display font-bold tracking-tight flex items-center gap-1.5 leading-none">
            <span>Sentinel</span>
            <span className="text-primary">AI</span>
          </h1>
          <p className="text-caption text-[#71717A] mt-2.5 font-bold tracking-wider uppercase">
            Autonomous Self-Healing SOC Platform
          </p>
        </div>
 
        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-input bg-critical/10 border border-critical/20 text-critical text-caption flex items-center gap-2 font-bold uppercase tracking-wider"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
 
          {/* Role selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A] select-none">
              Access Scope Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tier3_analyst', label: 'SOC Tier-3' },
                { id: 'commander', label: 'Commander' },
                { id: 'admin', label: 'SecAdmin' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`py-2 px-2 h-10 rounded-input text-[10px] font-bold border transition-all cursor-pointer select-none ${
                    role === r.id
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-[#111111] border-border text-[#71717A] hover:border-[#71717A]/85 hover:text-text'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              Operator Identifier
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#71717A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@sentinel.ai"
                className="w-full h-10 bg-[#111111] border border-border rounded-input pl-9 pr-3 py-2 text-small-text text-text placeholder:text-[#71717A]/60 focus:outline-none focus:border-primary/60 transition-all font-mono"
              />
            </div>
          </div>
 
          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center select-none">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                Security Token / Key
              </label>
              <span className="text-[9px] text-primary hover:text-[#FB923C] hover:underline cursor-pointer font-bold transition-colors">Hardware Key 2FA</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#71717A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 bg-[#111111] border border-border rounded-input pl-9 pr-3 py-2 text-small-text text-text placeholder:text-[#71717A]/60 focus:outline-none focus:border-primary/60 transition-all font-mono"
              />
            </div>
          </div>
 
          {/* Submit button */}
          <ActionButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Fingerprint className="h-4 w-4 animate-pulse" />
                <span>Authenticating Session...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Authenticate Security Console</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </ActionButton>
        </form>
 
        {/* Footer info */}
        <div className="mt-8 border-t border-border/40 pt-4 text-center select-none">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Encrypted via AES-256 GCM • Sentinel Core v2.4</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

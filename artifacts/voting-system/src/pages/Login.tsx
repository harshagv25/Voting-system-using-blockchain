import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLoginVoter } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginVoter();
  const { login, adminLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Admin backdoor
    if (email === 'admin@vote.gov.in' && password === 'Admin@123') {
      adminLogin();
      toast({ title: "Admin Authenticated", description: "Welcome to command center" });
      setLocation('/admin');
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({
        data: { email, password }
      });
      login(res);
      setLocation('/verify-aadhaar');
    } catch (err: any) {
      toast({ 
        title: "Login Failed", 
        description: err.message || "Invalid credentials", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="max-w-md mx-auto pt-16">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 bg-primary/20 rounded-2xl items-center justify-center mb-4 border border-primary/30 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white">Voter Portal</h2>
        <p className="text-muted-foreground mt-2">Sign in to cast your secure blockchain vote</p>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                required 
                type="email" 
                className="glass-input pl-12" 
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                required 
                type="password" 
                className="glass-input pl-12" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:to-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Authenticating..." : "Login Securely"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}

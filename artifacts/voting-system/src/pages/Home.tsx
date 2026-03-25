import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (isAdmin) setLocation('/admin');
    else if (user?.hasVoted) setLocation('/results');
    else if (user?.aadhaarVerified) setLocation('/vote');
    else if (user) setLocation('/verify-aadhaar');
  }, [user, isAdmin, setLocation]);

  const features = [
    { icon: Fingerprint, title: "Biometric Auth", desc: "Aadhaar + Live Face Recognition ensures genuine voter identity." },
    { icon: Lock, title: "Blockchain Secured", desc: "Immutable SHA-256 hash chaining prevents any data tampering." },
    { icon: Shield, title: "One Vote Policy", desc: "Cryptographic anonymity guarantees one person, one vote." },
    { icon: Activity, title: "Real-time Tracking", desc: "Live decentralized tallying with admin transparency controls." },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full" />
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="VoteChain Logo" 
          className="w-32 h-32 md:w-48 md:h-48 relative z-10 drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
        />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-display font-extrabold mb-4"
      >
        Welcome to <span className="text-gradient">VoteChain India</span>
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
      >
        The next generation of democratic participation. Secure, transparent, and completely fraud-resistant digital voting powered by blockchain and AI.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mb-20"
      >
        <Link href="/register">
          <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all hover:-translate-y-1 text-lg">
            Register as Voter
          </button>
        </Link>
        <Link href="/login">
          <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all hover:-translate-y-1 text-lg">
            Voter Login
          </button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
          >
            <GlassCard className="p-6 h-full border-t border-t-white/20">
              <f.icon className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

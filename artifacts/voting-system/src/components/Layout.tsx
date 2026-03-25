import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';
import { dict } from '@/lib/i18n';
import { 
  Vote, BarChart3, LayoutDashboard, Link2, 
  ShieldCheck, LogOut, Volume2, VolumeX, Menu, X, Fingerprint
} from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, voiceEnabled, setVoiceEnabled } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const t = dict[language];

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const navItems = [
    { path: '/vote', label: t.cast_vote, icon: Vote, visible: !!user },
    { path: '/results', label: t.results, icon: BarChart3, visible: true },
    { path: '/blockchain', label: t.blockchain, icon: Link2, visible: true },
    { path: '/admin', label: t.admin, icon: LayoutDashboard, visible: isAdmin },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              VoteChain<span className="text-accent">.in</span>
            </h1>
          </div>
        </Link>
      </div>

      <div className="px-4 py-6 flex-1 overflow-y-auto space-y-2">
        {navItems.filter(i => i.visible).map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-primary/20 text-white border border-primary/30 shadow-[inset_0_0_15px_rgba(79,70,229,0.15)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-white/10 space-y-4">
        {user && (
          <div className="px-4 py-3 bg-black/20 rounded-xl border border-white/5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t.status}</p>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex items-center justify-between">
                <span className="text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" /> Aadhaar
                </span>
                {user.aadhaarVerified ? (
                  <span className="text-success text-xs px-2 py-1 bg-success/10 rounded-md">Verified</span>
                ) : (
                  <span className="text-destructive text-xs px-2 py-1 bg-destructive/10 rounded-md">Pending</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white flex items-center gap-2">
                  <Vote className="w-4 h-4 text-accent" /> Ballot
                </span>
                {user.hasVoted ? (
                  <span className="text-success text-xs px-2 py-1 bg-success/10 rounded-md">Cast</span>
                ) : (
                  <span className="text-muted-foreground text-xs px-2 py-1 bg-white/5 rounded-md">Not Voted</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="text-sm font-medium text-muted-foreground hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-white/5"
            title="Toggle Voice Guidance"
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
          </button>
        </div>

        {(user || isAdmin) && (
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" /> {t.logout}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
      {/* Abstract Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 relative z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg">VoteChain.in</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden md:block w-72 glass-panel border-r border-white/5 z-40">
        <SidebarContent />
      </div>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden flex flex-col pt-16"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-10 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

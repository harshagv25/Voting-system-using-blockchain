import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useVerifyAadhaar } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';
import { formatAadhaar } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Fingerprint, ShieldAlert, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyAadhaar() {
  const [aadhaar, setAadhaar] = useState('');
  const { user, updateUserStatus } = useAuth();
  const verifyMutation = useVerifyAadhaar();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { speak } = useVoice();

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.aadhaarVerified) {
      setLocation('/vote');
    }
  }, [user, setLocation]);

  if (!user || user.aadhaarVerified) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const aadhaarClean = aadhaar.replace(/\s+/g, '');
    
    if (aadhaarClean.length !== 12) {
      toast({ title: "Validation Error", description: "Aadhaar must be 12 digits", variant: "destructive" });
      return;
    }

    try {
      const res = await verifyMutation.mutateAsync({
        data: {
          voterId: user.voterId,
          aadhaarNumber: aadhaarClean
        }
      });
      
      if (res.verified) {
        updateUserStatus({ aadhaarVerified: true });
        speak("Aadhaar verified successfully. Proceeding to voting booth.");
        toast({ title: "Verified", description: "Identity confirmed", className: "bg-success text-white border-none" });
        setLocation('/vote');
      }
    } catch (err: any) {
      speak("Verification failed. Incorrect Aadhaar number.");
      toast({ 
        title: "Verification Failed", 
        description: err.message || "Aadhaar number does not match registered records.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="max-w-md mx-auto pt-16">
      <div className="text-center mb-8">
        <div className="inline-flex w-20 h-20 bg-accent/20 rounded-full items-center justify-center mb-4 border border-accent/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
          <ShieldAlert className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white">Security Check</h2>
        <p className="text-muted-foreground mt-2">Please re-enter your Aadhaar number to verify your session before voting.</p>
      </div>

      <GlassCard className="p-8 border-t-accent/50">
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">12-Digit Aadhaar Number</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-accent" />
              <input 
                required 
                type="text" 
                maxLength={14}
                className="glass-input pl-14 text-xl tracking-widest font-mono py-4" 
                placeholder="0000 0000 0000"
                value={aadhaar}
                onChange={e => setAadhaar(formatAadhaar(e.target.value))}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={verifyMutation.isPending}
            className="w-full py-4 bg-accent hover:bg-accent/80 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Identity"}
            {!verifyMutation.isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}

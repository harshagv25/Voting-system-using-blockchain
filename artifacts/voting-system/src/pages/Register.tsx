import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterVoter, useStoreFaceData } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useVoice } from '@/context/VoiceContext';
import { GlassCard } from '@/components/ui/glass-card';
import { FaceScanner } from '@/components/FaceScanner';
import { formatAadhaar } from '@/lib/utils';
import { Fingerprint, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', aadhaar: '' });
  const [voterId, setVoterId] = useState<string>('');
  
  const [, setLocation] = useLocation();
  const { login, updateUserStatus } = useAuth();
  const { speak } = useVoice();
  const { toast } = useToast();

  const registerMutation = useRegisterVoter();
  const storeFaceMutation = useStoreFaceData();

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aadhaarClean = formData.aadhaar.replace(/\s+/g, '');
    if (aadhaarClean.length !== 12) {
      toast({ title: "Invalid Aadhaar", description: "Must be 12 digits", variant: "destructive" });
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({
        data: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          aadhaarNumber: aadhaarClean,
        }
      });
      
      setVoterId(res.voterId);
      login(res);
      setStep(2);
      speak("Registration successful. Please proceed to face capture.");
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message || "Email or Aadhaar already registered", variant: "destructive" });
    }
  };

  const handleFaceCapture = async (descriptor: number[]) => {
    try {
      await storeFaceMutation.mutateAsync({
        data: {
          voterId: voterId,
          faceDescriptor: descriptor
        }
      });
      updateUserStatus({ hasFaceData: true }); // Custom local update if schema allowed, but we just move to step 3
      setStep(3);
      speak("Face data stored securely. You are ready to vote.");
      setTimeout(() => {
        setLocation('/verify-aadhaar');
      }, 3000);
    } catch (err: any) {
      toast({ title: "Face Save Failed", description: "Could not store biometric data securely.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Voter Registration</h2>
        <p className="text-muted-foreground">Secure multi-step onboarding for digital voting</p>
      </div>

      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full" />
        <div className={`absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
        
        {[1, 2, 3].map((num) => (
          <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 ${step >= num ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-background border-white/20 text-muted-foreground'}`}>
            {step > num ? <CheckCircle className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-8">
              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      required 
                      type="text" 
                      className="glass-input pl-12" 
                      placeholder="As per Aadhaar Card"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      required 
                      type="email" 
                      className="glass-input pl-12" 
                      placeholder="voter@india.gov"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      required 
                      type="password" 
                      className="glass-input pl-12" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Aadhaar Number</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input 
                      required 
                      type="text" 
                      maxLength={14}
                      className="glass-input pl-12 tracking-widest font-mono text-lg" 
                      placeholder="0000 0000 0000"
                      value={formData.aadhaar}
                      onChange={e => setFormData({...formData, aadhaar: formatAadhaar(e.target.value)})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={registerMutation.isPending}
                  className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {registerMutation.isPending ? "Processing..." : "Continue to Face Capture"}
                  {!registerMutation.isPending && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Biometric Registration</h3>
              <p className="text-muted-foreground mb-6">Position your face clearly in the frame. This data will be securely encrypted and matched before voting.</p>
              
              <FaceScanner mode="register" onCapture={handleFaceCapture} />
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Registration Complete</h3>
              <p className="text-muted-foreground mb-6">Your identity has been securely linked to the blockchain.</p>
              <p className="text-sm text-white/50 animate-pulse">Redirecting to verification gateway...</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

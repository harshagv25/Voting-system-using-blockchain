import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  useGetAdminStats, useGetElectionStatus, useUpdateElectionStatus, 
  useToggleResultsVisibility, useListCandidates, useCreateCandidate, 
  useGetFraudLog, useResetElection 
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, AlertTriangle, ShieldCheck, Activity, Power, Lock, Plus, Trash2, EyeOff, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'logs'>('dashboard');

  const { data: stats } = useGetAdminStats();
  const { data: electionStatus, refetch: refetchStatus } = useGetElectionStatus();
  const { data: candidates, refetch: refetchCandidates } = useListCandidates();
  const { data: logs } = useGetFraudLog();
  
  const toggleElectionMutation = useUpdateElectionStatus();
  const toggleResultsMutation = useToggleResultsVisibility();
  const createCandidateMutation = useCreateCandidate();
  const resetMutation = useResetElection();

  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '', symbol: '' });

  if (!isAdmin) {
    setLocation('/login');
    return null;
  }

  const handleToggleElection = async () => {
    await toggleElectionMutation.mutateAsync({ data: { isActive: !electionStatus?.isActive } });
    refetchStatus();
    toast({ title: `Election ${!electionStatus?.isActive ? 'Started' : 'Stopped'}`, className: "bg-primary border-none text-white" });
  };

  const handleToggleResults = async () => {
    await toggleResultsMutation.mutateAsync({ data: { hidden: !electionStatus?.resultsHidden } });
    refetchStatus();
    toast({ title: `Results ${!electionStatus?.resultsHidden ? 'Hidden' : 'Visible'}`, className: "bg-accent border-none text-black" });
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCandidateMutation.mutateAsync({ data: newCandidate });
    refetchCandidates();
    setNewCandidate({ name: '', party: '', description: '', symbol: '' });
    toast({ title: "Candidate Added", className: "bg-success border-none text-white" });
  };

  const handleReset = async () => {
    if(confirm("DANGER: This will wipe all votes, candidates, and blockchain data. Are you absolutely sure?")) {
      const pwd = prompt("Enter admin password to confirm reset:");
      if (pwd) {
        try {
          await resetMutation.mutateAsync({ data: { adminPassword: pwd } });
          toast({ title: "System Reset", description: "Database wiped clean.", variant: "destructive" });
          window.location.reload();
        } catch(e) {
          toast({ title: "Reset Failed", variant: "destructive" });
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" /> Command Center
          </h1>
          <p className="text-muted-foreground mt-2">Government-grade administrative controls.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-6 pb-2">
        {['dashboard', 'candidates', 'logs'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-6 border-t-primary/50">
              <Users className="w-8 h-8 text-primary mb-4" />
              <div className="text-2xl font-bold">{stats?.totalVoters || 0}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Total Voters</div>
            </GlassCard>
            <GlassCard className="p-6 border-t-success/50">
              <Activity className="w-8 h-8 text-success mb-4" />
              <div className="text-2xl font-bold">{stats?.totalVotesCast || 0}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Votes Cast</div>
            </GlassCard>
            <GlassCard className="p-6 border-t-accent/50">
              <ShieldCheck className="w-8 h-8 text-accent mb-4" />
              <div className="text-2xl font-bold">{stats?.verificationRate || 0}%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Biometric Rate</div>
            </GlassCard>
            <GlassCard className="p-6 border-t-destructive/50">
              <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
              <div className="text-2xl font-bold">{stats?.fraudAttempts || 0}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Fraud Blocks</div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Election Controls</h3>
              
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl mb-4 border border-white/5">
                <div>
                  <div className="font-bold">Voting Status</div>
                  <div className="text-sm text-muted-foreground">Allow users to cast votes</div>
                </div>
                <button 
                  onClick={handleToggleElection}
                  className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${electionStatus?.isActive ? 'bg-destructive hover:bg-destructive/80 text-white' : 'bg-success hover:bg-success/80 text-white'}`}
                >
                  <Power className="w-4 h-4" /> {electionStatus?.isActive ? 'Stop Election' : 'Start Election'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl mb-4 border border-white/5">
                <div>
                  <div className="font-bold">Live Results Visiblity</div>
                  <div className="text-sm text-muted-foreground">Hide public charts</div>
                </div>
                <button 
                  onClick={handleToggleResults}
                  className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${electionStatus?.resultsHidden ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                >
                  {electionStatus?.resultsHidden ? <><Eye className="w-4 h-4"/> Publish Results</> : <><EyeOff className="w-4 h-4" /> Hide Results</>}
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-destructive/30 bg-destructive/5 text-center flex flex-col justify-center items-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-6">Wipe the entire database, reset blockchain, and clear voters.</p>
              <button onClick={handleReset} className="px-6 py-3 bg-destructive hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all hover:shadow-[0_0_25px_rgba(220,38,38,0.8)]">
                <Trash2 className="w-5 h-5" /> Factory Reset System
              </button>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 md:col-span-1 h-fit">
            <h3 className="font-bold text-lg mb-4">Add Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <input required type="text" placeholder="Full Name" className="glass-input" value={newCandidate.name} onChange={e=>setNewCandidate({...newCandidate, name: e.target.value})} />
              <input required type="text" placeholder="Party Name" className="glass-input" value={newCandidate.party} onChange={e=>setNewCandidate({...newCandidate, party: e.target.value})} />
              <textarea required placeholder="Manifesto / Description" className="glass-input min-h-[100px] resize-none" value={newCandidate.description} onChange={e=>setNewCandidate({...newCandidate, description: e.target.value})} />
              <button type="submit" className="w-full py-3 bg-primary hover:bg-primary/90 rounded-xl font-bold flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Register</button>
            </form>
          </GlassCard>
          
          <div className="md:col-span-2 space-y-4">
            {candidates?.map(c => (
              <GlassCard key={c.id} className="p-4 flex justify-between items-center bg-white/5">
                <div>
                  <div className="font-bold text-lg text-white">{c.name}</div>
                  <div className="text-accent text-sm font-bold">{c.party}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs uppercase">Votes</div>
                  <div className="text-xl font-bold">{c.voteCount}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium uppercase tracking-wider">Timestamp</th>
                <th className="p-4 font-medium uppercase tracking-wider">Voter ID</th>
                <th className="p-4 font-medium uppercase tracking-wider">Attempt Type</th>
                <th className="p-4 font-medium uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs?.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No fraud attempts logged. System secure.</td></tr>
              )}
              {logs?.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-mono text-xs text-primary">{log.voterId?.substring(0,8) || '-'}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded font-bold border border-destructive/30">{log.attemptType}</span></td>
                  <td className="p-4 text-muted-foreground">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

    </div>
  );
}

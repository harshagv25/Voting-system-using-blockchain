import React from 'react';
import { useGetBlockchain, useValidateBlockchain } from '@workspace/api-client-react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import { Link2, ShieldCheck, AlertTriangle, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Blockchain() {
  const { data, isLoading } = useGetBlockchain();
  const validateQuery = useValidateBlockchain();
  const { toast } = useToast();

  const handleValidate = async () => {
    const res = await validateQuery.refetch();
    if (res.data?.isValid) {
      toast({ title: "Chain Valid", description: "Cryptographic integrity verified.", className: "bg-success text-white border-none" });
    } else {
      toast({ title: "Chain Broken", description: res.data?.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="pt-20 text-center animate-pulse">Synchronizing ledger...</div>;

  const blocks = data?.blocks || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Link2 className="w-8 h-8 text-accent" />
            Blockchain Ledger
          </h1>
          <p className="text-muted-foreground mt-2">Transparent, immutable cryptographic record of every vote cast.</p>
        </div>
        
        <button 
          onClick={handleValidate}
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm font-bold"
        >
          {data?.isValid ? <ShieldCheck className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-destructive" />}
          Run Integrity Check
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        {blocks.map((block, index) => (
          <React.Fragment key={block.hash}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <GlassCard className={`p-5 w-full border-l-4 transition-all duration-300 hover:scale-[1.01] ${index === 0 ? 'border-l-accent' : 'border-l-primary'}`}>
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <div className="font-mono text-xs text-primary font-bold tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    BLOCK #{block.index}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(block.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase block mb-1">Voter Hash (Anon)</span>
                    <span className="text-white break-all bg-black/30 px-2 py-1 rounded">{block.voterId || "GENESIS"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase block mb-1">Candidate ID</span>
                    <span className="text-accent font-bold text-lg">{block.candidateId === -1 ? '0' : block.candidateId}</span>
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <span className="text-muted-foreground text-xs uppercase block mb-1">Previous Hash</span>
                    <span className="text-white/60 break-all text-xs">{block.previousHash}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground text-xs uppercase block mb-1 text-primary">Current Hash</span>
                    <span className="text-primary/90 break-all text-xs font-bold">{block.hash}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            
            {index < blocks.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (index * 0.1) + 0.1 }}
                className="py-2"
              >
                <ArrowDown className="w-8 h-8 text-white/20 animate-pulse" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

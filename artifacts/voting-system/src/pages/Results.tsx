import React, { useEffect } from 'react';
import { useGetResults } from '@workspace/api-client-react';
import { GlassCard } from '@/components/ui/glass-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Lock, Trophy, Users } from 'lucide-react';

const COLORS = ['#4f46e5', '#00e5ff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Results() {
  // Poll results every 5 seconds
  const { data, isLoading } = useGetResults({
    query: { refetchInterval: 5000 }
  });

  if (isLoading) return <div className="pt-20 text-center animate-pulse">Loading live results...</div>;

  if (data?.isHidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <GlassCard className="p-12 max-w-lg border-t-destructive/50">
          <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Results Hidden</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Election Commission has hidden the live results to prevent undue influence while the election is active. Check back once voting concludes.
          </p>
        </GlassCard>
      </div>
    );
  }

  const sortedResults = [...(data?.results || [])].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sortedResults[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            Live Tally
          </h1>
          <p className="text-muted-foreground mt-2">Real-time vote counting straight from the blockchain.</p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4">
          <Users className="text-primary w-5 h-5" />
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Votes Cast</div>
            <div className="text-2xl font-bold text-white">{data?.totalVotes || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Winner Highlight */}
        {winner && winner.voteCount > 0 && (
          <GlassCard className="lg:col-span-3 p-6 bg-gradient-to-r from-primary/20 to-accent/10 border-primary/30">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-md" />
              </div>
              <div>
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Current Leader</div>
                <div className="text-3xl font-bold text-white flex items-center gap-3">
                  {winner.name} 
                  <span className="text-lg font-normal text-muted-foreground">({winner.party})</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-4xl font-black text-accent">{winner.percentage}%</div>
                <div className="text-sm text-muted-foreground">of total votes</div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Bar Chart */}
        <GlassCard className="p-6 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Vote Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sortedResults} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#ffffff50" />
              <YAxis dataKey="name" type="category" stroke="#ffffff80" width={100} tick={{fill: '#fff'}} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="voteCount" radius={[0, 4, 4, 0]}>
                {sortedResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pie Chart */}
        <GlassCard className="p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-2">Vote Share</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sortedResults}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="voteCount"
                  stroke="rgba(0,0,0,0)"
                >
                  {sortedResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {sortedResults.slice(0,4).map((r, i) => (
              <div key={r.candidateId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white/80 truncate w-32">{r.name}</span>
                </div>
                <span className="font-bold text-white">{r.percentage}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}

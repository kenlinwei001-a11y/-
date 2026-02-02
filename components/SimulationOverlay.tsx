import React from 'react';
import { X, Maximize2, Minimize2, Activity, Play, Pause, Loader2 } from 'lucide-react';
import { SimulationView } from './SimulationView';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Project } from '../types';

interface SimulationOverlayProps {
  mode: 'hidden' | 'minimized' | 'maximized';
  onMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;
  project: Project;
}

// Simple mock data for minimized sparkline
const sparkData = [
  { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 25 }, { v: 22 }, { v: 30 }, { v: 28 }, { v: 35 }
];

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({ mode, onMaximize, onMinimize, onClose, project }) => {
  if (mode === 'hidden') return null;

  if (mode === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-sci-panel border border-slate-700 rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
        {/* Minimized Header */}
        <div className="h-10 bg-slate-800/80 flex items-center justify-between px-3 border-b border-slate-700 cursor-pointer" onClick={onMaximize}>
          <div className="flex items-center gap-2 text-xs font-bold text-white truncate max-w-[180px]">
            <Loader2 size={12} className="animate-spin text-sci-accent"/>
            <span className="truncate">{project.name} 计算中...</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
              <Maximize2 size={12}/>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
              <X size={12}/>
            </button>
          </div>
        </div>
        
        {/* Minimized Body */}
        <div className="p-3 bg-slate-900/50 backdrop-blur" onClick={onMaximize} style={{cursor: 'pointer'}}>
           <div className="flex justify-between items-end mb-2">
              <div>
                 <div className="text-[10px] text-slate-400">Time Step</div>
                 <div className="text-sm font-mono text-white">T+12h</div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] text-slate-400">Progress</div>
                 <div className="text-sm font-mono text-sci-accent">45%</div>
              </div>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-sci-accent w-[45%] animate-pulse"></div>
           </div>

           {/* Sparkline */}
           <div className="h-12 w-full opacity-50">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={sparkData}>
                 <Area type="monotone" dataKey="v" stroke="#0ea5e9" fill="#0ea5e9" strokeWidth={2}/>
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    );
  }

  // Maximized Mode
  return (
    <div className="fixed inset-4 bg-sci-base border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col animate-in zoom-in-95 duration-200">
       {/* Maximized Header */}
       <div className="h-14 border-b border-slate-800 bg-sci-panel/90 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-sci-accent/20 flex items-center justify-center text-sci-accent border border-sci-accent/30">
               <Activity size={18}/>
             </div>
             <div>
                <h2 className="text-base font-bold text-white">实时推演监控 - {project.name}</h2>
                <div className="text-xs text-sci-muted flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-sci-success animate-pulse"></span>
                   Computing... | Job ID: SIM-{project.code}-{Date.now().toString().slice(-4)}
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={onMinimize} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-medium">
                <Minimize2 size={14}/> 最小化悬浮
             </button>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded transition-colors">
                <X size={18}/>
             </button>
          </div>
       </div>

       {/* Main Content (Reusing SimulationView Logic) */}
       <div className="flex-1 overflow-hidden p-6 bg-sci-base relative">
          <SimulationView project={project} />
       </div>
    </div>
  );
};

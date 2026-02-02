import React from 'react';
import { Project } from '../types';
import { Clock, MapPin, ArrowRight, Activity, Zap } from 'lucide-react';

interface ProjectGalleryProps {
  projects: Project[];
  onSelect: (project: Project) => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projects, onSelect }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-sci-accent" size={24}/>
            进行中的项目 (Active Projects)
         </h2>
         <div className="text-sm text-sci-muted">共 {projects.length} 个项目正在运行</div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {projects.map(p => (
           <div 
             key={p.id} 
             onClick={() => onSelect(p)}
             className="bg-sci-surface/40 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-sci-accent/50 hover:bg-slate-800 transition-all group relative overflow-hidden shadow-lg"
           >
             <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                <ArrowRight className="text-sci-accent" />
             </div>
             
             <div className="flex items-center gap-2 mb-3">
               <span className={`w-2 h-2 rounded-full ${p.type === 'Atmosphere' ? 'bg-blue-400' : 'bg-emerald-500'} animate-pulse`}></span>
               <span className={`text-xs font-bold uppercase ${p.type === 'Atmosphere' ? 'text-blue-400' : 'text-emerald-500'}`}>{p.type} Simulation</span>
             </div>
             
             <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sci-accent transition-colors">{p.name}</h3>
             <div className="text-xs text-sci-muted font-mono mb-4">{p.code}</div>
             
             <div className="space-y-3 mb-6 pt-4 border-t border-slate-700/50">
               <div className="flex items-center gap-2 text-sm text-slate-300">
                 <MapPin size={14} className="text-slate-500"/> {p.region}
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-300">
                 <Clock size={14} className="text-slate-500"/> {p.lastModified}
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-300">
                 <Zap size={14} className="text-slate-500"/> 
                 {p.status === 'Simulating' ? 'Running Simulation...' : 'Ready'}
               </div>
             </div>
             
             <div className="flex justify-between items-center bg-slate-900/50 -mx-6 -mb-6 px-6 py-3 border-t border-slate-700">
               <div className="text-xs text-slate-500">System Health</div>
               <div className="flex items-center gap-2">
                 <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                   <div style={{width: `${p.health}%`}} className={`h-full rounded-full ${p.health > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                 </div>
                 <span className={`text-xs font-mono font-bold ${p.health > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{p.health}%</span>
               </div>
             </div>
           </div>
         ))}
       </div>
    </div>
  )
}

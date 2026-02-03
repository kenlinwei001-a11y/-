import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { 
  Map as MapIcon, Zap, Layers, AlertCircle, TrendingUp, Search, 
  ChevronRight, Network, ArrowRight, Wind, CloudFog, Factory,
  Play, Pause, Clock, MapPin, PlayCircle, Settings, GitBranch
} from 'lucide-react';
import { PageId, Project } from '../types';

interface ProjectBIProps {
  project: Project;
  onNavigate: (page: PageId) => void;
}

// --- Data for Atmosphere (New) ---
const atmosTrend = [
  { time: '00:00', pm25: 45, o3: 30 },
  { time: '04:00', pm25: 40, o3: 25 },
  { time: '08:00', pm25: 85, o3: 40 },
  { time: '12:00', pm25: 60, o3: 110 },
  { time: '16:00', pm25: 55, o3: 140 },
  { time: '20:00', pm25: 70, o3: 60 },
];

const atmosSource = [
  { name: '燃煤电厂', value: 30 },
  { name: '移动源(交通)', value: 45 },
  { name: '扬尘', value: 10 },
  { name: '工业过程', value: 15 },
];
const COLORS_ATMOS = ['#6366F1', '#F43F5E', '#EAB308', '#10B981'];

// --- Data for Water (Existing) ---
const pollutionTrend = [
  { time: '2023-Q1', tn: 2.4, tp: 0.15, limit: 2.0 },
  { time: '2023-Q2', tn: 2.8, tp: 0.18, limit: 2.0 },
  { time: '2023-Q3', tn: 2.1, tp: 0.12, limit: 2.0 },
  { time: '2023-Q4', tn: 1.9, tp: 0.10, limit: 2.0 },
  { time: '2024-Q1', tn: 1.8, tp: 0.09, limit: 2.0 },
];
const sourceContribution = [
  { name: '工业排放', value: 35 },
  { name: '农业面源', value: 40 },
  { name: '生活污水', value: 15 },
  { name: '底泥释放', value: 10 },
];
const COLORS_WATER = ['#0EA5E9', '#10B981', '#F59E0B', '#6366F1'];

// --- Map Frame Data Generator ---
// Simulates pollution blobs moving from South (Hebei) to North (Beijing) over 24 hours
const generatePollutionFrames = () => {
  const frames = [];
  for (let t = 0; t < 24; t++) {
    // Phase 1 (0-8h): Accumulation in South (Industrial)
    // Phase 2 (8-16h): Transport North (Wind)
    // Phase 3 (16-24h): Dispersion
    
    let centerX = 200;
    let centerY = 250; // Start at bottom
    let spread = 40;
    let intensity = 0.4;

    if (t < 8) {
       intensity = 0.4 + (t/8) * 0.3;
       spread = 40 + t * 2;
    } else if (t < 16) {
       // Moving North-East
       const progress = (t - 8) / 8;
       centerY = 250 - (progress * 150); // Move up
       centerX = 200 + (progress * 50);  // Move right
       intensity = 0.7 + (Math.sin(progress * Math.PI) * 0.2); // Peak intensity
       spread = 60 - (progress * 10); // Concentrate
    } else {
       // Dispersing
       const progress = (t - 16) / 8;
       centerY = 100 - (progress * 30);
       centerX = 250 + (progress * 20);
       intensity = 0.7 - (progress * 0.5);
       spread = 50 + (progress * 50); // Diffuse
    }

    frames.push({
      clouds: [
        { x: centerX, y: centerY, r: spread, opacity: intensity },
        { x: centerX - 40, y: centerY + 20, r: spread * 0.8, opacity: intensity * 0.8 }, // Secondary plume
      ],
      windDir: (180 + t * 10) % 360 // Wind changing direction
    });
  }
  return frames;
};

const mapFrames = generatePollutionFrames();


const KpiCard = ({ title, value, unit, status, onClick, icon: Icon }: any) => (
  <div 
    onClick={onClick}
    className="bg-sci-surface/40 border border-slate-700/50 rounded-lg p-5 cursor-pointer hover:bg-sci-surface/60 hover:border-sci-accent/50 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-2 right-2 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
        {Icon ? <Icon size={16} className="text-sci-accent"/> : <Search size={16} className="text-sci-accent"/>}
    </div>
    <div className="text-sci-muted text-xs font-bold uppercase tracking-wider mb-2">{title}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-white font-mono">{value}</span>
      <span className="text-xs text-slate-400">{unit}</span>
    </div>
    <div className={`text-xs mt-2 flex items-center gap-1 ${status === 'good' ? 'text-sci-success' : status === 'warning' ? 'text-amber-400' : 'text-sci-danger'}`}>
      {status === 'good' ? <TrendingUp size={12}/> : <AlertCircle size={12}/>}
      {status === 'good' ? '优良' : status === 'warning' ? '轻度污染' : '超标/重度'}
    </div>
  </div>
);

export const ProjectBI: React.FC<ProjectBIProps> = ({ project, onNavigate }) => {
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [mapTime, setMapTime] = useState(12); // 0-23 hours
  const [isMapPlaying, setIsMapPlaying] = useState(false);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const isAtmos = project.type === 'Atmosphere';

  // Map Animation Loop
  useEffect(() => {
    if (isMapPlaying) {
      playbackRef.current = setInterval(() => {
        setMapTime(prev => (prev + 1) % 24);
      }, 500); // 0.5s per hour
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isMapPlaying]);

  const currentFrame = mapFrames[mapTime] || mapFrames[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Project Context Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
               {project.name} <span className="text-xs px-2 py-0.5 rounded bg-sci-accent/20 text-sci-accent border border-sci-accent/30 font-normal">运行中</span>
            </h1>
            <p className="text-sm text-sci-muted mt-1">
               {isAtmos 
                  ? '关注: PM2.5, Ozone | 尺度: 城市-区县-街道 (Multi-Scale) | 实时气象耦合: WRF'
                  : '关注: 总氮 (TN), 总磷 (TP) | 模拟范围: 广州-佛山-东莞河网 | 水动力耦合: EFDC'}
            </p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('project-workflow')}
              className="px-3 py-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-sm rounded transition-colors flex items-center gap-2"
            >
               <GitBranch size={14} /> 进入工作流
            </button>
            <button 
              onClick={() => onNavigate('project-simulation')}
              className="px-3 py-1.5 bg-sci-surface border border-slate-700 hover:bg-slate-800 text-white text-sm rounded transition-colors flex items-center gap-2"
            >
               <PlayCircle size={14} className="text-emerald-400"/> 快速仿真
            </button>
            <button className="px-3 py-1.5 bg-sci-accent text-white text-sm rounded hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
               生成简报 Report
            </button>
         </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {isAtmos ? (
            <>
               <KpiCard title="实时 AQI" value="142" unit="" status="warning" icon={CloudFog} onClick={() => setActiveDrillDown('aqi')} />
               <KpiCard title="PM2.5 浓度" value="85" unit="μg/m³" status="bad" icon={Wind} onClick={() => setActiveDrillDown('pm25')} />
               <KpiCard title="首要污染物" value="O3" unit="8h" status="warning" icon={AlertCircle} onClick={() => setActiveDrillDown('o3')} />
               <KpiCard title="重点排污企业" value="12" unit="家 (异常)" status="bad" icon={Factory} onClick={() => setActiveDrillDown('source')} />
            </>
         ) : (
            <>
               <KpiCard title="流域平均总氮 (TN)" value="1.8" unit="mg/L" status="good" onClick={() => setActiveDrillDown('tn')} />
               <KpiCard title="流域平均总磷 (TP)" value="0.09" unit="mg/L" status="good" onClick={() => setActiveDrillDown('tp')} />
               <KpiCard title="断面超标率" value="12.5" unit="%" status="bad" onClick={() => setActiveDrillDown('exceed')} />
               <KpiCard title="溯源置信度" value="92" unit="%" status="good" onClick={() => setActiveDrillDown('source')} />
            </>
         )}
      </div>

      {/* Drill Down View */}
      {activeDrillDown && (
         <div className="bg-slate-800/90 border-l-4 border-sci-accent rounded-r-lg p-5 mb-4 animate-in fade-in zoom-in-95 shadow-2xl relative">
            <button onClick={() => setActiveDrillDown(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white">关闭</button>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Search size={18} className="text-sci-accent"/> 
                     深度归因分析: {activeDrillDown.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">基于 {isAtmos ? 'WRF-CMAQ-ISAM' : 'Bayesian Network'} 的推演</p>
               </div>
               <button 
                  onClick={() => onNavigate('project-workflow')} 
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center gap-2 border border-slate-600 shadow-md group"
               >
                  <Settings size={12}/> 进入 Workflow 调试 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>
            {/* Simple Chain Viz */}
            <div className="flex items-center gap-4 text-sm text-slate-300">
               <span className="p-2 bg-slate-900 rounded border border-slate-700">监测数据异常</span>
               <ArrowRight size={14}/>
               <span className="p-2 bg-slate-900 rounded border border-slate-700">气象条件不利 (静稳)</span>
               <ArrowRight size={14}/>
               <span className="p-2 bg-slate-900 rounded border border-slate-700">本地排放累积</span>
               <ArrowRight size={14}/>
               <span className="p-2 bg-sci-accent/20 text-sci-accent rounded border border-sci-accent/50 font-bold">结论: 本地排放主导 (70%)</span>
            </div>
         </div>
      )}

      {/* 3. Main Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[580px]">
        
        {/* Left: Spatial Status (Map) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-1 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-1 relative overflow-hidden group flex flex-col">
               {/* Map Header Overlay */}
               <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur px-3 py-2 rounded border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                     <MapIcon size={14} className="text-sci-accent"/> 
                     {isAtmos ? '京津冀 PM2.5 输送通道动态模拟' : '实时水质热力图 (TN)'}
                  </div>
                  {isAtmos && (
                    <div className="text-[10px] text-slate-400 font-mono">
                       Time: <span className="text-white">2023-10-24 {mapTime.toString().padStart(2, '0')}:00</span> | Wind: <span className="text-white">{currentFrame.windDir}° 3.4m/s</span>
                    </div>
                  )}
               </div>

               {/* Map Legend Overlay */}
               {isAtmos && (
                  <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur p-2 rounded border border-slate-700 shadow-xl flex flex-col gap-1">
                     <div className="text-[10px] text-slate-400 mb-1">PM2.5 (μg/m³)</div>
                     <div className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded-sm bg-green-500"></span> 0-35 (优)</div>
                     <div className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded-sm bg-yellow-500"></span> 35-75 (良)</div>
                     <div className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded-sm bg-orange-500"></span> 75-115 (轻度)</div>
                     <div className="flex items-center gap-1 text-[10px]"><span className="w-3 h-3 rounded-sm bg-red-600"></span> &gt;150 (重度)</div>
                  </div>
               )}

               {/* Main Interactive Map Visualization */}
               <div className="w-full flex-1 bg-[#0B0F19] relative cursor-crosshair overflow-hidden border border-slate-800/50 rounded m-1">
                  {isAtmos ? (
                     // Atmospheric GIS Simulation
                     <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                        {/* 1. Base Map (Abstract Region Outlines) */}
                        <path d="M 120 50 L 280 50 L 320 120 L 280 250 L 120 250 L 80 150 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <text x="200" y="140" textAnchor="middle" className="text-[8px] fill-slate-500 pointer-events-none">Beijing</text>
                        <text x="260" y="200" textAnchor="middle" className="text-[8px] fill-slate-500 pointer-events-none">Tianjin</text>
                        <text x="140" y="220" textAnchor="middle" className="text-[8px] fill-slate-500 pointer-events-none">Hebei</text>

                        {/* 2. Grid */}
                        <defs>
                           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3"/>
                           </pattern>
                           <radialGradient id="pollutantGradient">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                           </radialGradient>
                           <marker id="windArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                              <path d="M 0 0 L 6 3 L 0 6 z" fill="#64748b" />
                           </marker>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* 3. Dynamic Pollution Blobs */}
                        <g style={{ transition: 'all 0.5s ease-out' }}>
                           {currentFrame.clouds.map((cloud, idx) => (
                              <circle 
                                 key={idx}
                                 cx={cloud.x} 
                                 cy={cloud.y} 
                                 r={cloud.r} 
                                 fill="url(#pollutantGradient)"
                                 opacity={cloud.opacity}
                                 className="blur-xl"
                              />
                           ))}
                        </g>

                        {/* 4. Monitoring Stations (Points) */}
                        {[
                           {x: 180, y: 130, status: 'warning'}, {x: 210, y: 140, status: 'bad'}, 
                           {x: 250, y: 190, status: 'good'}, {x: 150, y: 230, status: 'bad'}
                        ].map((st, i) => (
                           <circle 
                              key={`st-${i}`} 
                              cx={st.x} cy={st.y} r="3" 
                              fill={st.status === 'good' ? '#10b981' : st.status === 'warning' ? '#f59e0b' : '#ef4444'} 
                              stroke="#fff" strokeWidth="1"
                           />
                        ))}
                        
                        {/* 5. Wind Vectors (Dynamic Direction) */}
                        {Array.from({length: 8}).map((_, row) => 
                           Array.from({length: 10}).map((_, col) => {
                              const wx = 20 + col * 40;
                              const wy = 20 + row * 40;
                              const angleRad = (currentFrame.windDir - 90) * (Math.PI / 180);
                              const len = 8;
                              const ex = wx + Math.cos(angleRad) * len;
                              const ey = wy + Math.sin(angleRad) * len;
                              return (
                                 <line 
                                    key={`w-${row}-${col}`} 
                                    x1={wx} y1={wy} x2={ex} y2={ey} 
                                    stroke="#64748b" strokeWidth="1" 
                                    opacity="0.3" 
                                    markerEnd="url(#windArrow)"
                                 />
                              )
                           })
                        )}
                     </svg>
                  ) : (
                     // Water Mock (River) - Simple Fallback
                     <svg className="w-full h-full" viewBox="0 0 400 300">
                        <path d="M50,150 Q100,100 200,150 T350,100" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
                        <path d="M50,150 Q100,100 200,150 T350,100" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" className="animate-pulse opacity-50"/>
                        <circle cx="180" cy="130" r="10" fill="#EF4444" className="animate-ping opacity-75" />
                     </svg>
                  )}
                  
                  {/* Map Controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                     <button className="p-2 bg-slate-800 rounded text-slate-300 hover:text-white border border-slate-700 shadow-lg" title="Toggle Layers"><Layers size={16}/></button>
                     <button className="p-2 bg-slate-800 rounded text-slate-300 hover:text-white border border-slate-700 shadow-lg" title="Drill Down"><Zap size={16}/></button>
                  </div>
               </div>
               
               {/* Time Series Controller (New) */}
               {isAtmos && (
                  <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-4 gap-4">
                     <button 
                        onClick={() => setIsMapPlaying(!isMapPlaying)}
                        className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${isMapPlaying ? 'bg-sci-accent text-white' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
                     >
                        {isMapPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                     </button>
                     
                     <div className="flex-1 flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono w-8 text-right">00:00</span>
                        <input 
                           type="range" 
                           min="0" max="23" step="1" 
                           value={mapTime} 
                           onChange={(e) => { setIsMapPlaying(false); setMapTime(parseInt(e.target.value)); }}
                           className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sci-accent"
                        />
                        <span className="text-[10px] text-slate-500 font-mono w-8">23:00</span>
                     </div>
                     
                     <div className="text-xs font-mono text-sci-accent font-bold w-12 text-center">
                        {mapTime.toString().padStart(2, '0')}:00
                     </div>
                  </div>
               )}
            </div>

            <div className="h-48 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-5 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-white">
                     {isAtmos ? '污染物浓度日变化 (PM2.5 vs Ozone)' : '污染物浓度趋势 (TN) vs 达标限值'}
                  </h3>
                  <span className="text-xs text-sci-muted">{isAtmos ? '过去 24 小时' : '最近 5 个季度'}</span>
               </div>
               <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={isAtmos ? atmosTrend : pollutionTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                        <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                        {isAtmos ? (
                           <>
                              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#F43F5E" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="o3" name="Ozone" stroke="#EAB308" strokeWidth={2} dot={false} />
                           </>
                        ) : (
                           <>
                              <Line type="monotone" dataKey="tn" name="TN 实测" stroke="#0EA5E9" strokeWidth={2} dot={{r:3}} />
                              <Line type="step" dataKey="limit" name="V类水标准" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                           </>
                        )}
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
        </div>

        {/* Right: Source Apportionment */}
        <div className="flex flex-col gap-6">
           <div className="flex-1 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-4">污染源贡献解析 (ISAM Source Apportionment)</h3>
              <div className="flex-1 min-h-0 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={isAtmos ? atmosSource : sourceContribution} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {(isAtmos ? atmosSource : sourceContribution).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={(isAtmos ? COLORS_ATMOS : COLORS_WATER)[index % 4]} stroke="none"/>
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '4px' }} />
                       <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}/>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                    <div className="text-2xl font-bold text-white">Top 1</div>
                    <div className="text-xs text-sci-muted">{isAtmos ? '交通' : '农业'}</div>
                 </div>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded border border-white/5">
                 <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0"/>
                    <p className="text-xs text-slate-300 leading-relaxed">
                       {isAtmos 
                          ? '结论: 早高峰时段 NO2 排放激增导致午后 O3 超标，建议加强主干道限行。' 
                          : '结论: 农业面源（化肥流失）占比 40%，是造成枯水期 TP 超标的主要原因。'}
                    </p>
                 </div>
              </div>
           </div>

           {/* Component Status */}
           <div className="h-1/3 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-4 overflow-y-auto">
              <h3 className="text-xs font-bold text-sci-muted uppercase mb-3">模型组件状态</h3>
              <div className="space-y-2">
                 {[
                    { name: isAtmos ? 'WRF (Meteorology)' : 'WRF-Hydro', status: 'Converged', latency: '45ms' },
                    { name: isAtmos ? 'CMAQ (Chemistry)' : 'EFDC (Hydro)', status: 'Running', latency: '120ms' },
                    { name: isAtmos ? 'ISAM (Source)' : 'RCA (Quality)', status: 'Waiting', latency: '-' },
                 ].map((model, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900/50 border border-slate-800">
                       <span className="text-slate-300">{model.name}</span>
                       <span className={`px-1.5 py-0.5 rounded ${model.status === 'Running' ? 'bg-amber-500/10 text-amber-500' : model.status === 'Converged' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>{model.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { PlayCircle, PauseCircle, RefreshCw, Sliders, Save, Clock, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { Project } from '../types';

interface SimulationViewProps {
  project?: Project;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ project }) => {
  const [param1, setParam1] = useState(30); // Emission/Load Reduction
  const [param2, setParam2] = useState(0);  // Wind/Flow adjustment
  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const isWater = project?.type === 'Water';

  // Generate mock data based on project type
  useEffect(() => {
    const newData = Array.from({ length: 24 }, (_, i) => {
      const base = isWater 
        ? Math.sin(i / 4) * 0.5 + 1.5 + Math.random() * 0.1 // TN: 1.0 - 2.0 mg/L
        : Math.sin(i / 3) * 20 + 50 + Math.random() * 5;    // PM2.5: 30 - 80 ug/m3
      
      // Apply simple reduction logic based on param1
      const reductionFactor = 1 - (param1 / 200); 
      const scenario = base * reductionFactor + (Math.random() * (isWater ? 0.05 : 2));

      return {
        time: `${i}:00`,
        baseline: base,
        scenario: scenario,
      };
    });
    setData(newData);
  }, [project?.type, param1, isWater]);

  // Dynamic Labels
  const title = isWater ? '总氮 (TN) 浓度预测' : 'PM2.5 浓度预测';
  const unit = isWater ? 'mg/L' : 'μg/m³';
  const param1Label = isWater ? '入河排污削减 (%)' : '工业排放削减 (%)';
  const param2Label = isWater ? '上游流量调节 (m³/s)' : '风速偏差修正 (m/s)';
  const warningText = isWater 
    ? 'Warning: 枯水期流量不足，断面达标风险较高。'
    : 'Warning: 逆温层存在，污染物扩散条件较差。';

  return (
    <div className="flex gap-6 h-full w-full animate-in fade-in duration-300">
      {/* Left: Visualization */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Main Chart */}
        <div className="flex-1 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-4 flex flex-col backdrop-blur-sm relative min-h-[300px]">
           <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
              <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white">
                 <Clock size={12}/> 历史回放
              </button>
              <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white">
                 <Save size={12}/> 保存快照
              </button>
           </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
               <span className={`w-1 h-4 rounded-sm ${isWater ? 'bg-cyan-500' : 'bg-sci-accent'}`}></span>
               {project?.name || '未命名项目'} - {title} (对比分析)
            </h3>
            <div className="flex gap-4 text-xs mr-24">
              <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 基准情景 (Baseline)</span>
              <span className={`flex items-center gap-1 ${isWater ? 'text-cyan-400' : 'text-sci-accent'}`}>
                <span className={`w-2 h-2 rounded-full ${isWater ? 'bg-cyan-400' : 'bg-sci-accent'}`}></span> 
                推演情景 (Scenario)
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isWater ? '#22d3ee' : '#0ea5e9'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isWater ? '#22d3ee' : '#0ea5e9'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8' }}
                  formatter={(value: number) => [value.toFixed(2), unit]}
                />
                <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBase)" strokeWidth={2} name="基准值"/>
                <Area type="monotone" dataKey="scenario" stroke={isWater ? '#22d3ee' : '#0ea5e9'} fillOpacity={1} fill="url(#colorScen)" strokeWidth={2} name="推演值"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Panels */}
        <div className="h-48 grid grid-cols-2 gap-4">
           <div className="bg-sci-surface/30 border border-slate-700/50 rounded-lg p-4 flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isWater ? (
                 <>
                    <Droplets size={24} className="text-cyan-500/50 mb-2"/>
                    <span className="text-sci-muted text-sm font-mono relative z-10">[ 河网水动力流场 - 占位 ]</span>
                 </>
              ) : (
                 <>
                    <Wind size={24} className="text-blue-500/50 mb-2"/>
                    <span className="text-sci-muted text-sm font-mono relative z-10">[ 污染源贡献热力图 - 占位 ]</span>
                 </>
              )}
              <span className="text-[10px] text-slate-500 mt-2 relative z-10">点击查看空间分布下钻</span>
           </div>
           <div className="bg-sci-surface/30 border border-slate-700/50 rounded-lg p-4 flex flex-col justify-center items-center relative group">
              <span className="text-sci-muted text-sm font-mono">
                 {isWater ? '[ 断面水质达标率统计 ]' : '[ 三维风场矢量 - 占位 ]'}
              </span>
              <span className="text-[10px] text-slate-500 mt-2">
                 {isWater ? '查看时空达标情况' : '查看垂直扩散条件'}
              </span>
           </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-80 bg-sci-panel border border-slate-800 rounded-lg p-5 flex flex-col gap-6 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between text-white font-medium border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-sci-accent"/>
            <span>推演控制台</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Engine Ready"></div>
        </div>

        {/* Playback */}
        <div className="space-y-3">
          <span className="text-xs text-sci-muted uppercase font-bold tracking-wider">仿真状态控制</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-medium transition-colors ${
                isPlaying ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-sci-success/20 text-sci-success border border-sci-success/50'
              }`}
            >
              {isPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
              {isPlaying ? '暂停' : '开始计算'}
            </button>
            <button className="p-2 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white" title="重置参数">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <span className="text-xs text-sci-muted uppercase font-bold tracking-wider">敏感参数调节</span>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{param1Label}</span>
              <span className="text-sci-accent font-mono">{param1}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={param1} 
              onChange={(e) => setParam1(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sci-accent"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{param2Label}</span>
              <span className="text-sci-accent font-mono">{param2 > 0 ? '+' : ''}{param2} {isWater ? '' : 'm/s'}</span>
            </div>
             <input 
              type="range" 
              min={isWater ? -10 : -5} 
              max={isWater ? 10 : 5} 
              value={param2}
              onChange={(e) => setParam2(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sci-accent"
            />
          </div>

           <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">环境温度</span>
              <span className="text-sci-accent font-mono">24°C</span>
            </div>
             <input 
              type="range" 
              min="10" 
              max="40" 
              defaultValue="24"
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sci-accent"
            />
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-auto bg-sci-danger/10 border border-sci-danger/20 rounded p-3">
          <div className="flex gap-2 items-start">
             <div className="w-1.5 h-1.5 rounded-full bg-sci-danger mt-1.5 shrink-0"></div>
             <div>
                <p className="text-xs text-sci-danger font-bold mb-1">Warning: 模型收敛性警告</p>
                <p className="text-[10px] text-slate-400 leading-tight">{warningText}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { AlertTriangle, Server, Activity, ArrowUpRight, Database } from 'lucide-react';

const serverLoadData = [
  { time: '00:00', cpu: 30, mem: 40 },
  { time: '04:00', cpu: 25, mem: 35 },
  { time: '08:00', cpu: 60, mem: 55 },
  { time: '12:00', cpu: 85, mem: 70 },
  { time: '16:00', cpu: 75, mem: 65 },
  { time: '20:00', cpu: 50, mem: 50 },
  { time: '23:59', cpu: 35, mem: 45 },
];

const projectStatusData = [
  { name: '珠江三角洲', tasks: 12, errors: 0 },
  { name: '京津冀', tasks: 8, errors: 1 },
  { name: '太湖流域', tasks: 15, errors: 2 },
  { name: '长江中游', tasks: 5, errors: 0 },
];

const StatusCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
  <div className="bg-sci-surface/50 border border-slate-700/50 rounded-lg p-5 backdrop-blur-sm hover:border-slate-600 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-3">
      <span className="text-sci-muted text-sm font-medium group-hover:text-white transition-colors">{title}</span>
      <div className={`p-2 rounded-md bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon size={18} className={color} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white font-mono tracking-tight">{value}</div>
    <div className="flex items-center gap-2 mt-2">
       <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-sci-success' : 'text-sci-danger'}`}>
         {trend === 'up' ? '▲' : '▼'} {subtext}
       </span>
       <span className="text-[10px] text-slate-500">环比上周</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 max-w-full mx-auto animate-in fade-in duration-500">
      
      {/* Platform Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="在线运行项目" 
          value="8" 
          subtext="新增 1 个"
          icon={Activity} 
          color="text-sci-accent" 
          trend="up" 
        />
        <StatusCard 
          title="活跃计算节点" 
          value="128/150" 
          subtext="负载 85%"
          icon={Server} 
          color="text-emerald-400" 
          trend="up" 
        />
        <StatusCard 
          title="平台异常告警" 
          value="3" 
          subtext="需处理"
          icon={AlertTriangle} 
          color="text-sci-danger" 
          trend="down" 
        />
        <StatusCard 
          title="总存储使用量" 
          value="4.2 PB" 
          subtext="+12 TB"
          icon={Database} 
          color="text-purple-400" 
          trend="up" 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
        {/* Resource Usage Trend */}
        <div className="lg:col-span-2 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-semibold text-white flex items-center gap-2">
               <Server size={16} className="text-sci-accent"/> 全局计算资源负载
             </h3>
             <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sci-accent"></span> CPU 使用率</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> 内存使用率</span>
             </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serverLoadData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="cpu" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                <Area type="monotone" dataKey="mem" stroke="#A855F7" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Task Distribution */}
        <div className="lg:col-span-1 bg-sci-surface/30 border border-slate-700/50 rounded-lg p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={16} className="text-emerald-400"/> 项目任务并发数监控
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={projectStatusData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#E2E8F0', fontSize: 12 }} width={80} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                <Bar dataKey="tasks" fill="#10B981" radius={[0, 4, 4, 0]} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
             <div className="flex items-center justify-between text-xs text-sci-muted">
                <span>太湖流域任务队列拥堵</span>
                <span className="text-sci-warning flex items-center gap-1"><AlertTriangle size={12}/> 注意</span>
             </div>
          </div>
        </div>
      </div>

      {/* Exception List */}
      <div className="bg-sci-surface/30 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-semibold text-white">平台风险与异常中心</h3>
          <button className="text-xs text-sci-accent hover:text-white flex items-center gap-1">查看全部 <ArrowUpRight size={12}/></button>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-sci-muted uppercase bg-sci-base/50">
              <tr>
                <th className="px-5 py-3">异常级别</th>
                <th className="px-5 py-3">涉及项目</th>
                <th className="px-5 py-3">异常描述</th>
                <th className="px-5 py-3">发生时间</th>
                <th className="px-5 py-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="px-5 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">Critical</span></td>
                <td className="px-5 py-3 text-white font-medium">京津冀 PM2.5 溯源</td>
                <td className="px-5 py-3 text-slate-300">CMAQ 模型计算发散，边界条件异常</td>
                <td className="px-5 py-3 text-sci-muted font-mono">10-24 14:30</td>
                <td className="px-5 py-3"><span className="text-sci-accent group-hover:underline">处理中</span></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="px-5 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">Warning</span></td>
                <td className="px-5 py-3 text-white font-medium">珠江三角洲水质</td>
                <td className="px-5 py-3 text-slate-300">监测站 A402 数据缺失率 > 20%</td>
                <td className="px-5 py-3 text-sci-muted font-mono">10-24 11:15</td>
                <td className="px-5 py-3"><span className="text-sci-accent group-hover:underline">待分析</span></td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
  );
};

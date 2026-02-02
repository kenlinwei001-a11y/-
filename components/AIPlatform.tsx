import React, { useState } from 'react';
import { 
  Brain, CircuitBoard, Library, ServerCog, Sparkles, ShieldCheck, 
  Search, Plus, Filter, MoreVertical, X, Check, Activity, Play,
  FileText, Settings, AlertTriangle, Workflow, Code2, ArrowLeft,
  Calendar, User, Zap, Layers, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line 
} from 'recharts';
import { PageId } from '../types';
import { WorkflowEditor } from './WorkflowEditor';

interface AIPlatformProps {
  view: PageId;
}

// --- Mock Data ---

const models = [
  { id: 'm1', name: 'Gemini 3 Pro (Env-Tuned)', type: '通用/环境增强', context: '128k', cost: '$$', status: 'Active', tags: ['推演', '对话'], desc: '针对环境科学文献微调的高级推理模型。' },
  { id: 'm2', name: 'WRF-LLM-Adapter v2', type: '领域专用', context: '32k', cost: '$', status: 'Active', tags: ['代码', '配置'], desc: '专门用于生成 WRF/CMAQ 模型配置文件的轻量模型。' },
  { id: 'm3', name: 'DeepSeek-Reasoning', type: '数学/逻辑', context: '64k', cost: '$$$', status: 'Idle', tags: ['数学', '复杂推演'], desc: '处理复杂污染物扩散方程推导。' },
  { id: 'm4', name: 'Vision-Pollution-Detect', type: '多模态', context: '16k', cost: '$$', status: 'Active', tags: ['图像', '遥感'], desc: '识别卫星遥感图中的污染羽流。' },
  { id: 'm5', name: 'Transn Redu (Enterprise)', type: '模型压缩/加速', context: '256k', cost: '$$$$', status: 'Active', tags: ['量化', '蒸馏', '边缘部署'], desc: '企业级大模型轻量化与传输优化引擎，支持 Transn Redu 专有格式导出。' },
];

const algorithms = [
  { id: 'alg1', name: 'PMF_Source_Apportionment', type: 'Statistical', context: '-', cost: 'Free', status: 'Active', tags: ['Python', 'Source'], desc: '正定矩阵因子分解算法，用于受体模型源解析。' },
  { id: 'alg2', name: 'Bayesian_Inversion_v4', type: 'Inverse', context: '-', cost: '$', status: 'Active', tags: ['Matlab', 'Emission'], desc: '基于贝叶斯推断的排放源反演算法。' },
  { id: 'alg3', name: 'Kriging_Spatial_Interp', type: 'Geospatial', context: '-', cost: 'Free', status: 'Active', tags: ['R', 'GIS'], desc: '克里金时空插值算法，用于站点数据网格化。' },
  { id: 'alg4', name: 'LSTM_Time_Series_Pred', type: 'Deep Learning', context: '-', cost: '$$', status: 'Active', tags: ['PyTorch', 'Forecast'], desc: '长短期记忆网络，用于单点污染物浓度预测。' }
];

const workflows = [
  { id: 'wf1', name: '大气重污染应急预案推演', nodes: 6, status: 'Production', updated: '2h ago', author: 'Dr. Wang', desc: '基于 WRF-Chem 的 72 小时污染物扩散模拟与管控措施评估。' },
  { id: 'wf2', name: '水质异常溯源诊断', nodes: 5, status: 'Draft', updated: '1d ago', author: 'Team Water', desc: '利用贝叶斯网络反演上游排污口贡献占比。' },
  { id: 'wf3', name: '碳排放清单动态更新', nodes: 5, status: 'Active', updated: '3d ago', author: 'Emission Grp', desc: '多源数据融合更新城市级 CO2 排放清单。' },
  { id: 'wf4', name: '卫星遥感热点扫描', nodes: 4, status: 'Active', updated: '1w ago', author: 'RS Center', desc: '基于 MODIS/Landsat 的地面热异常点自动识别与火点监测。' },
];

const agents = [
  { id: 'a1', name: 'Data Cleaner Agent', role: '数据治理', skills: ['缺失值填补', '异常检测'], model: 'Gemini 3 Flash', status: 'Active', desc: '自动扫描入库数据，标记并修复传感器漂移异常。' },
  { id: 'a2', name: 'Model Selector', role: '模型调度', skills: ['适用性评估', '参数推荐'], model: 'Gemini 3 Pro', status: 'Active', desc: '根据气象条件和算力预算选择最优模拟模型。' },
  { id: 'a3', name: 'Policy Reasoner', role: '决策解释', skills: ['溯源分析', '报告生成'], model: 'GPT-4o', status: 'Paused', desc: '将模拟结果转化为政策制定者可读的归因报告。' },
  { id: 'a4', name: 'Reviewer Agent', role: '质量审核', skills: ['幻觉检测', '一致性校验'], model: 'Gemini 3 Pro', status: 'Active', desc: '审核其他 Agent 的输出，防止伪造数据。' }
];

const skills = [
  { id: 's1', name: 'Pollution_Source_Tracking', type: 'Algorithm', input: 'Concentration Matrix', output: 'Source Vector', version: 'v1.2.0', desc: '基于受体模型的源解析算法封装。' },
  { id: 's2', name: 'Met_Data_Align', type: 'Data Tool', input: 'NetCDF', output: 'CSV', version: 'v2.0.1', desc: '对齐不同时空分辨率的气象数据。' },
  { id: 's3', name: 'Scenario_Generator', type: 'Reasoning', input: 'Constraints', output: 'Scenario JSON', version: 'v1.0.0', desc: '基于自然语言生成 WRF namelist 配置。' },
  { id: 's4', name: 'Knowledge_Search', type: 'RAG Tool', input: 'Query', output: 'Documents', version: 'v3.1.0', desc: '检索环境标准和历史案例库。' }
];

const knowledgeBases = [
  { id: 'k1', name: '珠江三角洲历史案例库', docs: 1240, type: 'Project Memory', status: 'Synced', lastUpdate: '2h ago' },
  { id: 'k2', name: '国家环境标准规范 (GB)', docs: 450, type: 'Standard', status: 'Synced', lastUpdate: '1d ago' },
  { id: 'k3', name: '大气物理机理文献集', docs: 8500, type: 'Scientific Paper', status: 'Indexing', lastUpdate: '5m ago' }
];

const opsData = [
  { time: '10:00', tokens: 4000, latency: 120 },
  { time: '11:00', tokens: 3000, latency: 130 },
  { time: '12:00', tokens: 2000, latency: 110 },
  { time: '13:00', tokens: 2780, latency: 150 },
  { time: '14:00', tokens: 1890, latency: 115 },
  { time: '15:00', tokens: 2390, latency: 125 },
  { time: '16:00', tokens: 3490, latency: 140 }
];

// --- Sub Components ---

const ModelCard = ({ model, onClick }: any) => (
  <div onClick={onClick} className={`bg-sci-surface/40 border p-4 rounded-lg cursor-pointer hover:bg-slate-800 transition-all group relative animate-in zoom-in-95 duration-300 ${model.name.includes('Transn Redu') ? 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-500' : 'border-slate-700 hover:border-purple-500/50'}`}>
     <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <div className={`p-2 rounded ${model.name.includes('Transn Redu') ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : model.type.includes('Algo') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
             {model.name.includes('Transn Redu') ? <Zap size={18} fill="currentColor"/> : model.type.includes('Algo') ? <Code2 size={18}/> : <Brain size={18}/>}
           </div>
           <div>
              <div className="font-bold text-white text-sm">{model.name}</div>
              <div className="text-xs text-slate-400">{model.type}</div>
           </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${model.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
     </div>
     <p className="text-[10px] text-slate-400 mb-4 h-8 line-clamp-2">{model.desc}</p>
     <div className="flex gap-2 text-[10px] text-slate-400 mb-3">
        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">CTX: {model.context}</span>
        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Cost: {model.cost}</span>
     </div>
     <div className="flex flex-wrap gap-1">
        {model.tags.map((t: string) => (
           <span key={t} className="text-[10px] px-1.5 py-0.5 bg-sci-accent/10 text-sci-accent rounded">{t}</span>
        ))}
     </div>
  </div>
);

const WorkflowCard = ({ workflow, onClick }: any) => (
   <div onClick={onClick} className="bg-sci-surface/40 border border-slate-700 p-5 rounded-lg cursor-pointer hover:border-sci-accent/50 hover:bg-slate-800 transition-all group relative animate-in zoom-in-95 duration-300 flex flex-col justify-between h-40">
      <div>
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-700/50 rounded text-sci-accent group-hover:bg-sci-accent/20 transition-colors">
                  <Workflow size={20}/>
               </div>
               <h3 className="font-bold text-white text-sm leading-tight">{workflow.name}</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] border ${
               workflow.status === 'Production' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
               workflow.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
               'bg-slate-700 text-slate-400 border-slate-600'
            }`}>
               {workflow.status}
            </span>
         </div>
         <p className="text-xs text-slate-400 line-clamp-2">{workflow.desc}</p>
      </div>
      
      <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500">
         <div className="flex gap-3">
            <span className="flex items-center gap-1"><CircuitBoard size={10}/> {workflow.nodes} Nodes</span>
            <span className="flex items-center gap-1"><User size={10}/> {workflow.author}</span>
         </div>
         <span className="flex items-center gap-1"><Calendar size={10}/> {workflow.updated}</span>
      </div>
   </div>
);

const AgentRow = ({ agent, onClick }: any) => (
  <tr onClick={onClick} className="border-b border-slate-800 hover:bg-white/5 cursor-pointer transition-colors group">
     <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
        <CircuitBoard size={16} className="text-sci-accent"/> {agent.name}
     </td>
     <td className="px-4 py-3 text-slate-400 text-xs">{agent.role}</td>
     <td className="px-4 py-3 text-slate-400 text-xs font-mono">{agent.model}</td>
     <td className="px-4 py-3">
        <div className="flex gap-1 flex-wrap max-w-[200px]">
           {agent.skills.map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">{s}</span>
           ))}
        </div>
     </td>
     <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded text-[10px] border ${
           agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
        }`}>{agent.status}</span>
     </td>
  </tr>
);

const KnowledgeCard = ({ item, onClick }: any) => (
   <div onClick={onClick} className="p-4 bg-slate-800/50 border border-slate-700 rounded hover:border-purple-400/50 cursor-pointer flex items-center justify-between">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-slate-700 rounded"><Library size={18} className="text-purple-300"/></div>
         <div>
            <div className="font-medium text-white text-sm">{item.name}</div>
            <div className="text-xs text-slate-400 flex gap-2">
               <span>{item.type}</span>
               <span>•</span>
               <span>{item.docs} docs</span>
            </div>
         </div>
      </div>
      <div className="text-right">
         <div className={`text-xs ${item.status === 'Synced' ? 'text-emerald-400' : 'text-amber-400'}`}>{item.status}</div>
         <div className="text-[10px] text-slate-500">{item.lastUpdate}</div>
      </div>
   </div>
);

// --- Main Component ---

export const AIPlatform: React.FC<AIPlatformProps> = ({ view }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // Transn Redu Specific State
  const [transnConfig, setTransnConfig] = useState({
      quantization: 'INT8',
      pruningRatio: 30,
      distillationTeacher: 'Gemini 3 Pro',
      exportFormat: 'ONNX'
  });

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleWorkflowClick = (wf: any) => {
     setSelectedWorkflow(wf);
  };

  const renderContent = () => {
    switch(view) {
      case 'ai-models':
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
               {models.map(m => <ModelCard key={m.id} model={m} onClick={() => handleItemClick(m)}/>)}
               <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:text-sci-accent hover:border-sci-accent/50 cursor-pointer transition-colors min-h-[140px]">
                  <Plus size={24} className="mb-2"/>
                  <span className="text-sm">部署新模型</span>
               </div>
            </div>
         );
      case 'ai-algorithms':
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
               {algorithms.map(m => <ModelCard key={m.id} model={m} onClick={() => handleItemClick(m)}/>)}
               <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-400/50 cursor-pointer transition-colors min-h-[140px]">
                  <Plus size={24} className="mb-2"/>
                  <span className="text-sm">注册新算法</span>
               </div>
            </div>
         );
      case 'ai-workflows':
         if (selectedWorkflow) {
             return (
                 <div className="h-full flex flex-col animate-in fade-in">
                     <div className="mb-3 flex items-center justify-between">
                        <button 
                           onClick={() => setSelectedWorkflow(null)} 
                           className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                           <ArrowLeft size={14}/> Back to Pool
                        </button>
                        <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded border border-slate-700">{selectedWorkflow.name}</span>
                     </div>
                     <div className="flex-1 border border-slate-700 rounded overflow-hidden">
                        <WorkflowEditor workflowId={selectedWorkflow.id} />
                     </div>
                 </div>
             )
         }
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in">
               {workflows.map(wf => <WorkflowCard key={wf.id} workflow={wf} onClick={() => handleWorkflowClick(wf)}/>)}
               <div className="border border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:text-sci-accent hover:border-sci-accent/50 cursor-pointer transition-colors min-h-[160px]">
                  <Plus size={24} className="mb-2"/>
                  <span className="text-sm">新建工作流 Orchestration</span>
               </div>
            </div>
         );
      case 'ai-agents':
         return (
            <div className="bg-sci-surface/30 border border-slate-700/50 rounded-lg overflow-hidden animate-in fade-in">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-sci-muted uppercase bg-slate-900/50">
                     <tr>
                        <th className="px-4 py-3">Agent 名称</th>
                        <th className="px-4 py-3">定位</th>
                        <th className="px-4 py-3">基座模型</th>
                        <th className="px-4 py-3">Skills 能力</th>
                        <th className="px-4 py-3">状态</th>
                     </tr>
                  </thead>
                  <tbody>
                     {agents.map(a => <AgentRow key={a.id} agent={a} onClick={() => handleItemClick(a)}/>)}
                  </tbody>
               </table>
            </div>
         );
      case 'ai-skills':
         return (
            <div className="space-y-4 animate-in fade-in">
               <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-2.5 text-slate-500" size={16}/>
                     <input type="text" placeholder="搜索算法、工具、脚本..." className="w-full bg-slate-900 border border-slate-700 rounded pl-9 py-2 text-sm text-white focus:outline-none focus:border-purple-500"/>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20">
                     <Plus size={16}/> 注册 Skill
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map(s => (
                     <div key={s.id} onClick={() => handleItemClick(s)} className="p-4 bg-slate-800/50 border border-slate-700 rounded hover:border-purple-500/30 cursor-pointer flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-700 rounded group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                              <Sparkles size={18} className="text-slate-400 group-hover:text-purple-300"/>
                           </div>
                           <div>
                              <div className="text-sm font-medium text-white">{s.name}</div>
                              <div className="text-xs text-slate-500">{s.desc}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">{s.version}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );
      case 'ai-knowledge':
         return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
               <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Library size={16}/> 知识库 Knowledge Base</h3>
                  {knowledgeBases.map(k => <KnowledgeCard key={k.id} item={k} onClick={() => handleItemClick(k)}/>)}
                  <button className="w-full py-3 border border-dashed border-slate-700 rounded text-slate-500 hover:text-white hover:border-slate-500 text-sm flex items-center justify-center gap-2">
                     <Plus size={16}/> 添加知识库
                  </button>
               </div>
               <div className="lg:col-span-1 bg-sci-surface/30 border border-slate-700/50 rounded p-4">
                  <h3 className="text-sm font-bold text-white mb-4">知识图谱概览 Ontology</h3>
                  <div className="h-48 bg-slate-900/50 rounded flex items-center justify-center border border-slate-800">
                     <span className="text-xs text-slate-500">[ Knowledge Graph Vis ]</span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                     <div className="flex justify-between"><span>实体 Entities</span> <span className="text-white">12,403</span></div>
                     <div className="flex justify-between"><span>关系 Relations</span> <span className="text-white">45,201</span></div>
                     <div className="flex justify-between"><span>存储 Vector DB</span> <span className="text-emerald-400">Healthy</span></div>
                  </div>
               </div>
            </div>
         );
      case 'ai-ops':
         return (
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                     <div className="text-xs text-slate-400">Total Tokens (24h)</div>
                     <div className="text-2xl font-bold text-white font-mono mt-1">45.2 M</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                     <div className="text-xs text-slate-400">Avg Latency</div>
                     <div className="text-2xl font-bold text-white font-mono mt-1">128 ms</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                     <div className="text-xs text-slate-400">Error Rate</div>
                     <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">0.02%</div>
                  </div>
               </div>
               
               <div className="h-64 bg-slate-800/30 border border-slate-700 rounded p-4">
                  <h3 className="text-sm font-bold text-white mb-4">调用量与延迟监控 (Traffic & Latency)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={opsData}>
                        <defs>
                           <linearGradient id="colorToken" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                        <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#475569"/>
                        <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={10}/>
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10}/>
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px'}}/>
                        <Area yAxisId="left" type="monotone" dataKey="tokens" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorToken)" />
                        <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false}/>
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         );
      default:
         return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
               <ServerCog size={48} className="mb-4 opacity-50"/>
               <h3 className="text-lg font-medium text-white">Module Initializing...</h3>
               <p className="text-sm">Please configure {view} in System Settings.</p>
            </div>
         );
    }
  };

  // Header Logic
  const getHeader = () => {
     switch(view) {
        case 'ai-models': return { title: '模型库 Model Hub', desc: '统一管理通用大模型与环境机理模型' };
        case 'ai-algorithms': return { title: '算法库 Algorithm Hub', desc: '统一管理统计分析与数值计算算法' };
        case 'ai-workflows': return { title: 'Workflow 池 Workflow Pool', desc: '查看与管理所有环境模拟与数据处理工作流' };
        case 'ai-agents': return { title: '智能体编排 Agent Hub', desc: '定义 Agent 角色、任务目标与协同策略' };
        case 'ai-skills': return { title: 'Skills 能力池 Skill Pool', desc: '原子化能力封装，供 Agent 与 Workflow 调用' };
        case 'ai-knowledge': return { title: '知识与记忆 Knowledge', desc: 'RAG 知识库管理与本体构建' };
        case 'ai-ops': return { title: 'AI 运行监控 AI Ops', desc: 'Token 消耗、延迟监控与异常追踪' };
        default: return { title: 'AI Control Plane', desc: 'Platform Administration' };
     }
  };

  const header = getHeader();

  return (
    <div className="relative h-full flex flex-col">
       {/* Page Header */}
       <div className="mb-6 flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
             <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                {header.title}
             </h1>
             <p className="text-sci-muted text-sm">{header.desc}</p>
          </div>
          <div className="flex gap-2">
             <button className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white"><Filter size={16}/></button>
             <button className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white"><MoreVertical size={16}/></button>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {renderContent()}
       </div>

       {/* Detailed Drawer (Level 3) */}
       {detailOpen && selectedItem && (
          <div className="absolute top-0 right-0 w-[500px] h-full bg-sci-panel border-l border-slate-700 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
             {/* Drawer Header */}
             <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur">
                <span className="font-bold text-white flex items-center gap-2">
                   {selectedItem.role ? <CircuitBoard size={16} className="text-sci-accent"/> : <Settings size={16} className="text-purple-400"/>}
                   {'配置详情 Configuration'}
                </span>
                <button onClick={() => setDetailOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
             </div>
             
             {/* Drawer Body */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Basic Info Block */}
                <div>
                   <h3 className="text-xs font-bold text-sci-muted uppercase mb-3 flex items-center gap-2">
                      <FileText size={12}/> 基础信息 Meta
                   </h3>
                   <div className="bg-slate-800/30 p-4 rounded border border-slate-700 space-y-4">
                      <div>
                         <label className="text-xs text-slate-500 block mb-1">名称 Identifier</label>
                         <div className="text-sm text-white font-medium select-all">{selectedItem.name}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">类型 Type</label>
                            <div className="text-sm text-slate-200">{selectedItem.type || selectedItem.role || 'General'}</div>
                         </div>
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">状态 Status</label>
                            <div className="text-sm text-emerald-400 flex items-center gap-1"><Check size={12}/> {selectedItem.status || 'Active'}</div>
                         </div>
                      </div>
                      {selectedItem.desc && (
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">描述 Description</label>
                            <div className="text-xs text-slate-300 leading-relaxed">{selectedItem.desc}</div>
                         </div>
                      )}
                   </div>
                </div>

                {/* 2. Dynamic Configuration Block */}
                <div>
                   <h3 className="text-xs font-bold text-sci-muted uppercase mb-3 flex items-center gap-2">
                      <Settings size={12}/> 参数配置 Settings
                   </h3>
                   
                   {/* Model Specific */}
                   {view === 'ai-models' && (
                      <div className="space-y-4 bg-slate-800/30 p-4 rounded border border-slate-700">
                         {/* Default Model Settings */}
                         {!selectedItem.name.includes('Transn Redu') && (
                            <>
                                <div>
                                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Temperature / Parameter Alpha</span> <span className="text-white">0.3</span></div>
                                    <input type="range" className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"/>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Context / Buffer Size</span> <span className="text-white">{selectedItem.context}</span></div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded overflow-hidden">
                                    <div className="w-3/4 bg-purple-500 h-full"></div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="text-xs text-slate-500 block mb-1">System Prompt / Algo Config</label>
                                    <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300 h-20 resize-none font-mono" defaultValue="Configuration parameters or system prompt goes here..."/>
                                </div>
                            </>
                         )}

                         {/* Transn Redu Specific Settings */}
                         {selectedItem.name.includes('Transn Redu') && (
                             <div className="space-y-5 animate-in fade-in">
                                 <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded flex items-center gap-3">
                                    <Zap size={20} className="text-purple-400" />
                                    <div>
                                        <div className="text-sm font-bold text-purple-200">Transn Redu 加速引擎</div>
                                        <div className="text-[10px] text-purple-300/70">高通量模型压缩与迁移学习配置面板</div>
                                    </div>
                                 </div>

                                 <div>
                                    <label className="text-xs text-slate-500 block mb-2 font-bold flex justify-between">
                                        量化精度 Quantization
                                        <span className="text-white bg-slate-700 px-1.5 rounded">{transnConfig.quantization}</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['FP16', 'INT8', 'INT4', 'NF4'].map(mode => (
                                            <button 
                                                key={mode}
                                                onClick={() => setTransnConfig({...transnConfig, quantization: mode})}
                                                className={`py-1.5 text-xs rounded border transition-colors ${transnConfig.quantization === mode ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                 </div>

                                 <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 font-bold">剪枝率 Pruning Ratio</span> 
                                        <span className="text-sci-accent">{transnConfig.pruningRatio}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="90" step="5"
                                        value={transnConfig.pruningRatio}
                                        onChange={(e) => setTransnConfig({...transnConfig, pruningRatio: parseInt(e.target.value)})}
                                        className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sci-accent"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                        <span>Lossless</span>
                                        <span>Aggressive</span>
                                    </div>
                                 </div>

                                 <div>
                                    <label className="text-xs text-slate-500 block mb-1">蒸馏教师模型 Teacher Model</label>
                                    <div className="relative">
                                        <select 
                                            value={transnConfig.distillationTeacher}
                                            onChange={(e) => setTransnConfig({...transnConfig, distillationTeacher: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white appearance-none"
                                        >
                                            <option>Gemini 3 Pro</option>
                                            <option>GPT-4o</option>
                                            <option>Claude 3.5 Sonnet</option>
                                        </select>
                                        <Layers size={14} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none"/>
                                    </div>
                                 </div>

                                 <div className="pt-2 border-t border-slate-700/50">
                                     <label className="text-xs text-slate-500 block mb-2">导出目标格式 Target Export</label>
                                     <div className="flex gap-2">
                                         {['ONNX', 'TensorRT', 'GGUF', 'TFLite'].map(fmt => (
                                             <button 
                                                key={fmt} 
                                                onClick={() => setTransnConfig({...transnConfig, exportFormat: fmt})}
                                                className={`flex-1 py-1.5 text-[10px] rounded border transition-colors ${transnConfig.exportFormat === fmt ? 'bg-slate-700 text-white border-slate-500' : 'bg-transparent text-slate-500 border-slate-800'}`}
                                             >
                                                {fmt}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         )}
                      </div>
                   )}

                   {/* Agent Specific */}
                   {view === 'ai-agents' && (
                      <div className="space-y-3 bg-slate-800/30 p-4 rounded border border-slate-700">
                         <div>
                            <label className="text-xs text-slate-500 block mb-1">基座模型 Base Model</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white">
                               <option>{selectedItem.model}</option>
                               <option>Gemini 3 Pro</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-xs text-slate-500 block mb-2">挂载 Skills</label>
                            <div className="flex flex-wrap gap-2">
                               {selectedItem.skills?.map((s:string) => (
                                  <span key={s} className="px-2 py-1 bg-slate-800 rounded border border-slate-600 text-xs text-slate-300 flex items-center gap-1">
                                     {s} <X size={10} className="cursor-pointer hover:text-white"/>
                                  </span>
                               ))}
                               <button className="px-2 py-1 border border-dashed border-slate-600 rounded text-xs text-slate-400 hover:text-white hover:border-slate-400">+ Add</button>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Skill Specific */}
                   {view === 'ai-skills' && (
                      <div className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-[10px] text-slate-400 overflow-x-auto">
                         <p className="text-purple-400">// Interface Definition</p>
                         <p>interface {selectedItem.name}Input {'{'}</p>
                         <p className="pl-4">source: {selectedItem.input};</p>
                         <p>{'}'}</p>
                         <p className="mt-2">interface {selectedItem.name}Output {'{'}</p>
                         <p className="pl-4">result: {selectedItem.output};</p>
                         <p>{'}'}</p>
                      </div>
                   )}
                </div>

                {/* 3. Analytics Block */}
                <div>
                   <h3 className="text-xs font-bold text-sci-muted uppercase mb-3 flex items-center gap-2">
                      <Activity size={12}/> 运行评估 Stats
                   </h3>
                   {selectedItem.name.includes('Transn Redu') ? (
                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-slate-800/30 rounded border border-slate-700 p-3">
                               <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Gauge size={10}/> Compression Ratio</div>
                               <div className="text-xl font-mono text-white">4.2<span className="text-sm text-slate-500">x</span></div>
                           </div>
                           <div className="bg-slate-800/30 rounded border border-slate-700 p-3">
                               <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Activity size={10}/> Inference Speedup</div>
                               <div className="text-xl font-mono text-sci-accent">285<span className="text-sm text-slate-500">%</span></div>
                           </div>
                       </div>
                   ) : (
                       <div className="bg-slate-800/30 rounded border border-slate-700 p-4 h-32 flex items-center justify-center relative">
                          <div className="flex items-end gap-1 h-20 w-full px-4">
                             {[40, 60, 45, 70, 85, 60, 75, 50, 65, 55, 80, 70].map((h, i) => (
                                <div key={i} style={{height: `${h}%`}} className="flex-1 bg-purple-500/20 hover:bg-purple-500/50 rounded-t transition-colors cursor-pointer" title={`Day ${i+1}: ${h} calls`}></div>
                             ))}
                          </div>
                          <div className="absolute top-2 right-2 text-[10px] text-slate-500">Call Volume (14d)</div>
                       </div>
                   )}
                </div>

                {/* 4. Governance Footer */}
                <div className="bg-amber-900/10 border border-amber-900/30 rounded p-3 flex items-start gap-3">
                   <ShieldCheck size={16} className="text-amber-500 mt-0.5 shrink-0"/>
                   <div>
                      <div className="text-xs font-bold text-amber-500 mb-1">合规性检查 Compliance</div>
                      <p className="text-[10px] text-amber-200/70 leading-relaxed">
                         此资源受 "Level 2 Data Policy" 约束。输出结果将自动进行 PII 脱敏处理。
                      </p>
                   </div>
                </div>
             </div>

             {/* Drawer Footer Actions */}
             <div className="p-4 border-t border-slate-700 bg-slate-900/80 flex gap-3 sticky bottom-0">
                <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20">
                   <Play size={14}/> 测试运行 Test Run
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm border border-slate-600 transition-colors">
                   保存配置 Save
                </button>
             </div>
          </div>
       )}
    </div>
  );
};
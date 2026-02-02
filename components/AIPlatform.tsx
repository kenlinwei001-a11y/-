import React, { useState, useEffect } from 'react';
import { 
  Brain, CircuitBoard, Library, ServerCog, Sparkles, ShieldCheck, 
  Search, Plus, Filter, MoreVertical, X, Check, Activity, Play,
  FileText, Settings, AlertTriangle, Workflow, Code2, ArrowLeft,
  Calendar, User, Zap, Layers, Gauge, Network, Share2, ZoomIn, ZoomOut,
  Scale, BookOpen, Download, Eye, FileCode, File
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
  // 1. 大气领域 (Atmosphere)
  { id: 'alg-atm-1', name: 'WRF-Chem (大气化学传输)', type: 'Atmosphere', context: '-', cost: 'High', status: 'Active', tags: ['CTM', 'Simulation'], desc: '在线耦合的气象化学模式，模拟气溶胶与光化学反应。' },
  { id: 'alg-atm-2', name: 'CMAQ (多尺度空气质量)', type: 'Atmosphere', context: '-', cost: 'High', status: 'Active', tags: ['EPA', 'Regional'], desc: '美国 EPA 开发的第三代空气质量模型系统。' },
  { id: 'alg-atm-3', name: '高斯烟羽模型 (Gaussian)', type: 'Atmosphere', context: '-', cost: 'Free', status: 'Active', tags: ['Diffusion', 'Point Source'], desc: '适用于连续点源排放的稳态扩散模型。' },
  { id: 'alg-atm-4', name: 'ST-GNN (时空图神经网络)', type: 'Atmosphere', context: '-', cost: '$$', status: 'Active', tags: ['AI', 'Graph'], desc: '捕捉监测站点时空依赖关系的深度学习模型。' },
  
  // 2. 固废领域 (Solid Waste)
  { id: 'alg-sol-1', name: '系统动力学 (SD Model)', type: 'Solid Waste', context: '-', cost: 'Low', status: 'Active', tags: ['System', 'Policy'], desc: '模拟固废管理系统内各要素的反馈回路与动态演化。' },
  { id: 'alg-sol-2', name: '混合整数规划 (MILP)', type: 'Solid Waste', context: '-', cost: '$', status: 'Active', tags: ['Optimization', 'Siting'], desc: '用于处理废弃物设施选址与容量分配的优化算法。' },
  { id: 'alg-sol-3', name: 'VRP (车辆路径问题)', type: 'Solid Waste', context: '-', cost: '$$', status: 'Active', tags: ['Logistics', 'Heuristic'], desc: '优化垃圾清运车辆的收集路线与调度。' },
  
  // 3. 水环境领域 (Water)
  { id: 'alg-wat-1', name: 'MIKE (水动力学模型)', type: 'Water', context: '-', cost: '$$$', status: 'Active', tags: ['Hydro', 'DHI'], desc: '模拟河流、湖泊、河口及海岸水动力及水质变化。' },
  { id: 'alg-wat-2', name: 'SWAT (流域评估工具)', type: 'Water', context: '-', cost: 'Free', status: 'Active', tags: ['Basin', 'Hydrology'], desc: '预测流域土地管理措施对水、泥沙和农业化学物质的影响。' },
  { id: 'alg-wat-3', name: 'WASP (水质分析模拟)', type: 'Water', context: '-', cost: 'Free', status: 'Active', tags: ['WQ', 'EPA'], desc: '模拟水体中污染物的归趋与输移，涵盖富营养化与有毒物质。' },
  { id: 'alg-wat-4', name: 'CNN (遥感反演模型)', type: 'Water', context: '-', cost: '$$', status: 'Active', tags: ['AI', 'Vision'], desc: '基于卷积神经网络从卫星图像反演叶绿素a与悬浮物。' },

  // 4. 通用领域 (General)
  { id: 'alg-gen-1', name: '蒙特卡洛模拟 (Monte Carlo)', type: 'General', context: '-', cost: '$', status: 'Active', tags: ['Uncertainty', 'Risk'], desc: '通过随机采样进行不确定性分析与风险评估。' },
  { id: 'alg-gen-2', name: '贝叶斯网络 (Bayesian)', type: 'General', context: '-', cost: '$', status: 'Active', tags: ['Causal', 'Inference'], desc: '用于处理不确定性知识推理与参数更新的概率图模型。' },
  { id: 'alg-gen-3', name: 'Granger 因果检验', type: 'General', context: '-', cost: 'Free', status: 'Active', tags: ['Statistics', 'Causal'], desc: '分析时间序列数据间是否存在统计学上的因果关系。' },
  { id: 'alg-gen-4', name: 'LSTM (长短期记忆网络)', type: 'General', context: '-', cost: '$$', status: 'Active', tags: ['AI', 'Time Series'], desc: '适用于处理和预测时间序列中间隔和延迟较长的事件。' },
  { id: 'alg-gen-5', name: 'PMF (正定矩阵因子分解)', type: 'General', context: '-', cost: 'Free', status: 'Active', tags: ['Source', 'Receptor'], desc: '广泛应用于大气与水体污染源解析的受体模型。' },
];

const workflows = [
  { id: 'wf1', name: '大气重污染应急预案推演', nodes: 6, status: 'Production', updated: '2h ago', author: 'Dr. Wang', desc: '基于 WRF-Chem 的 72 小时污染物扩散模拟与管控措施评估。' },
  { id: 'wf2', name: '水质异常溯源诊断', nodes: 5, status: 'Draft', updated: '1d ago', author: 'Team Water', desc: '利用贝叶斯网络反演上游排污口贡献占比。' },
  { id: 'wf3', name: '碳排放清单动态更新', nodes: 5, status: 'Active', updated: '3d ago', author: 'Emission Grp', desc: '多源数据融合更新城市级 CO2 排放清单。' },
  { id: 'wf4', name: '卫星遥感热点扫描', nodes: 4, status: 'Active', updated: '1w ago', author: 'RS Center', desc: '基于 MODIS/Landsat 的地面热异常点自动识别与火点监测。' },
];

const agents = [
  // 大气环境 Agent
  { id: 'atm-1', name: '空气质量预测 Agent', role: '未来污染水平判断', skills: ['多模型融合', '时序预测'], model: 'Gemini 3 Pro', status: 'Active', desc: '基于气象场与排放清单，进行未来 72 小时污染物浓度预测。' },
  { id: 'atm-2', name: '污染成因分析 Agent', role: '找“谁导致了污染”', skills: ['源解析', '因果推断'], model: 'DeepSeek-Reasoning', status: 'Active', desc: '利用 PMF 与传输矩阵分析污染来源（工业/交通/扬尘）。' },
  { id: 'atm-3', name: '减排情景评估 Agent', role: '哪种政策更有效', skills: ['情景推演', '多目标优化'], model: 'Gemini 3 Pro', status: 'Idle', desc: '评估不同减排力度（如限产 30%）对空气质量改善的贡献。' },
  { id: 'atm-4', name: '应急扩散 Agent', role: '突发事故响应', skills: ['快速仿真', '风险划界'], model: 'WRF-LLM-Adapter', status: 'Active', desc: '针对突发泄漏事故，快速预测有毒气体扩散范围与撤离路径。' },

  // 固废管理 Agent
  { id: 'sol-1', name: '固废产生预测 Agent', role: '量的预判', skills: ['趋势回归', '人口关联分析'], model: 'Gemini 3 Flash', status: 'Active', desc: '基于城市发展数据预测未来中长期固废产生量趋势。' },
  { id: 'sol-2', name: '设施规划 Agent', role: '投什么、建多大', skills: ['空间选址', '容量规划'], model: 'Gemini 3 Pro', status: 'Idle', desc: '综合考虑运输成本与环境邻避效应，推荐最优设施选址。' },
  { id: 'sol-3', name: '清运调度 Agent', role: '怎么运最优', skills: ['路径规划 (VRP)', '运力调度'], model: 'DeepSeek-Reasoning', status: 'Active', desc: '动态优化垃圾收运车辆路径，降低物流成本与碳排放。' },
  { id: 'sol-4', name: '风险管控 Agent', role: '风险是否可控', skills: ['不确定性评估', '风险矩阵'], model: 'Gemini 3 Pro', status: 'Active', desc: '评估填埋场渗滤液泄漏或焚烧厂排放超标的环境风险。' },

  // 水环境 Agent
  { id: 'wat-1', name: '水质预测 Agent', role: '水质是否达标', skills: ['水动力耦合', 'LSTM'], model: 'Gemini 3 Pro', status: 'Active', desc: '预测断面水质（TN/TP/COD）未来变化趋势及达标情况。' },
  { id: 'wat-2', name: '富营养化评估 Agent', role: '藻华风险', skills: ['生态动力学', '遥感反演'], model: 'Vision-Pollution-Detect', status: 'Active', desc: '监测与推演湖库藻类生长趋势，预警水华爆发风险。' },
  { id: 'wat-3', name: '源-汇分析 Agent', role: '污染从哪来', skills: ['负荷估算', '溯源追踪'], model: 'DeepSeek-Reasoning', status: 'Idle', desc: '解析流域内点源与面源污染负荷贡献，定位关键污染源。' },
  { id: 'wat-4', name: '治理方案 Agent', role: '怎么治理', skills: ['方案生成', '成本效益分析'], model: 'Gemini 3 Pro', status: 'Active', desc: '对比工程措施（截污纳管）与非工程措施（生态补水）的治理效果。' },
];

const skills = [
  // 1. 通用基础 Skills
  { id: 'gen-1', name: '数据同化 Skill', type: '通用', input: 'Obs + Model', output: 'Fused State', version: 'v2.1', desc: '多源数据融合 (Kalman/Bayesian)' },
  { id: 'gen-2', name: '时序预测 Skill', type: '通用', input: 'History', output: 'Future', version: 'v3.0', desc: '时间序列外推 (ARIMA/LSTM)' },
  { id: 'gen-3', name: '空间建模 Skill', type: '通用', input: 'Points', output: 'Field', version: 'v1.5', desc: '空间关联学习 (GNN/Kriging)' },
  { id: 'gen-4', name: '不确定性分析 Skill', type: '通用', input: 'Model Out', output: 'Conf. Interval', version: 'v1.0', desc: '置信区间评估 (Monte Carlo)' },
  { id: 'gen-5', name: '情景生成 Skill', type: '通用', input: 'Rules', output: 'Params', version: 'v2.0', desc: '参数组合生成 (Rule+Sampling)' },
  { id: 'gen-6', name: '因果分析 Skill', type: '通用', input: 'Time Series', output: 'DAG', version: 'v1.2', desc: '成因归因 (Granger/DAG)' },
  { id: 'gen-7', name: '模型融合 Skill', type: '通用', input: 'Multi-Res', output: 'Consensus', version: 'v4.0', desc: '多模型集成 (Ensemble)' },
  { id: 'gen-8', name: '解释性分析 Skill', type: '通用', input: 'Blackbox', output: 'SHAP', version: 'v1.1', desc: '结果可解释性分析 (SHAP)' },

  // 2. 大气领域 Skills
  { id: 'atm-1', name: '气象驱动生成 Skill', type: '大气', input: 'Reanalysis', output: 'Met Field', version: 'v5.0', desc: '气象驱动场构建 (WRF)' },
  { id: 'atm-2', name: '污染扩散计算 Skill', type: '大气', input: 'Emission', output: 'Concentration', version: 'v3.2', desc: '污染扩散模拟 (Gaussian/CTM)' },
  { id: 'atm-3', name: '排放情景构建 Skill', type: '大气', input: 'Policy', output: 'Inventory', version: 'v2.1', desc: '政策假设建模 (排放清单)' },
  { id: 'atm-4', name: 'CTM 推演 Skill', type: '大气', input: 'Inventory', output: 'AQI Grid', version: 'v5.3', desc: '空气质量推演 (CMAQ/CAMx)' },
  { id: 'atm-5', name: '偏差订正 Skill', type: '大气', input: 'Raw Out', output: 'Corrected', version: 'v1.0', desc: '模拟结果偏差订正 (ML)' },

  // 3. 固废领域 Skills
  { id: 'sol-1', name: '产生量预测 Skill', type: '固废', input: 'Socio-Econ', output: 'Volume', version: 'v1.2', desc: '固废增长预测 (Regression/SD)' },
  { id: 'sol-2', name: '系统演化推演 Skill', type: '固废', input: 'SD Model', output: 'State', version: 'v2.0', desc: '长期结构变化推演 (System Dynamics)' },
  { id: 'sol-3', name: '选址优化 Skill', type: '固废', input: 'GIS+Cost', output: 'Locations', version: 'v1.5', desc: '设施布局优化 (MILP)' },
  { id: 'sol-4', name: '运力调度 Skill', type: '固废', input: 'Demand', output: 'Routes', version: 'v3.1', desc: '运力路线调度 (VRP)' },
  { id: 'sol-5', name: '风险评估 Skill', type: '固废', input: 'Hazard', output: 'Risk Matrix', version: 'v1.0', desc: '危废风险评估 (Monte Carlo)' },

  // 4. 水环境领域 Skills
  { id: 'wat-1', name: '水动力计算 Skill', type: '水环境', input: 'Bathymetry', output: 'Flow Field', version: 'v4.0', desc: '水动力流场模拟 (MIKE/EFDC)' },
  { id: 'wat-2', name: '水质演化 Skill', type: '水环境', input: 'Hydro', output: 'TN/TP', version: 'v2.2', desc: '水质演化预测 (WASP)' },
  { id: 'wat-3', name: '富营养化推演 Skill', type: '水环境', input: 'Nutrients', output: 'Algae', version: 'v1.3', desc: '富营养化/藻类响应 (AQUATOX)' },
  { id: 'wat-4', name: '流域负荷计算 Skill', type: '水环境', input: 'Landuse', output: 'Load', version: 'v2.5', desc: '流域入湖负荷计算 (SWAT)' },
  { id: 'wat-5', name: '遥感反演 Skill', type: '水环境', input: 'Sat Image', output: 'WQ Params', version: 'v3.0', desc: '水质参数遥感反演 (CNN)' },
];

// --- Mock Data for Knowledge Base ---

const techDocs = [
  { id: 'd1', name: 'WRF-Chem User Guide v4.4.pdf', type: 'PDF', size: '12.5 MB', author: 'NCAR/NOAA', date: '2023-08-15' },
  { id: 'd2', name: '珠江流域水动力参数率定报告.docx', type: 'DOCX', size: '4.2 MB', author: 'Project Team', date: '2023-11-20' },
  { id: 'd3', name: 'CMAQ v5.3.2 Operational Guidance.pdf', type: 'PDF', size: '8.1 MB', author: 'US EPA', date: '2021-06-10' },
  { id: 'd4', name: 'PMF 5.0 Fundamentals & Input Prep.pdf', type: 'PDF', size: '3.6 MB', author: 'Sonoma Tech', date: '2019-03-12' },
  { id: 'd5', name: 'EFDC_Explorer_Model_Grid_Specs.json', type: 'JSON', size: '128 KB', author: 'Grid Team', date: '2024-01-05' },
  { id: 'd6', name: 'DeepSeek-Reasoning Model Card.md', type: 'MD', size: '45 KB', author: 'AI Lab', date: '2024-02-01' },
];

const policies = [
  { id: 'p1', code: 'GB 3095-2025', name: '环境空气质量标准 (2025修订单)', department: '生态环境部', date: '2025-06-01', status: '即将实施', desc: '进一步收紧PM2.5年均浓度限值，新增超细颗粒物监测要求。' },
  { id: 'p2', code: 'GB 3838-2026', name: '地表水环境质量标准 (2026版)', department: '生态环境部', date: '2026-01-01', status: '征求意见稿', desc: '强化新型污染物管控，调整流域生态流量保障指标体系。' },
  { id: 'p3', code: 'HJ 633-2025', name: '环境空气质量指数（AQI）技术规定 v2', department: '生态环境部', date: '2025-03-15', status: '现行', desc: '优化重污染天气预警分级标准，与人体健康风险更紧密挂钩。' },
  { id: 'p4', code: '十五五规划', name: '“十五五”生态环境保护规划纲要', department: '国务院', date: '2026-03-10', status: '规划', desc: '明确2026-2030年深入打好污染防治攻坚战的新目标与路线图。' },
  { id: 'p5', code: 'Beautiful China', name: '美丽中国建设 2035 行动计划', department: '国务院', date: '2025-09-20', status: '实施中', desc: '面向2035年生态环境根本好转的长期战略部署与重点工程。' },
];

// Mock Knowledge Graph Data
const mockGraphData: Record<string, {nodes: any[], links: any[]}> = {
  'default': {
     nodes: [
        { id: 1, label: '珠江口', type: 'Region', r: 25, x: 400, y: 300, color: '#0EA5E9' },
        { id: 2, label: '总氮 (TN)', type: 'Pollutant', r: 15, x: 250, y: 200, color: '#EF4444' },
        { id: 3, label: '总磷 (TP)', type: 'Pollutant', r: 15, x: 250, y: 400, color: '#EF4444' },
        { id: 4, label: '工业废水', type: 'Source', r: 20, x: 100, y: 300, color: '#F59E0B' },
        { id: 5, label: '截污纳管工程', type: 'Action', r: 20, x: 550, y: 200, color: '#10B981' },
        { id: 6, label: '水质达标', type: 'Outcome', r: 18, x: 700, y: 300, color: '#8B5CF6' },
        { id: 7, label: 'GB 3838-2002', type: 'Standard', r: 15, x: 400, y: 150, color: '#6366F1' },
     ],
     links: [
        { source: 4, target: 2, label: 'emits' },
        { source: 4, target: 3, label: 'emits' },
        { source: 2, target: 1, label: 'pollutes' },
        { source: 3, target: 1, label: 'pollutes' },
        { source: 5, target: 4, label: 'reduces' },
        { source: 5, target: 6, label: 'contributes' },
        { source: 7, target: 2, label: 'regulates' },
     ]
  }
};

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
        <CircuitBoard size={16} className={`shrink-0 ${agent.id.startsWith('atm') ? 'text-blue-400' : agent.id.startsWith('sol') ? 'text-amber-400' : 'text-cyan-400'}`}/> 
        {agent.name}
     </td>
     <td className="px-4 py-3 text-slate-300 text-xs font-medium">{agent.role}</td>
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
           agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
        }`}>{agent.status}</span>
     </td>
  </tr>
);

const CategoryCard = ({ icon: Icon, title, desc, count, color, onClick }: any) => (
  <div onClick={onClick} className="bg-sci-surface/40 border border-slate-700 p-6 rounded-lg cursor-pointer hover:border-sci-accent/50 hover:bg-slate-800 transition-all group relative animate-in zoom-in-95 duration-300">
     <div className={`p-3 rounded-lg w-fit mb-4 bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon size={24} className={color} />
     </div>
     <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
     <p className="text-sm text-slate-400 mb-4">{desc}</p>
     <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3">
        <span>{count} items</span>
        <span className="flex items-center gap-1 group-hover:text-white transition-colors">Enter <ArrowLeft size={12} className="rotate-180"/></span>
     </div>
  </div>
);

// --- Knowledge Graph Visualization Component ---

const KnowledgeGraphViewer = ({ data, onClose, title }: { data: {nodes: any[], links: any[]}, onClose: () => void, title: string }) => {
   const [showSources, setShowSources] = useState(false);

   // Mock sources linked to the graph
   const sources = [
      { id: 'src1', name: '珠江口水质监测报告_2023.pdf', type: 'PDF', confidence: 'High' },
      { id: 'src2', name: 'GB 3838-2002 标准文档.txt', type: 'TXT', confidence: '100%' },
      { id: 'src3', name: 'Expert_Knowledge_Base_v2.db', type: 'DB', confidence: 'Medium' }
   ];

   // Simple SVG based graph renderer
   return (
      <div className="h-full flex flex-col animate-in fade-in relative">
         {/* Toolbar */}
         <div className="h-12 border-b border-slate-700 flex items-center justify-between px-2 shrink-0 bg-sci-panel">
            <div className="flex items-center gap-3">
               <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft size={18}/>
               </button>
               <span className="font-bold text-white flex items-center gap-2">
                  <Network size={16} className="text-indigo-400"/> {title}
               </span>
               <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 border border-slate-700">Graph View</span>
            </div>
            <div className="flex gap-2">
               <button 
                  onClick={() => setShowSources(!showSources)}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-2 ${showSources ? 'bg-sci-accent text-white border-sci-accent' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
               >
                  <FileText size={14}/> 查看源文件 Source Files
               </button>
               <div className="h-4 w-px bg-slate-700 self-center mx-1"></div>
               <button className="p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white"><ZoomIn size={14}/></button>
               <button className="p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white"><ZoomOut size={14}/></button>
               <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded border border-indigo-500/50">Export JSON</button>
            </div>
         </div>

         <div className="flex-1 relative flex overflow-hidden">
            {/* Canvas */}
            <div className="flex-1 bg-[#050505] relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
               <svg className="w-full h-full pointer-events-none">
                  <defs>
                     <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
                     </marker>
                  </defs>
                  
                  {/* Links */}
                  {data.links.map((link, i) => {
                     const source = data.nodes.find(n => n.id === link.source);
                     const target = data.nodes.find(n => n.id === link.target);
                     if(!source || !target) return null;
                     return (
                        <g key={i}>
                           <line 
                              x1={source.x} y1={source.y} 
                              x2={target.x} y2={target.y} 
                              stroke="#334155" strokeWidth="1" 
                              markerEnd="url(#arrow)"
                           />
                           <text x={(source.x + target.x)/2} y={(source.y + target.y)/2 - 5} textAnchor="middle" fill="#64748b" fontSize="10" className="bg-black">{link.label}</text>
                        </g>
                     );
                  })}

                  {/* Nodes */}
                  {data.nodes.map((node, i) => (
                     <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto">
                        <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} fillOpacity="0.2" stroke={node.color} strokeWidth="2" />
                        <circle cx={node.x} cy={node.y} r="4" fill={node.color} />
                        <text x={node.x} y={node.y + node.r + 15} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">{node.label}</text>
                        <text x={node.x} y={node.y + node.r + 28} textAnchor="middle" fill="#94a3b8" fontSize="10">{node.type}</text>
                     </g>
                  ))}
               </svg>
               
               {/* Info Overlay */}
               <div className="absolute top-4 left-4 p-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg max-w-xs pointer-events-none">
                  <h4 className="text-sm font-bold text-white mb-2">Graph Stats</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-400">
                     <div>Nodes: <span className="text-white">{data.nodes.length}</span></div>
                     <div>Edges: <span className="text-white">{data.links.length}</span></div>
                     <div>Density: <span className="text-emerald-400">0.45</span></div>
                     <div>Communities: <span className="text-white">3</span></div>
                  </div>
               </div>
            </div>

            {/* Source Files Sidebar */}
            {showSources && (
               <div className="w-80 bg-sci-panel border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-200 z-10 shadow-xl">
                  <div className="p-4 border-b border-slate-800 font-bold text-white text-sm bg-slate-900/50 flex items-center justify-between">
                     <span>图谱溯源 (Provenance)</span>
                     <button onClick={() => setShowSources(false)} className="text-slate-400 hover:text-white"><X size={14}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/30">
                     <p className="text-[10px] text-slate-500 mb-2">以下文件为当前知识图谱实体与关系的抽取来源：</p>
                     {sources.map(src => (
                        <div key={src.id} className="p-3 bg-slate-800/80 rounded border border-slate-700 hover:border-sci-accent/50 cursor-pointer group transition-all hover:bg-slate-800">
                           <div className="flex items-start gap-3 mb-2">
                              <div className="p-1.5 bg-blue-500/10 rounded text-blue-400 mt-0.5">
                                 <File size={14}/>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-xs font-bold text-white truncate group-hover:text-sci-accent transition-colors" title={src.name}>{src.name}</div>
                                 <div className="text-[10px] text-slate-500 mt-0.5">{src.type} Document</div>
                              </div>
                           </div>
                           <div className="flex justify-between items-center text-[10px] border-t border-slate-700/50 pt-2 mt-1">
                              <span className="text-slate-500">Extraction Confidence</span>
                              <span className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 rounded">{src.confidence}</span>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-[10px] text-center text-slate-500">
                     Click on a file to view raw content extraction.
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

// --- Main Component ---

export const AIPlatform: React.FC<AIPlatformProps> = ({ view }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  
  // Knowledge Base State
  const [knowledgeTab, setKnowledgeTab] = useState<'overview' | 'tech' | 'policy' | 'graph'>('overview');
  
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
                        <th className="px-4 py-3">Agent 名称 (Name)</th>
                        <th className="px-4 py-3">决策目标 (Goal)</th>
                        <th className="px-4 py-3">基座模型 (Model)</th>
                        <th className="px-4 py-3">关键能力 (Skills)</th>
                        <th className="px-4 py-3">状态 (Status)</th>
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
                           <div className="text-[10px] text-slate-500 mt-1">{s.type}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );
      case 'ai-knowledge':
         if (knowledgeTab === 'graph') {
             return <KnowledgeGraphViewer 
                data={mockGraphData['default']} 
                title="环境领域知识图谱 (Environmental Ontology)"
                onClose={() => setKnowledgeTab('overview')} 
             />;
         }

         if (knowledgeTab === 'tech') {
            return (
               <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between mb-4">
                     <button onClick={() => setKnowledgeTab('overview')} className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={16}/> 返回知识库
                     </button>
                     <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white hover:bg-slate-700">Filter</button>
                        <button className="px-3 py-1.5 bg-sci-accent text-white rounded text-xs flex items-center gap-2"><Plus size={14}/> Upload Doc</button>
                     </div>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-blue-400"/> 技术文件库 (Technical Documents)</h2>
                  <div className="bg-sci-surface/30 border border-slate-700 rounded-lg overflow-hidden">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-xs uppercase text-sci-muted font-bold">
                           <tr>
                              <th className="px-6 py-4">文件名称 Name</th>
                              <th className="px-6 py-4">类型 Type</th>
                              <th className="px-6 py-4">大小 Size</th>
                              <th className="px-6 py-4">作者/来源 Author</th>
                              <th className="px-6 py-4">日期 Date</th>
                              <th className="px-6 py-4 text-right">操作</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                           {techDocs.map(doc => (
                              <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                                 <td className="px-6 py-3 font-medium text-slate-200 flex items-center gap-2">
                                    {doc.type === 'PDF' ? <FileText size={16} className="text-red-400"/> : doc.type === 'JSON' ? <FileCode size={16} className="text-yellow-400"/> : <FileText size={16} className="text-blue-400"/>}
                                    {doc.name}
                                 </td>
                                 <td className="px-6 py-3 text-slate-400 text-xs">{doc.type}</td>
                                 <td className="px-6 py-3 text-slate-400 text-xs font-mono">{doc.size}</td>
                                 <td className="px-6 py-3 text-slate-300 text-xs">{doc.author}</td>
                                 <td className="px-6 py-3 text-slate-500 text-xs font-mono">{doc.date}</td>
                                 <td className="px-6 py-3 text-right">
                                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"><Download size={14}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            );
         }

         if (knowledgeTab === 'policy') {
             return (
               <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between mb-4">
                     <button onClick={() => setKnowledgeTab('overview')} className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={16}/> 返回知识库
                     </button>
                     <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-500"/>
                        <input type="text" placeholder="搜索标准号、法规名称..." className="bg-slate-900 border border-slate-700 rounded pl-9 py-1.5 text-xs text-white focus:border-purple-500 outline-none w-64"/>
                     </div>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Scale className="text-purple-400"/> 政策法规库 (Policies & Standards)</h2>
                  <div className="grid grid-cols-1 gap-4">
                     {policies.map(p => (
                        <div key={p.id} className="bg-sci-surface/30 border border-slate-700 p-4 rounded-lg hover:border-slate-500 transition-all flex justify-between items-start">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="text-xs font-mono text-purple-300 bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-500/30">{p.code}</span>
                                 <h3 className="font-bold text-white text-sm">{p.name}</h3>
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.status === '现行' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>{p.status}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 mb-2">{p.desc}</p>
                              <div className="text-[10px] text-slate-500 flex gap-4">
                                 <span>发布部门: {p.department}</span>
                                 <span>实施日期: {p.date}</span>
                              </div>
                           </div>
                           <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700 hover:bg-slate-700"><Eye size={16}/></button>
                        </div>
                     ))}
                  </div>
               </div>
             );
         }

         // Overview Mode
         return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in h-full items-start pt-10">
               <CategoryCard 
                  icon={FileText} 
                  title="技术文件 Technical Docs" 
                  desc="环境模型用户手册、参数率定报告、技术白皮书与算法说明文档。" 
                  count={techDocs.length} 
                  color="text-blue-400"
                  onClick={() => setKnowledgeTab('tech')}
               />
               <CategoryCard 
                  icon={Scale} 
                  title="政策法规 Policies" 
                  desc="国家环境标准 (GB)、行业规范 (HJ)、政策文件与行动计划库。" 
                  count={policies.length} 
                  color="text-purple-400"
                  onClick={() => setKnowledgeTab('policy')}
               />
               <CategoryCard 
                  icon={Network} 
                  title="知识图谱 Knowledge Graph" 
                  desc="基于本体构建的环境领域实体关系网络，支持可视化探索与推理。" 
                  count="12.4k" 
                  color="text-emerald-400"
                  onClick={() => setKnowledgeTab('graph')}
               />
               
               <div className="lg:col-span-3 mt-8 p-6 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                  <h3 className="text-sm font-bold text-slate-400 mb-2">RAG 检索增强生成状态</h3>
                  <div className="flex justify-center gap-8 text-xs">
                     <div className="flex flex-col gap-1">
                        <span className="text-slate-500">Vector Index</span>
                        <span className="text-emerald-400 font-mono">Ready</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-slate-500">Last Sync</span>
                        <span className="text-white font-mono">10 min ago</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-slate-500">Total Chunks</span>
                        <span className="text-white font-mono">842,109</span>
                     </div>
                  </div>
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
        case 'ai-models': return { title: '模型库', desc: '统一管理通用大模型与环境机理模型' };
        case 'ai-algorithms': return { title: '算法库', desc: '统一管理统计分析与数值计算算法' };
        case 'ai-workflows': return { title: '工作流', desc: '查看与管理所有环境模拟与数据处理工作流' };
        case 'ai-agents': return { title: '智能体', desc: '定义 Agent 角色、任务目标与协同策略' };
        case 'ai-skills': return { title: 'Skills', desc: '原子化能力封装，供 Agent 与 Workflow 调用' };
        case 'ai-knowledge': return { title: '知识库', desc: '包含技术文档、政策法规与领域知识图谱' };
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

                   {/* Skill Specific (Enhanced) */}
                   {view === 'ai-skills' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">输入/输出定义 I/O Spec</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="block text-[10px] text-slate-500 mb-1">Input Source</span>
                                    <code className="block bg-slate-900 px-2 py-1 rounded text-emerald-400 font-mono border border-slate-800">{selectedItem.input}</code>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-slate-500 mb-1">Output Artifact</span>
                                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-400 font-mono border border-slate-800">{selectedItem.output}</code>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase flex justify-between">
                                运行时参数 Runtime Params
                                <span className="text-[10px] bg-slate-700 text-white px-1.5 rounded">Configurable</span>
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">Max Concurrency</span>
                                    <input type="number" className="w-16 bg-slate-900 border border-slate-700 rounded px-1 text-right text-white" defaultValue={5} />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">Timeout (ms)</span>
                                    <input type="number" className="w-16 bg-slate-900 border border-slate-700 rounded px-1 text-right text-white" defaultValue={30000} />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">Cache Result</span>
                                    <div className="w-8 h-4 bg-emerald-500/20 border border-emerald-500/50 rounded-full relative cursor-pointer">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-[10px] text-slate-400 overflow-x-auto">
                            <p className="text-slate-500 mb-1"># API Invocation Example</p>
                            <p className="text-blue-400">await <span className="text-yellow-200">client</span>.skills.invoke({'{'}</p>
                            <p className="pl-4">id: <span className="text-green-300">'{selectedItem.id}'</span>,</p>
                            <p className="pl-4">input: data_payload</p>
                            <p className="text-blue-400">{'}'});</p>
                         </div>
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
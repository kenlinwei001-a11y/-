import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, Brain, Database, Workflow, CircuitBoard, Map, 
  Layers, Plus, Trash2, Server, Sparkles, FileText, ChevronRight, Link2, FileJson, Globe, Code2, MousePointerClick,
  MapPin, Tag
} from 'lucide-react';
import { Project } from '../types';

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Project) => void;
}

const steps = [
  { id: 1, title: '项目概况与定义', icon: Map, desc: '设定行政区划与模拟目标' },
  { id: 2, title: '场景编排与数据', icon: Workflow, desc: '构建计算流程并挂载数据源' },
];

// Available assets to select in the Low Code Editor (Translated)
const availableAssets = {
  data: [
    { id: 'd1', name: '国控站点实时监测流 (API)', source: '生态环境部' },
    { id: 'd2', name: '葵花-8号 (Himawari-8) 气溶胶光学厚度', source: '卫星遥感中心' },
    { id: 'd3', name: 'ERA5 全球气象再分析场', source: 'ECMWF' },
    { id: 'd4', name: '本地工业源排放清单 (2023)', source: '本地数据库' },
  ],
  models: [
    { id: 'm1', name: 'WRF-Chem (在线耦合模式)', type: '机理模型' },
    { id: 'm2', name: 'CMAQ (空气质量模型)', type: '机理模型' },
    { id: 'm3', name: 'DeepSeek-Reasoning (环境大模型)', type: 'AI 推演' },
    { id: 'm4', name: 'EFDC (水动力水质模型)', type: '机理模型' },
  ],
  algos: [
    { id: 'a1', name: 'PMF 受体模型源解析', lang: 'Python' },
    { id: 'a2', name: '克里金时空插值 (Kriging)', lang: 'R' },
    { id: 'a3', name: '异常数据清洗 (Outlier Detection)', lang: 'Python' },
  ],
  agents: [
    { id: 'ag1', name: '数据治理专员 (Data Guardian)', role: '质量控制' },
    { id: 'ag2', name: '应急决策顾问 (Policy Reasoner)', role: '决策支持' },
  ]
};

// Geography Data Mock
const provinces = ['广东省', '河北省', '江苏省', '浙江省', '四川省'];
const cities: Record<string, string[]> = {
    '广东省': ['广州市', '深圳市', '佛山市', '东莞市'],
    '河北省': ['石家庄市', '唐山市', '保定市', '雄安新区'],
    '江苏省': ['南京市', '苏州市', '无锡市'],
};
const districts: Record<string, string[]> = {
    '广州市': ['天河区', '越秀区', '黄埔区', '南沙区'],
    '佛山市': ['顺德区', '南海区', '禅城区'],
    '唐山市': ['路北区', '曹妃甸区', '丰南区'],
};

interface WizardNode {
  id: string;
  label: string;
  type: 'data' | 'model' | 'algorithm' | 'agent';
  x: number;
  y: number;
  config?: any; // Stores the selected specific asset
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Atmosphere', // 'Atmosphere' | 'Water' | 'Soil'
    category: 'Assessment', // Project Category
    scale: 'City',
    province: '',
    city: '',
    district: '',
  });
  
  // State for Step 2 (Low Code Editor)
  const [workflowNodes, setWorkflowNodes] = useState<WizardNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(c => c + 1);
    } else {
      // Finalize
      onCreate({
        id: `proj-${Date.now()}`,
        name: formData.name || '未命名仿真项目',
        code: `PROJ-${Math.floor(Math.random()*1000)}`,
        region: `${formData.city || formData.province} ${formData.district}`,
        type: formData.type as any,
        status: 'Active',
        health: 100,
        lastModified: '刚刚',
        description: `类型: ${formData.category} | 尺度: ${formData.scale}`
      });
      onClose();
    }
  };

  // Drag & Drop Simulation: Add generic node
  const addGenericNode = (type: 'data' | 'model' | 'algorithm' | 'agent') => {
    const labels = { data: '数据节点', model: '模型节点', algorithm: '算法节点', agent: '智能体节点' };
    const newNode: WizardNode = {
      id: `n-${Date.now()}`,
      label: labels[type], // Initial generic label
      type: type,
      x: 50 + (workflowNodes.length * 120),
      y: 100 + (workflowNodes.length % 2 === 0 ? 0 : 40)
    };
    setWorkflowNodes([...workflowNodes, newNode]);
    setSelectedNodeId(newNode.id); // Auto select to prompt config
  };

  const updateNodeConfig = (nodeId: string, asset: any) => {
    setWorkflowNodes(nodes => nodes.map(n => 
      n.id === nodeId ? { ...n, label: asset.name, config: asset } : n
    ));
  };

  const removeNode = (id: string) => {
    setWorkflowNodes(nodes => nodes.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right fade-in">
            {/* Project Basics */}
            <div className="bg-slate-800/30 p-4 rounded border border-slate-700 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-sci-muted uppercase mb-2">项目名称</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-sci-accent outline-none text-sm"
                    placeholder="例如：2024年珠江流域枯水期水质达标模拟"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sci-muted uppercase mb-2">业务类型</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Assessment">环境影响评价 (EIA)</option>
                      <option value="Emergency">突发环境事件应急响应</option>
                      <option value="Planning">环境规划与达标方案</option>
                      <option value="Research">科学研究与机理分析</option>
                      <option value="Traceability">污染溯源与归因</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sci-muted uppercase mb-2">模拟介质</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Atmosphere">大气环境 (Atmosphere)</option>
                      <option value="Water">地表水环境 (Surface Water)</option>
                      <option value="Soil">土壤与地下水 (Soil & GW)</option>
                      <option value="Ocean">海洋环境 (Ocean)</option>
                    </select>
                  </div>
                </div>
            </div>

            {/* Geographic Scope */}
            <div className="bg-slate-800/30 p-4 rounded border border-slate-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-sci-accent"/>
                    <span className="text-sm font-bold text-white">行政区划与空间尺度</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                   <div>
                      <label className="block text-xs text-slate-500 mb-1">省份 / 直辖市</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        value={formData.province}
                        onChange={e => setFormData({...formData, province: e.target.value, city: '', district: ''})}
                      >
                         <option value="">请选择省份</option>
                         {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs text-slate-500 mb-1">地级市</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        value={formData.city}
                        disabled={!formData.province}
                        onChange={e => setFormData({...formData, city: e.target.value, district: ''})}
                      >
                         <option value="">请选择城市</option>
                         {formData.province && cities[formData.province]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs text-slate-500 mb-1">区 / 县</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        value={formData.district}
                        disabled={!formData.city}
                        onChange={e => setFormData({...formData, district: e.target.value})}
                      >
                         <option value="">(可选) 全市范围</option>
                         {formData.city && districts[formData.city]?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                </div>

                <div>
                   <label className="block text-xs text-slate-500 mb-1">管控空间尺度</label>
                   <div className="grid grid-cols-4 gap-2">
                      {['区域级 (Cluster)', '城市级 (City)', '园区级 (Park)', '断面/点位 (Point)'].map(s => (
                         <button 
                            key={s}
                            onClick={() => setFormData({...formData, scale: s})}
                            className={`py-2 text-xs rounded border transition-colors ${
                                formData.scale === s 
                                ? 'bg-sci-accent/20 border-sci-accent text-white' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                         >
                            {s}
                         </button>
                      ))}
                   </div>
                </div>
            </div>
            
            <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 text-xs text-amber-200/80 flex gap-2">
               <Tag size={14} className="mt-0.5 shrink-0"/>
               系统将根据选择的区域自动加载相应的基础地理信息（路网、水系、DEM）和背景排放清单。
            </div>
          </div>
        );
      case 2:
         const selectedNode = workflowNodes.find(n => n.id === selectedNodeId);
         
         return (
            <div className="flex h-[500px] border border-slate-700 rounded-lg overflow-hidden animate-in slide-in-from-right fade-in bg-slate-900/50">
               {/* Left: Generic Toolbox */}
               <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-4 z-10">
                  <div className="text-[10px] text-slate-500 font-bold uppercase rotate-[-90deg] mb-2 tracking-widest">工具箱</div>
                  <button onClick={() => addGenericNode('data')} className="p-3 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 hover:text-blue-200 transition relative group" title="数据节点">
                     <Database size={20}/>
                     <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">数据接入</span>
                  </button>
                  <button onClick={() => addGenericNode('model')} className="p-3 bg-purple-900/30 text-purple-400 rounded hover:bg-purple-900/50 hover:text-purple-200 transition relative group" title="模型节点">
                     <Server size={20}/>
                     <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">计算模型</span>
                  </button>
                  <button onClick={() => addGenericNode('algorithm')} className="p-3 bg-emerald-900/30 text-emerald-400 rounded hover:bg-emerald-900/50 hover:text-emerald-200 transition relative group" title="算法节点">
                     <Code2 size={20}/>
                     <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">数理算法</span>
                  </button>
                  <button onClick={() => addGenericNode('agent')} className="p-3 bg-amber-900/30 text-amber-400 rounded hover:bg-amber-900/50 hover:text-amber-200 transition relative group" title="智能体节点">
                     <CircuitBoard size={20}/>
                     <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">智能体</span>
                  </button>
               </div>

               {/* Center: Canvas */}
               <div className="flex-1 bg-[#0B0F19] relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5" onClick={() => setSelectedNodeId(null)}>
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  
                  {workflowNodes.length === 0 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                        <Workflow size={48} className="mb-2 opacity-20"/>
                        <p className="text-xs">从左侧工具箱拖拽节点构建流程，并在右侧挂载数据源</p>
                     </div>
                  )}

                  {/* SVG Connections (Simple Linear for Wizard) */}
                  <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full">
                     {workflowNodes.map((node, i) => {
                        if (i === 0) return null;
                        const prev = workflowNodes[i-1];
                        return (
                           <path 
                              key={`link-${i}`}
                              d={`M ${prev.x + 100} ${prev.y + 25} C ${prev.x + 150} ${prev.y + 25}, ${node.x - 50} ${node.y + 25}, ${node.x} ${node.y + 25}`}
                              fill="none"
                              stroke="#475569"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                           />
                        )
                     })}
                  </svg>

                  {/* Render Nodes */}
                  {workflowNodes.map((node, index) => (
                     <div 
                        key={node.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                        className={`absolute w-[120px] p-2 rounded border shadow-lg backdrop-blur-sm transition-all cursor-pointer ${
                           node.id === selectedNodeId ? 'ring-2 ring-white/50 scale-105 z-20' : 'z-10'
                        } ${
                           node.type === 'data' ? 'bg-blue-900/40 border-blue-500/50 text-blue-100' :
                           node.type === 'model' ? 'bg-purple-900/40 border-purple-500/50 text-purple-100' :
                           node.type === 'algorithm' ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-100' :
                           'bg-amber-900/40 border-amber-500/50 text-amber-100'
                        }`}
                        style={{ left: node.x, top: node.y }}
                     >
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] uppercase opacity-70 font-bold">
                               {node.type === 'data' ? '数据' : node.type === 'model' ? '模型' : node.type === 'algorithm' ? '算法' : 'Agent'}
                           </span>
                           <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-slate-400 hover:text-white"><Trash2 size={10}/></button>
                        </div>
                        <div className="text-xs font-medium truncate mt-1" title={node.label}>
                           {node.label}
                        </div>
                        {/* Status if configured */}
                        {node.config ? (
                            <div className="mt-1 flex items-center gap-1 text-[8px] text-green-400 opacity-80"><Check size={8}/> 已配置</div>
                        ) : (
                            <div className="mt-1 flex items-center gap-1 text-[8px] text-amber-400 opacity-80 animate-pulse"><MousePointerClick size={8}/> 点击配置</div>
                        )}
                        
                        {/* Connector Dot */}
                        <div className="absolute -right-1 top-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
                        {index > 0 && <div className="absolute -left-1 top-1/2 w-2 h-2 rounded-full bg-slate-400"></div>}
                     </div>
                  ))}
               </div>

               {/* Right: Component Configuration (Context Aware) */}
               {selectedNode ? (
                   <div className="w-72 bg-sci-panel border-l border-slate-700 p-4 flex flex-col animate-in slide-in-from-right duration-200">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700">
                         <div className={`p-1.5 rounded ${
                             selectedNode.type === 'data' ? 'bg-blue-500/20 text-blue-400' :
                             selectedNode.type === 'model' ? 'bg-purple-500/20 text-purple-400' :
                             'bg-slate-700 text-slate-300'
                         }`}>
                             {selectedNode.type === 'data' ? <Database size={16}/> : selectedNode.type === 'model' ? <Server size={16}/> : <Code2 size={16}/>}
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-white capitalize">节点配置</h4>
                             <p className="text-[10px] text-slate-400">选择具体的资源实现</p>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                          <label className="text-xs text-slate-500 mb-2 block uppercase font-bold">
                              {selectedNode.type === 'data' ? '可用数据源' : selectedNode.type === 'model' ? '可用模型库' : '可用算法库'}
                          </label>
                          <div className="space-y-2">
                             {/* Dynamic List based on Node Type */}
                             {selectedNode.type === 'data' && availableAssets.data.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-blue-900/30 border-blue-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                                        <span>来源: {item.source}</span>
                                     </div>
                                 </div>
                             ))}
                             {selectedNode.type === 'model' && availableAssets.models.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-purple-900/30 border-purple-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500 mt-1">{item.type}</div>
                                 </div>
                             ))}
                             {selectedNode.type === 'algorithm' && availableAssets.algos.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-emerald-900/30 border-emerald-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500 mt-1">{item.lang}</div>
                                 </div>
                             ))}
                             {selectedNode.type === 'agent' && availableAssets.agents.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-amber-900/30 border-amber-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500 mt-1">{item.role}</div>
                                 </div>
                             ))}
                          </div>
                      </div>
                   </div>
               ) : (
                   <div className="w-72 bg-sci-panel border-l border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                       <MousePointerClick size={32} className="text-slate-600 mb-2"/>
                       <p className="text-xs text-slate-500">请点击画布中的节点<br/>进行参数配置</p>
                   </div>
               )}
            </div>
         );
      default:
         return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[960px] bg-sci-panel border border-slate-700 rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900/80">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-sci-accent text-white rounded"><Plus size={16}/></div>
             <span className="font-bold text-white">新建仿真项目 (Project Wizard)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-slate-800/50">
           <div className="flex items-center justify-between relative max-w-lg mx-auto">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-700 -z-10"></div>
              {steps.map((step) => {
                 const isActive = currentStep >= step.id;
                 const isCurrent = currentStep === step.id;
                 return (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-sci-panel px-4 z-10">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive ? 'bg-sci-accent border-sci-accent text-white' : 'bg-slate-800 border-slate-600 text-slate-500'
                       }`}>
                          <step.icon size={14}/>
                       </div>
                       <span className={`text-[10px] font-medium ${isCurrent ? 'text-sci-accent' : 'text-slate-500'}`}>{step.title}</span>
                    </div>
                 )
              })}
           </div>
           <div className="text-center mt-2 text-xs text-slate-400">
               {steps.find(s => s.id === currentStep)?.desc}
           </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[500px]">
           {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex justify-between">
           <button 
              onClick={() => setCurrentStep(c => Math.max(1, c - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-2"
           >
              <ArrowRight size={14} className="rotate-180"/> 上一步
           </button>
           <button 
              onClick={handleNext}
              className="px-6 py-2 bg-sci-accent hover:bg-sky-600 text-white rounded text-sm font-bold flex items-center gap-2 shadow-lg shadow-sky-900/20"
           >
              {currentStep === 2 ? '完成创建并初始化' : '下一步'} <ArrowRight size={16}/>
           </button>
        </div>
      </div>
    </div>
  );
};

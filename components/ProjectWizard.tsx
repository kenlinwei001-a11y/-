import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, Brain, Database, Workflow, CircuitBoard, Map, 
  Layers, Plus, Trash2, Server, Sparkles, FileText, ChevronRight, Link2, FileJson, Globe, Code2, MousePointerClick
} from 'lucide-react';
import { Project } from '../types';

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Project) => void;
}

const steps = [
  { id: 1, title: '项目定义', icon: Map, desc: '定义模拟目标、区域与介质' },
  { id: 2, title: '数据接入', icon: Database, desc: '配置 GIS、监测站与遥感源' },
  { id: 3, title: '工作流编排', icon: Workflow, desc: '低代码构建计算流程' },
];

// Available assets to select in the Low Code Editor
const availableAssets = {
  data: [
    { id: 'd1', name: '国控站点监测流', source: 'API' },
    { id: 'd2', name: 'Himawari-8 AOD', source: 'Satellite' },
    { id: 'd3', name: 'ERA5 气象再分析', source: 'File' },
  ],
  models: [
    { id: 'm1', name: 'WRF-Chem (Online)', type: 'Physics' },
    { id: 'm2', name: 'CMAQ (Offline)', type: 'Physics' },
    { id: 'm3', name: 'DeepSeek-Reasoning', type: 'AI' },
  ],
  algos: [
    { id: 'a1', name: 'PMF Source Apportionment', lang: 'Python' },
    { id: 'a2', name: 'Kriging Interpolation', lang: 'R' },
  ],
  agents: [
    { id: 'ag1', name: 'Data Guardian', role: 'Governance' },
    { id: 'ag2', name: 'Policy Reasoner', role: 'Decision' },
  ]
};

// Consistent with DataManager mockConnectors (Project Scope)
const availableConnectors = [
  { id: '1', name: '国控站点监测网 API', type: 'API', source: 'MEE_China' },
  { id: '2', name: 'NASA MODIS (Terra/Aqua)', type: 'Satellite', source: 'EarthData' },
  { id: '3', name: '本地排放清单 DB', type: 'Database', source: 'PostgreSQL:5432' },
  { id: '4', name: 'WRF 气象边界条件', type: 'File', source: 'FNL_2023.nc' },
];

interface WizardNode {
  id: string;
  label: string;
  type: 'data' | 'model' | 'algorithm' | 'agent';
  x: number;
  y: number;
  config?: any; // Stores the selected specific asset (e.g. "WRF-Chem")
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Project> & { selectedDataIds: string[] }>({
    name: '',
    type: 'Atmosphere',
    region: 'JingJinJi',
    selectedDataIds: ['1', '3']
  });
  
  // State for Step 3 (Low Code Editor)
  const [workflowNodes, setWorkflowNodes] = useState<WizardNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(c => c + 1);
    } else {
      // Finalize
      onCreate({
        id: `proj-${Date.now()}`,
        name: formData.name || '未命名项目',
        code: `PROJ-${Math.floor(Math.random()*1000)}`,
        region: formData.region || 'Unknown',
        type: formData.type as any,
        status: 'Active',
        health: 100,
        lastModified: 'Just now',
        description: 'Created via Wizard'
      });
      onClose();
    }
  };

  const toggleConnector = (id: string) => {
    const current = formData.selectedDataIds || [];
    if (current.includes(id)) {
        setFormData({ ...formData, selectedDataIds: current.filter(cid => cid !== id) });
    } else {
        setFormData({ ...formData, selectedDataIds: [...current, id] });
    }
  };

  // Drag & Drop Simulation: Add generic node
  const addGenericNode = (type: 'data' | 'model' | 'algorithm' | 'agent') => {
    const labels = { data: 'Data Node', model: 'Model Node', algorithm: 'Algo Node', agent: 'Agent Node' };
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
          <div className="space-y-4 animate-in slide-in-from-right fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">项目名称 Project Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-sci-accent outline-none"
                placeholder="例如：京津冀区域大气重污染过程模拟"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">模拟介质 Medium</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="Atmosphere">Atmosphere (大气)</option>
                  <option value="Water">Water (水环境)</option>
                  <option value="Soil">Soil (土壤)</option>
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">区域尺度 Region</label>
                 <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                    <option>Macro (城市群/流域)</option>
                    <option>Meso (城市/湖泊)</option>
                    <option>Micro (工业区/河段)</option>
                 </select>
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700 text-xs text-slate-400">
               目标设定：预测未来 72 小时 PM2.5 浓度，并进行工业源排放归因分析。
            </div>
          </div>
        );
      case 2:
        return (
           <div className="space-y-4 animate-in slide-in-from-right fade-in">
              <h3 className="text-sm font-bold text-white">选择项目级数据接入 (Project Scope Data)</h3>
              <p className="text-xs text-slate-400 mb-4">从数据中台接入已注册的连接器或数据资产。后续可在工作流中具体调用。</p>
              <div className="grid grid-cols-2 gap-3">
                 {availableConnectors.map((connector) => {
                    const isSelected = formData.selectedDataIds?.includes(connector.id);
                    return (
                        <div 
                           key={connector.id} 
                           onClick={() => toggleConnector(connector.id)}
                           className={`p-3 border rounded cursor-pointer relative transition-all ${
                              isSelected 
                              ? 'border-sci-accent bg-sci-accent/10' 
                              : 'border-slate-700 hover:border-slate-500 bg-slate-800'
                           }`}
                        >
                           {isSelected && <div className="absolute top-2 right-2 text-sci-accent"><Check size={16}/></div>}
                           
                           <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded ${isSelected ? 'text-sci-accent' : 'text-slate-400'}`}>
                                 {connector.type === 'Database' ? <Database size={18}/> : 
                                  connector.type === 'API' ? <Link2 size={18}/> : 
                                  connector.type === 'Satellite' ? <Globe size={18}/> : <FileJson size={18}/>}
                              </div>
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{connector.type}</span>
                           </div>
                           
                           <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{connector.name}</div>
                           <div className="text-xs text-slate-500 mt-1 font-mono">{connector.source}</div>
                        </div>
                    );
                 })}
              </div>
           </div>
        );
      case 3:
         const selectedNode = workflowNodes.find(n => n.id === selectedNodeId);
         
         return (
            <div className="flex h-[500px] border border-slate-700 rounded-lg overflow-hidden animate-in slide-in-from-right fade-in bg-slate-900/50">
               {/* Left: Generic Toolbox */}
               <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-4 z-10">
                  <div className="text-[10px] text-slate-500 font-bold uppercase rotate-[-90deg] mb-2">Tools</div>
                  <button onClick={() => addGenericNode('data')} className="p-3 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 hover:text-blue-200 transition" title="Data Node"><Database size={20}/></button>
                  <button onClick={() => addGenericNode('model')} className="p-3 bg-purple-900/30 text-purple-400 rounded hover:bg-purple-900/50 hover:text-purple-200 transition" title="Model Node"><Server size={20}/></button>
                  <button onClick={() => addGenericNode('algorithm')} className="p-3 bg-emerald-900/30 text-emerald-400 rounded hover:bg-emerald-900/50 hover:text-emerald-200 transition" title="Algorithm Node"><Code2 size={20}/></button>
                  <button onClick={() => addGenericNode('agent')} className="p-3 bg-amber-900/30 text-amber-400 rounded hover:bg-amber-900/50 hover:text-amber-200 transition" title="Agent Node"><CircuitBoard size={20}/></button>
               </div>

               {/* Center: Canvas */}
               <div className="flex-1 bg-[#0B0F19] relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5" onClick={() => setSelectedNodeId(null)}>
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  
                  {workflowNodes.length === 0 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                        <Workflow size={48} className="mb-2 opacity-20"/>
                        <p className="text-xs">Drag & Drop generic nodes from left toolbar</p>
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
                           <span className="text-[9px] uppercase opacity-70 font-bold">{node.type}</span>
                           <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-slate-400 hover:text-white"><Trash2 size={10}/></button>
                        </div>
                        <div className="text-xs font-medium truncate mt-1" title={node.label}>
                           {node.label}
                        </div>
                        {/* Status if configured */}
                        {node.config ? (
                            <div className="mt-1 flex items-center gap-1 text-[8px] text-green-400 opacity-80"><Check size={8}/> Configured</div>
                        ) : (
                            <div className="mt-1 flex items-center gap-1 text-[8px] text-amber-400 opacity-80 animate-pulse"><MousePointerClick size={8}/> Click to set</div>
                        )}
                        
                        {/* Connector Dot */}
                        <div className="absolute -right-1 top-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
                        {index > 0 && <div className="absolute -left-1 top-1/2 w-2 h-2 rounded-full bg-slate-400"></div>}
                     </div>
                  ))}
               </div>

               {/* Right: Component Configuration (Context Aware) */}
               {selectedNode ? (
                   <div className="w-64 bg-sci-panel border-l border-slate-700 p-4 flex flex-col animate-in slide-in-from-right duration-200">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700">
                         <div className={`p-1.5 rounded ${
                             selectedNode.type === 'data' ? 'bg-blue-500/20 text-blue-400' :
                             selectedNode.type === 'model' ? 'bg-purple-500/20 text-purple-400' :
                             'bg-slate-700 text-slate-300'
                         }`}>
                             {selectedNode.type === 'data' ? <Database size={16}/> : selectedNode.type === 'model' ? <Server size={16}/> : <Code2 size={16}/>}
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-white capitalize">{selectedNode.type} Config</h4>
                             <p className="text-[10px] text-slate-400">Select component implementation</p>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                          <label className="text-xs text-slate-500 mb-2 block uppercase font-bold">Available Assets</label>
                          <div className="space-y-2">
                             {/* Dynamic List based on Node Type */}
                             {selectedNode.type === 'data' && availableAssets.data.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-blue-900/30 border-blue-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500">{item.source}</div>
                                 </div>
                             ))}
                             {selectedNode.type === 'model' && availableAssets.models.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-purple-900/30 border-purple-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500">{item.type}</div>
                                 </div>
                             ))}
                             {selectedNode.type === 'algorithm' && availableAssets.algos.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-emerald-900/30 border-emerald-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500">{item.lang}</div>
                                 </div>
                             ))}
                             {selectedNode.type === 'agent' && availableAssets.agents.map(item => (
                                 <div key={item.id} onClick={() => updateNodeConfig(selectedNode.id, item)} className={`p-2 rounded border cursor-pointer hover:bg-slate-800 transition ${selectedNode.config?.id === item.id ? 'bg-amber-900/30 border-amber-500 text-white' : 'border-slate-700 text-slate-300'}`}>
                                     <div className="text-xs font-bold">{item.name}</div>
                                     <div className="text-[10px] text-slate-500">{item.role}</div>
                                 </div>
                             ))}
                          </div>
                      </div>
                   </div>
               ) : (
                   <div className="w-64 bg-sci-panel border-l border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                       <MousePointerClick size={32} className="text-slate-600 mb-2"/>
                       <p className="text-xs text-slate-500">Select a node to configure its component properties</p>
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
      <div className="w-[900px] bg-sci-panel border border-slate-700 rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900/80">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-sci-accent text-white rounded"><Plus size={16}/></div>
             <span className="font-bold text-white">创建新仿真项目 (Wizard)</span>
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
              className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30"
           >
              上一步
           </button>
           <button 
              onClick={handleNext}
              className="px-6 py-2 bg-sci-accent hover:bg-sky-600 text-white rounded text-sm font-bold flex items-center gap-2 shadow-lg shadow-sky-900/20"
           >
              {currentStep === 3 ? '完成并初始化项目' : '下一步'} <ArrowRight size={16}/>
           </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '../types';
import { Play, Save, Plus, FileText, Database, Server, BrainCircuit, Share2, MoreVertical, LayoutTemplate, Activity, Zap, Layers, AlertCircle, Settings } from 'lucide-react';

interface WorkflowEditorProps {
  onRun?: () => void;
  workflowId?: string;
}

// Mock workflow definitions
const workflowDefinitions: Record<string, WorkflowNode[]> = {
  // Atmosphere Emergency
  'wf1': [
    { id: '1', type: 'data', label: '地面监测 (MEE_CN)', x: 50, y: 100, status: 'completed', inputs: [], config: { 'Station Count': 350, 'Freq': '1h' } },
    { id: '2', type: 'data', label: '气象场 (WRF Output)', x: 50, y: 250, status: 'completed', inputs: [], config: { 'Resolution': '3km', 'Domain': 'D03' } },
    { id: '3', type: 'model', label: 'CMAQ v5.3', x: 300, y: 175, status: 'running', inputs: ['1', '2'], config: { 'Mechanism': 'CB05', 'Aero': 'AERO6' } },
    { id: '4', type: 'algorithm', label: '源解析 (ISAM)', x: 550, y: 175, status: 'idle', inputs: ['3'], config: { 'Tags': ['Industry', 'Traffic'] } },
    { id: '5', type: 'decision', label: '管控推演 Agent', x: 800, y: 175, status: 'idle', inputs: ['4'], config: { 'Policy': 'Red Alert', 'Cut': '30%' } },
    { id: '6', type: 'output', label: '应急简报 PDF', x: 1050, y: 175, status: 'idle', inputs: ['5'], config: { 'Template': 'Gov_Standard' } },
  ],
  // Water Source Tracking
  'wf2': [
    { id: '1', type: 'data', label: '流域断面监测', x: 50, y: 150, status: 'completed', inputs: [], config: { 'Parameters': ['TN', 'TP', 'NH3-N'] } },
    { id: '2', type: 'data', label: '排污口在线监测', x: 50, y: 300, status: 'completed', inputs: [], config: { 'Count': 42 } },
    { id: '3', type: 'algorithm', label: 'Kriging 插值', x: 250, y: 225, status: 'completed', inputs: ['1'], config: { 'Variogram': 'Spherical' } },
    { id: '4', type: 'model', label: 'EFDC 水动力', x: 450, y: 225, status: 'idle', inputs: ['3', '2'], config: { 'Grid': 'Curvilinear', 'Layers': 5 } },
    { id: '5', type: 'algorithm', label: '贝叶斯反演', x: 650, y: 225, status: 'idle', inputs: ['4'], config: { 'Prior': 'Gaussian', 'MCMC': '10k' } },
  ],
  // Emission Update
  'wf3': [
    { id: '1', type: 'data', label: '交通流量 (Traffic)', x: 50, y: 100, status: 'idle', inputs: [], config: { 'Source': 'GaoDe API' } },
    { id: '2', type: 'data', label: '工业用电量', x: 50, y: 200, status: 'idle', inputs: [], config: { 'Source': 'State Grid' } },
    { id: '3', type: 'algorithm', label: '时空分配 (Alloc)', x: 300, y: 150, status: 'idle', inputs: ['1', '2'], config: { 'Grid': '1km x 1km' } },
    { id: '4', type: 'data', label: '历史清单库', x: 300, y: 300, status: 'idle', inputs: [], config: { 'Year': 2022 } },
    { id: '5', type: 'output', label: 'Update Inventory', x: 550, y: 225, status: 'idle', inputs: ['3', '4'], config: { 'Format': 'NetCDF' } },
  ],
  // Satellite Hotspot
  'wf4': [
    { id: '1', type: 'data', label: 'MODIS L1B', x: 50, y: 100, status: 'running', inputs: [], config: { 'Bands': [20, 21, 22] } },
    { id: '2', type: 'algorithm', label: '云掩膜 (CloudMask)', x: 250, y: 100, status: 'running', inputs: ['1'], config: { 'Thresh': 0.8 } },
    { id: '3', type: 'algorithm', label: '热异常提取', x: 450, y: 100, status: 'idle', inputs: ['2'], config: { 'Algo': 'Contextual' } },
    { id: '4', type: 'output', label: '火点列表', x: 650, y: 100, status: 'idle', inputs: ['3'], config: { 'Format': 'GeoJSON' } },
  ],
  // Default/New
  'default': [
    { id: '1', type: 'data', label: '输入数据源', x: 50, y: 100, status: 'idle', inputs: [], config: {} },
    { id: '2', type: 'model', label: '处理模型', x: 300, y: 100, status: 'idle', inputs: ['1'], config: {} },
    { id: '3', type: 'output', label: '结果输出', x: 550, y: 100, status: 'idle', inputs: ['2'], config: {} },
  ]
};

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ onRun, workflowId }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    // Load workflow specific nodes or default
    const initialNodes = workflowDefinitions[workflowId || 'default'] || workflowDefinitions['default'];
    setNodes(initialNodes);
    setSelectedNodeId(null);
  }, [workflowId]);

  // Helper to draw bezier curves
  const getPath = (start: WorkflowNode, end: WorkflowNode) => {
    const sx = start.x + 180; // Node width
    const sy = start.y + 40;  // Node height center
    const ex = end.x;
    const ey = end.y + 40;
    
    // Control points for bezier
    const c1x = sx + (ex - sx) / 2;
    const c1y = sy;
    const c2x = ex - (ex - sx) / 2;
    const c2y = ey;

    return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
  };

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'data': return 'border-blue-500/50 bg-blue-900/20 text-blue-200 shadow-blue-900/20';
      case 'model': return 'border-purple-500/50 bg-purple-900/20 text-purple-200 shadow-purple-900/20';
      case 'algorithm': return 'border-emerald-500/50 bg-emerald-900/20 text-emerald-200 shadow-emerald-900/20';
      case 'decision': return 'border-amber-500/50 bg-amber-900/20 text-amber-200 shadow-amber-900/20';
      default: return 'border-slate-500/50 bg-slate-800/50 text-slate-200 shadow-slate-900/20';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'data': return <Database size={16} />;
        case 'model': return <Server size={16} />;
        case 'algorithm': return <BrainCircuit size={16} />;
        case 'decision': return <Share2 size={16} />;
        default: return <FileText size={16} />;
    }
  }

  const getTypeLabel = (type: string) => {
     switch(type) {
        case 'data': return '数据源';
        case 'model': return '机理模型';
        case 'algorithm': return '算法/清洗';
        case 'decision': return '智能决策';
        case 'output': return '输出产物';
        default: return type;
     }
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-full bg-sci-base relative overflow-hidden rounded-lg border border-slate-800 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-800 bg-sci-surface/50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <LayoutTemplate size={16} className="text-sci-accent"/>
             <span className="text-sm font-semibold text-white">工作流编排: {workflowId ? workflowId.toUpperCase() : 'NEW'}</span>
           </div>
           <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-mono">Ver 2.3 (Draft)</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRun}
            className="flex items-center gap-2 bg-sci-accent text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
          >
            <Play size={14} /> 运行全流程
          </button>
          <button className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-700 transition">
            <Save size={14} /> 保存
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 bg-[#0B0F19]" onClick={() => setSelectedNodeId(null)}>
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
        </div>

        {/* SVG Layer for Connections */}
        <svg className="absolute top-0 left-0 w-[1500px] h-[1000px] pointer-events-none z-0">
          <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
             </marker>
          </defs>
          {nodes.map(node => (
            node.inputs.map(inputId => {
              const inputNode = nodes.find(n => n.id === inputId);
              if (inputNode) {
                return (
                  <path
                    key={`${inputId}-${node.id}`}
                    d={getPath(inputNode, node)}
                    stroke="#475569"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-[dash_20s_linear_infinite]" 
                    strokeDasharray="5,5"
                  />
                );
              }
              return null;
            })
          ))}
        </svg>

        {/* Node Elements */}
        <div className="w-[1500px] h-[1000px] relative">
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
              className={`absolute w-[180px] h-[80px] rounded-md border backdrop-blur-md p-3 cursor-pointer transition-all hover:-translate-y-1 z-10 shadow-lg ${
                getNodeStyle(node.type)
              } ${selectedNodeId === node.id ? 'ring-2 ring-white/50 shadow-xl scale-105' : ''}`}
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex items-center justify-between mb-2 opacity-80">
                <span className="text-[10px] font-bold uppercase tracking-wider">{getTypeLabel(node.type)}</span>
                {getIcon(node.type)}
              </div>
              <div className="font-medium text-xs leading-tight line-clamp-2">{node.label}</div>
              
              {/* Status Dot */}
              <div className="absolute top-2 right-2">
                 <span className={`flex h-2 w-2 rounded-full shadow-sm ${
                    node.status === 'running' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                    node.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                    'bg-slate-600'
                 }`}></span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Node Palette (Floating) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 bg-sci-panel/90 border border-slate-700 p-2 rounded-lg backdrop-blur shadow-xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase text-center mb-1">工具箱</div>
          <button className="p-2 bg-slate-800 rounded border border-slate-700 text-blue-400 hover:bg-slate-700 hover:text-white transition" title="添加数据节点"><Database size={16} /></button>
          <button className="p-2 bg-slate-800 rounded border border-slate-700 text-purple-400 hover:bg-slate-700 hover:text-white transition" title="添加模型节点"><Server size={16} /></button>
          <button className="p-2 bg-slate-800 rounded border border-slate-700 text-emerald-400 hover:bg-slate-700 hover:text-white transition" title="添加算法节点"><BrainCircuit size={16} /></button>
          <div className="h-px bg-slate-700 my-1"></div>
          <button className="p-2 bg-slate-800 rounded border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition" title="更多"><Plus size={16} /></button>
      </div>

       {/* Properties Panel (Right Slide-in) */}
       {selectedNode && (
          <div className="absolute top-0 right-0 w-80 h-full bg-sci-panel border-l border-slate-800 shadow-2xl animate-in slide-in-from-right flex flex-col z-20">
             <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
               <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${getNodeStyle(selectedNode.type).split(' ')[1]}`}>
                     {getIcon(selectedNode.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">节点配置 Details</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{getTypeLabel(selectedNode.type)}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-white"><MoreVertical size={16}/></button>
             </div>
             
             <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Basic Meta */}
                <div className="space-y-3">
                   <div>
                       <label className="text-xs text-slate-500 block mb-1">节点名称 Node Label</label>
                       <input type="text" value={selectedNode.label} readOnly className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white" />
                   </div>
                   <div>
                       <label className="text-xs text-slate-500 block mb-1">节点 ID</label>
                       <div className="text-xs font-mono text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800">{selectedNode.id}</div>
                   </div>
                </div>

                {/* Dynamic Configuration */}
                {selectedNode.config && (
                  <div className="pt-2 border-t border-slate-700/50">
                     <div className="flex items-center gap-2 mb-3">
                        <Settings size={12} className="text-sci-accent"/>
                        <span className="text-xs font-bold text-white uppercase">参数设置 Parameters</span>
                     </div>
                     <div className="bg-slate-900/50 rounded border border-slate-700 p-3 space-y-3">
                        {Object.entries(selectedNode.config).map(([key, value]) => (
                           <div key={key}>
                              <label className="text-[10px] text-slate-400 block mb-1">{key}</label>
                              {Array.isArray(value) ? (
                                  <div className="flex flex-wrap gap-1">
                                      {value.map((v:any, i:number) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-[10px] text-slate-300">{v}</span>
                                      ))}
                                  </div>
                              ) : (
                                  <input type="text" value={value as string} readOnly className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-sci-accent font-mono" />
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-2 border-t border-slate-700/50">
                   <div className="flex items-center gap-2 mb-3">
                      <Activity size={12} className="text-emerald-400"/>
                      <span className="text-xs font-bold text-white uppercase">运行状态 Runtime</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
                         <div className="text-[10px] text-slate-500">Duration</div>
                         <div className="text-xs font-mono text-white">45ms</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-700 text-center">
                         <div className="text-[10px] text-slate-500">Memory</div>
                         <div className="text-xs font-mono text-white">128MB</div>
                      </div>
                   </div>
                   {selectedNode.status === 'error' && (
                       <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded flex gap-2 items-start">
                           <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0"/>
                           <span className="text-[10px] text-red-300">Timeout waiting for upstream data.</span>
                       </div>
                   )}
                </div>
             </div>

             <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded border border-slate-600 mb-2">查看完整日志 (Logs)</button>
             </div>
          </div>
       )}
    </div>
  );
};
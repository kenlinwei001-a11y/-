import React, { useState } from 'react';
import { 
  Database, Link2, RefreshCw, FileCode, Table, Play, Settings, Plus, 
  CheckCircle, AlertCircle, FileJson, ArrowLeft, Save, Server, 
  Globe, HardDrive, Wifi, Cloud, FileDigit, Cpu, ShieldCheck,
  ChevronRight, Radio
} from 'lucide-react';
import { DataConnector, ETLJob } from '../types';

const mockConnectors: DataConnector[] = [
  { id: '1', name: '国控站点监测网 API', type: 'API', status: 'Connected', lastSync: '2 min ago', source: 'MEE_China' },
  { id: '2', name: 'NASA MODIS (Terra/Aqua)', type: 'Satellite', status: 'Syncing', lastSync: 'Running...', source: 'EarthData' },
  { id: '3', name: '本地排放清单 DB', type: 'Database', status: 'Connected', lastSync: '1 day ago', source: 'PostgreSQL:5432' },
  { id: '4', name: 'WRF 气象边界条件', type: 'File', status: 'Error', lastSync: 'Failed (Size Limit)', source: 'FNL_2023.nc' },
];

const mockEtlJobs: ETLJob[] = [
  { id: 'j1', name: 'API 数据清洗与插值', sourceId: '1', targetId: 'DB_Clean', status: 'Running', schedule: 'Every 1h', lastRun: 'In progress' },
  { id: 'j2', name: '卫星数据重采样 (Regrid)', sourceId: '2', targetId: 'Raster_Store', status: 'Idle', schedule: 'Daily 02:00', lastRun: 'Success' },
  { id: 'j3', name: '排放源空间分配', sourceId: '3', targetId: 'Model_Input', status: 'Failed', schedule: 'Manual', lastRun: 'Error: Mapping' },
];

// --- Data Source Definitions ---

interface SourceType {
  id: string;
  name: string;
  category: 'Database' | 'IoT' | 'File' | 'Remote Sensing' | 'Public';
  icon: any;
  desc: string;
}

const sourceTypes: SourceType[] = [
  // Database
  { id: 'pg', name: 'PostgreSQL / PostGIS', category: 'Database', icon: Database, desc: '支持地理空间数据的关系型数据库，适用于存储基础地理信息与排放清单。' },
  { id: 'tdengine', name: 'TDengine', category: 'Database', icon:  HardDrive, desc: '高性能物联网时序数据库，适用于海量监测站点数据的高频写入。' },
  { id: 'influx', name: 'InfluxDB', category: 'Database', icon: HardDrive, desc: '广泛使用的开源时序数据库，适合指标监控与趋势分析。' },
  
  // IoT
  { id: 'mqtt', name: 'MQTT Broker', category: 'IoT', icon: Wifi, desc: '标准物联网消息协议，对接各类环境传感器与边缘设备。' },
  { id: 'modbus', name: 'Modbus TCP', category: 'IoT', icon: Cpu, desc: '工业自动化通信协议，常用于排污口在线监测设备 (CEMS)。' },
  
  // Remote Sensing
  { id: 'earthdata', name: 'NASA EarthData', category: 'Remote Sensing', icon: Globe, desc: '访问 NASA EOSDIS 档案，包括 MODIS, VIIRS 气溶胶与火点产品。' },
  { id: 'sentinel', name: 'ESA Sentinel Hub', category: 'Remote Sensing', icon: Globe, desc: '欧洲航天局哨兵系列卫星数据，高分辨率地表覆盖与水色遥感。' },
  
  // File
  { id: 'netcdf', name: 'NetCDF / HDF5', category: 'File', icon: FileCode, desc: '气象与海洋科学标准多维数据格式，用于 WRF/CMAQ 模式输入输出。' },
  { id: 's3', name: 'S3 Object Storage', category: 'File', icon: Cloud, desc: 'AWS S3 兼容的对象存储，用于海量非结构化数据归档。' },
  
  // Public
  { id: 'mee', name: 'MEE 生态环境部 API', category: 'Public', icon: ShieldCheck, desc: '对接国家地表水、环境空气质量自动监测实时发布平台。' },
  { id: 'weather', name: 'Global Weather API', category: 'Public', icon: Cloud, desc: '第三方气象服务接口 (NOAA/OpenWeather)，提供实时与预报数据。' },
];

export const DataManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'etl' | 'preview'>('connectors');
  
  // Creation Wizard State
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  // Helper to filter sources
  const getSourcesByCategory = (cat: string) => sourceTypes.filter(s => s.category === cat);

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus(Math.random() > 0.3 ? 'success' : 'fail');
    }, 1500);
  };

  const handleSaveConnection = () => {
    // Logic to save connection
    setIsCreating(false);
    setCreateStep(1);
    setSelectedSource(null);
    setTestStatus('idle');
  };

  const renderWizardStep1 = () => (
    <div className="animate-in slide-in-from-right fade-in duration-300">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
             <ArrowLeft size={20}/>
          </button>
          <div>
             <h2 className="text-lg font-bold text-white">选择数据源类型</h2>
             <p className="text-xs text-slate-400">Step 1/2: Select Connector Type</p>
          </div>
       </div>

       <div className="space-y-8">
          {['Database', 'IoT', 'Remote Sensing', 'File', 'Public'].map((cat) => (
             <div key={cat}>
                <h3 className="text-xs font-bold text-sci-muted uppercase tracking-wider mb-3 border-b border-slate-800 pb-1">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {getSourcesByCategory(cat).map(source => (
                      <div 
                        key={source.id} 
                        onClick={() => { setSelectedSource(source); setCreateStep(2); }}
                        className="bg-slate-800/40 border border-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-800 hover:border-sci-accent hover:shadow-lg hover:shadow-sci-accent/10 transition-all group"
                      >
                         <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded bg-slate-900 group-hover:bg-sci-accent/20 group-hover:text-sci-accent transition-colors ${selectedSource?.id === source.id ? 'text-sci-accent' : 'text-slate-400'}`}>
                               <source.icon size={20}/>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-sci-accent opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"/>
                         </div>
                         <div className="font-bold text-slate-200 text-sm mb-1">{source.name}</div>
                         <div className="text-xs text-slate-500 leading-relaxed">{source.desc}</div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderWizardStep2 = () => {
     if (!selectedSource) return null;
     
     return (
        <div className="animate-in slide-in-from-right fade-in duration-300 max-w-4xl mx-auto">
           <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
              <button onClick={() => { setCreateStep(1); setTestStatus('idle'); }} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                 <ArrowLeft size={20}/>
              </button>
              <div className="flex-1">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    配置连接: {selectedSource.name}
                    <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{selectedSource.category}</span>
                 </h2>
                 <p className="text-xs text-slate-400">Step 2/2: Configure & Auth</p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-8">
              {/* Form Side */}
              <div className="col-span-2 space-y-6">
                 {/* Common Fields */}
                 <div className="space-y-4 bg-sci-surface/30 p-5 rounded border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Settings size={14} className="text-sci-accent"/> 基础配置 Basic</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1.5">连接名称 (Alias)</label>
                          <input type="text" placeholder="例如：Project_A_Raw_Data" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none"/>
                       </div>
                       
                       {/* Dynamic Fields based on Category */}
                       {selectedSource.category === 'Database' && (
                          <>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">主机地址 (Host)</label>
                                <input type="text" placeholder="127.0.0.1" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none font-mono"/>
                             </div>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">端口 (Port)</label>
                                <input type="text" placeholder="5432" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none font-mono"/>
                             </div>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">用户名 (Username)</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none"/>
                             </div>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">密码 (Password)</label>
                                <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none"/>
                             </div>
                             <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1.5">数据库名 (Database Name)</label>
                                <input type="text" placeholder="env_data_warehouse" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none"/>
                             </div>
                          </>
                       )}

                       {selectedSource.category === 'Remote Sensing' && (
                          <>
                             <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1.5">API Endpoint</label>
                                <input type="text" defaultValue="https://cmr.earthdata.nasa.gov" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none font-mono"/>
                             </div>
                             <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1.5">Token / API Key</label>
                                <input type="password" placeholder="NASA EarthData Token" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none"/>
                             </div>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">卫星平台 (Platform)</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none">
                                   <option>MODIS-Terra</option>
                                   <option>MODIS-Aqua</option>
                                   <option>VIIRS</option>
                                </select>
                             </div>
                             <div className="col-span-1">
                                <label className="block text-xs text-slate-500 mb-1.5">产品级别 (Level)</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none">
                                   <option>L1B (Radiance)</option>
                                   <option>L2 (Geophysical)</option>
                                </select>
                             </div>
                          </>
                       )}

                       {(selectedSource.category === 'IoT' || selectedSource.category === 'Public') && (
                          <>
                             <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1.5">连接地址 (Connection String / URL)</label>
                                <input type="text" placeholder={selectedSource.id === 'mqtt' ? 'tcp://broker.emqx.io:1883' : 'https://api.example.com/v1/sensors'} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none font-mono"/>
                             </div>
                             {selectedSource.id === 'mqtt' && (
                                <div className="col-span-2">
                                   <label className="block text-xs text-slate-500 mb-1.5">订阅主题 (Topic)</label>
                                   <input type="text" placeholder="sensors/air_quality/#" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-sci-accent outline-none font-mono"/>
                                </div>
                             )}
                          </>
                       )}
                    </div>
                 </div>

                 {/* Advanced Options */}
                 <div className="space-y-4 bg-sci-surface/30 p-5 rounded border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><RefreshCw size={14} className="text-purple-400"/> 同步策略 Policy</h3>
                    <div className="flex items-center gap-6">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="sync" defaultChecked className="accent-sci-accent"/>
                          <span className="text-sm text-slate-300">实时流式 (Stream)</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="sync" className="accent-sci-accent"/>
                          <span className="text-sm text-slate-300">定时批量 (Batch)</span>
                       </label>
                    </div>
                    <div className="pt-2">
                       <label className="flex items-center gap-2 text-sm text-slate-400">
                          <input type="checkbox" className="rounded border-slate-700 bg-slate-900 accent-sci-accent"/>
                          开启数据质量校验 (Data Quality Check)
                       </label>
                    </div>
                 </div>
              </div>

              {/* Status Side */}
              <div className="col-span-1 space-y-4">
                 <div className="bg-slate-900 p-4 rounded border border-slate-700 h-full flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">连接测试 Connection Check</h3>
                    
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                       {testStatus === 'idle' && <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center"><Wifi size={24} className="text-slate-500"/></div>}
                       
                       {testStatus === 'testing' && <div className="w-12 h-12 rounded-full border-t-2 border-sci-accent animate-spin"/>}
                       
                       {testStatus === 'success' && (
                          <div className="flex flex-col items-center animate-in zoom-in">
                             <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-2"><CheckCircle size={24} className="text-green-500"/></div>
                             <span className="text-green-400 font-bold text-sm">Connection Successful</span>
                             <span className="text-xs text-slate-500">Latency: 45ms</span>
                          </div>
                       )}
                       
                       {testStatus === 'fail' && (
                          <div className="flex flex-col items-center animate-in shake">
                             <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-2"><AlertCircle size={24} className="text-red-500"/></div>
                             <span className="text-red-400 font-bold text-sm">Connection Failed</span>
                             <span className="text-xs text-slate-500">Timeout / Auth Error</span>
                          </div>
                       )}
                    </div>

                    <button 
                       onClick={handleTestConnection}
                       disabled={testStatus === 'testing'}
                       className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white mb-2 disabled:opacity-50 transition-colors"
                    >
                       {testStatus === 'testing' ? 'Testing...' : '测试连接 Test'}
                    </button>
                    
                    <button 
                       onClick={handleSaveConnection}
                       disabled={testStatus !== 'success'}
                       className="w-full py-2 bg-sci-accent hover:bg-sky-600 rounded text-sm text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 transition-colors shadow-lg"
                    >
                       保存并接入 Connect
                    </button>
                 </div>
              </div>
           </div>
        </div>
     );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       {/* Header Tabs (Hidden when creating) */}
       {!isCreating && (
          <div className="flex border-b border-slate-700">
             <button 
                onClick={() => setActiveTab('connectors')}
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'connectors' ? 'border-sci-accent text-sci-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
             >
                <Link2 size={16}/> 数据连接器 (Connectors)
             </button>
             <button 
                onClick={() => setActiveTab('etl')}
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'etl' ? 'border-sci-accent text-sci-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
             >
                <FileCode size={16}/> ETL 处理流 (Pipeline)
             </button>
             <button 
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'preview' ? 'border-sci-accent text-sci-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
             >
                <Table size={16}/> 数据资产预览 (Data Assets)
             </button>
          </div>
       )}

       {/* Content Area */}
       <div className="min-h-[500px]">
          
          {/* CREATE WIZARD MODE */}
          {isCreating ? (
             <div className="bg-sci-panel border border-slate-700 rounded-lg p-6 shadow-2xl min-h-[600px]">
                {createStep === 1 && renderWizardStep1()}
                {createStep === 2 && renderWizardStep2()}
             </div>
          ) : (
             // NORMAL VIEW MODE
             <>
                {activeTab === 'connectors' && (
                   <div className="space-y-4">
                      <div className="flex justify-end">
                         <button 
                            onClick={() => setIsCreating(true)}
                            className="bg-sci-accent hover:bg-sky-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 shadow-lg transition-colors"
                         >
                            <Plus size={16}/> 新建连接 New Connection
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {mockConnectors.map(c => (
                            <div key={c.id} className="bg-sci-surface/50 border border-slate-700 p-5 rounded-lg hover:border-slate-500 transition-colors group relative">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="p-2 bg-slate-800 rounded text-sci-accent">
                                     {c.type === 'Database' ? <Database size={20}/> : c.type === 'API' ? <Link2 size={20}/> : c.type === 'Satellite' ? <Globe size={20}/> : <FileJson size={20}/>}
                                  </div>
                                  <div className="cursor-pointer text-slate-500 hover:text-white"><Settings size={16}/></div>
                               </div>
                               <h3 className="font-bold text-white text-base mb-1">{c.name}</h3>
                               <div className="text-xs text-slate-400 mb-4 font-mono">{c.source}</div>
                               <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-700/50">
                                  <span className={`flex items-center gap-1.5 ${c.status === 'Connected' ? 'text-emerald-400' : c.status === 'Syncing' ? 'text-blue-400' : 'text-red-400'}`}>
                                     {c.status === 'Syncing' ? <RefreshCw size={12} className="animate-spin"/> : c.status === 'Connected' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                     {c.status}
                                  </span>
                                  <span className="text-slate-500">{c.lastSync}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {activeTab === 'etl' && (
                   <div className="space-y-4">
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-6">
                         <h3 className="text-sm font-bold text-white mb-2">ETL 任务总览</h3>
                         <div className="flex gap-8 text-xs text-slate-400">
                            <div>总任务数: <span className="text-white font-mono text-base">12</span></div>
                            <div>运行中: <span className="text-blue-400 font-mono text-base">2</span></div>
                            <div>失败: <span className="text-red-400 font-mono text-base">1</span></div>
                         </div>
                      </div>

                      <div className="bg-sci-surface/30 rounded-lg overflow-hidden border border-slate-700">
                         <table className="w-full text-sm text-left">
                            <thead className="text-xs text-sci-muted uppercase bg-slate-900/80">
                               <tr>
                                  <th className="px-6 py-3">Pipeline Name</th>
                                  <th className="px-6 py-3">Source &rarr; Target</th>
                                  <th className="px-6 py-3">Schedule</th>
                                  <th className="px-6 py-3">Status</th>
                                  <th className="px-6 py-3">Last Run</th>
                                  <th className="px-6 py-3">Actions</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                               {mockEtlJobs.map(job => (
                                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                                     <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                        <FileCode size={14} className="text-purple-400"/> {job.name}
                                     </td>
                                     <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                                        {job.sourceId} <span className="text-slate-600">-></span> {job.targetId}
                                     </td>
                                     <td className="px-6 py-4 text-slate-400">{job.schedule}</td>
                                     <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] border ${
                                           job.status === 'Running' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                           job.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                           'bg-slate-700 text-slate-300 border-slate-600'
                                        }`}>
                                           {job.status}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 text-slate-500 text-xs">{job.lastRun}</td>
                                     <td className="px-6 py-4">
                                        <button className="p-1 hover:text-white text-slate-400"><Play size={14}/></button>
                                        <button className="p-1 hover:text-white text-slate-400 ml-2"><Settings size={14}/></button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}

                {activeTab === 'preview' && (
                   <div className="flex items-center justify-center h-64 text-slate-500 flex-col gap-3">
                      <Database size={48} className="opacity-20"/>
                      <p>Select a dataset from the Data Warehouse to preview schema and sample rows.</p>
                      <button className="px-4 py-2 border border-slate-700 rounded text-sm hover:bg-slate-800 text-slate-300">Open Data Explorer</button>
                   </div>
                )}
             </>
          )}
       </div>
    </div>
  );
};
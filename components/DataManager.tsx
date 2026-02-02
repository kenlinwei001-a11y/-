import React, { useState } from 'react';
import { Database, Link2, RefreshCw, FileCode, Table, Play, Settings, Plus, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
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

export const DataManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'etl' | 'preview'>('connectors');

  return (
    <div className="space-y-6 animate-in fade-in">
       {/* Header Tabs */}
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

       {/* Content */}
       <div className="min-h-[500px]">
          {activeTab === 'connectors' && (
             <div className="space-y-4">
                <div className="flex justify-end">
                   <button className="bg-sci-accent hover:bg-sky-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 shadow-lg">
                      <Plus size={16}/> 新建连接
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {mockConnectors.map(c => (
                      <div key={c.id} className="bg-sci-surface/50 border border-slate-700 p-5 rounded-lg hover:border-slate-500 transition-colors group relative">
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-800 rounded text-sci-accent">
                               {c.type === 'Database' ? <Database size={20}/> : c.type === 'API' ? <Link2 size={20}/> : <FileJson size={20}/>}
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
       </div>
    </div>
  );
};

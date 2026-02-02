import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Palette, Save, Search, ToggleLeft, ToggleRight, 
  Check, Lock, Eye, Database, Server, RefreshCcw, Monitor,
  Sun, Moon
} from 'lucide-react';

// --- Mock Data ---

const initialUsers = [
  { id: 1, name: 'Dr. Zhang', role: 'Admin', department: 'Environmental Inst.', email: 'zhang@lab.env', status: 'Active', lastLogin: '10 min ago' },
  { id: 2, name: 'Li Wei', role: 'Researcher', department: 'Water Grp', email: 'li.wei@lab.env', status: 'Active', lastLogin: '2 days ago' },
  { id: 3, name: 'Sarah Chen', role: 'Analyst', department: 'Atmosphere Grp', email: 'sarah@lab.env', status: 'Suspended', lastLogin: '1 month ago' },
  { id: 4, name: 'Guest User', role: 'Viewer', department: 'External', email: 'guest@gov.cn', status: 'Active', lastLogin: '1 hour ago' },
];

const permissions = [
  { resource: 'Project: Atmosphere', admin: 'RWX', researcher: 'RW', viewer: 'R' },
  { resource: 'Project: Water', admin: 'RWX', researcher: 'RW', viewer: 'R' },
  { resource: 'Data: Sensitive GIS', admin: 'RW', researcher: 'R', viewer: '-' },
  { resource: 'Data: Satellite L2', admin: 'RW', researcher: 'RW', viewer: 'R' },
  { resource: 'Model: WRF-Chem', admin: 'RWX', researcher: 'X', viewer: '-' },
  { resource: 'System: Logs', admin: 'R', researcher: '-', viewer: '-' },
];

const themes = [
  // Dark Themes
  { id: 'default', type: 'dark', name: 'Deep Space (Default)', base: '#0B0F19', panel: '#111827', surface: '#1E293B', text: '#E2E8F0', muted: '#94A3B8' },
  { id: 'midnight', type: 'dark', name: 'Midnight Green', base: '#022c22', panel: '#064e3b', surface: '#065f46', text: '#e2e8f0', muted: '#94a3b8' },
  { id: 'obsidian', type: 'dark', name: 'Obsidian Gray', base: '#09090b', panel: '#18181b', surface: '#27272a', text: '#e2e8f0', muted: '#a1a1aa' },
  { id: 'nebula', type: 'dark', name: 'Nebula Purple', base: '#1e1b4b', panel: '#312e81', surface: '#3730a3', text: '#e0e7ff', muted: '#818cf8' },
  
  // Light Themes
  { id: 'polar', type: 'light', name: 'Polar Day (Light)', base: '#F0F9FF', panel: '#FFFFFF', surface: '#E0F2FE', text: '#0F172A', muted: '#64748B' },
  { id: 'paper', type: 'light', name: 'Academic Paper (Light)', base: '#FAFAF9', panel: '#FFFFFF', surface: '#F5F5F4', text: '#1C1917', muted: '#78716C' },
];

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'appearance'>('users');
  const [users, setUsers] = useState(initialUsers);
  const [activeTheme, setActiveTheme] = useState('default');

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ));
  };

  const applyTheme = (themeId: string) => {
    setActiveTheme(themeId);
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--sci-base', theme.base);
      document.documentElement.style.setProperty('--sci-panel', theme.panel);
      document.documentElement.style.setProperty('--sci-surface', theme.surface);
      document.documentElement.style.setProperty('--sci-text', theme.text);
      document.documentElement.style.setProperty('--sci-muted', theme.muted);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
       <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-sci-text">系统配置 System Configuration</h2>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 bg-sci-accent text-white text-sm rounded hover:bg-sky-600 transition flex items-center gap-2">
                <Save size={16}/> 保存更改
             </button>
          </div>
       </div>

       {/* Tabs */}
       <div className="flex gap-6 border-b border-slate-700/50">
          <button 
             onClick={() => setActiveTab('users')}
             className={`pb-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'users' ? 'text-sci-accent border-sci-accent' : 'text-sci-muted border-transparent hover:text-sci-text'}`}
          >
             <Users size={16}/> 账号管理 (Account)
          </button>
          <button 
             onClick={() => setActiveTab('permissions')}
             className={`pb-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'permissions' ? 'text-sci-accent border-sci-accent' : 'text-sci-muted border-transparent hover:text-sci-text'}`}
          >
             <Shield size={16}/> 数据权限 (RBAC)
          </button>
          <button 
             onClick={() => setActiveTab('appearance')}
             className={`pb-3 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'appearance' ? 'text-sci-accent border-sci-accent' : 'text-sci-muted border-transparent hover:text-sci-text'}`}
          >
             <Palette size={16}/> 外观与主题 (Appearance)
          </button>
       </div>

       {/* Content */}
       <div className="min-h-[500px]">
          
          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
             <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center bg-sci-surface/50 p-4 rounded border border-slate-700/50">
                   <div className="relative w-64">
                      <Search size={16} className="absolute left-3 top-2.5 text-sci-muted"/>
                      <input type="text" placeholder="搜索用户..." className="w-full bg-sci-base border border-slate-700 rounded pl-9 py-2 text-sm text-sci-text focus:border-sci-accent outline-none"/>
                   </div>
                   <button className="px-3 py-1.5 bg-emerald-600/20 text-emerald-500 border border-emerald-600/50 rounded text-sm hover:bg-emerald-600/30 transition">
                      + 开通新账号
                   </button>
                </div>

                <div className="bg-sci-surface/30 rounded border border-slate-700/50 overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-sci-surface text-xs uppercase text-sci-muted font-bold">
                         <tr>
                            <th className="px-6 py-4">用户 User</th>
                            <th className="px-6 py-4">角色 Role</th>
                            <th className="px-6 py-4">部门 Dept</th>
                            <th className="px-6 py-4">最后登录 Last Login</th>
                            <th className="px-6 py-4">状态 Status</th>
                            <th className="px-6 py-4">操作 Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {users.map(u => (
                            <tr key={u.id} className="hover:bg-sci-surface/80 transition-colors">
                               <td className="px-6 py-4">
                                  <div className="font-medium text-sci-text">{u.name}</div>
                                  <div className="text-xs text-sci-muted">{u.email}</div>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-xs border ${
                                     u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                     u.role === 'Researcher' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                     'bg-slate-700/50 text-slate-300 border-slate-600'
                                  }`}>
                                     {u.role}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-sci-muted">{u.department}</td>
                               <td className="px-6 py-4 text-sci-muted font-mono text-xs">{u.lastLogin}</td>
                               <td className="px-6 py-4">
                                  <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === 'Active' ? 'text-emerald-400' : 'text-sci-muted'}`}>
                                     <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                     {u.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  <button onClick={() => toggleUserStatus(u.id)} className={`flex items-center gap-1 px-3 py-1 rounded border text-xs transition-colors ${
                                     u.status === 'Active' 
                                     ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                                     : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                  }`}>
                                     {u.status === 'Active' ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
                                     {u.status === 'Active' ? '关闭账号' : '开通账号'}
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === 'permissions' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-start gap-3">
                   <Lock size={18} className="text-amber-500 mt-0.5"/>
                   <div>
                      <h4 className="text-sm font-bold text-amber-500 mb-1">权限策略说明 (RBAC)</h4>
                      <p className="text-xs text-amber-500/70">
                         系统采用基于角色的访问控制。'R' = 只读, 'W' = 读写, 'X' = 执行仿真/删除。
                         对敏感地理数据（Sensitive GIS）的访问受到额外审计监控。
                      </p>
                   </div>
                </div>

                <div className="bg-sci-surface/30 rounded border border-slate-700/50 overflow-hidden">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-sci-surface text-xs uppercase text-sci-muted font-bold">
                         <tr>
                            <th className="px-6 py-4 border-r border-slate-800/50">资源 Resource</th>
                            <th className="px-6 py-4 text-center text-purple-400">管理员 Admin</th>
                            <th className="px-6 py-4 text-center text-blue-400">研究员 Researcher</th>
                            <th className="px-6 py-4 text-center text-sci-muted">访客 Viewer</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {permissions.map((p, i) => (
                            <tr key={i} className="hover:bg-sci-surface/80 transition-colors">
                               <td className="px-6 py-4 font-mono text-sci-text border-r border-slate-800/50 flex items-center gap-2">
                                  {p.resource.includes('Data') ? <Database size={14}/> : p.resource.includes('Model') ? <Server size={14}/> : <Monitor size={14}/>}
                                  {p.resource}
                               </td>
                               <td className="px-6 py-4 text-center font-mono font-bold text-sci-text">{p.admin}</td>
                               <td className="px-6 py-4 text-center font-mono text-sci-muted">{p.researcher}</td>
                               <td className="px-6 py-4 text-center font-mono text-sci-muted opacity-50">{p.viewer}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                
                <div className="flex justify-end">
                   <button className="text-sci-accent text-sm hover:underline flex items-center gap-1">
                      <RefreshCcw size={14}/> 重置为默认策略
                   </button>
                </div>
             </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div>
                   <h3 className="text-sm font-bold text-sci-text mb-4">平台背景色选择 (Platform Background)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {themes.map(t => (
                         <div 
                            key={t.id}
                            onClick={() => applyTheme(t.id)}
                            className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col gap-3 transition-all ${activeTheme === t.id ? 'border-sci-accent ring-2 ring-sci-accent/20' : 'border-slate-700/50 hover:border-slate-500'}`}
                            style={{ backgroundColor: t.base }}
                         >
                            <div className="h-20 rounded w-full border border-slate-500/20 relative overflow-hidden shadow-inner" style={{ backgroundColor: t.panel }}>
                               <div className="absolute top-2 left-2 w-8 h-8 rounded" style={{ backgroundColor: t.surface }}></div>
                               <div className="absolute top-2 right-2 w-20 h-2 rounded bg-sci-accent"></div>
                               <div className="absolute bottom-2 left-2 w-12 h-2 rounded" style={{ backgroundColor: t.muted }}></div>
                               <div className="absolute bottom-2 right-2 flex gap-1">
                                  <div className="w-2 h-2 rounded-full bg-sci-accent"></div>
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.text }}></div>
                               </div>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                  {t.type === 'light' ? <Sun size={14} style={{color: t.text}}/> : <Moon size={14} style={{color: t.text}}/>}
                                  <span className="text-sm font-bold" style={{color: t.text}}>{t.name}</span>
                               </div>
                               {activeTheme === t.id && <Check size={16} className="text-sci-accent"/>}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-4 bg-sci-surface/30 border border-slate-700/50 rounded space-y-4">
                   <h3 className="text-sm font-bold text-sci-text">显示设置 Display Settings</h3>
                   <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                      <div>
                         <div className="text-sm text-sci-text">紧凑模式 (Compact Mode)</div>
                         <div className="text-xs text-sci-muted">缩小表格行高与边距，在单屏显示更多信息。</div>
                      </div>
                      <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-slate-400 rounded-full"></div></div>
                   </div>
                   <div className="flex items-center justify-between py-2">
                      <div>
                         <div className="text-sm text-sci-text">高对比度数据可视化 (Accessibility)</div>
                         <div className="text-xs text-sci-muted">增强图表色彩对比度，适配色弱用户。</div>
                      </div>
                      <div className="w-10 h-5 bg-sci-accent rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
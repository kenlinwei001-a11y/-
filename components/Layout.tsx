import React, { useState } from 'react';
import { 
  LayoutDashboard, Settings, Menu, Bell, Cpu, Activity, Bot, PieChart, Map,
  Database, PlayCircle, BarChart2, ChevronDown, Brain, Library, ShieldCheck,
  ServerCog, Sparkles, CircuitBoard, Workflow, Plus, Code2, Network, LayoutGrid, Monitor
} from 'lucide-react';
import { PageId, Project } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  toggleCopilot: () => void;
  copilotOpen: boolean;
  projects: Project[];
  currentProject: Project;
  onProjectChange: (project: Project) => void;
  onNewProject: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activePage, onNavigate, toggleCopilot, copilotOpen,
  projects, currentProject, onProjectChange, onNewProject
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  // Check if current page is within a specific project context (for showing Copilot)
  const isProjectContext = activePage.startsWith('project-') && activePage !== 'project-overview';

  const platformNav = [
    { id: 'platform-dashboard', label: '平台态势总览', icon: LayoutDashboard },
    { id: 'platform-monitor', label: '运行监控中心', icon: Activity },
  ];

  const projectNav = [
    { id: 'project-overview', label: '项目总览', icon: LayoutGrid }, // Gallery
    // { id: 'project-dashboard', label: '项目监控', icon: Monitor }, // Removed as requested
    { id: 'project-data', label: '数据管理', icon: Database },
    { id: 'project-simulation', label: '仿真运行', icon: PlayCircle }, 
  ];

  const aiPlatformNav = [
    { id: 'ai-models', label: '模型库 Model Hub', icon: Brain },
    { id: 'ai-algorithms', label: '算法库 Algo Hub', icon: Code2 },
    { id: 'ai-workflows', label: 'Workflow 池', icon: Workflow },
    { id: 'ai-agents', label: '智能体 Agent', icon: CircuitBoard },
    { id: 'ai-skills', label: 'Skills 能力池', icon: Sparkles },
    { id: 'ai-knowledge', label: '知识与记忆', icon: Library },
    { id: 'ai-ops', label: 'AI 运行监控', icon: ServerCog },
    { id: 'ai-security', label: '安全与治理', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen w-full bg-sci-base text-sci-text font-sans overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r border-slate-800 bg-sci-panel flex flex-col z-20 shadow-xl`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-sci-accent/20 border border-sci-accent flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                <span className="text-sci-accent text-xs font-bold">E</span>
              </div>
              <span className="font-bold tracking-tight text-white text-lg truncate">环境推演模拟<span className="font-light text-sci-muted">OS</span></span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 hover:bg-white/5 rounded text-sci-muted hover:text-white transition-colors">
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-2 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Platform Section */}
          <div>
            {!sidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-sci-muted uppercase tracking-wider">平台层 Platform</div>}
            {platformNav.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id as PageId)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full group mb-1 ${activePage === item.id ? 'bg-sci-accent/10 text-sci-accent border-l-2 border-sci-accent shadow-inner' : 'text-sci-muted hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`} title={sidebarCollapsed ? item.label : ''}>
                <item.icon size={18} className={activePage === item.id ? 'text-sci-accent' : 'group-hover:text-white'} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* Project Section (Business) */}
          <div className="relative">
             {!sidebarCollapsed && (
               <div className="px-3 mb-3">
                 <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-bold text-sci-muted uppercase tracking-wider">项目空间 Project Space</div>
                    <button onClick={onNewProject} className="p-1 bg-sci-accent/20 hover:bg-sci-accent text-sci-accent hover:text-white rounded transition-colors" title="New Project"><Plus size={12}/></button>
                 </div>
                 
                 {/* Project Selector */}
                 <div className="relative">
                    <div 
                      onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                      className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700 cursor-pointer hover:border-sci-accent/50 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full ${currentProject.type === 'Atmosphere' ? 'bg-blue-400' : 'bg-emerald-500'} animate-pulse`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentProject.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{currentProject.code}</div>
                      </div>
                      <ChevronDown size={14} className="text-slate-500"/>
                    </div>
                    
                    {/* Dropdown */}
                    {projectMenuOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-sci-panel border border-slate-700 rounded shadow-xl z-50">
                        {projects.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { onProjectChange(p); setProjectMenuOpen(false); }}
                            className="p-2 hover:bg-slate-800 cursor-pointer flex items-center gap-2 border-b border-slate-800 last:border-0"
                          >
                             <div className={`w-1.5 h-1.5 rounded-full ${p.type === 'Atmosphere' ? 'bg-blue-400' : 'bg-emerald-500'}`}></div>
                             <div className="text-xs text-slate-300 truncate">{p.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               </div>
             )}
             
             {sidebarCollapsed && <div className="h-px bg-slate-800 mx-2 mb-3"></div>}

             {projectNav.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id as PageId)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full group mb-1 ${activePage === item.id ? 'bg-sci-accent/10 text-sci-accent border-l-2 border-sci-accent' : 'text-sci-muted hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`} title={sidebarCollapsed ? item.label : ''}>
                <item.icon size={18} className={activePage === item.id ? 'text-sci-accent' : 'group-hover:text-white'} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* AI Platform Section (Core Engine) */}
          <div>
            {!sidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI 中台 Control Plane</div>}
             {aiPlatformNav.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id as PageId)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full group mb-1 ${activePage === item.id ? 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-500' : 'text-sci-muted hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`} title={sidebarCollapsed ? item.label : ''}>
                <item.icon size={18} className={activePage === item.id ? 'text-purple-400' : 'group-hover:text-white'} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

        </div>

        <div className="p-2 border-t border-slate-800 shrink-0">
           <button 
             onClick={() => onNavigate('system-settings')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 w-full ${activePage === 'system-settings' ? 'bg-slate-700 text-white' : 'text-sci-muted hover:bg-white/5 hover:text-white'}`}
            >
              <Settings size={18} />
              {!sidebarCollapsed && <span className="text-sm font-medium">系统管理 System</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-sci-base relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-sci-base/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-semibold text-white tracking-wide">
               {activePage === 'system-settings' ? '系统管理中心' : activePage.startsWith('platform') ? 'Dashboard' : activePage.startsWith('ai') ? 'AI Control Plane' : activePage === 'project-overview' ? '项目总览' : currentProject.name}
             </h2>
             <span className="text-slate-700 text-lg font-light">|</span>
             <span className="text-sm text-sci-accent font-mono uppercase tracking-wider">
               {
                 activePage === 'platform-dashboard' ? 'GLOBAL VIEW' : 
                 activePage === 'system-settings' ? 'CONFIGURATION' : 
                 activePage === 'project-dashboard' ? 'PROJECT MONITOR' : 
                 projectNav.find(n => n.id === activePage)?.label || 
                 aiPlatformNav.find(n => n.id === activePage)?.label
               }
             </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs font-mono text-sci-muted hidden md:flex">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                <Cpu size={14} className="text-sci-accent" />
                <span>算力: 42%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                <Activity size={14} className="text-sci-success" />
                <span>引擎: 运行中</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
            <button className="relative text-sci-muted hover:text-white"><Bell size={18} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sci-danger rounded-full animate-pulse"></span></button>
            
            {/* Copilot - Only shown in project context (excluding overview) */}
            {isProjectContext && (
              <button onClick={toggleCopilot} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${copilotOpen ? 'bg-sci-accent text-white border-sci-accent shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-slate-900 border-slate-700 text-sci-text hover:border-sci-muted'}`}>
                <Bot size={16} />
                <span className="text-xs font-medium">小智</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto p-6 relative scrollbar-thin scrollbar-track-sci-base scrollbar-thumb-slate-700">
          {children}
        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectBI } from './components/ProjectBI';
import { ProjectGallery } from './components/ProjectGallery';
import { WorkflowEditor } from './components/WorkflowEditor';
import { SimulationView } from './components/SimulationView';
import { AIPlatform } from './components/AIPlatform';
import { Copilot } from './components/Copilot';
import { ProjectWizard } from './components/ProjectWizard';
import { DataManager } from './components/DataManager';
import { SimulationOverlay } from './components/SimulationOverlay';
import { SystemSettings } from './components/SystemSettings';
import { PageId, Project } from './types';

// Initial Projects
const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: '珠江三角洲水环境模拟',
    code: 'PRD-Water-v2.1',
    region: 'Pearl River Delta',
    type: 'Water',
    status: 'Active',
    health: 95,
    lastModified: '2023-10-24',
    description: 'Focus on TN/TP pollution in river networks.'
  },
  {
    id: 'proj-2',
    name: '京津冀大气重污染溯源',
    code: 'JJJ-Air-v3.0',
    region: 'JingJinJi',
    type: 'Atmosphere',
    status: 'Simulating',
    health: 88,
    lastModified: '2023-10-25',
    description: 'Multi-scale PM2.5 and Ozone simulation.'
  }
];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('project-overview');
  const [copilotOpen, setCopilotOpen] = useState(false);
  
  // Project State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentProject, setCurrentProject] = useState<Project>(initialProjects[0]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Global Simulation State
  const [simMode, setSimMode] = useState<'hidden' | 'minimized' | 'maximized'>('hidden');

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setActivePage('project-dashboard');
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setActivePage('project-dashboard');
  };

  const handleStartSimulation = () => {
     // Start simulation creates a floating window
     setSimMode('minimized');
  };

  // Dynamic context for AI
  const getContextData = () => {
    if (activePage.startsWith('ai-')) {
       return `用户正在 AI 中台管理操作。页面：${activePage}。`;
    }
    const projContext = `当前项目：${currentProject.name} (${currentProject.type})。`;
    
    switch (activePage) {
      case 'platform-dashboard': return '用户正在查看平台级态势总览。';
      case 'project-overview': return '用户正在浏览所有进行中的项目。';
      case 'project-dashboard': return `${projContext} 用户在查看项目监控总览。对于大气项目关注 PM2.5/Ozone，对于水项目关注 TN/TP。`;
      case 'project-simulation': return `${projContext} 用户正在进行仿真推演。`;
      case 'project-workflow': return `${projContext} 用户正在编辑和调试工作流。`;
      case 'project-data': return `${projContext} 用户正在管理数据连接器与 ETL 流程。`;
      case 'system-settings': return `用户正在进行系统配置。`;
      default: return projContext;
    }
  };

  const renderContent = () => {
    // Handle AI Platform Routes
    if (activePage.startsWith('ai-')) {
       return <AIPlatform view={activePage} />;
    }

    switch (activePage) {
      case 'platform-dashboard':
      case 'platform-monitor':
      case 'platform-risk':
        return <Dashboard />;
      
      case 'project-overview':
        return <ProjectGallery projects={projects} onSelect={handleProjectSelect} />;

      case 'project-dashboard':
        return <ProjectBI project={currentProject} onNavigate={setActivePage} />;
      
      case 'project-workflow':
        // Map project ID to mock workflow ID
        // proj-1 (Water) -> wf2
        // proj-2 (Atmosphere) -> wf1
        const wfId = currentProject.id === 'proj-1' ? 'wf2' : currentProject.id === 'proj-2' ? 'wf1' : 'default';
        return <WorkflowEditor onRun={handleStartSimulation} workflowId={wfId} />;

      case 'project-simulation':
        // If accessed directly from sidebar, show full view (wrapped in container to match layout)
        return <SimulationView project={currentProject} />;

      case 'project-data':
        return <DataManager />; 
      
      case 'system-settings':
        return <SystemSettings />;
        
      default:
        return <ProjectGallery projects={projects} onSelect={handleProjectSelect} />;
    }
  };

  return (
    <>
      <Layout 
        activePage={activePage} 
        onNavigate={setActivePage}
        toggleCopilot={() => setCopilotOpen(!copilotOpen)}
        copilotOpen={copilotOpen}
        projects={projects}
        currentProject={currentProject}
        onProjectChange={setCurrentProject}
        onNewProject={() => setIsWizardOpen(true)}
      >
        {renderContent()}
      </Layout>
      
      <SimulationOverlay 
        mode={simMode}
        onMaximize={() => setSimMode('maximized')}
        onMinimize={() => setSimMode('minimized')}
        onClose={() => setSimMode('hidden')}
        project={currentProject}
      />

      <Copilot 
        isOpen={copilotOpen} 
        onClose={() => setCopilotOpen(false)} 
        contextData={getContextData()}
      />

      <ProjectWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
};

export default App;
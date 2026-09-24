import { useState, useEffect } from 'react';
import { supabase, type Project, type Fund, type Company, type ReverseCall, type ProjectDraft } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Landing from '@/components/Landing';
import AuthScreen from '@/components/AuthScreen';
import CompanyRegistration from '@/components/CompanyRegistration';
import AppLayout, { type PageId } from '@/components/AppLayout';
import FundsPage from '@/components/FundsPage';
import CallDetail from '@/components/CallDetail';
import ReverseCallsList from '@/components/ReverseCallsList';
import ReverseCallDetail from '@/components/ReverseCallDetail';
import ReverseCallForm from '@/components/ReverseCallForm';
import ProjectsPage from '@/components/ProjectsPage';
import CompanyProfile from '@/components/CompanyProfile';
import CompanyCalls from '@/components/CompanyCalls';
import NewProject from '@/components/NewProject';
import FundMatching from '@/components/FundMatching';
import DocGeneration from '@/components/DocGeneration';

type OverlayView = 'none' | 'new-project' | 'fund-matching' | 'doc-gen' | 'reverse-call-form';

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'registration' | 'app'>('landing');
  const [page, setPage] = useState<PageId>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentFund, setCurrentFund] = useState<Fund | null>(null);
  const [currentReverseCall, setCurrentReverseCall] = useState<ReverseCall | null>(null);
  const [currentDraft, setCurrentDraft] = useState<ProjectDraft | null>(null);
  const [overlayView, setOverlayView] = useState<OverlayView>('none');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        setView('app');
        setPage('home');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setView('landing');
        setCompany(null);
        setCompanyChecked(false);
      }
      // When session exists, the company-check effect will decide the view
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [companyChecked, setCompanyChecked] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!session?.user) return;
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setCompany(data as Company);
        setView('app');
        setPage('home');
      } else {
        setCompany(null);
        setView('registration');
      }
      setCompanyChecked(true);
    };
    if (session) loadCompany();
  }, [session]);

  const handleStart = () => {
    setView('auth');
  };

  const handleAuthSuccess = () => {
    // onAuthStateChange will set view to 'app'
  };

  const handleCompanyComplete = (comp: Company) => {
    setCompany(comp);
    setView('app');
    setPage('home');
  };

  const handleNavigate = (p: PageId) => {
    setPage(p);
    setOverlayView('none');
    setCurrentFund(null);
    setCurrentReverseCall(null);
  };

  const handleSelectCall = (fund: Fund) => {
    setCurrentFund(fund);
    setOverlayView('none');
  };

  const handleCallDetailBack = () => {
    setCurrentFund(null);
  };

  const handleApplyCall = (_fund: Fund) => {
    setOverlayView('new-project');
  };

  const handleNewProject = () => {
    setOverlayView('new-project');
  };

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
    setOverlayView('fund-matching');
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setOverlayView('fund-matching');
  };

  const handleSelectDraft = async (project: Project, draft: ProjectDraft) => {
    setCurrentProject(project);
    setCurrentDraft(draft);
    if (draft.fund_id) {
      const { data } = await supabase.from('funds').select('*').eq('id', draft.fund_id).maybeSingle();
      if (data) setCurrentFund(data as Fund);
    }
    setOverlayView('doc-gen');
  };

  const handleGenerateDoc = (fund: Fund) => {
    setCurrentFund(fund);
    setOverlayView('doc-gen');
  };

  const handleCreateReverseCall = () => {
    setOverlayView('reverse-call-form');
  };

  const handleReverseCallComplete = () => {
    setOverlayView('none');
    setPage('reverse-calls');
  };

  const handleDocComplete = () => {
    setOverlayView('none');
    setPage('projects');
  };

  const handleExit = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setOverlayView('none');
  };

  if (view === 'landing') {
    return <Landing onStart={handleStart} onStartCompany={handleStart} />;
  }

  if (view === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setView('landing')} />;
  }

  if (view === 'registration') {
    return (
      <CompanyRegistration
        onComplete={handleCompanyComplete}
        onBack={() => setView('auth')}
        userId={session?.user?.id ?? ''}
      />
    );
  }

  if (view === 'app') {
    // Overlay views
    if (overlayView === 'new-project') {
      return (
        <AppLayout company={company} currentPage={page} onNavigate={handleNavigate} onExit={handleExit}>
          <NewProject onComplete={handleProjectCreated} userId={session?.user?.id ?? ''} onBack={() => setOverlayView('none')} />
        </AppLayout>
      );
    }

    if (overlayView === 'fund-matching' && currentProject) {
      return (
        <AppLayout company={company} currentPage={page} onNavigate={handleNavigate} onExit={handleExit}>
          <FundMatching
            project={currentProject}
            onBack={() => setOverlayView('none')}
            onGenerateDoc={handleGenerateDoc}
            onCreateReverseCall={handleCreateReverseCall}
          />
        </AppLayout>
      );
    }

    if (overlayView === 'doc-gen' && currentProject && currentFund) {
      return (
        <AppLayout company={company} currentPage={page} onNavigate={handleNavigate} onExit={handleExit}>
          <DocGeneration
            project={currentProject}
            fund={currentFund}
            onBack={() => { setOverlayView('fund-matching'); setCurrentDraft(null); }}
            onComplete={handleDocComplete}
            existingDraft={currentDraft}
          />
        </AppLayout>
      );
    }

    if (overlayView === 'reverse-call-form' && currentProject) {
      return (
        <AppLayout company={company} currentPage={page} onNavigate={handleNavigate} onExit={handleExit}>
          <ReverseCallForm
            project={currentProject}
            onBack={() => setOverlayView('fund-matching')}
            onComplete={handleReverseCallComplete}
          />
        </AppLayout>
      );
    }

    // Normal page routing
    let content;
    if (page === 'home') {
      content = (
        <Landing
          onStart={handleNewProject}
          onStartCompany={() => handleNavigate('reverse-calls')}
          embedded
          onNavigate={(p) => handleNavigate(p)}
          onNewProject={handleNewProject}
        />
      );
    } else if (page === 'funds') {
      content = currentFund ? (
        <CallDetail fund={currentFund} onBack={handleCallDetailBack} onApply={handleApplyCall} />
      ) : (
        <FundsPage onSelectFund={handleSelectCall} />
      );
    } else if (page === 'reverse-calls') {
      content = currentReverseCall ? (
        <ReverseCallDetail
          reverseCall={currentReverseCall}
          onBack={() => setCurrentReverseCall(null)}
        />
      ) : (
        <ReverseCallsList
          onSelectReverseCall={(rc: ReverseCall) => setCurrentReverseCall(rc)}
        />
      );
    } else if (page === 'my-calls') {
      content = company ? <CompanyCalls company={company} /> : null;
    } else if (page === 'projects') {
      content = (
        <ProjectsPage
          onNewProject={handleNewProject}
          onSelectProject={handleSelectProject}
          onSelectDraft={handleSelectDraft}
        />
      );
    } else if (page === 'profile') {
      content = company ? <CompanyProfile company={company} /> : null;
    }

    return (
      <AppLayout company={company} currentPage={page} onNavigate={handleNavigate} onExit={handleExit}>
        {content}
      </AppLayout>
    );
  }

  return <Landing onStart={handleStart} onStartCompany={handleStart} />;
}


import { AppProvider, useApp } from './contexts/AppContext';
import Home from './pages/Home';
import PsychAuth from './pages/PsychAuth';
import PsychDashboard from './pages/PsychDashboard';
import ClientDetail from './pages/ClientDetail';
import AssignTests from './pages/AssignTests';
import TestResults from './pages/TestResults';
import ClientLogin from './pages/ClientLogin';
import ClientTests from './pages/ClientTests';
import TestTaking from './pages/TestTaking';
import ResetPassword from './pages/ResetPassword';
import PsychSubscription from './pages/PsychSubscription';
import PsychPending from './pages/PsychPending';
import AdminPanel from './pages/AdminPanel';

const G = '#4A7A56';

function AppRouter() {
  const { view, loading, psychologist, isAdmin } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDE9E1' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${G} transparent transparent transparent` }} />
          <p className="text-sm" style={{ color: '#6B7B69' }}>Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  // Redirect logged-in psychologist to correct page based on subscription
  if (psychologist && (view.page === 'psych-login' || view.page === 'psych-register' || view.page === 'home')) {
    if (isAdmin || psychologist.subscriptionStatus === 'active') return <PsychDashboard />;
    if (psychologist.subscriptionStatus === 'pending') {
      if (!psychologist.subscriptionPlan) return <PsychSubscription />;
      return <PsychPending />;
    }
    return <PsychSubscription />;
  }

  switch (view.page) {
    case 'home': return <Home />;
    case 'psych-login':
    case 'psych-register': return <PsychAuth />;
    case 'psych-dashboard': return <PsychDashboard />;
    case 'psych-client-detail': return <ClientDetail />;
    case 'psych-assign-tests': return <AssignTests />;
    case 'psych-view-results': return <TestResults />;
    case 'psych-subscription': return <PsychSubscription />;
    case 'psych-pending': return <PsychPending />;
    case 'admin-panel': return <AdminPanel />;
    case 'client-login': return <ClientLogin />;
    case 'client-tests': return <ClientTests />;
    case 'test-taking': return <TestTaking />;
    case 'psych-reset-password': return <ResetPassword />;
    default: return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

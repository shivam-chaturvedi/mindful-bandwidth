import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Wind, ClipboardList, Sparkles, BarChart3, ArrowLeft, Languages, RefreshCw } from 'lucide-react';
import { useBandwidth } from '@/context/BandwidthContext';
import Translate from '@/components/Translate';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/results', label: 'Insights', icon: BarChart3 },
  { to: '/ai-coach', label: 'Coach', icon: MessageSquare },
  { to: '/todays-reset', label: 'Reset', icon: Sparkles },
];

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, showLangModal, setShowLangModal } = useBandwidth();

  // Show navigation links and bottom nav only on main navigation routes
  const isNavRoute = ['/home', '/results', '/ai-coach', '/todays-reset'].includes(location.pathname);
  
  // Show back button on all routes except Onboarding (/) and Home (/home)
  const showBackBtn = !['/', '/home'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* First Launch Language Selector Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 gradient-primary" />
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Languages className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Choose Your Language</h2>
              <p className="text-sm text-muted-foreground mt-1">अपनी पसंदीदा भाषा चुनें</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangModal(false);
                }}
                className="flex flex-col items-center justify-center p-5 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
              >
                <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">English</span>
                <span className="text-xs text-muted-foreground mt-1">Use English</span>
              </button>
              <button
                onClick={() => {
                  setLanguage('hi');
                  setShowLangModal(false);
                }}
                className="flex flex-col items-center justify-center p-5 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
              >
                <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">हिंदी (Hindi)</span>
                <span className="text-xs text-muted-foreground mt-1">हिंदी का उपयोग करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top persistent header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          {showBackBtn && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          
          <NavLink to="/home" className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">B</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-foreground hidden sm:inline">
              <Translate>Bandwidth</Translate>
            </span>
          </NavLink>

          {/* Desktop nav links (only shown on core navigation pages) */}
          {isNavRoute && (
            <nav className="hidden md:flex items-center gap-1 ml-2 overflow-x-auto whitespace-nowrap">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <Translate>{item.label}</Translate>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Persistent controls dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-background border border-border rounded-md px-2 py-1">
              <Languages className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Reset Session button for AI Coach */}
            {location.pathname === '/ai-coach' && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('reset-ai-coach'));
                }}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                title="Reset Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav (only shown on core navigation pages) */}
      {isNavRoute && (
        <nav className="md:hidden sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="grid grid-flow-col auto-cols-fr max-w-lg mx-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <Translate>{item.label}</Translate>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppShell;

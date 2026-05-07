import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Wind, ClipboardList, Target, Dumbbell, Users, BarChart3, ArrowLeft } from 'lucide-react';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/results', label: 'Insights', icon: BarChart3 },
  { to: '/ai-coach', label: 'Coach', icon: MessageSquare },
  { to: '/interventions', label: 'Action Plan', icon: Target },
  { to: '/checkin', label: 'Check-in', icon: ClipboardList },
  { to: '/breathing', label: 'Breathe', icon: Wind },
  { to: '/game/1', label: 'Practice', icon: Dumbbell },
  { to: '/community', label: 'Community', icon: Users },
];

const AppShell = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors md:hidden"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <NavLink to="/home" className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">B</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-foreground hidden sm:inline">Bandwidth</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1 ml-2 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="grid grid-cols-5 max-w-lg mx-auto">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
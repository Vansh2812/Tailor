import * as React from 'react';
import { Menu, X, Bell, User } from 'lucide-react'; // Assuming you have lucide-react for icons

// Define the breakpoint (768px is the standard Tailwind 'md' breakpoint)
const MOBILE_BREAKPOINT = 768;

/**
 * Custom Hook to detect if the screen width is below the mobile breakpoint.
 * Uses window.matchMedia for performance and consistency.
 */
export function useIsMobile() {
  // Initialize state to undefined until the client-side check runs
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // Media Query List: checks for screen width less than MOBILE_BREAKPOINT
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (event) => {
      // The event.matches property tells us if the media query is currently true
      setIsMobile(event.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    // Add event listener for changes
    mql.addEventListener('change', onChange);

    // Cleanup function
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Return boolean, defaulting to false if the check hasn't run yet (SSR safety)
  return isMobile === undefined ? false : isMobile;
}

// -------------------------------------------------------------

/**
 * Example Component demonstrating responsive layout using useIsMobile hook.
 */
export function ResponsiveDashboardLayout() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Close sidebar automatically when transitioning from mobile to desktop
  React.useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Tailwind classes for the main content area (responsive padding)
  const mainContentClass = `
    flex-1 p-4 transition-all duration-300 
    ${isMobile ? 'pt-20' : 'ml-64 p-8'}
  `;

  // Tailwind classes for the sidebar (responsive visibility and positioning)
  const sidebarClass = `
    fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border shadow-lg transition-transform duration-300
    ${isMobile 
      ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') // Mobile: Slide in/out
      : 'translate-x-0' // Desktop: Always visible
    }
    ${isMobile && !isSidebarOpen ? 'hidden md:block' : ''}
  `;

  return (
    <div className="min-h-screen flex bg-background">
      {/* 1. Sidebar */}
      <aside className={sidebarClass}>
        <div className="p-4 text-xl font-bold text-sidebar-primary-foreground bg-sidebar-primary h-16 flex items-center">
          Tailor App
        </div>
        <nav className="p-4">
          {['Dashboard', 'Orders', 'Customers', 'Reports'].map(item => (
            <a 
              key={item}
              href="#"
              className="block p-3 mt-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* 2. Backdrop (only visible on mobile when sidebar is open) */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30" 
          onClick={toggleSidebar}
        />
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex flex-col flex-1">
        {/* Top Bar (Fixed on Mobile) */}
        <header className="fixed top-0 left-0 right-0 md:static z-30 bg-card border-b border-border h-16 flex items-center justify-between px-4 md:ml-0 md:px-8 shadow-sm">
          <div className="flex items-center">
            {isMobile && (
              <button onClick={toggleSidebar} className="text-foreground p-2 mr-3 rounded-md hover:bg-secondary">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <h1 className="text-xl font-semibold">
              {isMobile ? 'Dashboard' : 'Patel Tailor System'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            <User className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className={mainContentClass}>
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <div 
            className={`
              grid gap-6 
              ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}
            `}
          >
            {/* Example Cards (responsive grid) */}
            <div className="bg-white p-6 rounded-lg shadow-md border">Total Orders: 120</div>
            <div className="bg-white p-6 rounded-lg shadow-md border">Total Revenue: Rs55,000</div>
            <div className="bg-white p-6 rounded-lg shadow-md border">Pending: 5</div>
            <div className="bg-white p-6 rounded-lg shadow-md border">Customers: 80</div>
          </div>

          <section className="mt-8 bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-3">Recent Activity</h3>
            <p>Details about recent activities...</p>
          </section>
        </main>
      </div>
    </div>
  );
}
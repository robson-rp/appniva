import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Routes that should redirect to mobile home on mobile devices
const DESKTOP_ONLY_ROUTES = ['/dashboard'];

export function ResponsiveLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, profile, loading, isAdmin } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-sm p-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect users who haven't completed onboarding
  if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // On mobile: redirect / and /dashboard to /home
  if (isMobile && (location.pathname === '/' || location.pathname === '/dashboard')) {
    return <Navigate to="/home" replace />;
  }

  // On mobile: use mobile layout with bottom nav
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
        <MobileBottomNav />
      </div>
    );
  }

  // On desktop: just render outlet (AppLayout handles the sidebar)
  return <Outlet />;
}
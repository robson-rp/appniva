import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useMaturityProfile } from '@/hooks/useMaturityProfile';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Responsive wrapper that redirects users to the appropriate home page
 * based on their device type:
 * - Mobile/Tablet: /home (app-like experience)
 * - Desktop: /dashboard (traditional dashboard)
 */
export function ResponsiveRouteWrapper() {
  const isMobile = useIsMobile();
  const { user, profile, loading } = useAuth();
  const { maturityProfile, isLoading: maturityLoading } = useMaturityProfile();

  // Show loading state while determining device type
  if (isMobile === undefined || loading || maturityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-sm p-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect users who haven't completed onboarding (either basic or maturity)
  if (!profile?.onboarding_completed || !maturityProfile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to appropriate home based on device
  if (isMobile) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
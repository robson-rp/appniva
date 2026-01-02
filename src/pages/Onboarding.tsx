import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMaturityProfile } from '@/hooks/useMaturityProfile';
import { SmartOnboardingWizard } from '@/components/onboarding/SmartOnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Onboarding() {
  const { user, profile, loading: authLoading } = useAuth();
  const { maturityProfile, isLoading: maturityLoading } = useMaturityProfile();

  // Show loading while checking auth and maturity profile
  if (authLoading || maturityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-sm p-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user already completed smart onboarding, redirect to home
  if (profile?.onboarding_completed && maturityProfile?.onboarding_completed) {
    return <Navigate to="/home" replace />;
  }

  // Show the smart onboarding wizard
  return <SmartOnboardingWizard />;
}
import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
      <MobileBottomNav />
    </div>
  );
}
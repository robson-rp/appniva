import { ReactNode, TouchEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
  handlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function PullToRefresh({
  children,
  pullDistance,
  isRefreshing,
  threshold = 80,
  handlers
}: PullToRefreshProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;
  const showIndicator = pullDistance > 10 || isRefreshing;
  
  return (
    <div
      className="relative min-h-screen"
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center z-50 transition-opacity duration-200",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          top: 60,
          height: pullDistance,
          transform: `translateY(${Math.max(0, pullDistance - 40)}px)`
        }}
      >
        <div 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-lg transition-all duration-200",
            isRefreshing && "shadow-glow"
          )}
          style={{
            transform: `scale(${0.5 + progress * 0.5})`,
            opacity: Math.min(progress * 1.5, 1)
          }}
        >
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-accent transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>

      {/* Content wrapper with transform */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transitionDuration: pullDistance > 0 ? '0ms' : '200ms'
        }}
      >
        {children}
      </div>

      {/* Refresh status toast */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium shadow-lg flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            A actualizar...
          </div>
        </div>
      )}
    </div>
  );
}

import { Pin, PinOff, RotateCcw, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface MenuCustomizerProps {
  allItems: NavItem[];
  navGroups: NavGroup[];
  pinnedItems: string[];
  onTogglePin: (path: string) => void;
  onReset: () => void;
}

export function MenuCustomizer({
  allItems,
  navGroups,
  pinnedItems,
  onTogglePin,
  onReset,
}: MenuCustomizerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Menu</DialogTitle>
          <DialogDescription>
            Escolha quais itens aparecem sempre visíveis no menu principal.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Main items */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Itens Principais
              </h4>
              <div className="space-y-1">
                {allItems.map((item) => {
                  const isPinned = pinnedItems.includes(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => onTogglePin(item.path)}
                      className={cn(
                        'flex items-center justify-between w-full p-2 rounded-lg transition-colors',
                        'hover:bg-accent',
                        isPinned && 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {isPinned ? (
                        <Pin className="h-4 w-4 text-primary" />
                      ) : (
                        <PinOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Group items */}
            {navGroups.map((group) => (
              <div key={group.label}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <group.icon className="h-4 w-4" />
                  {group.label}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isPinned = pinnedItems.includes(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => onTogglePin(item.path)}
                        className={cn(
                          'flex items-center justify-between w-full p-2 rounded-lg transition-colors',
                          'hover:bg-accent',
                          isPinned && 'bg-primary/10'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        {isPinned ? (
                          <Pin className="h-4 w-4 text-primary" />
                        ) : (
                          <PinOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Repor Predefinições
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

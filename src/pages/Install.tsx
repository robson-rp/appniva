import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Monitor,
  Apple,
  Wifi,
  WifiOff,
  Share,
  PlusSquare
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };
    checkInstalled();

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instalar Bolso Inteligente</h1>
          <p className="text-muted-foreground">Aceda rapidamente à app a partir do seu ecrã inicial</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-green-500" />
              ) : (
                <WifiOff className="h-8 w-8 text-amber-500" />
              )}
              <div>
                <p className="font-medium">{isOnline ? 'Online' : 'Offline'}</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Ligado à internet' : 'A funcionar offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isInstalled || isStandalone ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <Download className="h-8 w-8 text-primary" />
              )}
              <div>
                <p className="font-medium">
                  {isInstalled || isStandalone ? 'Instalada' : 'Disponível para instalar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled || isStandalone ? 'App instalada no dispositivo' : 'Clique abaixo para instalar'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Install Section */}
      {!isInstalled && !isStandalone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Instalar a Aplicação
            </CardTitle>
            <CardDescription>
              Instale o Bolso Inteligente no seu dispositivo para acesso rápido e funcionamento offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deferredPrompt && (
              <Button size="lg" onClick={handleInstallClick} className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Instalar Agora
              </Button>
            )}

            {isIOS && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Para instalar no iPhone ou iPad, siga estes passos:
                </p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Toque no botão Partilhar</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Share className="h-4 w-4" />
                        Na barra inferior do Safari
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Seleccione "Adicionar ao Ecrã Principal"</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <PlusSquare className="h-4 w-4" />
                        Deslize para encontrar a opção
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Toque em "Adicionar"</p>
                      <p className="text-sm text-muted-foreground">
                        A app aparecerá no seu ecrã inicial
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {!deferredPrompt && !isIOS && (
              <div className="text-center py-4">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Abra esta página no seu telemóvel para instalar a aplicação, 
                  ou use o menu do browser para "Adicionar ao Ecrã Principal".
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Already Installed */}
      {(isInstalled || isStandalone) && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Aplicação Instalada!</h3>
                <p className="text-muted-foreground">
                  O Bolso Inteligente está instalado no seu dispositivo. Pode fechar esta janela do browser 
                  e usar a app directamente a partir do ecrã inicial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Vantagens da Instalação</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Acesso Rápido</p>
                <p className="text-sm text-muted-foreground">Abra directamente do ecrã inicial sem browser</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Modo Offline</p>
                <p className="text-sm text-muted-foreground">Consulte os seus dados mesmo sem internet</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Ecrã Completo</p>
                <p className="text-sm text-muted-foreground">Experiência de app nativa sem barras do browser</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Carregamento Rápido</p>
                <p className="text-sm text-muted-foreground">Os recursos são guardados localmente para performance máxima</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

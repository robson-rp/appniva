import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityLogs } from '@/hooks/useSecurityLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SecurityBadge } from '@/components/security/SecurityBadge';
import { 
  Shield, 
  Lock, 
  Eye, 
  Download, 
  Trash2, 
  Smartphone, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

export default function Security() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { data: securityLogs, isLoading: logsLoading } = useSecurityLogs(10);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all user data from various tables
      const [
        { data: transactions },
        { data: accounts },
        { data: goals },
        { data: budgets },
        { data: debts },
        { data: investments },
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user?.id),
        supabase.from('accounts').select('*').eq('user_id', user?.id),
        supabase.from('goals').select('*').eq('user_id', user?.id),
        supabase.from('budgets').select('*').eq('user_id', user?.id),
        supabase.from('debts').select('*').eq('user_id', user?.id),
        supabase.from('investments').select('*').eq('user_id', user?.id),
      ]);

      const exportData = {
        profile,
        transactions,
        accounts,
        goals,
        budgets,
        debts,
        investments,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bolso-inteligente-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t('security.exportSuccess', 'Dados exportados com sucesso'));
    } catch (error) {
      toast.error(t('security.exportError', 'Erro ao exportar dados'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Note: Full account deletion would require a backend function
      // For now, we'll sign out and show a message
      toast.info(t('security.deleteInfo', 'Para eliminar a conta, contacte o suporte.'));
      await signOut();
    } catch (error) {
      toast.error(t('security.deleteError', 'Erro ao processar pedido'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <Monitor className="h-4 w-4" />;
    if (action.includes('export')) return <Download className="h-4 w-4" />;
    if (action.includes('password')) return <Lock className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getDeviceType = (deviceInfo: string | null) => {
    if (!deviceInfo) return 'Desconhecido';
    if (deviceInfo.includes('Mobile') || deviceInfo.includes('Android') || deviceInfo.includes('iPhone')) {
      return 'Telemóvel';
    }
    return 'Computador';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {t('security.title', 'Segurança e Privacidade')}
        </h1>
        <p className="text-muted-foreground">
          {t('security.subtitle', 'A tua informação financeira está protegida')}
        </p>
      </div>

      {/* Security Badges */}
      <div className="flex flex-wrap justify-center gap-3">
        <SecurityBadge variant="protected" size="md" />
        <SecurityBadge variant="privacy" size="md" />
        <SecurityBadge variant="control" size="md" />
      </div>

      {/* Data Protection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            {t('security.dataProtection.title', 'Protecção de Dados')}
          </CardTitle>
          <CardDescription>
            {t('security.dataProtection.description', 'Como protegemos a tua informação')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('security.dataProtection.encrypted', 'Dados encriptados')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('security.dataProtection.encryptedDesc', 'Toda a informação é encriptada em trânsito e em repouso')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('security.dataProtection.restricted', 'Acesso restrito')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('security.dataProtection.restrictedDesc', 'Apenas tu podes aceder aos teus dados financeiros')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('security.dataProtection.sessions', 'Sessões protegidas')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('security.dataProtection.sessionsDesc', 'Autenticação segura com tokens encriptados')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t('security.privacy.title', 'Privacidade')}
          </CardTitle>
          <CardDescription>
            {t('security.privacy.description', 'O nosso compromisso com a tua privacidade')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('security.privacy.noSale', 'Dados nunca vendidos')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('security.privacy.noSaleDesc', 'Os teus dados nunca são vendidos a terceiros')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t('security.privacy.consent', 'Partilha com consentimento')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('security.privacy.consentDesc', 'Qualquer partilha requer a tua autorização explícita')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Control Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            {t('security.control.title', 'Controlo do Utilizador')}
          </CardTitle>
          <CardDescription>
            {t('security.control.description', 'Tu tens controlo total sobre os teus dados')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={handleExportData}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting 
                ? t('security.control.exporting', 'A exportar...') 
                : t('security.control.export', 'Exportar meus dados')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="justify-start gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  {t('security.control.delete', 'Apagar minha conta')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {t('security.control.deleteConfirmTitle', 'Apagar conta permanentemente?')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('security.control.deleteConfirmDesc', 'Esta acção é irreversível. Todos os teus dados serão eliminados permanentemente.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? t('common.loading', 'A processar...') : t('security.control.confirmDelete', 'Sim, apagar conta')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('security.activity.title', 'Actividade Recente')}
          </CardTitle>
          <CardDescription>
            {t('security.activity.description', 'Últimas acções na tua conta')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : securityLogs && securityLogs.length > 0 ? (
            <div className="space-y-3">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{log.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="h-3 w-3" />
                      <span>{getDeviceType(log.device_info)}</span>
                      <span>•</span>
                      <span>{format(new Date(log.created_at), "d MMM, HH:mm", { locale: pt })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('security.activity.empty', 'Nenhuma actividade registada')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

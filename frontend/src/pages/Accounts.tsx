import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts, useCreateAccount, useUpdateAccount, useToggleAccountStatus } from '@/hooks/useAccounts';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountForm } from '@/components/accounts/AccountForm';
import { Database } from '@/integrations/supabase/types';
import { formatCurrency } from '@/lib/constants';

type Account = Database['public']['Tables']['accounts']['Row'];

export default function Accounts() {
  const { t } = useTranslation();
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const toggleStatus = useToggleAccountStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const activeAccounts = accounts?.filter(a => a.is_active) || [];
  const inactiveAccounts = accounts?.filter(a => !a.is_active) || [];
  
  const totalBalance = activeAccounts.reduce((sum, acc) => {
    // For simplicity, sum all balances (in reality, should convert currencies)
    return sum + Number(acc.current_balance);
  }, 0);

  const handleCreate = (data: any) => {
    createAccount.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingAccount) return;
    updateAccount.mutate(
      { id: editingAccount.id, ...data },
      { onSuccess: () => setEditingAccount(null) }
    );
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleStatus.mutate({ id, is_active: isActive });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('accounts.title')}</h1>
          <p className="text-muted-foreground">{t('accounts.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('accounts.newAccount')}
        </Button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <p className="text-sm opacity-90">{t('accounts.totalBalance')}</p>
        <p className="text-3xl font-bold mt-1">
          {isLoading ? '...' : formatCurrency(totalBalance, 'AOA')}
        </p>
        <p className="text-sm opacity-75 mt-2">
          {activeAccounts.length} {t('accounts.activeAccounts').toLowerCase()}
        </p>
      </div>

      {/* Active Accounts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('accounts.activeAccounts')}</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : activeAccounts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground">{t('accounts.noActiveAccounts')}</p>
            <Button variant="link" onClick={() => setIsDialogOpen(true)}>
              {t('accounts.createFirstAccount')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Accounts */}
      {inactiveAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{t('accounts.inactiveAccounts')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('accounts.newAccount')}</DialogTitle>
          </DialogHeader>
          <AccountForm
            onSubmit={handleCreate}
            isLoading={createAccount.isPending}
            submitLabel={t('accounts.createAccount')}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('accounts.editAccount')}</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              defaultValues={{
                name: editingAccount.name,
                account_type: editingAccount.account_type,
                institution_name: editingAccount.institution_name || '',
                currency: editingAccount.currency,
                initial_balance: Number(editingAccount.initial_balance),
              }}
              onSubmit={handleUpdate}
              isLoading={updateAccount.isPending}
              submitLabel={t('common.update')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

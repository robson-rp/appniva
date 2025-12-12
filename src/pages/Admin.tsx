import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Users, Wallet, TrendingUp, Target, Search, Shield, UserCheck, Package, FileCheck, Eye, History, UserX, Power } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AdminProductList } from '@/components/admin/AdminProductList';
import { AdminRequestList } from '@/components/admin/AdminRequestList';
import { AdminUserDetails } from '@/components/admin/AdminUserDetails';
import { AdminAuditLogs } from '@/components/admin/AdminAuditLogs';
import { useLogAuditAction } from '@/hooks/useAuditLog';
import { useUserSuspension } from '@/hooks/useUserSuspension';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  primary_currency: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  role: string;
  is_suspended: boolean;
  suspended_at: string | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalInvestments: number;
  totalGoals: number;
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [userToSuspend, setUserToSuspend] = useState<UserWithRole | null>(null);
  const logAction = useLogAuditAction();
  const suspendUser = useUserSuspension();

  // Log tab views
  useEffect(() => {
    if (!isAdmin) return;
    
    const actionMap: Record<string, 'view_users' | 'view_products' | 'view_requests'> = {
      users: 'view_users',
      products: 'view_products',
      requests: 'view_requests',
    };
    
    const action = actionMap[activeTab];
    if (action) {
      logAction.mutate({ action_type: action });
    }
  }, [activeTab, isAdmin]);

  // Log when viewing user details
  const handleViewUserData = (user: UserWithRole) => {
    logAction.mutate({
      action_type: 'view_user_data',
      target_user_id: user.id,
      details: { user_name: user.name, user_email: user.email },
    });
    setSelectedUser(user);
  };

  const handleSuspendConfirm = () => {
    if (userToSuspend) {
      suspendUser.mutate({
        userId: userToSuspend.id,
        userName: userToSuspend.name,
        userEmail: userToSuspend.email,
        suspend: !userToSuspend.is_suspended,
      });
      setUserToSuspend(null);
    }
  };

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      return (profiles || []).map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) || 'user',
        is_suspended: profile.is_suspended || false,
        suspended_at: profile.suspended_at || null,
      })) as UserWithRole[];
    },
    enabled: isAdmin,
  });

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [accountsRes, transactionsRes, investmentsRes, goalsRes] = await Promise.all([
        supabase.from('accounts').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('investments').select('id', { count: 'exact', head: true }),
        supabase.from('goals').select('id', { count: 'exact', head: true }),
      ]);

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter((u) => u.onboarding_completed).length || 0;

      return {
        totalUsers,
        activeUsers,
        totalAccounts: accountsRes.count || 0,
        totalTransactions: transactionsRes.count || 0,
        totalInvestments: investmentsRes.count || 0,
        totalGoals: goalsRes.count || 0,
      } as AdminStats;
    },
    enabled: isAdmin && !!users,
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { title: 'Total de Utilizadores', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Utilizadores Activos', value: stats?.activeUsers ?? 0, icon: UserCheck, color: 'text-income', bgColor: 'bg-income/10' },
    { title: 'Contas Criadas', value: stats?.totalAccounts ?? 0, icon: Wallet, color: 'text-accent-teal', bgColor: 'bg-accent-teal/10' },
    { title: 'Transacções', value: stats?.totalTransactions ?? 0, icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'Investimentos', value: stats?.totalInvestments ?? 0, icon: TrendingUp, color: 'text-expense', bgColor: 'bg-expense/10' },
    { title: 'Metas', value: stats?.totalGoals ?? 0, icon: Target, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel de Administração</h1>
        <p className="text-muted-foreground">
          Gerir utilizadores, produtos financeiros e visualizar estatísticas da plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value.toLocaleString('pt-PT')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilizadores
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Utilizadores</CardTitle>
                  <CardDescription>Lista de todos os utilizadores registados na plataforma.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar utilizadores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Moeda</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Registo</TableHead>
                        <TableHead className="text-right">Acções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                              {user.role === 'admin' && <Shield className="h-3 w-3" />}
                              {user.role === 'admin' ? 'Admin' : 'Utilizador'}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.primary_currency || 'AOA'}</TableCell>
                          <TableCell>
                            {user.is_suspended ? (
                              <Badge variant="destructive" className="gap-1">
                                <UserX className="h-3 w-3" />
                                Suspenso
                              </Badge>
                            ) : (
                              <Badge variant={user.onboarding_completed ? 'outline' : 'secondary'}>
                                {user.onboarding_completed ? 'Activo' : 'Pendente'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at ? format(new Date(user.created_at), "d 'de' MMM, yyyy", { locale: pt }) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUserData(user)}
                                disabled={user.role === 'admin'}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Dados
                              </Button>
                              <Button
                                variant={user.is_suspended ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={() => setUserToSuspend(user)}
                                disabled={user.role === 'admin'}
                                className={user.is_suspended ? 'text-income hover:text-income' : 'text-destructive hover:text-destructive'}
                              >
                                {user.is_suspended ? (
                                  <>
                                    <Power className="h-4 w-4 mr-1" />
                                    Activar
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-1" />
                                    Suspender
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    {searchQuery ? 'Nenhum utilizador encontrado.' : 'Ainda não há utilizadores registados.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <AdminProductList />
        </TabsContent>

        <TabsContent value="requests">
          <AdminRequestList />
        </TabsContent>

        <TabsContent value="audit">
          <AdminAuditLogs />
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedUser && (
            <AdminUserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate User Dialog */}
      <AlertDialog open={!!userToSuspend} onOpenChange={() => setUserToSuspend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToSuspend?.is_suspended ? 'Activar Utilizador' : 'Suspender Utilizador'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToSuspend?.is_suspended
                ? `Tem a certeza que deseja activar a conta de ${userToSuspend?.name}? O utilizador poderá voltar a aceder à plataforma.`
                : `Tem a certeza que deseja suspender a conta de ${userToSuspend?.name}? O utilizador não poderá aceder à plataforma até ser activado novamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendConfirm}
              className={userToSuspend?.is_suspended ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {userToSuspend?.is_suspended ? 'Activar' : 'Suspender'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
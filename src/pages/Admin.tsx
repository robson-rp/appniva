import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Wallet, TrendingUp, Target, Search, Shield, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  primary_currency: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  role: string;
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

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles (admins can view all via RLS policy)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      return (profiles || []).map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) || 'user',
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
    {
      title: 'Total de Utilizadores',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Utilizadores Activos',
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: 'text-income',
      bgColor: 'bg-income/10',
    },
    {
      title: 'Contas Criadas',
      value: stats?.totalAccounts ?? 0,
      icon: Wallet,
      color: 'text-accent-teal',
      bgColor: 'bg-accent-teal/10',
    },
    {
      title: 'Transacções',
      value: stats?.totalTransactions ?? 0,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Investimentos',
      value: stats?.totalInvestments ?? 0,
      icon: TrendingUp,
      color: 'text-expense',
      bgColor: 'bg-expense/10',
    },
    {
      title: 'Metas',
      value: stats?.totalGoals ?? 0,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel de Administração</h1>
        <p className="text-muted-foreground">
          Gerir utilizadores e visualizar estatísticas da plataforma.
        </p>
      </div>

      {/* Statistics Cards */}
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

      {/* Users Table */}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {user.role === 'admin' && <Shield className="h-3 w-3" />}
                          {user.role === 'admin' ? 'Admin' : 'Utilizador'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.primary_currency || 'AOA'}</TableCell>
                      <TableCell>
                        <Badge variant={user.onboarding_completed ? 'outline' : 'secondary'}>
                          {user.onboarding_completed ? 'Activo' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.created_at
                          ? format(new Date(user.created_at), "d 'de' MMM, yyyy", { locale: pt })
                          : '-'}
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
    </div>
  );
}

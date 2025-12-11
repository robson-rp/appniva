import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder pages for remaining modules
const BudgetsPage = () => <div className="p-4"><h1 className="text-2xl font-bold">Orçamentos</h1><p className="text-muted-foreground mt-2">Módulo de orçamentos em desenvolvimento...</p></div>;
const InvestmentsPage = () => <div className="p-4"><h1 className="text-2xl font-bold">Investimentos</h1><p className="text-muted-foreground mt-2">Módulo de investimentos em desenvolvimento...</p></div>;
const GoalsPage = () => <div className="p-4"><h1 className="text-2xl font-bold">Metas</h1><p className="text-muted-foreground mt-2">Módulo de metas em desenvolvimento...</p></div>;
const InsightsPage = () => <div className="p-4"><h1 className="text-2xl font-bold">Insights</h1><p className="text-muted-foreground mt-2">Módulo de insights em desenvolvimento...</p></div>;
const ProfilePage = () => <div className="p-4"><h1 className="text-2xl font-bold">Perfil</h1><p className="text-muted-foreground mt-2">Página de perfil em desenvolvimento...</p></div>;
const AdminPage = () => <div className="p-4"><h1 className="text-2xl font-bold">Administração</h1><p className="text-muted-foreground mt-2">Painel de administração em desenvolvimento...</p></div>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

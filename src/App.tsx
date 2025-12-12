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
import Budgets from "@/pages/Budgets";
import Investments from "@/pages/Investments";
import Goals from "@/pages/Goals";
import Insights from "@/pages/Insights";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import OCRUpload from "@/pages/OCRUpload";
import OCRReview from "@/pages/OCRReview";
import Debts from "@/pages/Debts";
import Simulator from "@/pages/Simulator";
import Reconciliation from "@/pages/Reconciliation";
import ReconciliationSelect from "@/pages/ReconciliationSelect";
import CostCenters from "@/pages/CostCenters";
import Tags from "@/pages/Tags";
import Assistant from "@/pages/Assistant";
import Products from "@/pages/Products";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/ocr/upload" element={<OCRUpload />} />
              <Route path="/ocr/review/:id" element={<OCRReview />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/reconciliation" element={<ReconciliationSelect />} />
              <Route path="/reconciliation/:accountId" element={<Reconciliation />} />
              <Route path="/cost-centers" element={<CostCenters />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/products" element={<Products />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

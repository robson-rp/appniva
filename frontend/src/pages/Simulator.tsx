import { useState, useMemo } from 'react';
import { Calculator, Plus, MoreHorizontal, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { SimulatorForm } from '@/components/simulator/SimulatorForm';
import { WealthProjectionChart } from '@/components/simulator/WealthProjectionChart';
import { SimulationResults } from '@/components/simulator/SimulationResults';
import { ScenarioComparison } from '@/components/simulator/ScenarioComparison';
import { 
  useScenarios, 
  useCreateScenario, 
  useDeleteScenario,
  Scenario,
  CreateScenarioInput,
} from '@/hooks/useScenarios';
import { useGoals } from '@/hooks/useGoals';
import { useAccounts } from '@/hooks/useAccounts';
import { runSimulation, SimulationResult } from '@/lib/simulationEngine';

export default function Simulator() {
  const { data: scenarios, isLoading: isLoadingScenarios } = useScenarios();
  const { data: goals } = useGoals();
  const { data: accounts } = useAccounts();
  const createScenario = useCreateScenario();
  const deleteScenario = useDeleteScenario();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [deleteScenarioId, setDeleteScenarioId] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState('new');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Get scenarios selected for comparison
  const scenariosToCompare = useMemo(() => {
    if (!scenarios) return [];
    return scenarios.filter(s => selectedForComparison.includes(s.id));
  }, [scenarios, selectedForComparison]);

  const toggleScenarioComparison = (scenarioId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 scenarios
      }
      return [...prev, scenarioId];
    });
  };

  // Calculate initial wealth from accounts
  const initialWealth = useMemo(() => {
    if (!accounts) return 0;
    return accounts
      .filter(a => a.is_active)
      .reduce((sum, a) => sum + a.current_balance, 0);
  }, [accounts]);

  // Convert goals to simulation format
  const goalsForSimulation = useMemo(() => {
    if (!goals) return [];
    return goals
      .filter(g => g.status === 'in_progress')
      .map(g => ({
        name: g.name,
        amount: g.target_amount,
      }));
  }, [goals]);

  const handleSimulate = (data: any) => {
    const result = runSimulation({
      initialWealth,
      monthlyIncome: data.monthly_income_estimate,
      monthlyExpense: data.monthly_expense_estimate,
      salaryIncreaseRate: data.salary_increase_rate,
      investmentReturnRate: data.investment_return_rate,
      inflationRate: data.inflation_rate,
      timeHorizonYears: data.time_horizon_years,
      futureExpenses: data.future_expenses || [],
      goals: goalsForSimulation,
    });
    setSimulationResult(result);
  };

  const handleSaveScenario = (data: CreateScenarioInput) => {
    createScenario.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
        handleSimulate(data);
      },
    });
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    handleSimulate({
      monthly_income_estimate: scenario.monthly_income_estimate,
      monthly_expense_estimate: scenario.monthly_expense_estimate,
      salary_increase_rate: scenario.salary_increase_rate,
      investment_return_rate: scenario.investment_return_rate,
      inflation_rate: scenario.inflation_rate,
      time_horizon_years: scenario.time_horizon_years,
      future_expenses: scenario.future_expenses,
    });
    setActiveTab('results');
  };

  const handleConfirmDelete = () => {
    if (deleteScenarioId) {
      deleteScenario.mutate(deleteScenarioId, {
        onSuccess: () => setDeleteScenarioId(null),
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoadingScenarios) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulador Financeiro</h1>
          <p className="text-muted-foreground">
            Projete seu património e atinja suas metas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cenário
        </Button>
      </div>

      {/* Current Wealth Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-muted-foreground">Património Atual (base da simulação)</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(initialWealth)}</p>
          </div>
          <Calculator className="h-10 w-10 text-primary/50" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="new">Nova Simulação</TabsTrigger>
          <TabsTrigger value="saved">
            Cenários ({scenarios?.length || 0})
          </TabsTrigger>
          {simulationResult && (
            <TabsTrigger value="results">Resultados</TabsTrigger>
          )}
          {selectedForComparison.length >= 2 && (
            <TabsTrigger value="compare" className="gap-1">
              <GitCompare className="h-4 w-4" />
              Comparar ({selectedForComparison.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="new" className="space-y-6 mt-6">
          <SimulatorForm
            onSubmit={handleSaveScenario}
            onSimulate={handleSimulate}
            isLoading={createScenario.isPending}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-4 mt-6">
          {scenarios?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sem cenários guardados</h3>
                <p className="text-muted-foreground text-center max-w-md mt-1">
                  Crie uma simulação e guarde para comparar diferentes cenários financeiros.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab('new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Cenário
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {selectedForComparison.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-4">
                  <GitCompare className="h-4 w-4" />
                  <span className="text-sm">
                    {selectedForComparison.length} cenário(s) selecionado(s) para comparação.
                  </span>
                  {selectedForComparison.length >= 2 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab('compare')}
                    >
                      Ver Comparação
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedForComparison([])}
                  >
                    Limpar
                  </Button>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scenarios?.map((scenario) => (
                  <Card 
                    key={scenario.id} 
                    className={`hover:shadow-md transition-shadow ${
                      selectedForComparison.includes(scenario.id) 
                        ? 'ring-2 ring-primary' 
                        : ''
                    }`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedForComparison.includes(scenario.id)}
                          onCheckedChange={() => toggleScenarioComparison(scenario.id)}
                          className="mt-1"
                        />
                        <div>
                          <CardTitle className="text-base">{scenario.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scenario.time_horizon_years} anos
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLoadScenario(scenario)}>
                            Carregar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteScenarioId(scenario.id)}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Rendimento</p>
                          <p className="font-medium">{formatCurrency(scenario.monthly_income_estimate)}/mês</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Despesas</p>
                          <p className="font-medium">{formatCurrency(scenario.monthly_expense_estimate)}/mês</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Retorno Inv.</p>
                          <p className="font-medium">{scenario.investment_return_rate}%/ano</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Inflação</p>
                          <p className="font-medium">{scenario.inflation_rate}%/ano</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => handleLoadScenario(scenario)}
                      >
                        Simular
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        {selectedForComparison.length >= 2 && (
          <TabsContent value="compare" className="space-y-6 mt-6">
            <ScenarioComparison
              scenarios={scenariosToCompare}
              initialWealth={initialWealth}
              goals={goalsForSimulation}
            />
          </TabsContent>
        )}

        {simulationResult && (
          <TabsContent value="results" className="space-y-6 mt-6">
            <SimulationResults result={simulationResult} />
            <WealthProjectionChart 
              projections={simulationResult.projections}
              goalProjections={simulationResult.goalProjections}
              breakEvenMonth={simulationResult.breakEvenMonth}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cenário de Simulação</DialogTitle>
          </DialogHeader>
          <SimulatorForm
            onSubmit={handleSaveScenario}
            onSimulate={(data) => {
              handleSimulate(data);
              setIsFormOpen(false);
              setActiveTab('results');
            }}
            isLoading={createScenario.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteScenarioId} onOpenChange={() => setDeleteScenarioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cenário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar este cenário? Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NivaLogo } from '@/components/brand/NivaLogo';
import { 
  TrendingDown, 
  Target, 
  CreditCard, 
  LineChart,
  Eye,
  Compass,
  Calendar,
  Brain,
  Wallet,
  BarChart3,
  Shield,
  Sparkles,
  Lock,
  UserCheck,
  FileCheck,
  Ban,
  ArrowRight,
  TrendingUp,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 pt-3">
            <NivaLogo size="12xl" />
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-income/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
                Decide melhor com o teu dinheiro.{' '}
                <span className="text-primary">Todos os dias.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                A NIVA organiza, analisa e orienta a tua vida financeira —
                sem confusão, sem promessas vazias.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#como-funciona">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                    Ver como funciona
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Visual mockup */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Património Líquido</p>
                      <p className="text-3xl font-bold text-foreground">2.450.000 Kz</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-income/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-income" />
                    </div>
                  </div>
                  
                  {/* Mini chart visualization */}
                  <div className="h-24 flex items-end gap-2 mb-4">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 95].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-income" />
                      <span className="text-muted-foreground">Receitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-expense" />
                      <span className="text-muted-foreground">Despesas</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -left-8 bg-card rounded-xl border border-border shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-income/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-income" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="text-lg font-bold text-income">780</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-card rounded-xl border border-border shadow-lg p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Meta</p>
                      <p className="text-sm font-semibold text-foreground">75% concluída</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-12 bg-card rounded-xl border border-border shadow-lg p-3 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-xs font-medium">Insight diário</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-muted/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
              A maioria das pessoas não perde dinheiro porque ganha pouco.
            </h2>
            <p className="text-xl text-primary font-semibold">
              Perde porque decide sem clareza.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { icon: TrendingDown, text: 'Despesas sem controlo' },
              { icon: Target, text: 'Metas sem plano' },
              { icon: CreditCard, text: 'Dívidas sem estratégia' },
              { icon: LineChart, text: 'Investimentos sem contexto' },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl bg-background/80 backdrop-blur-sm border border-expense/20 shadow-sm hover:shadow-md hover:border-expense/40 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-expense/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-expense" />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-80 h-80 bg-income/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              A solução
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              A NIVA transforma dados em decisões.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: Eye, text: 'Mostra-te onde estás', color: 'bg-blue-500' },
              { icon: Compass, text: 'Diz-te o que fazer agora', color: 'bg-purple-500' },
              { icon: Calendar, text: 'Ajuda-te a planear o futuro', color: 'bg-orange-500' },
              { icon: Brain, text: 'Aprende contigo ao longo do tempo', color: 'bg-green-500' },
            ].map((item, index) => (
              <div 
                key={index}
                className="group flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                  item.color
                )}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            A NIVA liga os pontos da tua vida financeira e devolve-te clareza para decidir com confiança.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Como funciona
            </h2>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Regista', description: 'As tuas contas e despesas', icon: Wallet },
                { step: '2', title: 'Organiza', description: 'A NIVA organiza tudo automaticamente', icon: PieChart },
                { step: '3', title: 'Orienta', description: 'Recebes orientação diária clara', icon: Compass },
                { step: '4', title: 'Evolui', description: 'Evoluis financeiramente, passo a passo', icon: TrendingUp },
              ].map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tudo o que precisas para decidir melhor.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Wallet, 
                title: 'Gestão de contas', 
                description: 'Gestão completa de contas e despesas',
                gradient: 'from-blue-500/10 to-blue-600/5'
              },
              { 
                icon: Target, 
                title: 'Orçamentos e metas', 
                description: 'Orçamentos e metas realistas',
                gradient: 'from-purple-500/10 to-purple-600/5'
              },
              { 
                icon: CreditCard, 
                title: 'Dívidas e assinaturas', 
                description: 'Dívidas e assinaturas sob controlo',
                gradient: 'from-red-500/10 to-red-600/5'
              },
              { 
                icon: BarChart3, 
                title: 'Investimentos', 
                description: 'Investimentos e oportunidades',
                gradient: 'from-green-500/10 to-green-600/5'
              },
              { 
                icon: Shield, 
                title: 'Score financeiro', 
                description: 'Score financeiro pessoal',
                gradient: 'from-orange-500/10 to-orange-600/5'
              },
              { 
                icon: Sparkles, 
                title: 'Coach com IA', 
                description: 'Coach financeiro diário com IA',
                gradient: 'from-primary/10 to-primary/5'
              },
            ].map((item, index) => (
              <div 
                key={index}
                className={cn(
                  "group p-6 rounded-2xl bg-gradient-to-br border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300",
                  item.gradient
                )}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-muted/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-income/5 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-income/20 to-income/10 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-income/10">
              <Lock className="h-10 w-10 text-income" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              A tua informação financeira é só tua.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Shield, text: 'Dados encriptados' },
              { icon: UserCheck, text: 'Controlo total do utilizador' },
              { icon: FileCheck, text: 'Transparência absoluta' },
              { icon: Ban, text: 'Sem venda de dados' },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl bg-background/80 backdrop-blur-sm border border-income/20 hover:border-income/40 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-income/20 to-income/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-income" />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Começa hoje a tomar decisões financeiras melhores.
          </h2>
          
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="mt-6 text-muted-foreground">
            Sem cartões. Sem compromissos. Sem surpresas.
          </p>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-income" />
              <span className="text-sm">100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              <span className="text-sm">Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">IA integrada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <NivaLogo size="md" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NIVA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
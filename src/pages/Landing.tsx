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
  PiggyBank,
  BarChart3,
  Shield,
  Sparkles,
  Lock,
  UserCheck,
  FileCheck,
  Ban,
  ChevronRight,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Decide melhor com o teu dinheiro.{' '}
            <span className="text-primary">Todos os dias.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A NIVA organiza, analisa e orienta a tua vida financeira —
            sem confusão, sem promessas vazias.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
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
                className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50"
              >
                <div className="h-12 w-12 rounded-lg bg-expense/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-expense" />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              A NIVA transforma dados em decisões.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: Eye, text: 'Mostra-te onde estás' },
              { icon: Compass, text: 'Diz-te o que fazer agora' },
              { icon: Calendar, text: 'Ajuda-te a planear o futuro' },
              { icon: Brain, text: 'Aprende contigo ao longo do tempo' },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
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
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Como funciona
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Regista', description: 'As tuas contas e despesas' },
              { step: '2', title: 'Organiza', description: 'A NIVA organiza tudo automaticamente' },
              { step: '3', title: 'Orienta', description: 'Recebes orientação diária clara' },
              { step: '4', title: 'Evolui', description: 'Evoluis financeiramente, passo a passo' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
                description: 'Gestão completa de contas e despesas' 
              },
              { 
                icon: Target, 
                title: 'Orçamentos e metas', 
                description: 'Orçamentos e metas realistas' 
              },
              { 
                icon: CreditCard, 
                title: 'Dívidas e assinaturas', 
                description: 'Dívidas e assinaturas sob controlo' 
              },
              { 
                icon: BarChart3, 
                title: 'Investimentos', 
                description: 'Investimentos e oportunidades' 
              },
              { 
                icon: Shield, 
                title: 'Score financeiro', 
                description: 'Score financeiro pessoal' 
              },
              { 
                icon: Sparkles, 
                title: 'Coach com IA', 
                description: 'Coach financeiro diário com IA' 
              },
            ].map((item, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-16 w-16 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-income" />
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
                className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50"
              >
                <div className="h-10 w-10 rounded-lg bg-income/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-income" />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Começa hoje a tomar decisões financeiras melhores.
          </h2>
          
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25">
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="mt-6 text-muted-foreground">
            Sem cartões. Sem compromissos. Sem surpresas.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
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
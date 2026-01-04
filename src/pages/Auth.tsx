import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowLeft, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { NivaLogo } from '@/components/brand/NivaLogo';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A password deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A password deve ter pelo menos 6 caracteres'),
});

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

export default function Auth() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '' });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-foreground border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou password incorretos');
      } else {
        toast.error('Erro ao iniciar sessão');
      }
    } else {
      toast.success('Bem-vindo de volta!');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signupSchema.safeParse(signupForm);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.name);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email já está registado');
      } else {
        toast.error('Erro ao criar conta');
      }
    } else {
      toast.success('Conta criada com sucesso!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = resetSchema.safeParse(resetForm);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetForm.email);
    setIsLoading(false);

    if (error) {
      toast.error('Erro ao enviar email de recuperação');
    } else {
      toast.success('Email de recuperação enviado! Verifique a sua caixa de entrada.');
      setShowResetForm(false);
    }
  };

  const features = [
    { icon: TrendingUp, title: 'Controlo Total', description: 'Gerencie todas as suas finanças num só lugar' },
    { icon: Shield, title: 'Segurança Máxima', description: 'Os seus dados protegidos com encriptação avançada' },
    { icon: Sparkles, title: 'Insights Inteligentes', description: 'Recomendações personalizadas para poupar mais' },
  ];

  if (showResetForm) {
    return (
      <div className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 xl:px-20">
            <NivaLogo size="14xl" color="white" />
            <p className="mt-8 text-xl text-white/80 text-center max-w-md">
              O seu sistema pessoal de decisão financeira
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md animate-fade-in">
            <button
              onClick={() => setShowResetForm(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </button>
            
            <div className="lg:hidden mb-8">
              <NivaLogo size="4xl" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">Recuperar Password</h1>
            <p className="text-muted-foreground mb-8">
              Introduza o seu email para receber um link de recuperação
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-12 h-12 text-base"
                    value={resetForm.email}
                    onChange={(e) => setResetForm({ email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? 'A enviar...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center py-12 px-12 xl:px-20 h-full">
          <div className="flex justify-center mb-12">
            <NivaLogo size="14xl" color="white" />
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                O futuro das suas <br />
                <span className="text-accent">finanças pessoais</span>
              </h2>
              <p className="mt-4 text-lg text-white/70 max-w-md">
                Tome decisões financeiras inteligentes com análises em tempo real e insights personalizados.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="p-2 rounded-lg bg-accent/20">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-white/40">
            © 2025 NIVA. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <NivaLogo size="5xl" />
            <p className="mt-2 text-muted-foreground text-sm">
              O seu sistema pessoal de decisão financeira
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo</h1>
            <p className="mt-2 text-muted-foreground">
              Entre na sua conta ou crie uma nova
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
              <TabsTrigger value="login" className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Criar Conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-12 h-12 text-base"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 h-12 text-base"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                  {isLoading ? 'A entrar...' : 'Entrar'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors pt-2"
                >
                  Esqueceu a password?
                </button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-8">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="O seu nome"
                      className="pl-12 h-12 text-base"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-12 h-12 text-base"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 h-12 text-base"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                  {isLoading ? 'A criar conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ao continuar, concorda com os nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Serviço</a>
            {' '}e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
}

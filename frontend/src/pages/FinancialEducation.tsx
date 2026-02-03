import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  Target, 
  Shield,
  Lightbulb,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  content: string[];
  tips: string[];
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Como Criar um Fundo de Emergência',
    description: 'Aprenda a construir uma reserva financeira para imprevistos e garantir a sua tranquilidade.',
    category: 'poupanca',
    readTime: 5,
    content: [
      'Um fundo de emergência é uma reserva de dinheiro destinada a cobrir despesas inesperadas, como problemas de saúde, perda de emprego ou reparações urgentes.',
      'O valor ideal varia conforme o seu perfil, mas especialistas recomendam ter entre 3 a 6 meses de despesas mensais guardados.',
      'Comece pequeno: mesmo poupar 5% do seu salário já é um bom início. O importante é criar o hábito de poupar regularmente.',
    ],
    tips: [
      'Defina um valor mensal fixo para poupar',
      'Mantenha o fundo numa conta separada',
      'Não use para despesas não-urgentes',
      'Reponha sempre que usar',
    ],
  },
  {
    id: '2',
    title: 'Entender os Depósitos a Prazo',
    description: 'Saiba como funcionam os depósitos a prazo e como escolher a melhor opção para o seu dinheiro.',
    category: 'investimentos',
    readTime: 7,
    content: [
      'Os depósitos a prazo são uma forma segura de fazer o seu dinheiro render. Você deixa o dinheiro no banco por um período definido e recebe juros em troca.',
      'Em Angola, as taxas podem variar significativamente entre bancos. Compare sempre antes de decidir.',
      'Atenção ao prazo: quanto mais longo, geralmente maior a taxa de juro, mas menor a liquidez do seu dinheiro.',
    ],
    tips: [
      'Compare taxas entre pelo menos 3 bancos',
      'Considere a taxa líquida (após impostos)',
      'Verifique as condições de resgate antecipado',
      'Diversifique entre diferentes prazos',
    ],
  },
  {
    id: '3',
    title: 'Gestão Inteligente de Dívidas',
    description: 'Estratégias para controlar e eliminar dívidas de forma eficiente.',
    category: 'dividas',
    readTime: 6,
    content: [
      'Nem todas as dívidas são iguais. Dívidas com juros altos, como cartões de crédito, devem ser priorizadas.',
      'O método "bola de neve" sugere pagar primeiro as dívidas menores para ganhar motivação. O método "avalanche" foca nas dívidas com juros mais altos.',
      'Evite contrair novas dívidas enquanto estiver a pagar as existentes. Crie um orçamento realista e siga-o.',
    ],
    tips: [
      'Liste todas as suas dívidas com taxas de juro',
      'Pague sempre mais que o mínimo',
      'Negocie taxas de juro com os credores',
      'Considere consolidação de dívidas se fizer sentido',
    ],
  },
  {
    id: '4',
    title: 'A Importância do Orçamento Familiar',
    description: 'Como criar e manter um orçamento que funcione para a sua família.',
    category: 'orcamento',
    readTime: 5,
    content: [
      'Um orçamento é simplesmente um plano para o seu dinheiro. Sem ele, é fácil gastar mais do que se ganha.',
      'A regra 50/30/20 é um bom ponto de partida: 50% para necessidades, 30% para desejos e 20% para poupança.',
      'Reveja o seu orçamento mensalmente e ajuste conforme necessário. A vida muda e o orçamento deve acompanhar.',
    ],
    tips: [
      'Registe todas as despesas durante um mês',
      'Identifique gastos que pode reduzir',
      'Automatize a poupança no início do mês',
      'Envolva toda a família no planeamento',
    ],
  },
  {
    id: '5',
    title: 'Introdução às OTNR',
    description: 'Obrigações do Tesouro: o que são e como investir nelas em Angola.',
    category: 'investimentos',
    readTime: 8,
    content: [
      'As OTNR (Obrigações do Tesouro Não-Reajustáveis) são títulos de dívida emitidos pelo Estado angolano. São considerados investimentos de baixo risco.',
      'Funcionam como um empréstimo que você faz ao governo. Em troca, recebe juros periódicos (cupões) e o capital de volta no vencimento.',
      'Podem ser adquiridas através de bancos comerciais e corretoras autorizadas. Os prazos variam geralmente de 2 a 10 anos.',
    ],
    tips: [
      'Comece com valores menores para entender o funcionamento',
      'Considere os cupões semestrais no seu planeamento',
      'Verifique a liquidez no mercado secundário',
      'Diversifique entre diferentes maturidades',
    ],
  },
  {
    id: '6',
    title: 'Protecção Contra a Inflação',
    description: 'Estratégias para preservar o valor do seu dinheiro em tempos de inflação alta.',
    category: 'protecao',
    readTime: 6,
    content: [
      'A inflação corrói o poder de compra do seu dinheiro. Em Angola, taxas de inflação elevadas são uma realidade que precisa ser considerada.',
      'Investimentos que rendem acima da inflação são essenciais para preservar e aumentar a sua riqueza real.',
      'Diversificação entre moedas (AOA, USD, EUR) pode ajudar a proteger o seu património.',
    ],
    tips: [
      'Compare sempre rendimentos com a taxa de inflação',
      'Considere investimentos em moeda estrangeira',
      'Evite deixar muito dinheiro parado em conta corrente',
      'Reavalie os seus investimentos regularmente',
    ],
  },
  {
    id: '7',
    title: 'Definir Metas Financeiras SMART',
    description: 'Como criar objectivos financeiros claros e alcançáveis.',
    category: 'metas',
    readTime: 4,
    content: [
      'Metas SMART são: Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais. Este formato aumenta significativamente as chances de sucesso.',
      'Em vez de "quero poupar dinheiro", defina "quero poupar 500.000 Kz em 12 meses para um carro usado".',
      'Divida metas grandes em marcos menores. Celebre cada conquista para manter a motivação.',
    ],
    tips: [
      'Escreva as suas metas e reveja-as regularmente',
      'Defina prazos realistas',
      'Associe cada meta a uma conta ou investimento específico',
      'Acompanhe o progresso mensalmente',
    ],
  },
  {
    id: '8',
    title: 'Kixikila: Poupança Comunitária',
    description: 'Como funcionam os grupos de poupança rotativa tradicionais angolanos.',
    category: 'poupanca',
    readTime: 5,
    content: [
      'A Kixikila é uma forma tradicional de poupança em grupo, onde os participantes contribuem mensalmente e cada um recebe o total em rotação.',
      'É uma excelente forma de disciplinar a poupança e alcançar objectivos que seriam difíceis individualmente.',
      'A confiança entre os membros é fundamental. Escolha bem os participantes e defina regras claras desde o início.',
    ],
    tips: [
      'Documente todas as regras por escrito',
      'Defina penalizações para atrasos',
      'Comece com pessoas de confiança',
      'Use a NIVA para gerir e acompanhar as contribuições',
    ],
  },
];

const categories = [
  { id: 'todos', label: 'Todos', icon: BookOpen },
  { id: 'poupanca', label: 'Poupança', icon: PiggyBank },
  { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  { id: 'dividas', label: 'Dívidas', icon: CreditCard },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'orcamento', label: 'Orçamento', icon: Lightbulb },
  { id: 'protecao', label: 'Protecção', icon: Shield },
];

export default function FinancialEducation() {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'todos' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.label || categoryId;
  };

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="gap-2">
          ← Voltar aos artigos
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{getCategoryLabel(selectedArticle.category)}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedArticle.readTime} min de leitura
              </span>
            </div>
            <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
            <CardDescription className="text-base">{selectedArticle.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedArticle.content.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Dicas Práticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedArticle.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Educação Financeira</h1>
          <p className="text-muted-foreground">Aprenda a gerir melhor o seu dinheiro</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar artigos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Featured Article */}
      {selectedCategory === 'todos' && !searchQuery && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <Badge className="w-fit">Destaque</Badge>
            <CardTitle className="text-xl">{articles[0].title}</CardTitle>
            <CardDescription>{articles[0].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setSelectedArticle(articles[0])} className="gap-2">
              Ler artigo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Articles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map(article => (
          <Card 
            key={article.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{getCategoryLabel(article.category)}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              <CardDescription className="line-clamp-2">{article.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                Ler mais
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum artigo encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Dicas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <PiggyBank className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <h4 className="font-medium">Pague-se primeiro</h4>
                <p className="text-sm text-muted-foreground">
                  Assim que receber o salário, transfira a poupança antes de qualquer despesa.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <TrendingUp className="h-6 w-6 text-blue-500 shrink-0" />
              <div>
                <h4 className="font-medium">Juros compostos</h4>
                <p className="text-sm text-muted-foreground">
                  Reinvista os rendimentos para acelerar o crescimento do seu património.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CreditCard className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <h4 className="font-medium">Evite dívidas de consumo</h4>
                <p className="text-sm text-muted-foreground">
                  Cartões de crédito com juros altos podem rapidamente sair do controlo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Target className="h-6 w-6 text-purple-500 shrink-0" />
              <div>
                <h4 className="font-medium">Tenha objectivos claros</h4>
                <p className="text-sm text-muted-foreground">
                  Saber para que está a poupar aumenta a motivação e disciplina.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

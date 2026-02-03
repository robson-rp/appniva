export const CURRENCIES = [
  { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'ZAR', name: 'Rand Sul-Africano', symbol: 'R' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
] as const;

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Conta Bancária', icon: 'landmark' },
  { value: 'wallet', label: 'Carteira Mobile', icon: 'smartphone' },
  { value: 'cash', label: 'Dinheiro em Mão', icon: 'wallet' },
  { value: 'other', label: 'Outro', icon: 'circle' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Receita', color: 'income' },
  { value: 'expense', label: 'Despesa', color: 'expense' },
  { value: 'transfer', label: 'Transferência', color: 'transfer' },
] as const;

export const INVESTMENT_TYPES = [
  { value: 'term_deposit', label: 'Depósito a Prazo' },
  { value: 'bond_otnr', label: 'OTNR - Obrigações do Tesouro' },
  { value: 'fund', label: 'Fundo de Investimento' },
  { value: 'real_estate', label: 'Imóvel' },
  { value: 'equity', label: 'Acções' },
  { value: 'other', label: 'Outro' },
] as const;

export const INTEREST_FREQUENCIES = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'at_maturity', label: 'No Vencimento' },
] as const;

export const COUPON_FREQUENCIES = [
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
] as const;

export const GOAL_STATUSES = [
  { value: 'in_progress', label: 'Em Progresso', color: 'accent' },
  { value: 'completed', label: 'Concluída', color: 'income' },
  { value: 'cancelled', label: 'Cancelada', color: 'muted' },
] as const;

export const ANGOLA_BANKS = [
  'BFA - Banco de Fomento Angola',
  'BAI - Banco Angolano de Investimentos',
  'BIC - Banco Internacional de Crédito',
  'BPC - Banco de Poupança e Crédito',
  'BCI - Banco de Comércio e Indústria',
  'BMA - Banco Millennium Atlântico',
  'Standard Bank Angola',
  'Banco Económico',
  'Banco Caixa Geral Angola',
  'Banco Sol',
  'Outro',
] as const;

export const MOBILE_WALLETS = [
  'Multicaixa Express',
  'Unitel Money',
  'Paga Já',
  'Kwanza',
  'Outro',
] as const;

export function formatCurrency(amount: number, currency: string = 'AOA'): string {
  const curr = CURRENCIES.find(c => c.code === currency);
  const formatter = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(amount)} ${curr?.symbol || currency}`;
}

export function formatCompactCurrency(amount: number, currency: string = 'AOA'): string {
  const curr = CURRENCIES.find(c => c.code === currency);
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  let formatted: string;
  if (absAmount >= 1_000_000_000) {
    formatted = `${(absAmount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    formatted = `${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 100_000) {
    formatted = `${(absAmount / 1_000).toFixed(0)}K`;
  } else {
    const formatter = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    formatted = formatter.format(absAmount);
  }
  
  return `${sign}${formatted} ${curr?.symbol || currency}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('pt-AO', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

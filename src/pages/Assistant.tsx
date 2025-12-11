import { FinancialAssistantChat } from '@/components/assistant/FinancialAssistantChat';

export default function Assistant() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assistente Financeiro</h1>
        <p className="text-muted-foreground">
          Pergunte qualquer coisa sobre as suas finanças pessoais
        </p>
      </div>

      <FinancialAssistantChat />
    </div>
  );
}

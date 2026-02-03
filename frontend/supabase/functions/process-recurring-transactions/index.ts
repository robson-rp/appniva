import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category_id: string | null;
  cost_center_id: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_execution_date: string;
  end_date: string | null;
}

function calculateNextExecutionDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`Processing recurring transactions for date: ${today}`);
    
    // Get all active recurring transactions due today or before
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_execution_date', today);
    
    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${recurringTransactions?.length || 0} recurring transactions to process`);
    
    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      details: [] as { id: string; status: string; message?: string }[]
    };
    
    for (const rt of (recurringTransactions || []) as RecurringTransaction[]) {
      try {
        // Check if end_date has passed
        if (rt.end_date && new Date(rt.end_date) < new Date(today)) {
          // Deactivate the recurring transaction
          await supabase
            .from('recurring_transactions')
            .update({ is_active: false })
            .eq('id', rt.id);
          
          results.skipped++;
          results.details.push({ 
            id: rt.id, 
            status: 'skipped', 
            message: 'End date passed, deactivated' 
          });
          continue;
        }
        
        // Get account currency
        const { data: account } = await supabase
          .from('accounts')
          .select('currency')
          .eq('id', rt.account_id)
          .single();
        
        // Create the transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: rt.user_id,
            account_id: rt.account_id,
            description: rt.description,
            amount: rt.amount,
            type: rt.type,
            category_id: rt.category_id,
            cost_center_id: rt.cost_center_id,
            currency: account?.currency || 'AOA',
            date: rt.next_execution_date,
          });
        
        if (insertError) {
          console.error(`Error creating transaction for recurring ${rt.id}:`, insertError);
          results.failed++;
          results.details.push({ 
            id: rt.id, 
            status: 'failed', 
            message: insertError.message 
          });
          continue;
        }
        
        // Calculate next execution date
        const nextDate = calculateNextExecutionDate(rt.next_execution_date, rt.frequency);
        
        // Update the recurring transaction
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({
            next_execution_date: nextDate,
            last_executed_at: new Date().toISOString(),
          })
          .eq('id', rt.id);
        
        if (updateError) {
          console.error(`Error updating recurring transaction ${rt.id}:`, updateError);
        }
        
        results.processed++;
        results.details.push({ id: rt.id, status: 'processed' });
        console.log(`Processed recurring transaction ${rt.id}, next date: ${nextDate}`);
        
      } catch (err) {
        console.error(`Error processing recurring transaction ${rt.id}:`, err);
        results.failed++;
        results.details.push({ 
          id: rt.id, 
          status: 'failed', 
          message: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }
    
    console.log(`Processing complete. Processed: ${results.processed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error in process-recurring-transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

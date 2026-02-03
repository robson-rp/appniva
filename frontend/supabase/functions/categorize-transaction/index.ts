import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keyword-based heuristics for common Angolan businesses
const keywordCategories: Record<string, { keywords: string[], categoryName: string }> = {
  supermercado: {
    keywords: ['shoprite', 'candando', 'kero', 'maxi', 'jumbo', 'intermarket', 'nosso super', 'mega cash', 'alimentação'],
    categoryName: 'Alimentação'
  },
  combustivel: {
    keywords: ['sonangol', 'pumangol', 'total', 'galp', 'combustível', 'gasolina', 'gasóleo', 'petrol'],
    categoryName: 'Transporte'
  },
  transporte: {
    keywords: ['uber', 'bolt', 'yango', 'táxi', 'taxi', 'transporte', 'taag', 'voo', 'passagem'],
    categoryName: 'Transporte'
  },
  restaurante: {
    keywords: ['restaurante', 'café', 'coffee', 'pizza', 'burger', 'kfc', 'mcdonald', 'comida'],
    categoryName: 'Alimentação'
  },
  saude: {
    keywords: ['farmácia', 'farmacia', 'hospital', 'clínica', 'clinica', 'médico', 'medico', 'consulta', 'saúde'],
    categoryName: 'Saúde'
  },
  educacao: {
    keywords: ['escola', 'universidade', 'curso', 'formação', 'educação', 'livro', 'material escolar'],
    categoryName: 'Educação'
  },
  telecomunicacoes: {
    keywords: ['unitel', 'movicel', 'africell', 'zap', 'dstv', 'tv cabo', 'internet', 'telefone'],
    categoryName: 'Telecomunicações'
  },
  habitacao: {
    keywords: ['renda', 'aluguer', 'condomínio', 'condominio', 'água', 'luz', 'edel', 'epal'],
    categoryName: 'Habitação'
  },
  lazer: {
    keywords: ['cinema', 'teatro', 'evento', 'festa', 'bar', 'discoteca', 'entretenimento'],
    categoryName: 'Lazer'
  },
  vestuario: {
    keywords: ['roupa', 'sapato', 'loja', 'moda', 'vestuário', 'calçado'],
    categoryName: 'Vestuário'
  },
  salario: {
    keywords: ['salário', 'salario', 'ordenado', 'vencimento', 'pagamento mensal'],
    categoryName: 'Salário'
  }
};

function findCategoryByKeywords(description: string): { categoryName: string; confidence: number } | null {
  const lowerDesc = description.toLowerCase();
  
  for (const [, config] of Object.entries(keywordCategories)) {
    for (const keyword of config.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return {
          categoryName: config.categoryName,
          confidence: 0.85 // High confidence for keyword matches
        };
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, type } = await req.json();

    if (!description || !type) {
      return new Response(
        JSON.stringify({ error: 'Description and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get available categories for the transaction type
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, icon, color')
      .eq('type', type);

    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }

    // First try keyword-based matching
    const keywordMatch = findCategoryByKeywords(description);
    
    if (keywordMatch) {
      const matchedCategory = categories?.find(
        c => c.name.toLowerCase() === keywordMatch.categoryName.toLowerCase()
      );
      
      if (matchedCategory) {
        console.log(`Keyword match found: ${matchedCategory.name} with confidence ${keywordMatch.confidence}`);
        return new Response(
          JSON.stringify({
            category_id: matchedCategory.id,
            category_name: matchedCategory.name,
            confidence: keywordMatch.confidence,
            method: 'keyword'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fall back to AI-based categorization using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          category_id: null,
          category_name: null,
          confidence: 0,
          method: 'none',
          error: 'AI not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const categoryList = categories?.map(c => c.name).join(', ') || '';
    
    const systemPrompt = `Você é um assistente especializado em classificação de transações financeiras em Angola.
    
Dada a descrição de uma transação, você deve classificá-la em uma das seguintes categorias:
${categoryList}

IMPORTANTE:
- Responda APENAS com um JSON válido no formato: {"category": "Nome da Categoria", "confidence": 0.XX}
- O campo confidence deve ser um número entre 0 e 1 indicando sua confiança na classificação
- Se não conseguir determinar a categoria com certeza, use confidence baixo (< 0.5)
- Considere o contexto angolano (moeda Kwanza, empresas locais, etc.)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Classifique esta transação de ${type === 'expense' ? 'despesa' : 'receita'}: "${description}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', aiResponse);

    // Parse AI response
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const suggestedCategory = categories?.find(
          c => c.name.toLowerCase() === parsed.category?.toLowerCase()
        );

        if (suggestedCategory) {
          return new Response(
            JSON.stringify({
              category_id: suggestedCategory.id,
              category_name: suggestedCategory.name,
              confidence: Math.min(parsed.confidence || 0.5, 1),
              method: 'ai'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Return no suggestion if everything fails
    return new Response(
      JSON.stringify({
        category_id: null,
        category_name: null,
        confidence: 0,
        method: 'none'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in categorize-transaction:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        category_id: null,
        category_name: null,
        confidence: 0,
        method: 'error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
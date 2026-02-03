import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, existingTags } = await req.json();

    if (!description || description.trim().length < 3) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ suggestions: [], error: "AI not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tagsList = existingTags?.length > 0 
      ? existingTags.map((t: any) => t.name).join(', ')
      : '';

    const systemPrompt = `Você é um assistente especializado em finanças pessoais. 
Sua tarefa é sugerir tags relevantes para transações financeiras com base na descrição.

${tagsList ? `Tags existentes do usuário: ${tagsList}` : 'O usuário ainda não tem tags criadas.'}

Regras:
1. Sugira de 1 a 3 tags mais relevantes
2. Priorize tags existentes do usuário quando aplicável
3. Sugira novas tags apenas se forem muito relevantes
4. Tags devem ser curtas (1-2 palavras)
5. Use português
6. Exemplos de categorias: alimentação, transporte, lazer, saúde, educação, moradia, compras, trabalho, viagem, assinatura, etc.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Descrição da transação: "${description}"\n\nSugira as tags mais relevantes.` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tags",
              description: "Retorna sugestões de tags para a transação",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome da tag" },
                        isExisting: { type: "boolean", description: "Se a tag já existe nas tags do usuário" },
                        confidence: { type: "number", description: "Confiança da sugestão de 0 a 1" }
                      },
                      required: ["name", "isExisting", "confidence"]
                    },
                    maxItems: 3
                  }
                },
                required: ["suggestions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tags" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log("Rate limited");
        return new Response(
          JSON.stringify({ suggestions: [], error: "Rate limited" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.log("Payment required");
        return new Response(
          JSON.stringify({ suggestions: [], error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    let suggestions: any[] = [];
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.suggestions || [];
      } catch (e) {
        console.error("Error parsing tool response:", e);
      }
    }

    // Match with existing tags
    if (existingTags?.length > 0) {
      suggestions = suggestions.map((s: any) => {
        const existingMatch = existingTags.find(
          (t: any) => t.name.toLowerCase() === s.name.toLowerCase()
        );
        return {
          ...s,
          isExisting: !!existingMatch,
          existingTagId: existingMatch?.id || null,
          name: existingMatch?.name || s.name
        };
      });
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in suggest-tags:", errorMessage);
    return new Response(
      JSON.stringify({ suggestions: [], error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

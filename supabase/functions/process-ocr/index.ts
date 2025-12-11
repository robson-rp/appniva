import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "documentId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get document
    const { data: document, error: docError } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing document:", document.id, document.file_url);

    // Build prompt for OCR extraction
    const systemPrompt = `Você é um especialista em extração de dados de documentos financeiros angolanos.
Analise a imagem do documento financeiro (recibo, factura ou extrato bancário) e extraia as seguintes informações:

1. amount: O valor monetário principal (número, sem símbolos de moeda)
2. description: Descrição do estabelecimento ou serviço
3. date: Data da transação no formato YYYY-MM-DD
4. suggested_category: Uma categoria sugerida entre: Alimentação, Transporte, Saúde, Educação, Entretenimento, Compras, Serviços, Moradia, Outros

Responda APENAS com um objeto JSON válido, sem texto adicional. Exemplo:
{
  "amount": 15000,
  "description": "Supermercado Kero - Compras",
  "date": "2024-01-15",
  "suggested_category": "Alimentação",
  "raw_text": "Texto visível no documento..."
}

Se não conseguir extrair algum campo, use null.`;

    // Call Lovable AI with vision capability
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia os dados financeiros deste documento:",
              },
              {
                type: "image_url",
                image_url: { url: document.file_url },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI Response:", content);

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      extractedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      extractedData = {
        amount: null,
        description: "Não foi possível extrair dados",
        date: null,
        suggested_category: "Outros",
        raw_text: content,
      };
    }

    // Update document with extracted data
    const { error: updateError } = await supabase
      .from("uploaded_documents")
      .update({
        processed: true,
        extracted_data: extractedData,
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Process OCR error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao processar documento";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

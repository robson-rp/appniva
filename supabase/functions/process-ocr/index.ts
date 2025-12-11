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

    console.log("Processing document:", document.id, document.file_url, "type:", document.file_type);

    // Extract the file path from the URL
    const urlParts = document.file_url.split('/storage/v1/object/public/');
    let filePath: string;
    
    if (urlParts.length > 1) {
      // URL format: .../storage/v1/object/public/bucket-name/path
      const pathWithBucket = urlParts[1];
      const bucketEndIndex = pathWithBucket.indexOf('/');
      filePath = pathWithBucket.substring(bucketEndIndex + 1);
    } else {
      // Try alternative format
      const altParts = document.file_url.split('/financial-documents/');
      if (altParts.length > 1) {
        filePath = altParts[1];
      } else {
        throw new Error("Não foi possível extrair o caminho do arquivo");
      }
    }

    console.log("Downloading file from path:", filePath);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("financial-documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      throw new Error("Não foi possível baixar o documento");
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const isPdf = document.file_type === "pdf";
    const mimeType = isPdf ? "application/pdf" : `image/${document.file_type === "image" ? "jpeg" : document.file_type}`;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    console.log("File converted to base64, size:", base64Data.length);

    
    
    // Build prompt based on document type
    const systemPrompt = isPdf
      ? `Você é um especialista em extração de dados de extratos bancários angolanos.
Analise o documento PDF de extrato bancário e extraia TODAS as transações encontradas.

Para cada transação, extraia:
1. amount: O valor monetário (número positivo, sem símbolos de moeda)
2. type: "credit" para depósitos/entradas ou "debit" para levantamentos/saídas
3. description: Descrição da transação
4. date: Data da transação no formato YYYY-MM-DD
5. suggested_category: Uma categoria sugerida entre: Alimentação, Transporte, Saúde, Educação, Entretenimento, Compras, Serviços, Moradia, Salário, Transferência, Outros

Responda APENAS com um objeto JSON válido contendo:
{
  "document_type": "bank_statement",
  "bank_name": "Nome do banco se identificável",
  "account_holder": "Nome do titular se identificável",
  "statement_period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "transactions": [
    {
      "amount": 15000,
      "type": "debit",
      "description": "Pagamento Supermercado Kero",
      "date": "2024-01-15",
      "suggested_category": "Alimentação"
    },
    {
      "amount": 500000,
      "type": "credit",
      "description": "Transferência Recebida",
      "date": "2024-01-10",
      "suggested_category": "Transferência"
    }
  ],
  "raw_text": "Texto extraído do documento..."
}

Se não conseguir extrair algum campo, use null. Extraia o máximo de transações possível.`
      : `Você é um especialista em extração de dados de documentos financeiros angolanos.
Analise a imagem do documento financeiro (recibo, factura) e extraia as seguintes informações:

1. amount: O valor monetário principal (número, sem símbolos de moeda)
2. description: Descrição do estabelecimento ou serviço
3. date: Data da transação no formato YYYY-MM-DD
4. suggested_category: Uma categoria sugerida entre: Alimentação, Transporte, Saúde, Educação, Entretenimento, Compras, Serviços, Moradia, Outros

Responda APENAS com um objeto JSON válido, sem texto adicional. Exemplo:
{
  "document_type": "receipt",
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
                text: isPdf 
                  ? "Extraia TODAS as transações deste extrato bancário:" 
                  : "Extraia os dados financeiros deste documento:",
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
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
      
      // Ensure document_type is set
      if (!extractedData.document_type) {
        extractedData.document_type = isPdf ? "bank_statement" : "receipt";
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      extractedData = {
        document_type: isPdf ? "bank_statement" : "receipt",
        amount: null,
        description: "Não foi possível extrair dados",
        date: null,
        suggested_category: "Outros",
        raw_text: content,
        transactions: isPdf ? [] : undefined,
      };
    }

    console.log("Extracted data:", JSON.stringify(extractedData, null, 2));

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

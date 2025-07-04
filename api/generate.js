// api/generate.js - VERSÃO INTELIGENTE COM AS DUAS APIs

// Lógica da API da Groq
async function handleGroqRequest(apiKey, conversa, promptDoSistema) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: promptDoSistema },
        { role: 'user', content: conversa }
      ],
      model: 'llama3-8b-8192',
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro da API da Groq: ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// Lógica da API do Gemini
async function handleGeminiRequest(apiKey, conversa, promptDoSistema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptDoSistema + conversa }] }]
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro da API do Google: ${errorText}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}


// Handler principal que decide qual função chamar
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  const { conversa } = request.body;
  if (!conversa) {
    return response.status(400).json({ error: 'Nenhuma conversa foi fornecida.' });
  }
    
  // O prompt é o mesmo para ambos, então definimos aqui
  const promptDoSistema = `[COLE SEU PROMPT COMPLETO AQUI...]`;

  try {
    let relatorioGerado;
    
    // AQUI ESTÁ A MÁGICA: Decidimos qual IA usar
    if (process.env.AI_PROVIDER === 'groq') {
      console.log("Usando provedor: Groq");
      relatorioGerado = await handleGroqRequest(process.env.GROQ_API_KEY, conversa, promptDoSistema);
    } else {
      console.log("Usando provedor: Gemini (padrão)");
      relatorioGerado = await handleGeminiRequest(process.env.GEMINI_API_KEY, conversa, promptDoSistema);
    }
    
    return response.status(200).json({ report: relatorioGerado });

  } catch (error) {
    return response.status(500).json({ error: `Erro interno do servidor: ${error.message}` });
  }
}

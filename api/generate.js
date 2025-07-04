// Este é o código da Estratégia 1, trocando o modelo para o Mixtral.

// --- Lógica para a API da Groq ---
async function handleGroqRequest(apiKey, conversa, promptDoSistema) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const corpoDaRequisicao = {
    messages: [
      { 
        role: 'user', 
        content: promptDoSistema + "\n\n--- CONVERSA PARA ANALISAR ---\n\n" + conversa 
      }
    ],
    // --- AQUI ESTÁ A ÚNICA MUDANÇA ---
    // Trocamos o modelo da família Llama 3 pelo Mixtral.
    model: 'mixtral-8x7b-32768',
    
    temperature: 0,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corpoDaRequisicao),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro da API da Groq: ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// --- Lógica para a API do Gemini ---
async function handleGeminiRequest(apiKey, conversa, promptDoSistema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptDoSistema + "\n\n--- CONVERSA PARA ANALISAR ---\n\n" + conversa }] }]
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro da API do Google: ${errorText}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}


// --- Handler Principal que decide qual API chamar ---
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  const { conversa } = request.body;
  if (!conversa) {
    return response.status(400).json({ error: 'Nenhuma conversa foi fornecida.' });
  }
    
  const promptDoSistema = `
Você é um assistente de suporte técnico altamente eficiente. Sua principal tarefa é ler a transcrição de uma conversa de chat entre um atendente e um cliente e, a partir dela, preencher um relatório de atendimento de forma estruturada e concisa.

Use o seguinte modelo para o relatório final. NÃO inclua nenhuma outra informação ou frase além deste modelo, fale sempre na primeira pessoa e no gerador não coloque nenhuma informação do cliente como o cpf por exemplo:

RELATO DO CLIENTE:
[Descreva aqui o problema inicial relatado pelo cliente em uma ou duas frases]

PROCEDIMENTOS REALIZADOS:
[Descreva aqui os passos técnicos que o atendente realizou para solucionar o problema. Inclua o diagnóstico e a solução aplicada. Se o atendente deu alguma instrução ao cliente, mencione-a aqui.]

Nome do Cliente: [Extraia o nome do cliente da conversa

// Este é o código final e completo para o arquivo: api/generate.js
// Ele contém a lógica para as APIs da Groq e do Gemini.

// --- Lógica para a API da Groq ---
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

// --- Lógica para a API do Gemini ---
async function handleGeminiRequest(apiKey, conversa, promptDoSistema) {
  // A URL da API do Google agora usa a chave diretamente no final
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Para o Gemini, o ideal é concatenar o prompt de sistema com a conversa do usuário
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
    
  // O prompt do sistema é definido uma vez e usado por ambas as funções
  const promptDoSistema = `
Você é um assistente de suporte técnico altamente eficiente. Sua principal tarefa é ler a transcrição de uma conversa de chat entre um atendente e um cliente e, a partir dela, preencher um relatório de atendimento de forma estruturada e concisa.

Use o seguinte modelo para o relatório final. NÃO inclua nenhuma outra informação ou frase além deste modelo, fale sempre na primeira pessoa e no gerador não coloque nenhuma informação do cliente como o cpf por exemplo:

RELATO DO CLIENTE:
[Descreva aqui o problema inicial relatado pelo cliente em uma ou duas frases]

PROCEDIMENTOS REALIZADOS:
[Descreva aqui os passos técnicos que o atendente realizou para solucionar o problema. Inclua o diagnóstico e a solução aplicada. Se o atendente deu alguma instrução ao cliente, mencione-a aqui.]

Nome do Cliente: [Extraia o nome do cliente da conversa]
Usuário e Senha de Acesso ao Roteador: -
Telefone do Cliente: [Extraia o telefone do cliente da conversa]
Protocolo OPA [Extraia o número de protocolo da conversa]
`;

  try {
    let relatorioGerado;
    
    // A mágica acontece aqui: decidimos qual IA usar com base na variável de ambiente
    if (process.env.AI_PROVIDER === 'groq') {
      console.log("Usando provedor: Groq");
      // Para a Groq, passamos o prompt de sistema e a conversa separadamente
      relatorioGerado = await handleGroqRequest(process.env.GROQ_API_KEY, conversa, promptDoSistema);
    } else {
      console.log("Usando provedor: Gemini (padrão)");
      // Para o Gemini, passamos a chave da API do Gemini e juntamos o prompt com a conversa
      relatorioGerado = await handleGeminiRequest(process.env.GEMINI_API_KEY, conversa, promptDoSistema);
    }
    
    return response.status(200).json({ report: relatorioGerado });

  } catch (error) {
    console.error("Erro detalhado no servidor:", error); // Adicionado para melhor depuração
    return response.status(500).json({ error: `Erro interno do servidor: ${error.message}` });
  }
}

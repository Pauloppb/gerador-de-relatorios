// CÓDIGO FINAL COM PROMPT REFINADO (ESTRATÉGIA JSON)

// --- Lógica para a API da Groq com JSON ---
async function handleGroqRequest(apiKey, conversa, promptJson) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const corpoDaRequisicao = {
    messages: [
      { 
        role: 'user', 
        content: promptJson + "\n\n--- CONVERSA PARA ANALISAR ---\n\n" + conversa 
      }
    ],
    model: 'llama3-70b-8192',
    temperature: 0,
    response_format: { "type": "json_object" },
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
  const jsonString = data.choices[0].message.content;
  const dadosDoRelatorio = JSON.parse(jsonString);

  const relatorioFinal = `RELATO DO CLIENTE:
${dadosDoRelatorio.relato_cliente}

PROCEDIMENTOS REALIZADOS:
${dadosDoRelatorio.procedimentos_realizados}

Nome do Cliente: ${dadosDoRelatorio.nome_cliente}
Usuário e Senha de Acesso ao Roteador: -
Telefone do Cliente: ${dadosDoRelatorio.telefone_cliente}
Protocolo OPA: ${dadosDoRelatorio.protocolo_opa}`;
  
  return relatorioFinal;
}


// --- Lógica para a API do Gemini ---
async function handleGeminiRequest(apiKey, conversa, promptDoSistema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptDoSistema + "\n\n--- CONVERSA PARA ANALISAR ---\n\n" + conversa }] }]
    }),
  });
  if

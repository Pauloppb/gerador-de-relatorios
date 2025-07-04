// CÓDIGO FINAL E DEFINITIVO USANDO A ESTRATÉGIA JSON
// Esta é a abordagem profissional e à prova de falhas.

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
    // Usaremos o Mixtral que é ótimo para tarefas estruturadas.
    model: 'mixtral-8x7b-32768',
    temperature: 0,
    // NOVO E CRUCIAL: Instruindo a IA que a resposta DEVE ser em formato JSON.
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
  // Pega o conteúdo, que agora é uma string contendo o JSON
  const jsonString = data.choices[0].message.content;
  
  // 1. O CÓDIGO INTERPRETA (FAZ O "PARSE") DA STRING JSON PARA UM OBJETO
  const dadosDoRelatorio = JSON.parse(jsonString);

  // 2. O CÓDIGO MONTA O RELATÓRIO FINAL, COM CONTROLE TOTAL SOBRE O FORMATO
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


// --- A função do Gemini pode permanecer a mesma, pois estava funcionando ---
async function handleGeminiRequest(apiKey, conversa, promptDoSistema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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


// --- Handler Principal ---
export default async function handler(request, response) {
  if (request.method !== 'POST') { return response.status(405).json({ message: 'Apenas o método POST é permitido' }); }
  const { conversa } = request.body;
  if (!conversa) { return response.status(400).json({ error: 'Nenhuma conversa foi fornecida.' }); }
    
  // --- PROMPT NOVO E ESPECÍFICO PARA A TAREFA JSON (USADO PELA GROQ) ---
  const promptJson = `
Sua tarefa é extrair informações de uma transcrição de chat e retornar um objeto JSON. NÃO retorne nada além do objeto JSON.
O objeto JSON deve ter as seguintes chaves, todas como strings: "relato_cliente", "procedimentos_realizados", "nome_cliente", "telefone_cliente", "protocolo_opa".

- "relato_cliente": Um resumo conciso do problema inicial do cliente.
- "procedimentos_realizados": Descreva todos os passos técnicos que o atendente realizou e as orientações dadas. Fale sempre em primeira pessoa, como se fosse o atendente (ex: "Realizei um reset...", "Orientei o cliente a...").
- "nome_cliente": Extraia o nome do cliente. Se não encontrar, use "-".
- "telefone_cliente": Extraia o telefone do cliente. Se não encontrar, use "-".
- "protocolo_opa": Extraia o número do protocolo OPA. Se não encontrar, use "-".

Analise a conversa abaixo e gere o objeto JSON correspondente.
`;
  
  // Este prompt antigo agora só será usado pelo Gemini
  const promptAntigo = `
Você é um assistente de suporte técnico altamente eficiente. Sua principal tarefa é ler a transcrição de uma conversa de chat entre um atendente e um cliente e, a partir dela, preencher um relatório de atendimento de forma estruturada e concisa.

Use o seguinte modelo para o relatório final. NÃO inclua nenhuma outra informação ou frase além deste modelo, fale sempre na primeira pessoa e no gerador não coloque nenhuma informação do cliente como o cpf por exemplo:

RELATO DO CLIENTE:
[Descreva aqui o problema inicial relatado pelo cliente em uma ou duas frases]

PROCEDIMENTOS REALIZADOS:
[Descreva aqui os passos técnicos que o atendente realizou para solucionar o problema. Inclua o diagnóstico e a solução aplicada. Se o atendente deu alguma instrução ao cliente, mencione-a aqui.]

Nome do Cliente: [Extraia o nome do cliente da conversa]
Usuário e Senha de Acesso ao Roteador: -
Telefone do Cliente: [Extraia o telefone do cliente da conversa]
Protocolo OPA: [Extraia o número de protocolo da conversa]
`;

  try {
    let relatorioGerado;
    
    if (process.env.AI_PROVIDER === 'groq') {
      console.log("Usando provedor: Groq (Estratégia JSON)");
      relatorioGerado = await handleGroqRequest(process.env.GROQ_API_KEY, conversa, promptJson);
    } else {
      console.log("Usando provedor: Gemini (padrão)");
      relatorioGerado = await handleGeminiRequest(process.env.GEMINI_API_KEY, conversa, promptAntigo);
    }
    
    return response.status(200).json({ report: relatorioGerado });

  } catch (error) {
    console.error("Erro detalhado no servidor:", error);
    return response.status(500).json({ error: `Erro interno do servidor: ${error.message}` });
  }
}

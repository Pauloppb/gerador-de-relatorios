// CÓDIGO FINAL E COMPLETO COM TODOS OS REFINAMENTOS

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
    model: 'llama3-8b-8192',
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
    
  // --- PROMPT JSON COM O ÚLTIMO REFINAMENTO ---
  const promptJson = `
Sua tarefa é extrair informações de uma transcrição de chat e retornar um objeto JSON. NÃO retorne nada além do objeto JSON.
O objeto JSON deve ter as seguintes chaves, todas como strings: "relato_cliente", "procedimentos_realizados", "nome_cliente", "telefone_cliente", "protocolo_opa".

### Regras de Preenchimento:
- "relato_cliente": Um resumo conciso do problema inicial do cliente.
- "procedimentos_realizados": Descreva os passos técnicos de forma objetiva, usando frases diretas. Comece com as ações realizadas no sistema e depois as orientações dadas ao cliente. Fale sempre em primeira pessoa (ex: "Realizei um reset...", "Orientei o cliente a...").
- "nome_cliente": Extraia o nome do cliente. O atendente se chama Paulo Brito. O cliente é a outra pessoa na conversa. Se não encontrar, use "-".
- "telefone_cliente": Extraia o telefone do cliente. Se não encontrar, use "-".
- "protocolo_opa": Extraia o número do protocolo OPA. Se não encontrar, use "-".

### Exemplo de Uso:
--- CONVERSA PARA ANALISAR ---
CLIENTE: Oi, minha TV não liga.
ATENDENTE: Ok, senhora Maria. Já reiniciei seu sinal. Por favor, tire o aparelho da tomada por 1 minuto. O protocolo é 12345.
CLIENTE: Ok, funcionou!
--- JSON ESPERADO ---
{
  "relato_cliente": "Cliente informou que sua TV não estava ligando.",
  "procedimentos_realizados": "Realizei o reinício do sinal remotamente. Orientei a cliente a desligar o aparelho da tomada por 1 minuto como procedimento de teste.",
  "nome_cliente": "Maria",
  "telefone_cliente": "-",
  "protocolo_opa": "12345"
}
### Fim do Exemplo

Agora, analise a conversa abaixo e gere o objeto JSON correspondente.
`;
  
  const promptAntigo = `
Você é um assistente de suporte técnico altamente eficiente... [etc]
`;

  try {
    let relatorioGerado;
    
    if (process.env.AI_PROVIDER === 'groq') {
      console.log("Usando provedor: Groq (JSON com Llama3 8b)");
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

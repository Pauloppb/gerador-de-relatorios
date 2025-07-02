// Este é o código do nosso servidor seguro (api/generate.js)

export default async function handler(request, response) {
  // 1. Apenas permite requisições do tipo POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  // 2. Pega a Chave de API das variáveis de ambiente da Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  // 3. Pega a conversa enviada pelo nosso site
  const { conversa } = request.body;
  if (!conversa) {
    return response.status(400).json({ error: 'Nenhuma conversa foi fornecida.' });
  }

  // 4. Monta o prompt completo (aqui dentro do servidor)
  const seuPrompt = `
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

---

Agora, leia a conversa abaixo e preencha o relatório:
`;

  try {
    // 5. Chama a API do Google a partir do nosso servidor
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: seuPrompt + conversa }] }]
      }),
    });

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      return response.status(googleResponse.status).json({ error: `Erro da API do Google: ${errorText}` });
    }

    const data = await googleResponse.json();
    const relatorioGerado = data.candidates[0].content.parts[0].text;

    // 6. Envia o relatório de volta para o nosso site
    return response.status(200).json({ report: relatorioGerado });

  } catch (error) {
    return response.status(500).json({ error: `Erro interno do servidor: ${error.message}` });
  }
}

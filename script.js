// =======================================================
// LÓGICA PARA O TEMA (CLARO/ESCURO)
// =======================================================

// Função para alternar o tema, chamada pelo botão no HTML
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("preferred-theme", newTheme); // Salva a preferência
}

// Função para carregar o tema salvo do usuário
function loadTheme() {
  const savedTheme = localStorage.getItem("preferred-theme");
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  }
}

// =======================================================
// LÓGICA PRINCIPAL DO GERADOR DE RELATÓRIO
// =======================================================

// Espera o conteúdo da página carregar completamente
document.addEventListener('DOMContentLoaded', () => {

  // Carrega o tema salvo assim que a página abre
  loadTheme();

  // --- CONFIGURAÇÃO INICIAL DO GERADOR ---
  const botaoGerar = document.getElementById('gerar-btn');
  const campoConversa = document.getElementById('conversa');
  const campoResultado = document.getElementById('resultado');

  // IMPORTANTE: Sua Chave de API.
  const API_KEY = process.env.GEMINI_API_KEY;

  // O prompt que você criou e testou no Google AI Studio
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

  // --- FUNÇÃO PRINCIPAL DO GERADOR ---
  async function gerarRelatorio() {

    const conversa = campoConversa.value;

    if (conversa.trim() === '') {
      alert('Por favor, cole a conversa na primeira caixa de texto.');
      return;
    }

    // Desabilita o botão e mostra uma mensagem de "carregando"
    botaoGerar.disabled = true;
    botaoGerar.innerText = 'Gerando...';
    campoResultado.value = 'Aguarde um instante, a Inteligência Artificial está trabalhando...';

    try {
      // Monta a URL da API do Google Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

      // Monta o corpo da requisição com o prompt e a conversa
      const corpoRequisicao = {
        contents: [{
          parts: [{
            text: seuPrompt + conversa
          }]
        }]
      };

      // Faz a chamada para a API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(corpoRequisicao)
      });

      // Verifica se a resposta da API foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      // Extrai os dados da resposta
      const data = await response.json();

      // Extrai o texto gerado pela IA
      const relatorioGerado = data.candidates[0].content.parts[0].text;

      // Exibe o relatório final no campo de resultado
      campoResultado.value = relatorioGerado.trim();

    } catch (error) {
      // Em caso de erro, exibe uma mensagem no campo de resultado
      console.error("Ocorreu um erro:", error);
      campoResultado.value = `Ocorreu um erro ao gerar o relatório. Verifique o console (F12) para mais detalhes. Erro: ${error.message}`;
      alert('Houve um erro. Verifique se sua Chave de API está correta.');
    } finally {
      // Reabilita o botão, independentemente de sucesso ou erro
      botaoGerar.disabled = false;
      botaoGerar.innerText = 'Gerar Relatório';
    }
  }

  // Adiciona o evento de clique ao botão
  botaoGerar.addEventListener('click', gerarRelatorio);
});
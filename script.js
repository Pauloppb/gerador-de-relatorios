// =======================================================
// LÓGICA PARA O TEMA (CLARO/ESCURO)
// =======================================================
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("preferred-theme", newTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("preferred-theme");
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  }
}

// =======================================================
// LÓGICA PRINCIPAL DO GERADOR DE RELATÓRIO
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  const botaoGerar = document.getElementById('gerar-btn');
  const campoConversa = document.getElementById('conversa');
  const campoResultado = document.getElementById('resultado');

  async function gerarRelatorio() {
    const conversa = campoConversa.value;
    if (conversa.trim() === '') {
      alert('Por favor, cole a conversa na primeira caixa de texto.');
      return;
    }

    botaoGerar.disabled = true;
    botaoGerar.innerText = 'Gerando...';
    campoResultado.value = 'Aguarde um instante, a Inteligência Artificial está trabalhando...';

    try {
      // MUDANÇA IMPORTANTE: Agora chamamos a nossa própria API
      const url = '/api/generate'; // Caminho para a nossa função serverless

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversa: conversa }) // Enviamos apenas a conversa
      });

      // CORREÇÃO IMPORTANTE AQUI
      // Primeiro, verificamos se a requisição foi bem-sucedida.
      if (!response.ok) {
        // Se não foi (ex: erro 404 ou 500), lemos a resposta como TEXTO.
        const errorText = await response.text();
        throw new Error(`O servidor respondeu com erro ${response.status}. Detalhes: ${errorText}`);
      }
      
      // Apenas se a resposta foi OK, tentamos ler como JSON.
      const data = await response.json();
      const relatorioGerado = data.report;
      campoResultado.value = relatorioGerado.trim();

    } catch (error) {
      console.error("Ocorreu um erro:", error);
      campoResultado.value = `Ocorreu um erro ao gerar o relatório. Detalhes: ${error.message}`;
      alert('Houve um erro. Verifique o console (F12) para mais detalhes.');
    } finally {
      botaoGerar.disabled = false;
      botaoGerar.innerText = 'Gerar Relatório';
    }
  }

  botaoGerar.addEventListener('click', gerarRelatorio);

  // ### ALTERAÇÃO 1: LÓGICA DO BOTÃO COPIAR ###
  const botaoCopiar = document.getElementById('copiar-btn');
  botaoCopiar.addEventListener('click', () => {
    // Verifica se há texto para copiar
    if (campoResultado.value.trim() === '') {
      alert('Não há nada para copiar ainda.');
      return;
    }

    // Usa a API do navegador para copiar o texto
    navigator.clipboard.writeText(campoResultado.value)
      .then(() => {
        // Sucesso!
        alert('Relatório copiado para a área de transferência!');
      })
      .catch(err => {
        // Erro
        console.error('Erro ao copiar o texto: ', err);
        alert('Ocorreu um erro ao tentar copiar o texto.');
      });
  });

  // ### ALTERAÇÃO 2: LÓGICA DO BOTÃO LIMPAR ###
  const botaoLimpar = document.getElementById('limpar-btn');
  botaoLimpar.addEventListener('click', () => {
    campoConversa.value = '';
    campoResultado.value = '';
    // Opcional: focar na primeira caixa de texto após limpar
    campoConversa.focus();
  });
});

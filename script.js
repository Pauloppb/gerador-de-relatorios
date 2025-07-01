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
      const url = '/api/generate';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversa: conversa })
      });

      // ---- CORREÇÃO IMPORTANTE AQUI ----
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
});

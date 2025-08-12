// =======================================================
// CÓDIGO REVISADO COM DEBUG E CORREÇÕES
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ### INSERÇÃO DO ANO ATUAL ###
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // --- ELEMENTOS DOM COM VERIFICAÇÃO ---
    const botaoGerar = document.getElementById('gerar-btn');
    const botaoGerarTexto = document.getElementById('gerar-btn-text');
    const campoConversa = document.getElementById('conversa');
    const campoResultado = document.getElementById('resultado');
    const botaoCopiar = document.getElementById('copiar-btn');
    const botaoLimpar = document.getElementById('limpar-btn');

    // DEBUG: Verificar se todos os elementos foram encontrados
    console.log('🔍 Debug - Elementos encontrados:', {
        botaoGerar: !!botaoGerar,
        botaoGerarTexto: !!botaoGerarTexto,
        campoConversa: !!campoConversa,
        campoResultado: !!campoResultado,
        botaoCopiar: !!botaoCopiar,
        botaoLimpar: !!botaoLimpar
    });

    // Se algum elemento não foi encontrado, mostrar erro
    if (!botaoGerar || !campoConversa || !campoResultado) {
        console.error('❌ ERRO: Elementos essenciais não encontrados no DOM');
        return;
    }

    // --- FUNÇÃO PRINCIPAL PARA GERAR O RELATÓRIO ---
    async function gerarRelatorio() {
        console.log('🚀 Iniciando geração do relatório...');
        
        const conversa = campoConversa.value;
        
        // Validação de entrada
        if (!conversa || conversa.trim() === '') {
            console.warn('⚠️ Campo de conversa vazio');
            alert('Por favor, cole a conversa na primeira caixa de texto.');
            campoConversa.focus();
            return;
        }

        console.log('📝 Conversa capturada:', conversa.length, 'caracteres');
        
        // Estado visual de carregamento
        botaoGerar.disabled = true;
        if (botaoGerarTexto) {
            botaoGerarTexto.innerHTML = '<i class="fas fa-circle-notch icon-spin mr-2"></i> Gerando...';
        }
        campoResultado.value = 'Aguarde um instante, a Inteligência Artificial está trabalhando...';

        try {
            console.log('📡 Fazendo requisição para API...');
            
            const url = '/api/generate';
            console.log('🔗 URL da API:', url);
            
            const requestBody = { conversa: conversa };
            console.log('📦 Corpo da requisição:', requestBody);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📨 Status da resposta:', response.status);
            console.log('📨 Headers da resposta:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });
                throw new Error(`Erro ${response.status}: ${response.statusText}. Detalhes: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            console.log('📄 Content-Type da resposta:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.error('❌ Resposta não é JSON:', responseText);
                throw new Error('Resposta da API não é JSON válido');
            }

            const data = await response.json();
            console.log('✅ Dados recebidos:', data);

            if (!data.report) {
                console.error('❌ Campo "report" não encontrado na resposta:', data);
                throw new Error('Campo "report" não encontrado na resposta da API');
            }

            const relatorioFinal = data.report.trim();
            console.log('📄 Relatório final:', relatorioFinal.length, 'caracteres');
            
            campoResultado.value = relatorioFinal;
            
            // Feedback de sucesso
            console.log('✅ Relatório gerado com sucesso!');

        } catch (error) {
            console.error("❌ Erro completo:", {
                message: error.message,
                stack: error.stack,
                name: error.name,
                timestamp: new Date().toISOString()
            });

            let mensagemUsuario = `Ocorreu um erro ao gerar o relatório: ${error.message}`;
            
            // Mensagens específicas baseadas no tipo de erro
            if (error.message.includes('Failed to fetch')) {
                mensagemUsuario = 'Erro de conexão. Verifique se o servidor está rodando e se há conexão com a internet.';
            } else if (error.message.includes('500')) {
                mensagemUsuario = 'Erro interno do servidor (500). O servidor pode estar sobrecarregado.';
            } else if (error.message.includes('404')) {
                mensagemUsuario = 'Endpoint da API não encontrado (404). Verifique se a rota /api/generate existe.';
            } else if (error.message.includes('JSON')) {
                mensagemUsuario = 'Erro ao processar a resposta do servidor. A resposta não é um JSON válido.';
            }

            campoResultado.value = mensagemUsuario;
            
            // Alert apenas para erros críticos
            if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
                alert('Erro de conexão ou servidor. Verifique o console (F12) para mais detalhes.');
            }

        } finally {
            // Sempre restaura o estado do botão
            botaoGerar.disabled = false;
            if (botaoGerarTexto) {
                botaoGerarTexto.innerHTML = '<i class="fas fa-magic mr-2"></i> Gerar Relatório';
            }
            console.log('🔄 Estado do botão restaurado');
        }
    }

    // --- EVENT LISTENERS ---
    botaoGerar.addEventListener('click', gerarRelatorio);
    console.log('👆 Event listener do botão gerar adicionado');

    // --- LÓGICA DO BOTÃO LIMPAR ---
    if (botaoLimpar) {
        botaoLimpar.addEventListener('click', () => {
            console.log('🧹 Limpando campos...');
            campoConversa.value = '';
            campoResultado.value = '';
            campoConversa.focus();
        });
        console.log('👆 Event listener do botão limpar adicionado');
    }

    // --- LÓGICA DO BOTÃO COPIAR ---
    if (botaoCopiar) {
        botaoCopiar.addEventListener('click', async () => {
            console.log('📋 Tentando copiar texto...');
            
            if (campoResultado.value.trim() === '') {
                console.warn('⚠️ Nada para copiar');
                alert('Não há nada para copiar ainda.');
                return;
            }

            try {
                await navigator.clipboard.writeText(campoResultado.value);
                console.log('✅ Texto copiado com sucesso');
                
                // Feedback visual
                const originalText = botaoCopiar.innerHTML;
                botaoCopiar.innerHTML = '<i class="fas fa-check mr-1"></i> Copiado!';
                botaoCopiar.disabled = true;
                
                setTimeout(() => {
                    botaoCopiar.innerHTML = originalText;
                    botaoCopiar.disabled = false;
                }, 2000);

            } catch (err) {
                console.error('❌ Erro ao copiar:', err);
                
                // Fallback para navegadores mais antigos
                try {
                    campoResultado.select();
                    campoResultado.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    console.log('✅ Texto copiado via fallback');
                } catch (fallbackErr) {
                    console.error('❌ Fallback também falhou:', fallbackErr);
                    alert('Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C');
                }
            }
        });
        console.log('👆 Event listener do botão copiar adicionado');
    }

    // --- VERIFICAÇÃO FINAL ---
    console.log('✅ Inicialização completa. Sistema pronto para uso.');
    
    // Teste de conectividade com a API (opcional)
    // testConectividadeAPI();
});

// --- FUNÇÃO DE TESTE DE CONECTIVIDADE (OPCIONAL) ---
async function testConectividadeAPI() {
    console.log('🔬 Testando conectividade com a API...');
    
    try {
        const response = await fetch('/api/health', { method: 'GET' });
        if (response.ok) {
            console.log('✅ API está online');
        } else {
            console.warn('⚠️ API respondeu com status:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar com a API:', error.message);
    }
}

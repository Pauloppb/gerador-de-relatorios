// =======================================================
// GERADOR DE RELATÓRIO - VERSÃO MELHORADA
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURAÇÕES ---
    const CONFIG = {
        API_URL: '/api/generate',
        TIMEOUTS: {
            COPY_FEEDBACK: 2000,
            REQUEST_TIMEOUT: 30000 // 30 segundos
        },
        LIMITS: {
            MAX_CHARS: 50000 // Limite de caracteres
        },
        MESSAGES: {
            EMPTY_CONVERSATION: 'Por favor, cole a conversa na primeira caixa de texto.',
            LOADING: 'Aguarde um instante, a Inteligência Artificial está trabalhando...',
            NOTHING_TO_COPY: 'Não há nada para copiar ainda.',
            ERROR_ALERT: 'Houve um erro. Verifique o console (F12) para mais detalhes.',
            TOO_LONG: 'A conversa é muito longa. Limite máximo: 50.000 caracteres.',
            NO_CONNECTION: 'Sem conexão com a internet. Verifique sua conexão.'
        }
    };

    // --- ELEMENTOS DOM ---
    const elementos = {
        botaoGerar: document.getElementById('gerar-btn'),
        botaoGerarTexto: document.getElementById('gerar-btn-text'),
        campoConversa: document.getElementById('conversa'),
        campoResultado: document.getElementById('resultado'),
        botaoCopiar: document.getElementById('copiar-btn'),
        botaoLimpar: document.getElementById('limpar-btn'),
        anoAtual: document.getElementById('current-year')
    };

    // --- INICIALIZAÇÃO ---
    function inicializar() {
        // Atualiza o ano no rodapé
        if (elementos.anoAtual) {
            elementos.anoAtual.textContent = new Date().getFullYear();
        }

        // Adiciona contador de caracteres
        adicionarContadorCaracteres();
        
        // Configura event listeners
        configurarEventListeners();
    }

    // --- CONTADOR DE CARACTERES ---
    function adicionarContadorCaracteres() {
        const contador = document.createElement('div');
        contador.id = 'char-counter';
        contador.className = 'text-sm text-gray-500 mt-1';
        elementos.campoConversa.parentNode.appendChild(contador);
        
        function atualizarContador() {
            const count = elementos.campoConversa.value.length;
            const max = CONFIG.LIMITS.MAX_CHARS;
            contador.textContent = `${count.toLocaleString()}/${max.toLocaleString()} caracteres`;
            contador.style.color = count > max ? '#ef4444' : '#6b7280';
        }
        
        elementos.campoConversa.addEventListener('input', atualizarContador);
        atualizarContador();
    }

    // --- VALIDAÇÕES ---
    function validarEntrada(conversa) {
        if (!conversa || conversa.trim() === '') {
            throw new Error(CONFIG.MESSAGES.EMPTY_CONVERSATION);
        }
        
        if (conversa.length > CONFIG.LIMITS.MAX_CHARS) {
            throw new Error(CONFIG.MESSAGES.TOO_LONG);
        }
        
        if (!navigator.onLine) {
            throw new Error(CONFIG.MESSAGES.NO_CONNECTION);
        }
        
        return true;
    }

    // --- FUNÇÃO PRINCIPAL PARA GERAR RELATÓRIO ---
    async function gerarRelatorio() {
        const conversa = elementos.campoConversa.value;
        
        try {
            // Validações
            validarEntrada(conversa);
            
            // UI: Estado de carregamento
            definirEstadoCarregamento(true);
            
            // Faz a requisição
            const relatorio = await chamarAPI(conversa);
            
            // Exibe o resultado
            elementos.campoResultado.value = relatorio.trim();
            
        } catch (error) {
            tratarErro(error);
        } finally {
            definirEstadoCarregamento(false);
        }
    }

    // --- CHAMADA PARA API ---
    async function chamarAPI(conversa) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUTS.REQUEST_TIMEOUT);
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ conversa }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.report) {
                throw new Error('Resposta da API inválida');
            }
            
            return data.report;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Tempo limite excedido. Tente novamente.');
            }
            
            throw error;
        }
    }

    // --- GERENCIAMENTO DE ESTADO DA UI ---
    function definirEstadoCarregamento(carregando) {
        if (carregando) {
            elementos.botaoGerar.disabled = true;
            elementos.botaoGerarTexto.innerHTML = '<i class="fas fa-circle-notch icon-spin mr-2"></i> Gerando...';
            elementos.campoResultado.value = CONFIG.MESSAGES.LOADING;
        } else {
            elementos.botaoGerar.disabled = false;
            elementos.botaoGerarTexto.innerHTML = '<i class="fas fa-magic mr-2"></i> Gerar Relatório';
        }
    }

    // --- TRATAMENTO DE ERROS ---
    function tratarErro(error) {
        console.error("Erro detalhado:", {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // Mensagens específicas para o usuário
        let mensagemUsuario = error.message;
        
        if (error.message.includes('500')) {
            mensagemUsuario = 'Erro interno do servidor. Tente novamente em alguns instantes.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            mensagemUsuario = 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('404')) {
            mensagemUsuario = 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
        }
        
        elementos.campoResultado.value = `Erro: ${mensagemUsuario}`;
        
        // Só mostra alert para erros de validação
        if (error.message === CONFIG.MESSAGES.EMPTY_CONVERSATION || 
            error.message === CONFIG.MESSAGES.TOO_LONG) {
            alert(mensagemUsuario);
        }
    }

    // --- FUNÇÃO DE CÓPIA MELHORADA ---
    async function copiarTexto() {
        if (elementos.campoResultado.value.trim() === '') {
            alert(CONFIG.MESSAGES.NOTHING_TO_COPY);
            return;
        }

        try {
            await navigator.clipboard.writeText(elementos.campoResultado.value);
            mostrarFeedbackCopia();
        } catch (err) {
            console.warn('Clipboard API falhou, usando fallback:', err);
            // Fallback para navegadores mais antigos
            copiarComFallback();
        }
    }

    function copiarComFallback() {
        elementos.campoResultado.select();
        elementos.campoResultado.setSelectionRange(0, 99999); // Para mobile
        
        try {
            document.execCommand('copy');
            mostrarFeedbackCopia();
        } catch (err) {
            console.error('Fallback de cópia também falhou:', err);
            alert('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente (Ctrl+C).');
        }
    }

    function mostrarFeedbackCopia() {
        const originalText = elementos.botaoCopiar.innerHTML;
        elementos.botaoCopiar.innerHTML = '<i class="fas fa-check mr-1"></i> Copiado!';
        elementos.botaoCopiar.disabled = true;
        
        setTimeout(() => {
            elementos.botaoCopiar.innerHTML = originalText;
            elementos.botaoCopiar.disabled = false;
        }, CONFIG.TIMEOUTS.COPY_FEEDBACK);
    }

    // --- FUNÇÃO LIMPAR ---
    function limparCampos() {
        elementos.campoConversa.value = '';
        elementos.campoResultado.value = '';
        elementos.campoConversa.focus();
        
        // Atualiza o contador de caracteres
        elementos.campoConversa.dispatchEvent(new Event('input'));
    }

    // --- CONFIGURAÇÃO DE EVENT LISTENERS ---
    function configurarEventListeners() {
        elementos.botaoGerar.addEventListener('click', gerarRelatorio);
        elementos.botaoLimpar.addEventListener('click', limparCampos);
        elementos.botaoCopiar.addEventListener('click', copiarTexto);
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        if (elementos.campoConversa === document.activeElement) {
                            e.preventDefault();
                            gerarRelatorio();
                        }
                        break;
                    case 'l':
                        if (!elementos.campoConversa.contains(document.activeElement) && 
                            !elementos.campoResultado.contains(document.activeElement)) {
                            e.preventDefault();
                            limparCampos();
                        }
                        break;
                }
            }
        });

        // Auto-resize do textarea
        elementos.campoConversa.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 400) + 'px';
        });
    }

    // --- INICIALIZA A APLICAÇÃO ---
    inicializar();
});

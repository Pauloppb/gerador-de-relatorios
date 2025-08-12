// --- SISTEMA DE TOASTS ---
class ToastManager {
    static mostrar(mensagem, tipo = 'info', duracao = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        const icones = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icones[tipo] || 'info-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove após a duração especificada
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    }
}

// --- GERENCIADOR DE ESTADOS VISUAIS ---
class UIStateManager {
    static adicionarClasses(elemento, classes, duracao = 3000) {
        if (typeof classes === 'string') classes = [classes];
        
        elemento.classList.add(...classes);
        
        if (duracao > 0) {
            setTimeout(() => {
                elemento.classList.remove(...classes);
            }, duracao);
        }
    }
    
    static mostrarSucesso(elemento, mensagem) {
        this.adicionarClasses(elemento, ['campo-sucesso']);
        if (mensagem) ToastManager.mostrar(mensagem, 'success');
    }
    
    static mostrarErro(elemento, mensagem) {
        this.adicionarClasses(elemento, ['campo-erro']);
        if (mensagem) ToastManager.mostrar(mensagem, 'error');
    }
}

// --- PROGRESS BAR ANIMADA ---
class ProgressBar {
    constructor(container) {
        this.container = container;
        this.element = null;
        this.interval = null;
    }
    
    criar() {
        if (this.element) return;
        
        this.element = document.createElement('div');
        this.element.className = 'progress-container';
        this.element.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        this.container.appendChild(this.element);
    }
    
    iniciar() {
        if (!this.element) this.criar();
        
        const fill = this.element.querySelector('.progress-fill');
        this.element.classList.add('ativo');
        
        let progresso = 0;
        this.interval = setInterval(() => {
            progresso += Math.random() * 15;
            if (progresso > 90) progresso = 90;
            
            fill.style.width = progresso + '%';
            fill.classList.add('animando');
        }, 500);
    }
    
    concluir() {
        if (!this.element) return;
        
        const fill = this.element.querySelector('.progress-fill');
        fill.style.width = '100%';
        
        clearInterval(this.interval);
        
        setTimeout(() => {
            this.element.classList.remove('ativo');
            setTimeout(() => {
                if (this.element) {
                    this.element.remove();
                    this.element = null;
                }
            }, 300);
        }, 500);
    }
}

// --- CONTADOR DE CARACTERES MELHORADO ---
class ContadorCaracteres {
    constructor(textarea, limite = 50000) {
        this.textarea = textarea;
        this.limite = limite;
        this.contador = null;
        this.init();
    }
    
    init() {
        this.criarContador();
        this.textarea.addEventListener('input', () => this.atualizar());
        this.atualizar();
    }
    
    criarContador() {
        this.contador = document.createElement('div');
        this.contador.id = 'char-counter';
        this.contador.className = 'char-counter';
        this.textarea.parentNode.appendChild(this.contador);
    }
    
    atualizar() {
        const count = this.textarea.value.length;
        const porcentagem = (count / this.limite) * 100;
        
        this.contador.textContent = `${count.toLocaleString()} / ${this.limite.toLocaleString()} caracteres`;
        
        // Cores baseadas na porcentagem
        if (porcentagem > 100) {
            this.contador.style.color = '#ef4444';
            this.contador.classList.add('limite-excedido');
        } else if (porcentagem > 80) {
            this.contador.style.color = '#f59e0b';
            this.contador.classList.remove('limite-excedido');
        } else {
            this.contador.style.color = '#6b7280';
            this.contador.classList.remove('limite-excedido');
        }
        
        return count <= this.limite;
    }
}

// --- EFEITOS DE LOADING MELHORADOS ---
class LoadingEffects {
    static adicionarRipple(button) {
        button.classList.add('btn-ripple');
        
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    static criarOverlay(container) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin fa-2x"></i>
                <p class="mt-2">Processando...</p>
            </div>
        `;
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        return {
            mostrar: () => overlay.classList.add('ativo'),
            esconder: () => overlay.classList.remove('ativo'),
            remover: () => overlay.remove()
        };
    }
}

// --- AUTO-RESIZE INTELIGENTE PARA TEXTAREA ---
class AutoResize {
    constructor(textarea, minHeight = 120, maxHeight = 400) {
        this.textarea = textarea;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.init();
    }
    
    init() {
        this.textarea.style.minHeight = this.minHeight + 'px';
        this.textarea.style.resize = 'none';
        this.textarea.style.overflow = 'hidden';
        
        this.textarea.addEventListener('input', () => this.resize());
        this.resize(); // Resize inicial
    }
    
    resize() {
        this.textarea.style.height = 'auto';
        
        const newHeight = Math.min(
            Math.max(this.textarea.scrollHeight, this.minHeight),
            this.maxHeight
        );
        
        this.textarea.style.height = newHeight + 'px';
        
        if (this.textarea.scrollHeight > this.maxHeight) {
            this.textarea.style.overflow = 'auto';
        } else {
            this.textarea.style.overflow = 'hidden';
        }
    }
}

// --- MELHORIAS PARA ACESSIBILIDADE ---
class AccessibilityEnhancer {
    static adicionarAtributos(elementos) {
        // Adiciona ARIA labels e roles
        if (elementos.botaoGerar) {
            elementos.botaoGerar.setAttribute('aria-describedby', 'gerar-help');
            elementos.botaoGerar.setAttribute('role', 'button');
        }
        
        if (elementos.campoConversa) {
            elementos.campoConversa.setAttribute('aria-label', 'Cole aqui a conversa para gerar o relatório');
            elementos.campoConversa.setAttribute('aria-required', 'true');
        }
        
        if (elementos.campoResultado) {
            elementos.campoResultado.setAttribute('aria-label', 'Resultado do relatório gerado');
            elementos.campoResultado.setAttribute('readonly', 'true');
        }
    }
    
    static adicionarFocusManagement(elementos) {
        // Gerencia foco para melhor navegação por teclado
        elementos.botaoGerar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                elementos.botaoGerar.click();
            }
        });
    }
}

// --- VALIDAÇÃO VISUAL EM TEMPO REAL ---
class RealTimeValidator {
    constructor(campo, validadores = []) {
        this.campo = campo;
        this.validadores = validadores;
        this.init();
    }
    
    init() {
        this.campo.addEventListener('input', () => this.validar());
        this.campo.addEventListener('blur', () => this.validar());
    }
    
    validar() {
        const valor = this.campo.value;
        const erros = [];
        
        for (const validador of this.validadores) {
            const resultado = validador(valor);
            if (resultado !== true) {
                erros.push(resultado);
            }
        }
        
        if (erros.length > 0) {
            UIStateManager.mostrarErro(this.campo);
            return false;
        } else {
            this.campo.classList.remove('campo-erro');
            return true;
        }
    }
}

// --- EXPORTAR PARA USO GLOBAL ---
window.UIComponents = {
    ToastManager,
    UIStateManager,
    ProgressBar,
    ContadorCaracteres,
    LoadingEffects,
    AutoResize,
    AccessibilityEnhancer,
    RealTimeValidator
};

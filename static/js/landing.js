/* ============================
   LANDING PAGE - SCRIPTS
   ============================ */

document.addEventListener('DOMContentLoaded', function () {
  // ============================
  // THEME TOGGLE (ESCURO/CLARO)
  // ============================
  const temaToggle = document.getElementById('tema-toggle');
  const html = document.documentElement;

  // Verificar preferência salva ou preferência do sistema
  const temaSalvo = localStorage.getItem('tema-landing');
  const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (temaSalvo) {
    if (temaSalvo === 'escuro') {
      html.classList.add('tema-escuro');
      atualizarIconeTema(true);
    }
  } else if (preferenciaSistema) {
    html.classList.add('tema-escuro');
    atualizarIconeTema(true);
  }

  function atualizarIconeTema(escuro) {
    if (temaToggle) {
      if (escuro) {
        temaToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        temaToggle.setAttribute('title', 'Alternar para tema claro');
      } else {
        temaToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        temaToggle.setAttribute('title', 'Alternar para tema escuro');
      }
    }
  }

  if (temaToggle) {
    temaToggle.addEventListener('click', function () {
      html.classList.toggle('tema-escuro');
      const isEscuro = html.classList.contains('tema-escuro');
      localStorage.setItem('tema-landing', isEscuro ? 'escuro' : 'claro');
      atualizarIconeTema(isEscuro);
    });
  }

  // ============================
  // MODAL DE VÍDEO DEMONSTRAÇÃO
  // ============================
  const btnDemo = document.getElementById('btn-demo');
  const modalVideo = document.getElementById('modal-video');
  const modalFechar = document.querySelector('.modal-video__fechar');

  if (btnDemo && modalVideo) {
    btnDemo.addEventListener('click', function () {
      modalVideo.showModal();
      document.body.style.overflow = 'hidden';
    });
  }

  if (modalFechar && modalVideo) {
    modalFechar.addEventListener('click', function () {
      modalVideo.close();
      document.body.style.overflow = '';
    });
  }

  if (modalVideo) {
    modalVideo.addEventListener('cancel', function () {
      document.body.style.overflow = '';
    });

    // Fechar ao clicar fora do conteúdo
    modalVideo.addEventListener('click', function (e) {
      if (e.target === modalVideo) {
        modalVideo.close();
        document.body.style.overflow = '';
      }
    });
  }

  // ============================
  // LINKS DE NAVEGAÇÃO SUAVE
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Ignorar links vazios ou especiais
      if (href === '#' || href === '') return;
      
      e.preventDefault();
      
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = 72; // altura da header sticky
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Fechar modal se aberto
        if (modalVideo && modalVideo.open) {
          modalVideo.close();
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ============================
  // OBSERVADOR PARA ANIMAÇÕES
  // ============================
  const observador = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.animation = entry.target.dataset.animation || '';
      }
    });
  }, {
    threshold: 0.1
  });

  // Adicionar observação em elementos que precisam animar
  document.querySelectorAll('.card-beneficio, .depoimento-card, .passo').forEach(function (el) {
    observador.observe(el);
  });

  // ============================
  // RASTREAMENTO DE SCROLL
  // ============================
  let scrollY = 0;
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    
    // Atualizar estilo da header ao fazer scroll
    const header = document.querySelector('.header-landing');
    if (header) {
      if (scrollY > 50) {
        header.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = 'none';
      }
    }

    // Atualizar links ativos da navegação
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(function (section) {
      const link = document.querySelector(`a[href="#${section.id}"]`);
      if (!link) return;

      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        document.querySelectorAll('.nav-landing__link').forEach(l => {
          l.style.color = '';
        });
        link.style.color = 'var(--primaria)';
      }
    });
  });

  // ============================
  // CONTADORES DE ESTATÍSTICAS
  // ============================
  function animarContador(elemento, contagemFinal, duracao = 2000) {
    const inicio = Date.now();
    const contagemInicial = parseInt(elemento.textContent) || 0;

    function atualizar() {
      const agora = Date.now();
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const valor = Math.floor(contagemInicial + (contagemFinal - contagemInicial) * progresso);
      
      elemento.textContent = valor.toLocaleString('pt-BR');

      if (progresso < 1) {
        requestAnimationFrame(atualizar);
      }
    }

    atualizar();
  }

  // ============================
  // VALIDAÇÃO DE EMAIL CTA
  // ============================
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ============================
  // MONITORAR REDIMENSIONAMENTO
  // ============================
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Re-calcular posições de elementos se necessário
    }, 250);
  });

  // ============================
  // DETECÇÃO DE COOKIES/PREFERÊNCIAS
  // ============================
  function salvarPreferencia(chave, valor) {
    try {
      localStorage.setItem(`landing-${chave}`, valor);
    } catch (e) {
      console.warn('LocalStorage não disponível:', e);
    }
  }

  function obterPreferencia(chave, padrao = null) {
    try {
      return localStorage.getItem(`landing-${chave}`) || padrao;
    } catch (e) {
      console.warn('LocalStorage não disponível:', e);
      return padrao;
    }
  }

  // ============================
  // EVENTOS DE CLIQUE EM CTA
  // ============================
  document.querySelectorAll('.btn--primario').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // Validar se é um link ou botão
      if (!(this instanceof HTMLAnchorElement)) {
        // Rastrear clique em CTA (pode ser enviado para analytics)
        console.log('CTA clicado:', this.textContent);
      }
    });
  });

  // ============================
  // SUPORTE A TECLADO
  // ============================
  document.addEventListener('keydown', function (e) {
    // ESC fecha modal
    if (e.key === 'Escape' && modalVideo && modalVideo.open) {
      modalVideo.close();
      document.body.style.overflow = '';
    }

    // Atalhos de teclado
    if (e.altKey + e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          // Alt+Shift+H: ir para home
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 't':
          // Alt+Shift+T: toggle tema
          if (temaToggle) temaToggle.click();
          break;
      }
    }
  });

  // ============================
  // DETECÇÃO DE PREFERÊNCIAS
  // ============================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
  }

  // ============================
  // CARREGAMENTO LAZY DE IMAGENS
  // ============================
  if ('IntersectionObserver' in window) {
    const imagensLazy = document.querySelectorAll('img[data-src]');
    const observadorImagens = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observadorImagens.unobserve(img);
        }
      });
    });

    imagensLazy.forEach(img => observadorImagens.observe(img));
  }

  // ============================
  // ENHANCED ACCESSIBILITY
  // ============================
  // Adicionar ARIA labels dinâmicos
  document.querySelectorAll('[data-description]').forEach(function (el) {
    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
    el.setAttribute('aria-describedby', descId);
  });

  // Suporte para navegação por Skip Links
  const skipLink = document.createElement('a');
  skipLink.href = '#conteudo-principal';
  skipLink.className = 'skip-to-content';
  skipLink.textContent = 'Pular para conteúdo principal';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primaria);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
    border-radius: 0 0 4px 0;
  `;
  skipLink.addEventListener('focus', function () {
    this.style.top = '0';
  });
  skipLink.addEventListener('blur', function () {
    this.style.top = '-40px';
  });
  document.body.insertBefore(skipLink, document.body.firstChild);

  // ============================
  // RASTREAMENTO DE ANALÍTICA
  // ============================
  function rastrearEvento(categoria, acao, rotulo = '') {
    if (window.gtag) {
      gtag('event', acao, {
        'event_category': categoria,
        'event_label': rotulo
      });
    }
  }

  // Rastrear cliques em botões principais
  document.querySelectorAll('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      const evento = this.dataset.event;
      rastrearEvento('engajamento', evento, this.textContent);
    });
  });

  // ============================
  // CONTROLE DE PERFORMANCE
  // ============================
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Performance - ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (e) {
      console.log('Performance API não disponível');
    }
  }

  // ============================
  // INICIALIZAÇÃO COMPLETA
  // ============================
  console.log('🎨 Landing Page DS - Inicializada com sucesso!');
  console.log('Tema salvo:', temaSalvo || 'sistema');
  console.log('Preferência sistema: ' + (preferenciaSistema ? 'escuro' : 'claro'));
});

// ============================
// SERVICE WORKER (Opcional)
// ============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    // Uncomment para habilitar SW
    // navigator.serviceWorker.register('sw.js');
  });
}

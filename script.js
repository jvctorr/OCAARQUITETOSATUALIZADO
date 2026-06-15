/* OCA Arquitetos — script.js */
(async () => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const supabase = window.ocaSupabase || null;

  const DEFAULT_WHATSAPP = '5511983819509';
  const DEFAULT_INSTAGRAM = 'https://www.instagram.com/oca_arquitetos/';
  let currentWhatsapp = DEFAULT_WHATSAPP;

  // Normaliza categorias antigas/novas para os filtros atuais.
  function normalizeCategory(c) {
    const v = String(c || '').toLowerCase().trim();
    if (!v) return '';
    if (v === 'planejados' || v === 'ambientes planejados') return 'interiores';
    if (v.startsWith('visualiza')) return 'visualizacao';
    return v;
  }

  function normalizeStatus(s) {
    const v = String(s || '').toLowerCase().trim();
    if (!v) return 'concluido';
    if (v.startsWith('and')) return 'andamento';
    if (v.startsWith('concl')) return 'concluido';
    return v;
  }

  function parseList(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    return String(v).split(/[\n,;|]+/).map(s => s.trim()).filter(Boolean);
  }

  const fallbackProjects = [
    { image_url:'assets/images/projeto-02-living.jpg', category:'residencial', status:'concluido', title:'Ambiente residencial com identidade', description:'Soluções pensadas para unir estética, conforto e funcionalidade.', span:8, height_class:'h-wide' },
    { image_url:'assets/images/projeto-01-sala.jpg', category:'interiores', status:'concluido', title:'Interiores pensados para o bem-estar', description:'Cada detalhe é desenvolvido para refletir identidade e bem-estar.', span:4, height_class:'h-tall' },
    { image_url:'assets/images/projeto-03-tv.jpg', category:'interiores', status:'concluido', title:'Projeto com funcionalidade e acolhimento', description:'Composição de materiais e luz pensada para a rotina real.', span:4, height_class:'h-sq' },
    { image_url:'assets/images/projeto-04-quarto.jpg', category:'residencial', status:'concluido', title:'Espaço contemporâneo e natural', description:'Madeira, iluminação acolhedora e cuidado com o bem-estar.', span:4, height_class:'h-sq' },
    { image_url:'assets/images/projeto-05-studio.jpg', category:'interiores', status:'andamento', title:'Composição de materiais e luz', description:'Marcenaria sob medida e iluminação que valoriza cada metro.', span:4, height_class:'h-sq' },
    { image_url:'assets/images/projeto-06-corredor.jpg', category:'reforma', status:'concluido', title:'Ambiente planejado para a rotina', description:'Layout inteligente para conforto e uso real do espaço.', span:4, height_class:'h-sq' },
    { image_url:'assets/images/projeto-07-coworking.jpg', category:'comercial', status:'concluido', title:'Projeto presencial ou à distância', description:'Espaços comerciais com identidade clara e experiência cuidadosa.', span:6, height_class:'h-wide' },
    { image_url:'assets/images/projeto-08-comercial.jpg', category:'comercial', status:'andamento', title:'Arquitetura que valoriza o viver', description:'Projetos comerciais que conectam marca, pessoas e ambiente.', span:6, height_class:'h-wide' },
  ];

  let projects = fallbackProjects.map(mapProject);

  function mapProject(p) {
    const gallery = parseList(p.gallery_images || p.gallery);
    return {
      id: p.id,
      title: p.title || '',
      image_url: p.image_url || p.img || '',
      category: normalizeCategory(p.category || p.cat),
      categoryRaw: p.category || p.cat || '',
      status: normalizeStatus(p.status),
      description: p.description || p.desc || '',
      location: p.location || '',
      year: p.year || '',
      area: p.area || '',
      challenge: p.challenge || '',
      solution: p.solution || '',
      result: p.result || '',
      gallery_images: gallery,
      video_url: p.video_url || '',
      before_image: p.before_image || '',
      after_image: p.after_image || '',
      span: p.span || 4,
      height_class: p.height_class || 'h-sq',
    };
  }

  const fallbackQuestions = [
    { q:'O que você deseja transformar?', opts:['Casa','Apartamento','Sala comercial','Loja','Consultório','Ambiente específico','Ainda estou decidindo'] },
    { q:'Qual sensação você quer para o espaço?', opts:['Moderno','Aconchegante','Minimalista','Sofisticado','Natural','Funcional','Elegante'] },
    { q:'Quais elementos você mais gosta?', opts:['Madeira','Tons claros','Iluminação quente','Cimento','Mármore','Cores neutras','Plantas','Vidro e linhas retas'] },
    { q:'Qual é o maior problema hoje?', opts:['Falta de espaço','Ambiente sem personalidade','Pouca funcionalidade','Reforma parada','Dúvida de orçamento','Falta de planejamento','Não sei por onde começar'] },
    { q:'O que você espera do projeto?', opts:['Mais conforto e bem-estar','Mais beleza','Mais organização','Valorização do imóvel','Experiência para clientes','Aproveitamento do espaço'] },
  ];

  let questions = fallbackQuestions;
  let results = {
    natural:{ title:'Sofisticação Natural com Toque Acolhedor', text:'Seu perfil combina com materiais naturais, iluminação acolhedora, tons equilibrados e ambientes que transmitem bem-estar sem abrir mão da elegância.' },
    minimal:{ title:'Minimalismo Funcional', text:'Seu projeto pede clareza, organização visual e soluções inteligentes para aproveitar melhor cada metro do espaço.' },
    contemp:{ title:'Elegância Contemporânea', text:'Seu estilo combina com linhas modernas, materiais sofisticados e uma atmosfera visualmente marcante, mas equilibrada.' },
    func:{ title:'Funcionalidade Inteligente', text:'Seu principal desafio parece ser transformar o espaço em algo mais prático, bem resolvido e adaptado à rotina.' },
    identity:{ title:'Ambiente com Identidade e Bem-estar', text:'Seu projeto precisa unir identidade, conforto e cuidado para criar um espaço que reflita quem você é e como você quer viver.' },
  };

  function escapeHTML(str='') {
    return String(str).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function waLink(text='') {
    const clean = String(currentWhatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '');
    return `https://wa.me/${clean}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }

  function setText(selector, value) {
    if (!value) return;
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function settingsMap(rows=[]) {
    return rows.reduce((acc, item) => { acc[item.key] = item.value; return acc; }, {});
  }

  async function loadCMS() {
    if (!supabase) return;

    try {
      const [{ data: settingsData }, { data: projectsData }, { data: resultData }, { data: qData }] = await Promise.all([
        supabase.from('site_settings').select('key,value'),
        supabase.from('projects').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('quiz_results').select('*').eq('is_active', true),
        supabase.from('quiz_questions').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      ]);

      const s = settingsMap(settingsData || []);
      currentWhatsapp = s.whatsapp || DEFAULT_WHATSAPP;

      setText('.hero .eyebrow', s.hero_eyebrow);
      setText('.hero h1', s.hero_title);
      setText('.hero .lead', s.hero_lead);
      setText('.hero p.muted', s.hero_text);
      setText('#sobre .display', s.about_title);
      setText('#sobre p:not(.muted)', s.about_text_1);
      setText('#sobre p.muted', s.about_text_2);
      setText('#projetos .display', s.portfolio_title);
      setText('#projetos .section-head .muted', s.portfolio_text);
      setText('#contato .display', s.contact_title);
      setText('#contato .cta-box p', s.contact_text);

      $$('a[href*="wa.me"]').forEach(a => {
        if (a.href.includes('?text=')) return;
        a.href = waLink();
      });

      if (s.instagram) $$('a[href*="instagram.com"]').forEach(a => { a.href = s.instagram; });

      if (projectsData && projectsData.length) {
        projects = projectsData.map(mapProject);
      }

      if (resultData && resultData.length) {
        results = resultData.reduce((acc, r) => {
          acc[r.result_key] = { title: r.title, text: r.description };
          return acc;
        }, results);
      }

      if (qData && qData.length) {
        const withOptions = [];
        for (const q of qData) {
          const { data: opts } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('display_order', { ascending: true });
          withOptions.push({ q: q.question, opts: (opts || []).map(o => o.option_text) });
        }
        if (withOptions.every(q => q.opts.length)) questions = withOptions;
      }
    } catch (error) {
      console.warn('CMS offline, usando conteúdo fixo.', error);
    }
  }

  await loadCMS();

  // YEAR
  if ($('#yr')) $('#yr').textContent = new Date().getFullYear();

  // THEME
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('oca-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('oca-theme', next);
  });

  // MOBILE MENU
  const mt = $('#menuToggle'), nm = $('#navMobile');
  mt?.addEventListener('click', () => {
    const open = nm.classList.toggle('open');
    mt.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('#navMobile a').forEach(a => a.addEventListener('click', () => nm.classList.remove('open')));

  // REVEAL
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  // GALLERY + MULTI-FILTER
  const gallery = $('#gallery');
  const activeFilters = { status: 'all', category: 'all', media: 'all' };

  function matches(p) {
    if (activeFilters.status !== 'all' && p.status !== activeFilters.status) return false;
    if (activeFilters.category !== 'all' && p.category !== activeFilters.category) return false;
    if (activeFilters.media === 'video' && !p.video_url) return false;
    if (activeFilters.media === 'beforeafter' && !(p.before_image && p.after_image)) return false;
    return true;
  }

  function statusLabel(s) { return s === 'andamento' ? 'Em andamento' : 'Concluído'; }
  function categoryLabel(c) {
    const m = { residencial:'Residencial', comercial:'Comercial', interiores:'Interiores', reforma:'Reforma', retrofit:'Retrofit', visualizacao:'Visualização' };
    return m[c] || (c ? c.charAt(0).toUpperCase()+c.slice(1) : '');
  }

  function renderGallery() {
    if (!gallery) return;
    gallery.innerHTML = '';
    const list = projects.filter(matches);
    if (!list.length) {
      gallery.innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center;padding:32px">Nenhum projeto encontrado com esses filtros.</p>`;
      return;
    }
    list.forEach((p) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `g-card span-${p.span} ${p.height_class} reveal`;
      el.setAttribute('aria-label', `Abrir projeto ${p.title}`);
      const badges = [];
      badges.push(`<span class="g-badge g-status g-status-${p.status}">${statusLabel(p.status)}</span>`);
      if (p.video_url) badges.push(`<span class="g-badge">▶ Vídeo</span>`);
      if (p.before_image && p.after_image) badges.push(`<span class="g-badge">Antes/Depois</span>`);
      el.innerHTML = `
        <img loading="lazy" src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.title)}">
        <div class="g-badges">${badges.join('')}</div>
        <div class="g-info">
          <div class="cat">${escapeHTML(categoryLabel(p.category))}</div>
          <h4>${escapeHTML(p.title)}</h4>
        </div>`;
      el.addEventListener('click', () => openProject(p));
      gallery.appendChild(el);
      requestAnimationFrame(() => el.classList.add('in'));
    });
  }

  renderGallery();

  $$('.filters-wrap .filters').forEach(group => {
    const key = group.dataset.filterGroup;
    group.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        activeFilters[key] = c.dataset.filter;
        renderGallery();
      });
    });
  });

  // PROJECT MODAL
  const modal = $('#projectModal');
  const modalContent = $('#pmContent');
  let lastFocus = null;

  function openProject(p) {
    lastFocus = document.activeElement;
    modalContent.innerHTML = buildProjectHTML(p);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    initBeforeAfter(modalContent);
    // focus close
    setTimeout(() => modal.querySelector('.pmodal-close')?.focus(), 30);
  }
  function closeProject() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalContent.innerHTML = '';
    if (lastFocus) lastFocus.focus();
  }
  modal?.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeProject(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeProject(); });

  function buildProjectHTML(p) {
    const meta = [];
    if (p.location) meta.push(`<li><span>Local</span><strong>${escapeHTML(p.location)}</strong></li>`);
    if (p.year)     meta.push(`<li><span>Ano</span><strong>${escapeHTML(String(p.year))}</strong></li>`);
    if (p.area)     meta.push(`<li><span>Área</span><strong>${escapeHTML(p.area)}</strong></li>`);

    const csr = [];
    if (p.challenge) csr.push(`<div><h5>Desafio</h5><p>${escapeHTML(p.challenge)}</p></div>`);
    if (p.solution)  csr.push(`<div><h5>Solução</h5><p>${escapeHTML(p.solution)}</p></div>`);
    if (p.result)    csr.push(`<div><h5>Resultado</h5><p>${escapeHTML(p.result)}</p></div>`);

    const galleryHTML = p.gallery_images.length
      ? `<div class="pm-section"><h4>Galeria</h4><div class="pm-gallery">${p.gallery_images.map(g => `<img loading="lazy" src="${escapeHTML(g)}" alt="${escapeHTML(p.title)}">`).join('')}</div></div>`
      : '';

    const videoHTML = p.video_url
      ? `<div class="pm-section"><h4>Vídeo</h4><div class="pm-video"><video src="${escapeHTML(p.video_url)}" controls playsinline preload="metadata"></video></div></div>`
      : '';

    const baHTML = (p.before_image && p.after_image)
      ? `<div class="pm-section"><h4>Antes e Depois</h4>
          <div class="ba-slider" data-ba>
            <img class="ba-after" src="${escapeHTML(p.after_image)}" alt="Depois">
            <div class="ba-before-wrap"><img class="ba-before" src="${escapeHTML(p.before_image)}" alt="Antes"></div>
            <span class="ba-label ba-label-before">Antes</span>
            <span class="ba-label ba-label-after">Depois</span>
            <input type="range" min="0" max="100" value="50" class="ba-range" aria-label="Comparar antes e depois">
            <span class="ba-handle" aria-hidden="true"></span>
          </div>
         </div>`
      : '';

    const waMsg = `Olá, OCA Arquitetos! Vi o projeto "${p.title}" no site e gostaria de conversar sobre um projeto parecido.`;

    return `
      <div class="pm-hero">
        <img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.title)}">
      </div>
      <div class="pm-body">
        <div class="pm-tags">
          <span class="chip">${escapeHTML(categoryLabel(p.category))}</span>
          <span class="chip chip-status chip-${p.status}">${statusLabel(p.status)}</span>
        </div>
        <h2 id="pmTitle" class="display">${escapeHTML(p.title)}</h2>
        ${p.description ? `<p class="pm-desc">${escapeHTML(p.description)}</p>` : ''}
        ${meta.length ? `<ul class="pm-meta">${meta.join('')}</ul>` : ''}
        ${csr.length ? `<div class="pm-csr">${csr.join('')}</div>` : ''}
        ${baHTML}
        ${videoHTML}
        ${galleryHTML}
        <div class="pm-cta">
          <a class="btn btn-primary" target="_blank" rel="noopener" href="${waLink(waMsg)}">Quero um projeto assim</a>
          <button class="btn btn-ghost" type="button" data-close>Fechar</button>
        </div>
      </div>
    `;
  }

  // BEFORE / AFTER SLIDER
  function initBeforeAfter(root) {
    root.querySelectorAll('[data-ba]').forEach(box => {
      const range = box.querySelector('.ba-range');
      const wrap  = box.querySelector('.ba-before-wrap');
      const handle = box.querySelector('.ba-handle');
      const apply = (v) => {
        wrap.style.width = v + '%';
        handle.style.left = v + '%';
      };
      apply(Number(range.value));
      range.addEventListener('input', () => apply(Number(range.value)));
    });
  }

  // BRIEF FORM → WhatsApp
  const brief = $('#briefForm');
  brief?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(brief);
    const get = (k) => (fd.get(k) || '').toString().trim();
    const nome = get('nome');
    if (!nome) { brief.querySelector('[name=nome]').focus(); return; }
    const lines = [
      'Olá, OCA Arquitetos! Vim pelo site e gostaria de solicitar um orçamento.',
      '',
      `Nome: ${nome}`,
      `Tipo de projeto: ${get('tipo') || '-'}`,
      `Cidade/estado: ${get('cidade') || '-'}`,
      `O espaço já existe? ${get('existe') || '-'}`,
      `Categoria: ${get('categoria') || '-'}`,
      `Prazo: ${get('prazo') || '-'}`,
      `Faixa de investimento: ${get('investimento') || '-'}`,
      `Mensagem: ${get('mensagem') || '-'}`,
    ];
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  // QUIZ
  let qi = 0, answers = [];
  const body = $('#quizBody'), bar = $('#quizBar');

  function renderQuiz() {
    if (!body || !bar) return;
    bar.style.width = ((qi) / (questions.length)) * 100 + '%';
    if (qi >= questions.length) return showResult();
    const q = questions[qi];
    body.innerHTML = `<div class="q-step">Pergunta ${qi + 1} de ${questions.length}</div>
      <div class="q-question">${escapeHTML(q.q)}</div>
      <div class="q-opts">${q.opts.map(o => `<button class="q-opt" data-v="${escapeHTML(o)}">${escapeHTML(o)}</button>`).join('')}</div>
      <div class="q-nav">
        <button class="btn btn-ghost" id="qBack" ${qi === 0 ? 'disabled style="opacity:.4"' : ''}>← Voltar</button>
        <button class="btn btn-primary" id="qNext" disabled style="opacity:.5">Continuar →</button>
      </div>`;
    let chosen = null;
    $$('.q-opt', body).forEach(b => b.addEventListener('click', () => {
      $$('.q-opt', body).forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      chosen = b.dataset.v;
      const n = $('#qNext'); n.disabled = false; n.style.opacity = 1;
    }));
    $('#qBack').addEventListener('click', () => { if (qi > 0) { qi--; answers.pop(); renderQuiz(); } });
    $('#qNext').addEventListener('click', () => { if (chosen) { answers[qi] = chosen; qi++; renderQuiz(); } });
  }

  function computeResult() {
    const a = answers.map(s => s.toLowerCase()).join(' ');
    if (/sala comercial|loja|consultório|clientes/.test(a)) return results.identity;
    if (/minimalista|organização|clareza/.test(a)) return results.minimal;
    if (/natural|aconchegante|madeira|plantas|bem-estar/.test(a)) return results.natural;
    if (/sofisticado|elegante|mármore|moderno/.test(a)) return results.contemp;
    return results.func;
  }

  function showResult() {
    bar.style.width = '100%';
    const r = computeResult();
    const msg = `Olá, OCA Arquitetos. Fiz o quiz no site e meu resultado foi: ${r.title}. Quero conversar sobre um projeto nesse estilo.`;
    body.innerHTML = `<div class="q-result">
      <span class="pill">Seu estilo combina com</span>
      <h3>${escapeHTML(r.title)}</h3>
      <p>${escapeHTML(r.text)}</p>
      <div class="hero-cta" style="margin-top:18px">
        <a class="btn btn-primary" target="_blank" rel="noopener" href="${waLink(msg)}">Quero conversar sobre meu projeto nesse estilo</a>
        <a class="btn btn-ghost" href="#projetos">Ver projetos parecidos</a>
        <button class="btn btn-link" id="qRestart">Refazer o quiz ↻</button>
      </div>
    </div>`;
    $('#qRestart').addEventListener('click', () => { qi = 0; answers = []; renderQuiz(); });
  }

  renderQuiz();
})();

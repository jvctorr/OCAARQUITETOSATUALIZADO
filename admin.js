/* OCA Arquitetos — admin.js */
(() => {
  const supabase = window.ocaSupabase;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const status = $('#adminStatus');

  let projects = [];
  let settings = [];
  let quizQuestions = [];
  let quizResults = [];

  function setStatus(text, type = '') {
    status.textContent = text || '';
    status.className = `admin-message ${type}`;
    if (text) setTimeout(() => { status.textContent = ''; }, 3500);
  }

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) window.location.href = 'login.html';
  }

  async function uploadProjectImage(file) {
    if (!file) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('project-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  // Campos opcionais que só vão para o payload se a tabela tiver as colunas.
  const OPTIONAL_PROJECT_FIELDS = [
    'status','location','year','area','challenge','solution','result',
    'gallery_images','video_url','before_image','after_image'
  ];

  function projectPayload(imageUrl) {
    const base = {
      title: $('#projectTitle').value.trim(),
      category: $('#projectCategory').value,
      description: $('#projectDescription').value.trim(),
      image_url: imageUrl || $('#projectImageUrl').value.trim(),
      span: Number($('#projectSpan').value || 4),
      height_class: $('#projectHeight').value,
      display_order: Number($('#projectOrder').value || 0),
      is_active: $('#projectActive').checked,
      updated_at: new Date().toISOString(),
    };
    const optional = {
      status: $('#projectStatus')?.value || '',
      location: $('#projectLocation')?.value.trim() || '',
      year: $('#projectYear')?.value.trim() || '',
      area: $('#projectArea')?.value.trim() || '',
      challenge: $('#projectChallenge')?.value.trim() || '',
      solution: $('#projectSolution')?.value.trim() || '',
      result: $('#projectResult')?.value.trim() || '',
      gallery_images: ($('#projectGallery')?.value || '').split(/\n+/).map(s => s.trim()).filter(Boolean),
      video_url: $('#projectVideo')?.value.trim() || '',
      before_image: $('#projectBefore')?.value.trim() || '',
      after_image: $('#projectAfter')?.value.trim() || '',
    };
    Object.keys(optional).forEach(k => {
      const v = optional[k];
      const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
      if (!empty) base[k] = v;
    });
    return base;
  }

  function clearProjectForm() {
    $('#projectFormTitle').textContent = 'Novo projeto';
    $('#projectId').value = '';
    $('#projectTitle').value = '';
    $('#projectCategory').value = 'residencial';
    $('#projectDescription').value = '';
    $('#projectImageUrl').value = '';
    $('#projectImageFile').value = '';
    $('#projectSpan').value = '4';
    $('#projectHeight').value = 'h-sq';
    $('#projectOrder').value = '0';
    $('#projectActive').checked = true;
    if ($('#projectStatus')) $('#projectStatus').value = 'concluido';
    ['Location','Year','Area','Challenge','Solution','Result','Gallery','Video','Before','After'].forEach(k => {
      const el = $('#project' + k); if (el) el.value = '';
    });
  }

  function editProject(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    $('#projectFormTitle').textContent = 'Editar projeto';
    $('#projectId').value = p.id;
    $('#projectTitle').value = p.title || '';
    $('#projectCategory').value = p.category || 'residencial';
    $('#projectDescription').value = p.description || '';
    $('#projectImageUrl').value = p.image_url || '';
    $('#projectImageFile').value = '';
    $('#projectSpan').value = String(p.span || 4);
    $('#projectHeight').value = p.height_class || 'h-sq';
    $('#projectOrder').value = String(p.display_order || 0);
    $('#projectActive').checked = !!p.is_active;
    if ($('#projectStatus')) $('#projectStatus').value = p.status || 'concluido';
    const set = (id, v) => { const el = $(id); if (el) el.value = v || ''; };
    set('#projectLocation', p.location);
    set('#projectYear', p.year);
    set('#projectArea', p.area);
    set('#projectChallenge', p.challenge);
    set('#projectSolution', p.solution);
    set('#projectResult', p.result);
    set('#projectGallery', Array.isArray(p.gallery_images) ? p.gallery_images.join('\n') : (p.gallery_images || ''));
    set('#projectVideo', p.video_url);
    set('#projectBefore', p.before_image);
    set('#projectAfter', p.after_image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  async function deleteProject(id) {
    if (!confirm('Tem certeza que deseja apagar este projeto?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return setStatus(error.message, 'error');
    setStatus('Projeto apagado.', 'success');
    await loadProjects();
  }

  function renderProjects() {
    const list = $('#projectsList');
    if (!projects.length) {
      list.innerHTML = '<p class="muted">Nenhum projeto cadastrado.</p>';
      return;
    }
    list.innerHTML = projects.map(p => `
      <article class="admin-item">
        <img src="${p.image_url || 'assets/images/logo.jpg'}" alt="${p.title || ''}" />
        <div class="admin-item-main">
          <strong>${p.title || 'Sem título'}</strong>
          <span>${p.category || '-'} · ordem ${p.display_order || 0} · ${p.is_active ? 'ativo' : 'oculto'}</span>
          <p>${p.description || ''}</p>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-ghost" data-edit-project="${p.id}">Editar</button>
          <button class="btn btn-ghost danger" data-delete-project="${p.id}">Apagar</button>
        </div>
      </article>
    `).join('');

    $$('[data-edit-project]').forEach(btn => btn.addEventListener('click', () => editProject(btn.dataset.editProject)));
    $$('[data-delete-project]').forEach(btn => btn.addEventListener('click', () => deleteProject(btn.dataset.deleteProject)));
  }

  async function loadProjects() {
    const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
    if (error) return setStatus(error.message, 'error');
    projects = data || [];
    renderProjects();
  }

  function renderSettings() {
    const form = $('#settingsForm');
    form.innerHTML = settings.map(s => {
      const input = s.type === 'textarea'
        ? `<textarea data-setting="${s.key}" rows="4">${s.value || ''}</textarea>`
        : `<input data-setting="${s.key}" type="text" value="${(s.value || '').replace(/"/g, '&quot;')}" />`;
      return `<label>${s.label || s.key}${input}</label>`;
    }).join('');
  }

  async function loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').order('key', { ascending: true });
    if (error) return setStatus(error.message, 'error');
    settings = data || [];
    renderSettings();
  }

  async function saveSettings() {
    const rows = $$('[data-setting]').map(el => ({
      key: el.dataset.setting,
      value: el.value,
      updated_at: new Date().toISOString(),
    }));
    for (const row of rows) {
      const { error } = await supabase.from('site_settings').update({ value: row.value, updated_at: row.updated_at }).eq('key', row.key);
      if (error) return setStatus(error.message, 'error');
    }
    setStatus('Textos e links salvos com sucesso.', 'success');
    await loadSettings();
  }

  function clearQuizForm() {
    $('#quizFormTitle').textContent = 'Nova pergunta do quiz';
    $('#quizQuestionId').value = '';
    $('#quizQuestionText').value = '';
    $('#quizOptionsText').value = '';
    $('#quizOrder').value = '0';
    $('#quizActive').checked = true;
  }

  async function editQuizQuestion(id) {
    const q = quizQuestions.find(x => x.id === id);
    if (!q) return;
    const { data: opts, error } = await supabase.from('quiz_options').select('*').eq('question_id', id).order('display_order', { ascending: true });
    if (error) return setStatus(error.message, 'error');
    $('#quizFormTitle').textContent = 'Editar pergunta do quiz';
    $('#quizQuestionId').value = q.id;
    $('#quizQuestionText').value = q.question || '';
    $('#quizOptionsText').value = (opts || []).map(o => o.option_text).join('\n');
    $('#quizOrder').value = String(q.display_order || 0);
    $('#quizActive').checked = !!q.is_active;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteQuizQuestion(id) {
    if (!confirm('Tem certeza que deseja apagar esta pergunta?')) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) return setStatus(error.message, 'error');
    setStatus('Pergunta apagada.', 'success');
    await loadQuizQuestions();
  }

  function renderQuizQuestions() {
    const list = $('#quizQuestionsList');
    if (!quizQuestions.length) {
      list.innerHTML = '<p class="muted">Nenhuma pergunta cadastrada. Se deixar vazio, o site usa o quiz fixo do código.</p>';
      return;
    }
    list.innerHTML = quizQuestions.map(q => `
      <article class="admin-item no-image">
        <div class="admin-item-main">
          <strong>${q.question}</strong>
          <span>ordem ${q.display_order || 0} · ${q.is_active ? 'ativa' : 'oculta'}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-ghost" data-edit-quiz="${q.id}">Editar</button>
          <button class="btn btn-ghost danger" data-delete-quiz="${q.id}">Apagar</button>
        </div>
      </article>
    `).join('');
    $$('[data-edit-quiz]').forEach(btn => btn.addEventListener('click', () => editQuizQuestion(btn.dataset.editQuiz)));
    $$('[data-delete-quiz]').forEach(btn => btn.addEventListener('click', () => deleteQuizQuestion(btn.dataset.deleteQuiz)));
  }

  async function loadQuizQuestions() {
    const { data, error } = await supabase.from('quiz_questions').select('*').order('display_order', { ascending: true });
    if (error) return setStatus(error.message, 'error');
    quizQuestions = data || [];
    renderQuizQuestions();
  }

  function renderQuizResults() {
    const form = $('#quizResultsForm');
    form.innerHTML = quizResults.map(r => `
      <div class="admin-result-box">
        <label>Chave
          <input type="text" value="${r.result_key}" disabled />
        </label>
        <label>Título
          <input data-result-title="${r.id}" type="text" value="${(r.title || '').replace(/"/g, '&quot;')}" />
        </label>
        <label>Descrição
          <textarea data-result-description="${r.id}" rows="4">${r.description || ''}</textarea>
        </label>
      </div>
    `).join('');
  }

  async function loadQuizResults() {
    const { data, error } = await supabase.from('quiz_results').select('*').order('result_key', { ascending: true });
    if (error) return setStatus(error.message, 'error');
    quizResults = data || [];
    renderQuizResults();
  }

  async function saveQuizResults() {
    for (const r of quizResults) {
      const title = $(`[data-result-title="${r.id}"]`).value;
      const description = $(`[data-result-description="${r.id}"]`).value;
      const { error } = await supabase.from('quiz_results').update({ title, description }).eq('id', r.id);
      if (error) return setStatus(error.message, 'error');
    }
    setStatus('Resultados do quiz salvos.', 'success');
    await loadQuizResults();
  }

  async function saveQuizQuestion(event) {
    event.preventDefault();
    const id = $('#quizQuestionId').value;
    const question = $('#quizQuestionText').value.trim();
    const options = $('#quizOptionsText').value.split('\n').map(x => x.trim()).filter(Boolean);
    const payload = {
      question,
      display_order: Number($('#quizOrder').value || 0),
      is_active: $('#quizActive').checked,
    };

    let questionId = id;
    if (id) {
      const { error } = await supabase.from('quiz_questions').update(payload).eq('id', id);
      if (error) return setStatus(error.message, 'error');
      await supabase.from('quiz_options').delete().eq('question_id', id);
    } else {
      const { data, error } = await supabase.from('quiz_questions').insert(payload).select('id').single();
      if (error) return setStatus(error.message, 'error');
      questionId = data.id;
    }

    if (options.length) {
      const rows = options.map((option_text, index) => ({ question_id: questionId, option_text, display_order: index + 1 }));
      const { error } = await supabase.from('quiz_options').insert(rows);
      if (error) return setStatus(error.message, 'error');
    }

    setStatus('Pergunta do quiz salva.', 'success');
    clearQuizForm();
    await loadQuizQuestions();
  }

  async function saveProject(event) {
    event.preventDefault();
    try {
      setStatus('Salvando projeto...');
      const id = $('#projectId').value;
      const file = $('#projectImageFile').files[0];
      const uploadedUrl = await uploadProjectImage(file);
      const payload = projectPayload(uploadedUrl);

      if (!payload.title) return setStatus('Digite o título do projeto.', 'error');

      // Persiste tentando incluir campos opcionais; se a coluna não existir,
      // remove o campo problemático e tenta novamente (backward compatible).
      const trySave = async (data) => {
        if (id) return supabase.from('projects').update(data).eq('id', id);
        return supabase.from('projects').insert(data);
      };
      let { error } = await trySave(payload);
      let guard = 0;
      while (error && guard++ < OPTIONAL_PROJECT_FIELDS.length) {
        const m = /column [\"']?(\w+)[\"']?/i.exec(error.message || '');
        const col = m && m[1];
        if (col && OPTIONAL_PROJECT_FIELDS.includes(col) && col in payload) {
          delete payload[col];
          ({ error } = await trySave(payload));
        } else { break; }
      }
      if (error) throw error;


      setStatus('Projeto salvo com sucesso.', 'success');
      clearProjectForm();
      await loadProjects();
    } catch (error) {
      setStatus(error.message || 'Erro ao salvar projeto.', 'error');
    }
  }

  function initTabs() {
    $$('.admin-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.admin-tab').forEach(x => x.classList.remove('active'));
        $$('.admin-section').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        $(`#tab-${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  async function init() {
    await requireAuth();
    initTabs();
    $('#logoutBtn').addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'login.html';
    });
    $('#projectForm').addEventListener('submit', saveProject);
    $('#clearProjectBtn').addEventListener('click', clearProjectForm);
    $('#saveSettingsBtn').addEventListener('click', saveSettings);
    $('#quizQuestionForm').addEventListener('submit', saveQuizQuestion);
    $('#clearQuizBtn').addEventListener('click', clearQuizForm);
    $('#saveQuizResultsBtn').addEventListener('click', saveQuizResults);

    await Promise.all([loadProjects(), loadSettings(), loadQuizQuestions(), loadQuizResults()]);
  }

  init();
})();

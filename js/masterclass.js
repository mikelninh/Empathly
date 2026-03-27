/**
 * Empathly Masterclass — Lesson Engine + Teacher Dashboard
 *
 * Handles:
 * - Rendering all 5 modules and their lessons
 * - Progress tracking (localStorage + backend sync)
 * - Quiz engine with scoring
 * - Certificate request and display
 * - Teacher dashboard (class creation, enrollment, student progress)
 */

(function () {
  'use strict';

  const MC_STORAGE_KEY   = 'empathly-mc-progress';   // { lessonId: { score, completedAt } }
  const MC_CLASS_KEY     = 'empathly-mc-class';       // { classCode, className, role: 'teacher'|'student' }
  const MC_CERTS_KEY     = 'empathly-mc-certificates';// [{ moduleId, certUuid, issuedAt }]
  const API_BASE         = window.EMPATHLY_API || 'http://localhost:8000';

  // ── Helpers ───────────────────────────────────────────────────────────────

  function mcGetProgress() {
    return JSON.parse(localStorage.getItem(MC_STORAGE_KEY) || '{}');
  }

  function mcSaveProgress(lessonId, moduleId, score) {
    const p = mcGetProgress();
    p[lessonId] = { score, moduleId, completedAt: new Date().toISOString() };
    localStorage.setItem(MC_STORAGE_KEY, JSON.stringify(p));
  }

  function mcIsLessonDone(lessonId) {
    return !!mcGetProgress()[lessonId];
  }

  function mcIsModuleDone(moduleId) {
    const mod = MASTERCLASS_MODULES.find(m => m.id === moduleId);
    if (!mod) return false;
    const progress = mcGetProgress();
    return mod.lessons.every(l => progress[l.id]);
  }

  function mcCountDoneLessons(moduleId) {
    const mod = MASTERCLASS_MODULES.find(m => m.id === moduleId);
    if (!mod) return 0;
    const progress = mcGetProgress();
    return mod.lessons.filter(l => progress[l.id]).length;
  }

  function mcGetUserId() {
    return parseInt(localStorage.getItem('empathly-user-id') || '0', 10);
  }

  function mcGetUserName() {
    return localStorage.getItem('empathly-user-name') || '';
  }

  async function mcSyncProgressToBackend(lessonId, moduleId, score) {
    const userId = mcGetUserId();
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/masterclass/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, lesson_id: lessonId, module_id: moduleId, score })
      });
    } catch (e) { /* offline — localStorage is source of truth */ }
  }

  async function mcRequestCertificate(moduleId) {
    const userId = mcGetUserId();
    const userName = mcGetUserName();
    if (!userId) return null;
    try {
      const res = await fetch(`${API_BASE}/masterclass/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, module_id: moduleId, user_name: userName })
      });
      if (!res.ok) return null;
      const data = await res.json();
      // Cache locally
      const certs = JSON.parse(localStorage.getItem(MC_CERTS_KEY) || '[]');
      const existing = certs.findIndex(c => c.moduleId === moduleId);
      const cert = { moduleId, certUuid: data.cert_uuid, issuedAt: data.issued_at, userName, moduleName: data.module_name };
      if (existing >= 0) certs[existing] = cert; else certs.push(cert);
      localStorage.setItem(MC_CERTS_KEY, JSON.stringify(certs));
      return data;
    } catch (e) { return null; }
  }

  // ── Main entry: render the masterclass landing ────────────────────────────

  function initMasterclassMode(container, lang) {
    const T = (LANGUAGES && LANGUAGES[lang]) ? LANGUAGES[lang] : LANGUAGES['de'];
    container.innerHTML = `
      <div class="mc-container">
        <div class="mc-header">
          <h2 class="mc-main-title">${lang === 'en' ? 'Empathly Masterclass' : 'Empathly Masterclass'}</h2>
          <p class="mc-main-sub">${lang === 'en' ? 'Social-Emotional Learning · 5 modules · Science-based' : 'Emotionale Alphabetisierung · 5 Module · Wissenschaftlich fundiert'}</p>
          <div class="mc-tier-note free-forever">
            ${lang === 'en' ? '💛 Modules 1–2 free forever · for every person' : '💛 Module 1–2 kostenlos für immer · für alle Menschen'}
          </div>
        </div>
        <div class="mc-badges-row" id="mc-badges-row"></div>
        <div class="mc-modules-list" id="mc-modules-list"></div>
        <div class="mc-teacher-btn-wrap">
          <button class="mc-teacher-btn" id="mc-teacher-btn">
            🏫 ${lang === 'en' ? 'Teacher Dashboard' : 'Lehrer-Dashboard'}
          </button>
        </div>
      </div>`;

    renderBadges(container, lang);
    renderModuleCards(container, lang);

    container.querySelector('#mc-teacher-btn').addEventListener('click', () => {
      renderTeacherDashboard(container, lang);
    });
  }

  // ── Badge shelf ───────────────────────────────────────────────────────────

  function renderBadges(container, lang) {
    const row = container.querySelector('#mc-badges-row');
    if (!row) return;
    const earned = Object.keys(MC_BADGES).filter(bid => {
      const b = MC_BADGES[bid];
      return mcIsModuleDone(b.module);
    });
    if (earned.length === 0) {
      row.innerHTML = `<p class="mc-no-badges">${lang === 'en' ? 'Complete modules to earn badges' : 'Schließe Module ab, um Abzeichen zu verdienen'}</p>`;
      return;
    }
    row.innerHTML = earned.map(bid => {
      const b = MC_BADGES[bid];
      return `<div class="mc-badge earned" title="${b[lang] || b.de}"><span>${b.emoji}</span><small>${b[lang] || b.de}</small></div>`;
    }).join('');
  }

  // ── Module cards ──────────────────────────────────────────────────────────

  function renderModuleCards(container, lang) {
    const list = container.querySelector('#mc-modules-list');
    if (!list) return;
    list.innerHTML = MASTERCLASS_MODULES.map(mod => {
      const done = mcCountDoneLessons(mod.id);
      const total = mod.lessons.length;
      const completed = mcIsModuleDone(mod.id);
      const locked = !mod.free && !mcIsModuleUnlocked(mod.id);
      const pct = Math.round((done / total) * 100);

      return `
        <div class="mc-module-card ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}"
             data-module="${mod.id}">
          <div class="mc-module-top">
            <span class="mc-module-badge-emoji">${mod.badge.emoji}</span>
            <div class="mc-module-info">
              <h3 class="mc-module-title">${mod.title[lang] || mod.title.de}</h3>
              <p class="mc-module-sub">${mod.subtitle[lang] || mod.subtitle.de}</p>
            </div>
            ${mod.free ? `<span class="mc-free-pill">${lang === 'en' ? 'Free' : 'Kostenlos'}</span>` : ''}
            ${locked ? `<span class="mc-pro-pill">Pro</span>` : ''}
            ${completed ? `<span class="mc-done-pill">✓</span>` : ''}
          </div>
          <div class="mc-module-desc">${mod.description[lang] || mod.description.de}</div>
          <div class="mc-progress-bar-wrap">
            <div class="mc-progress-bar" style="width:${pct}%"></div>
          </div>
          <div class="mc-module-footer">
            <span class="mc-lesson-count">${done}/${total} ${lang === 'en' ? 'Lessons' : 'Lektionen'}</span>
            ${locked
              ? `<button class="mc-btn mc-btn-lock" disabled>🔒 ${lang === 'en' ? 'Pro feature' : 'Pro-Feature'}</button>`
              : `<button class="mc-btn mc-btn-start" data-module="${mod.id}">
                  ${completed ? (lang === 'en' ? 'Review' : 'Wiederholen') : (done > 0 ? (lang === 'en' ? 'Continue' : 'Weitermachen') : (lang === 'en' ? 'Start' : 'Starten'))}
                </button>`
            }
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.mc-btn-start').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.module;
        renderModuleView(container, modId, lang);
      });
    });
  }

  function mcIsModuleUnlocked(moduleId) {
    // Free modules always unlocked
    const mod = MASTERCLASS_MODULES.find(m => m.id === moduleId);
    if (!mod) return false;
    if (mod.free) return true;
    // Pro/school: check localStorage tier flag (backend-enforced in production)
    const tier = localStorage.getItem('empathly-tier') || 'free';
    return tier === 'pro' || tier === 'school';
  }

  // ── Module view (lesson list) ─────────────────────────────────────────────

  function renderModuleView(container, moduleId, lang) {
    const mod = MASTERCLASS_MODULES.find(m => m.id === moduleId);
    if (!mod) return;

    container.innerHTML = `
      <div class="mc-container">
        <button class="mc-back-btn" id="mc-back-btn">← ${lang === 'en' ? 'All Modules' : 'Alle Module'}</button>
        <div class="mc-module-hero">
          <div class="mc-module-hero-badge">${mod.badge.emoji}</div>
          <h2>${mod.title[lang] || mod.title.de}</h2>
          <p>${mod.description[lang] || mod.description.de}</p>
        </div>
        <div class="mc-lessons-list" id="mc-lessons-list"></div>
      </div>`;

    container.querySelector('#mc-back-btn').addEventListener('click', () => {
      initMasterclassMode(container, lang);
    });

    const list = container.querySelector('#mc-lessons-list');
    mod.lessons.forEach((lesson, i) => {
      const done = mcIsLessonDone(lesson.id);
      const prev = i === 0 || mcIsLessonDone(mod.lessons[i - 1].id);
      const score = done ? (mcGetProgress()[lesson.id]?.score ?? null) : null;

      const item = document.createElement('div');
      item.className = `mc-lesson-item ${done ? 'done' : ''} ${!prev ? 'locked' : ''}`;
      item.innerHTML = `
        <div class="mc-lesson-num">${done ? '✓' : (i + 1)}</div>
        <div class="mc-lesson-meta">
          <span class="mc-lesson-emoji">${lesson.emoji}</span>
          <div>
            <div class="mc-lesson-title">${lesson.title[lang] || lesson.title.de}</div>
            <div class="mc-lesson-info">
              ${lesson.type === 'quiz' ? (lang === 'en' ? 'Quiz' : 'Quiz') : (lang === 'en' ? 'Read & Reflect' : 'Lesen & Reflektieren')}
              · ~${lesson.duration_min} min
              ${score !== null ? `· ${score}%` : ''}
            </div>
          </div>
        </div>
        ${prev ? `<button class="mc-lesson-btn" data-lesson="${lesson.id}" data-module="${moduleId}">${done ? '↩' : '→'}</button>` : '<span class="mc-lock-icon">🔒</span>'}`;

      item.querySelector('button')?.addEventListener('click', () => {
        renderLesson(container, moduleId, lesson.id, lang);
      });
      list.appendChild(item);
    });

    // If module is complete, show certificate section
    if (mcIsModuleDone(moduleId)) {
      renderCertSection(list, mod, lang);
    }
  }

  // ── Certificate section ───────────────────────────────────────────────────

  function renderCertSection(container, mod, lang) {
    const certs = JSON.parse(localStorage.getItem(MC_CERTS_KEY) || '[]');
    const existing = certs.find(c => c.moduleId === mod.id);

    const wrap = document.createElement('div');
    wrap.className = 'mc-cert-section';

    if (existing) {
      wrap.innerHTML = `
        <div class="mc-cert-earned">
          <div class="mc-cert-icon">${mod.badge.emoji}</div>
          <h3>${lang === 'en' ? 'Certificate earned!' : 'Zertifikat erhalten!'}</h3>
          <p>${lang === 'en' ? 'Share your achievement' : 'Teile deine Leistung'}</p>
          <div class="mc-cert-uuid">${lang === 'en' ? 'Certificate ID:' : 'Zertifikat-ID:'} <code>${existing.certUuid}</code></div>
          <button class="mc-cert-download-btn" data-module="${mod.id}" data-uuid="${existing.certUuid}" data-name="${existing.userName || ''}">
            ⬇ ${lang === 'en' ? 'Download Certificate' : 'Zertifikat herunterladen'}
          </button>
        </div>`;
      wrap.querySelector('.mc-cert-download-btn').addEventListener('click', (e) => {
        generateCertificateImage(mod, e.target.dataset.uuid, e.target.dataset.name || (lang === 'en' ? 'Learner' : 'Lernende/r'), lang);
      });
    } else {
      wrap.innerHTML = `
        <div class="mc-cert-available">
          <div class="mc-cert-icon">${mod.badge.emoji}</div>
          <h3>${lang === 'en' ? 'Module complete! Claim your certificate.' : 'Modul abgeschlossen! Hol dein Zertifikat.'}</h3>
          <p>${lang === 'en' ? 'Your certificate is stored on our server and can be verified by anyone.' : 'Dein Zertifikat wird auf unserem Server gespeichert und kann von jedem verifiziert werden.'}</p>
          <button class="mc-cert-claim-btn" data-module="${mod.id}">
            🏆 ${lang === 'en' ? 'Claim Certificate' : 'Zertifikat beantragen'}
          </button>
        </div>`;
      wrap.querySelector('.mc-cert-claim-btn').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = lang === 'en' ? 'Generating...' : 'Wird erstellt...';
        const cert = await mcRequestCertificate(mod.id);
        if (cert) {
          renderCertSection(container, mod, lang);
        } else {
          // Offline fallback: generate local certificate
          const uuid = 'local-' + Date.now();
          const name = mcGetUserName() || (lang === 'en' ? 'Learner' : 'Lernende/r');
          generateCertificateImage(mod, uuid, name, lang);
          btn.disabled = false;
          btn.textContent = lang === 'en' ? 'Claim Certificate' : 'Zertifikat beantragen';
        }
      });
    }

    container.appendChild(wrap);
  }

  // ── Certificate image generation (client-side canvas) ────────────────────

  function generateCertificateImage(mod, certUuid, userName, lang) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0D0B14');
    grad.addColorStop(1, '#1a1627');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold border
    ctx.strokeStyle = '#F6C344';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.strokeStyle = 'rgba(246,195,68,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Badge emoji (large)
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.fillText(mod.badge.emoji, canvas.width / 2, 160);

    // Title
    ctx.fillStyle = '#F6C344';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(lang === 'en' ? 'Certificate of Completion' : 'Zertifikat', canvas.width / 2, 250);

    // Empathly
    ctx.fillStyle = 'rgba(246,195,68,0.6)';
    ctx.font = '24px Georgia, serif';
    ctx.fillText('Empathly Masterclass', canvas.width / 2, 300);

    // User name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillText(userName, canvas.width / 2, 390);

    // Module name
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '26px Georgia, serif';
    const modName = lang === 'en' ? (mod.title.en || mod.title.de) : mod.title.de;
    ctx.fillText(lang === 'en' ? `has completed: ${modName}` : `hat abgeschlossen: ${modName}`, canvas.width / 2, 450);

    // Date
    const date = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '18px Georgia, serif';
    ctx.fillText(date, canvas.width / 2, 520);

    // Divider
    ctx.strokeStyle = 'rgba(246,195,68,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 560);
    ctx.lineTo(1000, 560);
    ctx.stroke();

    // Certificate ID
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px monospace';
    ctx.fillText(`ID: ${certUuid}`, canvas.width / 2, 600);

    // Verify URL
    ctx.fillStyle = 'rgba(246,195,68,0.5)';
    ctx.font = '16px monospace';
    ctx.fillText(`mikelninh.github.io/Empathly · ${lang === 'en' ? 'Emotional Literacy for Everyone' : 'Emotionale Bildung für alle'}`, canvas.width / 2, 640);

    // Download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `empathly-certificate-${mod.id}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }, 'image/png');
  }

  // ── Lesson renderer ───────────────────────────────────────────────────────

  function renderLesson(container, moduleId, lessonId, lang) {
    const mod  = MASTERCLASS_MODULES.find(m => m.id === moduleId);
    const lesson = mod?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.type === 'quiz') {
      renderQuiz(container, moduleId, lesson, lang);
      return;
    }

    // Read / explore / practice lesson
    const content = (lesson.content?.[lang] || lesson.content?.de || []);
    const blocks  = content.map(block => renderContentBlock(block, lang)).join('');

    container.innerHTML = `
      <div class="mc-lesson-container">
        <div class="mc-lesson-header">
          <button class="mc-back-btn" id="mc-lesson-back">← ${lang === 'en' ? 'Back' : 'Zurück'}</button>
          <span class="mc-lesson-type-pill">${lesson.type === 'practice' ? '🎮' : '📖'} ${lesson.duration_min} min</span>
        </div>
        <div class="mc-lesson-title-row">
          <span class="mc-lesson-big-emoji">${lesson.emoji}</span>
          <h2 class="mc-lesson-heading">${lesson.title[lang] || lesson.title.de}</h2>
        </div>
        <div class="mc-lesson-content">${blocks}</div>
        ${lesson.exercise ? renderExerciseEmbed(lesson.exercise, lang) : ''}
        <div class="mc-lesson-done-bar">
          <button class="mc-complete-btn" id="mc-complete-btn">
            ${mcIsLessonDone(lessonId) ? (lang === 'en' ? '✓ Done — go to next' : '✓ Erledigt — weiter') : (lang === 'en' ? 'Mark as complete ✓' : 'Als erledigt markieren ✓')}
          </button>
        </div>
      </div>`;

    container.querySelector('#mc-lesson-back').addEventListener('click', () => {
      renderModuleView(container, moduleId, lang);
    });

    container.querySelector('#mc-complete-btn').addEventListener('click', () => {
      mcSaveProgress(lessonId, moduleId, 100);
      mcSyncProgressToBackend(lessonId, moduleId, 100);
      renderModuleView(container, moduleId, lang);
    });
  }

  function renderContentBlock(block, lang) {
    switch (block.type) {
      case 'hook':
        return `<blockquote class="mc-block-hook">${block.text}</blockquote>`;
      case 'science':
        return `<div class="mc-block-science">
          <h4 class="mc-block-heading">${block.heading}</h4>
          <p>${block.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
        </div>`;
      case 'framework':
        return `<div class="mc-block-framework">
          <h4 class="mc-block-heading">${block.heading}</h4>
          <p>${(block.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>
        </div>`;
      case 'fact':
        return `<div class="mc-block-fact">💡 ${block.text}</div>`;
      case 'info':
        return `<div class="mc-block-info">${block.text}</div>`;
      case 'reflection':
        return `<div class="mc-block-reflection">
          <label class="mc-reflection-label">✍️ ${lang === 'en' ? 'Reflection' : 'Reflexion'}</label>
          <p class="mc-reflection-prompt">${block.prompt}</p>
          <textarea class="mc-reflection-input" rows="3" placeholder="${lang === 'en' ? 'Write here...' : 'Schreib hier...'}"></textarea>
        </div>`;
      case 'categories':
        return `<div class="mc-block-categories">${(block.items || []).map(item =>
          `<div class="mc-cat-item" data-cat="${item.cat}">
            <strong>${item.label}</strong>
            <span>${item.description}</span>
          </div>`).join('')}
        </div>`;
      case 'tools':
        return `<div class="mc-block-tools">
          <h4 class="mc-block-heading">${block.heading}</h4>
          ${(block.items || []).map(item =>
          `<div class="mc-tool-item"><strong>${item.name}</strong> — ${item.text}</div>`
        ).join('')}
        </div>`;
      case 'untranslatables':
        return `<div class="mc-block-untrans">${(block.items || []).map(item =>
          `<div class="mc-untrans-card">
            <div class="mc-untrans-word">${item.word}</div>
            <div class="mc-untrans-lang">${item.lang}</div>
            <div class="mc-untrans-meaning">${item.meaning}</div>
          </div>`).join('')}
        </div>`;
      case 'example':
        return `<div class="mc-block-example">
          <h4 class="mc-block-heading">${block.heading}</h4>
          <p>${block.text}</p>
        </div>`;
      case 'intro':
        return `<p class="mc-block-intro">${block.text}</p>`;
      case 'closing':
        return `<div class="mc-block-closing">${block.text}</div>`;
      default:
        return `<p>${block.text || ''}</p>`;
    }
  }

  function renderExerciseEmbed(exercise, lang) {
    const labels = {
      flashcards:     { de: 'Flashcard-Übung öffnen', en: 'Open flashcard exercise' },
      needs_map:      { de: 'Bedürfnis-Karte öffnen', en: 'Open needs map' },
      detective:      { de: 'Emotion Detective öffnen', en: 'Open emotion detective' },
      checkin:        { de: 'Check-In machen', en: 'Do check-in' },
      cultural_bridge:{ de: 'Kulturelle Brücke öffnen', en: 'Open cultural bridge' },
    };
    const label = labels[exercise.type]?.[lang] || labels[exercise.type]?.de || exercise.type;
    return `<div class="mc-exercise-embed">
      <button class="mc-exercise-btn" data-exercise="${exercise.type}">
        🎮 ${label}
      </button>
    </div>`;
  }

  // ── Quiz engine ───────────────────────────────────────────────────────────

  function renderQuiz(container, moduleId, lesson, lang) {
    let current = 0;
    let score   = 0;
    const questions = lesson.questions || [];

    function showQuestion() {
      if (current >= questions.length) {
        showQuizResults();
        return;
      }
      const q = questions[current];
      const opts = q.options[lang] || q.options.de;

      container.innerHTML = `
        <div class="mc-quiz-container">
          <div class="mc-quiz-header">
            <button class="mc-back-btn" id="mc-quiz-back">← ${lang === 'en' ? 'Back' : 'Zurück'}</button>
            <span class="mc-quiz-progress">${current + 1} / ${questions.length}</span>
          </div>
          <div class="mc-quiz-emoji">${lesson.emoji}</div>
          <h3 class="mc-quiz-question">${q.text[lang] || q.text.de}</h3>
          <div class="mc-quiz-options" id="mc-quiz-options">
            ${opts.map((opt, i) => `
              <button class="mc-quiz-opt" data-index="${i}">${opt}</button>
            `).join('')}
          </div>
          <div class="mc-quiz-feedback" id="mc-quiz-feedback" style="display:none"></div>
          <button class="mc-quiz-next" id="mc-quiz-next" style="display:none">
            ${current + 1 < questions.length ? (lang === 'en' ? 'Next →' : 'Weiter →') : (lang === 'en' ? 'See results' : 'Ergebnis ansehen')}
          </button>
        </div>`;

      container.querySelector('#mc-quiz-back').addEventListener('click', () => {
        renderModuleView(container, moduleId, lang);
      });

      container.querySelectorAll('.mc-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const chosen = parseInt(btn.dataset.index, 10);
          const correct = q.correct;
          container.querySelectorAll('.mc-quiz-opt').forEach(b => b.disabled = true);

          btn.classList.add(chosen === correct ? 'correct' : 'wrong');
          if (chosen !== correct) {
            container.querySelectorAll('.mc-quiz-opt')[correct].classList.add('correct');
          } else {
            score++;
          }

          const fb = container.querySelector('#mc-quiz-feedback');
          fb.style.display = 'block';
          fb.innerHTML = `<span class="${chosen === correct ? 'correct-text' : 'wrong-text'}">
            ${chosen === correct ? '✓ ' : '✗ '}${q.explanation?.[lang] || q.explanation?.de || ''}
          </span>`;

          container.querySelector('#mc-quiz-next').style.display = 'block';
        });
      });

      container.querySelector('#mc-quiz-next').addEventListener('click', () => {
        current++;
        showQuestion();
      });
    }

    function showQuizResults() {
      const pct = Math.round((score / questions.length) * 100);
      const passed = pct >= 75;

      container.innerHTML = `
        <div class="mc-quiz-results">
          <div class="mc-results-emoji">${passed ? '🎉' : '📚'}</div>
          <h2 class="mc-results-score">${pct}%</h2>
          <p class="mc-results-msg">
            ${passed
              ? (lang === 'en' ? 'Well done! Lesson complete.' : 'Sehr gut! Lektion abgeschlossen.')
              : (lang === 'en' ? 'Keep practicing — you\'ll get it.' : 'Üb weiter — du schaffst es.')}
          </p>
          <div class="mc-results-btns">
            ${!passed ? `<button class="mc-btn mc-btn-retry" id="mc-retry">↩ ${lang === 'en' ? 'Try again' : 'Nochmal'}</button>` : ''}
            <button class="mc-btn mc-btn-continue" id="mc-results-continue">
              ${lang === 'en' ? 'Continue' : 'Weiter'} →
            </button>
          </div>
        </div>`;

      if (passed || pct >= 50) {
        mcSaveProgress(lesson.id, moduleId, pct);
        mcSyncProgressToBackend(lesson.id, moduleId, pct);
      }

      container.querySelector('#mc-retry')?.addEventListener('click', () => {
        current = 0; score = 0; showQuestion();
      });

      container.querySelector('#mc-results-continue').addEventListener('click', () => {
        renderModuleView(container, moduleId, lang);
      });
    }

    showQuestion();
  }

  // ── Teacher Dashboard ─────────────────────────────────────────────────────

  function renderTeacherDashboard(container, lang) {
    const classInfo = JSON.parse(localStorage.getItem(MC_CLASS_KEY) || 'null');

    container.innerHTML = `
      <div class="mc-dashboard">
        <div class="mc-dashboard-header">
          <button class="mc-back-btn" id="mc-dash-back">← ${lang === 'en' ? 'Masterclass' : 'Masterclass'}</button>
          <h2>🏫 ${lang === 'en' ? 'Teacher Dashboard' : 'Lehrer-Dashboard'}</h2>
        </div>

        <div class="mc-dash-tabs">
          <button class="mc-dash-tab active" data-tab="create">${lang === 'en' ? 'My Class' : 'Meine Klasse'}</button>
          <button class="mc-dash-tab" data-tab="join">${lang === 'en' ? 'Join a Class' : 'Klasse beitreten'}</button>
          <button class="mc-dash-tab" data-tab="about">${lang === 'en' ? 'For Schools' : 'Für Schulen'}</button>
        </div>

        <div class="mc-dash-content" id="mc-dash-content"></div>
      </div>`;

    container.querySelector('#mc-dash-back').addEventListener('click', () => {
      initMasterclassMode(container, lang);
    });

    const tabs = container.querySelectorAll('.mc-dash-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderDashTab(container.querySelector('#mc-dash-content'), tab.dataset.tab, lang);
      });
    });

    renderDashTab(container.querySelector('#mc-dash-content'), 'create', lang);
  }

  function renderDashTab(el, tab, lang) {
    if (tab === 'create') renderDashCreate(el, lang);
    else if (tab === 'join') renderDashJoin(el, lang);
    else renderDashAbout(el, lang);
  }

  function renderDashCreate(el, lang) {
    const classInfo = JSON.parse(localStorage.getItem(MC_CLASS_KEY) || 'null');

    if (classInfo && classInfo.role === 'teacher') {
      // Show class management
      el.innerHTML = `
        <div class="mc-class-manage">
          <div class="mc-class-code-box">
            <span class="mc-class-code-label">${lang === 'en' ? 'Share this code with students:' : 'Teile diesen Code mit Schüler/innen:'}</span>
            <span class="mc-class-code-big">${classInfo.classCode}</span>
            <button class="mc-copy-btn" id="mc-copy-code">📋 ${lang === 'en' ? 'Copy' : 'Kopieren'}</button>
          </div>
          <h3 class="mc-class-name">${classInfo.className}</h3>
          <div id="mc-student-list">
            <p class="mc-loading">${lang === 'en' ? 'Loading students...' : 'Lade Schüler...'}</p>
          </div>
        </div>`;

      el.querySelector('#mc-copy-code').addEventListener('click', () => {
        navigator.clipboard?.writeText(classInfo.classCode);
      });

      loadClassStudents(el.querySelector('#mc-student-list'), classInfo.classCode, lang);
    } else {
      // Create class form
      el.innerHTML = `
        <div class="mc-create-class">
          <h3>${lang === 'en' ? 'Create a class' : 'Klasse erstellen'}</h3>
          <p>${lang === 'en'
            ? 'Students join with a 6-character code. You see their progress in real time.'
            : 'Schüler/innen treten mit einem 6-stelligen Code bei. Du siehst ihren Fortschritt in Echtzeit.'
          }</p>
          <input type="text" class="mc-input" id="mc-class-name-input"
            placeholder="${lang === 'en' ? 'Class name (e.g. Grade 8a)' : 'Klassenname (z.B. Klasse 8a)'}" maxlength="60">
          <button class="mc-btn mc-btn-create" id="mc-create-class-btn">
            ➕ ${lang === 'en' ? 'Create class' : 'Klasse erstellen'}
          </button>
          <p class="mc-dash-note">${lang === 'en'
            ? '💛 Teacher features are part of the School plan. Try it free with up to 5 students.'
            : '💛 Lehrer-Funktionen sind Teil des Schul-Tarifs. Kostenlos testen mit bis zu 5 Schüler/innen.'
          }</p>
        </div>`;

      el.querySelector('#mc-create-class-btn').addEventListener('click', async () => {
        const nameInput = el.querySelector('#mc-class-name-input');
        const className = nameInput.value.trim();
        if (!className) { nameInput.focus(); return; }

        const btn = el.querySelector('#mc-create-class-btn');
        btn.disabled = true;
        btn.textContent = lang === 'en' ? 'Creating...' : 'Erstelle...';

        const userId = mcGetUserId();
        let classCode = null;

        try {
          const res = await fetch(`${API_BASE}/masterclass/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacher_user_id: userId, class_name: className })
          });
          if (res.ok) {
            const data = await res.json();
            classCode = data.class_code;
          }
        } catch (e) { /* offline fallback */ }

        // Offline fallback: generate local code
        if (!classCode) {
          classCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        }

        const classInfo = { classCode, className, role: 'teacher', createdAt: new Date().toISOString() };
        localStorage.setItem(MC_CLASS_KEY, JSON.stringify(classInfo));
        renderDashCreate(el, lang);
      });
    }
  }

  async function loadClassStudents(el, classCode, lang) {
    try {
      const res = await fetch(`${API_BASE}/masterclass/classes/${classCode}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const students = data.students || [];

      if (students.length === 0) {
        el.innerHTML = `<p class="mc-empty">${lang === 'en' ? 'No students yet. Share the class code!' : 'Noch keine Schüler/innen. Teile den Klassen-Code!'}</p>`;
        return;
      }

      el.innerHTML = `
        <table class="mc-student-table">
          <thead>
            <tr>
              <th>${lang === 'en' ? 'Name' : 'Name'}</th>
              <th>${lang === 'en' ? 'Lessons done' : 'Lektionen'}</th>
              <th>${lang === 'en' ? 'Modules done' : 'Module'}</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td>${s.student_name || `User ${s.user_id}`}</td>
                <td>${s.lessons_done}</td>
                <td>${s.modules_done.length > 0 ? s.modules_done.map(m => {
                  const mod = MASTERCLASS_MODULES.find(mm => mm.id === m);
                  return mod ? mod.badge.emoji : m;
                }).join(' ') : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } catch (e) {
      el.innerHTML = `<p class="mc-empty">${lang === 'en' ? 'Could not load students (backend offline)' : 'Schüler nicht ladbar (Backend offline)'}</p>`;
    }
  }

  function renderDashJoin(el, lang) {
    el.innerHTML = `
      <div class="mc-join-class">
        <h3>${lang === 'en' ? 'Join a class' : 'Klasse beitreten'}</h3>
        <p>${lang === 'en' ? 'Enter the 6-character code your teacher gave you.' : 'Gib den 6-stelligen Code deiner Lehrperson ein.'}</p>
        <input type="text" class="mc-input mc-input-code" id="mc-join-code"
          placeholder="${lang === 'en' ? 'CLASS CODE' : 'KLASSEN-CODE'}" maxlength="6"
          style="text-transform:uppercase; letter-spacing:0.2em; font-size:1.4rem; text-align:center;">
        <input type="text" class="mc-input" id="mc-join-name"
          placeholder="${lang === 'en' ? 'Your name (for the teacher)' : 'Dein Name (für die Lehrperson)'}">
        <button class="mc-btn mc-btn-join" id="mc-join-btn">
          → ${lang === 'en' ? 'Join class' : 'Klasse beitreten'}
        </button>
        <div id="mc-join-feedback"></div>
      </div>`;

    el.querySelector('#mc-join-btn').addEventListener('click', async () => {
      const code = el.querySelector('#mc-join-code').value.trim().toUpperCase();
      const name = el.querySelector('#mc-join-name').value.trim();
      const fb   = el.querySelector('#mc-join-feedback');
      if (code.length < 4) { fb.innerHTML = `<p class="mc-error">${lang === 'en' ? 'Enter a valid code' : 'Gib einen gültigen Code ein'}</p>`; return; }

      const userId = mcGetUserId() || Date.now(); // fallback id
      try {
        const res = await fetch(`${API_BASE}/masterclass/classes/${code}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, student_name: name })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem(MC_CLASS_KEY, JSON.stringify({ classCode: code, className: data.class_name, role: 'student' }));
          fb.innerHTML = `<p class="mc-success">✓ ${lang === 'en' ? `Joined "${data.class_name}"!` : `Beigetreten: "${data.class_name}"!`}</p>`;
        } else {
          fb.innerHTML = `<p class="mc-error">${lang === 'en' ? 'Class not found.' : 'Klasse nicht gefunden.'}</p>`;
        }
      } catch (e) {
        fb.innerHTML = `<p class="mc-error">${lang === 'en' ? 'Backend offline. Try later.' : 'Backend nicht erreichbar.'}</p>`;
      }
    });
  }

  function renderDashAbout(el, lang) {
    el.innerHTML = `
      <div class="mc-about-schools">
        <h3>${lang === 'en' ? 'Empathly for Schools' : 'Empathly für Schulen'}</h3>
        <div class="mc-pricing-grid">
          <div class="mc-pricing-card free">
            <div class="mc-pricing-tier">${lang === 'en' ? 'Free — forever' : 'Kostenlos — für immer'}</div>
            <ul>
              <li>✓ ${lang === 'en' ? 'Modules 1 & 2' : 'Module 1 & 2'}</li>
              <li>✓ ${lang === 'en' ? 'All game modes' : 'Alle Spielmodi'}</li>
              <li>✓ ${lang === 'en' ? '15 languages' : '15 Sprachen'}</li>
              <li>✓ ${lang === 'en' ? 'No account needed' : 'Kein Account nötig'}</li>
            </ul>
            <div class="mc-pricing-price">€0</div>
          </div>
          <div class="mc-pricing-card pro">
            <div class="mc-pricing-tier">Pro</div>
            <ul>
              <li>✓ ${lang === 'en' ? 'All 5 modules' : 'Alle 5 Module'}</li>
              <li>✓ ${lang === 'en' ? 'Verified certificates' : 'Verifizierte Zertifikate'}</li>
              <li>✓ ${lang === 'en' ? 'Personal analytics' : 'Persönliche Analytik'}</li>
            </ul>
            <div class="mc-pricing-price">€4.99 / ${lang === 'en' ? 'mo' : 'Monat'}</div>
          </div>
          <div class="mc-pricing-card school">
            <div class="mc-pricing-tier">${lang === 'en' ? 'School' : 'Schule'}</div>
            <ul>
              <li>✓ ${lang === 'en' ? 'Everything in Pro' : 'Alles aus Pro'}</li>
              <li>✓ ${lang === 'en' ? 'Teacher dashboard' : 'Lehrer-Dashboard'}</li>
              <li>✓ ${lang === 'en' ? 'Class management' : 'Klassenverwaltung'}</li>
              <li>✓ ${lang === 'en' ? 'Bulk certificates' : 'Massen-Zertifikate'}</li>
              <li>✓ ${lang === 'en' ? 'CSV export' : 'CSV-Export'}</li>
              <li>✓ ${lang === 'en' ? 'CASEL-aligned curriculum' : 'CASEL-konformes Curriculum'}</li>
            </ul>
            <div class="mc-pricing-price">€2 / ${lang === 'en' ? 'student/year' : 'Schüler/Jahr'}</div>
            <small>${lang === 'en' ? 'Min. 30 students' : 'Min. 30 Schüler/innen'}</small>
          </div>
        </div>
        <p class="mc-contact-note">
          ${lang === 'en'
            ? '📧 Interested? Contact us at empathly@proton.me — we\'ll set up a free pilot class.'
            : '📧 Interesse? Schreib uns: empathly@proton.me — wir richten eine kostenlose Pilotklasse ein.'}
        </p>
        <p class="mc-ethics-note">
          ${lang === 'en'
            ? '💛 We never sell emotional data. No ads. No dark patterns. The mission is emotional literacy for everyone — monetization serves the mission, not the other way around.'
            : '💛 Wir verkaufen keine emotionalen Daten. Keine Werbung. Keine Dark Patterns. Die Mission ist emotionale Bildung für alle — die Monetarisierung dient der Mission, nicht umgekehrt.'}
        </p>
      </div>`;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  window.GefuehleMasterclass = {
    init: initMasterclassMode,
    renderModuleView,
    renderLesson,
    isModuleDone: mcIsModuleDone,
    getProgress: mcGetProgress,
  };

})();

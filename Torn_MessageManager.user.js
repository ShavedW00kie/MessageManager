// ==UserScript==
// @name         MessageManager for Torn (Floating Settings Button + Lock)
// @namespace    https://www.torn.com/
// @version      1.3.4
// @description  MessageManager - Tampermonkey userscript to manage message templates and auto-fill Torn compose page. Adds floating settings button with lock-in-place feature. Other behavior unchanged from prior version.
// @author       ShavedW00kie (Torn: ThaWookie [2954173])
// @homepageURL  https://github.com/ShavedW00kie/MessageManager
// @supportURL   https://github.com/ShavedW00kie/MessageManager/issues
// @downloadURL  https://update.greasyfork.org/scripts/576403/MessageManager%20for%20Torn%20%28Floating%20Settings%20Button%20%2B%20Lock%29.user.js
// @updateURL    https://update.greasyfork.org/scripts/576403/MessageManager%20for%20Torn%20%28Floating%20Settings%20Button%20%2B%20Lock%29.user.js
// @license      BSD-3-Clause
// @match        https://www.torn.com/messages.php*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

/*
 MessageManager v1.3.4 - Fully corrected release
 - Fixes pointer capture release on pointerup
 - Adds drag-start threshold to avoid accidental drags
 - Ensures lock state is respected during pointermove
 - Clears conflicting CSS 'right' when saving/applying left position
 - Debounces storage writes for position saves
 - Ensures GM_getValue/GM_setValue are awaited (handles async implementations)
 - Properly disconnects MutationObserver in waitForElement
 - Adds guards when compose fields are not found
 - Adds small keyboard nudge support for accessibility
 - Minor robustness improvements and defensive try/catch blocks
*/

/* ===========================
   Module A: Utilities and Bootstrap
   =========================== */

(function () {
  'use strict';

  // ---------- Config ----------
  const STORAGE_KEY = 'MM_templates_v1';
  const FLOATING_KEY = 'MM_floating_v1';
  const DEFAULT_STATE = {
    enabled: true,
    templates: [
      {
        id: 'template-coldcall',
        name: 'Cold Call Recruitment',
        subject: 'Recruitment Opportunity',
        body: "Hello,\n\nWe are recruiting motivated players to join our faction. If you're interested, reply and we'll discuss details.\n\nBest,\nRecruiter",
        createdAt: Date.now()
      }
    ],
    selectedTemplateId: 'template-coldcall',
    autoApplyOnOpen: false
  };
  const DEFAULT_FLOATING = { locked: false, x: null, y: null };

  // ---------- Safe GM storage wrappers (await-safe) ----------
  async function storageGet(key, fallback = null) {
    try {
      if (typeof GM_getValue === 'function') {
        const val = await GM_getValue(key);
        return val === undefined ? fallback : val;
      } else {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      }
    } catch (err) {
      console.error('MM storageGet error', err);
      return fallback;
    }
  }

  async function storageSet(key, value) {
    try {
      if (typeof GM_setValue === 'function') {
        await GM_setValue(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.error('MM storageSet error', err);
    }
  }

  // ---------- Helper: deep clone ----------
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ---------- Helper: generate UUID (simple) ----------
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ---------- Helper: waitForElement (disconnects observer properly) ----------
  function waitForElement(selector, root = document, timeout = 10000) {
    return new Promise((resolve, reject) => {
      try {
        const el = root.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver((mutations) => {
          const found = root.querySelector(selector);
          if (found) {
            observer.disconnect();
            clearTimeout(timer);
            resolve(found);
          }
        });

        observer.observe(root, { childList: true, subtree: true });

        const timer = setTimeout(() => {
          observer.disconnect();
          reject(new Error('Timeout waiting for element: ' + selector));
        }, timeout);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ---------- Debounce helper ----------
  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- Helper: waitForHashChangeOrLoad ----------
  function onComposePage(callback) {
    function check() {
      if (location.pathname.includes('/messages.php') && location.hash.includes('/p=compose')) {
        callback();
      }
    }
    window.addEventListener('hashchange', check);
    setTimeout(check, 500);
  }

  // ---------- CSS injection ----------
  GM_addStyle(`
    /* MessageManager styles */
    #mm-sidebar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 28px;
      border-radius: 4px;
      margin-left: 6px;
      cursor: pointer;
      font-weight: 700;
      color: #b7f5b7;
      background: linear-gradient(#0b3, #060);
      box-shadow: 0 0 12px rgba(0,255,100,0.45);
      border: 1px solid rgba(0,120,0,0.6);
      transition: transform .12s ease;
      z-index: 9999;
      position: fixed;
      right: 18px;
      top: 80px;
      user-select: none;
      touch-action: none;
      pointer-events: auto;
    }
    #mm-sidebar-btn.mm-disabled {
      background: linear-gradient(#444, #222);
      color: #999;
      box-shadow: none;
      border: 1px solid rgba(0,0,0,0.4);
      opacity: 0.8;
    }
    #mm-sidebar-btn.mm-locked {
      box-shadow: 0 0 6px rgba(0,255,100,0.25) inset;
      cursor: default;
    }
    #mm-settings-panel {
      position: fixed;
      right: 18px;
      top: 120px;
      width: 420px;
      max-width: calc(100% - 40px);
      background: #111;
      color: #ddd;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 6px 30px rgba(0,0,0,0.6);
      z-index: 99999;
      font-size: 13px;
      display: none;
    }
    #mm-settings-panel.open { display: block; }
    #mm-settings-panel .mm-row { margin-bottom: 8px; }
    #mm-settings-panel input[type="text"], #mm-settings-panel textarea, #mm-settings-panel select {
      width: 100%;
      box-sizing: border-box;
      background: #0f0f0f;
      color: #ddd;
      border: 1px solid #333;
      padding: 6px;
      border-radius: 4px;
    }
    #mm-settings-panel .mm-templates-list { max-height: 160px; overflow:auto; border:1px solid #222; padding:6px; background:#0b0b0b; }
    #mm-settings-panel button { background:#1a1a1a; color:#cfc; border:1px solid #2a2a2a; padding:6px 8px; border-radius:4px; cursor:pointer; }
    #mm-settings-panel .mm-actions { display:flex; gap:8px; justify-content:flex-end; }
    #mm-toast { position: fixed; right: 20px; bottom: 20px; background: #0b0; color: #012; padding: 8px 12px; border-radius: 6px; display:none; z-index:999999; }
    #mm-lock-btn { margin-left:8px; padding:4px 8px; border-radius:4px; }
  `);

  // ---------- Toast helper ----------
  function toast(msg, ms = 2500) {
    let t = document.getElementById('mm-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'mm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => (t.style.display = 'none'), ms);
  }

  /* ===========================
     Module B: Floating Sidebar Button Injection, Dragging, and Lock
     =========================== */

  async function ensureState() {
    const state = (await storageGet(STORAGE_KEY, null)) || DEFAULT_STATE;
    if (!state.templates) state.templates = clone(DEFAULT_STATE.templates);
    if (typeof state.enabled !== 'boolean') state.enabled = DEFAULT_STATE.enabled;
    if (!state.selectedTemplateId && state.templates.length) state.selectedTemplateId = state.templates[0].id;
    await storageSet(STORAGE_KEY, state);
    return state;
  }

  // Debounced save for floating position (avoid frequent writes)
  const debouncedSaveFloating = debounce(async (floatingState) => {
    await storageSet(FLOATING_KEY, floatingState);
    window._mm_floating_state_cached = floatingState;
  }, 200);

  // Floating button: create, position, drag, lock
  async function injectSidebarButton(state) {
    // Avoid duplicate
    if (document.getElementById('mm-sidebar-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'mm-sidebar-btn';
    btn.title = 'MessageManager (toggle)';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-pressed', state.enabled ? 'true' : 'false');
    btn.textContent = 'M/M';
    btn.setAttribute('tabindex', '0');
    if (!state.enabled) btn.classList.add('mm-disabled');

    // Load floating state
    const floating = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
    if (floating.locked) btn.classList.add('mm-locked');

    // Apply stored position if present
    if (floating.x !== null && floating.y !== null) {
      btn.style.right = 'auto';
      btn.style.left = floating.x + 'px';
      btn.style.top = floating.y + 'px';
    }

    // Click toggles enabled state (unchanged)
    btn.addEventListener('click', async (e) => {
      // Prevent accidental drag click conflict: only toggle if not dragging
      if (btn._mm_isDragging) return;
      e.preventDefault();
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      s.enabled = !s.enabled;
      await storageSet(STORAGE_KEY, s);
      btn.classList.toggle('mm-disabled', !s.enabled);
      btn.setAttribute('aria-pressed', s.enabled ? 'true' : 'false');
      toast('MessageManager ' + (s.enabled ? 'enabled' : 'disabled'));
    });

    // Right-click opens settings (unchanged)
    btn.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      openSettingsPanel();
    });

    // Keyboard nudge support for accessibility
    btn.addEventListener('keydown', async (ev) => {
      try {
        const floatingState = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
        if (floatingState.locked) return;
        const step = ev.shiftKey ? 10 : 2;
        const rect = btn.getBoundingClientRect();
        let newLeft = rect.left;
        let newTop = rect.top;
        if (ev.key === 'ArrowLeft') newLeft = Math.max(6, rect.left - step);
        if (ev.key === 'ArrowRight') newLeft = Math.max(6, rect.left + step);
        if (ev.key === 'ArrowUp') newTop = Math.max(6, rect.top - step);
        if (ev.key === 'ArrowDown') newTop = Math.max(6, rect.top + step);
        if (newLeft !== rect.left || newTop !== rect.top) {
          btn.style.left = newLeft + 'px';
          btn.style.top = newTop + 'px';
          btn.style.right = 'auto';
          floatingState.x = Math.round(newLeft);
          floatingState.y = Math.round(newTop);
          await debouncedSaveFloating(floatingState);
          ev.preventDefault();
        }
      } catch (err) {
        console.error('MM keyboard nudge error', err);
      }
    });

    // Dragging behavior (only when unlocked)
    let isDragging = false;
    let draggingStarted = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    const DRAG_THRESHOLD = 6; // pixels

    function onPointerDown(e) {
      try {
        // Only left button or touch
        if (e.button !== undefined && e.button !== 0) return;
        const f = (window._mm_floating_state_cached || DEFAULT_FLOATING);
        if (f.locked) return; // do not drag when locked
        isDragging = true;
        draggingStarted = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = btn.getBoundingClientRect();
        origLeft = rect.left;
        origTop = rect.top;
        btn._mm_isDragging = false;
        // capture pointer if supported
        try {
          (e.target || e.srcElement).setPointerCapture && (e.target || e.srcElement).setPointerCapture(e.pointerId);
        } catch (err) { /* ignore */ }
        btn.style.transition = 'none';
        e.preventDefault();
      } catch (err) {
        console.error('MM onPointerDown error', err);
      }
    }

    function onPointerMove(e) {
      try {
        if (!isDragging) return;
        const f = (window._mm_floating_state_cached || DEFAULT_FLOATING);
        if (f.locked) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!draggingStarted && dist < DRAG_THRESHOLD) return;
        draggingStarted = true;
        btn._mm_isDragging = true;
        const newLeft = Math.max(6, origLeft + dx);
        const newTop = Math.max(6, origTop + dy);
        btn.style.left = newLeft + 'px';
        btn.style.top = newTop + 'px';
        btn.style.right = 'auto';
      } catch (err) {
        console.error('MM onPointerMove error', err);
      }
    }

    async function onPointerUp(e) {
      try {
        if (!isDragging) return;
        isDragging = false;
        draggingStarted = false;
        btn.style.transition = '';
        // release pointer capture if supported
        try {
          (e.target || e.srcElement).releasePointerCapture && (e.target || e.srcElement).releasePointerCapture(e.pointerId);
        } catch (err) { /* ignore */ }

        // Save position to storage (debounced)
        const rect = btn.getBoundingClientRect();
        const floatingState = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
        floatingState.x = Math.round(rect.left);
        floatingState.y = Math.round(rect.top);
        // ensure we clear 'right' usage by applying left/top
        btn.style.right = 'auto';
        await debouncedSaveFloating(floatingState);
        toast('Button position saved');
        // small timeout to clear dragging flag
        setTimeout(() => { btn._mm_isDragging = false; }, 50);
      } catch (err) {
        console.error('MM onPointerUp error', err);
      }
    }

    // Pointer events for mouse/touch/pen
    btn.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Append to body
    document.body.appendChild(btn);

    // Cache floating state globally for quick checks
    window._mm_floating_state_cached = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
  }

  /* ===========================
     Module C: Settings UI and Template Storage (with Lock control)
     =========================== */

  async function buildSettingsPanel(state) {
    if (document.getElementById('mm-settings-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'mm-settings-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>MessageManager Settings</strong>
        <div>
          <button id="mm-lock-btn" aria-label="Lock button">Lock</button>
          <button id="mm-close-btn" aria-label="Close settings">Close</button>
        </div>
      </div>
      <div class="mm-row">
        <label><input type="checkbox" id="mm-enabled-checkbox"> Enable MessageManager</label>
      </div>
      <div class="mm-row">
        <label>Auto apply template on compose open
          <input type="checkbox" id="mm-autoapply-checkbox" style="margin-left:8px;">
        </label>
      </div>
      <div class="mm-row">
        <label>Templates</label>
        <div class="mm-templates-list" id="mm-templates-list"></div>
      </div>
      <div class="mm-row">
        <label>Template Name</label>
        <input type="text" id="mm-template-name" placeholder="Template name">
      </div>
      <div class="mm-row">
        <label>Subject</label>
        <input type="text" id="mm-template-subject" placeholder="Email subject">
      </div>
      <div class="mm-row">
        <label>Body</label>
        <textarea id="mm-template-body" rows="6" placeholder="Message body (plain text or markdown)"></textarea>
      </div>
      <div class="mm-row mm-actions">
        <button id="mm-save-template">Save Template</button>
        <button id="mm-delete-template">Delete Selected</button>
        <button id="mm-insert-template">Insert into Compose</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Wire up events
    document.getElementById('mm-close-btn').addEventListener('click', () => {
      closeSettingsPanel();
    });

    // Lock button behavior
    const lockBtn = document.getElementById('mm-lock-btn');
    lockBtn.addEventListener('click', async () => {
      const floatingState = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
      floatingState.locked = !floatingState.locked;
      await storageSet(FLOATING_KEY, floatingState);
      window._mm_floating_state_cached = floatingState;
      updateLockUI(floatingState.locked);
      const btn = document.getElementById('mm-sidebar-btn');
      if (btn) btn.classList.toggle('mm-locked', floatingState.locked);
      toast(floatingState.locked ? 'Button locked' : 'Button unlocked');
    });

    // Initialize lock UI state
    const currentFloating = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
    updateLockUI(currentFloating.locked);

    document.getElementById('mm-enabled-checkbox').addEventListener('change', async (e) => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      s.enabled = e.target.checked;
      await storageSet(STORAGE_KEY, s);
      const btn = document.getElementById('mm-sidebar-btn');
      if (btn) btn.classList.toggle('mm-disabled', !s.enabled);
    });
    document.getElementById('mm-autoapply-checkbox').addEventListener('change', async (e) => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      s.autoApplyOnOpen = e.target.checked;
      await storageSet(STORAGE_KEY, s);
    });

    document.getElementById('mm-save-template').addEventListener('click', async () => {
      const name = document.getElementById('mm-template-name').value.trim();
      const subject = document.getElementById('mm-template-subject').value.trim();
      const body = document.getElementById('mm-template-body').value;
      if (!name) return toast('Template name required');
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      const id = uuidv4();
      const tpl = { id, name, subject, body, createdAt: Date.now() };
      s.templates.push(tpl);
      s.selectedTemplateId = id;
      await storageSet(STORAGE_KEY, s);
      await refreshTemplatesList();
      toast('Template saved');
    });

    document.getElementById('mm-delete-template').addEventListener('click', async () => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      if (!s.selectedTemplateId) return toast('No template selected');
      s.templates = s.templates.filter(t => t.id !== s.selectedTemplateId);
      s.selectedTemplateId = s.templates.length ? s.templates[0].id : null;
      await storageSet(STORAGE_KEY, s);
      await refreshTemplatesList();
      toast('Template deleted');
    });

    document.getElementById('mm-insert-template').addEventListener('click', async () => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      const tpl = s.templates.find(t => t.id === s.selectedTemplateId);
      if (!tpl) return toast('No template selected');
      await applyTemplateToCompose(tpl);
      toast('Template inserted into compose fields');
    });

    // initial populate
    await refreshTemplatesList();
    // set checkboxes
    const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
    document.getElementById('mm-enabled-checkbox').checked = !!s.enabled;
    document.getElementById('mm-autoapply-checkbox').checked = !!s.autoApplyOnOpen;
  }

  function updateLockUI(isLocked) {
    const lockBtn = document.getElementById('mm-lock-btn');
    if (!lockBtn) return;
    lockBtn.textContent = isLocked ? 'Locked 🔒' : 'Unlock 🔓';
    lockBtn.style.background = isLocked ? '#0b3' : '#333';
  }

  // Refresh templates list UI
  async function refreshTemplatesList() {
    const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
    const list = document.getElementById('mm-templates-list');
    if (!list) return;
    list.innerHTML = '';
    s.templates.forEach((tpl) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '6px';
      row.style.borderBottom = '1px solid #111';
      row.innerHTML = `
        <div style="flex:1;cursor:pointer;">
          <div style="font-weight:700;color:#cfc">${tpl.name}</div>
          <div style="font-size:12px;color:#999">${tpl.subject || '(no subject)'}</div>
        </div>
        <div style="margin-left:8px;">
          <button class="mm-select-btn" data-id="${tpl.id}">Select</button>
        </div>
      `;
      list.appendChild(row);
    });

    // wire select buttons
    list.querySelectorAll('.mm-select-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
        s.selectedTemplateId = id;
        await storageSet(STORAGE_KEY, s);
        // populate editor fields
        const tpl = s.templates.find(t => t.id === id);
        if (tpl) {
          document.getElementById('mm-template-name').value = tpl.name;
          document.getElementById('mm-template-subject').value = tpl.subject;
          document.getElementById('mm-template-body').value = tpl.body;
        }
        toast('Template selected');
      });
    });
  }

  function openSettingsPanel() {
    const panel = document.getElementById('mm-settings-panel');
    if (!panel) return;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    (async () => {
      const floatingState = (await storageGet(FLOATING_KEY, null)) || DEFAULT_FLOATING;
      const btn = document.getElementById('mm-sidebar-btn');
      if (btn) btn.classList.toggle('mm-locked', floatingState.locked);
      updateLockUI(floatingState.locked);
    })();
  }
  function closeSettingsPanel() {
    const panel = document.getElementById('mm-settings-panel');
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  /* ===========================
     Module D: Compose Page Detection and Autofill
     =========================== */

  // Compose page field selectors - add multiple fallbacks for robustness
  const SELECTORS = {
    subjectInput: [
      'input[name="subject"]',
      'input#subject',
      'input.compose-subject',
      'input[name="message_subject"]',
      'input[name="subject_field"]',
      '.compose-subject input'
    ],
    bodyTextarea: [
      'textarea[name="message"]',
      'textarea#message',
      'textarea.compose-body',
      'textarea[name="message_body"]',
      '.compose-body textarea'
    ],
    bodyContentEditable: [
      '[contenteditable="true"].editor',
      '.editor-content[contenteditable="true"]',
      '[contenteditable="true"].compose-editor'
    ]
  };

  function findFirst(selectorList, root = document) {
    for (const sel of selectorList) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (err) {
        // ignore invalid selectors
      }
    }
    return null;
  }

  function findSubjectField(root = document) {
    return findFirst(SELECTORS.subjectInput, root);
  }

  function findBodyField(root = document) {
    const ta = findFirst(SELECTORS.bodyTextarea, root);
    if (ta) return ta;
    return findFirst(SELECTORS.bodyContentEditable, root);
  }

  // Apply template to compose fields (defensive)
  async function applyTemplateToCompose(template) {
    if (!template) return;
    try {
      // Attempt to find fields with waitForElement fallbacks
      let subject = null;
      let body = null;
      try {
        subject = await waitForElement(SELECTORS.subjectInput[0], document, 800).catch(() => null);
      } catch (e) { subject = null; }
      // If not found quickly, try other selectors without waiting long
      if (!subject) subject = findSubjectField(document);

      try {
        body = await waitForElement(SELECTORS.bodyTextarea[0], document, 800).catch(() => null);
      } catch (e) { body = null; }
      if (!body) body = findBodyField(document);

      if (!subject && !body) {
        console.warn('MM: No compose fields found to apply template');
        toast('Compose fields not found. Please open the compose page or update selectors.');
        return;
      }

      // Subject
      if (subject) {
        try {
          subject.focus();
          subject.value = template.subject || '';
          subject.dispatchEvent(new Event('input', { bubbles: true }));
          subject.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (err) {
          console.warn('MM: failed to set subject', err);
        }
      }

      // Body
      // If body is a textarea element
      if (body && body.tagName && body.tagName.toLowerCase() === 'textarea') {
        try {
          body.focus();
          body.value = template.body || '';
          body.dispatchEvent(new Event('input', { bubbles: true }));
          body.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (err) {
          console.warn('MM: failed to set textarea body', err);
        }
      } else if (body && body.getAttribute && body.getAttribute('contenteditable') === 'true') {
        try {
          body.focus();
          const html = (template.body || '').split('\n').map(escapeHtml).join('<br>');
          body.innerHTML = html;
          body.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (err) {
          console.warn('MM: failed to set contenteditable body', err);
        }
      } else {
        // fallback: any textarea
        const fallback = document.querySelector('textarea');
        if (fallback) {
          fallback.value = template.body || '';
          fallback.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          console.warn('MM: No body field found to apply template (fallback failed)');
        }
      }
    } catch (err) {
      console.error('MM applyTemplateToCompose error', err);
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Observe compose page and auto-apply if configured
  async function observeComposePage() {
    onComposePage(async () => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      await buildSettingsPanel(s);
      await injectSidebarButton(s);

      if (!s.enabled) return;

      if (s.autoApplyOnOpen && s.selectedTemplateId) {
        const tpl = s.templates.find(t => t.id === s.selectedTemplateId);
        if (tpl) {
          setTimeout(() => applyTemplateToCompose(tpl), 600);
        }
      }

      addComposeQuickPicker();
    });
  }

  // Quick picker UI near compose area
  function addComposeQuickPicker() {
    if (document.getElementById('mm-quick-picker')) return;
    const container = document.createElement('div');
    container.id = 'mm-quick-picker';
    container.style.position = 'fixed';
    container.style.top = '110px';
    container.style.right = '18px';
    container.style.zIndex = 99998;
    container.style.background = '#0b0b0b';
    container.style.border = '1px solid #222';
    container.style.padding = '6px';
    container.style.borderRadius = '6px';
    container.style.display = 'flex';
    container.style.gap = '6px';
    container.style.flexDirection = 'column';
    container.style.maxWidth = '320px';
    container.style.fontSize = '13px';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.color = '#cfc';
    title.textContent = 'MessageManager';
    container.appendChild(title);

    const select = document.createElement('select');
    select.id = 'mm-quick-select';
    select.style.background = '#0f0f0f';
    select.style.color = '#ddd';
    select.style.border = '1px solid #222';
    select.style.padding = '6px';
    container.appendChild(select);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '6px';
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = 'Settings';
    const pageSourceBtn = document.createElement('button');
    pageSourceBtn.textContent = 'Page source';
    btnRow.appendChild(applyBtn);
    btnRow.appendChild(pageSourceBtn);
    btnRow.appendChild(settingsBtn);
    container.appendChild(btnRow);

    document.body.appendChild(container);

    // populate select
    (async () => {
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      select.innerHTML = '';
      s.templates.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        select.appendChild(opt);
      });
      if (s.selectedTemplateId) select.value = s.selectedTemplateId;
    })();

    applyBtn.addEventListener('click', async () => {
      const id = select.value;
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      const tpl = s.templates.find(t => t.id === id);
      if (!tpl) return toast('No template selected');
      await applyTemplateToCompose(tpl);
      toast('Template applied');
    });

    settingsBtn.addEventListener('click', () => {
      openSettingsPanel();
    });

    pageSourceBtn.addEventListener('click', async () => {
      const id = select.value;
      const s = (await storageGet(STORAGE_KEY)) || DEFAULT_STATE;
      const tpl = s.templates.find(t => t.id === id);
      if (!tpl) return toast('No template selected');
      await pasteFormattedPageSource(tpl);
      toast('Page source inserted');
    });
  }

  /* ===========================
     Module E: Page Source Formatted Paste
     =========================== */

  async function pasteFormattedPageSource(template) {
    const formatted = `**${template.subject || ''}**\n\n${template.body || ''}`;

    const bodyTextarea = findFirst(SELECTORS.bodyTextarea, document);
    const bodyCE = findFirst(SELECTORS.bodyContentEditable, document);

    if (bodyTextarea) {
      try {
        bodyTextarea.focus();
        bodyTextarea.value = formatted;
        bodyTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      } catch (err) {
        console.warn('MM pasteFormattedPageSource textarea error', err);
      }
    } else if (bodyCE) {
      try {
        const html = formatted.split('\n').map(escapeHtml).join('<br>');
        bodyCE.focus();
        bodyCE.innerHTML = html;
        bodyCE.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      } catch (err) {
        console.warn('MM pasteFormattedPageSource contenteditable error', err);
      }
    } else {
      const fallback = document.querySelector('textarea');
      if (fallback) {
        fallback.value = formatted;
        fallback.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.warn('MM: No body field found for page source paste');
      }
    }
  }

  /* ===========================
     Module F: Initialization and Boot
     =========================== */

  async function init() {
    try {
      const state = await ensureState();
      await injectSidebarButton(state);
      await buildSettingsPanel(state);
      await observeComposePage();

      if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Open MessageManager Settings', () => {
          openSettingsPanel();
        });
      }

      // If the page is already on compose, trigger compose observer
      if (location.pathname.includes('/messages.php') && location.hash.includes('/p=compose')) {
        setTimeout(() => {
          addComposeQuickPicker();
        }, 600);
      }

      console.info('MessageManager initialized (v1.3.4)');
    } catch (err) {
      console.error('MessageManager init error', err);
    }
  }

  // Start
  init();

  /* ===========================
     End of script
     =========================== */
})();

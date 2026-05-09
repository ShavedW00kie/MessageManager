// ==UserScript==
// @name         MessageManager for Torn (Modular v1.3.8)
// @namespace    https://www.torn.com/
// @version      1.3.10
// @icon https://github.com/ShavedW00kie/MessageManager/blob/85c7ea7a367a4918d89cd6278d24c6796094c27e/icons/Envelope.jpg
// @description  Message Manager for storing and automatically pasting in pre-generated messages into mails within Torn. Modular, robust, and compatible with Tampermonkey/Violentmonkey (desktop & mobile) and TornPDA.
// @author       ShavedW00kie (Torn: ThaWookie [2954173])
// @homepageURL  https://github.com/ShavedW00kie/MessageManager
// @supportURL   https://github.com/ShavedW00kie/MessageManager/issues
// @downloadURL  https://greasyfork.org/scripts/XXXXX/code/MessageManager.user.js
// @updateURL    https://greasyfork.org/scripts/XXXXX/code/MessageManager.user.js
// @license      BSD-3-Clause
// @match        https://www.torn.com/messages.php*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

/*
 MessageManager Modular v1.3.8
 - Deterministic per-row Delete button integrated into TemplatesManager.refreshUI
 - Removed fragile early-install delete-module and duplicate declarations
 - Consolidated debounced floating-position saver
 - Robust storage wrappers, UI, compose integration, and diagnostics
 - Compatible with Tampermonkey/Violentmonkey (desktop & mobile) and TornPDA
*/

(function () {
  'use strict';

  /* ===========================
     Module: Utils
     =========================== */
  const Utils = (function () {
    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    function debounce(fn, wait = 200) {
      let t = null;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }

    function waitForElement(selector, root = document, timeout = 10000) {
      return new Promise((resolve, reject) => {
        try {
          const el = root.querySelector(selector);
          if (el) return resolve(el);
          const observer = new MutationObserver(() => {
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

    return { uuidv4, debounce, escapeHtml, waitForElement };
  })();

  /* ===========================
     Module: Storage
     =========================== */
  const Storage = (function () {
    const DEFAULTS = {
      schemaVersion: 1,
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
    const KEY = 'MM_state_v1';
    async function getRaw(key, fallback = null) {
      try {
        if (typeof GM_getValue === 'function') {
          const val = await GM_getValue(key);
          return val === undefined ? fallback : val;
        } else {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        }
      } catch (err) {
        console.error('Storage.getRaw error', err);
        return fallback;
      }
    }
    async function setRaw(key, value) {
      try {
        if (typeof GM_setValue === 'function') {
          await GM_setValue(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (err) {
        console.error('Storage.setRaw error', err);
      }
    }

    async function load() {
      const s = (await getRaw(KEY, null)) || null;
      if (!s) {
        await setRaw(KEY, DEFAULTS);
        return JSON.parse(JSON.stringify(DEFAULTS));
      }
      if (!s.schemaVersion) s.schemaVersion = 1;
      return s;
    }

    async function save(state) {
      await setRaw(KEY, state);
    }

    const FLOAT_KEY = 'MM_floating_v1';
    async function loadFloating() {
      const f = (await getRaw(FLOAT_KEY, null)) || { locked: false, x: null, y: null };
      return f;
    }
    async function saveFloating(floating) {
      await setRaw(FLOAT_KEY, floating);
    }

    const BANNER_KEY = 'MM_support_banner_v1';
    async function bannerDismissed() {
      const b = (await getRaw(BANNER_KEY, null)) || { dismissed: false };
      return !!b.dismissed;
    }
    async function dismissBanner() {
      await setRaw(BANNER_KEY, { dismissed: true });
    }

    return { load, save, loadFloating, saveFloating, bannerDismissed, dismissBanner };
  })();

  /* ===========================
     Module: UI
     =========================== */
  const UI = (function () {
    const IDS = {
      btn: 'mm-sidebar-btn',
      panel: 'mm-settings-panel',
      quick: 'mm-quick-picker',
      toast: 'mm-toast'
    };

    function injectStyles() {
      if (document.getElementById('mm-styles')) return;
      const css = `
#${IDS.btn} { display:inline-flex; align-items:center; justify-content:center; width:36px; height:28px; border-radius:4px; cursor:pointer; font-weight:700; color:#b7f5b7; background:linear-gradient(#0b3,#060); box-shadow:0 0 12px rgba(0,255,100,0.45); border:1px solid rgba(0,120,0,0.6); transition:transform .12s ease; z-index:9999; position:fixed; right:18px; top:80px; user-select:none; touch-action:none; pointer-events:auto; }
#${IDS.btn}.mm-disabled { background:linear-gradient(#444,#222); color:#999; box-shadow:none; border:1px solid rgba(0,0,0,0.4); opacity:0.8; }
#${IDS.btn}.mm-locked { box-shadow:0 0 6px rgba(0,255,100,0.25) inset; cursor:default; }
#${IDS.panel} { position:fixed; right:18px; top:120px; width:420px; max-width:calc(100% - 40px); background:#111; color:#ddd; border:1px solid #333; border-radius:8px; padding:12px; box-shadow:0 6px 30px rgba(0,0,0,0.6); z-index:99999; font-size:13px; display:none; }
#${IDS.panel}.open { display:block; }
#${IDS.panel} input[type="text"], #${IDS.panel} textarea, #${IDS.panel} select { width:100%; box-sizing:border-box; background:#0f0f0f; color:#ddd; border:1px solid #333; padding:6px; border-radius:4px; }
#${IDS.panel} .mm-templates-list { max-height:160px; overflow:auto; border:1px solid #222; padding:6px; background:#0b0b0b; }
#${IDS.panel} button { background:#1a1a1a; color:#cfc; border:1px solid #2a2a2a; padding:6px 8px; border-radius:4px; cursor:pointer; }
#${IDS.quick} { position:fixed; top:110px; right:18px; z-index:99998; background:#0b0b0b; border:1px solid #222; padding:6px; border-radius:6px; display:flex; gap:6px; flex-direction:column; max-width:320px; font-size:13px; }
#${IDS.toast} { position:fixed; right:20px; bottom:20px; background:#0b0; color:#012; padding:8px 12px; border-radius:6px; display:none; z-index:999999; }
.mm-support-banner { display:flex; gap:10px; align-items:flex-start; justify-content:space-between; background:linear-gradient(180deg,#0f2b0f,#071207); border:1px solid rgba(0,120,0,0.18); color:#dfffe0; padding:8px 10px; border-radius:6px; margin-bottom:10px; font-size:13px; }
.mm-delete-btn { background: transparent; border: 1px solid rgba(255,255,255,0.06); color: #f88; padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 6px; }
.mm-delete-btn:hover { background: rgba(255,0,0,0.06); color: #ffb3b3; }
`;
      const s = document.createElement('style');
      s.id = 'mm-styles';
      s.textContent = css;
      document.head.appendChild(s);
    }

    function createButton() {
      if (document.getElementById(IDS.btn)) return document.getElementById(IDS.btn);
      const btn = document.createElement('div');
      btn.id = IDS.btn;
      btn.title = 'MessageManager (toggle)';
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'M/M';
      btn.tabIndex = 0;
      document.body.appendChild(btn);
      return btn;
    }

    function createPanel() {
      if (document.getElementById(IDS.panel)) return document.getElementById(IDS.panel);
      const panel = document.createElement('div');
      panel.id = IDS.panel;
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
      return panel;
    }

    function createQuickPicker() {
      if (document.getElementById(IDS.quick)) return document.getElementById(IDS.quick);
      const container = document.createElement('div');
      container.id = IDS.quick;
      container.innerHTML = `
<div style="font-weight:700;color:#cfc">MessageManager</div>
<select id="mm-quick-select" style="background:#0f0f0f;color:#ddd;border:1px solid #222;padding:6px;"></select>
<div style="display:flex;gap:6px;">
  <button id="mm-quick-apply">Apply</button>
  <button id="mm-quick-page-source">Page source</button>
  <button id="mm-quick-settings">Settings</button>
</div>
`;
      document.body.appendChild(container);
      return container;
    }

    function createToast() {
      let t = document.getElementById(IDS.toast);
      if (!t) {
        t = document.createElement('div');
        t.id = IDS.toast;
        document.body.appendChild(t);
      }
      return t;
    }

    function showToast(msg, ms = 2200) {
      const t = createToast();
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => (t.style.display = 'none'), ms);
    }

    async function insertSupportBanner(panel) {
      try {
        if (!panel) return;
        if (panel.querySelector('.mm-support-banner')) return;
        const dismissed = await Storage.bannerDismissed();
        if (dismissed) return;
        const banner = document.createElement('div');
        banner.className = 'mm-support-banner';
        const text = document.createElement('div');
        text.innerHTML = 'If this is useful to you & you like it, send a Xanax to <a href="https://www.torn.com/profiles.php?XID=2954173" target="_blank" rel="noopener noreferrer">ThaWookie [2954173]</a> ^_^';
        const actions = document.createElement('div');
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Dismiss';
        closeBtn.className = 'mm-support-close';
        closeBtn.addEventListener('click', async () => {
          banner.remove();
          await Storage.dismissBanner();
        });
        actions.appendChild(closeBtn);
        banner.appendChild(text);
        banner.appendChild(actions);
        panel.insertBefore(banner, panel.firstChild);
      } catch (err) {
        console.error('UI.insertSupportBanner error', err);
      }
    }

    return { injectStyles, createButton, createPanel, createQuickPicker, showToast, insertSupportBanner };
  })();

  /* ===========================
     Module: FloatingButton
     =========================== */
  const FloatingButton = (function (UI, Storage, Utils) {
    let btnEl = null;

    async function init(state) {
      UI.injectStyles();
      btnEl = UI.createButton();
      const floatingState = (await Storage.loadFloating()) || { locked: false, x: null, y: null };
      if (floatingState.locked) btnEl.classList.add('mm-locked');
      if (floatingState.x !== null && floatingState.y !== null) {
        btnEl.style.right = 'auto';
        btnEl.style.left = floatingState.x + 'px';
        btnEl.style.top = floatingState.y + 'px';
      }
      attachEvents();
      // cache floating state
      window._mm_floating_state_cached = floatingState;
    }

    function attachEvents() {
      if (!btnEl) return;
      btnEl.addEventListener('click', async (e) => {
        if (btnEl._mm_isDragging) return;
        const s = await Storage.load();
        s.enabled = !s.enabled;
        await Storage.save(s);
        btnEl.classList.toggle('mm-disabled', !s.enabled);
        UI.showToast('MessageManager ' + (s.enabled ? 'enabled' : 'disabled'));
      });

      btnEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const panel = document.getElementById('mm-settings-panel');
        if (panel) panel.classList.add('open');
      });

      btnEl.addEventListener('keydown', async (ev) => {
        try {
          const f = (await Storage.loadFloating()) || { locked: false };
          if (f.locked) return;
          const step = ev.shiftKey ? 10 : 2;
          const rect = btnEl.getBoundingClientRect();
          let newLeft = rect.left;
          let newTop = rect.top;
          if (ev.key === 'ArrowLeft') newLeft = Math.max(6, rect.left - step);
          if (ev.key === 'ArrowRight') newLeft = Math.max(6, rect.left + step);
          if (ev.key === 'ArrowUp') newTop = Math.max(6, rect.top - step);
          if (ev.key === 'ArrowDown') newTop = Math.max(6, rect.top + step);
          if (newLeft !== rect.left || newTop !== rect.top) {
            btnEl.style.left = newLeft + 'px';
            btnEl.style.top = newTop + 'px';
            btnEl.style.right = 'auto';
            await Storage.saveFloating({ ...f, x: Math.round(newLeft), y: Math.round(newTop) });
            window._mm_floating_state_cached = { ...f, x: Math.round(newLeft), y: Math.round(newTop) };
            UI.showToast('Button position saved');
            ev.preventDefault();
          }
        } catch (err) {
          console.error('FloatingButton key error', err);
        }
      });

      let isDragging = false;
      let draggingStarted = false;
      let startX = 0;
      let startY = 0;
      let origLeft = 0;
      let origTop = 0;
      const DRAG_THRESHOLD = 6;

      function onPointerDown(e) {
        try {
          if (e.button !== undefined && e.button !== 0) return;
          const f = (window._mm_floating_state_cached || { locked: false });
          if (f.locked) return;
          isDragging = true;
          draggingStarted = false;
          startX = e.clientX;
          startY = e.clientY;
          const rect = btnEl.getBoundingClientRect();
          origLeft = rect.left;
          origTop = rect.top;
          btnEl._mm_isDragging = false;
          try { (e.target || e.srcElement).setPointerCapture && (e.target || e.srcElement).setPointerCapture(e.pointerId); } catch (err) {}
          btnEl.style.transition = 'none';
          e.preventDefault();
        } catch (err) {
          console.error('FloatingButton onPointerDown', err);
        }
      }

      function onPointerMove(e) {
        try {
          if (!isDragging) return;
          const f = (window._mm_floating_state_cached || { locked: false });
          if (f.locked) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (!draggingStarted && dist < DRAG_THRESHOLD) return;
          draggingStarted = true;
          btnEl._mm_isDragging = true;
          const newLeft = Math.max(6, origLeft + dx);
          const newTop = Math.max(6, origTop + dy);
          btnEl.style.left = newLeft + 'px';
          btnEl.style.top = newTop + 'px';
          btnEl.style.right = 'auto';
        } catch (err) {
          console.error('FloatingButton onPointerMove', err);
        }
      }

      // Single debounced floating-position saver (consolidated)
      const saveFloatingDebounced = Utils.debounce(async () => {
        try {
          const rect = btnEl.getBoundingClientRect();
          const f = (await Storage.loadFloating()) || { locked: false, x: null, y: null };
          f.x = Math.round(rect.left);
          f.y = Math.round(rect.top);
          await Storage.saveFloating(f);
          window._mm_floating_state_cached = f;
        } catch (err) {
          console.error('FloatingButton saveFloatingDebounced', err);
        }
      }, 180);

      async function onPointerUp(e) {
        try {
          if (!isDragging) return;
          isDragging = false;
          draggingStarted = false;
          btnEl.style.transition = '';
          try { (e.target || e.srcElement).releasePointerCapture && (e.target || e.srcElement).releasePointerCapture(e.pointerId); } catch (err) {}
          await saveFloatingDebounced();
          UI.showToast('Button position saved');
          setTimeout(() => { btnEl._mm_isDragging = false; }, 50);
        } catch (err) {
          console.error('FloatingButton onPointerUp', err);
        }
      }

      btnEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    return { init };
  })(UI, Storage, Utils);

  /* ===========================
     Module: TemplatesManager
     =========================== */
  const TemplatesManager = (function (Storage, Utils, UI) {
    async function init() {
      await refreshUI();
      const panel = document.getElementById('mm-settings-panel');
      if (!panel) return;
      panel.querySelector('#mm-save-template').addEventListener('click', saveTemplate);
      panel.querySelector('#mm-delete-template').addEventListener('click', deleteTemplate);
      panel.querySelector('#mm-insert-template').addEventListener('click', insertSelectedIntoCompose);
      panel.querySelector('#mm-close-btn').addEventListener('click', () => panel.classList.remove('open'));
      panel.querySelector('#mm-lock-btn').addEventListener('click', async () => {
        const f = (await Storage.loadFloating()) || { locked: false };
        f.locked = !f.locked;
        await Storage.saveFloating(f);
        window._mm_floating_state_cached = f;
        document.getElementById('mm-sidebar-btn')?.classList.toggle('mm-locked', f.locked);
        UI.showToast(f.locked ? 'Button locked' : 'Button unlocked');
      });
      panel.querySelector('#mm-enabled-checkbox').addEventListener('change', async (e) => {
        const s = await Storage.load();
        s.enabled = e.target.checked;
        await Storage.save(s);
        document.getElementById('mm-sidebar-btn')?.classList.toggle('mm-disabled', !s.enabled);
      });
      panel.querySelector('#mm-autoapply-checkbox').addEventListener('change', async (e) => {
        const s = await Storage.load();
        s.autoApplyOnOpen = e.target.checked;
        await Storage.save(s);
      });
    }

    async function refreshUI() {
      try {
        const s = await Storage.load();
        const list = document.getElementById('mm-templates-list');
        if (!list) return;
        list.innerHTML = '';
        // Build rows deterministically and include per-row Delete button
        s.templates.forEach((tpl) => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.padding = '6px';
          row.style.borderBottom = '1px solid #111';

          // left side: name + subject
          const left = document.createElement('div');
          left.style.flex = '1';
          left.style.cursor = 'pointer';
          left.innerHTML = `<div style="font-weight:700;color:#cfc">${tpl.name}</div><div style="font-size:12px;color:#999">${tpl.subject || '(no subject)'}</div>`;

          // right side container (select + delete)
          const right = document.createElement('div');
          right.style.marginLeft = '8px';
          right.style.display = 'flex';
          right.style.gap = '6px';
          right.style.alignItems = 'center';

          // Select button
          const selectBtn = document.createElement('button');
          selectBtn.className = 'mm-select-btn';
          selectBtn.dataset.id = tpl.id;
          selectBtn.textContent = 'Select';
          selectBtn.addEventListener('click', async () => {
            const s2 = await Storage.load();
            s2.selectedTemplateId = tpl.id;
            await Storage.save(s2);
            const panel = document.getElementById('mm-settings-panel');
            if (panel) {
              const nameEl = panel.querySelector('#mm-template-name');
              const subjEl = panel.querySelector('#mm-template-subject');
              const bodyEl = panel.querySelector('#mm-template-body');
              if (nameEl) nameEl.value = tpl.name;
              if (subjEl) subjEl.value = tpl.subject;
              if (bodyEl) bodyEl.value = tpl.body;
            }
            UI.showToast('Template selected');
          });

          // Delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'mm-delete-btn';
          deleteBtn.type = 'button';
          deleteBtn.textContent = 'Delete';
          deleteBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (!confirm('Delete this template? This action cannot be undone.')) return;
            try {
              const s3 = await Storage.load();
              s3.templates = s3.templates.filter(t => t.id !== tpl.id);
              if (s3.selectedTemplateId === tpl.id) s3.selectedTemplateId = s3.templates.length ? s3.templates[0].id : null;
              await Storage.save(s3);
              await refreshUI();
              UI.showToast('Template deleted');
            } catch (err) {
              console.error('Delete template error', err);
              UI.showToast('Failed to delete template');
            }
          });

          right.appendChild(selectBtn);
          right.appendChild(deleteBtn);
          row.appendChild(left);
          row.appendChild(right);
          list.appendChild(row);
        });

        // Update settings panel fields and quick picker
        const panel = document.getElementById('mm-settings-panel');
        if (!panel) return;
        panel.querySelector('#mm-enabled-checkbox').checked = !!s.enabled;
        panel.querySelector('#mm-autoapply-checkbox').checked = !!s.autoApplyOnOpen;
        if (s.selectedTemplateId) {
          const tpl = s.templates.find(t => t.id === s.selectedTemplateId);
          if (tpl) {
            panel.querySelector('#mm-template-name').value = tpl.name;
            panel.querySelector('#mm-template-subject').value = tpl.subject;
            panel.querySelector('#mm-template-body').value = tpl.body;
          }
        }
        const quick = document.getElementById('mm-quick-select');
        if (quick) {
          quick.innerHTML = '';
          s.templates.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            quick.appendChild(opt);
          });
          if (s.selectedTemplateId) quick.value = s.selectedTemplateId;
        }
      } catch (err) {
        console.error('TemplatesManager.refreshUI error', err);
      }
    }

    async function saveTemplate() {
      const name = document.getElementById('mm-template-name').value.trim();
      const subject = document.getElementById('mm-template-subject').value.trim();
      const body = document.getElementById('mm-template-body').value;
      if (!name) return UI.showToast('Template name required');
      const s = await Storage.load();
      const id = Utils.uuidv4();
      const tpl = { id, name, subject, body, createdAt: Date.now() };
      s.templates.push(tpl);
      s.selectedTemplateId = id;
      await Storage.save(s);
      await refreshUI();
      UI.showToast('Template saved');
    }

    async function deleteTemplate() {
      const s = await Storage.load();
      if (!s.selectedTemplateId) return UI.showToast('No template selected');
      s.templates = s.templates.filter(t => t.id !== s.selectedTemplateId);
      s.selectedTemplateId = s.templates.length ? s.templates[0].id : null;
      await Storage.save(s);
      await refreshUI();
      UI.showToast('Template deleted');
    }

    async function insertSelectedIntoCompose() {
      const s = await Storage.load();
      const tpl = s.templates.find(t => t.id === s.selectedTemplateId);
      if (!tpl) return UI.showToast('No template selected');
      await ComposeIntegration.applyTemplate(tpl);
      UI.showToast('Template inserted into compose fields');
    }

    return { init, refreshUI, saveTemplate, deleteTemplate, insertSelectedIntoCompose };
  })(Storage, Utils, UI);

  /* ===========================
     Module: ComposeIntegration
     =========================== */
  const ComposeIntegration = (function (Storage, Utils, UI) {
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

    function findFirst(list, root = document) {
      for (const sel of list) {
        try {
          const el = root.querySelector(sel);
          if (el) return el;
        } catch (err) { /* ignore invalid selector */ }
      }
      return null;
    }

    function onComposePage(callback) {
      function check() {
        if (location.pathname.includes('/messages.php') && location.hash.includes('/p=compose')) {
          callback();
        }
      }
      window.addEventListener('hashchange', check);
      setTimeout(check, 500);
    }

    async function applyTemplate(template) {
      if (!template) return;
      try {
        let subject = findFirst(SELECTORS.subjectInput);
        let body = findFirst(SELECTORS.bodyTextarea) || findFirst(SELECTORS.bodyContentEditable);
        if (!subject) {
          try { subject = await Utils.waitForElement(SELECTORS.subjectInput[0], document, 800).catch(() => null); } catch (e) { subject = null; }
          if (!subject) subject = findFirst(SELECTORS.subjectInput);
        }
        if (!body) {
          try { body = await Utils.waitForElement(SELECTORS.bodyTextarea[0], document, 800).catch(() => null); } catch (e) { body = null; }
          if (!body) body = findFirst(SELECTORS.bodyTextarea) || findFirst(SELECTORS.bodyContentEditable);
        }

        if (!subject && !body) {
          console.warn('ComposeIntegration: no compose fields found');
          UI.showToast('Compose fields not found. Open compose or update selectors.');
          return;
        }

        if (subject) {
          try {
            subject.focus();
            subject.value = template.subject || '';
            subject.dispatchEvent(new Event('input', { bubbles: true }));
            subject.dispatchEvent(new Event('change', { bubbles: true }));
          } catch (err) { console.warn('ComposeIntegration set subject failed', err); }
        }

        if (body && body.tagName && body.tagName.toLowerCase() === 'textarea') {
          try {
            body.focus();
            body.value = template.body || '';
            body.dispatchEvent(new Event('input', { bubbles: true }));
            body.dispatchEvent(new Event('change', { bubbles: true }));
          } catch (err) { console.warn('ComposeIntegration set textarea failed', err); }
        } else if (body && body.getAttribute && body.getAttribute('contenteditable') === 'true') {
          try {
            body.focus();
            const html = (template.body || '').split('\n').map(Utils.escapeHtml).join('<br>');
            body.innerHTML = html;
            body.dispatchEvent(new Event('input', { bubbles: true }));
          } catch (err) { console.warn('ComposeIntegration set contenteditable failed', err); }
        } else {
          const fallback = document.querySelector('textarea');
          if (fallback) {
            fallback.value = template.body || '';
            fallback.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            console.warn('ComposeIntegration: fallback textarea not found');
          }
        }
      } catch (err) {
        console.error('ComposeIntegration.applyTemplate error', err);
      }
    }

    async function pasteFormatted(template) {
      const formatted = `**${template.subject || ''}**\n\n${template.body || ''}`;
      try {
        const bodyTA = findFirst(SELECTORS.bodyTextarea);
        const bodyCE = findFirst(SELECTORS.bodyContentEditable);
        if (bodyTA) {
          bodyTA.focus();
          bodyTA.value = formatted;
          bodyTA.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        } else if (bodyCE) {
          const html = formatted.split('\n').map(Utils.escapeHtml).join('<br>');
          bodyCE.focus();
          bodyCE.innerHTML = html;
          bodyCE.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        } else {
          const fallback = document.querySelector('textarea');
          if (fallback) {
            fallback.value = formatted;
            fallback.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            console.warn('ComposeIntegration: no body field for page source paste');
          }
        }
      } catch (err) {
        console.error('ComposeIntegration.pasteFormatted error', err);
      }
    }

    async function init() {
      onComposePage(async () => {
        const s = await Storage.load();
        UI.createPanel();
        UI.createQuickPicker();
        await TemplatesManager.refreshUI?.();
        if (s.enabled && s.autoApplyOnOpen && s.selectedTemplateId) {
          const tpl = s.templates.find(t => t.id === s.selectedTemplateId);
          if (tpl) setTimeout(() => applyTemplate(tpl), 600);
        }
        const quick = document.getElementById('mm-quick-picker');
        if (quick) {
          quick.querySelector('#mm-quick-apply').onclick = async () => {
            const id = quick.querySelector('#mm-quick-select').value;
            const s2 = await Storage.load();
            const tpl = s2.templates.find(t => t.id === id);
            if (!tpl) return UI.showToast('No template selected');
            await applyTemplate(tpl);
            UI.showToast('Template applied');
          };
          quick.querySelector('#mm-quick-page-source').onclick = async () => {
            const id = quick.querySelector('#mm-quick-select').value;
            const s2 = await Storage.load();
            const tpl = s2.templates.find(t => t.id === id);
            if (!tpl) return UI.showToast('No template selected');
            await pasteFormatted(tpl);
            UI.showToast('Page source inserted');
          };
          quick.querySelector('#mm-quick-settings').onclick = () => {
            const panel = document.getElementById('mm-settings-panel');
            if (panel) panel.classList.add('open');
          };
        }
      });
    }

    return { init, applyTemplate, pasteFormatted };
  })(Storage, Utils, UI);

  /* ===========================
     Module: Diagnostics
     =========================== */
  const Diagnostics = (function (Storage) {
    async function dumpState() {
      const s = await Storage.load();
      const f = await Storage.loadFloating();
      console.info('MM Diagnostics - state:', s, 'floating:', f);
      return { state: s, floating: f };
    }
    window.MM_Diagnostics = { dumpState };
    return { dumpState };
  })(Storage);

  /* ===========================
     Module: Core / Bootstrap
     =========================== */
  const Core = (function (UI, Storage, FloatingButton, TemplatesManager, ComposeIntegration) {
    async function init() {
      try {
        UI.injectStyles();
        const state = await Storage.load();
        UI.createPanel();
        UI.createQuickPicker();
        await UI.insertSupportBanner(document.getElementById('mm-settings-panel'));
        await FloatingButton.init(state);
        await TemplatesManager.init();
        await ComposeIntegration.init();

        if (typeof GM_registerMenuCommand === 'function') {
          GM_registerMenuCommand('Open MessageManager Settings', () => {
            const panel = document.getElementById('mm-settings-panel');
            if (panel) panel.classList.add('open');
          });
        }

        // Ensure quick picker is populated if on compose already
        if (location.pathname.includes('/messages.php') && location.hash.includes('/p=compose')) {
          setTimeout(() => {
            TemplatesManager.refreshUI();
          }, 600);
        }

        console.info('MessageManager modular init complete (v1.3.8)');
      } catch (err) {
        console.error('Core.init error', err);
      }
    }
    return { init };
  })(UI, Storage, FloatingButton, TemplatesManager, ComposeIntegration);

  // Start
  Core.init();

  /* ===========================
     End of script
     =========================== */
})();

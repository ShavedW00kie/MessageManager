// ==UserScript==
// @name         MessageManager for Torn
// @namespace    https://github.com/ShavedW00kie/
// @version      1.3.14
// @description  Message Manager for storing and automatically pasting in pre-generated messages into mails within Torn. Modular, robust, and compatible with Tampermonkey/Violentmonkey (desktop & mobile) and TornPDA.
// @author       ShavedW00kie (Torn: ThaWookie [2954173] )
// @homepageURL  https://github.com/ShavedW00kie/MessageManager
// @supportURL   https://github.com/ShavedW00kie/MessageManager/issues
// @license      BSD-3-Clause
// @match        https://www.torn.com/messages.php*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @run-at       document-idle
// @icon data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABFUlEQVR4nO3XMQrCQBBF0Y8YkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgYkYgY
// ==/UserScript==

(function () {
  'use strict';

  // Required modular debugger instance for this userscript.
  const MyDebug = initializeModularDebugger(GM_info.script.name);

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

    function waitForElement(selector, root = document) {
      return new Promise((resolve, reject) => {
        try {
          const find = () => {
            try {
              return root.querySelector(selector);
            } catch (err) {
              reject(err);
              return null;
            }
          };

          const immediate = find();
          if (immediate) {
            resolve(immediate);
            return;
          }

          if (typeof MutationObserver === 'undefined') {
            reject(new Error('MutationObserver is unavailable while waiting for: ' + selector));
            return;
          }

          const observer = new MutationObserver(() => {
            const found = find();
            if (found) {
              observer.disconnect();
              resolve(found);
            }
          });

          observer.observe(root, { childList: true, subtree: true });
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
        MyDebug.error({ module: 'Storage', operation: 'getRaw', key, error: err });
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
        return true;
      } catch (err) {
        MyDebug.error({ module: 'Storage', operation: 'setRaw', key, error: err });
        return false;
      }
    }

    function cloneDefaults() {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }

    function normalizeTemplate(template, index = 0) {
      if (!template || typeof template !== 'object') return null;
      const id = typeof template.id === 'string' && template.id.trim()
        ? template.id
        : `template-${Date.now()}-${index}`;
      return {
        id,
        name: String(template.name ?? `Template ${index + 1}`).trim() || `Template ${index + 1}`,
        subject: String(template.subject ?? ''),
        body: String(template.body ?? ''),
        createdAt: Number.isFinite(Number(template.createdAt)) ? Number(template.createdAt) : Date.now(),
        ...(Number.isFinite(Number(template.updatedAt)) ? { updatedAt: Number(template.updatedAt) } : {})
      };
    }

    function normalizeState(raw) {
      const defaults = cloneDefaults();
      const source = raw && typeof raw === 'object' ? raw : {};
      const templates = Array.isArray(source.templates)
        ? source.templates.map(normalizeTemplate).filter(Boolean)
        : defaults.templates;

      const selectedTemplateId = templates.some(t => t.id === source.selectedTemplateId)
        ? source.selectedTemplateId
        : (templates[0]?.id ?? null);

      return {
        schemaVersion: 1,
        enabled: source.enabled !== false,
        templates,
        selectedTemplateId,
        autoApplyOnOpen: source.autoApplyOnOpen === true
      };
    }

    async function load() {
      const raw = await getRaw(KEY, null);
      if (!raw) {
        const defaults = cloneDefaults();
        if (!(await setRaw(KEY, defaults))) {
          throw new Error('Unable to initialize MessageManager storage.');
        }
        return defaults;
      }

      const normalized = normalizeState(raw);
      const serializedBefore = JSON.stringify(raw);
      const serializedAfter = JSON.stringify(normalized);

      if (serializedBefore !== serializedAfter) {
        await setRaw(KEY, normalized);
      }

      return normalized;
    }

    async function save(state) {
      const normalized = normalizeState(state);
      if (!(await setRaw(KEY, normalized))) {
        throw new Error('Unable to save MessageManager state.');
      }
      return normalized;
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
#${IDS.btn} { display:inline-flex; align-items:center; justify-content:center; width:36px; height:28px; border-radius:4px; cursor:pointer; font-weight:700; color:#b7f5b7; background:linear-gradient(#0b3,#060); box-shadow:0 0 12px rgba(0,255,100,0.45); border:1px solid rgba(0,120,0,0.6); transition:transform .12s ease; z-index:9999; position:fixed; right:18px; top:80px; user-select:none; touch-action:none; pointer-events:auto; font-family: sans-serif; line-height:1; }
#${IDS.btn}.mm-disabled { background:linear-gradient(#444,#222); color:#999; box-shadow:none; border:1px solid rgba(0,0,0,0.4); opacity:0.8; }
#${IDS.btn}.mm-locked { box-shadow:0 0 6px rgba(0,255,100,0.25) inset; cursor:default; }
#${IDS.panel} { position:fixed; right:18px; top:120px; width:420px; max-width:calc(100% - 40px); background:#111; color:#ddd; border:1px solid #333; border-radius:8px; padding:12px; box-shadow:0 6px 30px rgba(0,0,0,0.6); z-index:99999; font-size:13px; display:none; }
#${IDS.panel}.open { display:block; }
#${IDS.panel} input[type="text"], #${IDS.panel} textarea, #${IDS.panel} select { width:100%; box-sizing:border-box; background:#0f0f0f; color:#ddd; border:1px solid #333; padding:6px; border-radius:4px; }
#${IDS.panel} .mm-templates-list { max-height:160px; overflow:auto; border:1px solid #222; padding:6px; background:#0b0b0b; }
#${IDS.panel} button { background:#1a1a1a; color:#cfc; border:1px solid #2a2a2a; padding:6px 8px; border-radius:4px; cursor:pointer; }
#${IDS.quick} { position:fixed; top:110px; right:18px; z-index:99998; background:#0b0b0b; border:1px solid #222; padding:6px; border-radius:6px; display:flex; gap:6px; flex-direction:column; max-width:320px; font-size:13px; }
#${IDS.toast} { position:fixed; right:20px; bottom:20px; background:#0b0; color:#012; padding:8px 12px; border-radius:6px; display:none; z-index:999999; }
@keyframes mm-toast-hide { from { opacity: 1; } 85% { opacity: 1; } to { opacity: 0; } }
#mm-toast.mm-toast-hide { animation: mm-toast-hide 2.2s ease forwards; }
.mm-support-banner { display:flex; gap:10px; align-items:flex-start; justify-content:space-between; background:linear-gradient(180deg,#0f2b0f,#071207); border:1px solid rgba(0,120,0,0.18); color:#dfffe0; padding:8px 10px; border-radius:6px; margin-bottom:10px; font-size:13px; }
.mm-debug-actions { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
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
      const btn = document.createElement('button');
      btn.id = IDS.btn;
      btn.title = 'MessageManager (toggle)';
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'M/M';
      btn.type = 'button';
      btn.tabIndex = 0;
      // ensure visible and accessible
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.fontFamily = 'sans-serif';
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
  <button id="mm-save-template" type="button">Save Template</button>
  <button id="mm-delete-template" type="button">Delete Selected</button>
  <button id="mm-insert-template" type="button">Insert into Compose</button>
</div>
<div class="mm-row mm-debug-actions">
  <strong style="display:block;margin-bottom:6px;">Diagnostics</strong>
  <button id="mm-debug-view" type="button" title="Open MessageManager debugger">🪲 Debugger</button>
  <button id="mm-debug-copy" type="button" title="Copy debugger logs to clipboard">📋 Copy Logs to Clipboard</button>
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
      t.dataset.mmToastDuration = String(Math.max(800, Number(ms) || 2200));
      t.classList.remove('mm-toast-hide');
      void t.offsetWidth;
      t.classList.add('mm-toast-hide');
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
        MyDebug.error({ module: 'UI', operation: 'insertSupportBanner', error: err });
      }
    }

    function setPanelOpen(open) {
      const panel = document.getElementById(IDS.panel);
      if (!panel) return false;
      const isOpen = !!open;
      panel.classList.toggle('open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      return isOpen;
    }

    return { injectStyles, createButton, createPanel, createQuickPicker, showToast, insertSupportBanner, setPanelOpen };
  })();


  /* ===========================
     Module: Donation UI
     Source-aligned integration of Donation UI Module v1.4.
     Mounted inside MessageManager Settings rather than as a
     competing fixed overlay.
     =========================== */
  const DonationModule = (function () {
    const CONFIG = Object.freeze({
      bmcId: 'bittick1c',
      tornUserId: '2954173',
      containerId: 'mm-donation-support',
      styleId: 'mm-donation-support-style'
    });

    let instanceCount = 0;

    function injectStyles() {
      if (document.getElementById(CONFIG.styleId)) return;
      const css = `
#${CONFIG.containerId}{display:flex;flex-direction:column;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid #2a2a2a;font-family:Arial,sans-serif;box-sizing:border-box}
#${CONFIG.containerId} .tw-support-btn{box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:40px;padding:10px 15px;border-radius:8px;font-size:13px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none!important;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
#${CONFIG.containerId} .tw-support-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
#${CONFIG.containerId} .tw-bmc{position:relative;overflow:hidden;isolation:isolate;gap:6px;width:100%;min-width:170px;min-height:40px;padding:6px 12px;background:#FFDD00;color:#000!important;border:1px solid #FFDD00;border-radius:6px;font-size:11px;font-weight:600;box-sizing:border-box;transition:opacity .15s ease,transform .15s ease}
#${CONFIG.containerId} .tw-bmc>*{position:relative;z-index:1}
#${CONFIG.containerId} .tw-bmc:hover{opacity:.9}
#${CONFIG.containerId} .tw-bmc:active{transform:scale(.97)}
@keyframes tw-coffee-cup-hop{0%,100%{transform:translateY(0) scale(1,1)}18%{transform:translateY(.5px) scale(1.08,.9)}32%{transform:translateY(-2px) scale(.94,1.08)}50%{transform:translateY(-3px) scale(1,1)}68%{transform:translateY(0) scale(1.1,.88)}84%{transform:translateY(0) scale(.97,1.03)}}
#${CONFIG.containerId} .tw-coffee-cup{position:relative;display:inline-flex;flex-shrink:0;transform-origin:50% 100%;animation:tw-coffee-cup-hop 2.4s cubic-bezier(.4,0,.5,1) infinite}
#${CONFIG.containerId} .tw-coffee-cup>svg{position:relative;z-index:1;display:block}
#${CONFIG.containerId} .tw-coffee-cup:before,#${CONFIG.containerId} .tw-coffee-cup:after{content:"";position:absolute;bottom:74%;width:2px;height:4px;border-radius:999px;background:linear-gradient(to top,rgba(90,58,36,.5),rgba(90,58,36,0));opacity:0;pointer-events:none;will-change:transform,opacity}
#${CONFIG.containerId} .tw-coffee-cup:before{left:27%;animation:tw-coffee-steam 2.8s ease-out infinite}
#${CONFIG.containerId} .tw-coffee-cup:after{left:45%;animation:tw-coffee-steam 2.8s ease-out infinite;animation-delay:-1.4s}
@keyframes tw-coffee-steam{0%{opacity:0;transform:translateY(2px) scale(.6,.5) skewX(0)}30%{opacity:.7;transform:translateY(0) scale(1,.9) skewX(4deg)}65%{opacity:.4;transform:translateY(-3px) scale(.85,1.2) skewX(-5deg)}100%{opacity:0;transform:translateY(-5px) scale(.5,1.5) skewX(6deg)}}
#${CONFIG.containerId} .tw-coffee-fill{transform:scaleY(.15);transform-origin:50% 100%;animation:tw-coffee-refill 7s cubic-bezier(.45,0,.55,1) infinite}
@keyframes tw-coffee-refill{0%{transform:scaleY(.15)}30%{transform:scaleY(.95)}55%{transform:scaleY(.75)}80%{transform:scaleY(.3)}100%{transform:scaleY(.15)}}
#${CONFIG.containerId} .tw-bmc:hover .tw-coffee-fill{animation:tw-coffee-fill-to-full .45s cubic-bezier(.4,0,.2,1) forwards}
@keyframes tw-coffee-fill-to-full{to{transform:scaleY(1)}}
#${CONFIG.containerId} .tw-bmc:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;pointer-events:none;background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,.15) 35%,rgba(255,255,255,.75) 50%,rgba(255,255,255,.15) 65%,transparent 100%);transform:skewX(-18deg);will-change:transform;animation:tw-coffee-glare 5s cubic-bezier(.5,0,.5,1) infinite}
@keyframes tw-coffee-glare{0%{transform:translateX(0) skewX(-18deg)}22%,100%{transform:translateX(400%) skewX(-18deg)}}
#${CONFIG.containerId} .tw-coffee-label{display:grid;align-items:center;justify-items:center;min-width:0}
#${CONFIG.containerId} .tw-coffee-label>span{grid-area:1/1;white-space:nowrap;transform-origin:50% 50%;will-change:opacity,transform,filter;animation:tw-coffee-label-drip 7s cubic-bezier(.65,0,.35,1) infinite}
#${CONFIG.containerId} .tw-coffee-label>span:nth-child(2){animation-delay:-3.5s}
@keyframes tw-coffee-label-drip{0%,34%{opacity:1;transform:translateY(0) scale(1,1);filter:blur(0)}38%{opacity:.5;transform:translateY(2px) scale(.94,1.08);filter:blur(1.2px)}42%{opacity:0;transform:translateY(9px) scale(1.06,.5);filter:blur(4px)}42.01%,92%{opacity:0;transform:translateY(-9px) scale(1.06,.5);filter:blur(4px)}96%{opacity:1;transform:translateY(1px) scale(1.05,.9);filter:blur(0)}98%{opacity:1;transform:translateY(0) scale(.99,1.03);filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1,1);filter:blur(0)}}
#${CONFIG.containerId} .tw-torn-tip{background:#8ab63d;color:#fff!important;border:1px solid #6a8c2f;box-shadow:0 4px 6px rgba(0,0,0,.3);transition:transform .2s ease,background-color .2s ease}
#${CONFIG.containerId} .tw-torn-tip:active{transform:scale(.95)}
#${CONFIG.containerId} .tw-support-note{font-size:11px;color:#888;text-align:center;line-height:1.4}
@media(prefers-reduced-motion:reduce){#${CONFIG.containerId} .tw-coffee-cup{animation:none}#${CONFIG.containerId} .tw-coffee-cup:before,#${CONFIG.containerId} .tw-coffee-cup:after{animation:none;opacity:0}#${CONFIG.containerId} .tw-coffee-fill{animation:none;transform:scaleY(.8)}#${CONFIG.containerId} .tw-coffee-label>span{animation:none;opacity:0;filter:none;transform:none}#${CONFIG.containerId} .tw-coffee-label>span:nth-child(2){opacity:1}#${CONFIG.containerId} .tw-bmc:after{animation:none;opacity:0}}
@media(max-width:480px){#${CONFIG.containerId} .tw-bmc{min-width:0}}
`;
      const style = document.createElement('style');
      style.id = CONFIG.styleId;
      style.textContent = css;
      (document.head || document.body)?.appendChild(style);
    }

    function buildCoffeeButton() {
      instanceCount += 1;
      const clipId = `mm-coffee-clip-${instanceCount}`;
      const link = document.createElement('a');
      link.className = 'tw-support-btn tw-bmc';
      link.href = `https://www.buymeacoffee.com/${encodeURIComponent(CONFIG.bmcId)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'Support ThaWookie';
      link.setAttribute('aria-label', 'Buy me a coffee — support ThaWookie');

      const cup = document.createElement('span');
      cup.className = 'tw-coffee-cup';
      cup.setAttribute('aria-hidden', 'true');

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      [['width','16'],['height','16'],['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','1.5']].forEach(([k,v])=>svg.setAttribute(k,v));

      const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      const clip = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
      clip.setAttribute('id', clipId);
      const shape = document.createElementNS('http://www.w3.org/2000/svg','path');
      shape.setAttribute('d','M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z');
      clip.appendChild(shape); defs.appendChild(clip); svg.appendChild(defs);

      const fill = document.createElementNS('http://www.w3.org/2000/svg','rect');
      [['class','tw-coffee-fill'],['x','5'],['y','8'],['width','11'],['height','9'],['fill','#6f4e37'],['clip-path',`url(#${clipId})`]].forEach(([k,v])=>fill.setAttribute(k,v));
      svg.appendChild(fill);

      const body = document.createElementNS('http://www.w3.org/2000/svg','path');
      [['stroke-linecap','round'],['stroke-linejoin','round'],['d','M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z']].forEach(([k,v])=>body.setAttribute(k,v));
      svg.appendChild(body);

      const handle = document.createElementNS('http://www.w3.org/2000/svg','path');
      [['stroke-linecap','round'],['stroke-linejoin','round'],['d','M16 9h2.5a2.5 2.5 0 0 1 0 5H16']].forEach(([k,v])=>handle.setAttribute(k,v));
      svg.appendChild(handle);
      cup.appendChild(svg); link.appendChild(cup);

      const label = document.createElement('span');
      label.className = 'tw-coffee-label';
      label.setAttribute('aria-hidden','true');
      const a = document.createElement('span'); a.textContent='Support the project?';
      const b = document.createElement('span'); b.textContent='Buy me a coffee';
      label.append(a,b); link.appendChild(label);
      return link;
    }

    function mount(panel) {
      if (!panel) return;
      injectStyles();
      let box = panel.querySelector(`#${CONFIG.containerId}`);
      if (box) return box;

      box = document.createElement('div');
      box.id = CONFIG.containerId;
      box.setAttribute('role','group');
      box.setAttribute('aria-label','Support ThaWookie');

      const heading = document.createElement('div');
      heading.style.cssText='font-weight:700;color:#cfc;font-size:12px;margin-bottom:2px';
      heading.textContent='Support the project';
      box.appendChild(heading);

      box.appendChild(buildCoffeeButton());

      const tip = document.createElement('a');
      tip.className='tw-support-btn tw-torn-tip';
      tip.href='https://www.torn.com/item.php';
      tip.target='_blank';
      tip.rel='noopener noreferrer';
      tip.title=`Opens Items — search "Xanax", tap Send, enter ThaWookie [${CONFIG.tornUserId}]`;
      tip.setAttribute('aria-label',`Send a Xanax tip to ThaWookie [${CONFIG.tornUserId}]`);
      tip.textContent='💊 Send a Xanax Tip';
      box.appendChild(tip);

      const note = document.createElement('div');
      note.className='tw-support-note';
      note.textContent='Support is optional and helps keep the project maintained.';
      box.appendChild(note);

      panel.appendChild(box);
      return box;
    }

    return Object.freeze({ mount });
  })();

  /* ===========================
     Module: FloatingButton
     =========================== */
  const FloatingButton = (function (UI, Storage, Utils) {
    let btnEl = null;
    let currentFloatingState = { locked: false, x: null, y: null };
    let eventsAttachedTo = null;

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
      // ensure visible text/icon fallback
      if (!btnEl.textContent || btnEl.textContent.trim() === '') btnEl.textContent = 'M/M';
      btnEl.style.display = 'inline-flex';
      attachEvents();
      // cache floating state
      currentFloatingState = { ...floatingState };
    }

    function attachEvents() {
      if (!btnEl || eventsAttachedTo === btnEl) return;
      eventsAttachedTo = btnEl;
      btnEl.addEventListener('click', async (e) => {
        if (btnEl._mm_suppressClick) {
          btnEl._mm_suppressClick = false;
          return;
        }
        if (btnEl._mm_isDragging) return;
        const s = await Storage.load();
        s.enabled = !s.enabled;
        await Storage.save(s);
        btnEl.classList.toggle('mm-disabled', !s.enabled);
        btnEl.setAttribute('aria-pressed', String(s.enabled));
        UI.showToast('MessageManager ' + (s.enabled ? 'enabled' : 'disabled'));
      });

      btnEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const panel = document.getElementById('mm-settings-panel');
        UI.setPanelOpen(true);
      });

      btnEl.addEventListener('keydown', async (ev) => {
        try {
          const f = (await Storage.loadFloating()) || { locked: false };
          if (f.locked) return;
          const step = ev.shiftKey ? 10 : 2;
          const rect = btnEl.getBoundingClientRect();
          let newLeft = rect.left;
          let newTop = rect.top;
          const maxLeft = Math.max(6, window.innerWidth - btnEl.offsetWidth - 6);
          const maxTop = Math.max(6, window.innerHeight - btnEl.offsetHeight - 6);
          if (ev.key === 'ArrowLeft') newLeft = Math.max(6, rect.left - step);
          if (ev.key === 'ArrowRight') newLeft = Math.min(maxLeft, rect.left + step);
          if (ev.key === 'ArrowUp') newTop = Math.max(6, rect.top - step);
          if (ev.key === 'ArrowDown') newTop = Math.min(maxTop, rect.top + step);
          if (newLeft !== rect.left || newTop !== rect.top) {
            btnEl.style.left = newLeft + 'px';
            btnEl.style.top = newTop + 'px';
            btnEl.style.right = 'auto';
            await Storage.saveFloating({ ...f, x: Math.round(newLeft), y: Math.round(newTop) });
            currentFloatingState = { ...f, x: Math.round(newLeft), y: Math.round(newTop) };
            UI.showToast('Button position saved');
            ev.preventDefault();
          }
        } catch (err) {
          MyDebug.error({ module: 'FloatingButton', operation: 'keyboard', error: err });
        }
      });

      let isDragging = false;
      let draggingStarted = false;
      let startX = 0;
      let startY = 0;
      let origLeft = 0;
      let origTop = 0;
      const DRAG_THRESHOLD = 6;

      async function onPointerDown(e) {
        try {
          if (e.button !== undefined && e.button !== 0) return;
          const f = currentFloatingState || { locked: false };
          if (f.locked) return;
          isDragging = true;
          draggingStarted = false;
          startX = e.clientX;
          startY = e.clientY;
          const rect = btnEl.getBoundingClientRect();
          origLeft = rect.left;
          origTop = rect.top;
          btnEl._mm_isDragging = false;
          btnEl._mm_suppressClick = false;
          try { (e.target || e.srcElement).setPointerCapture && (e.target || e.srcElement).setPointerCapture(e.pointerId); } catch (err) {}
          btnEl.style.transition = 'none';
          e.preventDefault();
        } catch (err) {
          MyDebug.error({ module: 'FloatingButton', operation: 'pointerdown', error: err });
        }
      }

      function onPointerMove(e) {
        try {
          if (!isDragging) return;
          const f = currentFloatingState || { locked: false };
          if (f.locked) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (!draggingStarted && dist < DRAG_THRESHOLD) return;
          draggingStarted = true;
          btnEl._mm_isDragging = true;
          btnEl._mm_suppressClick = true;
          const maxLeft = Math.max(6, window.innerWidth - btnEl.offsetWidth - 6);
          const maxTop = Math.max(6, window.innerHeight - btnEl.offsetHeight - 6);
          const newLeft = Math.min(maxLeft, Math.max(6, origLeft + dx));
          const newTop = Math.min(maxTop, Math.max(6, origTop + dy));
          btnEl.style.left = newLeft + 'px';
          btnEl.style.top = newTop + 'px';
          btnEl.style.right = 'auto';
        } catch (err) {
          MyDebug.error({ module: 'FloatingButton', operation: 'pointermove', error: err });
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
          currentFloatingState = { ...f };
        } catch (err) {
          MyDebug.error({ module: 'FloatingButton', operation: 'savePosition', error: err });
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
          btnEl._mm_isDragging = false;
          UI.showToast('Button position saved');
        } catch (err) {
          MyDebug.error({ module: 'FloatingButton', operation: 'pointerup', error: err });
        }
      }

      btnEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    // expose lock API so other modules can toggle lock reliably
    async function setLocked(value) {
      try {
        const f = (await Storage.loadFloating()) || { locked: false, x: null, y: null };
        f.locked = !!value;
        await Storage.saveFloating(f);
        currentFloatingState = { ...f };
        if (btnEl) btnEl.classList.toggle('mm-locked', f.locked);
      } catch (err) {
        MyDebug.error({ module: 'FloatingButton', operation: 'setLocked', error: err });
      }
    }

    async function toggleLocked() {
      try {
        const f = (await Storage.loadFloating()) || { locked: false, x: null, y: null };
        await setLocked(!f.locked);
        return currentFloatingState;
      } catch (err) {
        MyDebug.error({ module: 'FloatingButton', operation: 'toggleLocked', error: err });
      }
    }


    return { init, setLocked, toggleLocked };
  })(UI, Storage, Utils);

  /* ===========================
     Module: TemplatesManager
     =========================== */
  const TemplatesManager = (function (Storage, Utils, UI, FloatingButton) {
    async function init() {
      await refreshUI();
      const panel = document.getElementById('mm-settings-panel');
      if (!panel || panel.dataset.mmEventsBound === '1') return;
      panel.dataset.mmEventsBound = '1';
      panel.querySelector('#mm-save-template').addEventListener('click', saveTemplate);
      panel.querySelector('#mm-delete-template').addEventListener('click', deleteTemplate);
      panel.querySelector('#mm-insert-template').addEventListener('click', insertSelectedIntoCompose);
      panel.querySelector('#mm-close-btn').addEventListener('click', () => UI.setPanelOpen(false));
      panel.querySelector('#mm-lock-btn').addEventListener('click', async () => {
        try {
          const newState = await FloatingButton.toggleLocked();
          UI.showToast(newState?.locked ? 'Button locked' : 'Button unlocked');
        } catch (err) {
          MyDebug.error({ module: 'TemplatesManager', operation: 'lock', error: err });
        }
      });
      panel.querySelector('#mm-enabled-checkbox').addEventListener('change', async (e) => {
        const s = await Storage.load();
        s.enabled = e.target.checked;
        await Storage.save(s);
        const button = document.getElementById('mm-sidebar-btn');
        button?.classList.toggle('mm-disabled', !s.enabled);
        button?.setAttribute('aria-pressed', String(s.enabled));
      });
      panel.querySelector('#mm-autoapply-checkbox').addEventListener('change', async (e) => {
        const s = await Storage.load();
        s.autoApplyOnOpen = e.target.checked;
        await Storage.save(s);
      });
      panel.querySelector('#mm-debug-view')?.addEventListener('click', () => {
        MyDebug.toggleView();
      });
      panel.querySelector('#mm-debug-copy')?.addEventListener('click', function () {
        void MyDebug.copy(this);
      });

      DonationModule.mount(panel);
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

          const nameEl = document.createElement('div');
          nameEl.style.cssText = 'font-weight:700;color:#cfc';
          nameEl.textContent = tpl.name;

          const subjectEl = document.createElement('div');
          subjectEl.style.cssText = 'font-size:12px;color:#999';
          subjectEl.textContent = tpl.subject || '(no subject)';

          left.append(nameEl, subjectEl);

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
              MyDebug.error({ module: 'TemplatesManager', operation: 'deleteTemplate', error: err });
              UI.showToast('Failed to delete template');
            }
          });

          left.addEventListener('click', () => selectBtn.click());

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
        MyDebug.error({ module: 'TemplatesManager', operation: 'refreshUI', error: err });
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
  })(Storage, Utils, UI, FloatingButton);

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

    function isComposePage() {
      return location.pathname.includes('/messages.php') &&
        /(?:^|[\\/&])p=compose(?:&|$)/.test(location.hash.replace(/^#/, ''));
    }

    function onComposePage(callback) {
      let lastComposeKey = '';
      let observer = null;

      const check = () => {
        if (!isComposePage()) {
          lastComposeKey = '';
          return;
        }

        const subject = findFirst(SELECTORS.subjectInput);
        const body = findFirst(SELECTORS.bodyTextarea) || findFirst(SELECTORS.bodyContentEditable);

        if (!subject && !body) return;

        const key = [
          subject ? subject : 'no-subject',
          body ? body : 'no-body'
        ].map(el => el === 'no-subject' || el === 'no-body' ? el : (el.dataset.mmComposeInstance || (el.dataset.mmComposeInstance = Utils.uuidv4()))).join('|');

        if (key === lastComposeKey) return;
        lastComposeKey = key;
        void callback({ subject, body, key });
      };

      const root = document.documentElement || document.body;
      if (root && typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(() => check());
        observer.observe(root, { childList: true, subtree: true });
      }

      window.addEventListener('hashchange', check);
      window.addEventListener('popstate', check);
      document.addEventListener('visibilitychange', check);

      check();

      return () => {
        observer?.disconnect();
        window.removeEventListener('hashchange', check);
        window.removeEventListener('popstate', check);
        document.removeEventListener('visibilitychange', check);
      };
    }

    function setInputValue(element, value) {
      const nextValue = String(value ?? '');
      const proto = element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

      if (descriptor?.set) {
        descriptor.set.call(element, nextValue);
      } else {
        element.value = nextValue;
      }

      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function applyTemplate(template) {
      if (!template) return;
      try {
        let subject = findFirst(SELECTORS.subjectInput);
        let body = findFirst(SELECTORS.bodyTextarea) || findFirst(SELECTORS.bodyContentEditable);

        if (!subject && !body) {
          MyDebug.warn('ComposeIntegration: no compose fields found');
          UI.showToast('Compose fields not found. Open compose or update selectors.');
          return;
        }

        if (subject) {
          try {
            subject.focus();
            setInputValue(subject, template.subject || '');
          } catch (err) {
            MyDebug.warn({ module: 'ComposeIntegration', operation: 'setSubject', error: err });
          }
        }

        if (body && body.tagName && body.tagName.toLowerCase() === 'textarea') {
          try {
            body.focus();
            setInputValue(body, template.body || '');
          } catch (err) {
            MyDebug.warn({ module: 'ComposeIntegration', operation: 'setTextarea', error: err });
          }
        } else if (body && body.getAttribute && body.getAttribute('contenteditable') === 'true') {
          try {
            body.focus();
            body.replaceChildren();
            const lines = String(template.body || '').split('\n');
            lines.forEach((line, index) => {
              body.appendChild(document.createTextNode(line));
              if (index < lines.length - 1) body.appendChild(document.createElement('br'));
            });
            body.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: null }));
          } catch (err) {
            MyDebug.warn({ module: 'ComposeIntegration', operation: 'setContentEditable', error: err });
          }
        } else {
          const fallback = document.querySelector('textarea');
          if (fallback) {
            setInputValue(fallback, template.body || '');
          } else {
            MyDebug.warn('ComposeIntegration: fallback textarea not found');
          }
        }
      } catch (err) {
        MyDebug.error({ module: 'ComposeIntegration', operation: 'applyTemplate', error: err });
      }
    }

    async function pasteFormatted(template) {
      const formatted = `**${template.subject || ''}**\n\n${template.body || ''}`;
      try {
        const bodyTA = findFirst(SELECTORS.bodyTextarea);
        const bodyCE = findFirst(SELECTORS.bodyContentEditable);
        if (bodyTA) {
          bodyTA.focus();
          setInputValue(bodyTA, formatted);
          return;
        } else if (bodyCE) {
          bodyCE.focus();
          bodyCE.replaceChildren();
          const lines = formatted.split('\n');
          lines.forEach((line, index) => {
            bodyCE.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) bodyCE.appendChild(document.createElement('br'));
          });
          bodyCE.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: null }));
          return;
        } else {
          const fallback = document.querySelector('textarea');
          if (fallback) {
            fallback.value = formatted;
            fallback.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            MyDebug.warn('ComposeIntegration: no body field for page source paste');
          }
        }
      } catch (err) {
        MyDebug.error({ module: 'ComposeIntegration', operation: 'pasteFormatted', error: err });
      }
    }

    async function init() {
      onComposePage(async ({ subject, body, key }) => {
        const state = await Storage.load();
        if (!isComposePage()) return;

        UI.createPanel();
        UI.createQuickPicker();
        await TemplatesManager.refreshUI();

        if (state.enabled && state.autoApplyOnOpen && state.selectedTemplateId) {
          const tpl = state.templates.find(t => t.id === state.selectedTemplateId);
          if (tpl && subject && body) {
            await applyTemplate(tpl);
            MyDebug.info({
              module: 'ComposeIntegration',
              operation: 'autoApply',
              templateId: tpl.id,
              composeKey: key
            });
          }
        }

        bindQuickPicker();
      });
    }

    function bindQuickPicker() {
      const quick = document.getElementById('mm-quick-picker');
      if (!quick || quick.dataset.mmEventsBound === '1') return;

      quick.dataset.mmEventsBound = '1';

      quick.querySelector('#mm-quick-apply')?.addEventListener('click', async () => {
        const id = quick.querySelector('#mm-quick-select')?.value;
        const state = await Storage.load();
        const tpl = state.templates.find(t => t.id === id);
        if (!tpl) return UI.showToast('No template selected');
        state.selectedTemplateId = tpl.id;
        await Storage.save(state);
        await applyTemplate(tpl);
        await TemplatesManager.refreshUI();
        UI.showToast('Template applied');
      });

      quick.querySelector('#mm-quick-page-source')?.addEventListener('click', async () => {
        const id = quick.querySelector('#mm-quick-select')?.value;
        const state = await Storage.load();
        const tpl = state.templates.find(t => t.id === id);
        if (!tpl) return UI.showToast('No template selected');
        state.selectedTemplateId = tpl.id;
        await Storage.save(state);
        await pasteFormatted(tpl);
        await TemplatesManager.refreshUI();
        UI.showToast('Page source inserted');
      });

      quick.querySelector('#mm-quick-settings')?.addEventListener('click', () => {
        UI.setPanelOpen(true);
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
      MyDebug.info({ module: 'Diagnostics', state: s, floating: f });
      return { state: s, floating: f };
    }
    return { dumpState };
  })(Storage);

  /* ===========================
     Module: Core / Bootstrap
     =========================== */
  const Core = (function (UI, Storage, FloatingButton, TemplatesManager, ComposeIntegration) {
    let lifecycleObserver = null;
    let reconcileInFlight = false;
    let menuRegistered = false;

    async function reconcile(reason = 'mutation') {
      if (reconcileInFlight) return;
      reconcileInFlight = true;

      try {
        UI.injectStyles();

        const state = await Storage.load();

        const panel = UI.createPanel();
        UI.createQuickPicker();

        const button = document.getElementById('mm-sidebar-btn');
        if (!button) {
          await FloatingButton.init(state);
        } else {
          button.classList.toggle('mm-disabled', !state.enabled);
          button.setAttribute('aria-pressed', String(state.enabled));
        }

        await TemplatesManager.init();
        DonationModule.mount(panel);

        MyDebug.info({
          module: 'Core',
          operation: 'reconcile',
          reason
        });
      } catch (err) {
        MyDebug.error({
          module: 'Core',
          operation: 'reconcile',
          reason,
          error: err
        });
      } finally {
        reconcileInFlight = false;
      }
    }

    function attachLifecycleObserver() {
      if (lifecycleObserver || typeof MutationObserver === 'undefined') return;

      const root = document.documentElement || document.body;
      if (!root) return;

      lifecycleObserver = new MutationObserver((mutations) => {
        const removedNodes = mutations.some(mutation =>
          mutation.type === 'childList' && mutation.removedNodes.length > 0
        );

        if (!removedNodes) return;

        const requiredIds = [
          'mm-sidebar-btn',
          'mm-settings-panel',
          'mm-quick-picker'
        ];

        const missing = requiredIds.some(id => !document.getElementById(id));
        const donationMissing = document.getElementById('mm-settings-panel') &&
          !document.getElementById('mm-donation-support');

        if (missing || donationMissing) {
          void reconcile('Torn DOM replacement');
        }
      });

      lifecycleObserver.observe(root, { childList: true, subtree: true });
    }

    async function init() {
      try {
        await reconcile('initialization');
        attachLifecycleObserver();
        await ComposeIntegration.init();

        if (!menuRegistered && typeof GM_registerMenuCommand === 'function') {
          GM_registerMenuCommand('Open MessageManager Settings', () => {
            UI.setPanelOpen(true);
          });
          menuRegistered = true;
        }

        MyDebug.info('MessageManager modular init complete (v1.3.14)');
      } catch (err) {
        MyDebug.error({ module: 'Core', operation: 'init', error: err });
      }
    }

    return { init, reconcile };
  })(UI, Storage, FloatingButton, TemplatesManager, ComposeIntegration);


  /* ============================================================
   * Embedded Module: Advanced Modular Userscript Debugger
   * Source: userscript-debugger-module.js v1.0.2
   * Integrated locally so MessageManager is self-contained.
   * ============================================================ */
  function initializeModularDebugger(scriptNamespace = "App") {

    const suffix = (() => {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          return crypto.randomUUID().replace(/-/g, "");
        }
      } catch (_) {}
      return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    })();

    const prefix = `us-debug-${suffix}`;
    const CONTAINER_ID = `${prefix}-box`;
    const LOG_AREA_ID = `${prefix}-logs`;
    const STYLE_ID = `${prefix}-style`;
    const MAX_CHARS = 10 * 1024 * 1024 - 900 * 1024;

    const state = {
      logs: [],
      length: 0,
      container: null,
      logArea: null,
      observer: null,
      observerAttached: false,
      destroyed: false
    };

    function body() {
      return document?.body || null;
    }

    function serialize(value) {
      if (typeof value === "string") return value;
      if (value === undefined) return "undefined";
      if (value === null || ["number", "boolean", "bigint"].includes(typeof value)) {
        try { return String(value); } catch (_) { return "[Unserializable Primitive]"; }
      }
      if (typeof value === "symbol") {
        try { return value.toString(); } catch (_) { return "[Symbol]"; }
      }
      if (typeof value === "function") {
        try { return `[Function: ${value.name || "anonymous"}]`; } catch (_) { return "[Function]"; }
      }
      if (value instanceof Error) {
        try {
          return JSON.stringify({ name: value.name, message: value.message, stack: value.stack });
        } catch (_) {
          return `${value.name || "Error"}: ${value.message || ""}`;
        }
      }
      try {
        const seen = new WeakSet();
        return JSON.stringify(value, (key, nested) => {
          if (typeof nested === "bigint") return `${nested}n`;
          if (typeof nested === "undefined") return "[undefined]";
          if (nested && typeof nested === "object") {
            if (seen.has(nested)) return "[Circular]";
            seen.add(nested);
          }
          return nested;
        });
      } catch (_) {
        try { return String(value); } catch (_) { return "[Serialization Error]"; }
      }
    }

    function render() {
      if (!state.logArea?.isConnected) return;
      state.logArea.textContent = state.logs.join("\n");
      if (state.container?.isConnected) {
        state.container.scrollTop = state.container.scrollHeight;
      }
    }

    function log(message, level = "INFO") {
      let entry = `[${new Date().toLocaleTimeString()}] [${String(level).toUpperCase()}] ${serialize(message)}`;
      if (entry.length > MAX_CHARS) {
        entry = `${entry.slice(0, MAX_CHARS - 40)}\n...[LOG ENTRY TRUNCATED]...`;
      }
      if (entry.length > MAX_CHARS) return;

      while (state.logs.length && state.length + entry.length + 1 > MAX_CHARS) {
        const removed = state.logs.shift();
        state.length -= removed.length + 1;
      }

      state.logs.push(entry);
      state.length += entry.length + 1;
      render();
    }

    const info = message => log(message, "INFO");
    const warn = message => log(message, "WARN");
    const error = message => log(message, "ERROR");

    function clear() {
      state.logs.length = 0;
      state.length = 0;
      render();
    }

    function injectStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        @keyframes us-debug-status-reset{from{opacity:.75}to{opacity:1}}
        #${CONTAINER_ID} .us-debug-status-reset{animation:us-debug-status-reset 1.5s ease-in-out 1}
      `;
      (document.head || body())?.appendChild(style);
    }

    function status(button, text) {
      if (!button) return;
      button.textContent = text;
      button.dataset.debugStatus = "1";
      button.classList.remove("us-debug-status-reset");
      void button.offsetWidth;
      button.classList.add("us-debug-status-reset");
    }

    async function copy(button = null) {
      const payload = state.logs.join("\n");
      if (!payload) {
        status(button, "Empty!");
        return false;
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(payload);
          status(button, "Copied!");
          return true;
        }
      } catch (_) {}

      try {
        const target = body();
        if (!target) throw new Error("Document body unavailable.");
        const textarea = document.createElement("textarea");
        textarea.value = payload;
        textarea.readOnly = true;
        textarea.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
        target.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try { textarea.setSelectionRange(0, textarea.value.length); } catch (_) {}
        const success = document.execCommand("copy");
        textarea.remove();
        status(button, success ? "Copied!" : "Failed!");
        return Boolean(success);
      } catch (err) {
        error({ operation: "clipboard-fallback", error: err });
        status(button, "Failed!");
        return false;
      }
    }

    function create() {
      const target = body();
      if (!target) return null;

      const existing = document.getElementById(CONTAINER_ID);
      if (existing) {
        state.container = existing;
        state.logArea = document.getElementById(LOG_AREA_ID);
        render();
        return existing;
      }

      injectStyles();

      const container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.style.cssText = [
        "position:fixed","bottom:12px","right:12px","width:calc(100% - 24px)",
        "max-width:420px","height:280px","background:#181818","color:#00ff66",
        "font-family:monospace","font-size:11px","padding:12px","z-index:2147483647",
        "border:1px solid #00ff66","overflow-y:auto","overflow-x:hidden",
        "box-shadow:0 4px 20px rgba(0,0,0,.7)","border-radius:4px","box-sizing:border-box",
        "touch-action:pan-y"
      ].join(";");

      const header = document.createElement("div");
      header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid #333;padding-bottom:5px;user-select:none";

      const title = document.createElement("span");
      title.textContent = `DEBUG LOG [${String(scriptNamespace)}]`;
      title.style.cssText = "font-weight:bold;letter-spacing:.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";

      const group = document.createElement("div");
      group.style.cssText = "display:flex;gap:6px;flex-shrink:0";

      const makeButton = (label, handler) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.style.cssText = "background:#2a2a2a;color:#fff;border:1px solid #444;cursor:pointer;padding:5px 8px;font-size:10px;border-radius:3px;touch-action:manipulation";
        button.addEventListener("click", handler);
        return button;
      };

      const copyButton = makeButton("Copy", () => void copy(copyButton));
      const clearButton = makeButton("Clear", clear);
      const hideButton = makeButton("Hide", () => { container.style.display = "none"; });
      hideButton.style.background = "#a82020";

      group.append(copyButton, clearButton, hideButton);
      header.append(title, group);

      const logArea = document.createElement("div");
      logArea.id = LOG_AREA_ID;
      logArea.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-family:monospace;line-height:1.4;user-select:text";

      container.append(header, logArea);
      target.appendChild(container);

      state.container = container;
      state.logArea = logArea;
      render();
      return container;
    }

    function ensureObserver() {
      if (state.observerAttached || typeof MutationObserver === "undefined") return;
      const target = body();
      if (!target) return;

      state.observer = new MutationObserver(() => {
        if (state.container && !state.container.isConnected) {
          state.container = null;
          state.logArea = null;
        }
      });

      state.observer.observe(target, { childList: true, subtree: true });
      state.observerAttached = true;
    }

    function toggleView() {
      const existing = document.getElementById(CONTAINER_ID);
      if (existing) {
        state.container = existing;
        state.logArea = document.getElementById(LOG_AREA_ID);
        existing.style.display = existing.style.display === "none" ? "block" : "none";
        if (existing.style.display !== "none") render();
      } else {
        const created = create();
        if (created) created.style.display = "block";
      }
      ensureObserver();
    }

    function initialize() {
      if (state.destroyed) return;
      ensureObserver();
    }

    initialize();

    return Object.freeze({ log, info, warn, error, copy, toggleView, clear });
  }

  // Start
  Core.init();

})();

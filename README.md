# MessageManager — ViolentMonkey / Tampermonkey userscript

**A lightweight, local-first userscript that speeds up composing messages on Torn.com.**  
Injects a floating **M/M** control, manages reusable message templates, and quickly inserts or formats them into the compose form — while keeping full manual control (no auto-send).

---

## Why this exists
Composing the same recruitment or outreach messages repeatedly is tedious. **MessageManager** saves templates (subject + body), lets you pick and paste them into Torn’s compose UI instantly, and keeps a handy floating button that you can lock in place.

---

## Key features
- **Floating M/M button** — click to toggle the script on/off.  
- **Draggable & lockable** — reposition the button; lock it to keep it fixed. Position and lock state persist.  
- **Settings panel** — manage templates (create, select, delete). Collapsed by default.  
- **Template CRUD** — save multiple templates with subject + body; stored locally.  
- **Quick picker on compose** — choose a template and apply it to subject/body instantly.  
- **Page source paste** — insert a markdown-style formatted version of the template into the message body.  
- **Safe by design** — the script **only fills fields**; it does **not** click send or perform network actions.  
- **Local storage** — uses GM storage when available, falls back to `localStorage`.

---

## Install
1. Install **Violentmonkey or Tampermonkey** (or other compatible userscript manager).  
2. Create a new userscript and paste the MessageManager script.  (or import via Greasyfork)
3. Save and enable the script.  
4. Open Torn’s compose page:  
   `https://www.torn.com/messages.php#/p=compose`

---

## Quick usage
- **Open settings**: right-click the M/M button or use the quick picker’s *Settings* button.  
- **Save a template**: settings → name, subject, body → **Save Template**.  
- **Apply a template**: open compose → quick picker → select template → **Apply**.  
- **Page source**: click **Page source** in the quick picker to paste a markdown-formatted version.  
- **Lock button**: settings → **Lock** to pin the floating button; unlock to move it again.  
- **Dismiss support banner**: the small support banner at the top of settings can be dismissed and the choice is remembered.

---

## Permissions & privacy
- **Uses**: `GM_getValue`, `GM_setValue`, `GM_addStyle`, `GM_registerMenuCommand` (if available).  
- **Privacy**: All data (templates, button position, lock state, banner dismissal) is stored locally in your browser. The script does **not** send data to external servers.

---

## Safety notes
- The script **does not** automate sending messages to avoid accidental mass messaging or account flags.  
- When inserting into rich editors, the script escapes HTML to reduce XSS risk. If Torn changes its editor, selectors may need updating.

---

## Support
If you find this useful and want to show appreciation, you can send a Xanax to **ThaWookie [2954173]** on Torn:  
`https://www.torn.com/profiles.php?XID=2954173`

---

## License
**MIT** — feel free to fork, improve, and share.

---

## Changelog (short)
- **v1.1.0** — Floating draggable settings button with persistent lock and position; support banner.

import fs from 'node:fs';

// 1. Update preview/app.js
const appJs = fs.readFileSync('preview/app.js', 'utf8');

const customSelectEngine = `
/* ==========================================================================
   CUSTOM SYSTEM DROPDOWNS ENGINE (MORTUSOFT COASTAL OCEANIC PALETTE)
   Transforms all native selects into bespoke, elegant floating dropdowns.
   ========================================================================== */
(function initCustomSelects() {
  function enhanceSelect(select) {
    if (!select || select.dataset.msEnhanced === "true") return;
    select.dataset.msEnhanced = "true";

    // Container
    const container = document.createElement("div");
    container.className = "ms-select-container";
    if (select.id) container.dataset.targetId = select.id;
    if (select.disabled) container.classList.add("is-disabled");

    // Keep native select in the DOM for FormData, validation, and programmatic access
    select.style.setProperty("position", "absolute", "important");
    select.style.setProperty("opacity", "0", "important");
    select.style.setProperty("pointer-events", "none", "important");
    select.style.setProperty("width", "0", "important");
    select.style.setProperty("height", "0", "important");
    select.style.setProperty("margin", "0", "important");
    select.style.setProperty("padding", "0", "important");
    select.style.setProperty("border", "0", "important");
    select.tabIndex = -1;

    // Trigger button
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ms-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    if (select.disabled) trigger.disabled = true;

    const labelSpan = document.createElement("span");
    labelSpan.className = "ms-select-label";

    const chevronSpan = document.createElement("span");
    chevronSpan.className = "ms-select-chevron";
    chevronSpan.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    trigger.appendChild(labelSpan);
    trigger.appendChild(chevronSpan);

    // Floating menu
    const menu = document.createElement("div");
    menu.className = "ms-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    function syncOptions() {
      menu.replaceChildren();
      const currentVal = select.value;
      const opts = Array.from(select.options);
      const selectedOpt = select.selectedOptions[0] || opts.find(o => o.value === currentVal) || opts[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.textContent : (select.getAttribute("placeholder") || "Select an option");

      opts.forEach(opt => {
        const item = document.createElement("div");
        const isSelected = opt.value === select.value || (selectedOpt && opt.value === selectedOpt.value);
        item.className = "ms-select-option" + (isSelected ? " is-selected" : "");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", isSelected ? "true" : "false");
        item.dataset.value = opt.value;

        const text = document.createElement("span");
        text.className = "ms-option-text";
        text.textContent = opt.textContent;
        item.appendChild(text);

        if (isSelected) {
          const check = document.createElement("span");
          check.className = "ms-option-check";
          check.textContent = "✓";
          item.appendChild(check);
        }

        item.addEventListener("click", e => {
          e.stopPropagation();
          select.value = opt.value;
          syncOptions();
          closeAllCustomSelects();
          select.dispatchEvent(new Event("change", { bubbles: true }));
          select.dispatchEvent(new Event("input", { bubbles: true }));
        });

        menu.appendChild(item);
      });

      if (select.disabled) {
        trigger.disabled = true;
        container.classList.add("is-disabled");
      } else {
        trigger.disabled = false;
        container.classList.remove("is-disabled");
      }
    }

    syncOptions();

    trigger.addEventListener("click", e => {
      e.stopPropagation();
      if (select.disabled) return;
      const isCurrentlyOpen = !menu.hidden;
      closeAllCustomSelects();
      if (!isCurrentlyOpen) {
        syncOptions();
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        container.classList.add("is-open");

        requestAnimationFrame(() => {
          const rect = menu.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 16) {
            container.classList.add("open-upward");
          } else {
            container.classList.remove("open-upward");
          }
        });
      }
    });

    select.addEventListener("change", syncOptions);

    const observer = new MutationObserver(() => syncOptions());
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

    select.parentNode.insertBefore(container, select);
    container.appendChild(trigger);
    container.appendChild(menu);
    container.appendChild(select);
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".ms-select-container.is-open").forEach(c => {
      c.classList.remove("is-open");
      c.classList.remove("open-upward");
      const trig = c.querySelector(".ms-select-trigger");
      if (trig) trig.setAttribute("aria-expanded", "false");
      const m = c.querySelector(".ms-select-menu");
      if (m) m.hidden = true;
    });
  }

  window.closeAllCustomSelects = closeAllCustomSelects;
  window.enhanceSelect = enhanceSelect;
  window.refreshAllSelects = function() {
    document.querySelectorAll("select:not([data-ms-enhanced])").forEach(enhanceSelect);
  };

  document.addEventListener("click", closeAllCustomSelects);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllCustomSelects();
  });

  const pageObserver = new MutationObserver(() => {
    document.querySelectorAll("select:not([data-ms-enhanced])").forEach(enhanceSelect);
  });
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("select").forEach(enhanceSelect);
    });
  } else {
    document.querySelectorAll("select").forEach(enhanceSelect);
  }
})();
`;

if (!appJs.includes("initCustomSelects")) {
  fs.writeFileSync('preview/app.js', appJs + '\n' + customSelectEngine, 'utf8');
  console.log('Added custom dropdown engine to preview/app.js');
} else {
  console.log('Custom dropdown engine already in preview/app.js');
}

// 2. CSS Styles for preview/preview.css and src/app/phase2.css
const cssStyles = `
/* ==========================================================================
   CUSTOM SYSTEM DROPDOWNS & COMPONENT POLISH (COASTAL OCEANIC PALETTE)
   Eliminates stark white rectangles; applies cohesive sand & ocean depth.
   ========================================================================== */

.ms-select-container {
  position: relative;
  display: block;
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.case-toolbar .ms-select-container {
  width: 190px;
  flex: 0 0 190px;
}

.member-row .ms-select-container {
  width: 100%;
  max-width: 280px;
}

.release-check-row .ms-select-container {
  width: 160px;
  flex: 0 0 160px;
}

.ms-select-trigger {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  background: #FAF8F5; /* Warm card surface */
  border: 1.5px solid #DDD5CB;
  border-radius: 10px;
  font: 600 13px 'Plus Jakarta Sans', sans-serif;
  color: #071739;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(7, 23, 57, 0.04);
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
}

.ms-select-trigger:hover:not(:disabled) {
  border-color: #4B6382;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(75, 99, 130, 0.12);
}

.ms-select-container.is-open .ms-select-trigger {
  border-color: #4B6382;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(75, 99, 130, 0.18);
}

.ms-select-trigger:disabled {
  background: #EAE3DA;
  color: #8C9CA8;
  border-color: #DDD5CB;
  cursor: not-allowed;
  opacity: 0.75;
  box-shadow: none;
}

.ms-select-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.ms-select-chevron {
  color: #4B6382;
  display: grid;
  place-items: center;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ms-select-container.is-open .ms-select-chevron {
  transform: rotate(180deg);
  color: #071739;
}

.ms-select-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  width: max-content;
  max-width: 340px;
  max-height: 290px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #FAF8F5; /* Warm card tone */
  border: 1.5px solid #DDD5CB;
  border-radius: 12px;
  padding: 6px;
  z-index: 1000;
  box-shadow: 0 14px 36px rgba(7, 23, 57, 0.16), 0 2px 6px rgba(7, 23, 57, 0.06);
  animation: msSelectDrop 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.ms-select-container.open-upward .ms-select-menu {
  top: auto;
  bottom: calc(100% + 6px);
}

@keyframes msSelectDrop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ms-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #071739;
  cursor: pointer;
  transition: all 0.12s ease;
  user-select: none;
}

.ms-select-option:hover {
  background: #EAE3DA;
  color: #071739;
}

.ms-select-option.is-selected {
  background: #EEF3F8;
  color: #4B6382;
  font-weight: 700;
}

.ms-option-check {
  font-size: 13px;
  font-weight: 800;
  color: #4B6382;
}

/* Ensure containers and cards do not clip custom floating dropdowns */
.team-card, .case-card, .detail-card, .audit-card, .report-panel {
  overflow: visible !important;
}
.member-table {
  overflow: visible !important;
}

/* System-wide inputs, textareas, and card surfaces - Eliminates stark white rectangles */
input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="file"]),
textarea {
  background-color: #FAF8F5 !important;
  border: 1.5px solid #DDD5CB !important;
  color: #071739 !important;
  border-radius: 10px !important;
  box-shadow: inset 0 1px 2px rgba(7, 23, 57, 0.03) !important;
  transition: all 0.16s ease !important;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="file"]):hover:not(:focus):not(:disabled),
textarea:hover:not(:focus):not(:disabled) {
  border-color: #A4B5C4 !important;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="file"]):focus,
textarea:focus {
  background-color: #ffffff !important;
  border-color: #4B6382 !important;
  box-shadow: 0 0 0 3px rgba(75, 99, 130, 0.18), inset 0 1px 2px rgba(7, 23, 57, 0.03) !important;
}

/* Fallback for native selects and options */
select, option {
  background-color: #FAF8F5;
  color: #071739;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
}

/* Polished slot tiles in storage */
.slot-available {
  background: #FAF8F5 !important;
  border: 1.5px solid #DDD5CB !important;
  color: #071739 !important;
  transition: all 0.16s ease !important;
}
.slot-available:hover {
  background: #ffffff !important;
  border-color: #4B6382 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(7, 23, 57, 0.08) !important;
}

.slot-occupied {
  background: #071739 !important;
  border: 1.5px solid #071739 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(7, 23, 57, 0.18) !important;
}
.slot-occupied small {
  color: #E3C39D !important;
}

/* Polished invoice and message cards */
.invoice-card, .family-message-entry {
  background: #FAF8F5 !important;
  border: 1.5px solid #DDD5CB !important;
  box-shadow: 0 2px 8px rgba(7, 23, 57, 0.04) !important;
}
`;

fs.appendFileSync('preview/preview.css', '\n' + cssStyles, 'utf8');
console.log('Appended custom select styles to preview/preview.css');

fs.appendFileSync('src/app/phase2.css', '\n' + cssStyles, 'utf8');
console.log('Appended custom select styles to src/app/phase2.css');

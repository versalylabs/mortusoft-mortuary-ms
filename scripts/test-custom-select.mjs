// Custom select engine test
function createEnhanceScript() {
  return `
/* ==========================================================================
   CUSTOM SYSTEM DROPDOWNS ENGINE (MORTUSOFT COASTAL OCEANIC PALETTE)
   Transforms all native selects into bespoke, elegant floating dropdowns.
   ========================================================================== */
(function initCustomSelects() {
  function enhanceSelect(select) {
    if (!select || select.dataset.msEnhanced === "true") return;
    select.dataset.msEnhanced = "true";

    // Create wrapper
    const container = document.createElement("div");
    container.className = "ms-select-container";
    if (select.id) container.dataset.targetId = select.id;
    if (select.disabled) container.classList.add("is-disabled");

    // Hide native select visually while keeping it fully interactive for FormData and events
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
      }
    });

    select.addEventListener("change", syncOptions);

    const observer = new MutationObserver(() => syncOptions());
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

    // Insert container into DOM
    select.parentNode.insertBefore(container, select);
    container.appendChild(trigger);
    container.appendChild(menu);
    container.appendChild(select);
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".ms-select-container.is-open").forEach(c => {
      c.classList.remove("is-open");
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

  // Watch for new selects inserted dynamically anywhere in the DOM
  const pageObserver = new MutationObserver(() => {
    document.querySelectorAll("select:not([data-ms-enhanced])").forEach(enhanceSelect);
  });
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Initial pass on existing selects
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("select").forEach(enhanceSelect);
    });
  } else {
    document.querySelectorAll("select").forEach(enhanceSelect);
  }
})();
`;
}
console.log('Script generated without issues. Length:', createEnhanceScript().length);

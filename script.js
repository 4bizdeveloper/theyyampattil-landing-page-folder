/* ==============================
   script.js — REPLACEMENT VERSION
   Supports main & modal country select,
   clean form submit, WhatsApp, modal,
   lightbox, mobile nav, animations
================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------
     UTILITY
  ------------------ */
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const encode = s => encodeURIComponent(s);

  /* =====================
     COUNTRY LIST (full)
     — used for both banner + modal
  ===================== */
  const ALL_COUNTRIES = [
    { iso: 'AF', name: 'Afghanistan', dial: '+93' },
    { iso: 'AL', name: 'Albania', dial: '+355' },
    { iso: 'DZ', name: 'Algeria', dial: '+213' },
    { iso: 'AS', name: 'American Samoa', dial: '+1' },
    { iso: 'AD', name: 'Andorra', dial: '+376' },
    { iso: 'AO', name: 'Angola', dial: '+244' },
    { iso: 'AR', name: 'Argentina', dial: '+54' },
    { iso: 'AM', name: 'Armenia', dial: '+374' },
    { iso: 'AU', name: 'Australia', dial: '+61' },
    { iso: 'AT', name: 'Austria', dial: '+43' },
    { iso: 'AZ', name: 'Azerbaijan', dial: '+994' },
    { iso: 'BH', name: 'Bahrain', dial: '+973' },
    { iso: 'BD', name: 'Bangladesh', dial: '+880' },
    { iso: 'BY', name: 'Belarus', dial: '+375' },
    { iso: 'BE', name: 'Belgium', dial: '+32' },
    { iso: 'BR', name: 'Brazil', dial: '+55' },
    { iso: 'CA', name: 'Canada', dial: '+1' },
    { iso: 'CN', name: 'China', dial: '+86' },
    { iso: 'EG', name: 'Egypt', dial: '+20' },
    { iso: 'FR', name: 'France', dial: '+33' },
    { iso: 'DE', name: 'Germany', dial: '+49' },
    { iso: 'IN', name: 'India', dial: '+91' },
    { iso: 'ID', name: 'Indonesia', dial: '+62' },
    { iso: 'IT', name: 'Italy', dial: '+39' },
    { iso: 'JP', name: 'Japan', dial: '+81' },
    { iso: 'KE', name: 'Kenya', dial: '+254' },
    { iso: 'MY', name: 'Malaysia', dial: '+60' },
    { iso: 'MX', name: 'Mexico', dial: '+52' },
    { iso: 'NL', name: 'Netherlands', dial: '+31' },
    { iso: 'NZ', name: 'New Zealand', dial: '+64' },
    { iso: 'NG', name: 'Nigeria', dial: '+234' },
    { iso: 'PK', name: 'Pakistan', dial: '+92' },
    { iso: 'PH', name: 'Philippines', dial: '+63' },
    { iso: 'PL', name: 'Poland', dial: '+48' },
    { iso: 'PT', name: 'Portugal', dial: '+351' },
    { iso: 'RO', name: 'Romania', dial: '+40' },
    { iso: 'RU', name: 'Russia', dial: '+7' },
    { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { iso: 'ZA', name: 'South Africa', dial: '+27' },
    { iso: 'KR', name: 'South Korea', dial: '+82' },
    { iso: 'ES', name: 'Spain', dial: '+34' },
    { iso: 'SE', name: 'Sweden', dial: '+46' },
    { iso: 'CH', name: 'Switzerland', dial: '+41' },
    { iso: 'TR', name: 'Turkey', dial: '+90' },
    { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
    { iso: 'GB', name: 'United Kingdom', dial: '+44' },
    { iso: 'US', name: 'United States', dial: '+1' }
  ];

  function populateCountrySelect(sel) {
    if (!sel) return;
    sel.innerHTML = '<option value="">Select country</option>';
    ALL_COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name))
      .forEach(c => {
        const o = document.createElement('option');
        o.value = c.iso;
        o.dataset.dial = c.dial;
        o.textContent = `${c.name} (${c.dial})`;
        sel.appendChild(o);
      });
  }

  function normalizeNumber(raw, sel) {
    raw = String(raw || '').trim();
    if (!raw) return '';
    if (raw.startsWith('+')) {
      return '+' + raw.slice(1).replace(/\D+/g, '');
    }
    const digits = raw.replace(/\D+/g, '');
    const opt = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].dataset.dial : '';
    const dial = opt ? opt.replace(/\D+/g, '') : '';
    const stripped = digits.replace(/^0+/, '');
    return dial ? `+${dial}${stripped}` : digits;
  }

  /* =====================
     MAIN FORM COUNTRY
  ===================== */
  /* =====================
     MAIN FORM COUNTRY
  ===================== */
  const mainSelect = $('#country-select');
  const mainPrefix = $('#phone-prefix');
  const mainPhone = $('#phone');

  // helper to set selection and prefix/placeholder
  function setSelectByIso(selectEl, iso, prefixEl, phoneEl) {
    if (!selectEl || !iso) return false;
    const opt = selectEl.querySelector(`option[value="${iso}"]`);
    if (!opt) return false;
    selectEl.value = iso;
    const dial = opt.dataset.dial || '';
    if (prefixEl) prefixEl.value = dial;
    if (phoneEl) phoneEl.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
    return true;
  }

  // populate select if present
  if (mainSelect) populateCountrySelect(mainSelect);

// Force default to UAE if nothing else selected yet
if (typeof setSelectByIso === 'function') {
  // run after populate so options exist
  setTimeout(() => {
    // only set if user/auto detection hasn't already selected something
    if (mainSelect && !mainSelect.value) setSelectByIso(mainSelect, 'AE', mainPrefix, mainPhone);
    if (modalSelect && !modalSelect.value) setSelectByIso(modalSelect, 'AE', modalPrefix, modalPhone);
  }, 50);
}




  // Try browser locale first, then fallback to IP lookup (non-blocking)
  if (mainSelect) {
    try {
      const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale : (navigator && navigator.language) || '';
      if (locale) {
        const parts = locale.split(/[-_]/);
        if (parts.length > 1) {
          const iso = parts[1].toUpperCase();
          setSelectByIso(mainSelect, iso, mainPrefix, mainPhone);
        }
      }
    } catch (e) { /* ignore locale errors */ }

    // If not set by locale, try IP lookup (non-blocking)
    // This will update the select when the response arrives
    (function tryIpFallback() {
      // only run if no selection yet
      if (mainSelect.value) return;
      fetch('https://ipapi.co/json/').then(resp => resp.ok ? resp.json() : Promise.reject()).then(data => {
        const iso = data && data.country ? data.country.toUpperCase() : '';
        if (iso) setSelectByIso(mainSelect, iso, mainPrefix, mainPhone);
      }).catch(() => { /* ignore network errors */ });
    })();
  }

  // attach change and blur handlers (works whether auto-set or manual)
  if (mainSelect && mainPhone && mainPrefix) {
    mainSelect.addEventListener('change', function () {
      const dial = this.selectedOptions[0] ? this.selectedOptions[0].dataset.dial : '';
      mainPrefix.value = dial || '';
      if (mainPhone) mainPhone.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
    });
    mainPhone.addEventListener('blur', function () {
      this.value = normalizeNumber(this.value, mainSelect);
    });
  }


  /* =====================
     MODAL FORM COUNTRY
  ===================== */
  /* =====================
     MODAL FORM COUNTRY
  ===================== */
  const modalSelect = $('#modal-country-select');
  const modalPrefix = $('#modal-phone-prefix');
  const modalPhone = $('#modal-phone');

  // populate modal select
  if (modalSelect) populateCountrySelect(modalSelect);


  // Force default to UAE if nothing else selected yet
if (typeof setSelectByIso === 'function') {
  // run after populate so options exist
  setTimeout(() => {
    // only set if user/auto detection hasn't already selected something
    if (mainSelect && !mainSelect.value) setSelectByIso(mainSelect, 'AE', mainPrefix, mainPhone);
    if (modalSelect && !modalSelect.value) setSelectByIso(modalSelect, 'AE', modalPrefix, modalPhone);
  }, 50);
}




  // Try browser locale first, then IP fallback (non-blocking)
  if (modalSelect) {
    try {
      const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale : (navigator && navigator.language) || '';
      if (locale) {
        const parts = locale.split(/[-_]/);
        if (parts.length > 1) {
          const iso = parts[1].toUpperCase();
          setSelectByIso(modalSelect, iso, modalPrefix, modalPhone);
        }
      }
    } catch (e) { /* ignore */ }

    (function tryIpFallbackModal() {
      if (modalSelect.value) return;
      fetch('https://ipapi.co/json/').then(resp => resp.ok ? resp.json() : Promise.reject()).then(data => {
        const iso = data && data.country ? data.country.toUpperCase() : '';
        if (iso) setSelectByIso(modalSelect, iso, modalPrefix, modalPhone);
      }).catch(() => { /* ignore */ });
    })();
  }

  // attach change and blur handlers
  if (modalSelect && modalPhone && modalPrefix) {
    modalSelect.addEventListener('change', function () {
      const dial = this.selectedOptions[0] ? this.selectedOptions[0].dataset.dial : '';
      modalPrefix.value = dial || '';
      if (modalPhone) modalPhone.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
    });
    modalPhone.addEventListener('blur', function () {
      this.value = normalizeNumber(this.value, modalSelect);
    });
  }


  /* =====================
     CLEAN FORM SUBMIT HANDLERS
     — allow normal send-mail.php
  ===================== */
  function attachSubmit(form, sel, phoneEl) {
    if (!form) return;
    form.addEventListener('submit', function (e) {

      // normalize before submit
      if (phoneEl) phoneEl.value = normalizeNumber(phoneEl.value, sel);

      // basic validation
      const name = this.querySelector('[name="name"]');
      const email = this.querySelector('[name="email"]');

      if (!name || !name.value.trim()) {
        alert('Please enter your name');
        e.preventDefault();
        name && name.focus();
        return;
      }
      if (!email || !email.value.trim()) {
        alert('Please enter your email');
        e.preventDefault();
        email && email.focus();
        return;
      }
      if (!phoneEl || !phoneEl.value.trim()) {
        alert('Please enter phone number');
        e.preventDefault();
        phoneEl && phoneEl.focus();
        return;
      }

      // no preventDefault → normal submit happens
    });
  }

  attachSubmit($('#main-form'), mainSelect, mainPhone);
  attachSubmit($('#modal-quote-form'), modalSelect, modalPhone);

  /* =====================
     WHATSAPP ICON PREFILL
  ===================== */
  (function whatsapp() {
    const defaultPhone = '971559132200';
    const baseMsg = "Hi — interested. Please send details.";
    $$('a[href*="wa.me"], .wa-btn, .btn-wa, .fixed-wa').forEach(el => {
      const ph = el.dataset.phone ? el.dataset.phone.trim() : defaultPhone;
      const prd = el.dataset.product || '';
      const msg = prd ? `${baseMsg} Product: ${prd}` : baseMsg;
      const url = `https://wa.me/${ph}?text=${encode(msg)}`;
      if (el.tagName.toLowerCase() === 'a') {
        el.href = url; el.target='_blank';
      } else {
        el.addEventListener('click', () => window.open(url,'_blank'));
      }
    });
  })();

  /* =====================
     MODAL OPEN/CLOSE
  ===================== */
  const modal = $('#contactModal');
  const closeBtns = $$('.close-modal, .modal-close');

  function openModal(product) {
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    const nameFld = modal.querySelector('[name="name"]');
    nameFld && nameFld.focus();
    if (product) {
      const titleEl = modal.querySelector('.modal-product-name');
      titleEl && (titleEl.textContent = product);
    }
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  $$('.open-modal, .btn-inquire, .btn-form').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(btn.dataset.product || '');
    });
  });
  closeBtns.forEach(b => b.addEventListener('click', closeModal));
  modal && modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

});




document.addEventListener("DOMContentLoaded", function() {
    // 1. Select all instances of the fields across both forms
    const countrySelects = document.querySelectorAll("#country-select, #modal-country-select");
    const phonePrefixes = document.querySelectorAll("#phone-prefix, #modal-phone-prefix");
    const hiddenInputs = document.querySelectorAll("#country, #modal-country");

    const countryData = {
        "IN": { name: "India (+91)", prefix: "+91" },
        "AE": { name: "United Arab Emirates (+971)", prefix: "+971" },
        "SA": { name: "Saudi Arabia (+966)", prefix: "+966" },
        "QA": { name: "Qatar (+974)", prefix: "+974" },
        "OM": { name: "Oman (+968)", prefix: "+968" },
        "KW": { name: "Kuwait (+965)", prefix: "+965" },
        "BH": { name: "Bahrain (+973)", prefix: "+973" },
        "US": { name: "United States (+1)", prefix: "+1" },
        "GB": { name: "United Kingdom (+44)", prefix: "+44" }
    };

    // 2. Function to sync ALL forms at the same time
    function syncAllForms(code) {
        if (countryData[code]) {
            countrySelects.forEach(el => el.value = code);
            phonePrefixes.forEach(el => el.value = countryData[code].prefix);
            hiddenInputs.forEach(el => el.value = code);
        }
    }

    // 3. Populate all dropdowns (Banner and Modal)
    countrySelects.forEach(select => {
        // Clear existing options to prevent duplicates
        select.innerHTML = '<option value="">Select country</option>';
        for (let code in countryData) {
            let opt = document.createElement("option");
            opt.value = code;
            opt.textContent = countryData[code].name;
            select.appendChild(opt);
        }

        // Listen for manual changes—if one changes, both update!
        select.addEventListener("change", function() {
            syncAllForms(this.value);
        });
    });

    // 4. IP Geolocation fetch
    // Note: Use 'https' if your site is secure, otherwise browsers may block it.
    fetch('https://ipapi.co/json/') 
        .then(res => res.json())
        .then(data => {
            // ipapi.co uses 'country_code' (IN, AE, etc.)
            if (data.country_code && countryData[data.country_code]) {
                syncAllForms(data.country_code);
            } else {
                syncAllForms("AE"); // Fallback
            }
        })
        .catch(() => {
            console.log("Detection failed, defaulting to AE");
            syncAllForms("AE");
        });
});




/* ===== Mobile nav toggle JS (append inside DOMContentLoaded scope) ===== */
(function mobileNavEnsure() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-list');
  // create overlay if not present
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  if (!toggle || !nav) {
    // nothing to attach
    return;
  }

  // ensure single handlers
  function closeNav() {
    nav.classList.remove('show', 'open');
    overlay.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('nav-open');
  }
  function openNav() {
    nav.classList.add('show', 'open');
    overlay.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('nav-open');
  }
  function toggleNav(e) {
    e && e.preventDefault && e.preventDefault();
    if (nav.classList.contains('show')) closeNav(); else openNav();
  }

  // remove previous handlers if any
  if (toggle._navHandler) {
    toggle.removeEventListener('click', toggle._navHandler);
    toggle.removeEventListener('touchstart', toggle._navHandler);
  }
  toggle.addEventListener('click', toggleNav, { passive: false });
  toggle.addEventListener('touchstart', toggleNav, { passive: false });
  toggle._navHandler = toggleNav;

  // overlay closes nav
  if (overlay._overlayHandler) overlay.removeEventListener('click', overlay._overlayHandler);
  overlay.addEventListener('click', closeNav, { passive: true });
  overlay._overlayHandler = closeNav;

  // close on Escape
  function escHandler(e) { if (e.key === 'Escape' && nav.classList.contains('show')) closeNav(); }
  if (!document._navEscHandler) {
    document.addEventListener('keydown', escHandler, { passive: true });
    document._navEscHandler = escHandler;
  }

  // close when resizing to desktop
  function onResize() {
    if (window.innerWidth > 992 && nav.classList.contains('show')) closeNav();
  }
  if (!window._navResizeHandler) {
    window.addEventListener('resize', onResize, { passive: true });
    window._navResizeHandler = onResize;
  }
})();

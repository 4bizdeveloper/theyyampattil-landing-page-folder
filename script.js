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
  { iso: "AF", name: "Afghanistan", dial: "+93" },
  { iso: "AL", name: "Albania", dial: "+355" },
  { iso: "DZ", name: "Algeria", dial: "+213" },
  { iso: "AS", name: "American Samoa", dial: "+1" },
  { iso: "AD", name: "Andorra", dial: "+376" },
  { iso: "AO", name: "Angola", dial: "+244" },
  { iso: "AI", name: "Anguilla", dial: "+1" },
  { iso: "AQ", name: "Antarctica", dial: "+672" },
  { iso: "AG", name: "Antigua and Barbuda", dial: "+1" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "AM", name: "Armenia", dial: "+374" },
  { iso: "AW", name: "Aruba", dial: "+297" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "AZ", name: "Azerbaijan", dial: "+994" },
  { iso: "BS", name: "Bahamas", dial: "+1" },
  { iso: "BH", name: "Bahrain", dial: "+973" },
  { iso: "BD", name: "Bangladesh", dial: "+880" },
  { iso: "BB", name: "Barbados", dial: "+1" },
  { iso: "BY", name: "Belarus", dial: "+375" },
  { iso: "BE", name: "Belgium", dial: "+32" },
  { iso: "BZ", name: "Belize", dial: "+501" },
  { iso: "BJ", name: "Benin", dial: "+229" },
  { iso: "BM", name: "Bermuda", dial: "+1" },
  { iso: "BT", name: "Bhutan", dial: "+975" },
  { iso: "BO", name: "Bolivia", dial: "+591" },
  { iso: "BQ", name: "Bonaire, Sint Eustatius and Saba", dial: "+599" },
  { iso: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { iso: "BW", name: "Botswana", dial: "+267" },
  { iso: "BR", name: "Brazil", dial: "+55" },
  { iso: "IO", name: "British Indian Ocean Territory", dial: "+246" },
  { iso: "VG", name: "British Virgin Islands", dial: "+1" },
  { iso: "BN", name: "Brunei", dial: "+673" },
  { iso: "BG", name: "Bulgaria", dial: "+359" },
  { iso: "BF", name: "Burkina Faso", dial: "+226" },
  { iso: "BI", name: "Burundi", dial: "+257" },
  { iso: "CV", name: "Cabo Verde", dial: "+238" },
  { iso: "KH", name: "Cambodia", dial: "+855" },
  { iso: "CM", name: "Cameroon", dial: "+237" },
  { iso: "CA", name: "Canada", dial: "+1" },
  { iso: "KY", name: "Cayman Islands", dial: "+1" },
  { iso: "CF", name: "Central African Republic", dial: "+236" },
  { iso: "TD", name: "Chad", dial: "+235" },
  { iso: "CL", name: "Chile", dial: "+56" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "CX", name: "Christmas Island", dial: "+61" },
  { iso: "CC", name: "Cocos (Keeling) Islands", dial: "+61" },
  { iso: "CO", name: "Colombia", dial: "+57" },
  { iso: "KM", name: "Comoros", dial: "+269" },
  { iso: "CK", name: "Cook Islands", dial: "+682" },
  { iso: "CR", name: "Costa Rica", dial: "+506" },
  { iso: "HR", name: "Croatia", dial: "+385" },
  { iso: "CU", name: "Cuba", dial: "+53" },
  { iso: "CW", name: "Curaçao", dial: "+599" },
  { iso: "CY", name: "Cyprus", dial: "+357" },
  { iso: "CZ", name: "Czechia", dial: "+420" },
  { iso: "CD", name: "Democratic Republic of the Congo", dial: "+243" },
  { iso: "DK", name: "Denmark", dial: "+45" },
  { iso: "DJ", name: "Djibouti", dial: "+253" },
  { iso: "DM", name: "Dominica", dial: "+1" },
  { iso: "DO", name: "Dominican Republic", dial: "+1" },
  { iso: "TL", name: "Timor-Leste", dial: "+670" },
  { iso: "EC", name: "Ecuador", dial: "+593" },
  { iso: "EG", name: "Egypt", dial: "+20" },
  { iso: "SV", name: "El Salvador", dial: "+503" },
  { iso: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { iso: "ER", name: "Eritrea", dial: "+291" },
  { iso: "EE", name: "Estonia", dial: "+372" },
  { iso: "SZ", name: "Eswatini", dial: "+268" },
  { iso: "ET", name: "Ethiopia", dial: "+251" },
  { iso: "FK", name: "Falkland Islands", dial: "+500" },
  { iso: "FO", name: "Faroe Islands", dial: "+298" },
  { iso: "FJ", name: "Fiji", dial: "+679" },
  { iso: "FI", name: "Finland", dial: "+358" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "GF", name: "French Guiana", dial: "+594" },
  { iso: "PF", name: "French Polynesia", dial: "+689" },
  { iso: "GA", name: "Gabon", dial: "+241" },
  { iso: "GM", name: "Gambia", dial: "+220" },
  { iso: "GE", name: "Georgia", dial: "+995" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "GH", name: "Ghana", dial: "+233" },
  { iso: "GI", name: "Gibraltar", dial: "+350" },
  { iso: "GR", name: "Greece", dial: "+30" },
  { iso: "GL", name: "Greenland", dial: "+299" },
  { iso: "GD", name: "Grenada", dial: "+1" },
  { iso: "GP", name: "Guadeloupe", dial: "+590" },
  { iso: "GU", name: "Guam", dial: "+1" },
  { iso: "GT", name: "Guatemala", dial: "+502" },
  { iso: "GG", name: "Guernsey", dial: "+44" },
  { iso: "GN", name: "Guinea", dial: "+224" },
  { iso: "GW", name: "Guinea-Bissau", dial: "+245" },
  { iso: "GY", name: "Guyana", dial: "+592" },
  { iso: "HT", name: "Haiti", dial: "+509" },
  { iso: "HN", name: "Honduras", dial: "+504" },
  { iso: "HK", name: "Hong Kong", dial: "+852" },
  { iso: "HU", name: "Hungary", dial: "+36" },
  { iso: "IS", name: "Iceland", dial: "+354" },
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "ID", name: "Indonesia", dial: "+62" },
  { iso: "IR", name: "Iran", dial: "+98" },
  { iso: "IQ", name: "Iraq", dial: "+964" },
  { iso: "IE", name: "Ireland", dial: "+353" },
  { iso: "IM", name: "Isle of Man", dial: "+44" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "CI", name: "Côte d'Ivoire", dial: "+225" },
  { iso: "JM", name: "Jamaica", dial: "+1" },
  { iso: "JP", name: "Japan", dial: "+81" },
  { iso: "JE", name: "Jersey", dial: "+44" },
  { iso: "JO", name: "Jordan", dial: "+962" },
  { iso: "KZ", name: "Kazakhstan", dial: "+7" },
  { iso: "KE", name: "Kenya", dial: "+254" },
  { iso: "KI", name: "Kiribati", dial: "+686" },
  { iso: "XK", name: "Kosovo", dial: "+383" },
  { iso: "KW", name: "Kuwait", dial: "+965" },
  { iso: "KG", name: "Kyrgyzstan", dial: "+996" },
  { iso: "LA", name: "Laos", dial: "+856" },
  { iso: "LV", name: "Latvia", dial: "+371" },
  { iso: "LB", name: "Lebanon", dial: "+961" },
  { iso: "LS", name: "Lesotho", dial: "+266" },
  { iso: "LR", name: "Liberia", dial: "+231" },
  { iso: "LY", name: "Libya", dial: "+218" },
  { iso: "LI", name: "Liechtenstein", dial: "+423" },
  { iso: "LT", name: "Lithuania", dial: "+370" },
  { iso: "LU", name: "Luxembourg", dial: "+352" },
  { iso: "MO", name: "Macao", dial: "+853" },
  { iso: "MG", name: "Madagascar", dial: "+261" },
  { iso: "MW", name: "Malawi", dial: "+265" },
  { iso: "MY", name: "Malaysia", dial: "+60" },
  { iso: "MV", name: "Maldives", dial: "+960" },
  { iso: "ML", name: "Mali", dial: "+223" },
  { iso: "MT", name: "Malta", dial: "+356" },
  { iso: "MH", name: "Marshall Islands", dial: "+692" },
  { iso: "MQ", name: "Martinique", dial: "+596" },
  { iso: "MR", name: "Mauritania", dial: "+222" },
  { iso: "MU", name: "Mauritius", dial: "+230" },
  { iso: "YT", name: "Mayotte", dial: "+262" },
  { iso: "MX", name: "Mexico", dial: "+52" },
  { iso: "FM", name: "Micronesia", dial: "+691" },
  { iso: "MD", name: "Moldova", dial: "+373" },
  { iso: "MC", name: "Monaco", dial: "+377" },
  { iso: "MN", name: "Mongolia", dial: "+976" },
  { iso: "ME", name: "Montenegro", dial: "+382" },
  { iso: "MS", name: "Montserrat", dial: "+1" },
  { iso: "MA", name: "Morocco", dial: "+212" },
  { iso: "MZ", name: "Mozambique", dial: "+258" },
  { iso: "MM", name: "Myanmar", dial: "+95" },
  { iso: "NA", name: "Namibia", dial: "+264" },
  { iso: "NR", name: "Nauru", dial: "+674" },
  { iso: "NP", name: "Nepal", dial: "+977" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "NC", name: "New Caledonia", dial: "+687" },
  { iso: "NZ", name: "New Zealand", dial: "+64" },
  { iso: "NI", name: "Nicaragua", dial: "+505" },
  { iso: "NE", name: "Niger", dial: "+227" },
  { iso: "NG", name: "Nigeria", dial: "+234" },
  { iso: "NU", name: "Niue", dial: "+683" },
  { iso: "NF", name: "Norfolk Island", dial: "+672" },
  { iso: "KP", name: "North Korea", dial: "+850" },
  { iso: "MK", name: "North Macedonia", dial: "+389" },
  { iso: "MP", name: "Northern Mariana Islands", dial: "+1" },
  { iso: "NO", name: "Norway", dial: "+47" },
  { iso: "OM", name: "Oman", dial: "+968" },
  { iso: "PK", name: "Pakistan", dial: "+92" },
  { iso: "PW", name: "Palau", dial: "+680" },
  { iso: "PS", name: "Palestine", dial: "+970" },
  { iso: "PA", name: "Panama", dial: "+507" },
  { iso: "PG", name: "Papua New Guinea", dial: "+675" },
  { iso: "PY", name: "Paraguay", dial: "+595" },
  { iso: "PE", name: "Peru", dial: "+51" },
  { iso: "PH", name: "Philippines", dial: "+63" },
  { iso: "PN", name: "Pitcairn", dial: "+64" },
  { iso: "PL", name: "Poland", dial: "+48" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "PR", name: "Puerto Rico", dial: "+1" },
  { iso: "QA", name: "Qatar", dial: "+974" },
  { iso: "CG", name: "Republic of the Congo", dial: "+242" },
  { iso: "RE", name: "Réunion", dial: "+262" },
  { iso: "RO", name: "Romania", dial: "+40" },
  { iso: "RU", name: "Russia", dial: "+7" },
  { iso: "RW", name: "Rwanda", dial: "+250" },
  { iso: "BL", name: "Saint Barthélemy", dial: "+590" },
  { iso: "SH", name: "Saint Helena", dial: "+290" },
  { iso: "KN", name: "Saint Kitts and Nevis", dial: "+1" },
  { iso: "LC", name: "Saint Lucia", dial: "+1" },
  { iso: "MF", name: "Saint Martin", dial: "+590" },
  { iso: "PM", name: "Saint Pierre and Miquelon", dial: "+508" },
  { iso: "VC", name: "Saint Vincent and the Grenadines", dial: "+1" },
  { iso: "WS", name: "Samoa", dial: "+685" },
  { iso: "SM", name: "San Marino", dial: "+378" },
  { iso: "ST", name: "Sao Tome and Principe", dial: "+239" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso: "SN", name: "Senegal", dial: "+221" },
  { iso: "RS", name: "Serbia", dial: "+381" },
  { iso: "SC", name: "Seychelles", dial: "+248" },
  { iso: "SL", name: "Sierra Leone", dial: "+232" },
  { iso: "SG", name: "Singapore", dial: "+65" },
  { iso: "SX", name: "Sint Maarten", dial: "+1" },
  { iso: "SK", name: "Slovakia", dial: "+421" },
  { iso: "SI", name: "Slovenia", dial: "+386" },
  { iso: "SB", name: "Solomon Islands", dial: "+677" },
  { iso: "SO", name: "Somalia", dial: "+252" },
  { iso: "ZA", name: "South Africa", dial: "+27" },
  { iso: "KR", name: "South Korea", dial: "+82" },
  { iso: "SS", name: "South Sudan", dial: "+211" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "LK", name: "Sri Lanka", dial: "+94" },
  { iso: "SD", name: "Sudan", dial: "+249" },
  { iso: "SR", name: "Suriname", dial: "+597" },
  { iso: "SJ", name: "Svalbard and Jan Mayen", dial: "+47" },
  { iso: "SE", name: "Sweden", dial: "+46" },
  { iso: "CH", name: "Switzerland", dial: "+41" },
  { iso: "SY", name: "Syria", dial: "+963" },
  { iso: "TW", name: "Taiwan", dial: "+886" },
  { iso: "TJ", name: "Tajikistan", dial: "+992" },
  { iso: "TZ", name: "Tanzania", dial: "+255" },
  { iso: "TH", name: "Thailand", dial: "+66" },
  { iso: "TG", name: "Togo", dial: "+228" },
  { iso: "TK", name: "Tokelau", dial: "+690" },
  { iso: "TO", name: "Tonga", dial: "+676" },
  { iso: "TT", name: "Trinidad and Tobago", dial: "+1" },
  { iso: "TN", name: "Tunisia", dial: "+216" },
  { iso: "TR", name: "Turkey", dial: "+90" },
  { iso: "TM", name: "Turkmenistan", dial: "+993" },
  { iso: "TC", name: "Turks and Caicos Islands", dial: "+1" },
  { iso: "TV", name: "Tuvalu", dial: "+688" },
  { iso: "UG", name: "Uganda", dial: "+256" },
  { iso: "UA", name: "Ukraine", dial: "+380" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "UY", name: "Uruguay", dial: "+598" },
  { iso: "UZ", name: "Uzbekistan", dial: "+998" },
  { iso: "VU", name: "Vanuatu", dial: "+678" },
  { iso: "VA", name: "Vatican City", dial: "+379" },
  { iso: "VE", name: "Venezuela", dial: "+58" },
  { iso: "VN", name: "Vietnam", dial: "+84" },
  { iso: "WF", name: "Wallis and Futuna", dial: "+681" },
  { iso: "EH", name: "Western Sahara", dial: "+212" },
  { iso: "YE", name: "Yemen", dial: "+967" },
  { iso: "ZM", name: "Zambia", dial: "+260" },
  { iso: "ZW", name: "Zimbabwe", dial: "+263" }
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
    if (phoneEl) phoneEl.placeholder = '5xxxxxxx';

    return true;
  }

  // populate select if present
  if (mainSelect) populateCountrySelect(mainSelect);

// Force default to UAE if nothing else selected yet
if (typeof setSelectByIso === 'function') {
  // run after populate so options exist
 
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
      if (mainPhone) mainPhone.placeholder = '5xxxxxxx';

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
      if (modalPhone) modalPhone.placeholder = '5xxxxxxx';

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

    // job title: support select or input with common names/ids/classes
    const jobSelectors = [
      '[name="job_title"]',
      '[name="jobTitle"]',
      '#job-title',
      '.job-title',
      'select[name="job_title"]',
      'select[name="jobTitle"]'
    ];
    let job = null;
    for (let s of jobSelectors) {
      job = this.querySelector(s);
      if (job) break;
    }

    // helper to check emptiness for select/input
    function isEmptyField(f) {
      if (!f) return true;
      if (f.tagName === 'SELECT') {
        const v = f.value || '';
        return v.trim() === '';
      }
      return !(f.value && f.value.trim());
    }

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

    // job title validation (only if job field exists on this form)
    if (job) {
      if (isEmptyField(job)) {
        const msg = job.tagName === 'SELECT' ? 'Please select your job title' : 'Please enter your job title';
        alert(msg);
        e.preventDefault();
        job.focus();
        return;
      }
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


// Strict UAE default: set AE and prevent programmatic overwrites unless user chooses
(function forceUaeStrict() {
  const AE_ISO = 'AE';
  const AE_DIAL = '+971';
  const MAIN_ID = 'country-select';
  const MODAL_ID = 'modal-country-select';
  const PREFIX_MAIN_ID = 'phone-prefix';
  const PREFIX_MODAL_ID = 'modal-phone-prefix';
  const HIDDEN_MAIN_ID = 'country';
  const HIDDEN_MODAL_ID = 'modal-country';
  const PHONE_MAIN_ID = 'phone';
  const PHONE_MODAL_ID = 'modal-phone';

  function $(id) { return document.getElementById(id); }

  function waitForOptions(sel, timeout = 4000) {
    return new Promise(resolve => {
      if (!sel) return resolve(false);
      if (sel.options && sel.options.length > 0) return resolve(true);
      const start = Date.now();
      const iv = setInterval(() => {
        if (sel.options && sel.options.length > 0) { clearInterval(iv); return resolve(true); }
        if (Date.now() - start > timeout) { clearInterval(iv); return resolve(false); }
      }, 80);
    });
  }

  function applyAE(selectEl, prefixEl, phoneEl, hiddenEl) {
    if (!selectEl) return;
    // insert AE option if missing
    let opt = selectEl.querySelector(`option[value="${AE_ISO}"]`);
    if (!opt) {
      opt = document.createElement('option');
      opt.value = AE_ISO;
      opt.dataset.dial = AE_DIAL;
      opt.textContent = `United Arab Emirates (${AE_DIAL})`;
      const insertIndex = (selectEl.options.length && selectEl.options[0].value === '') ? 1 : 0;
      selectEl.add(opt, selectEl.options[insertIndex] || null);
    }
    // only set if user hasn't chosen anything yet
    if (!selectEl.value) {
      selectEl.value = AE_ISO;
      selectEl.selectedIndex = Array.prototype.indexOf.call(selectEl.options, opt);
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (prefixEl) prefixEl.value = AE_DIAL;
    if (phoneEl) phoneEl.placeholder = '5xxxxxxx';

    if (hiddenEl) hiddenEl.value = AE_ISO;
  }

  async function run() {
    const main = $(MAIN_ID);
    const modal = $(MODAL_ID);
    await Promise.all([ waitForOptions(main, 4000), waitForOptions(modal, 4000) ]);

    // track whether user manually changed each select
    const userChanged = new Map();
    [main, modal].forEach(s => { if (s) userChanged.set(s, false); });

    // attach user change listeners
    [ {sel: main, prefix: $(PREFIX_MAIN_ID), phone: $(PHONE_MAIN_ID), hidden: $(HIDDEN_MAIN_ID)},
      {sel: modal, prefix: $(PREFIX_MODAL_ID), phone: $(PHONE_MODAL_ID), hidden: $(HIDDEN_MODAL_ID)}
    ].forEach(cfg => {
      const sel = cfg.sel;
      if (!sel) return;
      sel.addEventListener('change', function () {
        // mark user intent only if they actively changed (not programmatic)
        userChanged.set(sel, true);
        const opt = sel.selectedOptions && sel.selectedOptions[0];
        const dial = opt ? (opt.dataset.dial || '') : '';
        if (cfg.prefix) cfg.prefix.value = dial || '';
        if (cfg.phone) cfg.phone.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
        if (cfg.hidden) cfg.hidden.value = sel.value || '';
      }, { passive: true });
    });

    // apply AE initially if empty
    applyAE(main, $(PREFIX_MAIN_ID), $(PHONE_MAIN_ID), $(HIDDEN_MAIN_ID));
    applyAE(modal, $(PREFIX_MODAL_ID), $(PHONE_MODAL_ID), $(HIDDEN_MODAL_ID));

    // Observe programmatic changes and revert to AE unless user changed
    function observeAndProtect(sel, prefixEl, phoneEl, hiddenEl) {
      if (!sel) return;
      const mo = new MutationObserver(muts => {
        // if user changed, stop protecting
        if (userChanged.get(sel)) { mo.disconnect(); return; }
        // if value changed away from AE programmatically, revert
        if (sel.value && sel.value !== AE_ISO) {
          // revert to AE
          const aeOpt = sel.querySelector(`option[value="${AE_ISO}"]`);
          if (aeOpt) {
            sel.value = AE_ISO;
            sel.selectedIndex = Array.prototype.indexOf.call(sel.options, aeOpt);
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            if (prefixEl) prefixEl.value = AE_DIAL;
            if (phoneEl) phoneEl.placeholder = '5xxxxxxx';

            if (hiddenEl) hiddenEl.value = AE_ISO;
          }
        }
      });
      mo.observe(sel, { attributes: true, attributeFilter: ['value'] });
      // also guard against direct property sets by polling briefly (short window)
      let checks = 0;
      const poll = setInterval(() => {
        if (userChanged.get(sel) || checks++ > 40) { clearInterval(poll); mo.disconnect(); return; }
        if (sel.value && sel.value !== AE_ISO) {
          const aeOpt = sel.querySelector(`option[value="${AE_ISO}"]`);
          if (aeOpt) {
            sel.value = AE_ISO;
            sel.selectedIndex = Array.prototype.indexOf.call(sel.options, aeOpt);
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            if (prefixEl) prefixEl.value = AE_DIAL;
            if (phoneEl) phoneEl.placeholder = '5xxxxxxx';

            if (hiddenEl) hiddenEl.value = AE_ISO;
          }
        }
      }, 150);
      // stop polling after 6 seconds
      setTimeout(() => { clearInterval(poll); mo.disconnect(); }, 6000);
    }

    observeAndProtect(main, $(PREFIX_MAIN_ID), $(PHONE_MAIN_ID), $(HIDDEN_MAIN_ID));
    observeAndProtect(modal, $(PREFIX_MODAL_ID), $(PHONE_MODAL_ID), $(HIDDEN_MODAL_ID));
  }

  // run without blocking
  setTimeout(run, 30);
})();






(function () {
  'use strict';

  const FORM_ID = 'contactForm'; // change if your form uses a different id
  const DEBUG = true;

  function log(...args) { if (DEBUG) console.log('[form-guard]', ...args); }

  document.addEventListener('DOMContentLoaded', () => {
    // Find form by id or fallback to first form
    let form = document.getElementById(FORM_ID);
    if (!form) {
      form = document.querySelector('form');
      if (!form) {
        log('No form found on page. Aborting form guard.');
        return;
      }
      log(`Form with id "${FORM_ID}" not found. Using first <form> on page.`);
    } else {
      log(`Using form #${FORM_ID}`);
    }

    // Prevent double submission
    let submitting = false;

    // Create or reuse error element next to field
    function ensureErrorEl(field) {
      const next = field.nextElementSibling;
      if (next && next.classList && next.classList.contains('field-error')) return next;
      const span = document.createElement('span');
      span.className = 'field-error';
      span.setAttribute('role', 'alert');
      span.style.color = '#b00020';
      span.style.fontSize = '0.9em';
      span.style.marginLeft = '6px';
      field.parentNode.insertBefore(span, field.nextSibling);
      return span;
    }

    function setError(field, message) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      const el = ensureErrorEl(field);
      el.textContent = message;
      log('setError', field.name || field.id || field.type, message);
    }

    function clearError(field) {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      const next = field.nextElementSibling;
      if (next && next.classList && next.classList.contains('field-error')) next.textContent = '';
    }

    // Determine if a field should be validated
    function isValidatable(field) {
      if (!field) return false;
      if (field.disabled) return false;
      if (field.type === 'hidden') return false;
      // ignore buttons
      if (field.tagName === 'BUTTON') return false;
      if (field.matches('[data-skip-validation]')) return false;
      return true;
    }

    // Validate single field, return true if valid
    function validateField(field) {
      if (!isValidatable(field)) return true;

      const required = field.hasAttribute('required') || field.dataset.required === 'true';
      const value = (field.value || '').trim();

      // If not required, but has value, still run type checks (email)
      if (!required && value === '') {
        clearError(field);
        return true;
      }

      if (required && value === '') {
        setError(field, 'This field is required.');
        return false;
      }

      if (field.type === 'email' && value !== '') {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value)) {
          setError(field, 'Please enter a valid email address.');
          return false;
        }
      }

      if (field.type === 'tel' && value !== '') {
        // basic phone check: digits, spaces, +, -, parentheses
        const re = /^[0-9+\-\s()]{6,}$/;
        if (!re.test(value)) {
          setError(field, 'Please enter a valid phone number.');
          return false;
        }
      }

      // custom pattern attribute support
      if (field.pattern && value !== '') {
        try {
          const pat = new RegExp('^' + field.pattern + '$');
          if (!pat.test(value)) {
            setError(field, 'Value does not match required format.');
            return false;
          }
        } catch (err) {
          // invalid pattern attribute; ignore
          log('Invalid pattern on field', field, err);
        }
      }

      clearError(field);
      return true;
    }

    // Validate all relevant fields
    function validateAll() {
      const fields = Array.from(form.querySelectorAll('input, textarea, select'));
      let firstInvalid = null;
      let allValid = true;
      fields.forEach(f => {
        const ok = validateField(f);
        if (!ok && !firstInvalid) firstInvalid = f;
        allValid = allValid && ok;
      });
      return { valid: allValid, firstInvalid };
    }

    // Live validation: input and change events
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t && (t.matches('input, textarea, select'))) {
        validateField(t);
      }
    }, true);

    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t && (t.matches('input, textarea, select'))) {
        validateField(t);
      }
    }, true);

    // Intercept submit
    form.addEventListener('submit', (e) => {
      log('submit event triggered');
      if (submitting) {
        log('Submission blocked: already submitting');
        e.preventDefault();
        return;
      }

      const result = validateAll();
      if (!result.valid) {
        e.preventDefault();
        if (result.firstInvalid) {
          result.firstInvalid.focus({ preventScroll: false });
        }
        log('Submission blocked: validation failed');
        return;
      }

      // If you use AJAX, you can skip the default submit here and handle manually.
      // For normal submit, allow it but prevent double submit.
      submitting = true;
      // disable submit buttons to avoid double click
      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      submitButtons.forEach(b => b.disabled = true);

      // If you want to re-enable after some time (e.g., server error), call:
      // submitting = false; submitButtons.forEach(b => b.disabled = false);
      log('Form passed validation, proceeding with submit');
    });

    // Optional: re-enable submit if user changes something after a failed attempt
    form.addEventListener('input', () => {
      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      if (submitting) {
        // do not auto re-enable while actual submit in progress
        return;
      }
      submitButtons.forEach(b => b.disabled = false);
    });

    // Expose a debug function on the form for manual checks in console
    form._validateNow = function () {
      return validateAll();
    };

    log('Form guard initialized');
  });
})();



// Modal + page form unified validation (drop-in)
(function () {
  'use strict';

  const FORM_SELECTORS = ['form.instant-form', '#modal-quote-form']; // targets inline form(s) and modal form
  const DEBUG = false;

  function log(...args) { if (DEBUG) console.log('[form-validate]', ...args); }

  function ensureErrorEl(field) {
    const next = field.nextElementSibling;
    if (next && next.classList && next.classList.contains('field-error')) return next;
    const span = document.createElement('span');
    span.className = 'field-error';
    span.setAttribute('role', 'alert');
    span.style.color = '#b00020';
    span.style.fontSize = '0.9em';
    span.style.marginLeft = '6px';
    field.parentNode.insertBefore(span, field.nextSibling);
    return span;
  }

  function setError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    ensureErrorEl(field).textContent = message;
    log('error', field.name || field.id || field.tagName, message);
  }

  function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const next = field.nextElementSibling;
    if (next && next.classList && next.classList.contains('field-error')) next.textContent = '';
  }

  function isValidatable(field) {
    if (!field) return false;
    if (field.disabled) return false;
    if (field.type === 'hidden') return false;
    if (field.tagName === 'BUTTON') return false;
    if (field.matches('[data-skip-validation]')) return false;
    return true;
  }

  function validateField(field) {
    if (!isValidatable(field)) return true;
    const required = field.hasAttribute('required') || field.dataset.required === 'true';
    const value = (field.value || '').trim();

    // Special: treat select with empty value as invalid when required
    if (field.tagName === 'SELECT') {
      if (required && (value === '' || value === null)) {
        setError(field, 'Please select an option.');
        return false;
      }
      clearError(field);
      return true;
    }

    if (!required && value === '') {
      clearError(field);
      return true;
    }

    if (required && value === '') {
      setError(field, 'This field is required.');
      return false;
    }

    if (field.type === 'email' && value !== '') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) { setError(field, 'Please enter a valid email address.'); return false; }
    }

    // Example: job title custom check (if you have a select or input for job title)
    if ((field.name && /job[_-]?title/i.test(field.name)) || (field.id && /job[_-]?title/i.test(field.id)) || field.classList.contains('job-title')) {
      if (value === '') { setError(field, 'Please enter/select job title.'); return false; }
    }

    clearError(field);
    return true;
  }

  function validateAll(form) {
    const fields = Array.from(form.querySelectorAll('input, textarea, select'));
    let firstInvalid = null;
    let allValid = true;
    fields.forEach(f => {
      const ok = validateField(f);
      if (!ok && !firstInvalid) firstInvalid = f;
      allValid = allValid && ok;
    });
    return { valid: allValid, firstInvalid };
  }

  function attachToForm(form) {
    let submitting = false;

    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t && t.matches('input, textarea, select')) validateField(t);
    }, true);

    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t && t.matches('input, textarea, select')) validateField(t);
    }, true);

    form.addEventListener('submit', (e) => {
      if (submitting) { e.preventDefault(); return; }
      const res = validateAll(form);
      if (!res.valid) {
        e.preventDefault();
        if (res.firstInvalid) res.firstInvalid.focus({ preventScroll: false });
        return;
      }
      // prevent double submit
      submitting = true;
      form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(b => b.disabled = true);
    });

    // clear errors on reset
    form.addEventListener('reset', () => {
      Array.from(form.querySelectorAll('input, textarea, select')).forEach(clearError);
      form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(b => b.disabled = false);
      submitting = false;
    });

    // If form is inside a modal, clear errors when modal closes (custom event)
    const modal = form.closest('.modal');
    if (modal) {
      modal.addEventListener('modalhidden', () => {
        Array.from(form.querySelectorAll('input, textarea, select')).forEach(clearError);
        form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(b => b.disabled = false);
      });
      // also listen for close button if present
      const closeBtn = modal.querySelector('.close-modal');
      if (closeBtn) closeBtn.addEventListener('click', () => modal.dispatchEvent(new Event('modalhidden')));
    }
  }

  // initialize
  document.addEventListener('DOMContentLoaded', () => {
    const selector = FORM_SELECTORS.join(',');
    document.querySelectorAll(selector).forEach(form => attachToForm(form));
    // fallback: ensure modal form id is attached even if not matching class
    const modalForm = document.getElementById('modal-quote-form');
    if (modalForm) attachToForm(modalForm);
    log('validation attached');
  });
})();

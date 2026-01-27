// script.js — full replacement
// Modal, constrained lightbox, image attach, glass effects, footer UX,
// responsive mobile nav, header padding sync, WhatsApp prefill for all icons, and helpers

document.addEventListener('DOMContentLoaded', function () {
  /* -------------------------
     Helpers
     ------------------------- */
  const safeQuery = (sel, ctx = document) => ctx.querySelector(sel);
  const safeQueryAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const isAnchor = el => el && el.tagName && el.tagName.toLowerCase() === 'a';

  /* -------------------------
     Header padding sync (keeps body content below fixed header)
     ------------------------- */
  (function headerPaddingSync() {
    const header = safeQuery('.lp-header');
    if (!header) return;
    function sync() {
      const h = Math.ceil(header.getBoundingClientRect().height || 0);
      document.body.style.paddingTop = h + 'px';
    }
    sync();
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    if ('ResizeObserver' in window) {
      try {
        const ro = new ResizeObserver(sync);
        ro.observe(header);
      } catch (e) { /* ignore */ }
    }
  })();

  /* -------------------------
     WhatsApp prefill for every WhatsApp element (header, footer, product cards, fixed button)
     - Respects data-phone override
     - Appends product name when available (data-product or nearest .product-title)
     ------------------------- */
  (function applyWhatsAppPrefillAll() {
    const defaultPhone = '971559132200'; // change if needed (country code, no +)
    const baseMessage = "Hi — interested. Please send details.";
    const encode = s => encodeURIComponent(s);

    // selectors to capture anchors and common WA elements
    const selectors = [
      'a[href*="wa.me"]',   // existing wa.me links
      'a.btn-wa',           // explicit class used in markup
      'a.wa-product',
      'a.wa-btn',
      '.fixed-wa',          // floating WA (may be anchor or button)
      '.btn-wa',            // fallback
      '.wa-btn'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(el => {
      // determine phone override (data-phone) or fallback
      const phone = (el.dataset && el.dataset.phone) ? el.dataset.phone.trim() : defaultPhone;

      // try to detect product context
      let product = '';
      if (el.dataset && el.dataset.product) product = el.dataset.product.trim();
      else {
        // look for nearest product card title
        const card = el.closest('.product-card, .product-info, .card-actions');
        if (card) {
          const title = card.querySelector('.product-title, h3, .product-info h3');
          if (title) product = title.textContent.trim();
        }
      }

      // build message (append product if found)
      const message = product ? `${baseMessage} Product: ${product}` : baseMessage;
      const href = `https://wa.me/${phone}?text=${encode(message)}`;

      // If element is an anchor, set href
      if (isAnchor(el)) {
        el.href = href;
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      } else {
        // For non-anchor elements (e.g., div/button), attach click to open WA
        // Remove previous handlers to avoid duplicates
        if (el._waHandler) el.removeEventListener('click', el._waHandler);
        const handler = (e) => {
          e.preventDefault();
          window.open(href, '_blank', 'noopener');
        };
        el.addEventListener('click', handler);
        el._waHandler = handler;

        // make it keyboard accessible if not already
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (el._waKeyHandler) el.removeEventListener('keydown', el._waKeyHandler);
        const keyHandler = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); window.open(href, '_blank', 'noopener'); } };
        el.addEventListener('keydown', keyHandler);
        el._waKeyHandler = keyHandler;
      }
    });
  })();

  /* -------------------------
     Modal: open/close + accessibility (uses .show and aria-hidden)
     ------------------------- */
  const modal = safeQuery('#contactModal');
  const modalTitle = safeQuery('#modal-product-name');
  const modalCloseBtn = safeQuery('.close-modal');
  let lastTrigger = null;
  let scrollPos = 0;

  function lockBody() {
    scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${scrollPos}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }
  function unlockBody() {
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollPos);
  }

  function openModal(product, triggerEl = null) {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = product || '';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    lockBody();
    lastTrigger = triggerEl;
    const firstInput = modal.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    unlockBody();
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
  }

  // Attach open handlers for inquire buttons
  safeQueryAll('.open-modal, .btn-form, .btn-inquire').forEach(btn => {
    // avoid duplicate handlers
    if (btn._modalHandler) btn.removeEventListener('click', btn._modalHandler);
    const handler = function (e) {
      e.preventDefault();
      const product = this.getAttribute('data-product') || (this.closest('.product-card') && (this.closest('.product-card').querySelector('.product-title') || this.closest('.product-card').querySelector('h3'))?.textContent) || '';
      openModal(product, this);
    };
    btn.addEventListener('click', handler);
    btn._modalHandler = handler;
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function (e) { e.preventDefault(); closeModal(); });
  }

  // Close when clicking overlay
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  /* -------------------------
     Constrained Lightbox / Image zoom (preserve scroll pos)
     ------------------------- */
  function createLightbox(src, alt = '') {
    const existing = document.querySelector('.lp-lightbox');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'lp-lightbox';
    overlay.innerHTML = `
      <div class="lb-inner" role="dialog" aria-modal="true" aria-label="${alt}">
        <div class="lb-frame"><img src="" alt="${alt}" loading="eager" /></div>
        <button class="lb-close" aria-label="Close image">&times;</button>
      </div>`;
    document.body.appendChild(overlay);

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${scrollY}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    const imgEl = overlay.querySelector('.lb-frame img');
    imgEl.addEventListener('load', () => { /* no-op; CSS constrains size */ }, { once: true });
    imgEl.src = src;

    const close = () => {
      const lb = document.querySelector('.lp-lightbox');
      if (lb) lb.remove();
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', escHandler);
    };

    const closeBtn = overlay.querySelector('.lb-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });

    const escHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);
  }

  function attachImageLightbox() {
    safeQueryAll('.product-card img, .product-image-wrap img').forEach(img => {
      img.style.cursor = 'zoom-in';
      if (!img.dataset.lbAttached) {
        img.addEventListener('click', function () {
          const high = this.getAttribute('data-highres') || this.src;
          createLightbox(high, this.alt || 'Product image');
        });
        img.dataset.lbAttached = 'true';
      }
    });

    safeQueryAll('.zoom-btn').forEach(btn => {
      if (!btn.dataset.lbAttached) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const card = this.closest('.product-card') || this.closest('.product-image-wrap');
          if (!card) return;
          const img = card.querySelector('img');
          if (!img) return;
          const high = img.getAttribute('data-highres') || img.src;
          createLightbox(high, img.alt || 'Product image');
        });
        btn.dataset.lbAttached = 'true';
      }
    });
  }
  attachImageLightbox();

  /* -------------------------
     Reveal animations for product cards
     ------------------------- */
  const productCards = safeQueryAll('.product-card');
  productCards.forEach((card, i) => {
    setTimeout(() => card.classList.add('glass-animate'), 120 * (i % 6));
  });
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('glass-animate', 'glass-fade');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    productCards.forEach(el => obs.observe(el));
  } else {
    productCards.forEach(el => el.classList.add('glass-fade'));
  }

  /* -------------------------
     Footer form UX (if present)
     ------------------------- */
  const footerForm = safeQuery('#footer-newsletter-form');
  if (footerForm) {
    const input = footerForm.querySelector('input[name="phone"]');
    const submitBtn = footerForm.querySelector('.submit-btn');
    const MIN_PHONE_LEN = 7;
    let submitting = false;

    function showMessage(text, isError = false) {
      let msg = footerForm.querySelector('.form-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-msg';
        msg.setAttribute('role', 'status');
        msg.style.marginTop = '10px';
        msg.style.fontWeight = '700';
        footerForm.appendChild(msg);
      }
      msg.textContent = text;
      msg.style.color = isError ? '#ffb3b3' : '#cfcfcf';
    }

    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;

      const phone = input ? input.value.trim() : '';
      if (!phone || phone.length < MIN_PHONE_LEN) {
        showMessage('Please enter a valid mobile number', true);
        if (input) input.focus();
        return;
      }

      submitting = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      showMessage('Sending request...');

      try {
        if (window.dataLayer) window.dataLayer.push({ event: 'footer_request_quote', phone });
        if (typeof gtag === 'function') gtag('event', 'request_quote', { method: 'footer' });
      } catch (err) { /* ignore analytics errors */ }

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, source: 'footer' })
      }).then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json().catch(() => ({}));
      }).then(() => {
        showMessage('Request sent. We will contact you within 24–48 hours.');
      }).catch(() => {
        showMessage('Request queued. We will contact you shortly.');
      }).finally(() => {
        setTimeout(() => {
          submitting = false;
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Request Quote'; }
        }, 1400);
      });
    });
  }

 /* -------------------------
   Mobile nav toggle (robust replacement)
   ------------------------- */
(function mobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (!navToggle || !navList) return;

  // Prevent double initialization
  if (navToggle.__navInit) return;
  navToggle.__navInit = true;

  // Ensure aria state exists
  if (!navToggle.hasAttribute('aria-expanded')) navToggle.setAttribute('aria-expanded', 'false');

  // Helper to open/close
  function setOpen(open) {
    if (open) {
      navList.classList.add('show');
      navToggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('nav-open');
    } else {
      navList.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    }
  }

  // Toggle handler (works for click and touch)
  function onToggle(e) {
    e.stopPropagation();
    e.preventDefault();
    setOpen(!navList.classList.contains('show'));
  }

  // Close when clicking/touching outside header/nav
  function onDocClick(e) {
    if (!navList.classList.contains('show')) return;
    if (e.target.closest('.lp-header')) return;
    setOpen(false);
  }

  // Close on Escape
  function onKey(e) {
    if (e.key === 'Escape' && navList.classList.contains('show')) {
      setOpen(false);
      navToggle.focus();
    }
  }

  // Close on resize when switching to desktop
  function onResize() {
    if (window.innerWidth > 992 && navList.classList.contains('show')) {
      setOpen(false);
    }
  }

  // Remove any previous handlers we may have attached earlier
  if (navToggle._onToggle) navToggle.removeEventListener('click', navToggle._onToggle);
  if (navToggle._onToggleTouch) navToggle.removeEventListener('touchstart', navToggle._onToggleTouch);

  navToggle.addEventListener('click', onToggle, { passive: false });
  navToggle.addEventListener('touchstart', onToggle, { passive: false });
  navToggle._onToggle = onToggle;
  navToggle._onToggleTouch = onToggle;

  // Document handlers (ensure single attachment)
  if (!document._navDocHandlers) {
    document.addEventListener('click', onDocClick, { passive: true });
    document.addEventListener('touchstart', onDocClick, { passive: true });
    document.addEventListener('keydown', onKey, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document._navDocHandlers = true;
  }

  // Initialize closed
  setOpen(false);
})();


  /* -------------------------
     Sticky WhatsApp analytics + cookie offset observer
     ------------------------- */
  (function whatsappAndCookie() {
    const fixedWa = safeQuery('.fixed-wa');
    if (!fixedWa) return;

    fixedWa.addEventListener('click', function () {
      try {
        if (window.dataLayer) window.dataLayer.push({ event: 'click_whatsapp', location: 'fixed_button' });
        if (typeof gtag === 'function') gtag('event', 'click_whatsapp', { location: 'fixed_button' });
      } catch (e) { /* ignore */ }
    });

    const cookieSelectors = ['.cookie-bar', '.cookie-banner', '.site-cookie', '#cookie-consent'];
    const checkCookie = () => cookieSelectors.some(sel => document.querySelector(sel));
    if (checkCookie()) fixedWa.classList.add('with-offset');

    const observer = new MutationObserver(() => {
      fixedWa.classList.toggle('with-offset', checkCookie());
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();

  /* -------------------------
     Accessibility: ESC closes modal/lightbox
     ------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('show')) closeModal();
      const lb = document.querySelector('.lp-lightbox');
      if (lb) lb.remove(), document.body.style.position = '', document.body.style.top = '';
    }
  });

  /* -------------------------
     Re-attach dynamic elements if DOM changes
     ------------------------- */
  if ('MutationObserver' in window) {
    const mo = new MutationObserver((mutations) => {
      let reattach = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          reattach = true;
          break;
        }
      }
      if (reattach) {
        attachImageLightbox();
        // reapply WA prefill for newly added nodes
        try { (function reapply() {
          const evt = new Event('DOMContentLoaded');
          document.dispatchEvent(evt);
        })(); } catch (e) { /* ignore */ }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* -------------------------
     Cleanup stray duplicates
     ------------------------- */
  const stray = document.querySelectorAll('.lp-lightbox');
  if (stray.length > 1) stray.forEach((el, idx) => { if (idx > 0) el.remove(); });
});



// country code js start
(function () {
  'use strict';

  // Minimal but broad country list. You can extend this list if you want more entries.
  // Format: { iso: 'AE', name: 'United Arab Emirates', dial: '+971' }
  const COUNTRIES = [
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
    { iso: 'BJ', name: 'Benin', dial: '+229' },
    { iso: 'BT', name: 'Bhutan', dial: '+975' },
    { iso: 'BO', name: 'Bolivia', dial: '+591' },
    { iso: 'BA', name: 'Bosnia and Herzegovina', dial: '+387' },
    { iso: 'BW', name: 'Botswana', dial: '+267' },
    { iso: 'BR', name: 'Brazil', dial: '+55' },
    { iso: 'BN', name: 'Brunei', dial: '+673' },
    { iso: 'BG', name: 'Bulgaria', dial: '+359' },
    { iso: 'BF', name: 'Burkina Faso', dial: '+226' },
    { iso: 'KH', name: 'Cambodia', dial: '+855' },
    { iso: 'CM', name: 'Cameroon', dial: '+237' },
    { iso: 'CA', name: 'Canada', dial: '+1' },
    { iso: 'CV', name: 'Cape Verde', dial: '+238' },
    { iso: 'CF', name: 'Central African Republic', dial: '+236' },
    { iso: 'TD', name: 'Chad', dial: '+235' },
    { iso: 'CL', name: 'Chile', dial: '+56' },
    { iso: 'CN', name: 'China', dial: '+86' },
    { iso: 'CO', name: 'Colombia', dial: '+57' },
    { iso: 'KM', name: 'Comoros', dial: '+269' },
    { iso: 'CR', name: 'Costa Rica', dial: '+506' },
    { iso: 'CI', name: 'Côte d’Ivoire', dial: '+225' },
    { iso: 'HR', name: 'Croatia', dial: '+385' },
    { iso: 'CY', name: 'Cyprus', dial: '+357' },
    { iso: 'CZ', name: 'Czech Republic', dial: '+420' },
    { iso: 'DK', name: 'Denmark', dial: '+45' },
    { iso: 'DJ', name: 'Djibouti', dial: '+253' },
    { iso: 'DO', name: 'Dominican Republic', dial: '+1' },
    { iso: 'EC', name: 'Ecuador', dial: '+593' },
    { iso: 'EG', name: 'Egypt', dial: '+20' },
    { iso: 'SV', name: 'El Salvador', dial: '+503' },
    { iso: 'EE', name: 'Estonia', dial: '+372' },
    { iso: 'ET', name: 'Ethiopia', dial: '+251' },
    { iso: 'FJ', name: 'Fiji', dial: '+679' },
    { iso: 'FI', name: 'Finland', dial: '+358' },
    { iso: 'FR', name: 'France', dial: '+33' },
    { iso: 'GA', name: 'Gabon', dial: '+241' },
    { iso: 'GE', name: 'Georgia', dial: '+995' },
    { iso: 'DE', name: 'Germany', dial: '+49' },
    { iso: 'GH', name: 'Ghana', dial: '+233' },
    { iso: 'GR', name: 'Greece', dial: '+30' },
    { iso: 'GT', name: 'Guatemala', dial: '+502' },
    { iso: 'GN', name: 'Guinea', dial: '+224' },
    { iso: 'GW', name: 'Guinea-Bissau', dial: '+245' },
    { iso: 'GY', name: 'Guyana', dial: '+592' },
    { iso: 'HT', name: 'Haiti', dial: '+509' },
    { iso: 'HN', name: 'Honduras', dial: '+504' },
    { iso: 'HK', name: 'Hong Kong', dial: '+852' },
    { iso: 'HU', name: 'Hungary', dial: '+36' },
    { iso: 'IS', name: 'Iceland', dial: '+354' },
    { iso: 'IN', name: 'India', dial: '+91' },
    { iso: 'ID', name: 'Indonesia', dial: '+62' },
    { iso: 'IR', name: 'Iran', dial: '+98' },
    { iso: 'IQ', name: 'Iraq', dial: '+964' },
    { iso: 'IE', name: 'Ireland', dial: '+353' },
    { iso: 'IL', name: 'Israel', dial: '+972' },
    { iso: 'IT', name: 'Italy', dial: '+39' },
    { iso: 'JM', name: 'Jamaica', dial: '+1' },
    { iso: 'JP', name: 'Japan', dial: '+81' },
    { iso: 'JO', name: 'Jordan', dial: '+962' },
    { iso: 'KZ', name: 'Kazakhstan', dial: '+7' },
    { iso: 'KE', name: 'Kenya', dial: '+254' },
    { iso: 'KW', name: 'Kuwait', dial: '+965' },
    { iso: 'KG', name: 'Kyrgyzstan', dial: '+996' },
    { iso: 'LA', name: 'Laos', dial: '+856' },
    { iso: 'LV', name: 'Latvia', dial: '+371' },
    { iso: 'LB', name: 'Lebanon', dial: '+961' },
    { iso: 'LR', name: 'Liberia', dial: '+231' },
    { iso: 'LY', name: 'Libya', dial: '+218' },
    { iso: 'LT', name: 'Lithuania', dial: '+370' },
    { iso: 'LU', name: 'Luxembourg', dial: '+352' },
    { iso: 'MO', name: 'Macao', dial: '+853' },
    { iso: 'MK', name: 'North Macedonia', dial: '+389' },
    { iso: 'MG', name: 'Madagascar', dial: '+261' },
    { iso: 'MW', name: 'Malawi', dial: '+265' },
    { iso: 'MY', name: 'Malaysia', dial: '+60' },
    { iso: 'MV', name: 'Maldives', dial: '+960' },
    { iso: 'ML', name: 'Mali', dial: '+223' },
    { iso: 'MT', name: 'Malta', dial: '+356' },
    { iso: 'MH', name: 'Marshall Islands', dial: '+692' },
    { iso: 'MR', name: 'Mauritania', dial: '+222' },
    { iso: 'MU', name: 'Mauritius', dial: '+230' },
    { iso: 'MX', name: 'Mexico', dial: '+52' },
    { iso: 'MD', name: 'Moldova', dial: '+373' },
    { iso: 'MN', name: 'Mongolia', dial: '+976' },
    { iso: 'ME', name: 'Montenegro', dial: '+382' },
    { iso: 'MA', name: 'Morocco', dial: '+212' },
    { iso: 'MZ', name: 'Mozambique', dial: '+258' },
    { iso: 'MM', name: 'Myanmar', dial: '+95' },
    { iso: 'NA', name: 'Namibia', dial: '+264' },
    { iso: 'NP', name: 'Nepal', dial: '+977' },
    { iso: 'NL', name: 'Netherlands', dial: '+31' },
    { iso: 'NZ', name: 'New Zealand', dial: '+64' },
    { iso: 'NI', name: 'Nicaragua', dial: '+505' },
    { iso: 'NE', name: 'Niger', dial: '+227' },
    { iso: 'NG', name: 'Nigeria', dial: '+234' },
    { iso: 'KP', name: 'North Korea', dial: '+850' },
    { iso: 'NO', name: 'Norway', dial: '+47' },
    { iso: 'OM', name: 'Oman', dial: '+968' },
    { iso: 'PK', name: 'Pakistan', dial: '+92' },
    { iso: 'PS', name: 'Palestine', dial: '+970' },
    { iso: 'PA', name: 'Panama', dial: '+507' },
    { iso: 'PG', name: 'Papua New Guinea', dial: '+675' },
    { iso: 'PY', name: 'Paraguay', dial: '+595' },
    { iso: 'PE', name: 'Peru', dial: '+51' },
    { iso: 'PH', name: 'Philippines', dial: '+63' },
    { iso: 'PL', name: 'Poland', dial: '+48' },
    { iso: 'PT', name: 'Portugal', dial: '+351' },
    { iso: 'QA', name: 'Qatar', dial: '+974' },
    { iso: 'RO', name: 'Romania', dial: '+40' },
    { iso: 'RU', name: 'Russia', dial: '+7' },
    { iso: 'RW', name: 'Rwanda', dial: '+250' },
    { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { iso: 'SN', name: 'Senegal', dial: '+221' },
    { iso: 'RS', name: 'Serbia', dial: '+381' },
    { iso: 'SG', name: 'Singapore', dial: '+65' },
    { iso: 'SK', name: 'Slovakia', dial: '+421' },
    { iso: 'SI', name: 'Slovenia', dial: '+386' },
    { iso: 'ZA', name: 'South Africa', dial: '+27' },
    { iso: 'KR', name: 'South Korea', dial: '+82' },
    { iso: 'ES', name: 'Spain', dial: '+34' },
    { iso: 'LK', name: 'Sri Lanka', dial: '+94' },
    { iso: 'SD', name: 'Sudan', dial: '+249' },
    { iso: 'SE', name: 'Sweden', dial: '+46' },
    { iso: 'CH', name: 'Switzerland', dial: '+41' },
    { iso: 'SY', name: 'Syria', dial: '+963' },
    { iso: 'TW', name: 'Taiwan', dial: '+886' },
    { iso: 'TJ', name: 'Tajikistan', dial: '+992' },
    { iso: 'TZ', name: 'Tanzania', dial: '+255' },
    { iso: 'TH', name: 'Thailand', dial: '+66' },
    { iso: 'TG', name: 'Togo', dial: '+228' },
    { iso: 'TN', name: 'Tunisia', dial: '+216' },
    { iso: 'TR', name: 'Turkey', dial: '+90' },
    { iso: 'TM', name: 'Turkmenistan', dial: '+993' },
    { iso: 'UG', name: 'Uganda', dial: '+256' },
    { iso: 'UA', name: 'Ukraine', dial: '+380' },
    { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
    { iso: 'GB', name: 'United Kingdom', dial: '+44' },
    { iso: 'US', name: 'United States', dial: '+1' },
    { iso: 'UY', name: 'Uruguay', dial: '+598' },
    { iso: 'UZ', name: 'Uzbekistan', dial: '+998' },
    { iso: 'VE', name: 'Venezuela', dial: '+58' },
    { iso: 'VN', name: 'Vietnam', dial: '+84' },
    { iso: 'YE', name: 'Yemen', dial: '+967' },
    { iso: 'ZM', name: 'Zambia', dial: '+260' },
    { iso: 'ZW', name: 'Zimbabwe', dial: '+263' }
  ];

  const formSelector = '.instant-form';
  const selectEl = document.getElementById('country-select');
  const hiddenCountry = document.getElementById('country');
  const prefixEl = document.getElementById('phone-prefix');
  const phoneInput = document.getElementById('phone');

  // Populate dropdown
  function populateCountries() {
    // Sort alphabetically by name
    COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
    COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.iso;
      opt.dataset.dial = c.dial;
      opt.textContent = `${c.name} (${c.dial})`;
      selectEl.appendChild(opt);
    });
  }

  // Detect country from browser locale (best-effort)
  function detectCountryFromLocale() {
    try {
      const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale : navigator.language || '';
      if (!locale) return '';
      const parts = locale.split(/[-_]/);
      if (parts.length > 1) return parts[1].toUpperCase();
    } catch (e) { /* ignore */ }
    return '';
  }

  // Fallback: detect country via IP (optional). Uses ipapi.co public endpoint.
  // If you prefer not to call external services, this step is optional.
  function detectCountryByIP() {
    return fetch('https://ipapi.co/json/')
      .then(resp => resp.ok ? resp.json() : Promise.reject())
      .then(data => (data && data.country) ? data.country.toUpperCase() : '')
      .catch(() => '');
  }

  // Set prefix and hidden country
  function setCountrySelection(iso) {
    if (!iso) return;
    const opt = selectEl.querySelector(`option[value="${iso}"]`);
    if (opt) {
      selectEl.value = iso;
      const dial = opt.dataset.dial || '';
      prefixEl.value = dial || '';
      hiddenCountry.value = iso;
      // update phone placeholder to show example
      phoneInput.placeholder = (dial ? `${dial} 5xxxxxxx` : 'Phone Number');
    }
  }

  // Normalize phone: keep leading + if present, else add selected dial
  function normalizePhoneValue(raw) {
    if (!raw) return '';
    raw = String(raw).trim();
    // If already has +, keep + and strip non-digits after it
    if (raw.startsWith('+')) {
      return '+' + raw.slice(1).replace(/\D+/g, '');
    }
    // remove non-digits
    const digits = raw.replace(/\D+/g, '');
    const iso = selectEl.value;
    const opt = selectEl.querySelector(`option[value="${iso}"]`);
    const dial = opt ? (opt.dataset.dial || '') : '';
    if (dial) {
      // strip leading + from dial and any leading 0 from digits
      const dialDigits = dial.replace(/\D+/g, '');
      const stripped = digits.replace(/^0+/, '');
      return '+' + dialDigits + stripped;
    }
    return digits;
  }

  // Event handlers
  function attachHandlers() {
    // When user changes country manually
    selectEl.addEventListener('change', function () {
      const iso = this.value;
      const dial = this.selectedOptions[0] ? this.selectedOptions[0].dataset.dial : '';
      prefixEl.value = dial || '';
      hiddenCountry.value = iso || '';
    });

    // On blur of phone, normalize and ensure prefix is present
    phoneInput.addEventListener('blur', function () {
      const normalized = normalizePhoneValue(this.value || '');
      if (normalized) this.value = normalized;
    });

    // On form submit, normalize phone and ensure hidden country is set
    const forms = document.querySelectorAll(formSelector);
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        // normalize phone
        phoneInput.value = normalizePhoneValue(phoneInput.value || '');
        // ensure hidden country is set (if not, set from select)
        if (!hiddenCountry.value && selectEl.value) hiddenCountry.value = selectEl.value;
        // basic validation
        const digitsOnly = phoneInput.value.replace(/\D+/g, '');
        if (!digitsOnly || digitsOnly.length < 6) {
          e.preventDefault();
          const msg = form.querySelector('.form-msg');
          if (msg) {
            msg.textContent = 'Please enter a valid phone number including country code.';
            msg.style.color = '#ffb3b3';
          } else {
            alert('Please enter a valid phone number including country code.');
          }
          phoneInput.focus();
        }
      }, { passive: false });
    });
  }

  // Initialize: populate, detect, set selection
  function init() {
    if (!selectEl || !phoneInput || !prefixEl || !hiddenCountry) return;
    populateCountries();

    // Try browser locale first
    const localeIso = detectCountryFromLocale();
    if (localeIso) {
      setCountrySelection(localeIso);
      attachHandlers();
      // still attempt IP fallback in background to correct if needed
      detectCountryByIP().then(ipIso => {
        if (ipIso && ipIso !== localeIso) setCountrySelection(ipIso);
      });
      return;
    }

    // If no locale, try IP geolocation
    detectCountryByIP().then(ipIso => {
      if (ipIso) {
        setCountrySelection(ipIso);
      } else {
        // default to United Arab Emirates if you prefer, or leave blank
        setCountrySelection('AE');
      }
      attachHandlers();
    }).catch(() => {
      setCountrySelection('AE');
      attachHandlers();
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();




// modal form phone number country code handling

(function () {
  'use strict';

  // Fallback country list (extend as needed)
  const FALLBACK_COUNTRIES = [
    { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
    { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { iso: 'IN', name: 'India', dial: '+91' },
    { iso: 'GB', name: 'United Kingdom', dial: '+44' },
    { iso: 'US', name: 'United States', dial: '+1' }
  ];

  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('contactModalClose');
  const form = document.getElementById('modal-quote-form');
  const select = document.getElementById('modal-country-select');
  const hiddenCountry = document.getElementById('modal-country');
  const prefix = document.getElementById('modal-phone-prefix');
  const phoneInput = document.getElementById('modal-phone');
  const msgEl = form.querySelector('.form-msg');

  // Try to clone main page country-select if present
  function cloneMainCountryOptions() {
    const mainSelect = document.getElementById('country-select');
    if (mainSelect && mainSelect.options && mainSelect.options.length > 1) {
      select.innerHTML = '';
      Array.from(mainSelect.options).forEach(opt => {
        const newOpt = document.createElement('option');
        newOpt.value = opt.value;
        newOpt.textContent = opt.textContent;
        if (opt.dataset && opt.dataset.dial) newOpt.dataset.dial = opt.dataset.dial;
        select.appendChild(newOpt);
      });
      return true;
    }
    return false;
  }

  // Populate fallback list
  function populateFallback() {
    select.innerHTML = '<option value="">Select country</option>';
    FALLBACK_COUNTRIES.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.iso;
      opt.dataset.dial = c.dial;
      opt.textContent = `${c.name} (${c.dial})`;
      select.appendChild(opt);
    });
  }

  // Detect browser locale country (best-effort)
  function detectCountryFromLocale() {
    try {
      const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale : navigator.language || '';
      if (!locale) return '';
      const parts = locale.split(/[-_]/);
      if (parts.length > 1) return parts[1].toUpperCase();
    } catch (e) {}
    return '';
  }

  // Set selection and prefix
  function setSelection(sel, iso) {
    if (!iso) return;
    const opt = sel.querySelector(`option[value="${iso}"]`);
    if (opt) {
      sel.value = iso;
      const dial = opt.dataset.dial || '';
      prefix.value = dial || '';
      hiddenCountry.value = iso;
      phoneInput.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
    }
  }

  // Normalize phone (client-side mirror of server logic)
  function normalizePhone(raw, countryHint) {
    if (!raw) return '';
    raw = String(raw).trim();
    if (raw.startsWith('+')) {
      return '+' + raw.slice(1).replace(/\D+/g, '');
    }
    const digits = raw.replace(/\D+/g, '');
    const hint = (countryHint || '').toUpperCase();

    // UAE
    if (hint === 'AE' || /^0?5\d{7,}$/.test(digits) || /^971\d{6,}$/.test(digits)) {
      if (/^971\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+971' + stripped;
    }
    // Saudi
    if (hint === 'SA' || /^0?5\d{7,}$/.test(digits) || /^966\d{6,}$/.test(digits)) {
      if (/^966\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+966' + stripped;
    }
    // India
    if (hint === 'IN' || /^0?9\d{9,}$/.test(digits) || /^91\d{8,}$/.test(digits)) {
      if (/^91\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+91' + stripped;
    }
    // fallback: use selected option dial if available
    const selOpt = select.querySelector(`option[value="${select.value}"]`);
    if (selOpt && selOpt.dataset.dial) {
      const dialDigits = selOpt.dataset.dial.replace(/\D+/g, '');
      const stripped = digits.replace(/^0+/, '');
      return '+' + dialDigits + stripped;
    }
    return digits;
  }

  // Handlers
  function attachHandlers() {
    // when user changes country manually
    select.addEventListener('change', function () {
      const iso = this.value;
      const dial = this.selectedOptions[0] ? this.selectedOptions[0].dataset.dial : '';
      prefix.value = dial || '';
      hiddenCountry.value = iso || '';
    });

    // normalize on blur
    phoneInput.addEventListener('blur', function () {
      const normalized = normalizePhone(this.value || '', select.value || hiddenCountry.value);
      if (normalized) this.value = normalized;
    });

    // form submit: normalize phone and basic validation
    form.addEventListener('submit', function (e) {
      msgEl.textContent = '';
      phoneInput.value = normalizePhone(phoneInput.value || '', select.value || hiddenCountry.value);
      if (!form.name.value.trim() || !form.email.value.trim() || !phoneInput.value.trim()) {
        e.preventDefault();
        msgEl.textContent = 'Please provide name, valid email and phone.';
        msgEl.style.color = '#ffdede';
        return;
      }
      if (!hiddenCountry.value && select.value) hiddenCountry.value = select.value;
      // allow normal submit to send to send-mail.php
    });
  }

  // Modal open/close helpers
  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    setTimeout(() => {
      const nameEl = document.getElementById('modal-name');
      if (nameEl) nameEl.focus();
    }, 120);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
  }

  // Wire close button and overlay click
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (ev) {
      if (ev.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  // Initialize
  (function init() {
    const cloned = cloneMainCountryOptions();
    if (!cloned) populateFallback();

    // Try locale auto-select, else default to AE
    const localeIso = detectCountryFromLocale();
    if (localeIso) setSelection(select, localeIso);
    else setSelection(select, 'AE');

    attachHandlers();

    // Expose open/close for other scripts if needed
    window.openContactModal = openModal;
    window.closeContactModal = closeModal;
  })();

})();






/* modal-country-full.js
   Populates modal country select with a full country list (ISO, name, dial),
   syncs prefix, auto-selects by locale, normalizes phone on blur/submit,
   and clones main page country-select if present.
*/

(function () {
  'use strict';

  // Full country list (ISO, name, dial). Extend or modify if needed.
  const COUNTRIES = [
    { iso: 'AF', name: 'Afghanistan', dial: '+93' },
    { iso: 'AL', name: 'Albania', dial: '+355' },
    { iso: 'DZ', name: 'Algeria', dial: '+213' },
    { iso: 'AS', name: 'American Samoa', dial: '+1' },
    { iso: 'AD', name: 'Andorra', dial: '+376' },
    { iso: 'AO', name: 'Angola', dial: '+244' },
    { iso: 'AI', name: 'Anguilla', dial: '+1' },
    { iso: 'AQ', name: 'Antarctica', dial: '+672' },
    { iso: 'AG', name: 'Antigua and Barbuda', dial: '+1' },
    { iso: 'AR', name: 'Argentina', dial: '+54' },
    { iso: 'AM', name: 'Armenia', dial: '+374' },
    { iso: 'AW', name: 'Aruba', dial: '+297' },
    { iso: 'AU', name: 'Australia', dial: '+61' },
    { iso: 'AT', name: 'Austria', dial: '+43' },
    { iso: 'AZ', name: 'Azerbaijan', dial: '+994' },
    { iso: 'BS', name: 'Bahamas', dial: '+1' },
    { iso: 'BH', name: 'Bahrain', dial: '+973' },
    { iso: 'BD', name: 'Bangladesh', dial: '+880' },
    { iso: 'BB', name: 'Barbados', dial: '+1' },
    { iso: 'BY', name: 'Belarus', dial: '+375' },
    { iso: 'BE', name: 'Belgium', dial: '+32' },
    { iso: 'BZ', name: 'Belize', dial: '+501' },
    { iso: 'BJ', name: 'Benin', dial: '+229' },
    { iso: 'BM', name: 'Bermuda', dial: '+1' },
    { iso: 'BT', name: 'Bhutan', dial: '+975' },
    { iso: 'BO', name: 'Bolivia', dial: '+591' },
    { iso: 'BA', name: 'Bosnia and Herzegovina', dial: '+387' },
    { iso: 'BW', name: 'Botswana', dial: '+267' },
    { iso: 'BR', name: 'Brazil', dial: '+55' },
    { iso: 'IO', name: 'British Indian Ocean Territory', dial: '+246' },
    { iso: 'VG', name: 'British Virgin Islands', dial: '+1' },
    { iso: 'BN', name: 'Brunei', dial: '+673' },
    { iso: 'BG', name: 'Bulgaria', dial: '+359' },
    { iso: 'BF', name: 'Burkina Faso', dial: '+226' },
    { iso: 'BI', name: 'Burundi', dial: '+257' },
    { iso: 'KH', name: 'Cambodia', dial: '+855' },
    { iso: 'CM', name: 'Cameroon', dial: '+237' },
    { iso: 'CA', name: 'Canada', dial: '+1' },
    { iso: 'CV', name: 'Cape Verde', dial: '+238' },
    { iso: 'KY', name: 'Cayman Islands', dial: '+1' },
    { iso: 'CF', name: 'Central African Republic', dial: '+236' },
    { iso: 'TD', name: 'Chad', dial: '+235' },
    { iso: 'CL', name: 'Chile', dial: '+56' },
    { iso: 'CN', name: 'China', dial: '+86' },
    { iso: 'CX', name: 'Christmas Island', dial: '+61' },
    { iso: 'CC', name: 'Cocos (Keeling) Islands', dial: '+61' },
    { iso: 'CO', name: 'Colombia', dial: '+57' },
    { iso: 'KM', name: 'Comoros', dial: '+269' },
    { iso: 'CK', name: 'Cook Islands', dial: '+682' },
    { iso: 'CR', name: 'Costa Rica', dial: '+506' },
    { iso: 'CI', name: 'Côte d’Ivoire', dial: '+225' },
    { iso: 'HR', name: 'Croatia', dial: '+385' },
    { iso: 'CU', name: 'Cuba', dial: '+53' },
    { iso: 'CW', name: 'Curaçao', dial: '+599' },
    { iso: 'CY', name: 'Cyprus', dial: '+357' },
    { iso: 'CZ', name: 'Czech Republic', dial: '+420' },
    { iso: 'CD', name: 'Democratic Republic of the Congo', dial: '+243' },
    { iso: 'DK', name: 'Denmark', dial: '+45' },
    { iso: 'DJ', name: 'Djibouti', dial: '+253' },
    { iso: 'DM', name: 'Dominica', dial: '+1' },
    { iso: 'DO', name: 'Dominican Republic', dial: '+1' },
    { iso: 'EC', name: 'Ecuador', dial: '+593' },
    { iso: 'EG', name: 'Egypt', dial: '+20' },
    { iso: 'SV', name: 'El Salvador', dial: '+503' },
    { iso: 'GQ', name: 'Equatorial Guinea', dial: '+240' },
    { iso: 'ER', name: 'Eritrea', dial: '+291' },
    { iso: 'EE', name: 'Estonia', dial: '+372' },
    { iso: 'ET', name: 'Ethiopia', dial: '+251' },
    { iso: 'FK', name: 'Falkland Islands', dial: '+500' },
    { iso: 'FO', name: 'Faroe Islands', dial: '+298' },
    { iso: 'FJ', name: 'Fiji', dial: '+679' },
    { iso: 'FI', name: 'Finland', dial: '+358' },
    { iso: 'FR', name: 'France', dial: '+33' },
    { iso: 'PF', name: 'French Polynesia', dial: '+689' },
    { iso: 'GA', name: 'Gabon', dial: '+241' },
    { iso: 'GM', name: 'Gambia', dial: '+220' },
    { iso: 'GE', name: 'Georgia', dial: '+995' },
    { iso: 'DE', name: 'Germany', dial: '+49' },
    { iso: 'GH', name: 'Ghana', dial: '+233' },
    { iso: 'GI', name: 'Gibraltar', dial: '+350' },
    { iso: 'GR', name: 'Greece', dial: '+30' },
    { iso: 'GL', name: 'Greenland', dial: '+299' },
    { iso: 'GD', name: 'Grenada', dial: '+1' },
    { iso: 'GU', name: 'Guam', dial: '+1' },
    { iso: 'GT', name: 'Guatemala', dial: '+502' },
    { iso: 'GG', name: 'Guernsey', dial: '+44' },
    { iso: 'GN', name: 'Guinea', dial: '+224' },
    { iso: 'GW', name: 'Guinea-Bissau', dial: '+245' },
    { iso: 'GY', name: 'Guyana', dial: '+592' },
    { iso: 'HT', name: 'Haiti', dial: '+509' },
    { iso: 'HN', name: 'Honduras', dial: '+504' },
    { iso: 'HK', name: 'Hong Kong', dial: '+852' },
    { iso: 'HU', name: 'Hungary', dial: '+36' },
    { iso: 'IS', name: 'Iceland', dial: '+354' },
    { iso: 'IN', name: 'India', dial: '+91' },
    { iso: 'ID', name: 'Indonesia', dial: '+62' },
    { iso: 'IR', name: 'Iran', dial: '+98' },
    { iso: 'IQ', name: 'Iraq', dial: '+964' },
    { iso: 'IE', name: 'Ireland', dial: '+353' },
    { iso: 'IM', name: 'Isle of Man', dial: '+44' },
    { iso: 'IL', name: 'Israel', dial: '+972' },
    { iso: 'IT', name: 'Italy', dial: '+39' },
    { iso: 'JM', name: 'Jamaica', dial: '+1' },
    { iso: 'JP', name: 'Japan', dial: '+81' },
    { iso: 'JE', name: 'Jersey', dial: '+44' },
    { iso: 'JO', name: 'Jordan', dial: '+962' },
    { iso: 'KZ', name: 'Kazakhstan', dial: '+7' },
    { iso: 'KE', name: 'Kenya', dial: '+254' },
    { iso: 'KI', name: 'Kiribati', dial: '+686' },
    { iso: 'XK', name: 'Kosovo', dial: '+383' },
    { iso: 'KW', name: 'Kuwait', dial: '+965' },
    { iso: 'KG', name: 'Kyrgyzstan', dial: '+996' },
    { iso: 'LA', name: 'Laos', dial: '+856' },
    { iso: 'LV', name: 'Latvia', dial: '+371' },
    { iso: 'LB', name: 'Lebanon', dial: '+961' },
    { iso: 'LS', name: 'Lesotho', dial: '+266' },
    { iso: 'LR', name: 'Liberia', dial: '+231' },
    { iso: 'LY', name: 'Libya', dial: '+218' },
    { iso: 'LI', name: 'Liechtenstein', dial: '+423' },
    { iso: 'LT', name: 'Lithuania', dial: '+370' },
    { iso: 'LU', name: 'Luxembourg', dial: '+352' },
    { iso: 'MO', name: 'Macao', dial: '+853' },
    { iso: 'MK', name: 'North Macedonia', dial: '+389' },
    { iso: 'MG', name: 'Madagascar', dial: '+261' },
    { iso: 'MW', name: 'Malawi', dial: '+265' },
    { iso: 'MY', name: 'Malaysia', dial: '+60' },
    { iso: 'MV', name: 'Maldives', dial: '+960' },
    { iso: 'ML', name: 'Mali', dial: '+223' },
    { iso: 'MT', name: 'Malta', dial: '+356' },
    { iso: 'MH', name: 'Marshall Islands', dial: '+692' },
    { iso: 'MQ', name: 'Martinique', dial: '+596' },
    { iso: 'MR', name: 'Mauritania', dial: '+222' },
    { iso: 'MU', name: 'Mauritius', dial: '+230' },
    { iso: 'YT', name: 'Mayotte', dial: '+262' },
    { iso: 'MX', name: 'Mexico', dial: '+52' },
    { iso: 'FM', name: 'Micronesia', dial: '+691' },
    { iso: 'MD', name: 'Moldova', dial: '+373' },
    { iso: 'MC', name: 'Monaco', dial: '+377' },
    { iso: 'MN', name: 'Mongolia', dial: '+976' },
    { iso: 'ME', name: 'Montenegro', dial: '+382' },
    { iso: 'MS', name: 'Montserrat', dial: '+1' },
    { iso: 'MA', name: 'Morocco', dial: '+212' },
    { iso: 'MZ', name: 'Mozambique', dial: '+258' },
    { iso: 'MM', name: 'Myanmar', dial: '+95' },
    { iso: 'NA', name: 'Namibia', dial: '+264' },
    { iso: 'NR', name: 'Nauru', dial: '+674' },
    { iso: 'NP', name: 'Nepal', dial: '+977' },
    { iso: 'NL', name: 'Netherlands', dial: '+31' },
    { iso: 'NC', name: 'New Caledonia', dial: '+687' },
    { iso: 'NZ', name: 'New Zealand', dial: '+64' },
    { iso: 'NI', name: 'Nicaragua', dial: '+505' },
    { iso: 'NE', name: 'Niger', dial: '+227' },
    { iso: 'NG', name: 'Nigeria', dial: '+234' },
    { iso: 'NU', name: 'Niue', dial: '+683' },
    { iso: 'KP', name: 'North Korea', dial: '+850' },
    { iso: 'MP', name: 'Northern Mariana Islands', dial: '+1' },
    { iso: 'NO', name: 'Norway', dial: '+47' },
    { iso: 'OM', name: 'Oman', dial: '+968' },
    { iso: 'PK', name: 'Pakistan', dial: '+92' },
    { iso: 'PW', name: 'Palau', dial: '+680' },
    { iso: 'PS', name: 'Palestine', dial: '+970' },
    { iso: 'PA', name: 'Panama', dial: '+507' },
    { iso: 'PG', name: 'Papua New Guinea', dial: '+675' },
    { iso: 'PY', name: 'Paraguay', dial: '+595' },
    { iso: 'PE', name: 'Peru', dial: '+51' },
    { iso: 'PH', name: 'Philippines', dial: '+63' },
    { iso: 'PL', name: 'Poland', dial: '+48' },
    { iso: 'PT', name: 'Portugal', dial: '+351' },
    { iso: 'PR', name: 'Puerto Rico', dial: '+1' },
    { iso: 'QA', name: 'Qatar', dial: '+974' },
    { iso: 'RE', name: 'Réunion', dial: '+262' },
    { iso: 'RO', name: 'Romania', dial: '+40' },
    { iso: 'RU', name: 'Russia', dial: '+7' },
    { iso: 'RW', name: 'Rwanda', dial: '+250' },
    { iso: 'BL', name: 'Saint Barthélemy', dial: '+590' },
    { iso: 'KN', name: 'Saint Kitts and Nevis', dial: '+1' },
    { iso: 'LC', name: 'Saint Lucia', dial: '+1' },
    { iso: 'MF', name: 'Saint Martin', dial: '+590' },
    { iso: 'VC', name: 'Saint Vincent and the Grenadines', dial: '+1' },
    { iso: 'WS', name: 'Samoa', dial: '+685' },
    { iso: 'SM', name: 'San Marino', dial: '+378' },
    { iso: 'ST', name: 'Sao Tome and Principe', dial: '+239' },
    { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { iso: 'SN', name: 'Senegal', dial: '+221' },
    { iso: 'RS', name: 'Serbia', dial: '+381' },
    { iso: 'SC', name: 'Seychelles', dial: '+248' },
    { iso: 'SL', name: 'Sierra Leone', dial: '+232' },
    { iso: 'SG', name: 'Singapore', dial: '+65' },
    { iso: 'SX', name: 'Sint Maarten', dial: '+1' },
    { iso: 'SK', name: 'Slovakia', dial: '+421' },
    { iso: 'SI', name: 'Slovenia', dial: '+386' },
    { iso: 'SB', name: 'Solomon Islands', dial: '+677' },
    { iso: 'SO', name: 'Somalia', dial: '+252' },
    { iso: 'ZA', name: 'South Africa', dial: '+27' },
    { iso: 'KR', name: 'South Korea', dial: '+82' },
    { iso: 'SS', name: 'South Sudan', dial: '+211' },
    { iso: 'ES', name: 'Spain', dial: '+34' },
    { iso: 'LK', name: 'Sri Lanka', dial: '+94' },
    { iso: 'SD', name: 'Sudan', dial: '+249' },
    { iso: 'SR', name: 'Suriname', dial: '+597' },
    { iso: 'SE', name: 'Sweden', dial: '+46' },
    { iso: 'CH', name: 'Switzerland', dial: '+41' },
    { iso: 'SY', name: 'Syria', dial: '+963' },
    { iso: 'TW', name: 'Taiwan', dial: '+886' },
    { iso: 'TJ', name: 'Tajikistan', dial: '+992' },
    { iso: 'TZ', name: 'Tanzania', dial: '+255' },
    { iso: 'TH', name: 'Thailand', dial: '+66' },
    { iso: 'TL', name: 'Timor-Leste', dial: '+670' },
    { iso: 'TG', name: 'Togo', dial: '+228' },
    { iso: 'TO', name: 'Tonga', dial: '+676' },
    { iso: 'TT', name: 'Trinidad and Tobago', dial: '+1' },
    { iso: 'TN', name: 'Tunisia', dial: '+216' },
    { iso: 'TR', name: 'Turkey', dial: '+90' },
    { iso: 'TM', name: 'Turkmenistan', dial: '+993' },
    { iso: 'TC', name: 'Turks and Caicos Islands', dial: '+1' },
    { iso: 'TV', name: 'Tuvalu', dial: '+688' },
    { iso: 'UG', name: 'Uganda', dial: '+256' },
    { iso: 'UA', name: 'Ukraine', dial: '+380' },
    { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
    { iso: 'GB', name: 'United Kingdom', dial: '+44' },
    { iso: 'US', name: 'United States', dial: '+1' },
    { iso: 'UY', name: 'Uruguay', dial: '+598' },
    { iso: 'UZ', name: 'Uzbekistan', dial: '+998' },
    { iso: 'VU', name: 'Vanuatu', dial: '+678' },
    { iso: 'VA', name: 'Vatican City', dial: '+379' },
    { iso: 'VE', name: 'Venezuela', dial: '+58' },
    { iso: 'VN', name: 'Vietnam', dial: '+84' },
    { iso: 'WF', name: 'Wallis and Futuna', dial: '+681' },
    { iso: 'YE', name: 'Yemen', dial: '+967' },
    { iso: 'ZM', name: 'Zambia', dial: '+260' },
    { iso: 'ZW', name: 'Zimbabwe', dial: '+263' }
  ];

  // Elements
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('contactModalClose');
  const form = document.getElementById('modal-quote-form');
  const select = document.getElementById('modal-country-select');
  const hiddenCountry = document.getElementById('modal-country');
  const prefix = document.getElementById('modal-phone-prefix');
  const phoneInput = document.getElementById('modal-phone');
  const msgEl = form.querySelector('.form-msg');

  // Populate select with full list (sorted)
  function populateFullList(sel) {
    sel.innerHTML = '<option value="">Select country</option>';
    const sorted = COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.iso;
      opt.dataset.dial = c.dial;
      opt.textContent = `${c.name} (${c.dial})`;
      sel.appendChild(opt);
    });
  }

  // If main page has a country-select, clone its options to keep lists identical
  function cloneMainCountryOptions() {
    const mainSelect = document.getElementById('country-select');
    if (mainSelect && mainSelect.options && mainSelect.options.length > 1) {
      select.innerHTML = '';
      Array.from(mainSelect.options).forEach(opt => {
        const newOpt = document.createElement('option');
        newOpt.value = opt.value;
        newOpt.textContent = opt.textContent;
        if (opt.dataset && opt.dataset.dial) newOpt.dataset.dial = opt.dataset.dial;
        select.appendChild(newOpt);
      });
      return true;
    }
    return false;
  }

  // Detect country from browser locale (best-effort)
  function detectCountryFromLocale() {
    try {
      const locale = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().locale : navigator.language || '';
      if (!locale) return '';
      const parts = locale.split(/[-_]/);
      if (parts.length > 1) return parts[1].toUpperCase();
    } catch (e) {}
    return '';
  }

  // Set selection and prefix
  function setSelection(sel, iso) {
    if (!iso) return;
    const opt = sel.querySelector(`option[value="${iso}"]`);
    if (opt) {
      sel.value = iso;
      const dial = opt.dataset.dial || '';
      prefix.value = dial || '';
      hiddenCountry.value = iso;
      phoneInput.placeholder = dial ? `${dial} 5xxxxxxx` : 'Phone Number';
    }
  }

  // Normalize phone (client-side mirror of server logic)
  function normalizePhone(raw, countryHint) {
    if (!raw) return '';
    raw = String(raw).trim();
    if (raw.startsWith('+')) {
      return '+' + raw.slice(1).replace(/\D+/g, '');
    }
    const digits = raw.replace(/\D+/g, '');
    const hint = (countryHint || '').toUpperCase();

    // UAE
    if (hint === 'AE' || /^0?5\d{7,}$/.test(digits) || /^971\d{6,}$/.test(digits)) {
      if (/^971\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+971' + stripped;
    }
    // Saudi
    if (hint === 'SA' || /^0?5\d{7,}$/.test(digits) || /^966\d{6,}$/.test(digits)) {
      if (/^966\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+966' + stripped;
    }
    // India
    if (hint === 'IN' || /^0?9\d{9,}$/.test(digits) || /^91\d{8,}$/.test(digits)) {
      if (/^91\d+$/.test(digits)) return '+' + digits;
      const stripped = digits.replace(/^0/, '');
      return '+91' + stripped;
    }
    // fallback: use selected option dial if available
    const selOpt = select.querySelector(`option[value="${select.value}"]`);
    if (selOpt && selOpt.dataset.dial) {
      const dialDigits = selOpt.dataset.dial.replace(/\D+/g, '');
      const stripped = digits.replace(/^0+/, '');
      return '+' + dialDigits + stripped;
    }
    return digits;
  }

  // Attach handlers
  function attachHandlers() {
    // when user changes country manually
    select.addEventListener('change', function () {
      const iso = this.value;
      const dial = this.selectedOptions[0] ? this.selectedOptions[0].dataset.dial : '';
      prefix.value = dial || '';
      hiddenCountry.value = iso || '';
    });

    // normalize on blur
    phoneInput.addEventListener('blur', function () {
      const normalized = normalizePhone(this.value || '', select.value || hiddenCountry.value);
      if (normalized) this.value = normalized;
    });

    // form submit: normalize phone and basic validation
    form.addEventListener('submit', function (e) {
      msgEl.textContent = '';
      phoneInput.value = normalizePhone(phoneInput.value || '', select.value || hiddenCountry.value);
      if (!form.name.value.trim() || !form.email.value.trim() || !phoneInput.value.trim()) {
        e.preventDefault();
        msgEl.textContent = 'Please provide name, valid email and phone.';
        msgEl.style.color = '#ffdede';
        return;
      }
      if (!hiddenCountry.value && select.value) hiddenCountry.value = select.value;
      // allow normal submit to send to send-mail.php
    });
  }

  // Modal open/close helpers
  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    setTimeout(() => {
      const nameEl = document.getElementById('modal-name');
      if (nameEl) nameEl.focus();
    }, 120);
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
  }

  // Wire close button and overlay click
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (ev) {
      if (ev.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  // Initialize
  (function init() {
    const cloned = cloneMainCountryOptions();
    if (!cloned) populateFullList(select);

    // Try locale auto-select, else default to AE
    const localeIso = detectCountryFromLocale();
    if (localeIso) setSelection(select, localeIso);
    else setSelection(select, 'AE');

    attachHandlers();

    // Expose open/close for other scripts if needed
    window.openContactModal = openModal;
    window.closeContactModal = closeModal;
  })();

})();





/* -------------------------
   Modal form submit robustness patch
   - Normalize phone, set hidden country
   - Run in capture phase so it executes before other handlers
   - If another handler prevents submit, fallback to programmatic submit once
   ------------------------- */
(function () {
  'use strict';

  // Helper: normalize phone similar to your existing logic
  function _normalizePhoneForModal(raw, selectEl) {
    if (!raw) return '';
    raw = String(raw).trim();
    if (raw.startsWith('+')) {
      return '+' + raw.slice(1).replace(/\D+/g, '');
    }
    const digits = raw.replace(/\D+/g, '');
    const iso = selectEl ? selectEl.value : '';
    const opt = selectEl ? selectEl.querySelector(`option[value="${iso}"]`) : null;
    const dial = opt ? (opt.dataset.dial || '') : '';
    if (dial) {
      const dialDigits = dial.replace(/\D+/g, '');
      const stripped = digits.replace(/^0+/, '');
      return '+' + dialDigits + stripped;
    }
    return digits;
  }

  // Elements
  const modalForm = document.getElementById('modal-quote-form');
  if (!modalForm) return;

  const modalPhone = document.getElementById('modal-phone');
  const modalSelect = document.getElementById('modal-country-select');
  const modalHidden = document.getElementById('modal-country');

  // Flag to avoid infinite recursion when we call form.submit()
  let bypassSubmitFlag = false;

  // 1) Capture-phase handler: normalize values before other handlers run
  modalForm.addEventListener('submit', function (ev) {
    try {
      // If this is our programmatic submit, skip normalization (already done)
      if (bypassSubmitFlag) return;

      // Normalize phone
      if (modalPhone) {
        const normalized = _normalizePhoneForModal(modalPhone.value || '', modalSelect);
        if (normalized) modalPhone.value = normalized;
      }

      // Ensure hidden country ISO is set
      if (modalHidden && modalSelect && !modalHidden.value) {
        modalHidden.value = modalSelect.value || '';
      }

      // Optional: quick console debug
      console.log('modal-form: normalized before submit', {
        name: modalForm.querySelector('[name="name"]')?.value || '',
        email: modalForm.querySelector('[name="email"]')?.value || '',
        phone: modalPhone ? modalPhone.value : '',
        country: modalHidden ? modalHidden.value : ''
      });

      // Let other handlers run normally (do not call preventDefault here)
    } catch (err) {
      // If anything goes wrong, log and allow submit to proceed
      console.error('modal-form: normalization error', err);
    }
  }, true); // capture = true

  // 2) Bubble-phase handler: detect if another handler prevented submit and fallback
  modalForm.addEventListener('submit', function (ev) {
    try {
      // If this submit was already triggered by our fallback, reset flag and allow
      if (bypassSubmitFlag) {
        bypassSubmitFlag = false;
        return;
      }

      // If some other handler called preventDefault(), defaultPrevented will be true
      if (ev.defaultPrevented) {
        // Stop other bubble handlers from running again
        ev.stopImmediatePropagation();

        // Programmatic submit bypassing other submit handlers
        // Set flag so capture handler knows this is a bypass submit
        bypassSubmitFlag = true;

        // Small delay to ensure current event stack unwinds
        setTimeout(() => {
          try {
            // Use form.submit() to bypass submit event handlers
            modalForm.submit();
          } catch (err) {
            console.error('modal-form: fallback submit failed', err);
            // As a last resort, show a message in the form
            const msg = modalForm.querySelector('.form-msg');
            if (msg) {
              msg.textContent = 'Unable to submit automatically. Please try again or contact support.';
              msg.style.color = '#ffdede';
            }
          } finally {
            // Reset flag after a short delay in case something else happens
            setTimeout(() => { bypassSubmitFlag = false; }, 500);
          }
        }, 12);
      }
    } catch (err) {
      console.error('modal-form: submit fallback error', err);
    }
  }, false); // bubble

  // 3) Safety: if modal select exists, ensure it has a change handler to set hidden country
  if (modalSelect && modalHidden) {
    modalSelect.addEventListener('change', function () {
      try {
        modalHidden.value = this.value || '';
      } catch (e) { /* ignore */ }
    });
  }

  // 4) Extra debug helper: log JS errors during submit attempts
  window.addEventListener('error', function (e) {
    console.error('Global JS error:', e.message, e.filename, e.lineno);
  });

})();

/**
 * LIZART SHOP — Mobile Navigation, Header & High-Performance Smooth Scroll
 */

// 1. Instant lag-free smooth scroll (preempts any slow/buggy Tilda scripts)
document.addEventListener('click', function (e) {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href === '#' || href.startsWith('#!')) return;

  const targetId = href.slice(1);
  const targetEl = document.getElementById(targetId) || 
                   document.querySelector(`a[name="${targetId}"]`) ||
                   document.querySelector(href);

  if (targetEl) {
    e.preventDefault();
    e.stopPropagation();

    const siteHeader = document.querySelector('.site-header');
    const headerHeight = siteHeader ? siteHeader.offsetHeight : 72;
    const targetRect = targetEl.getBoundingClientRect();
    const targetTop = targetRect.top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: 'smooth'
    });

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  }
}, true); // useCapture: true ensures instant execution without Tilda delays

// 2. Mobile Drawer Navigation & Interactions
document.addEventListener('DOMContentLoaded', function () {
  const burgerBtn = document.querySelector('.site-header__burger');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const siteHeader = document.querySelector('.site-header');

  if (burgerBtn && mobileDrawer) {
    function openMenu() {
      burgerBtn.classList.add('is-active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      mobileDrawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      burgerBtn.classList.remove('is-active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    burgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mobileDrawer.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close button inside mobile drawer
    const closeBtn = mobileDrawer.querySelector('.mobile-nav-drawer__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeMenu();
      });
    }

    // Close drawer when clicking any link inside it
    const drawerLinks = mobileDrawer.querySelectorAll('a');
    drawerLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  // Interactive tap toggle for Selection ("РџРѕРґР±РѕСЂ РєР°СЂС‚РёРЅ") on mobile
  const selBlock = document.querySelector('#rec4145555601');
  if (selBlock) {
    const overlayImg = selBlock.querySelector('.tn-elem[data-elem-id="1790158302121000006"]');
    if (overlayImg) {
      selBlock.addEventListener('click', function (e) {
        if (e.target.closest('.tn-elem[data-elem-id="1790229115998"]')) return;
        if (e.target.closest('.tn-elem[data-elem-id="1790158269658000005"], .tn-elem[data-elem-id="1790158302121000006"]')) {
          const curOp = window.getComputedStyle(overlayImg).opacity;
          overlayImg.style.transition = 'opacity 0.35s ease';
          overlayImg.style.opacity = (curOp === '0' || overlayImg.classList.contains('is-revealed')) ? '1' : '0';
          overlayImg.classList.toggle('is-revealed');
        }
      });
    }
  }

  // Header shadow on scroll
  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 15) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  // 3. Fail-safe External Link Activator (Ensures opening in new tabs on tablets/phones)
  document.addEventListener('click', function (e) {
    const extAnchor = e.target.closest('a[href^="https://t.me"], a[href^="https://vk."], a[href^="https://max.ru"]');
    if (extAnchor && extAnchor.href) {
      extAnchor.setAttribute('target', '_blank');
      extAnchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
});

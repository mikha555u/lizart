/**
 * LIZART SHOP — Dynamic Catalog Loader
 * Loads data/paintings.json and renders/updates catalog cards dynamically.
 * Fallback: preserves hardcoded HTML cards if JSON is unreachable.
 */

(function () {
  'use strict';

  var CATALOG_CONTAINER_SEL = '#rec4143741601 .t776__container';
  var JSON_PATH = 'data/paintings.json';

  function formatPrice(num) {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(item) {
    var priceFormatted = formatPrice(item.price);
    var hoverImg = item.image_hover || item.image;
    var btnText = item.sold ? 'под заказ' : 'приобрести';
    var directTgUrl = 'https://t.me/lizartme?direct';

    return (
      '<div class="t776__col t-col t-col_4 t-align_left t-item js-product" data-product-lid="' + escapeHtml(item.id) + '">' +
        '<div class="t776__content">' +
          '<a class="js-product-link" href="' + directTgUrl + '" target="_blank" rel="noopener noreferrer">' +
            '<div class="t776__imgwrapper t1002__picture-wrapper" style="padding-bottom:100%;">' +
              '<div class="t776__bgimg t776__bgimg_first_hover t-bgimg js-product-img" ' +
                'data-original="' + escapeHtml(item.image) + '" ' +
                'style="background-image:url(\'' + escapeHtml(item.image) + '\');"></div>' +
              '<div class="t776__bgimg t776__bgimg_second t-bgimg" ' +
                'data-original="' + escapeHtml(hoverImg) + '" ' +
                'style="background-image:url(\'' + escapeHtml(hoverImg) + '\');"></div>' +
            '</div>' +
            '<div class="t776__textwrapper">' +
              '<div class="t776__title t-name t-name_md js-product-name">' + escapeHtml(item.title) + '</div>' +
              '<div class="t776__descr t-descr t-descr_xxs">' + escapeHtml(item.descr || '') + '</div>' +
              '<div class="t776__price-wrapper">' +
                '<div class="t776__price t776__price-item t-name t-name_xs">' +
                  '<div class="t776__price-value js-product-price notranslate" translate="off">' + escapeHtml(String(item.price)) + '</div>' +
                  '<div class="t776__price-currency">р.</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</a>' +
          '<div class="t776__btn-wrapper t1002__btns-wrapper">' +
            '<a class="t-btn t-btnflex t-btnflex_type_button t-btnflex_sm t776__btn" ' +
               'href="' + directTgUrl + '" target="_blank" rel="noopener noreferrer">' +
              '<span class="t-btnflex__text">' + btnText + '</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function updateProductSchema(paintings) {
    if (!Array.isArray(paintings)) return;
    var el = document.getElementById('schema-products');
    if (!el) {
      el = document.createElement('script');
      el.id = 'schema-products';
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    var baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '');
    var schema = {
      '@context': 'https://schema.org',
      '@graph': paintings.map(function (p) {
        return {
          '@type': 'Product',
          'name': p.title,
          'image': p.image ? (baseUrl + p.image) : undefined,
          'description': p.descr || p.title,
          'offers': {
            '@type': 'Offer',
            'price': String(p.price),
            'priceCurrency': 'RUB',
            'availability': p.sold ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
            'url': baseUrl + '#catalog'
          }
        };
      })
    };
    el.textContent = JSON.stringify(schema);
  }

  function updateCatalog(paintings) {
    var container = document.querySelector(CATALOG_CONTAINER_SEL);
    if (!container || !Array.isArray(paintings) || paintings.length === 0) return;

    updateProductSchema(paintings);

    var existingCards = container.querySelectorAll('.js-product');
    var existingIds = Array.from(existingCards).map(function (c) {
      return c.getAttribute('data-product-lid');
    });

    var newIds = paintings.map(function (p) {
      return String(p.id);
    });

    var isIdenticalOrder =
      existingIds.length === newIds.length &&
      existingIds.every(function (id, idx) {
        return id === newIds[idx];
      });

    if (isIdenticalOrder) {
      // Update properties dynamically
      paintings.forEach(function (item) {
        var card = container.querySelector('[data-product-lid="' + item.id + '"]');
        if (!card) return;

        // Ensure no markwrapper is present
        var markWrapper = card.querySelector('.t776__markwrapper');
        if (markWrapper) {
          markWrapper.remove();
        }

        // Title
        var titleEl = card.querySelector('.js-product-name');
        if (titleEl && titleEl.textContent.trim() !== item.title) {
          titleEl.textContent = item.title;
        }

        // Description
        var descrEl = card.querySelector('.t776__descr');
        if (descrEl && item.descr && descrEl.textContent.trim() !== item.descr) {
          descrEl.textContent = item.descr;
        }

        // Price
        var priceEl = card.querySelector('.js-product-price');
        if (priceEl && priceEl.textContent.trim() !== String(item.price)) {
          priceEl.textContent = String(item.price);
        }

        // Button text: 'под заказ' vs 'приобрести'
        var btnTextEl = card.querySelector('.t776__btn .t-btnflex__text');
        var expectedBtnText = item.sold ? 'под заказ' : 'приобрести';
        if (btnTextEl && btnTextEl.textContent.trim() !== expectedBtnText) {
          btnTextEl.textContent = expectedBtnText;
        }

        // Image updates if changed
        var firstImg = card.querySelector('.t776__bgimg_first_hover');
        if (firstImg && item.image && firstImg.getAttribute('data-original') !== item.image) {
          firstImg.setAttribute('data-original', item.image);
          firstImg.style.backgroundImage = 'url(\'' + item.image + '\')';
        }
      });
      return;
    }

    // Re-render if added/removed/reordered
    var html = paintings.map(renderCard).join('');
    container.innerHTML = html;

    if (window.t_lazyload_update) {
      window.t_lazyload_update();
    }
  }

  function initCatalog() {
    fetch(JSON_PATH + '?v=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('Catalog JSON not found');
        return res.json();
      })
      .then(function (data) {
        updateCatalog(data);
      })
      .catch(function (err) {
        console.log('Using static catalog fallback:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalog);
  } else {
    initCatalog();
  }
})();
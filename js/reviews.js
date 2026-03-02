/* ============================================================
   TopScuole.it — Star Reviews Component
   ============================================================ */

'use strict';

// Star rating widget factory — for future dynamic form generation
class StarRating {
    constructor(container, options = {}) {
        this.container = container;
        this.maxStars = options.max || 5;
        this.value = options.default || 0;
        this.onChange = options.onChange || null;
        this.label = options.label || '';
        this.render();
        this.bind();
    }

    render() {
        this.container.innerHTML = `
      <div class="star-widget" aria-label="Valutazione ${this.label}: ${this.value} su ${this.maxStars} stelle">
        ${Array.from({ length: this.maxStars }, (_, i) => `
          <span class="sw-star ${i < this.value ? 'active' : ''}"
                data-val="${i + 1}"
                role="button"
                tabindex="0"
                aria-label="${i + 1} stell${i === 0 ? 'a' : 'e'}">★</span>
        `).join('')}
      </div>
    `;

        // Inline styles
        const style = document.createElement('style');
        style.textContent = `
      .star-widget { display: inline-flex; gap: 3px; }
      .sw-star { font-size: 1.5rem; color: #DEE2E6; cursor: pointer; transition: color 0.15s ease, transform 0.15s ease; user-select: none; }
      .sw-star:hover, .sw-star.preview { color: #F4C430; transform: scale(1.15); }
      .sw-star.active { color: #F4C430; }
    `;
        if (!document.querySelector('#sw-styles')) {
            style.id = 'sw-styles';
            document.head.appendChild(style);
        }
    }

    bind() {
        const stars = this.container.querySelectorAll('.sw-star');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach(s => {
                    s.classList.toggle('preview', parseInt(s.dataset.val) <= val);
                    s.classList.remove('active');
                });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => {
                    s.classList.remove('preview');
                    s.classList.toggle('active', parseInt(s.dataset.val) <= this.value);
                });
            });
            star.addEventListener('click', () => {
                this.value = parseInt(star.dataset.val);
                stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= this.value));
                if (this.onChange) this.onChange(this.value);
                this.container.querySelector('.star-widget').setAttribute('aria-label',
                    `Valutazione ${this.label}: ${this.value} su ${this.maxStars} stelle`);
            });
            star.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') star.click();
            });
        });
    }

    getValue() { return this.value; }
    reset() {
        this.value = 0;
        this.render();
        this.bind();
    }
}

// Export as global
window.StarRating = StarRating;

/* ---- Review card builder (for dynamic rendering) ---- */
function buildReviewCard({ author, role, date, scores, text, verified = false, helpful = 0 }) {
    const initial = author.charAt(0).toUpperCase();
    const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(1);
    const starsHtml = [1, 2, 3, 4, 5].map(i => `<span style="color:${i <= Math.round(avg) ? '#F4C430' : '#dee2e6'}">★</span>`).join('');

    const catLabels = {
        didattica: '🎓 Didattica',
        struttura: '🏫 Struttura',
        ambiente: '👥 Ambiente',
        org: '📋 Org.',
        servizi: '🚌 Servizi',
    };

    const scorePills = Object.entries(scores)
        .map(([k, v]) => `<span class="review-score-pill">${catLabels[k] || k}: ${v}</span>`)
        .join('');

    return `
    <div class="review-item" style="animation: fadeInUp 0.4s ease both;">
      <div class="review-item__top">
        <div class="review-avatar">${initial}</div>
        <div class="review-meta">
          <strong>${author} <span style="color:var(--gold);font-size:0.8rem">${starsHtml}</span></strong>
          <small>${role} · ${date}${verified ? ' · <span class="badge badge-gold" style="font-size:0.68rem;padding:0.15rem 0.5rem;">Verificato</span>' : ''}</small>
        </div>
      </div>
      <div class="review-scores">${scorePills}</div>
      <div class="review-item__text">"${text}"</div>
      <div class="review-item__helpful">
        <span>Quest'opinione ti è stata utile?</span>
        <button><i class="fas fa-thumbs-up"></i> Sì (${helpful})</button>
        <button><i class="fas fa-thumbs-down"></i> No (0)</button>
      </div>
    </div>
  `;
}

window.buildReviewCard = buildReviewCard;

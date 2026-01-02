/**
 * extensions.js - Extensiones para JA Electrónica - OPTIMIZADO v3.0
 * Manejo profesional de mega menus para Categories y Brands
 */
(function() {
    'use strict';

    // ========== UTILITIES ==========
    const Utils = {
        $(selector, context = document) { 
            return context.querySelector(selector); 
        },
        $$(selector, context = document) { 
            return [...context.querySelectorAll(selector)]; 
        },
        isMobile() { 
            return window.innerWidth < 992; 
        },
        notify(message, type = 'success') {
            const existing = Utils.$('.notification-toast');
            if (existing) existing.remove();
            
            const toast = document.createElement('div');
            toast.className = `notification-toast ${type}`;
            const icons = { 
                success: 'check-circle', 
                error: 'exclamation-circle', 
                info: 'info-circle' 
            };
            toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${message}</span>`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };

    // ========== USER ACCORDION ==========
    const UserAccordion = {
        init() {
            const toggle = Utils.$('#userAccordionToggle');
            const content = Utils.$('#userAccordionContent');
            if (!toggle || !content) return;

            toggle.addEventListener('click', () => {
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isOpen);
                content.classList.toggle('active');
            });
        }
    };

    // ========== MEGA MENU BASE CLASS ==========
    class MegaMenu {
        constructor(options) {
            this.linkSelector = options.linkSelector;
            this.showcaseSelector = options.showcaseSelector;
            this.cardSelector = options.cardSelector;
            this.filterKey = options.filterKey;
            this.headerClass = options.headerClass;
            this.headerTitle = options.headerTitle;
            this.headerIcon = options.headerIcon;
            this.closeClass = options.closeClass;
            
            this.link = Utils.$(this.linkSelector);
            this.showcase = Utils.$(this.showcaseSelector);
            this.overlay = Utils.$('#overlay');
            
            this.isOpen = false;
            this.hideTimeout = null;
            
            if (this.link && this.showcase) {
                this.init();
            }
        }
        
        init() {
            // Crear header para móvil
            this.createMobileHeader();
            
            // Bind events
            this.bindEvents();
        }
        
        createMobileHeader() {
            // Verificar si ya existe
            if (Utils.$(`.${this.headerClass}`, this.showcase)) return;
            
            const header = document.createElement('div');
            header.className = this.headerClass;
            header.innerHTML = `
                <h3 class="${this.headerClass.replace('-header', '-title')}">
                    <i class="fas ${this.headerIcon}"></i>
                    ${this.headerTitle}
                </h3>
                <button class="${this.closeClass}" aria-label="Cerrar">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            this.showcase.insertBefore(header, this.showcase.firstChild);
            
            // Bind close button
            const closeBtn = Utils.$(`.${this.closeClass}`, this.showcase);
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hide();
                });
            }
        }
        
        bindEvents() {
            // Click en el link de navegación
            this.link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });
            
            // Desktop: hover behavior
            if (!Utils.isMobile()) {
                this.link.addEventListener('mouseenter', () => {
                    this.clearHideTimeout();
                    this.show();
                });
                
                this.link.addEventListener('mouseleave', () => {
                    this.scheduleHide();
                });
                
                this.showcase.addEventListener('mouseenter', () => {
                    this.clearHideTimeout();
                });
                
                this.showcase.addEventListener('mouseleave', () => {
                    this.hide();
                });
            }
            
            // Overlay click
            if (this.overlay) {
                this.overlay.addEventListener('click', () => {
                    if (this.isOpen) this.hide();
                });
            }
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.hide();
                }
            });
            
            // Click outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && 
                    !this.showcase.contains(e.target) && 
                    !this.link.contains(e.target)) {
                    this.hide();
                }
            });
            
            // Cards click
            Utils.$$(this.cardSelector, this.showcase).forEach(card => {
                card.addEventListener('click', () => {
                    const value = card.dataset[this.filterKey];
                    if (value) {
                        this.applyFilter(value, card);
                        this.hide();
                    }
                });
                
                // Keyboard accessibility
                card.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.click();
                    }
                });
            });
            
            // Window resize handler
            window.addEventListener('resize', () => {
                if (this.isOpen && !Utils.isMobile()) {
                    // En desktop, si está abierto, mantener comportamiento
                    this.clearHideTimeout();
                }
            });
        }
        
        show() {
            this.isOpen = true;
            this.showcase.classList.add('show');
            this.link.classList.add('active-menu');
            
            // Mostrar overlay solo en móvil
            if (Utils.isMobile() && this.overlay) {
                this.overlay.classList.add('active', 'menu-overlay');
            }
        }
        
        hide() {
            this.isOpen = false;
            this.showcase.classList.remove('show');
            this.link.classList.remove('active-menu');
            
            if (this.overlay) {
                this.overlay.classList.remove('active', 'menu-overlay');
            }
            
            this.clearHideTimeout();
        }
        
        toggle() {
            if (this.isOpen) {
                this.hide();
            } else {
                // Cerrar otros menus abiertos
                this.closeOtherMenus();
                this.show();
            }
        }
        
        closeOtherMenus() {
            // Cerrar categories si brands está abierto y viceversa
            const otherShowcases = Utils.$$('.categories-showcase.show, .brands-showcase.show');
            otherShowcases.forEach(showcase => {
                if (showcase !== this.showcase) {
                    showcase.classList.remove('show');
                }
            });
            
            Utils.$$('.nav-link.active-menu').forEach(link => {
                if (link !== this.link) {
                    link.classList.remove('active-menu');
                }
            });
        }
        
        scheduleHide() {
            this.hideTimeout = setTimeout(() => {
                if (!this.showcase.matches(':hover')) {
                    this.hide();
                }
            }, 200);
        }
        
        clearHideTimeout() {
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        }
        
        applyFilter(value, card) {
            // Implementar en subclases
        }
    }

    // ========== CATEGORIES MENU ==========
    class CategoriesMenu extends MegaMenu {
        constructor() {
            super({
                linkSelector: '#categoriesLink',
                showcaseSelector: '.categories-showcase',
                cardSelector: '.category-card',
                filterKey: 'category',
                headerClass: 'categories-showcase-header',
                headerTitle: 'Categorías',
                headerIcon: 'fa-list',
                closeClass: 'categories-close-btn'
            });
            
            this.categoryNames = {
                deportivos: 'Relojes Deportivos',
                elegantes: 'Relojes Elegantes',
                digitales: 'Relojes Digitales',
                clasicos: 'Relojes Clásicos'
            };
            
            this.categoryIcons = {
                deportivos: 'fa-running',
                elegantes: 'fa-gem',
                digitales: 'fa-digital-tachograph',
                clasicos: 'fa-clock'
            };
        }
        
        applyFilter(category, card) {
            const products = Utils.$$('.product-card-bristol');
            let visibleCount = 0;
            
            products.forEach(p => {
                const show = p.dataset.category === category;
                p.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });
            
            // Actualizar título
            const titleEl = Utils.$('.section-title-bristol');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fas ${this.categoryIcons[category]}"></i>${this.categoryNames[category]}`;
            }
            
            // Actualizar contador
            const countEl = Utils.$('.product-count');
            if (countEl) {
                countEl.textContent = `${visibleCount} artículos`;
            }
            
            Utils.notify(`Mostrando ${this.categoryNames[category]}`, 'info');
        }
    }

    // ========== BRANDS MENU ==========
    class BrandsMenu extends MegaMenu {
        constructor() {
            super({
                linkSelector: '#brandsLink',
                showcaseSelector: '.brands-showcase',
                cardSelector: '.brand-card',
                filterKey: 'brand',
                headerClass: 'brands-showcase-header',
                headerTitle: 'Marcas',
                headerIcon: 'fa-tags',
                closeClass: 'brands-close-btn'
            });
            
            this.brandNames = {
                casio: 'Casio',
                qyq: 'QyQ',
                skmei: 'Skmei',
                aqua: 'Aqua',
                genericos: 'Genéricos'
            };
        }
        
        applyFilter(brand, card) {
            const products = Utils.$$('.product-card-bristol');
            let visibleCount = 0;
            
            products.forEach(p => {
                const show = p.dataset.brand === brand;
                p.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });
            
            // Actualizar título
            const titleEl = Utils.$('.section-title-bristol');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fas fa-clock"></i>Relojes ${this.brandNames[brand]}`;
            }
            
            // Actualizar contador
            const countEl = Utils.$('.product-count');
            if (countEl) {
                countEl.textContent = `${visibleCount} artículos`;
            }
            
            const cardName = card.querySelector('.brand-name')?.textContent || this.brandNames[brand];
            Utils.notify(`Mostrando productos ${cardName}`, 'info');
        }
    }

    // ========== LOCATION MODAL ==========
    const Location = {
        init() {
            const link = Utils.$('#locationLink');
            const modal = Utils.$('#locationModal');
            const closeBtn = Utils.$('#locationCloseBtn');
            if (!link || !modal) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(modal);
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close(modal));
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(modal);
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.close(modal);
                }
            });
        },

        open(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // ========== INITIALIZE ==========
    function init() {
        UserAccordion.init();
        new CategoriesMenu();
        new BrandsMenu();
        Location.init();
        console.log('✅ Extensions v3.0 - Mega menus optimizados');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
/**
 * extensions.js - VERSIÓN FINAL CORREGIDA
 */
(function() {
    'use strict';

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
            
            const iconMap = {
                success: 'check-circle',
                error: 'exclamation-circle',
                info: 'info-circle'
            };
            
            toast.innerHTML = `
                <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    };

    // ========== CATEGORIES MODULE ==========
    const Categories = {
        elements: {},
        
        init() {
            this.elements = {
                link: Utils.$('#categoriesLink'),
                showcase: Utils.$('.categories-showcase'),
                cards: Utils.$$('.category-card'),
                overlay: Utils.$('#overlay')
            };

            if (!this.elements.link || !this.elements.showcase) return;

            this.ensureHeader();
            this.bindEvents();
        },
        
        ensureHeader() {
            // Verificar si ya existe el header
            let header = Utils.$('.categories-showcase-header', this.elements.showcase);
            if (!header) {
                header = document.createElement('div');
                header.className = 'categories-showcase-header';
                header.innerHTML = `
                    <h3 class="categories-showcase-title">
                        <i class="fas fa-list"></i>
                        Categorías
                    </h3>
                    <button class="categories-close-btn" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                this.elements.showcase.insertBefore(header, this.elements.showcase.firstChild);
            }
            
            // Bind close button
            const closeBtn = header.querySelector('.categories-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }
        },

        bindEvents() {
            const { link, showcase, overlay, cards } = this.elements;
            let hideTimeout;

            // Click toggle
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (showcase.classList.contains('show')) {
                    this.hide();
                } else {
                    this.show();
                }
            });

            // Overlay click
            if (overlay) {
                const overlayClickHandler = () => {
                    if (showcase.classList.contains('show')) {
                        this.hide();
                    }
                };
                overlay.addEventListener('click', overlayClickHandler);
            }

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && showcase.classList.contains('show')) {
                    this.hide();
                }
            });

            // Category cards
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const category = card.dataset.category;
                    if (category) {
                        this.applyFilter(category);
                        this.hide();
                    }
                });
            });

            // Desktop hover (solo en desktop)
            if (!Utils.isMobile()) {
                link.addEventListener('mouseenter', () => this.show());
                link.addEventListener('mouseleave', () => {
                    hideTimeout = setTimeout(() => {
                        if (!showcase.matches(':hover')) this.hide();
                    }, 300);
                });
                
                showcase.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
                showcase.addEventListener('mouseleave', () => this.hide());
            }
        },
        
        show() {
            this.elements.showcase.classList.add('show');
            if (this.elements.overlay) {
                this.elements.overlay.classList.add('active');
            }
        },
        
        hide() {
            this.elements.showcase.classList.remove('show');
            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('active');
            }
        },

        applyFilter(category) {
            const categoryNames = {
                deportivos: 'Relojes Deportivos',
                elegantes: 'Relojes Elegantes',
                digitales: 'Relojes Digitales',
                clasicos: 'Relojes Clásicos'
            };

            const products = Utils.$$('.product-card-bristol');
            products.forEach(product => {
                const productCategory = product.dataset.category;
                product.style.display = productCategory === category ? '' : 'none';
            });

            const titleEl = Utils.$('.section-title-bristol');
            if (titleEl) {
                const iconMap = {
                    deportivos: 'fa-running',
                    elegantes: 'fa-gem',
                    digitales: 'fa-digital-tachograph',
                    clasicos: 'fa-clock'
                };
                
                titleEl.innerHTML = `<i class="fas ${iconMap[category]}"></i>${categoryNames[category]}`;
            }

            const visible = products.filter(p => p.style.display !== 'none').length;
            const countEl = Utils.$('.product-count');
            if (countEl) countEl.textContent = `${visible} artículos`;

            Utils.notify(`Mostrando ${categoryNames[category]}`, 'info');
        }
    };

    // ========== BRANDS MODULE ==========
    const Brands = {
        elements: {},
        
        init() {
            this.elements = {
                link: Utils.$('#brandsLink'),
                showcase: Utils.$('.brands-showcase'),
                cards: Utils.$$('.brand-card'),
                overlay: Utils.$('#overlay')
            };

            if (!this.elements.link || !this.elements.showcase) return;

            this.ensureHeader();
            this.bindEvents();
        },
        
        ensureHeader() {
            let header = Utils.$('.brands-showcase-header', this.elements.showcase);
            if (!header) {
                header = document.createElement('div');
                header.className = 'brands-showcase-header';
                header.innerHTML = `
                    <h3 class="brands-showcase-title">
                        <i class="fas fa-tags"></i>
                        Marcas
                    </h3>
                    <button class="brands-close-btn" aria-label="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                this.elements.showcase.insertBefore(header, this.elements.showcase.firstChild);
            }
            
            const closeBtn = header.querySelector('.brands-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }
        },

        bindEvents() {
            const { link, showcase, overlay, cards } = this.elements;
            let hideTimeout;

            // Click toggle
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (showcase.classList.contains('show')) {
                    this.hide();
                } else {
                    this.show();
                }
            });

            // Overlay click
            if (overlay) {
                const overlayClickHandler = () => {
                    if (showcase.classList.contains('show')) {
                        this.hide();
                    }
                };
                overlay.addEventListener('click', overlayClickHandler);
            }

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && showcase.classList.contains('show')) {
                    this.hide();
                }
            });

            // Brand cards
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const brand = card.dataset.brand;
                    if (brand) {
                        this.applyFilter(brand);
                        this.hide();
                    }
                });
            });

            // Desktop hover
            if (!Utils.isMobile()) {
                link.addEventListener('mouseenter', () => this.show());
                link.addEventListener('mouseleave', () => {
                    hideTimeout = setTimeout(() => {
                        if (!showcase.matches(':hover')) this.hide();
                    }, 300);
                });
                
                showcase.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
                showcase.addEventListener('mouseleave', () => this.hide());
            }
        },
        
        show() {
            this.elements.showcase.classList.add('show');
            if (this.elements.overlay) {
                this.elements.overlay.classList.add('active');
            }
        },
        
        hide() {
            this.elements.showcase.classList.remove('show');
            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('active');
            }
        },

        applyFilter(brand) {
            const brandNames = {
                casio: 'Casio',
                qyq: 'QyQ',
                skmei: 'Skmei',
                aqua: 'Aqua',
                genericos: 'Genéricos'
            };

            const products = Utils.$$('.product-card-bristol');
            products.forEach(product => {
                const productBrand = product.dataset.brand;
                product.style.display = productBrand === brand ? '' : 'none';
            });

            const titleEl = Utils.$('.section-title-bristol');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fas fa-clock"></i>Relojes ${brandNames[brand]}`;
            }

            const visible = products.filter(p => p.style.display !== 'none').length;
            const countEl = Utils.$('.product-count');
            if (countEl) countEl.textContent = `${visible} artículos`;

            Utils.notify(`Mostrando productos ${brandNames[brand]}`, 'info');
        }
    };

    // ========== INIT ==========
    const ExtensionsApp = {
        init() {
            Categories.init();
            Brands.init();
            console.log('✅ Extensions v2.0 - Loaded');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ExtensionsApp.init());
    } else {
        ExtensionsApp.init();
    }
})();
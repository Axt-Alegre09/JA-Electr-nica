/**
 * JA ELECTRÓNICA - Main Application Script
 * Optimized & Modular Version 2.0
 */

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        storageKeys: {
            theme: 'ja_theme',
            cart: 'ja_cart',
            newsletter: 'ja_newsletter_shown'
        },
        selectors: {
            themeToggle: '#themeToggle',
            hamburgerBtn: '#hamburgerBtn',
            filtersSidebar: '#filtersSidebar',
            overlay: '#overlay',
            userBtn: '#userBtn',
            userDropdown: '#userDropdown',
            mainSearch: '#mainSearch',
            sortSelect: '#sortSelect',
            productsGrid: '#productsGrid',
            productCards: '.product-card-bristol',
            filterLinks: '.filter-link',
            filterCheckbox: '#withDiscount',
            loadMoreBtn: '#loadMore',
            cartBtn: '#cartBtn',
            cartModal: '#cartModal',
            cartCloseBtn: '#cartCloseBtn',
            newsletterPopup: '#newsletterPopup',
            brandsShowcase: '.brands-showcase',
            brandsLink: '.main-nav a[href="#brands"]'
        },
        delays: {
            search: 300,
            sidebarClose: 300,
            newsletterShow: 2000,
            notification: 3000
        }
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    const Utils = {
        /**
         * Safe DOM query selector
         */
        $(selector, context = document) {
            return context.querySelector(selector);
        },

        /**
         * Safe DOM query selector all
         */
        $$(selector, context = document) {
            return [...context.querySelectorAll(selector)];
        },

        /**
         * Debounce function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Format number with separators
         */
        formatNumber(num) {
            return new Intl.NumberFormat('es-PY').format(num);
        },

        /**
         * Local storage helpers
         */
        storage: {
            get(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch {
                    return defaultValue;
                }
            },
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch {
                    return false;
                }
            }
        },

        /**
         * Show notification toast
         */
        notify(message, type = 'success') {
            const existing = Utils.$('.notification-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = `notification-toast ${type}`;
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, CONFIG.delays.notification);
        }
    };

    // ==========================================
    // THEME MODULE
    // ==========================================
    const Theme = {
        init() {
            const toggle = Utils.$(CONFIG.selectors.themeToggle);
            if (!toggle) return;

            // Apply saved theme
            const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme) || 'light';
            this.apply(savedTheme);

            // Toggle event
            toggle.addEventListener('click', () => this.toggle());
        },

        apply(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const icon = Utils.$(`${CONFIG.selectors.themeToggle} i`);
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        toggle() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            
            const toggle = Utils.$(CONFIG.selectors.themeToggle);
            if (toggle) toggle.classList.add('rotating');
            
            this.apply(newTheme);
            localStorage.setItem(CONFIG.storageKeys.theme, newTheme);
            
            setTimeout(() => {
                if (toggle) toggle.classList.remove('rotating');
            }, 500);
        }
    };

    // ==========================================
    // SIDEBAR MODULE
    // ==========================================
    const Sidebar = {
        elements: {},

        init() {
            this.elements = {
                hamburger: Utils.$(CONFIG.selectors.hamburgerBtn),
                sidebar: Utils.$(CONFIG.selectors.filtersSidebar),
                overlay: Utils.$(CONFIG.selectors.overlay)
            };

            if (!this.elements.hamburger || !this.elements.sidebar) return;

            // Event listeners
            this.elements.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.open();
            });

            if (this.elements.overlay) {
                this.elements.overlay.addEventListener('click', () => this.close());
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.elements.sidebar.classList.contains('active')) {
                    this.close();
                }
            });

            // Touch gestures
            this.initTouchGestures();
        },

        open() {
            this.elements.sidebar.classList.add('active');
            if (this.elements.overlay) {
                this.elements.overlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.elements.sidebar.classList.remove('active');
            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('active');
            }
            document.body.style.overflow = '';
        },

        initTouchGestures() {
            let touchStartX = 0;
            let touchEndX = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchEndX - touchStartX;

                // Swipe right from left edge to open
                if (diff > 100 && touchStartX < 50 && !this.elements.sidebar.classList.contains('active')) {
                    this.open();
                }

                // Swipe left to close
                if (diff < -100 && this.elements.sidebar.classList.contains('active')) {
                    this.close();
                }
            }, { passive: true });
        }
    };

    // ==========================================
    // FILTERS MODULE
    // ==========================================
    const Filters = {
        activeFilters: {},
        
        // Títulos personalizados para cada filtro
        titles: {
            brand: {
                casio: { name: 'Casio', icon: 'fas fa-clock' },
                qyq: { name: 'QyQ', icon: 'fas fa-clock' },
                skmei: { name: 'Skmei', icon: 'fas fa-clock' },
                aqua: { name: 'Aqua', icon: 'fas fa-tint' },
                genericos: { name: 'Genéricos', icon: 'fas fa-tags' }
            },
            special: {
                sale: { name: 'Ofertas', icon: 'fas fa-percentage' },
                new: { name: 'Nuevos Productos', icon: 'fas fa-sparkles' },
                outlet: { name: 'Outlet', icon: 'fas fa-store' }
            },
            gender: {
                caballeros: { name: 'Relojes para Caballeros', icon: 'fas fa-male' },
                damas: { name: 'Relojes para Damas', icon: 'fas fa-female' },
                ninos: { name: 'Relojes para Niños', icon: 'fas fa-child' }
            },
            default: { name: 'Relojes y Tecnología', icon: 'fas fa-watch' }
        },

        init() {
            this.bindFilterLinks();
            this.bindCheckboxFilter();
        },

        bindFilterLinks() {
            Utils.$$(CONFIG.selectors.filterLinks).forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Toggle active state
                    Utils.$$(CONFIG.selectors.filterLinks).forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Get filter type
                    const brand = link.dataset.brand;
                    const special = link.dataset.special;
                    const gender = link.dataset.gender;

                    if (brand) {
                        this.applyFilter('brand', brand);
                        this.updateTitle('brand', brand);
                    } else if (special) {
                        this.applyFilter('special', special);
                        this.updateTitle('special', special);
                    } else if (gender) {
                        this.applyFilter('gender', gender);
                        this.updateTitle('gender', gender);
                    }

                    // Close sidebar on mobile
                    if (window.innerWidth < 992) {
                        setTimeout(() => Sidebar.close(), CONFIG.delays.sidebarClose);
                    }
                });
            });
        },

        bindCheckboxFilter() {
            const checkbox = Utils.$(CONFIG.selectors.filterCheckbox);
            if (!checkbox) return;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.applyFilter('discount', true);
                    this.updateTitle('special', 'sale');
                } else {
                    this.clearAll();
                }
            });
        },

        applyFilter(type, value) {
            const products = Utils.$$(CONFIG.selectors.productCards);

            products.forEach(product => {
                let show = true;

                switch (type) {
                    case 'brand':
                        show = product.dataset.brand === value;
                        break;
                    case 'gender':
                        show = product.dataset.gender === value;
                        break;
                    case 'special':
                        const badge = Utils.$('.product-badge-bristol', product);
                        if (value === 'sale') show = badge?.classList.contains('sale');
                        else if (value === 'new') show = badge?.classList.contains('new');
                        break;
                    case 'discount':
                        if (value) {
                            show = Utils.$('.product-badge-bristol.sale', product) !== null;
                        }
                        break;
                }

                product.style.display = show ? '' : 'none';
            });

            this.updateProductCount();
            
            // Scroll to top of products
            const scrollContainer = Utils.$('.products-scroll-container');
            if (scrollContainer) {
                scrollContainer.scrollTop = 0;
            }
        },

        updateTitle(type, value) {
            const titleEl = Utils.$('.section-title-bristol');
            if (!titleEl) return;

            const titleData = this.titles[type]?.[value] || this.titles.default;
            
            titleEl.innerHTML = `
                <i class="${titleData.icon}" aria-hidden="true"></i>
                ${titleData.name}
            `;
            
            // Add animation
            titleEl.style.animation = 'none';
            titleEl.offsetHeight; // Trigger reflow
            titleEl.style.animation = 'fadeInTitle 0.3s ease';
        },

        clearAll() {
            Utils.$$(CONFIG.selectors.filterLinks).forEach(l => l.classList.remove('active'));
            
            const checkbox = Utils.$(CONFIG.selectors.filterCheckbox);
            if (checkbox) checkbox.checked = false;

            Utils.$$(CONFIG.selectors.productCards).forEach(product => {
                product.style.display = '';
            });

            this.updateTitle('default', 'default');
            this.updateProductCount();
        },

        updateProductCount() {
            const visible = Utils.$$(CONFIG.selectors.productCards).filter(p => 
                p.style.display !== 'none'
            ).length;

            const countEl = Utils.$('.product-count');
            if (countEl) {
                countEl.textContent = `${visible} artículos`;
            }
        }
    };

    // ==========================================
    // SEARCH MODULE
    // ==========================================
    const Search = {
        init() {
            const searchInput = Utils.$(CONFIG.selectors.mainSearch);
            if (!searchInput) return;

            const debouncedSearch = Utils.debounce(() => this.perform(searchInput.value), CONFIG.delays.search);
            
            searchInput.addEventListener('input', debouncedSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.perform(searchInput.value);
            });
        },

        perform(query) {
            const searchTerm = query.toLowerCase().trim();
            const products = Utils.$$(CONFIG.selectors.productCards);

            products.forEach(product => {
                if (!searchTerm) {
                    product.style.display = '';
                    return;
                }

                const brand = (product.dataset.brand || '').toLowerCase();
                const title = Utils.$('.product-title-bristol', product)?.textContent.toLowerCase() || '';
                const category = Utils.$('.product-brand-bristol', product)?.textContent.toLowerCase() || '';

                const matches = brand.includes(searchTerm) || 
                               title.includes(searchTerm) || 
                               category.includes(searchTerm);

                product.style.display = matches ? '' : 'none';
            });

            Filters.updateProductCount();
        }
    };

    // ==========================================
    // SORT MODULE
    // ==========================================
    const Sort = {
        init() {
            const select = Utils.$(CONFIG.selectors.sortSelect);
            if (!select) return;

            select.addEventListener('change', () => this.apply(select.value));
        },

        apply(sortType) {
            const grid = Utils.$(CONFIG.selectors.productsGrid);
            if (!grid) return;

            const products = Utils.$$(CONFIG.selectors.productCards);

            products.sort((a, b) => {
                const priceA = parseInt(a.dataset.price) || 0;
                const priceB = parseInt(b.dataset.price) || 0;

                switch (sortType) {
                    case 'price-asc':
                        return priceA - priceB;
                    case 'price-desc':
                        return priceB - priceA;
                    case 'rating':
                        const ratingA = Utils.$$('.product-rating-bristol .fas.fa-star', a).length;
                        const ratingB = Utils.$$('.product-rating-bristol .fas.fa-star', b).length;
                        return ratingB - ratingA;
                    case 'popular':
                        const reviewsA = parseInt(Utils.$('.product-rating-bristol span', a)?.textContent.match(/\d+/)?.[0] || '0');
                        const reviewsB = parseInt(Utils.$('.product-rating-bristol span', b)?.textContent.match(/\d+/)?.[0] || '0');
                        return reviewsB - reviewsA;
                    default:
                        return 0;
                }
            });

            products.forEach(product => grid.appendChild(product));
        }
    };

    // ==========================================
    // CART MODULE
    // ==========================================
    const Cart = {
        items: [],

        init() {
            this.items = Utils.storage.get(CONFIG.storageKeys.cart, []);
            this.bindEvents();
            this.updateBadge();
            this.render();
        },

        bindEvents() {
            // Cart button
            const cartBtn = Utils.$(CONFIG.selectors.cartBtn);
            const cartModal = Utils.$(CONFIG.selectors.cartModal);
            const closeBtn = Utils.$(CONFIG.selectors.cartCloseBtn);

            if (cartBtn && cartModal) {
                cartBtn.addEventListener('click', () => this.openModal());
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            if (cartModal) {
                cartModal.addEventListener('click', (e) => {
                    if (e.target === cartModal) this.closeModal();
                });
            }

            // Add to cart buttons
            Utils.$$('.btn-add-cart-bristol').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const card = btn.closest('.product-card-bristol');
                    if (card) this.addItem(card, btn);
                });
            });
        },

        openModal() {
            const modal = Utils.$(CONFIG.selectors.cartModal);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        closeModal() {
            const modal = Utils.$(CONFIG.selectors.cartModal);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        addItem(card, button) {
            const id = card.dataset.id || `product-${Date.now()}`;
            const title = Utils.$('.product-title-bristol', card)?.textContent.trim() || 'Producto';
            const brand = Utils.$('.product-brand-bristol', card)?.textContent.trim() || '';
            const price = parseInt(card.dataset.price) || 0;
            const image = Utils.$('.product-image-bristol img', card)?.src || '';

            const existing = this.items.find(item => item.id === id);

            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({ id, title, brand, price, image, quantity: 1 });
            }

            this.save();
            this.updateBadge();
            this.render();
            this.showAddFeedback(button);

            Utils.notify('Producto agregado al carrito');
        },

        showAddFeedback(button) {
            const original = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Agregado';
            button.style.background = 'var(--success)';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = original;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        },

        updateQuantity(id, change) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.quantity = Math.max(1, item.quantity + change);
                this.save();
                this.updateBadge();
                this.render();
            }
        },

        removeItem(id) {
            this.items = this.items.filter(item => item.id !== id);
            this.save();
            this.updateBadge();
            this.render();
        },

        updateBadge() {
            const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const badges = Utils.$$('.cart-btn .badge, .cart-count-badge');
            badges.forEach(badge => {
                badge.textContent = total;
                if (badge.classList.contains('badge')) {
                    badge.style.display = total > 0 ? '' : 'none';
                }
            });
        },

        render() {
            const body = Utils.$('#cartModalBody');
            const footer = Utils.$('#cartModalFooter');
            const totalEl = Utils.$('#cartTotalPrice');

            if (!body) return;

            if (this.items.length === 0) {
                body.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Tu carrito está vacío</p>
                        <a href="index.html" class="btn-primary btn-block">Seguir Comprando</a>
                    </div>
                `;
                if (footer) footer.style.display = 'none';
                return;
            }

            if (footer) footer.style.display = '';

            body.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.brand} ${item.title}</div>
                        <div class="cart-item-price">₲ ${Utils.formatNumber(item.price)}</div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" 
                                       min="1" onchange="Cart.setQuantity('${item.id}', this.value)">
                                <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="cart-item-remove" onclick="Cart.removeItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (totalEl) totalEl.textContent = `₲ ${Utils.formatNumber(total)}`;
        },

        setQuantity(id, value) {
            const quantity = Math.max(1, parseInt(value) || 1);
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
                this.save();
                this.updateBadge();
                this.render();
            }
        },

        save() {
            Utils.storage.set(CONFIG.storageKeys.cart, this.items);
        },

        clear() {
            this.items = [];
            this.save();
            this.updateBadge();
            this.render();
        }
    };

    // Make Cart globally accessible for onclick handlers
    window.Cart = Cart;

    // ==========================================
    // USER DROPDOWN MODULE
    // ==========================================
    const UserDropdown = {
        init() {
            const btn = Utils.$(CONFIG.selectors.userBtn);
            const dropdown = Utils.$(CONFIG.selectors.userDropdown);

            if (!btn || !dropdown) return;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    };

    // ==========================================
    // WISHLIST MODULE
    // ==========================================
    const Wishlist = {
        init() {
            Utils.$$('.wishlist-btn-bristol').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const icon = Utils.$('i', btn);
                    
                    if (icon.classList.contains('far')) {
                        icon.classList.replace('far', 'fas');
                        btn.classList.add('active');
                        btn.style.transform = 'scale(1.2)';
                        setTimeout(() => btn.style.transform = '', 200);
                    } else {
                        icon.classList.replace('fas', 'far');
                        btn.classList.remove('active');
                    }
                });
            });
        }
    };

    // ==========================================
    // BRANDS SHOWCASE MODULE
    // ==========================================
    const BrandsShowcase = {
        init() {
            const link = Utils.$(CONFIG.selectors.brandsLink);
            const showcase = Utils.$(CONFIG.selectors.brandsShowcase);

            if (!link || !showcase) return;

            let hideTimeout;

            const show = () => {
                clearTimeout(hideTimeout);
                showcase.classList.add('show');
            };

            const hide = () => {
                hideTimeout = setTimeout(() => {
                    if (!showcase.matches(':hover')) {
                        showcase.classList.remove('show');
                    }
                }, 200);
            };

            link.addEventListener('mouseenter', show);
            link.addEventListener('mouseleave', hide);
            showcase.addEventListener('mouseenter', show);
            showcase.addEventListener('mouseleave', hide);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                showcase.classList.toggle('show');
            });

            // Brand cards
            Utils.$$('.brand-card').forEach(card => {
                card.addEventListener('click', () => {
                    const brand = card.dataset.brand;
                    if (brand) {
                        Filters.applyFilter('brand', brand);
                        showcase.classList.remove('show');
                        
                        // Scroll to products
                        const products = Utils.$(CONFIG.selectors.productsGrid);
                        if (products) {
                            products.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });
        }
    };

    // ==========================================
    // NEWSLETTER MODULE
    // ==========================================
    const Newsletter = {
        init() {
            const popup = Utils.$(CONFIG.selectors.newsletterPopup);
            if (!popup) return;

            const closeBtn = Utils.$('#closeNewsletterPopup');
            const form = Utils.$('#newsletterForm');

            // Check if already shown
            const shown = localStorage.getItem(CONFIG.storageKeys.newsletter);
            if (!shown) {
                setTimeout(() => this.show(popup), CONFIG.delays.newsletterShow);
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide(popup));
            }

            popup.addEventListener('click', (e) => {
                if (e.target === popup) this.hide(popup);
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && popup.classList.contains('active')) {
                    this.hide(popup);
                }
            });

            if (form) {
                form.addEventListener('submit', (e) => this.handleSubmit(e, popup));
            }
        },

        show(popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        hide(popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
            localStorage.setItem(CONFIG.storageKeys.newsletter, 'true');
        },

        async handleSubmit(e, popup) {
            e.preventDefault();
            
            const email = Utils.$('#newsletterEmail')?.value.trim();
            const whatsapp = Utils.$('#newsletterWhatsapp')?.value.trim();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                Utils.notify('Por favor, ingresa un email válido', 'error');
                return;
            }

            const btn = Utils.$('.newsletter-submit-btn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success
            const content = Utils.$('.newsletter-popup-content', popup);
            if (content) {
                content.innerHTML = `
                    <div class="newsletter-popup-success active">
                        <div class="newsletter-success-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <h3 class="newsletter-success-title">¡Suscripción Exitosa!</h3>
                        <p class="newsletter-success-message">
                            Gracias por suscribirte. Recibirás nuestras mejores ofertas en <strong>${email}</strong>
                        </p>
                    </div>
                `;
            }

            setTimeout(() => this.hide(popup), 3000);
        }
    };

    // ==========================================
    // SCROLL TO TOP MODULE
    // ==========================================
    const ScrollToTop = {
        button: null,

        init() {
            const scrollContainer = Utils.$('.products-scroll-container');
            if (!scrollContainer) return;
            
            scrollContainer.addEventListener('scroll', Utils.debounce(() => this.handleScroll(scrollContainer), 100));
        },

        handleScroll(container) {
            if (container.scrollTop > 300) {
                if (!this.button) {
                    this.button = document.createElement('button');
                    this.button.className = 'scroll-top-btn';
                    this.button.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    this.button.setAttribute('aria-label', 'Volver arriba');
                    this.button.addEventListener('click', () => {
                        const productsContainer = Utils.$('.products-scroll-container');
                        if (productsContainer) {
                            productsContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    });
                    document.body.appendChild(this.button);
                }
                this.button.style.display = 'flex';
            } else if (this.button) {
                this.button.style.display = 'none';
            }
        }
    };

    // ==========================================
    // RESPONSIVE HANDLER
    // ==========================================
    const ResponsiveHandler = {
        init() {
            window.addEventListener('resize', Utils.debounce(() => this.handleResize(), 250));
        },

        handleResize() {
            // Close sidebar on desktop
            if (window.innerWidth >= 992) {
                Sidebar.close();
            }
        }
    };

    // ==========================================
    // APPLICATION INITIALIZATION
    // ==========================================
    const App = {
        init() {
            // Initialize all modules
            Theme.init();
            Sidebar.init();
            Filters.init();
            Search.init();
            Sort.init();
            Cart.init();
            UserDropdown.init();
            Wishlist.init();
            BrandsShowcase.init();
            Newsletter.init();
            ScrollToTop.init();
            ResponsiveHandler.init();

            // Update initial product count
            Filters.updateProductCount();

            console.log('✅ JA Electrónica - Sistema cargado correctamente');
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();
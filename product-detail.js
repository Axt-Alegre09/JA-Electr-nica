/**
 * product-detail.js - JA Electrónica
 * Notificaciones corregidas (sin overlay), carrito sincronizado
 */
(function() {
    'use strict';

    // ========== PRODUCTOS ==========
    const PRODUCTS = {
        'casio-efr539': {
            id: 'casio-efr539',
            brand: 'Casio',
            title: 'Reloj Casio Edifice EFR-539',
            collection: 'Edifice',
            description: 'Reloj Casio Edifice EFR-539 deportivo con cronógrafo. Maquinaria de cuarzo analógica, cristal mineral, caja de acero inoxidable resistente al agua hasta 100m. Diseño moderno y funcional.',
            price: 890000,
            images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
                'https://images.unsplash.com/photo-1524805444758-089113d48396?w=600',
                'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600'
            ],
            category: 'deportivos'
        },
        'qyq-elegant': {
            id: 'qyq-elegant',
            brand: 'QyQ',
            title: 'Reloj QyQ Elegant Damas',
            collection: 'Elegant',
            description: 'Reloj QyQ Elegant para damas con diseño minimalista. Correa de cuero genuino, cristal mineral resistente. Ideal para uso diario y ocasiones especiales.',
            price: 450000,
            images: [
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
                'https://images.unsplash.com/photo-1509941943102-10c232535736?w=600'
            ],
            category: 'elegantes'
        },
        'skmei-deportivo': {
            id: 'skmei-deportivo',
            brand: 'Skmei',
            title: 'Reloj Skmei Deportivo Digital',
            collection: 'Sport',
            description: 'Reloj Skmei deportivo digital multifunción. Resistente al agua, cronómetro, alarma, luz LED. Perfecto para actividades deportivas y outdoor.',
            price: 180000,
            images: [
                'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
                'https://images.unsplash.com/photo-1587836374628-4a90e7d8e43f?w=600'
            ],
            category: 'digitales'
        },
        'aqua-infantil': {
            id: 'aqua-infantil',
            brand: 'Aqua',
            title: 'Reloj Aqua Infantil Resistente',
            collection: 'Kids',
            description: 'Reloj Aqua diseñado especialmente para niños. Resistente a golpes y salpicaduras. Colores vibrantes y correa cómoda.',
            price: 120000,
            images: ['https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600'],
            category: 'deportivos'
        },
        'casio-she3059': {
            id: 'casio-she3059',
            brand: 'Casio',
            title: 'Reloj Casio Sheen SHE-3059',
            collection: 'Sheen',
            description: 'Reloj Casio Sheen elegante para damas. Cristales Swarovski, acabado en acero y oro rosa. Perfecto para ocasiones especiales.',
            price: 780000,
            images: ['https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600'],
            category: 'clasicos'
        },
        'generico-minimalista': {
            id: 'generico-minimalista',
            brand: 'Genéricos',
            title: 'Reloj Clásico Minimalista',
            collection: 'Classic',
            description: 'Reloj minimalista con diseño atemporal. Perfecto para el día a día con un toque de elegancia.',
            price: 85000,
            images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600'],
            category: 'clasicos'
        },
        'skmei-elegante': {
            id: 'skmei-elegante',
            brand: 'Skmei',
            title: 'Reloj Skmei Elegante Damas',
            collection: 'Elegance',
            description: 'Reloj Skmei con diseño elegante para damas. Correa de malla de acero inoxidable.',
            price: 220000,
            images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600'],
            category: 'elegantes'
        },
        'qyq-sport': {
            id: 'qyq-sport',
            brand: 'QyQ',
            title: 'Reloj QyQ Sport Cronógrafo',
            collection: 'Sport',
            description: 'Reloj QyQ deportivo con cronógrafo. Resistente al agua hasta 50m. Diseño moderno y funcional.',
            price: 320000,
            images: ['https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600'],
            category: 'deportivos'
        }
    };

    // ========== UTILS ==========
    const $ = sel => document.querySelector(sel);
    const $$ = sel => [...document.querySelectorAll(sel)];
    const formatPrice = n => new Intl.NumberFormat('es-PY').format(n);
    
    const storage = {
        get: (k, d = null) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } },
        set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
    };

    // ========== TOAST NOTIFICATION (CORREGIDO) ==========
    function notify(msg, type = 'success') {
        // Remover toast anterior si existe
        const old = $('.pd-toast');
        if (old) old.remove();
        
        // Crear toast
        const toast = document.createElement('div');
        toast.className = `pd-toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${msg}</span>`;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3s
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== STATE ==========
    let currentProduct = null;
    let quantity = 1;

    // ========== INIT ==========
    function init() {
        loadProduct();
        initTheme();
        initCart();
        initMobileMenu();
        initCartModal();
        bindEvents();
        initCartSync();
        
        console.log('✅ Product Detail loaded');
    }

    // ========== CART SYNC ==========
    function initCartSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'ja_cart') {
                updateCartBadge();
                const modal = $('#cartModal');
                if (modal && modal.classList.contains('active')) {
                    renderCartModal();
                }
            }
        });
        
        window.addEventListener('focus', () => {
            updateCartBadge();
        });
    }

    // ========== LOAD PRODUCT ==========
    function loadProduct() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'casio-efr539';
        
        currentProduct = PRODUCTS[id] || PRODUCTS['casio-efr539'];
        
        renderProduct();
        renderRelated();
        updateFavoriteState();
    }

    function renderProduct() {
        const p = currentProduct;
        
        document.title = `${p.title} - JA Electrónica`;
        
        const bread = $('#breadcrumbProduct');
        if (bread) bread.textContent = p.title;
        
        $('#productBrand').textContent = p.brand.toUpperCase();
        $('#productTitle').textContent = p.title;
        $('#productCollection').textContent = p.collection;
        $('#productDescription').textContent = p.description;
        $('#productPrice').textContent = formatPrice(p.price);
        
        const mainImg = $('#mainProductImage');
        if (mainImg) {
            mainImg.src = p.images[0];
            mainImg.alt = p.title;
        }
        
        // Thumbnails
        const thumbs = $('#galleryThumbnails');
        if (thumbs) {
            thumbs.innerHTML = p.images.map((img, i) => `
                <div class="thumbnail-item ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${p.title} ${i + 1}">
                </div>
            `).join('');
            
            $$('.thumbnail-item').forEach(t => {
                t.onclick = () => {
                    const i = parseInt(t.dataset.index);
                    mainImg.src = p.images[i];
                    $$('.thumbnail-item').forEach(x => x.classList.remove('active'));
                    t.classList.add('active');
                };
            });
        }
    }

    function renderRelated() {
        const grid = $('#relatedProductsGrid');
        if (!grid) return;
        
        const related = Object.values(PRODUCTS)
            .filter(p => p.id !== currentProduct.id)
            .slice(0, 3);
        
        grid.innerHTML = related.map(p => `
            <article class="related-card" data-id="${p.id}">
                <div class="related-card-image">
                    <img src="${p.images[0]}" alt="${p.title}" loading="lazy">
                    <button class="related-wishlist-btn" data-id="${p.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="related-card-info">
                    <span class="related-card-brand">${p.brand}</span>
                    <h3 class="related-card-title">${p.title}</h3>
                    <span class="related-card-collection">${p.collection}</span>
                    <div class="related-card-footer">
                        <span class="related-card-price">₲ ${formatPrice(p.price)}</span>
                        <button class="related-cart-btn" data-id="${p.id}">
                            <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        
        // Card click
        $$('.related-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.related-wishlist-btn') || e.target.closest('.related-cart-btn')) return;
                window.location.href = `product-detail.html?id=${card.dataset.id}`;
            };
        });
        
        // Wishlist buttons
        $$('.related-wishlist-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(btn.dataset.id);
                updateRelatedFavorites();
            };
        });
        
        // Cart buttons
        $$('.related-cart-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                addToCart(btn.dataset.id);
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.cssText = 'background:#10b981;border-color:#10b981;color:white';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-shopping-bag"></i>';
                    btn.style.cssText = '';
                }, 1500);
            };
        });
        
        updateRelatedFavorites();
    }

    // ========== THEME ==========
    function initTheme() {
        const saved = localStorage.getItem('ja_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
        
        const toggle = $('#themeToggle');
        if (toggle) {
            toggle.onclick = () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('ja_theme', next);
                updateThemeIcon(next);
            };
        }
    }

    function updateThemeIcon(theme) {
        const icon = $('#themeToggle i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ========== MOBILE MENU ==========
    function initMobileMenu() {
        const hamburger = $('#hamburgerBtn');
        const menu = $('#pdMobileMenu');
        const overlay = $('#pdMobileMenuOverlay');
        const close = $('#pdMobileMenuClose');
        
        if (!hamburger || !menu) return;
        
        const openMenu = () => {
            menu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        
        const closeMenu = () => {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        hamburger.onclick = openMenu;
        if (close) close.onclick = closeMenu;
        if (overlay) overlay.onclick = closeMenu;
    }

    // ========== CART ==========
    function initCart() {
        updateCartBadge();
    }

    function initCartModal() {
        const btn = $('#cartBtn');
        const modal = $('#cartModal');
        const close = $('#cartCloseBtn');
        
        if (btn && modal) {
            btn.onclick = () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                renderCartModal();
            };
        }
        
        if (close) {
            close.onclick = () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            };
        }
        
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            };
        }
    }

    function addToCart(productId = null) {
        const p = productId ? PRODUCTS[productId] : currentProduct;
        if (!p) return;
        
        let cart = storage.get('ja_cart', []);
        const existing = cart.find(i => i.id === p.id);
        
        if (existing) {
            existing.quantity += productId ? 1 : quantity;
        } else {
            cart.push({
                id: p.id,
                title: p.title,
                brand: p.brand,
                price: p.price,
                image: p.images[0],
                quantity: productId ? 1 : quantity
            });
        }
        
        storage.set('ja_cart', cart);
        updateCartBadge();
        notify(`${p.title} agregado al carrito`);
    }

    function updateCartBadge() {
        const cart = storage.get('ja_cart', []);
        const total = cart.reduce((s, i) => s + i.quantity, 0);
        $$('.badge, .cart-count-badge').forEach(b => b.textContent = total);
    }

    function renderCartModal() {
        const cart = storage.get('ja_cart', []);
        const body = $('#cartModalBody');
        const footer = $('#cartModalFooter');
        const badge = $('#cartCountBadge');
        
        if (!body) return;
        
        if (badge) badge.textContent = cart.reduce((s, i) => s + i.quantity, 0);
        
        if (cart.length === 0) {
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
        
        body.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.brand} ${item.title}</div>
                    <div class="cart-item-price">₲ ${formatPrice(item.price)}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn cart-qty-dec" data-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" value="${item.quantity}" readonly>
                            <button class="quantity-btn cart-qty-inc" data-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const totalEl = $('#cartTotalPrice');
        if (totalEl) totalEl.textContent = `₲ ${formatPrice(total)}`;
        
        // Bind events
        $$('.cart-qty-dec').forEach(btn => {
            btn.onclick = () => updateCartQuantity(btn.dataset.id, -1);
        });
        
        $$('.cart-qty-inc').forEach(btn => {
            btn.onclick = () => updateCartQuantity(btn.dataset.id, 1);
        });
        
        $$('.cart-item-remove').forEach(btn => {
            btn.onclick = () => removeFromCart(btn.dataset.id);
        });
    }

    function updateCartQuantity(id, delta) {
        let cart = storage.get('ja_cart', []);
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            storage.set('ja_cart', cart);
            updateCartBadge();
            renderCartModal();
        }
    }

    function removeFromCart(id) {
        let cart = storage.get('ja_cart', []);
        cart = cart.filter(i => i.id !== id);
        storage.set('ja_cart', cart);
        updateCartBadge();
        renderCartModal();
        notify('Producto eliminado', 'info');
    }

    // ========== FAVORITES ==========
    function toggleFavorite(productId = null) {
        const p = productId ? PRODUCTS[productId] : currentProduct;
        if (!p) return;
        
        let favs = storage.get('ja_favorites', []);
        const idx = favs.findIndex(f => f.id === p.id);
        
        if (idx > -1) {
            favs.splice(idx, 1);
            notify('Eliminado de favoritos', 'info');
        } else {
            favs.push({
                id: p.id,
                title: p.title,
                brand: p.brand,
                price: p.price,
                image: p.images[0]
            });
            notify('Agregado a favoritos');
        }
        
        storage.set('ja_favorites', favs);
        updateFavoriteState();
    }

    function updateFavoriteState() {
        const favs = storage.get('ja_favorites', []);
        const isFav = favs.some(f => f.id === currentProduct.id);
        
        const btn = $('#addToFavoritesBtn');
        const gallery = $('#wishlistBtnGallery');
        
        if (btn) btn.classList.toggle('active', isFav);
        if (gallery) {
            gallery.classList.toggle('active', isFav);
            gallery.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
        }
    }

    function updateRelatedFavorites() {
        const favs = storage.get('ja_favorites', []);
        $$('.related-wishlist-btn').forEach(btn => {
            const isFav = favs.some(f => f.id === btn.dataset.id);
            btn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
        });
    }

    // ========== EVENTS ==========
    function bindEvents() {
        // Quantity
        const dec = $('#decreaseQty');
        const inc = $('#increaseQty');
        const input = $('#quantityInput');
        
        if (dec) dec.onclick = () => {
            if (quantity > 1) {
                quantity--;
                input.value = quantity;
            }
        };
        
        if (inc) inc.onclick = () => {
            if (quantity < 99) {
                quantity++;
                input.value = quantity;
            }
        };
        
        // Add to cart
        const cartBtn = $('#addToCartBtn');
        if (cartBtn) {
            cartBtn.onclick = () => {
                addToCart();
                const original = cartBtn.innerHTML;
                cartBtn.innerHTML = '<span>¡Agregado!</span><i class="fas fa-check"></i>';
                cartBtn.style.background = '#10b981';
                setTimeout(() => {
                    cartBtn.innerHTML = original;
                    cartBtn.style.background = '';
                }, 2000);
            };
        }
        
        // Favorites
        const favBtn = $('#addToFavoritesBtn');
        const favGallery = $('#wishlistBtnGallery');
        
        if (favBtn) favBtn.onclick = () => toggleFavorite();
        if (favGallery) favGallery.onclick = () => toggleFavorite();
        
        // Share
        const shareBtn = $('#shareBtn');
        if (shareBtn) {
            shareBtn.onclick = () => {
                const text = `¡Mira este ${currentProduct.title}! ₲ ${formatPrice(currentProduct.price)}`;
                const url = window.location.href;
                
                if (navigator.share) {
                    navigator.share({ title: currentProduct.title, text, url }).catch(() => {});
                } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                }
            };
        }
        
        // Search
        const search = $('#mainSearch');
        if (search) {
            search.onkeypress = (e) => {
                if (e.key === 'Enter' && search.value.trim()) {
                    window.location.href = `index.html?search=${encodeURIComponent(search.value.trim())}`;
                }
            };
        }
    }

    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
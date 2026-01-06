/**
 * user-panels.js - Sistema de paneles laterales integrado en index.html
 * Muestra favoritos y datos de usuario sin cambiar de página
 */
(function() {
    'use strict';

    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        storageKeys: {
            userData: 'ja_user_data',
            favorites: 'ja_favorites'
        }
    };

    const Utils = {
        $(selector, context = document) {
            return context.querySelector(selector);
        },
        $$(selector, context = document) {
            return [...context.querySelectorAll(selector)];
        },
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
        },
        formatNumber(num) {
            return new Intl.NumberFormat('es-PY').format(num);
        }
    };

    // ========== SISTEMA DE PANELES ==========
    const UserPanels = {
        overlay: null,
        panel: null,
        currentSection: null,

        init() {
            this.createPanelStructure();
            this.bindEvents();
            this.bindWishlistButtons();
            this.updateFavoritesCounter();
        },

        createPanelStructure() {
            // Crear HTML del panel
            const panelHTML = `
                <div class="user-panel-overlay" id="userPanelOverlay">
                    <div class="user-panel">
                        <div class="user-panel-header">
                            <h2 class="user-panel-title" id="userPanelTitle">
                                <i class="fas fa-user"></i>
                                <span>Mi Cuenta</span>
                            </h2>
                            <button class="user-panel-close" id="userPanelClose" aria-label="Cerrar panel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="user-panel-body" id="userPanelBody">
                            <!-- Contenido dinámico -->
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', panelHTML);

            this.overlay = Utils.$('#userPanelOverlay');
            this.panel = Utils.$('.user-panel');
        },

        bindEvents() {
            // Cerrar panel
            const closeBtn = Utils.$('#userPanelClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            // Cerrar con overlay
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });

            // Cerrar con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                    this.close();
                }
            });

            // Bind links del accordion con data-panel
            Utils.$$('.user-menu-link[data-panel]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const panel = link.dataset.panel;
                    this.showPanel(panel);
                });
            });
        },

        showPanel(section) {
            this.currentSection = section;
            
            // Actualizar título
            const titleEl = Utils.$('#userPanelTitle span');
            const iconEl = Utils.$('#userPanelTitle i');
            
            if (section === 'favoritos') {
                titleEl.textContent = 'Mis Favoritos';
                iconEl.className = 'fas fa-heart';
                this.renderFavoritos();
            } else if (section === 'datos') {
                titleEl.textContent = 'Mis Datos';
                iconEl.className = 'fas fa-user-edit';
                this.renderDatos();
            }

            // Mostrar panel
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        },

        // ========== RENDERIZAR FAVORITOS ==========
        renderFavoritos() {
            const body = Utils.$('#userPanelBody');
            const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);

            if (favorites.length === 0) {
                body.innerHTML = `
                    <div class="panel-empty-state">
                        <i class="fas fa-heart-broken"></i>
                        <h3>No tienes favoritos aún</h3>
                        <p>Haz clic en los corazones de los productos que te gusten</p>
                        <button onclick="document.getElementById('userPanelClose').click()">
                            <i class="fas fa-shopping-bag"></i>
                            Explorar Productos
                        </button>
                    </div>
                `;
                return;
            }

            body.innerHTML = `
                <div class="panel-info-header">
                    <div class="panel-info-count">
                        <strong>${favorites.length}</strong> ${favorites.length === 1 ? 'producto favorito' : 'productos favoritos'}
                    </div>
                </div>
                <div class="favorites-panel-grid" id="favoritesPanelGrid">
                    ${favorites.map(product => `
                        <div class="favorite-panel-card" data-id="${product.id}">
                            <div class="favorite-panel-image">
                                <img src="${product.image}" alt="${product.title}" loading="lazy">
                            </div>
                            <div class="favorite-panel-info">
                                <div class="favorite-panel-brand">${product.brand}</div>
                                <h3 class="favorite-panel-title">${product.title}</h3>
                                <div class="favorite-panel-price">₲ ${Utils.formatNumber(product.price)}</div>
                                <div class="favorite-panel-actions">
                                    <button class="btn-panel-add-cart" data-id="${product.id}">
                                        <i class="fas fa-shopping-cart"></i>
                                        Agregar
                                    </button>
                                    <button class="btn-panel-remove" data-id="${product.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            this.bindFavoritesActions();
        },

        bindFavoritesActions() {
            // Eliminar de favoritos
            Utils.$$('.btn-panel-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.dataset.id;
                    Favorites.removeFromFavorites(productId);
                    this.renderFavoritos();
                    this.updateFavoritesCounter();
                });
            });

            // Agregar al carrito
            Utils.$$('.btn-panel-add-cart').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.dataset.id;
                    const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
                    const product = favorites.find(item => item.id === productId);
                    
                    if (product && window.Cart) {
                        const tempCard = document.createElement('div');
                        tempCard.dataset.id = product.id;
                        tempCard.dataset.price = product.price;
                        
                        const tempTitle = document.createElement('div');
                        tempTitle.className = 'product-title-bristol';
                        tempTitle.textContent = product.title;
                        
                        const tempBrand = document.createElement('div');
                        tempBrand.className = 'product-brand-bristol';
                        tempBrand.textContent = product.brand;
                        
                        const tempImage = document.createElement('img');
                        tempImage.src = product.image;
                        const tempImageWrapper = document.createElement('div');
                        tempImageWrapper.className = 'product-image-bristol';
                        tempImageWrapper.appendChild(tempImage);
                        
                        tempCard.appendChild(tempImageWrapper);
                        tempCard.appendChild(tempBrand);
                        tempCard.appendChild(tempTitle);
                        
                        window.Cart.addItem(tempCard, btn);
                    }
                });
            });
        },

        // ========== RENDERIZAR DATOS ==========
        renderDatos() {
            const body = Utils.$('#userPanelBody');
            const userData = Utils.storage.get(CONFIG.storageKeys.userData, {});

            body.innerHTML = `
                <form id="panelUserDataForm">
                    <!-- Datos Personales -->
                    <div class="panel-form-card">
                        <h3 class="panel-form-title">
                            <i class="fas fa-id-card"></i>
                            Datos Personales
                        </h3>
                        <div class="panel-form-grid">
                            <div class="panel-form-group full-width">
                                <label for="panelFullName">Nombre Completo <span class="required">*</span></label>
                                <input type="text" id="panelFullName" value="${userData.fullName || ''}" required placeholder="Ej: Juan Pérez">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelRuc">RUC / CI</label>
                                <input type="text" id="panelRuc" value="${userData.ruc || ''}" placeholder="Ej: 5773607">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelPhone">Teléfono <span class="required">*</span></label>
                                <input type="tel" id="panelPhone" value="${userData.phone || ''}" required placeholder="+595 XXX XXX XXX">
                            </div>
                            <div class="panel-form-group full-width">
                                <label for="panelEmail">Email <span class="required">*</span></label>
                                <input type="email" id="panelEmail" value="${userData.email || ''}" required placeholder="ejemplo@email.com">
                            </div>
                        </div>
                    </div>

                    <!-- Dirección de Envío -->
                    <div class="panel-form-card">
                        <h3 class="panel-form-title">
                            <i class="fas fa-map-marker-alt"></i>
                            Dirección de Envío
                        </h3>
                        <div class="panel-form-grid">
                            <div class="panel-form-group">
                                <label for="panelCity">Ciudad <span class="required">*</span></label>
                                <input type="text" id="panelCity" value="${userData.city || ''}" required placeholder="Ej: Asunción">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelNeighborhood">Barrio</label>
                                <input type="text" id="panelNeighborhood" value="${userData.neighborhood || ''}" placeholder="Ej: Centro">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelDepartment">Departamento</label>
                                <select id="panelDepartment">
                                    <option value="">Seleccionar</option>
                                    <option value="central" ${userData.department === 'central' ? 'selected' : ''}>Central</option>
                                    <option value="asuncion" ${userData.department === 'asuncion' ? 'selected' : ''}>Asunción</option>
                                    <option value="alto_parana" ${userData.department === 'alto_parana' ? 'selected' : ''}>Alto Paraná</option>
                                    <option value="itapua" ${userData.department === 'itapua' ? 'selected' : ''}>Itapúa</option>
                                    <option value="caaguazu" ${userData.department === 'caaguazu' ? 'selected' : ''}>Caaguazú</option>
                                </select>
                            </div>
                            <div class="panel-form-group">
                                <label for="panelPostalCode">Código Postal</label>
                                <input type="text" id="panelPostalCode" value="${userData.postalCode || ''}" placeholder="Ej: 001224">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelStreet1">Calle Principal <span class="required">*</span></label>
                                <input type="text" id="panelStreet1" value="${userData.street1 || ''}" required placeholder="Ej: Av. Mariscal López">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelStreet2">Calle Secundaria</label>
                                <input type="text" id="panelStreet2" value="${userData.street2 || ''}" placeholder="Ej: Casi Brasil">
                            </div>
                            <div class="panel-form-group full-width">
                                <label for="panelHouseNumber">Número de Casa</label>
                                <input type="text" id="panelHouseNumber" value="${userData.houseNumber || ''}" placeholder="Ej: 1234">
                            </div>
                            <div class="panel-form-group full-width">
                                <label for="panelReference">Referencia (Opcional)</label>
                                <textarea id="panelReference" rows="2" placeholder="Ej: Casa de color azul, portón negro">${userData.reference || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Contacto Alternativo -->
                    <div class="panel-form-card">
                        <h3 class="panel-form-title">
                            <i class="fas fa-phone-alt"></i>
                            Contacto Alternativo
                        </h3>
                        <div class="panel-form-grid">
                            <div class="panel-form-group">
                                <label for="panelAltName">Nombre de Contacto</label>
                                <input type="text" id="panelAltName" value="${userData.altName || ''}" placeholder="Ej: María Pérez">
                            </div>
                            <div class="panel-form-group">
                                <label for="panelAltPhone">Teléfono Alternativo</label>
                                <input type="tel" id="panelAltPhone" value="${userData.altPhone || ''}" placeholder="+595 XXX XXX XXX">
                            </div>
                        </div>
                    </div>

                    <div class="panel-form-actions">
                        <button type="submit" class="btn-panel-primary">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                        <button type="reset" class="btn-panel-secondary">
                            <i class="fas fa-undo"></i>
                            Restablecer
                        </button>
                    </div>
                </form>
            `;

            this.bindFormEvents();
        },

        bindFormEvents() {
            const form = Utils.$('#panelUserDataForm');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUserData();
            });

            form.addEventListener('reset', () => {
                setTimeout(() => this.renderDatos(), 100);
            });
        },

        saveUserData() {
            const userData = {
                fullName: Utils.$('#panelFullName')?.value.trim() || '',
                ruc: Utils.$('#panelRuc')?.value.trim() || '',
                phone: Utils.$('#panelPhone')?.value.trim() || '',
                email: Utils.$('#panelEmail')?.value.trim() || '',
                city: Utils.$('#panelCity')?.value.trim() || '',
                neighborhood: Utils.$('#panelNeighborhood')?.value.trim() || '',
                department: Utils.$('#panelDepartment')?.value || '',
                postalCode: Utils.$('#panelPostalCode')?.value.trim() || '',
                street1: Utils.$('#panelStreet1')?.value.trim() || '',
                street2: Utils.$('#panelStreet2')?.value.trim() || '',
                houseNumber: Utils.$('#panelHouseNumber')?.value.trim() || '',
                reference: Utils.$('#panelReference')?.value.trim() || '',
                altName: Utils.$('#panelAltName')?.value.trim() || '',
                altPhone: Utils.$('#panelAltPhone')?.value.trim() || ''
            };

            // Validar campos requeridos
            const requiredFields = ['fullName', 'phone', 'email', 'city', 'street1'];
            const missingFields = requiredFields.filter(field => !userData[field]);

            if (missingFields.length > 0) {
                Utils.notify('Por favor, completa todos los campos requeridos', 'error');
                return;
            }

            // Guardar
            Utils.storage.set(CONFIG.storageKeys.userData, userData);
            Utils.notify('Datos guardados exitosamente', 'success');
        },

        // ========== SISTEMA DE FAVORITOS ==========
        bindWishlistButtons() {
            Utils.$$('.wishlist-btn-bristol').forEach(btn => {
                const card = btn.closest('.product-card-bristol');
                if (!card) return;

                const productId = card.dataset.id;
                
                // Actualizar estado inicial
                const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
                if (favorites.some(item => item.id === productId)) {
                    const icon = Utils.$('i', btn);
                    if (icon) {
                        icon.classList.replace('far', 'fas');
                        btn.classList.add('active');
                    }
                }

                // Click handler
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const productData = {
                        id: productId,
                        brand: Utils.$('.product-brand-bristol', card)?.textContent.trim() || '',
                        title: Utils.$('.product-title-bristol', card)?.textContent.trim() || '',
                        price: parseInt(card.dataset.price) || 0,
                        image: Utils.$('.product-image-bristol img', card)?.src || ''
                    };

                    Favorites.toggleFavorite(productData, btn);
                    this.updateFavoritesCounter();
                });
            });
        },

        updateFavoritesCounter() {
            const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
            const link = Utils.$('.user-menu-link[data-panel="favoritos"]');
            
            if (link) {
                // Remover contador existente
                const existingBadge = Utils.$('.favorite-count-badge', link);
                if (existingBadge) {
                    existingBadge.remove();
                }

                // Agregar nuevo contador si hay favoritos
                if (favorites.length > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'favorite-count-badge';
                    badge.textContent = favorites.length;
                    badge.style.cssText = `
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-left: auto;
                        background: var(--error);
                        color: white;
                        font-size: 0.75rem;
                        font-weight: 700;
                        padding: 2px 8px;
                        border-radius: 999px;
                        min-width: 20px;
                    `;
                    link.appendChild(badge);
                }
            }
        }
    };

    // ========== FAVORITOS (Compatible con sistema existente) ==========
    const Favorites = {
        toggleFavorite(productData, button) {
            const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
            const exists = favorites.find(item => item.id === productData.id);
            
            if (exists) {
                // Eliminar
                const newFavorites = favorites.filter(item => item.id !== productData.id);
                Utils.storage.set(CONFIG.storageKeys.favorites, newFavorites);
                
                const icon = Utils.$('i', button);
                if (icon) {
                    icon.classList.replace('fas', 'far');
                    button.classList.remove('active');
                }
                
                Utils.notify('Producto eliminado de favoritos', 'info');
            } else {
                // Agregar
                favorites.push(productData);
                Utils.storage.set(CONFIG.storageKeys.favorites, favorites);
                
                const icon = Utils.$('i', button);
                if (icon) {
                    icon.classList.replace('far', 'fas');
                    button.classList.add('active');
                }
                
                Utils.notify('Producto agregado a favoritos', 'success');
            }

            // Actualizar todas las instancias de wishlist buttons
            this.updateAllWishlistButtons();
        },

        removeFromFavorites(productId) {
            const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
            const newFavorites = favorites.filter(item => item.id !== productId);
            Utils.storage.set(CONFIG.storageKeys.favorites, newFavorites);
            
            // Actualizar botones
            this.updateAllWishlistButtons();
            
            Utils.notify('Producto eliminado de favoritos', 'info');
        },

        updateAllWishlistButtons() {
            const favorites = Utils.storage.get(CONFIG.storageKeys.favorites, []);
            
            Utils.$$('.wishlist-btn-bristol').forEach(btn => {
                const card = btn.closest('.product-card-bristol');
                if (!card) return;

                const productId = card.dataset.id;
                const icon = Utils.$('i', btn);
                if (!icon) return;

                if (favorites.some(item => item.id === productId)) {
                    icon.classList.replace('far', 'fas');
                    btn.classList.add('active');
                } else {
                    icon.classList.replace('fas', 'far');
                    btn.classList.remove('active');
                }
            });
        }
    };

    // ========== INICIALIZACIÓN ==========
    function init() {
        UserPanels.init();
        console.log('✅ User Panels System - Loaded');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
/**
 * auth-system.js - Sistema Completo de Autenticación
 * Login, Registro, Google Auth, Sesión, Carrito Sincronizado
 * Preparado para Supabase
 */
(function() {
    'use strict';

    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        storageKeys: {
            user: 'ja_current_user',
            guestCart: 'ja_guest_cart',
            userCart: 'ja_user_cart',
            session: 'ja_session_token'
        },
        redirectAfterLogin: null // URL para redirección después del login
    };

    // ========== UTILIDADES ==========
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
            },
            remove(key) {
                localStorage.removeItem(key);
            }
        },
        notify(message, type = 'success') {
            // Usar el sistema de notificaciones existente o crear uno simple
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Si existe el sistema de notificaciones de user-panels.js
            if (window.UserPanels && window.UserPanels.notify) {
                window.UserPanels.notify(message, type);
            }
        },
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        generateId() {
            return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    };

    // ========== SISTEMA DE AUTENTICACIÓN ==========
    const AuthSystem = {
        modal: null,
        currentTab: 'login',
        
        init() {
            this.createModalStructure();
            this.bindEvents();
            this.checkSession();
            this.updateUI();
        },

        // ========== CREAR ESTRUCTURA DEL MODAL ==========
        createModalStructure() {
            const modalHTML = `
                <div class="auth-modal-overlay" id="authModalOverlay">
                    <div class="auth-modal">
                        <!-- Header -->
                        <div class="auth-modal-header">
                            <h2 class="auth-modal-title">
                                <i class="bi bi-person-circle"></i>
                                <span>Iniciar Sesión</span>
                            </h2>
                            <button class="auth-close-btn" id="authCloseBtn" aria-label="Cerrar">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <!-- Tabs -->
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-tab="login">
                                <i class="bi bi-box-arrow-in-right"></i>
                                <span>Iniciar Sesión</span>
                            </button>
                            <button class="auth-tab" data-tab="register">
                                <i class="bi bi-person-plus"></i>
                                <span>Registrarse</span>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="auth-modal-body">
                            <!-- Loading -->
                            <div class="auth-loading" id="authLoading">
                                <div class="auth-spinner"></div>
                            </div>

                            <!-- Login Form -->
                            <form class="auth-form active" id="loginForm" data-form="login">
                                <div class="auth-error-message" id="loginError">
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                    <span></span>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-envelope"></i>
                                        <span>Email <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-envelope"></i>
                                        <input 
                                            type="email" 
                                            class="auth-form-input" 
                                            id="loginEmail"
                                            placeholder="tu@email.com"
                                            required
                                            autocomplete="email"
                                        >
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-lock"></i>
                                        <span>Contraseña <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-lock"></i>
                                        <input 
                                            type="password" 
                                            class="auth-form-input" 
                                            id="loginPassword"
                                            placeholder="Tu contraseña"
                                            required
                                            autocomplete="current-password"
                                        >
                                        <button type="button" class="auth-password-toggle" data-target="loginPassword">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-checkbox-group">
                                    <input type="checkbox" id="loginRemember">
                                    <label for="loginRemember">Mantenerme conectado</label>
                                </div>

                                <button type="submit" class="auth-submit-btn">
                                    <i class="bi bi-box-arrow-in-right"></i>
                                    <span>Iniciar Sesión</span>
                                </button>

                                <a href="#" class="auth-forgot-link">¿Olvidaste tu contraseña?</a>

                                <div class="auth-divider">o continúa con</div>

                                <button type="button" class="auth-google-btn" id="googleLoginBtn">
                                    <i class="bi bi-google"></i>
                                    <span>Continuar con Google</span>
                                </button>
                            </form>

                            <!-- Register Form -->
                            <form class="auth-form" id="registerForm" data-form="register">
                                <div class="auth-error-message" id="registerError">
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                    <span></span>
                                </div>

                                <div class="auth-success-message" id="registerSuccess">
                                    <i class="bi bi-check-circle-fill"></i>
                                    <span></span>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-person"></i>
                                        <span>Nombre Completo <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-person"></i>
                                        <input 
                                            type="text" 
                                            class="auth-form-input" 
                                            id="registerName"
                                            placeholder="Juan Pérez"
                                            required
                                            autocomplete="name"
                                        >
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-envelope"></i>
                                        <span>Email <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-envelope"></i>
                                        <input 
                                            type="email" 
                                            class="auth-form-input" 
                                            id="registerEmail"
                                            placeholder="tu@email.com"
                                            required
                                            autocomplete="email"
                                        >
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-lock"></i>
                                        <span>Contraseña <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-lock"></i>
                                        <input 
                                            type="password" 
                                            class="auth-form-input" 
                                            id="registerPassword"
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                            autocomplete="new-password"
                                            minlength="6"
                                        >
                                        <button type="button" class="auth-password-toggle" data-target="registerPassword">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="bi bi-lock-fill"></i>
                                        <span>Confirmar Contraseña <span class="required">*</span></span>
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="auth-input-icon bi bi-lock-fill"></i>
                                        <input 
                                            type="password" 
                                            class="auth-form-input" 
                                            id="registerPasswordConfirm"
                                            placeholder="Repite tu contraseña"
                                            required
                                            autocomplete="new-password"
                                        >
                                        <button type="button" class="auth-password-toggle" data-target="registerPasswordConfirm">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-checkbox-group">
                                    <input type="checkbox" id="registerTerms" required>
                                    <label for="registerTerms">Acepto los términos y condiciones</label>
                                </div>

                                <button type="submit" class="auth-submit-btn">
                                    <i class="bi bi-person-plus"></i>
                                    <span>Crear Cuenta</span>
                                </button>

                                <div class="auth-divider">o regístrate con</div>

                                <button type="button" class="auth-google-btn" id="googleRegisterBtn">
                                    <i class="bi bi-google"></i>
                                    <span>Registrarse con Google</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.modal = Utils.$('#authModalOverlay');
        },

        // ========== BIND EVENTS ==========
        bindEvents() {
            // Cerrar modal
            const closeBtn = Utils.$('#authCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Cerrar con overlay
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Cerrar con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });

            // Tabs
            Utils.$$('.auth-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.tab;
                    this.switchTab(tabName);
                });
            });

            // Password Toggle
            Utils.$$('.auth-password-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.dataset.target;
                    const input = Utils.$(`#${targetId}`);
                    const icon = Utils.$('i', btn);
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.replace('bi-eye', 'bi-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.replace('bi-eye-slash', 'bi-eye');
                    }
                });
            });

            // Forms
            const loginForm = Utils.$('#loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            const registerForm = Utils.$('#registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // Google Auth
            Utils.$$('.auth-google-btn').forEach(btn => {
                btn.addEventListener('click', () => this.handleGoogleAuth());
            });

            // Bind login/logout buttons en el sidebar
            this.bindAuthMenuButtons();
        },

        // ========== BIND AUTH MENU BUTTONS ==========
        bindAuthMenuButtons() {
            // Buscar el botón de login/logout en el accordion
            const userAccordion = Utils.$('.user-section-accordion');
            if (!userAccordion) return;

            // Crear botón de login si no existe sesión
            this.createAuthButton();
        },

        createAuthButton() {
            const userMenu = Utils.$('.user-menu-list');
            if (!userMenu) return;

            // Limpiar botón anterior si existe
            const existingAuthBtn = Utils.$('.auth-menu-item-dynamic');
            if (existingAuthBtn) {
                existingAuthBtn.remove();
            }

            const currentUser = this.getCurrentUser();

            if (currentUser) {
                // Usuario logueado - Mostrar info del usuario
                const sessionInfo = document.createElement('div');
                sessionInfo.className = 'user-session-info active auth-menu-item-dynamic';
                sessionInfo.innerHTML = `
                    <div class="user-session-card">
                        <div class="user-avatar">
                            ${currentUser.avatar ? 
                                `<img src="${currentUser.avatar}" alt="${currentUser.name}">` : 
                                currentUser.name.charAt(0).toUpperCase()
                            }
                        </div>
                        <div class="user-info">
                            <div class="user-name" title="${currentUser.name}">${currentUser.name}</div>
                            <div class="user-email" title="${currentUser.email}">${currentUser.email}</div>
                        </div>
                    </div>
                `;

                // Insertar antes del primer elemento
                userMenu.insertBefore(sessionInfo, userMenu.firstChild);

                // Actualizar el botón de cerrar sesión para que sea visible
                const logoutLink = Utils.$('.logout-link', userMenu);
                if (logoutLink) {
                    logoutLink.style.display = '';
                    logoutLink.onclick = (e) => {
                        e.preventDefault();
                        this.handleLogout();
                    };
                }
            } else {
                // Usuario NO logueado - Mostrar botón de login
                const loginItem = document.createElement('li');
                loginItem.className = 'auth-menu-item-dynamic';
                loginItem.innerHTML = `
                    <button class="auth-menu-item">
                        <i class="bi bi-box-arrow-in-right"></i>
                        <span>Iniciar Sesión</span>
                    </button>
                `;

                // Insertar al principio
                userMenu.insertBefore(loginItem, userMenu.firstChild);

                const loginBtn = Utils.$('.auth-menu-item', loginItem);
                loginBtn.addEventListener('click', () => {
                    this.openModal('login');
                });

                // Ocultar botón de logout si existe
                const logoutLink = Utils.$('.logout-link', userMenu);
                if (logoutLink) {
                    logoutLink.style.display = 'none';
                }
            }
        },

        // ========== MODAL CONTROL ==========
        openModal(tab = 'login', redirectUrl = null) {
            if (redirectUrl) {
                CONFIG.redirectAfterLogin = redirectUrl;
            }
            
            this.switchTab(tab);
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            this.clearForms();
            CONFIG.redirectAfterLogin = null;
        },

        switchTab(tabName) {
            this.currentTab = tabName;

            // Update tabs
            Utils.$$('.auth-tab').forEach(tab => {
                if (tab.dataset.tab === tabName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            // Update forms
            Utils.$$('.auth-form').forEach(form => {
                if (form.dataset.form === tabName) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });

            // Update title
            const title = Utils.$('.auth-modal-title span');
            if (title) {
                title.textContent = tabName === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
            }
        },

        clearForms() {
            Utils.$$('.auth-form').forEach(form => {
                form.reset();
            });
            Utils.$$('.auth-error-message, .auth-success-message').forEach(msg => {
                msg.classList.remove('active');
            });
        },

        // ========== HANDLE LOGIN ==========
        async handleLogin() {
            const email = Utils.$('#loginEmail').value.trim();
            const password = Utils.$('#loginPassword').value;
            const remember = Utils.$('#loginRemember').checked;

            // Validación
            if (!Utils.validateEmail(email)) {
                this.showError('login', 'Por favor ingresa un email válido');
                return;
            }

            if (password.length < 6) {
                this.showError('login', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            this.showLoading(true);

            try {
                // SIMULACIÓN - Aquí iría la integración con Supabase
                await this.simulateApiCall();

                // Por ahora, crear usuario demo
                const user = {
                    id: Utils.generateId(),
                    name: email.split('@')[0],
                    email: email,
                    avatar: null,
                    loginMethod: 'email',
                    createdAt: new Date().toISOString()
                };

                this.setCurrentUser(user);
                this.mergeGuestCartToUser();
                this.updateUI();

                Utils.notify('¡Bienvenido de nuevo!', 'success');
                
                this.showLoading(false);
                this.closeModal();

                // Redirección si existe
                if (CONFIG.redirectAfterLogin) {
                    window.location.href = CONFIG.redirectAfterLogin;
                }

            } catch (error) {
                this.showLoading(false);
                this.showError('login', error.message || 'Error al iniciar sesión');
            }
        },

        // ========== HANDLE REGISTER ==========
        async handleRegister() {
            const name = Utils.$('#registerName').value.trim();
            const email = Utils.$('#registerEmail').value.trim();
            const password = Utils.$('#registerPassword').value;
            const passwordConfirm = Utils.$('#registerPasswordConfirm').value;
            const terms = Utils.$('#registerTerms').checked;

            // Validación
            if (!name || name.length < 2) {
                this.showError('register', 'Por favor ingresa tu nombre completo');
                return;
            }

            if (!Utils.validateEmail(email)) {
                this.showError('register', 'Por favor ingresa un email válido');
                return;
            }

            if (password.length < 6) {
                this.showError('register', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (password !== passwordConfirm) {
                this.showError('register', 'Las contraseñas no coinciden');
                return;
            }

            if (!terms) {
                this.showError('register', 'Debes aceptar los términos y condiciones');
                return;
            }

            this.showLoading(true);

            try {
                // SIMULACIÓN - Aquí iría la integración con Supabase
                await this.simulateApiCall();

                // Crear usuario
                const user = {
                    id: Utils.generateId(),
                    name: name,
                    email: email,
                    avatar: null,
                    loginMethod: 'email',
                    createdAt: new Date().toISOString()
                };

                this.setCurrentUser(user);
                this.mergeGuestCartToUser();

                this.showLoading(false);
                this.showSuccess('register', '¡Cuenta creada exitosamente!');

                setTimeout(() => {
                    this.updateUI();
                    Utils.notify('¡Bienvenido a JA Electrónica!', 'success');
                    this.closeModal();

                    if (CONFIG.redirectAfterLogin) {
                        window.location.href = CONFIG.redirectAfterLogin;
                    }
                }, 1500);

            } catch (error) {
                this.showLoading(false);
                this.showError('register', error.message || 'Error al crear la cuenta');
            }
        },

        // ========== HANDLE GOOGLE AUTH ==========
        async handleGoogleAuth() {
            // NOTA: Aquí iría la integración con Supabase Google OAuth
            // Por ahora, simulación
            
            this.showLoading(true);

            try {
                await this.simulateApiCall();

                // Usuario demo de Google
                const user = {
                    id: Utils.generateId(),
                    name: 'Usuario Google',
                    email: 'usuario@gmail.com',
                    avatar: null,
                    loginMethod: 'google',
                    createdAt: new Date().toISOString()
                };

                this.setCurrentUser(user);
                this.mergeGuestCartToUser();
                this.updateUI();

                Utils.notify('¡Sesión iniciada con Google!', 'success');
                
                this.showLoading(false);
                this.closeModal();

                if (CONFIG.redirectAfterLogin) {
                    window.location.href = CONFIG.redirectAfterLogin;
                }

            } catch (error) {
                this.showLoading(false);
                this.showError(this.currentTab, 'Error al conectar con Google');
            }
        },

        // ========== HANDLE LOGOUT ==========
        handleLogout() {
            if (!confirm('¿Estás seguro que deseas cerrar sesión?')) {
                return;
            }

            // Guardar carrito del usuario antes de cerrar sesión
            const currentUser = this.getCurrentUser();
            if (currentUser && window.Cart) {
                const currentCart = window.Cart.items || [];
                Utils.storage.set(`${CONFIG.storageKeys.userCart}_${currentUser.id}`, currentCart);
            }

            // Limpiar sesión
            Utils.storage.remove(CONFIG.storageKeys.user);
            Utils.storage.remove(CONFIG.storageKeys.session);

            // Limpiar carrito actual y cargar carrito invitado si existe
            if (window.Cart) {
                window.Cart.items = [];
                
                // Actualizar UI solo si existe la función
                if (window.Cart.updateUI) {
                    window.Cart.updateUI();
                } else if (window.Cart.render) {
                    window.Cart.render();
                }
                
                // Restaurar carrito invitado si existe
                const guestCart = Utils.storage.get(CONFIG.storageKeys.guestCart, []);
                if (guestCart.length > 0) {
                    window.Cart.items = guestCart;
                    if (window.Cart.updateUI) {
                        window.Cart.updateUI();
                    } else if (window.Cart.render) {
                        window.Cart.render();
                    }
                }
            }

            this.updateUI();
            Utils.notify('Sesión cerrada correctamente', 'info');

            // Redireccionar a inicio
            if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                window.location.href = 'index.html';
            }
        },

        // ========== CARRITO SINCRONIZADO ==========
        mergeGuestCartToUser() {
            if (!window.Cart) return;

            const guestCart = Utils.storage.get(CONFIG.storageKeys.guestCart, []);
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) return;

            // Cargar carrito del usuario
            const userCart = Utils.storage.get(`${CONFIG.storageKeys.userCart}_${currentUser.id}`, []);

            // Fusionar carritos (evitar duplicados)
            const mergedCart = [...userCart];
            
            guestCart.forEach(guestItem => {
                const exists = mergedCart.find(item => item.id === guestItem.id);
                if (!exists) {
                    mergedCart.push(guestItem);
                } else {
                    // Sumar cantidades si el producto ya existe
                    exists.quantity = (exists.quantity || 1) + (guestItem.quantity || 1);
                }
            });

            // Actualizar carrito del usuario
            Utils.storage.set(`${CONFIG.storageKeys.userCart}_${currentUser.id}`, mergedCart);
            
            // Limpiar carrito invitado
            Utils.storage.remove(CONFIG.storageKeys.guestCart);

            // Actualizar carrito actual
            window.Cart.items = mergedCart;
            
            // Actualizar UI solo si existe la función
            if (window.Cart.updateUI) {
                window.Cart.updateUI();
            } else if (window.Cart.render) {
                window.Cart.render();
            }
        },

        saveCurrentCart() {
            if (!window.Cart) return;

            const currentUser = this.getCurrentUser();
            const currentCart = window.Cart.items || [];

            if (currentUser) {
                // Guardar en carrito de usuario
                Utils.storage.set(`${CONFIG.storageKeys.userCart}_${currentUser.id}`, currentCart);
            } else {
                // Guardar en carrito invitado
                Utils.storage.set(CONFIG.storageKeys.guestCart, currentCart);
            }
        },

        loadUserCart() {
            if (!window.Cart) return;

            const currentUser = this.getCurrentUser();

            if (currentUser) {
                // Cargar carrito del usuario
                const userCart = Utils.storage.get(`${CONFIG.storageKeys.userCart}_${currentUser.id}`, []);
                window.Cart.items = userCart;
                if (window.Cart.updateUI) {
                    window.Cart.updateUI();
                } else if (window.Cart.render) {
                    window.Cart.render();
                }
            } else {
                // Cargar carrito invitado
                const guestCart = Utils.storage.get(CONFIG.storageKeys.guestCart, []);
                window.Cart.items = guestCart;
                if (window.Cart.updateUI) {
                    window.Cart.updateUI();
                } else if (window.Cart.render) {
                    window.Cart.render();
                }
            }
        },

        // ========== GESTIÓN DE SESIÓN ==========
        getCurrentUser() {
            return Utils.storage.get(CONFIG.storageKeys.user);
        },

        setCurrentUser(user) {
            Utils.storage.set(CONFIG.storageKeys.user, user);
            Utils.storage.set(CONFIG.storageKeys.session, {
                token: Utils.generateId(),
                createdAt: new Date().toISOString()
            });
        },

        checkSession() {
            const user = this.getCurrentUser();
            const session = Utils.storage.get(CONFIG.storageKeys.session);

            if (user && session) {
                // Sesión válida - cargar carrito del usuario
                this.loadUserCart();
                return true;
            } else {
                // Sin sesión - cargar carrito invitado
                this.loadUserCart();
                return false;
            }
        },

        isLoggedIn() {
            return !!this.getCurrentUser();
        },

        requireAuth(redirectUrl = null) {
            if (!this.isLoggedIn()) {
                this.openModal('login', redirectUrl);
                return false;
            }
            return true;
        },

        // ========== UI UPDATES ==========
        updateUI() {
            this.createAuthButton();
        },

        showError(formType, message) {
            const errorEl = Utils.$(`#${formType}Error`);
            if (errorEl) {
                Utils.$('span', errorEl).textContent = message;
                errorEl.classList.add('active');
                
                setTimeout(() => {
                    errorEl.classList.remove('active');
                }, 5000);
            }
        },

        showSuccess(formType, message) {
            const successEl = Utils.$(`#${formType}Success`);
            if (successEl) {
                Utils.$('span', successEl).textContent = message;
                successEl.classList.add('active');
            }
        },

        showLoading(show) {
            const loading = Utils.$('#authLoading');
            const forms = Utils.$$('.auth-form');
            
            if (show) {
                loading.classList.add('active');
                forms.forEach(form => form.style.display = 'none');
            } else {
                loading.classList.remove('active');
                forms.forEach(form => form.style.display = '');
            }
        },

        // ========== SIMULACIÓN API ==========
        simulateApiCall() {
            return new Promise(resolve => {
                setTimeout(resolve, 1500);
            });
        }
    };

    // ========== INTEGRACIÓN CON CARRITO ==========
    function integrateWithCart() {
        // Interceptar el botón de "Finalizar Pedido"
        document.addEventListener('click', (e) => {
            const checkoutBtn = e.target.closest('a[href="checkout.html"]');
            if (checkoutBtn) {
                e.preventDefault();
                
                if (!AuthSystem.isLoggedIn()) {
                    AuthSystem.openModal('login', 'checkout.html');
                    Utils.notify('Inicia sesión para finalizar tu compra', 'info');
                } else {
                    window.location.href = 'checkout.html';
                }
            }
        });

        // Guardar carrito al agregar/eliminar productos
        if (window.Cart) {
            const originalAddItem = window.Cart.addItem;
            const originalRemoveItem = window.Cart.removeItem;

            window.Cart.addItem = function(...args) {
                const result = originalAddItem.apply(this, args);
                AuthSystem.saveCurrentCart();
                return result;
            };

            window.Cart.removeItem = function(...args) {
                const result = originalRemoveItem.apply(this, args);
                AuthSystem.saveCurrentCart();
                return result;
            };
        }
    }

    // ========== INICIALIZACIÓN ==========
    function init() {
        AuthSystem.init();
        integrateWithCart();
        
        // Exponer AuthSystem globalmente
        window.AuthSystem = AuthSystem;
        
        console.log('✅ Auth System - Loaded');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
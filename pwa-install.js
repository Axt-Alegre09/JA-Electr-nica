/**
 * pwa-install.js - Sistema de instalación PWA con popup
 * Muestra prompt de instalación en dispositivos compatibles
 */
(function() {
    'use strict';

    // ========== CONFIGURACIÓN ==========
    const CONFIG = {
        storageKey: 'ja_pwa_install_dismissed',
        showDelay: 3000, // 3 segundos después de cargar
        daysUntilPrompt: 7 // Días hasta volver a mostrar si se rechaza
    };

    let deferredPrompt = null;

    // ========== UTILIDADES ==========
    const Utils = {
        $(selector) {
            return document.querySelector(selector);
        },
        storage: {
            get(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch {
                    return null;
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
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        isIOS() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        },
        isStandalone() {
            return window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone === true;
        }
    };

    // ========== PWA INSTALL SYSTEM ==========
    const PWAInstall = {
        init() {
            // No mostrar si ya está instalado
            if (Utils.isStandalone()) {
                console.log('[PWA] App already installed');
                return;
            }

            // Verificar si fue rechazado recientemente
            if (this.wasRecentlyDismissed()) {
                console.log('[PWA] Install prompt was recently dismissed');
                return;
            }

            // iOS: Mostrar instrucciones manuales
            if (Utils.isIOS()) {
                setTimeout(() => this.showIOSInstructions(), CONFIG.showDelay);
                return;
            }

            // Android/Desktop: Esperar evento beforeinstallprompt
            this.setupInstallPrompt();
        },

        setupInstallPrompt() {
            window.addEventListener('beforeinstallprompt', (e) => {
                console.log('[PWA] beforeinstallprompt event fired');
                
                // Prevenir el prompt automático
                e.preventDefault();
                
                // Guardar el evento para usarlo después
                deferredPrompt = e;
                
                // Mostrar nuestro popup personalizado después del delay
                setTimeout(() => this.showInstallPopup(), CONFIG.showDelay);
            });

            // Escuchar cuando se instala
            window.addEventListener('appinstalled', () => {
                console.log('[PWA] App was installed');
                deferredPrompt = null;
                this.hideInstallPopup();
            });
        },

        showInstallPopup() {
            // Crear HTML del popup
            const popupHTML = `
                <div class="pwa-install-overlay" id="pwaInstallOverlay">
                    <div class="pwa-install-popup">
                        <button class="pwa-close-btn" id="pwaCloseBtn" aria-label="Cerrar">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <div class="pwa-install-content">
                            <div class="pwa-install-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            
                            <h3 class="pwa-install-title">Instalar JA Electrónica</h3>
                            
                            <p class="pwa-install-description">
                                Instala nuestra app para acceder más rápido y disfrutar de:
                            </p>
                            
                            <ul class="pwa-install-features">
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>Acceso rápido desde tu pantalla de inicio</span>
                                </li>
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>Funciona sin conexión</span>
                                </li>
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>Experiencia de app nativa</span>
                                </li>
                                <li>
                                    <i class="fas fa-check-circle"></i>
                                    <span>Notificaciones de ofertas exclusivas</span>
                                </li>
                            </ul>
                            
                            <div class="pwa-install-actions">
                                <button class="pwa-install-btn" id="pwaInstallBtn">
                                    <i class="fas fa-download"></i>
                                    <span>Instalar Ahora</span>
                                </button>
                                <button class="pwa-dismiss-btn" id="pwaDismissBtn">
                                    Más tarde
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Insertar en el body
            document.body.insertAdjacentHTML('beforeend', popupHTML);

            // Añadir estilos inline si no existen
            this.injectStyles();

            // Bind events
            this.bindPopupEvents();

            // Mostrar con animación
            setTimeout(() => {
                const overlay = Utils.$('#pwaInstallOverlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
            }, 100);
        },

        showIOSInstructions() {
            const popupHTML = `
                <div class="pwa-install-overlay ios" id="pwaInstallOverlay">
                    <div class="pwa-install-popup">
                        <button class="pwa-close-btn" id="pwaCloseBtn" aria-label="Cerrar">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <div class="pwa-install-content">
                            <div class="pwa-install-icon">
                                <i class="fab fa-apple"></i>
                            </div>
                            
                            <h3 class="pwa-install-title">Añadir a Pantalla de Inicio</h3>
                            
                            <p class="pwa-install-description">
                                Para instalar esta app en tu iPhone:
                            </p>
                            
                            <ol class="pwa-ios-steps">
                                <li>
                                    <span>1.</span>
                                    <div>
                                        Toca el botón <strong>Compartir</strong>
                                        <i class="fas fa-share" style="margin-left:8px;color:var(--primary);"></i>
                                    </div>
                                </li>
                                <li>
                                    <span>2.</span>
                                    <div>
                                        Selecciona <strong>"Añadir a pantalla de inicio"</strong>
                                        <i class="fas fa-plus-square" style="margin-left:8px;color:var(--primary);"></i>
                                    </div>
                                </li>
                                <li>
                                    <span>3.</span>
                                    <div>Toca <strong>"Añadir"</strong> en la esquina superior derecha</div>
                                </li>
                            </ol>
                            
                            <button class="pwa-dismiss-btn" id="pwaDismissBtn">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', popupHTML);
            this.injectStyles();
            this.bindPopupEvents();

            setTimeout(() => {
                const overlay = Utils.$('#pwaInstallOverlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
            }, 100);
        },

        bindPopupEvents() {
            const overlay = Utils.$('#pwaInstallOverlay');
            const closeBtn = Utils.$('#pwaCloseBtn');
            const installBtn = Utils.$('#pwaInstallBtn');
            const dismissBtn = Utils.$('#pwaDismissBtn');

            // Cerrar con botón X
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.dismissPopup();
                });
            }

            // Cerrar con overlay
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.dismissPopup();
                    }
                });
            }

            // Botón instalar
            if (installBtn) {
                installBtn.addEventListener('click', () => {
                    this.installApp();
                });
            }

            // Botón "Más tarde"
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    this.dismissPopup();
                });
            }

            // Cerrar con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const overlay = Utils.$('#pwaInstallOverlay');
                    if (overlay && overlay.classList.contains('active')) {
                        this.dismissPopup();
                    }
                }
            });
        },

        async installApp() {
            if (!deferredPrompt) {
                console.log('[PWA] No deferred prompt available');
                return;
            }

            // Mostrar el prompt nativo
            deferredPrompt.prompt();

            // Esperar la respuesta del usuario
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`[PWA] User response: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt');
            } else {
                console.log('[PWA] User dismissed the install prompt');
                this.saveDismissedState();
            }

            // Limpiar el prompt
            deferredPrompt = null;
            this.hideInstallPopup();
        },

        dismissPopup() {
            this.saveDismissedState();
            this.hideInstallPopup();
        },

        hideInstallPopup() {
            const overlay = Utils.$('#pwaInstallOverlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        },

        saveDismissedState() {
            Utils.storage.set(CONFIG.storageKey, {
                dismissed: true,
                timestamp: Date.now()
            });
        },

        wasRecentlyDismissed() {
            const state = Utils.storage.get(CONFIG.storageKey);
            if (!state || !state.dismissed) {
                return false;
            }

            const daysSinceDismissal = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
            return daysSinceDismissal < CONFIG.daysUntilPrompt;
        },

        injectStyles() {
            // Verificar si ya existen los estilos
            if (Utils.$('#pwa-install-styles')) {
                return;
            }

            const styles = `
                <style id="pwa-install-styles">
                    .pwa-install-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(8px);
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1.5rem;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                    }
                    
                    .pwa-install-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    .pwa-install-popup {
                        background: var(--bg-surface, #ffffff);
                        border-radius: 1.5rem;
                        max-width: 420px;
                        width: 100%;
                        position: relative;
                        transform: scale(0.9) translateY(20px);
                        transition: transform 0.3s ease;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }
                    
                    .pwa-install-overlay.active .pwa-install-popup {
                        transform: scale(1) translateY(0);
                    }
                    
                    .pwa-close-btn {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        width: 36px;
                        height: 36px;
                        background: var(--bg-muted, #f1f5f9);
                        border: none;
                        border-radius: 50%;
                        color: var(--text-secondary, #64748b);
                        font-size: 1.125rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        z-index: 10;
                    }
                    
                    .pwa-close-btn:hover {
                        background: var(--border-light, #e2e8f0);
                        transform: rotate(90deg);
                    }
                    
                    .pwa-install-content {
                        padding: 2.5rem 2rem 2rem;
                        text-align: center;
                    }
                    
                    .pwa-install-icon {
                        width: 72px;
                        height: 72px;
                        background: linear-gradient(135deg, #1e293b, #0f172a);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                        font-size: 2rem;
                        color: white;
                    }
                    
                    .pwa-install-overlay.ios .pwa-install-icon {
                        background: linear-gradient(135deg, #000000, #1a1a1a);
                    }
                    
                    .pwa-install-title {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: var(--text-primary, #0f172a);
                        margin-bottom: 1rem;
                    }
                    
                    .pwa-install-description {
                        font-size: 0.9375rem;
                        color: var(--text-secondary, #64748b);
                        line-height: 1.6;
                        margin-bottom: 1.5rem;
                    }
                    
                    .pwa-install-features {
                        list-style: none;
                        padding: 0;
                        margin: 0 0 2rem;
                        text-align: left;
                    }
                    
                    .pwa-install-features li {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.75rem;
                        padding: 0.625rem 0;
                        font-size: 0.875rem;
                        color: var(--text-primary, #0f172a);
                    }
                    
                    .pwa-install-features li i {
                        color: #10b981;
                        font-size: 1.125rem;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    
                    .pwa-ios-steps {
                        list-style: none;
                        padding: 0;
                        margin: 0 0 2rem;
                        text-align: left;
                    }
                    
                    .pwa-ios-steps li {
                        display: flex;
                        gap: 1rem;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                        background: var(--bg-muted, #f8fafc);
                        border-radius: 0.75rem;
                        font-size: 0.875rem;
                        color: var(--text-primary, #0f172a);
                    }
                    
                    .pwa-ios-steps li > span:first-child {
                        width: 28px;
                        height: 28px;
                        background: var(--primary, #1e293b);
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 0.875rem;
                        flex-shrink: 0;
                    }
                    
                    .pwa-ios-steps strong {
                        color: var(--primary, #1e293b);
                    }
                    
                    .pwa-install-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    
                    .pwa-install-btn {
                        width: 100%;
                        padding: 1rem;
                        background: linear-gradient(135deg, #1e293b, #0f172a);
                        color: white;
                        border: none;
                        border-radius: 0.75rem;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        font-family: inherit;
                        transition: all 0.2s ease;
                    }
                    
                    .pwa-install-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px rgba(30, 41, 59, 0.3);
                    }
                    
                    .pwa-dismiss-btn {
                        width: 100%;
                        padding: 0.875rem;
                        background: transparent;
                        color: var(--text-secondary, #64748b);
                        border: none;
                        border-radius: 0.75rem;
                        font-size: 0.9375rem;
                        font-weight: 600;
                        cursor: pointer;
                        font-family: inherit;
                        transition: all 0.2s ease;
                    }
                    
                    .pwa-dismiss-btn:hover {
                        background: var(--bg-muted, #f1f5f9);
                        color: var(--text-primary, #0f172a);
                    }
                    
                    /* Dark mode support */
                    [data-theme="dark"] .pwa-install-popup {
                        background: var(--bg-surface, #1e293b);
                    }
                    
                    [data-theme="dark"] .pwa-install-title {
                        color: var(--text-primary, #f1f5f9);
                    }
                    
                    [data-theme="dark"] .pwa-install-features li,
                    [data-theme="dark"] .pwa-ios-steps li {
                        color: var(--text-primary, #f1f5f9);
                    }
                    
                    [data-theme="dark"] .pwa-ios-steps li {
                        background: var(--bg-elevated, #334155);
                    }
                    
                    /* Mobile adjustments */
                    @media (max-width: 479px) {
                        .pwa-install-overlay {
                            padding: 1rem;
                        }
                        
                        .pwa-install-content {
                            padding: 2rem 1.5rem 1.5rem;
                        }
                        
                        .pwa-install-title {
                            font-size: 1.25rem;
                        }
                        
                        .pwa-install-icon {
                            width: 64px;
                            height: 64px;
                            font-size: 1.75rem;
                        }
                    }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        }
    };

    // ========== INICIALIZACIÓN ==========
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                PWAInstall.init();
            });
        } else {
            PWAInstall.init();
        }

        console.log('✅ PWA Install System - Loaded');
    }

    init();
})();
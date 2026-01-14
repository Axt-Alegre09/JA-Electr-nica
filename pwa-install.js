/**
 * pwa-install-simple.js - VERSIÓN DE PRUEBA FORZADA
 * Esta versión SIEMPRE muestra el popup para verificar que funciona
 */
(function() {
    'use strict';

    console.log('🔧 PWA Install SIMPLE - Loading...');

    // Esperar 2 segundos y mostrar popup
    setTimeout(() => {
        console.log('🔧 Showing test popup NOW');
        showTestPopup();
    }, 2000);

    function showTestPopup() {
        // Crear HTML del popup
        const popupHTML = `
            <div class="pwa-test-overlay" id="pwaTestOverlay">
                <div class="pwa-test-popup">
                    <button class="pwa-test-close" id="pwaTestClose">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="pwa-test-content">
                        <div class="pwa-test-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        
                        <h3>Instalar JA Electrónica</h3>
                        
                        <p>Instala nuestra app para acceder más rápido</p>
                        
                        <ul class="pwa-test-features">
                            <li>✓ Acceso rápido desde tu pantalla</li>
                            <li>✓ Funciona sin conexión</li>
                            <li>✓ Experiencia de app nativa</li>
                        </ul>
                        
                        <button class="pwa-test-install-btn" id="pwaTestInstall">
                            <i class="fas fa-download"></i>
                            Instalar Ahora
                        </button>
                        
                        <button class="pwa-test-dismiss-btn" id="pwaTestDismiss">
                            Más tarde
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Añadir estilos
        const styles = `
            <style id="pwa-test-styles">
                .pwa-test-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .pwa-test-popup {
                    background: white;
                    border-radius: 1.5rem;
                    max-width: 400px;
                    width: 100%;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .pwa-test-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 36px;
                    height: 36px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 50%;
                    color: #64748b;
                    font-size: 1.125rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                
                .pwa-test-close:hover {
                    background: #e2e8f0;
                    transform: rotate(90deg);
                }
                
                .pwa-test-content {
                    padding: 2.5rem 2rem 2rem;
                    text-align: center;
                }
                
                .pwa-test-icon {
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
                
                .pwa-test-content h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 1rem;
                }
                
                .pwa-test-content p {
                    font-size: 0.9375rem;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                
                .pwa-test-features {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 2rem;
                    text-align: left;
                }
                
                .pwa-test-features li {
                    padding: 0.5rem 0;
                    font-size: 0.875rem;
                    color: #0f172a;
                }
                
                .pwa-test-install-btn {
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
                    margin-bottom: 0.75rem;
                }
                
                .pwa-test-install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(30, 41, 59, 0.3);
                }
                
                .pwa-test-dismiss-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: transparent;
                    color: #64748b;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                }
                
                .pwa-test-dismiss-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                
                [data-theme="dark"] .pwa-test-popup {
                    background: #1e293b;
                }
                
                [data-theme="dark"] .pwa-test-content h3,
                [data-theme="dark"] .pwa-test-features li {
                    color: #f1f5f9;
                }
                
                @media (max-width: 479px) {
                    .pwa-test-overlay {
                        padding: 1rem;
                    }
                    
                    .pwa-test-content {
                        padding: 2rem 1.5rem 1.5rem;
                    }
                    
                    .pwa-test-content h3 {
                        font-size: 1.25rem;
                    }
                }
            </style>
        `;

        // Insertar estilos y HTML
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        console.log('✅ Test popup inserted into DOM');

        // Bind events
        const overlay = document.getElementById('pwaTestOverlay');
        const closeBtn = document.getElementById('pwaTestClose');
        const installBtn = document.getElementById('pwaTestInstall');
        const dismissBtn = document.getElementById('pwaTestDismiss');

        function closePopup() {
            console.log('Closing test popup');
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }

        closeBtn.addEventListener('click', closePopup);
        dismissBtn.addEventListener('click', closePopup);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePopup();
            }
        });

        installBtn.addEventListener('click', () => {
            console.log('Install button clicked!');
            alert('¡Función de instalación! En producción, esto activaría el prompt nativo de instalación.');
            closePopup();
        });

        console.log('✅ Test popup events bound');
    }

    console.log('✅ PWA Install SIMPLE - Loaded');
})();
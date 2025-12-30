// ===================================
// BRANDS SHOWCASE - JAVASCRIPT FINAL
// Sistema premium con logos reales
// Integrado con JA Electrónica
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initBrandsShowcase();
    initBrandsMegaMenu();
});

// ===========================================
// MEGA MENU - Mostrar/ocultar sección al hover
// ===========================================
function initBrandsMegaMenu() {
    const brandsLink = document.querySelector('.main-nav a[href="#brands"]');
    const brandsShowcase = document.querySelector('.brands-showcase');
    
    if (!brandsLink || !brandsShowcase) {
        console.warn('⚠️ No se encontró el link de Marcas o la sección brands-showcase');
        return;
    }
    
    let hideTimeout;
    
    // Mostrar al hacer hover sobre el link
    brandsLink.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        brandsShowcase.classList.add('show');
    });
    
    // Ocultar al salir del link
    brandsLink.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            // Solo ocultar si el mouse no está sobre la sección
            if (!brandsShowcase.matches(':hover')) {
                brandsShowcase.classList.remove('show');
            }
        }, 200);
    });
    
    // Mantener visible si el mouse está sobre la sección
    brandsShowcase.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        brandsShowcase.classList.add('show');
    });
    
    // Ocultar al salir de la sección
    brandsShowcase.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            brandsShowcase.classList.remove('show');
        }, 200);
    });
    
    // Click en el link también muestra/oculta
    brandsLink.addEventListener('click', (e) => {
        e.preventDefault();
        brandsShowcase.classList.toggle('show');
    });
    
    console.log('✓ Mega menú de marcas inicializado');
}

function initBrandsShowcase() {
    const brandCards = document.querySelectorAll('.brand-card');
    
    if (!brandCards.length) {
        console.warn('⚠️ No se encontraron brand-cards. Asegúrate de agregar el HTML de la sección de marcas.');
        return;
    }
    
    brandCards.forEach(card => {
        // Click event - Filtrar productos
        card.addEventListener('click', (e) => {
            const brandName = card.getAttribute('data-brand');
            createRippleEffect(e, card);
            filterByBrand(brandName, card);
        });
        
        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const brandName = card.getAttribute('data-brand');
                const rect = card.getBoundingClientRect();
                const fakeEvent = {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                };
                createRippleEffect(fakeEvent, card);
                filterByBrand(brandName, card);
            }
        });
    });
    
    console.log('✓ Brands Showcase inicializado correctamente');
}

// ===========================================
// CREAR EFECTO RIPPLE AL CLICK
// ===========================================
function createRippleEffect(event, card) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    card.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===========================================
// FILTRAR PRODUCTOS POR MARCA
// ===========================================
function filterByBrand(brand, clickedCard) {
    // Remover active de todas las tarjetas de marca
    document.querySelectorAll('.brand-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Marcar la tarjeta seleccionada
    clickedCard.classList.add('active');
    
    // Sincronizar con sidebar si existe
    syncSidebarFilters(brand);
    
    // Aplicar filtro de productos con animación
    animateProductFilter(brand);
    
    // Actualizar contador de productos
    updateProductCount();
    
    // Mostrar notificación premium
    showBrandNotification(brand, clickedCard);
    
    // Scroll suave hacia productos
    scrollToProducts();
}

// ===========================================
// SINCRONIZAR FILTROS DEL SIDEBAR
// ===========================================
function syncSidebarFilters(brand) {
    const sidebarLinks = document.querySelectorAll('.filter-link[data-brand]');
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-brand') === brand) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===========================================
// ANIMAR FILTRADO DE PRODUCTOS
// ===========================================
function animateProductFilter(brand) {
    const products = document.querySelectorAll('.product-card-bristol, .product-card');
    let delay = 0;
    
    products.forEach((product) => {
        const productBrand = product.getAttribute('data-brand');
        
        if (productBrand === brand) {
            // Mostrar producto con animación escalonada
            product.style.display = 'flex';
            product.classList.add('filter-match');
            
            setTimeout(() => {
                product.style.animation = 'none';
                product.offsetHeight; // Trigger reflow
                product.style.animation = 'fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }, delay);
            
            delay += 50; // 50ms entre cada producto
        } else {
            // Ocultar producto
            product.style.display = 'none';
            product.classList.remove('filter-match');
        }
    });
}

// ===========================================
// SCROLL SUAVE HACIA PRODUCTOS
// ===========================================
function scrollToProducts() {
    const productsSection = document.querySelector('.products-grid-bristol, .products-grid, .main-content-bristol');
    
    if (productsSection) {
        setTimeout(() => {
            const offset = 120; // Offset para no quedar pegado arriba
            const elementPosition = productsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }, 300);
    }
}

// ===========================================
// ACTUALIZAR CONTADOR DE PRODUCTOS
// ===========================================
function updateProductCount() {
    const visibleProducts = document.querySelectorAll('.product-card-bristol[style*="display: flex"], .product-card[style*="display: flex"]').length;
    const productCountEl = document.querySelector('.product-count');
    
    if (productCountEl) {
        productCountEl.textContent = `${visibleProducts} artículos`;
        
        // Animación del contador
        productCountEl.style.transition = 'all 0.3s ease';
        productCountEl.style.transform = 'scale(1.3)';
        productCountEl.style.color = '#2563eb';
        productCountEl.style.fontWeight = '700';
        
        setTimeout(() => {
            productCountEl.style.transform = 'scale(1)';
            productCountEl.style.color = '';
            productCountEl.style.fontWeight = '';
        }, 400);
    }
}

// ===========================================
// MOSTRAR NOTIFICACIÓN PREMIUM
// ===========================================
function showBrandNotification(brand, card) {
    const brandName = card.querySelector('.brand-name').textContent;
    const brandCount = card.querySelector('.brand-count').textContent;
    
    // Remover notificaciones anteriores
    const existingNotification = document.querySelector('.brand-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = 'brand-notification';
    notification.innerHTML = `
        <div class="brand-notification-content">
            <div class="notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="brand-notification-text">
                <strong>Filtrando por ${brandName}</strong>
                <span>${brandCount} disponibles</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// ===========================================
// LIMPIAR FILTRO DE MARCA (FUNCIÓN GLOBAL)
// ===========================================
function clearBrandFilter() {
    // Remover active de todas las tarjetas
    document.querySelectorAll('.brand-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Remover active de sidebar
    document.querySelectorAll('.filter-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar todos los productos
    const products = document.querySelectorAll('.product-card-bristol, .product-card');
    products.forEach(product => {
        product.style.display = 'flex';
        product.classList.remove('filter-match');
        product.style.animation = '';
    });
    
    updateProductCount();
    
    // Notificación de limpieza
    const notification = document.createElement('div');
    notification.className = 'brand-notification info';
    notification.innerHTML = `
        <div class="brand-notification-content">
            <div class="notification-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="brand-notification-text">
                <strong>Filtros limpiados</strong>
                <span>Mostrando todos los productos</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Exportar función para uso global
window.clearBrandFilter = clearBrandFilter;
window.filterByBrandFromShowcase = filterByBrand;

// ===========================================
// ESTILOS DINÁMICOS INYECTADOS
// ===========================================
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Animación de productos entrando */
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    /* ======================================
       NOTIFICACIÓN PREMIUM
       ====================================== */
    .brand-notification {
        position: fixed;
        top: 100px;
        right: -450px;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        box-shadow: 
            0 12px 32px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        transition: right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        min-width: 320px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }
    
    .brand-notification.info {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }
    
    .brand-notification.show {
        right: 24px;
    }
    
    .brand-notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
    }
    
    .notification-icon {
        font-size: 1.75rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        animation: iconPulse 2s ease-in-out infinite;
    }
    
    @keyframes iconPulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(255, 255, 255, 0);
        }
    }
    
    .brand-notification-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
    }
    
    .brand-notification-text strong {
        font-size: 1.0625rem;
        font-weight: 700;
        letter-spacing: -0.01em;
    }
    
    .brand-notification-text span {
        font-size: 0.9375rem;
        opacity: 0.95;
    }
    
    .notification-close {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.2);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
    }
    
    .notification-close:hover {
        background: rgba(0, 0, 0, 0.3);
        transform: scale(1.1);
    }
    
    .notification-close:active {
        transform: scale(0.95);
    }
    
    /* ======================================
       RESPONSIVE NOTIFICACIÓN
       ====================================== */
    @media (max-width: 768px) {
        .brand-notification {
            top: 80px;
            right: -380px;
            min-width: 300px;
            padding: 1rem 1.25rem;
        }
        
        .brand-notification.show {
            right: 16px;
        }
        
        .notification-icon {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
        }
        
        .brand-notification-text strong {
            font-size: 1rem;
        }
        
        .brand-notification-text span {
            font-size: 0.875rem;
        }
    }
    
    @media (max-width: 480px) {
        .brand-notification {
            min-width: calc(100% - 32px);
            left: 16px;
            right: 16px;
            top: 70px;
        }
        
        .brand-notification.show {
            right: 16px;
        }
        
        .notification-icon {
            width: 36px;
            height: 36px;
            font-size: 1.25rem;
        }
        
        .brand-notification-text strong {
            font-size: 0.9375rem;
        }
        
        .brand-notification-text span {
            font-size: 0.8125rem;
        }
    }
`;
document.head.appendChild(dynamicStyles);

console.log('✅ Brands Showcase cargado - Versión Premium con logos reales');
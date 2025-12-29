// ==========================================
// SCRIPT.JS - JA ELECTRÓNICA
// Sistema de Menú Hamburguesa Mejorado
// ==========================================

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeIcon = themeToggle.querySelector('i');

const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

if (currentTheme === 'dark') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    themeToggle.classList.add('rotating');
    
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    setTimeout(() => {
        themeToggle.classList.remove('rotating');
    }, 500);
});

// ==========================================
// SIDEBAR HAMBURGUESA - CONTROLES
// ==========================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const filtersSidebar = document.getElementById('filtersSidebar');
const overlay = document.getElementById('overlay');

// Abrir sidebar
function openSidebar() {
    filtersSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar sidebar
function closeSidebar() {
    filtersSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event listeners para abrir/cerrar
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
    });
}

// Cerrar al hacer click en overlay
if (overlay) {
    overlay.addEventListener('click', closeSidebar);
}

// Cerrar al presionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersSidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// Prevenir cierre al hacer click dentro del sidebar
if (filtersSidebar) {
    filtersSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ==========================================
// FILTROS DEL SIDEBAR
// ==========================================
const filterLinks = document.querySelectorAll('.filter-link');
const filterCheckbox = document.getElementById('withDiscount');

// Filtros por marca
filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Toggle active state
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Obtener tipo de filtro
        const brand = link.getAttribute('data-brand');
        const special = link.getAttribute('data-special');
        const gender = link.getAttribute('data-gender');
        
        if (brand) {
            filterByBrand(brand);
        } else if (special) {
            filterBySpecial(special);
        } else if (gender) {
            filterByGender(gender);
        }
        
        // En móvil, cerrar sidebar después de seleccionar
        if (window.innerWidth < 992) {
            setTimeout(closeSidebar, 300);
        }
    });
});

function filterByBrand(brand) {
    const products = document.querySelectorAll('.product-card-bristol');
    
    products.forEach(product => {
        const productBrand = product.getAttribute('data-brand');
        
        if (productBrand === brand) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
    
    updateProductCount();
}

function filterBySpecial(special) {
    const products = document.querySelectorAll('.product-card-bristol');
    
    products.forEach(product => {
        const badge = product.querySelector('.product-badge-bristol');
        let showProduct = false;
        
        if (special === 'sale' && badge && badge.classList.contains('sale')) {
            showProduct = true;
        } else if (special === 'new' && badge && badge.classList.contains('new')) {
            showProduct = true;
        }
        
        product.style.display = showProduct ? 'flex' : 'none';
    });
    
    updateProductCount();
}

function filterByGender(gender) {
    const products = document.querySelectorAll('.product-card-bristol');
    
    products.forEach(product => {
        const productGender = product.getAttribute('data-gender');
        
        if (productGender === gender) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
    
    updateProductCount();
}

// Filtro con descuento
if (filterCheckbox) {
    filterCheckbox.addEventListener('change', () => {
        const products = document.querySelectorAll('.product-card-bristol');
        
        products.forEach(product => {
            const hasDiscount = product.querySelector('.product-badge-bristol.sale') !== null;
            
            if (filterCheckbox.checked) {
                product.style.display = hasDiscount ? 'flex' : 'none';
            } else {
                product.style.display = 'flex';
            }
        });
        
        updateProductCount();
    });
}

// Actualizar contador de productos
function updateProductCount() {
    const visibleProducts = document.querySelectorAll('.product-card-bristol[style*="display: flex"]').length;
    const productCountEl = document.querySelector('.product-count');
    if (productCountEl) {
        productCountEl.textContent = `${visibleProducts} artículos`;
    }
}

// Limpiar todos los filtros
function clearAllFilters() {
    // Remover active de todos los links
    filterLinks.forEach(link => link.classList.remove('active'));
    
    // Desmarcar checkbox
    if (filterCheckbox) {
        filterCheckbox.checked = false;
    }
    
    // Mostrar todos los productos
    const products = document.querySelectorAll('.product-card-bristol');
    products.forEach(product => {
        product.style.display = 'flex';
    });
    
    updateProductCount();
}

// ==========================================
// USER DROPDOWN MENU
// ==========================================
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
const mainSearch = document.getElementById('mainSearch');

if (mainSearch) {
    let searchTimeout;
    
    mainSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
    
    mainSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = mainSearch.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card-bristol');
    
    products.forEach(product => {
        const brandAttr = product.getAttribute('data-brand');
        const titleEl = product.querySelector('.product-title-bristol');
        const categoryEl = product.querySelector('.product-brand-bristol');
        
        if (!brandAttr || !titleEl || !categoryEl) return;
        
        const brand = brandAttr.toLowerCase();
        const title = titleEl.textContent.toLowerCase();
        const category = categoryEl.textContent.toLowerCase();
        
        if (!searchTerm || brand.includes(searchTerm) || title.includes(searchTerm) || category.includes(searchTerm)) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
    
    updateProductCount();
}

// ==========================================
// SORT FUNCTIONALITY
// ==========================================
const sortSelect = document.getElementById('sortSelect');

if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        sortProducts(sortValue);
    });
}

function sortProducts(sortType) {
    const grid = document.getElementById('productsGrid');
    const products = Array.from(document.querySelectorAll('.product-card-bristol'));
    
    products.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price')) || 0;
        const priceB = parseInt(b.getAttribute('data-price')) || 0;
        const ratingA = a.querySelectorAll('.product-rating-bristol .fas.fa-star').length;
        const ratingB = b.querySelectorAll('.product-rating-bristol .fas.fa-star').length;
        
        switch(sortType) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'rating':
                return ratingB - ratingA;
            case 'popular':
                const ratingElA = a.querySelector('.product-rating-bristol span');
                const ratingElB = b.querySelector('.product-rating-bristol span');
                if (!ratingElA || !ratingElB) return 0;
                const reviewsA = parseInt(ratingElA.textContent.match(/\d+/)?.[0] || '0');
                const reviewsB = parseInt(ratingElB.textContent.match(/\d+/)?.[0] || '0');
                return reviewsB - reviewsA;
            default:
                return 0;
        }
    });
    
    products.forEach(product => grid.appendChild(product));
}

// ==========================================
// WISHLIST FUNCTIONALITY
// ==========================================
const wishlistBtns = document.querySelectorAll('.wishlist-btn-bristol');

wishlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.classList.add('active');
            
            // Animación
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.classList.remove('active');
        }
    });
});

// ==========================================
// ADD TO CART FUNCTIONALITY
// ==========================================
const addCartBtns = document.querySelectorAll('.btn-add-cart-bristol');
const cartBadge = document.querySelector('.cart-btn .badge');

addCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Actualizar badge del carrito
        if (cartBadge) {
            let currentCount = parseInt(cartBadge.textContent) || 0;
            cartBadge.textContent = currentCount + 1;
            
            // Animación del badge
            cartBadge.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartBadge.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Cambiar estado del botón
        const originalHTML = btn.innerHTML;
        const originalBg = btn.style.background;
        
        btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
        btn.style.background = 'var(--success)';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = originalBg;
            btn.disabled = false;
        }, 2000);
    });
});

// ==========================================
// LOAD MORE FUNCTIONALITY
// ==========================================
const loadMoreBtn = document.getElementById('loadMore');

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            loadMoreBtn.innerHTML = 'Ver Más Productos <i class="fas fa-chevron-down"></i>';
            loadMoreBtn.disabled = false;
            alert('Aquí cargarías más productos desde tu backend');
        }, 1500);
    });
}

// ==========================================
// RESPONSIVE HANDLERS
// ==========================================

// Cerrar sidebar al cambiar de tamaño de ventana
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    }, 250);
});

// Prevenir scroll en body cuando sidebar está abierto
function updateBodyScroll() {
    if (filtersSidebar && filtersSidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Observer para cambios en el sidebar
if (filtersSidebar) {
    const observer = new MutationObserver(updateBodyScroll);
    observer.observe(filtersSidebar, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
}

// ==========================================
// TOUCH GESTURES PARA MÓVIL
// ==========================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 100;
    const diff = touchEndX - touchStartX;
    
    // Swipe desde la izquierda para abrir
    if (diff > swipeThreshold && touchStartX < 50 && !filtersSidebar.classList.contains('active')) {
        openSidebar();
    }
    
    // Swipe hacia la izquierda para cerrar
    if (diff < -swipeThreshold && filtersSidebar.classList.contains('active')) {
        closeSidebar();
    }
}

// ==========================================
// SCROLL TO TOP
// ==========================================
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mostrar botón de scroll to top cuando se hace scroll
let scrollTopBtn;
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.onclick = scrollToTop;
            document.body.appendChild(scrollTopBtn);
        }
        scrollTopBtn.style.display = 'flex';
    } else if (scrollTopBtn) {
        scrollTopBtn.style.display = 'none';
    }
});

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('JA Electrónica - Sistema cargado correctamente');
    updateProductCount();
    
    // Verificar que todos los elementos existen
    console.log('Hamburger Button:', hamburgerBtn ? '✓' : '✗');
    console.log('Sidebar:', filtersSidebar ? '✓' : '✗');
    console.log('Overlay:', overlay ? '✓' : '✗');
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
                console.warn(`Operación lenta detectada: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['measure'] });
}
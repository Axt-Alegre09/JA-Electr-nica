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

// Hamburger Menu
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const overlay = document.getElementById('overlay');

hamburgerBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close menu when clicking overlay or outside
overlay.addEventListener('click', closeMenu);

// Detect touch/click outside sidebar
document.addEventListener('click', (e) => {
    if (sidebarMenu.classList.contains('active') && 
        !sidebarMenu.contains(e.target) && 
        !hamburgerBtn.contains(e.target)) {
        closeMenu();
    }
});

function closeMenu() {
    sidebarMenu.classList.remove('active');
    filtersSidebar.classList.remove('active');
    overlay.classList.remove('active');
    userDropdown.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// User Dropdown Menu
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
        userDropdown.classList.remove('active');
    }
});

// Search Functionality
const mainSearch = document.getElementById('mainSearch');

mainSearch.addEventListener('input', () => {
    performSearch();
});

mainSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = mainSearch.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card, .product-card-bristol');
    
    products.forEach(product => {
        const brandAttr = product.getAttribute('data-brand');
        if (!brandAttr) return;
        const brand = brandAttr.toLowerCase();
        const titleEl = product.querySelector('.product-title, .product-title-bristol');
        const categoryEl = product.querySelector('.product-brand, .product-brand-bristol');
        if (!titleEl || !categoryEl) return;
        const title = titleEl.textContent.toLowerCase();
        const category = categoryEl.textContent.toLowerCase();
        
        if (!searchTerm || brand.includes(searchTerm) || title.includes(searchTerm) || category.includes(searchTerm)) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
}

// Brand Filter from Sidebar
const brandLinks = document.querySelectorAll('.sidebar-nav a[data-brand]');
brandLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        brandLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const brand = link.getAttribute('data-brand');
        filterByBrand(brand);
        closeMenu();
    });
});

function filterByBrand(brand) {
    const products = document.querySelectorAll('.product-card, .product-card-bristol');
    
    products.forEach(product => {
        const productBrand = product.getAttribute('data-brand');
        
        if (brand === 'all' || productBrand === brand) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
}

// Quick Filters
const quickFilters = document.querySelectorAll('.quick-filter');
quickFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        quickFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        const filterType = filter.getAttribute('data-type');
        applyQuickFilter(filterType);
    });
});

function applyQuickFilter(type) {
    const products = document.querySelectorAll('.product-card, .product-card-bristol');
    
    products.forEach(product => {
        const hasDiscount = product.querySelector('.product-badge.sale, .product-badge-bristol.sale') !== null;
        const isNew = product.querySelector('.product-badge.new, .product-badge-bristol.new') !== null;
        
        switch(type) {
            case 'ofertas':
                product.style.display = hasDiscount ? 'flex' : 'none';
                break;
            case 'nuevos':
                product.style.display = isNew ? 'flex' : 'none';
                break;
            case 'mas-vendidos':
                product.style.display = 'flex';
                break;
            default:
                product.style.display = 'flex';
        }
    });
}

// Sort Select
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        sortProducts(sortValue);
    });
}

function sortProducts(sortType) {
    const grid = document.getElementById('productsGrid');
    const products = Array.from(document.querySelectorAll('.product-card, .product-card-bristol'));
    
    products.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price')) || 0;
        const priceB = parseInt(b.getAttribute('data-price')) || 0;
        const ratingA = a.querySelectorAll('.product-rating .fas.fa-star, .product-rating-bristol .fas.fa-star').length;
        const ratingB = b.querySelectorAll('.product-rating .fas.fa-star, .product-rating-bristol .fas.fa-star').length;
        
        switch(sortType) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'rating':
                return ratingB - ratingA;
            case 'popular':
                const ratingElA = a.querySelector('.product-rating span, .product-rating-bristol span');
                const ratingElB = b.querySelector('.product-rating span, .product-rating-bristol span');
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

// Filters Sidebar (Bristol style)
const filterBtn = document.getElementById('filterBtn');
const filtersSidebar = document.getElementById('filtersSidebar');

if (filterBtn && filtersSidebar) {
    filterBtn.addEventListener('click', () => {
        filtersSidebar.classList.toggle('active');
        if (overlay) {
            overlay.classList.toggle('active');
        }
        document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Hamburger button para mostrar sidebar en móvil (Bristol style)
if (hamburgerBtn && filtersSidebar) {
    hamburgerBtn.addEventListener('click', (e) => {
        // Solo si no existe el sidebar-menu, usar filtersSidebar
        if (!sidebarMenu || sidebarMenu.offsetParent === null) {
            filtersSidebar.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active');
            }
            document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : 'auto';
        }
    });
}

// Auto-apply filters on change
const genderCheckboxes = document.querySelectorAll('input[name="gender"]');
const materialCheckboxes = document.querySelectorAll('input[name="material"]');
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');

genderCheckboxes.forEach(cb => cb.addEventListener('change', applyAllFilters));
materialCheckboxes.forEach(cb => cb.addEventListener('change', applyAllFilters));
priceMin.addEventListener('input', applyAllFilters);
priceMax.addEventListener('input', applyAllFilters);

function applyAllFilters() {
    const selectedGenders = Array.from(document.querySelectorAll('input[name="gender"]:checked')).map(cb => cb.value);
    const selectedMaterials = Array.from(document.querySelectorAll('input[name="material"]:checked')).map(cb => cb.value);
    const minPrice = priceMin.value ? parseInt(priceMin.value) : 0;
    const maxPrice = priceMax.value ? parseInt(priceMax.value) : Infinity;
    
    const products = document.querySelectorAll('.product-card, .product-card-bristol');
    
    products.forEach(product => {
        const productGender = product.getAttribute('data-gender');
        const productMaterial = product.getAttribute('data-material');
        const productPrice = parseInt(product.getAttribute('data-price'));
        
        let showProduct = true;
        
        if (selectedGenders.length > 0 && !selectedGenders.includes(productGender)) {
            showProduct = false;
        }
        
        if (selectedMaterials.length > 0 && !selectedMaterials.includes(productMaterial)) {
            showProduct = false;
        }
        
        if (productPrice < minPrice || productPrice > maxPrice) {
            showProduct = false;
        }
        
        product.style.display = showProduct ? 'flex' : 'none';
    });
}

// Clear Filters
const btnClearFilters = document.getElementById('btnClearFilters');
if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';
        if (priceFrom) priceFrom.value = '';
        if (priceTo) priceTo.value = '';
        
        document.querySelectorAll('.product-card, .product-card-bristol').forEach(product => {
            product.style.display = 'flex';
        });
    });
}

// Wishlist (soporta ambos estilos)
const wishlistBtns = document.querySelectorAll('.wishlist-btn, .wishlist-btn-bristol');
wishlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.classList.add('active');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.classList.remove('active');
        }
    });
});

// Add to Cart
const addCartBtns = document.querySelectorAll('.btn-add-cart');
addCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const cartBadge = document.querySelector('.cart-btn .badge');
        let currentCount = parseInt(cartBadge.textContent);
        cartBadge.textContent = currentCount + 1;
        
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
        btn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = 'var(--primary-color)';
        }, 2000);
    });
});

// Load More
const loadMoreBtn = document.getElementById('loadMore');
loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    
    setTimeout(() => {
        loadMoreBtn.innerHTML = 'Ver Más Productos <i class="fas fa-chevron-down"></i>';
        alert('Aquí cargarías más productos desde tu backend');
    }, 1500);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('JA Electrónica - Sitio cargado correctamente');
    initCarousel();
});
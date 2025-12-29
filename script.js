// ===================================
// CONFIGURACIÓN INICIAL
// ===================================
console.log('🚀 Iniciando JA Electrónica...');

// ===================================
// THEME TOGGLE
// ===================================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
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
        
        const current = htmlElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        
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
}

// ===================================
// MENU LATERAL Y OVERLAY
// ===================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const filtersSidebar = document.getElementById('filtersSidebar');
const overlay = document.getElementById('overlay');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

function closeMenu() {
    if (filtersSidebar) filtersSidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (userDropdown) userDropdown.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (hamburgerBtn && filtersSidebar && overlay) {
    hamburgerBtn.addEventListener('click', () => {
        filtersSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : 'auto';
    });
}

if (overlay) {
    overlay.addEventListener('click', closeMenu);
}

// ===================================
// USER DROPDOWN
// ===================================
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

// ===================================
// BÚSQUEDA
// ===================================
const mainSearch = document.getElementById('mainSearch');

if (mainSearch) {
    mainSearch.addEventListener('input', performSearch);
    mainSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function performSearch() {
    if (!mainSearch) return;
    
    const searchTerm = mainSearch.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card-bristol');
    
    products.forEach(product => {
        const brand = product.getAttribute('data-brand')?.toLowerCase() || '';
        const title = product.querySelector('.product-title-bristol')?.textContent.toLowerCase() || '';
        const category = product.querySelector('.product-brand-bristol')?.textContent.toLowerCase() || '';
        
        if (!searchTerm || brand.includes(searchTerm) || title.includes(searchTerm) || category.includes(searchTerm)) {
            product.style.display = 'flex';
        } else {
            product.style.display = 'none';
        }
    });
}

// ===================================
// ORDENAR PRODUCTOS
// ===================================
const sortSelect = document.getElementById('sortSelect');

if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        sortProducts(sortSelect.value);
    });
}

function sortProducts(sortType) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const products = Array.from(document.querySelectorAll('.product-card-bristol'));
    
    products.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price')) || 0;
        const priceB = parseInt(b.getAttribute('data-price')) || 0;
        
        switch(sortType) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'rating':
                const ratingA = a.querySelectorAll('.product-rating-bristol .fas.fa-star').length;
                const ratingB = b.querySelectorAll('.product-rating-bristol .fas.fa-star').length;
                return ratingB - ratingA;
            case 'popular':
                const reviewsA = parseInt(a.querySelector('.product-rating-bristol span')?.textContent.match(/\d+/)?.[0] || '0');
                const reviewsB = parseInt(b.querySelector('.product-rating-bristol span')?.textContent.match(/\d+/)?.[0] || '0');
                return reviewsB - reviewsA;
            default:
                return 0;
        }
    });
    
    products.forEach(product => grid.appendChild(product));
}

// ===================================
// WISHLIST
// ===================================
const wishlistBtns = document.querySelectorAll('.wishlist-btn-bristol');
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

// ===================================
// LOAD MORE
// ===================================
const loadMoreBtn = document.getElementById('loadMore');

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        
        setTimeout(() => {
            loadMoreBtn.innerHTML = 'Ver Más Productos <i class="fas fa-chevron-down"></i>';
            alert('Aquí cargarías más productos desde tu backend');
        }, 1500);
    });
}


// ===================================
// NEWSLETTER POPUP
// ===================================
(function() {
    const STORAGE_KEY = 'ja_newsletter_shown';
    const DELAY_MS = 2000;
    
    const popup = document.getElementById('newsletterPopup');
    const closeBtn = document.getElementById('closeNewsletterPopup');
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('newsletterEmail');
    const whatsappInput = document.getElementById('newsletterWhatsapp');
    
    if (!popup || !form) return;
    
    function hasBeenShown() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    
    function markAsShown() {
        localStorage.setItem(STORAGE_KEY, 'true');
    }
    
    function showPopup() {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closePopup() {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
        markAsShown();
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }
    
    popup.addEventListener('click', function(e) {
        if (e.target === popup) closePopup();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closePopup();
        }
    });
    
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 15) value = value.substring(0, 15);
            e.target.value = value;
        });
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Por favor, ingresa un email válido', 'error');
            emailInput.focus();
            return;
        }
        
        if (whatsapp && whatsapp.length < 8) {
            showNotification('Por favor, ingresa un número de WhatsApp válido', 'error');
            whatsappInput.focus();
            return;
        }
        
        const submitBtn = form.querySelector('.newsletter-submit-btn');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Suscripción:', { email, whatsapp });
            
            const content = popup.querySelector('.newsletter-popup-content');
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
            
            setTimeout(closePopup, 3000);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Hubo un error. Por favor, intenta nuevamente.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-size: 0.9375rem;
            font-weight: 500;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function initNewsletterPopup() {
        if (hasBeenShown()) return;
        setTimeout(showPopup, DELAY_MS);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNewsletterPopup);
    } else {
        initNewsletterPopup();
    }
})();

// ===================================
// ANIMACIONES CSS
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✅ JA Electrónica - Script cargado correctamente');
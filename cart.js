// ===================================
// SISTEMA DE CARRITO DE COMPRAS
// ===================================

// Estado del carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartModalBody = document.getElementById('cartModalBody');
const cartModalFooter = document.getElementById('cartModalFooter');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartBadge = document.querySelector('.cart-btn .badge');

// Inicializar carrito
function initCart() {
    // Sincronizar tema con la página principal
    function syncTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    syncTheme();
    
    updateCartBadge();
    renderCart();
    
    // Event listeners
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCartModal);
    }
    
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }
    
    // Botones agregar al carrito (soporta ambos estilos)
    const addCartBtns = document.querySelectorAll('.btn-add-cart, .btn-add-cart-bristol');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = btn.closest('.product-card, .product-card-bristol');
            if (productCard) {
                addToCart(productCard, btn);
            }
        });
    });
}

// Cerrar modal del carrito
function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Agregar producto al carrito
function addToCart(productCard, button) {
    const productId = productCard.getAttribute('data-id') || 
                     `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const productTitle = productCard.querySelector('.product-title, .product-title-bristol')?.textContent.trim() || 'Producto';
    const productBrand = productCard.querySelector('.product-brand, .product-brand-bristol')?.textContent.trim() || '';
    const productPrice = parseInt(productCard.getAttribute('data-price')) || 0;
    const productImage = productCard.querySelector('.product-image img, .product-image-bristol img')?.src || '';
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            title: productTitle,
            brand: productBrand,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar UI
    updateCartBadge();
    renderCart();
    
    // Feedback visual
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Agregado';
    button.style.background = 'var(--success)';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
        button.disabled = false;
    }, 2000);
    
    // Abrir carrito si está en móvil
    if (window.innerWidth <= 768) {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Actualizar badge del carrito
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    if (cartCountBadge) {
        cartCountBadge.textContent = totalItems;
    }
}

// Renderizar carrito
function renderCart() {
    if (!cartModalBody) return;
    
    if (cart.length === 0) {
        cartModalBody.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="index.html" class="btn-primary btn-block">Seguir Comprando</a>
            </div>
        `;
        if (cartModalFooter) {
            cartModalFooter.style.display = 'none';
        }
        return;
    }
    
    if (cartModalFooter) {
        cartModalFooter.style.display = 'block';
    }
    
    let html = '';
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.brand} ${item.title}</div>
                    <div class="cart-item-price">₲ ${formatNumber(item.price)}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                   min="1" onchange="updateQuantityInput('${item.id}', this.value)">
                            <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartModalBody.innerHTML = html;
    
    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalPrice) {
        cartTotalPrice.textContent = `₲ ${formatNumber(total)}`;
    }
}

// Actualizar cantidad
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart();
    }
}

// Actualizar cantidad desde input
function updateQuantityInput(productId, value) {
    const quantity = parseInt(value) || 1;
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart();
    }
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

// Formatear número
function formatNumber(num) {
    return new Intl.NumberFormat('es-PY').format(num);
}

// Obtener carrito (para usar en otras páginas)
function getCart() {
    return cart;
}

// Limpiar carrito
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

// Hacer funciones globales para onclick
window.updateQuantity = updateQuantity;
window.updateQuantityInput = updateQuantityInput;
window.removeFromCart = removeFromCart;


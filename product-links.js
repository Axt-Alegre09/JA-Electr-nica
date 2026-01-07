/**
 * product-links.js - Hacer productos clickeables
 * Agrega funcionalidad de navegación a páginas de detalle
 */
(function() {
    'use strict';

    function makeProductsClickable() {
        // Mapeo de IDs de productos
        const productIdMap = {
            'casio-efr539': 'casio-efr539',
            'qyq-elegant': 'qyq-elegant',
            'skmei-deportivo': 'skmei-deportivo',
            'aqua-infantil': 'aqua-infantil',
            'casio-she3059': 'casio-she3059',
            'generico-minimalista': 'generico-minimalista',
            'skmei-elegante': 'skmei-elegante',
            'qyq-sport': 'qyq-sport'
        };

        // Seleccionar todas las tarjetas de productos
        const productCards = document.querySelectorAll('.product-card-bristol');

        productCards.forEach(card => {
            const productId = card.dataset.id;
            
            // Agregar cursor pointer al card
            card.style.cursor = 'pointer';
            
            // Click en el card completo
            card.addEventListener('click', (e) => {
                // No redirigir si se clickeó en botones específicos
                if (e.target.closest('.wishlist-btn-bristol') || 
                    e.target.closest('.btn-add-cart-bristol')) {
                    return;
                }
                
                // Redirigir a página de detalle
                const mappedId = productIdMap[productId] || 'casio-efr539';
                window.location.href = `product-detail.html?id=${mappedId}`;
            });

            // Hacer que la imagen también sea clickeable con efecto hover
            const productImage = card.querySelector('.product-image-bristol');
            if (productImage) {
                productImage.style.transition = 'transform 0.3s ease';
                card.addEventListener('mouseenter', () => {
                    if (!e.target.closest('.wishlist-btn-bristol')) {
                        productImage.style.transform = 'scale(1.05)';
                    }
                });
                card.addEventListener('mouseleave', () => {
                    productImage.style.transform = 'scale(1)';
                });
            }
        });

        console.log(`✅ ${productCards.length} productos ahora son clickeables`);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeProductsClickable);
    } else {
        makeProductsClickable();
    }
})();
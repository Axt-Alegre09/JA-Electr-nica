// ===========================================
// FILTERS SIDEBAR PROFESSIONAL - JAVASCRIPT
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // ELEMENTOS DEL DOM
    // ===========================================
    const filtersSidebar = document.getElementById('filtersSidebarPro');
    const overlayPro = document.getElementById('overlayPro');
    const floatingFiltersBtn = document.getElementById('floatingFiltersBtn');
    const resetAllFilters = document.getElementById('resetAllFilters');
    const applyFilters = document.getElementById('applyFilters');
    
    // Elementos de filtros activos
    const activeFiltersContainer = document.getElementById('activeFiltersContainer');
    const activeFiltersCount = document.getElementById('activeFiltersCount');
    const activeFiltersTags = document.getElementById('activeFiltersTags');
    const floatingFiltersBadge = document.getElementById('floatingFiltersBadge');
    
    // Elementos de precio
    const priceMinSlider = document.getElementById('priceMinSlider');
    const priceMaxSlider = document.getElementById('priceMaxSlider');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceSliderRange = document.getElementById('priceSliderRange');
    
    // Contador de resultados
    const resultsCount = document.getElementById('resultsCount');
    
    // ===========================================
    // ABRIR/CERRAR SIDEBAR EN MÓVIL
    // ===========================================
    floatingFiltersBtn.addEventListener('click', function() {
        filtersSidebar.classList.add('active');
        overlayPro.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    overlayPro.addEventListener('click', function() {
        filtersSidebar.classList.remove('active');
        overlayPro.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // ===========================================
    // ACORDEÓN DE GRUPOS DE FILTROS
    // ===========================================
    const filterToggles = document.querySelectorAll('.filter-group-toggle');
    
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const filterId = this.getAttribute('data-filter');
            const content = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle estado
            this.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('active');
        });
        
        // Estado inicial
        toggle.setAttribute('aria-expanded', 'true');
    });
    
    // ===========================================
    // SLIDER DE PRECIO DUAL
    // ===========================================
    function updatePriceSlider() {
        const minVal = parseInt(priceMinSlider.value);
        const maxVal = parseInt(priceMaxSlider.value);
        const sliderMax = parseInt(priceMinSlider.max);
        
        // Prevenir que se crucen
        if (maxVal - minVal < 50000) {
            if (this === priceMinSlider) {
                priceMinSlider.value = maxVal - 50000;
            } else {
                priceMaxSlider.value = minVal + 50000;
            }
        }
        
        const minPercent = (priceMinSlider.value / sliderMax) * 100;
        const maxPercent = (priceMaxSlider.value / sliderMax) * 100;
        
        priceSliderRange.style.left = minPercent + '%';
        priceSliderRange.style.width = (maxPercent - minPercent) + '%';
        
        // Actualizar inputs de texto
        priceMin.value = formatPriceDisplay(priceMinSlider.value);
        priceMax.value = formatPriceDisplay(priceMaxSlider.value);
        
        updateActiveFilters();
    }
    
    priceMinSlider.addEventListener('input', updatePriceSlider);
    priceMaxSlider.addEventListener('input', updatePriceSlider);
    
    // Actualizar sliders desde inputs de texto
    function updateSlidersFromInputs() {
        const minVal = parsePriceInput(priceMin.value);
        const maxVal = parsePriceInput(priceMax.value);
        
        if (minVal !== null) priceMinSlider.value = minVal;
        if (maxVal !== null) priceMaxSlider.value = maxVal;
        
        updatePriceSlider();
    }
    
    priceMin.addEventListener('blur', updateSlidersFromInputs);
    priceMax.addEventListener('blur', updateSlidersFromInputs);
    
    // Formatear precio para mostrar
    function formatPriceDisplay(value) {
        if (!value) return '';
        return parseInt(value).toLocaleString('es-PY');
    }
    
    // Parsear precio del input
    function parsePriceInput(value) {
        if (!value) return null;
        const cleaned = value.replace(/\D/g, '');
        return cleaned ? parseInt(cleaned) : null;
    }
    
    // Formatear mientras se escribe
    priceMin.addEventListener('input', function() {
        const cursorPos = this.selectionStart;
        const oldLength = this.value.length;
        this.value = formatPriceDisplay(parsePriceInput(this.value));
        const newLength = this.value.length;
        this.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
    });
    
    priceMax.addEventListener('input', function() {
        const cursorPos = this.selectionStart;
        const oldLength = this.value.length;
        this.value = formatPriceDisplay(parsePriceInput(this.value));
        const newLength = this.value.length;
        this.setSelectionRange(cursorPos + (newLength - oldLength), cursorPos + (newLength - oldLength));
    });
    
    // ===========================================
    // RANGOS RÁPIDOS DE PRECIO
    // ===========================================
    const quickRangeBtns = document.querySelectorAll('.quick-range-btn');
    
    quickRangeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const min = this.getAttribute('data-min');
            const max = this.getAttribute('data-max');
            
            priceMinSlider.value = min;
            priceMaxSlider.value = max;
            updatePriceSlider();
            
            // Activar botón
            quickRangeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // ===========================================
    // BUSCADOR DE MARCAS
    // ===========================================
    const brandSearch = document.getElementById('brandSearch');
    const brandsList = document.getElementById('brandsList');
    
    if (brandSearch && brandsList) {
        brandSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const options = brandsList.querySelectorAll('.filter-option-pro');
            
            options.forEach(option => {
                const label = option.querySelector('.option-label').textContent.toLowerCase();
                if (label.includes(searchTerm)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
    }
    
    // ===========================================
    // GESTIÓN DE FILTROS ACTIVOS
    // ===========================================
    const allFilterInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    
    allFilterInputs.forEach(input => {
        input.addEventListener('change', updateActiveFilters);
    });
    
    function updateActiveFilters() {
        const activeFilters = [];
        
        // Recopilar todos los filtros activos
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            const label = cb.closest('.filter-option-pro').querySelector('.option-label').textContent.trim();
            const filterType = cb.name;
            activeFilters.push({
                type: filterType,
                value: cb.value,
                label: label,
                element: cb
            });
        });
        
        const radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(radio => {
            const label = radio.closest('.filter-option-pro').querySelector('.option-label').textContent.trim();
            const filterType = radio.name;
            activeFilters.push({
                type: filterType,
                value: radio.value,
                label: label,
                element: radio
            });
        });
        
        // Añadir filtro de precio si está activo
        const minPrice = parsePriceInput(priceMin.value);
        const maxPrice = parsePriceInput(priceMax.value);
        const defaultMin = 0;
        const defaultMax = 2000000;
        
        if (minPrice !== defaultMin || maxPrice !== defaultMax) {
            activeFilters.push({
                type: 'price',
                value: 'price-range',
                label: `₲ ${formatPriceDisplay(minPrice || defaultMin)} - ₲ ${formatPriceDisplay(maxPrice || defaultMax)}`,
                element: null
            });
        }
        
        // Actualizar contadores
        const count = activeFilters.length;
        activeFiltersCount.textContent = count;
        
        if (count > 0) {
            activeFiltersContainer.style.display = 'block';
            floatingFiltersBadge.style.display = 'flex';
            floatingFiltersBadge.textContent = count;
        } else {
            activeFiltersContainer.style.display = 'none';
            floatingFiltersBadge.style.display = 'none';
        }
        
        // Renderizar tags
        renderActiveFilterTags(activeFilters);
        
        // Actualizar contador de resultados (simulado)
        updateResultsCount(count);
    }
    
    function renderActiveFilterTags(filters) {
        activeFiltersTags.innerHTML = '';
        
        filters.forEach(filter => {
            const tag = document.createElement('div');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `
                <span>${filter.label}</span>
                <span class="remove-tag">
                    <i class="fas fa-times"></i>
                </span>
            `;
            
            // Evento para remover filtro
            tag.querySelector('.remove-tag').addEventListener('click', function() {
                removeFilter(filter);
            });
            
            activeFiltersTags.appendChild(tag);
        });
    }
    
    function removeFilter(filter) {
        if (filter.element) {
            filter.element.checked = false;
        } else if (filter.type === 'price') {
            // Resetear precio
            priceMinSlider.value = 0;
            priceMaxSlider.value = 2000000;
            updatePriceSlider();
            quickRangeBtns.forEach(b => b.classList.remove('active'));
        }
        
        updateActiveFilters();
    }
    
    function updateResultsCount(activeFiltersCount) {
        // Simulación: reducir productos según filtros
        const baseCount = 48;
        const estimatedCount = Math.max(1, baseCount - (activeFiltersCount * 5));
        resultsCount.textContent = `(${estimatedCount})`;
    }
    
    // ===========================================
    // RESETEAR TODOS LOS FILTROS
    // ===========================================
    resetAllFilters.addEventListener('click', function() {
        // Desmarcar todos los checkboxes y radios
        allFilterInputs.forEach(input => {
            input.checked = false;
        });
        
        // Resetear toggles de disponibilidad
        document.querySelector('input[name="availability"][value="instock"]').checked = true;
        
        // Resetear precio
        priceMinSlider.value = 0;
        priceMaxSlider.value = 2000000;
        priceMin.value = '';
        priceMax.value = '';
        updatePriceSlider();
        
        // Resetear rangos rápidos
        quickRangeBtns.forEach(b => b.classList.remove('active'));
        
        // Resetear búsqueda de marcas
        if (brandSearch) {
            brandSearch.value = '';
            brandSearch.dispatchEvent(new Event('input'));
        }
        
        updateActiveFilters();
        
        // Feedback visual
        this.innerHTML = '<i class="fas fa-check"></i> <span>Limpiado</span>';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-redo"></i> <span>Limpiar todo</span>';
        }, 1500);
    });
    
    // ===========================================
    // APLICAR FILTROS
    // ===========================================
    applyFilters.addEventListener('click', function() {
        // Cerrar sidebar en móvil
        filtersSidebar.classList.remove('active');
        overlayPro.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Aquí aplicarías los filtros a tus productos
        console.log('Aplicando filtros...');
        
        // Feedback visual
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Aplicado <span class="results-count">' + resultsCount.textContent + '</span>';
        this.style.background = 'var(--success)';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = 'var(--primary-color)';
        }, 1500);
    });
    
    // ===========================================
    // INICIALIZACIÓN
    // ===========================================
    updatePriceSlider();
    updateActiveFilters();
});
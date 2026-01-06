// Manejador de instalación de PWA para JA Electrónica

let deferredPrompt;
let installButton;

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initPWA();
});

function initPWA() {
  // Crear botón de instalación (oculto por defecto)
  createInstallButton();
  
  // Escuchar el evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: beforeinstallprompt event fired');
    
    // Prevenir el mini-infobar en mobile
    e.preventDefault();
    
    // Guardar el evento para usarlo después
    deferredPrompt = e;
    
    // Mostrar botón de instalación
    showInstallButton();
  });

  // Detectar cuando la app ya está instalada
  window.addEventListener('appinstalled', () => {
    console.log('PWA: App instalada exitosamente');
    hideInstallButton();
    
    // Mostrar mensaje de éxito
    showInstallSuccess();
    
    // Limpiar el prompt
    deferredPrompt = null;
  });

  // Detectar si ya está en modo standalone (instalada)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA: Corriendo en modo standalone');
    hideInstallButton();
  }
}

function createInstallButton() {
  // Crear botón flotante de instalación
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.className = 'pwa-install-button';
  installButton.innerHTML = `
    <i class="fas fa-download"></i>
    <span>Instalar App</span>
  `;
  installButton.style.display = 'none';
  
  // Agregar evento de click
  installButton.addEventListener('click', handleInstallClick);
  
  // Agregar al body
  document.body.appendChild(installButton);
  
  // Agregar estilos CSS
  addInstallButtonStyles();
}

function addInstallButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .pwa-install-button {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      animation: slideInUp 0.5s ease;
    }
    
    .pwa-install-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(37, 99, 235, 0.5);
    }
    
    .pwa-install-button:active {
      transform: translateY(0);
    }
    
    .pwa-install-button i {
      font-size: 16px;
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .pwa-success-toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      animation: slideInDown 0.5s ease;
    }
    
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    @media (max-width: 768px) {
      .pwa-install-button {
        bottom: 70px;
        right: 15px;
        padding: 10px 20px;
        font-size: 13px;
      }
    }
  `;
  document.head.appendChild(style);
}

function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'flex';
  }
}

function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
  }
}

async function handleInstallClick() {
  if (!deferredPrompt) {
    console.log('PWA: No hay prompt disponible');
    return;
  }
  
  // Ocultar botón
  hideInstallButton();
  
  // Mostrar el prompt de instalación
  deferredPrompt.prompt();
  
  // Esperar la respuesta del usuario
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`PWA: Usuario eligió: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('PWA: Usuario aceptó la instalación');
  } else {
    console.log('PWA: Usuario rechazó la instalación');
    // Volver a mostrar el botón después de un tiempo
    setTimeout(() => {
      showInstallButton();
    }, 30000); // 30 segundos
  }
  
  // Limpiar el prompt
  deferredPrompt = null;
}

function showInstallSuccess() {
  const toast = document.createElement('div');
  toast.className = 'pwa-success-toast';
  toast.innerHTML = `
    <i class="fas fa-check-circle" style="font-size: 24px;"></i>
    <span>¡App instalada con éxito!</span>
  `;
  
  document.body.appendChild(toast);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideInDown 0.5s ease reverse';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

// Detectar si el navegador soporta PWA
function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

if (!isPWASupported()) {
  console.warn('PWA: Navegador no soporta todas las características PWA');
}
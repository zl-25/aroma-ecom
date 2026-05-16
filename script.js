// Backend URL (Render)
const PRODUCTION_BACKEND_URL = 'https://aroma-ecom.onrender.com';

let API_BASE = '';
if (window.location.protocol === 'file:') {
    // Développement local - fichier ouvert directement
    API_BASE = 'http://localhost:3000';
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Développement local - serveur dev
    API_BASE = 'http://localhost:3000';
} else if (PRODUCTION_BACKEND_URL && PRODUCTION_BACKEND_URL !== 'VOTRE_URL_RENDER') {
    // Production - pointe vers le backend Render
    API_BASE = PRODUCTION_BACKEND_URL;
}

// === CUSTOM NOTIFICATIONS ===
function showNotification(message, type = 'error') {
    const notif = document.getElementById('custom-notification');
    const msgEl = document.getElementById('notification-message');
    const iconEl = document.getElementById('notification-icon');
    
    if (!notif || !msgEl || !iconEl) return;

    msgEl.textContent = message;
    
    // Reset classes
    notif.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl font-medium text-sm pointer-events-none min-w-[300px] justify-center';
    
    if (type === 'error') {
        notif.classList.add('bg-red-50', 'text-red-800', 'border', 'border-red-200');
        iconEl.setAttribute('icon', 'lucide:alert-circle');
        iconEl.className = 'text-red-500 text-xl';
    } else if (type === 'success') {
        notif.classList.add('bg-green-50', 'text-green-800', 'border', 'border-green-200');
        iconEl.setAttribute('icon', 'lucide:check-circle-2');
        iconEl.className = 'text-green-500 text-xl';
    }

    // Show
    notif.classList.remove('-translate-y-24', 'opacity-0');
    notif.classList.add('translate-y-0', 'opacity-100');

    // Hide after 4 seconds
    setTimeout(() => {
        notif.classList.remove('translate-y-0', 'opacity-100');
        notif.classList.add('-translate-y-24', 'opacity-0');
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let quantity = 1;
    let unitPrice = 25000;
    let shippingFee = 2000;
    const taxRate = 0; // Pas de taxe supplémentaire pour le moment

    // --- DOM Elements ---
    const subTotalEl = document.getElementById('sub-total');
    const taxFeeEl = document.getElementById('tax-fee');
    const totalPriceEl = document.getElementById('total-price');
    const removeProductBtn = document.getElementById('remove-product');
    const productItem = document.getElementById('product-item');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const thumbnails = document.querySelectorAll('.thumbnail-btn');
    const bundleRadios = document.querySelectorAll('input[name="bundle"]');
    const unitPriceEl = document.getElementById('unit-price');

    // --- Functions ---
    const updatePricing = () => {
        if (quantity === 0) {
            subTotalEl.textContent = '0 FCFA';
            document.getElementById('shipping-fee').textContent = '0 FCFA';
            totalPriceEl.textContent = '0 FCFA';
            if (unitPriceEl) unitPriceEl.textContent = '0 FCFA';
            return;
        }

        const subtotal = unitPrice;
        const total = subtotal + shippingFee;

        subTotalEl.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;
        document.getElementById('shipping-fee').textContent = `${shippingFee.toLocaleString('fr-FR')} FCFA`;
        totalPriceEl.textContent = `${total.toLocaleString('fr-FR')} FCFA`;
        if (unitPriceEl) unitPriceEl.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;
    };

    // --- Event Listeners ---
    
    // City selection logic (Shipping Fee calculation)
    const citySelect = document.getElementById('city');
    if (citySelect) {
        citySelect.addEventListener('change', (e) => {
            const selectedCity = e.target.value;
            if (selectedCity === 'Libreville') {
                shippingFee = 2000;
            } else if (selectedCity === 'Akanda' || selectedCity === 'Owendo') {
                shippingFee = 3000;
            } else {
                shippingFee = 5000;
            }
            updatePricing();
        });
    }

    // Bundle selection logic
    bundleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Update styling of all labels
            document.querySelectorAll('.bundle-option').forEach(el => {
                el.classList.remove('border-[#d08b6b]', 'bg-[#fffaf8]');
                el.classList.add('border-gray-200');
            });
            // Highlight selected label
            const selectedLabel = e.target.closest('.bundle-option');
            selectedLabel.classList.remove('border-gray-200');
            selectedLabel.classList.add('border-[#d08b6b]', 'bg-[#fffaf8]');

            // Update price state
            unitPrice = parseFloat(e.target.dataset.price);
            quantity = parseInt(e.target.value);
            updatePricing();
        });
    });

    // Remove product
    if (removeProductBtn) {
        removeProductBtn.addEventListener('click', () => {
            productItem.style.display = 'none';
            quantity = 0;
            updatePricing();
        });
    }

    // Thumbnail selection
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Reset all thumbnails
            thumbnails.forEach(t => {
                t.classList.remove('border-white');
                t.classList.add('border-transparent');
                t.querySelector('img').classList.add('grayscale', 'opacity-60');
            });
            
            // Set active thumbnail
            thumb.classList.remove('border-transparent');
            thumb.classList.add('border-white');
            const clickedImg = thumb.querySelector('img');
            clickedImg.classList.remove('grayscale', 'opacity-60');

            // Update main product image and cart product image
            const mainImage = document.getElementById('main-product-image');
            const cartImage = document.getElementById('cart-product-image');
            if (mainImage) {
                mainImage.src = clickedImg.src;
            }
            if (cartImage) {
                cartImage.src = clickedImg.src;
            }
        });
    });

    // --- Step Navigation Logic ---
    const goToStep = (stepNumber) => {
        // Hide all bodies, set opacity 50%
        [1, 2, 3].forEach(num => {
            const card = document.getElementById(`step-${num}-card`);
            const body = document.getElementById(`step-${num}-body`);
            const header = document.getElementById(`step-${num}-header`);
            const check = document.getElementById(`step-${num}-check`);
            
            if (num === stepNumber) {
                card.classList.remove('opacity-50', 'border-gray-200');
                card.classList.add('border-[#d08b6b]', 'shadow-sm');
                body.classList.remove('hidden');
                header.classList.remove('bg-gray-50', 'border-transparent');
                header.classList.add('bg-[#fffaf8]', 'border-[#d08b6b]/30');
            } else {
                card.classList.add('opacity-50', 'border-gray-200');
                card.classList.remove('border-[#d08b6b]', 'shadow-sm');
                body.classList.add('hidden');
                header.classList.add('bg-gray-50', 'border-transparent');
                header.classList.remove('bg-[#fffaf8]', 'border-[#d08b6b]/30');
            }
            
            // Show checkmark if step is completed (num < stepNumber)
            if (num < stepNumber && check) {
                check.classList.remove('hidden');
            } else if (check) {
                check.classList.add('hidden');
            }
        });
        
        // Update summary if going to step 3
        if (stepNumber === 3) {
            const selectedBundle = document.querySelector('input[name="bundle"]:checked');
            if (selectedBundle) {
                document.getElementById('summary-bundle-desc').textContent = selectedBundle.dataset.desc;
            }
        }
    };

    document.getElementById('btn-next-to-2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btn-back-to-1')?.addEventListener('click', () => goToStep(1));
    document.getElementById('btn-next-to-3')?.addEventListener('click', () => {
        // Validate form before going to step 3
        const inputs = document.querySelectorAll('#delivery-form input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
            } else {
                input.classList.remove('border-red-500');
            }
        });
        if (isValid) {
            goToStep(3);
        } else {
            alert('Veuillez remplir tous les détails de livraison.');
        }
    });
    document.getElementById('btn-back-to-2')?.addEventListener('click', () => goToStep(2));

    // Confirm Order (COD)
    confirmOrderBtn.addEventListener('click', async () => {
        if (quantity === 0) {
            alert('Votre panier est vide.');
            return;
        }

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const bundle = document.getElementById('summary-bundle-desc').textContent;
        const totalPrice = totalPriceEl.textContent;

        if (!firstName || !lastName || !phone || !address || !city) {
            showNotification('Veuillez remplir tous les détails de livraison.', 'error');
            goToStep(2);
            return;
        }

        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = '<iconify-icon icon="lucide:loader-2" class="animate-spin text-xl"></iconify-icon> Traitement...';

        try {
            const response = await fetch(API_BASE + '/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, phone, address, city, bundle, totalPrice })
            });

            if (response.ok) {
                showNotification(`Commande confirmée ! Vous paierez ${totalPrice} à la livraison.`, 'success');
                // Reset form and go back to step 1
                document.getElementById('delivery-form').reset();
                goToStep(1);
            } else {
                showNotification('Erreur lors de la création de la commande. Veuillez réessayer.', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion. Veuillez vérifier que le serveur est bien démarré (node server.js).', 'error');
        } finally {
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = 'Confirmer la Commande';
        }
    });
});

// === COMPTEUR DE VISITEURS PERSUASIF (Urgence d'achat) ===
function initFakeVisitors() {
    const visitorEl = document.getElementById('fake-visitors');
    if (!visitorEl) return;

    // Nombre de base réaliste (entre 18 et 35 au démarrage)
    let currentCount = Math.floor(Math.random() * 18) + 18;

    const updateDisplay = (newCount) => {
        if (visitorEl.textContent !== newCount.toString()) {
            visitorEl.style.opacity = '0.5';
            setTimeout(() => {
                visitorEl.textContent = newCount;
                visitorEl.style.opacity = '1';
            }, 300);
        }
    };

    // Afficher dès le début
    updateDisplay(currentCount);

    // Fluctuation réaliste : toutes les 8 à 20 secondes
    const fluctuate = () => {
        const change = Math.random();
        if (change < 0.55) {
            // 55% de chances : quelqu'un rejoint (+1 ou +2)
            currentCount += Math.random() < 0.7 ? 1 : 2;
        } else {
            // 45% de chances : quelqu'un part (-1)
            currentCount -= 1;
        }
        // Maintenir entre 18 et 47 pour rester crédible
        currentCount = Math.max(18, Math.min(47, currentCount));
        updateDisplay(currentCount);

        // Prochain changement dans 8 à 22 secondes
        const nextTick = 8000 + Math.random() * 14000;
        setTimeout(fluctuate, nextTick);
    };

    // Premier changement après 5 à 12 secondes
    setTimeout(fluctuate, 5000 + Math.random() * 7000);
}

document.addEventListener('DOMContentLoaded', initFakeVisitors);

// === FAKE LIVE PURCHASES (GABON) ===
const gaboneseNames = [
    "Jean M.", "Marie O.", "Guy N.", "Sylvie B.", "Alain E.", 
    "Chantal M.", "Patrick O.", "Sophie N.", "Paul M.", "Grace B.",
    "Kevin O.", "Sarah M.", "Junior E.", "Marcelle N.", "Eric M.",
    "Franck N.", "Christelle B.", "Armand O.", "Nathalie M.", "Yannick E."
];

const gaboneseCities = [
    "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", 
    "Mouila", "Lambaréné", "Koulamoutou", "Makokou", "Tchibanga",
    "Bitam", "Ntoum", "Lastoursville"
];

const purchasedItems = [
    "Aromatiseur Intelligent",
    "Pack Duo (x2)",
    "Pack Ultime (x3)",
    "Aromatiseur + Huiles Essentielles"
];

function triggerFakePurchase() {
    const toast = document.getElementById('purchase-toast');
    if (!toast) return;
    
    // Pick random data
    const name = gaboneseNames[Math.floor(Math.random() * gaboneseNames.length)];
    const city = gaboneseCities[Math.floor(Math.random() * gaboneseCities.length)];
    const item = purchasedItems[Math.floor(Math.random() * purchasedItems.length)];
    const time = Math.floor(Math.random() * 14) + 1; // 1 to 15 minutes
    
    // Update toast content
    document.getElementById('buyer-name').textContent = `${name} (${city})`;
    document.getElementById('buyer-item').textContent = item;
    document.getElementById('buyer-time').textContent = `Il y a ${time} minute${time > 1 ? 's' : ''}`;
    
    // Show toast (slide up and fade in)
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    // Hide toast after 6 seconds
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 6000);
    
    // Schedule next purchase between 15 and 35 seconds
    const nextTime = 15000 + Math.random() * 20000;
    setTimeout(triggerFakePurchase, nextTime);
}

// Start the fake purchase loop after a small delay (5 seconds after page load)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(triggerFakePurchase, 5000);
});

// === ADMIN LOGIN LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('admin-login-modal');
    const openLoginBtn = document.getElementById('btn-admin-login');
    const closeLoginBtn = document.getElementById('close-login-modal');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');

    if (openLoginBtn && loginModal) {
        openLoginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
            // Small delay for animation
            setTimeout(() => {
                loginModal.classList.remove('opacity-0');
                loginModal.querySelector('div').classList.remove('scale-95');
                loginModal.querySelector('div').classList.add('scale-100');
            }, 10);
        });
    }

    const closeLogin = () => {
        loginModal.classList.add('opacity-0');
        loginModal.querySelector('div').classList.remove('scale-100');
        loginModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            loginModal.classList.add('hidden');
            if (loginForm) loginForm.reset();
            if (loginError) loginError.classList.add('hidden');
        }, 300);
    };

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', closeLogin);
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeLogin();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('admin-username').value;
            const pass = document.getElementById('admin-password').value;

            // Simple check for demo purposes
            if (user === 'admin' && pass === 'admin123') {
                window.location.href = 'admin.html';
            } else {
                loginError.classList.remove('hidden');
                // Shake effect
                const modalBox = loginModal.querySelector('div');
                modalBox.classList.add('animate-shake');
                setTimeout(() => modalBox.classList.remove('animate-shake'), 300);
            }
        });
    }
});

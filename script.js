// Global basket data
let basketItems = JSON.parse(localStorage.getItem('basketItems')) || [];
let basketCount = parseInt(localStorage.getItem('basketCount')) || 0;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateBasketCounter();
    setupMobileMenu();
    setupDropdowns();
    
    // Page-specific initializations
    if (document.getElementById('basket-items')) {
        loadBasketPage();
    }
    
    if (document.getElementById('contact-form')) {
        setupContactForm();
    }
    
    // Add event listeners to all "Add to Basket" buttons
    document.querySelectorAll('.btn').forEach(button => {
        if (button.textContent.includes('Add to Basket') || button.classList.contains('add-to-basket')) {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const priceText = productCard.querySelector('.price').textContent;
                const price = parseInt(priceText.replace('£', '').replace(',', ''));
                
                addToBasket(productName, price);
            });
        }
    });
});

// Basket functionality
function addToBasket(productName, price) {
    // Check if item already exists in basket
    const existingItem = basketItems.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        basketItems.push({
            name: productName,
            price: price,
            quantity: 1,
            image: getProductImageClass(productName)
        });
    }
    
    basketCount += 1;
    saveBasket();
    updateBasketCounter();
    
    // Show success message
    showNotification(`${productName} added to basket!`);
}

function removeFromBasket(index) {
    basketCount -= basketItems[index].quantity;
    basketItems.splice(index, 1);
    saveBasket();
    updateBasketCounter();
    loadBasketPage();
}

function updateQuantity(index, change) {
    const item = basketItems[index];
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
        removeFromBasket(index);
        return;
    }
    
    basketCount += change;
    item.quantity = newQuantity;
    saveBasket();
    updateBasketCounter();
    loadBasketPage();
}

function saveBasket() {
    localStorage.setItem('basketItems', JSON.stringify(basketItems));
    localStorage.setItem('basketCount', basketCount.toString());
}

function updateBasketCounter() {
    const basketCounters = document.querySelectorAll('#basket-count');
    const basketLinks = document.querySelectorAll('a[href="basket.html"]');
    
    basketCounters.forEach(counter => {
        counter.textContent = basketCount;
    });
    
    basketLinks.forEach(link => {
        link.innerHTML = `Basket (${basketCount})`;
    });
}

// Basket page functionality
function loadBasketPage() {
    const basketItemsContainer = document.getElementById('basket-items');
    const emptyBasket = document.getElementById('empty-basket');
    const basketContainer = document.getElementById('basket-container');
    
    if (!basketItemsContainer) return;
    
    if (basketItems.length === 0) {
        if (emptyBasket) emptyBasket.style.display = 'block';
        if (basketContainer) basketContainer.style.display = 'none';
        return;
    }
    
    if (emptyBasket) emptyBasket.style.display = 'none';
    if (basketContainer) basketContainer.style.display = 'block';
    
    // Render basket items
    basketItemsContainer.innerHTML = '';
    basketItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'basket-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <div class="item-image" data-image="${item.image}"></div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${getProductDescription(item.name)}</p>
                </div>
            </div>
            <div class="item-actions">
                <div class="quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <span class="price" style="margin-right: 20px;">£${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn" onclick="removeFromBasket(${index})">Remove</button>
            </div>
        `;
        basketItemsContainer.appendChild(itemElement);
    });
    
    updateBasketSummary();
}

function updateBasketSummary() {
    const subtotal = basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + shipping + tax;
    
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('basket-total');
    
    if (subtotalElement) subtotalElement.textContent = `£${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `£${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `£${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `£${total.toFixed(2)}`;
}

// Checkout functionality
function checkout() {
    if (basketItems.length === 0) {
        showNotification('Your basket is empty!');
        return;
    }
    
    const total = basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total > 200 ? 0 : 15;
    const tax = total * 0.20;
    const finalTotal = total + shipping + tax;
    
    showNotification(`Order placed! Total: £${finalTotal.toFixed(2)}\nThank you for your purchase!`);
    
    // Clear basket after purchase
    basketItems = [];
    basketCount = 0;
    saveBasket();
    updateBasketCounter();
    loadBasketPage();
}

// Contact form functionality
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simple validation
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        
        let isValid = true;
        
        // Reset errors
        document.querySelectorAll('.error-message').forEach(error => error.classList.remove('show'));
        document.querySelectorAll('.form-control').forEach(input => input.classList.remove('error'));
        
        // Validate required fields
        if (!firstName.value.trim()) {
            showError('first-name-error');
            firstName.classList.add('error');
            isValid = false;
        }
        
        if (!lastName.value.trim()) {
            showError('last-name-error');
            lastName.classList.add('error');
            isValid = false;
        }
        
        if (!email.value.trim() || !isValidEmail(email.value)) {
            showError('email-error');
            email.classList.add('error');
            isValid = false;
        }
        
        if (!message.value.trim()) {
            showError('message-error');
            message.classList.add('error');
            isValid = false;
        }
        
        if (isValid && successMessage) {
            successMessage.classList.add('show');
            contactForm.reset();
            
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav ul');
    
    if (mobileMenu && nav) {
        mobileMenu.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
}

// Dropdown functionality
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.classList.toggle('active');
            }
        });
    });
}

// Utility functions
function getProductImageClass(productName) {
    const imageMap = {
        'Pro Series Standing Desk': 'pro-desk',
        'Pro Series Desk': 'pro-desk',
        'Essential Standing Desk': 'essential-desk',
        'Essential Desk': 'essential-desk',
        'Executive Standing Desk': 'executive-desk',
        'Executive Desk': 'executive-desk',
        'Bamboo Desktop': 'bamboo-top',
        'Solid Wood Desktop': 'wood-top',
        'Laminate Desktop': 'laminate-top',
        'Desktop Converter': 'desk-converter',
        'Anti-Fatigue Mat': 'anti-fatigue-mat',
        'Cable Management Kit': 'cable-kit',
        'Monitor Arm': 'monitor-arm'
    };
    return imageMap[productName] || 'pro-desk';
}

function getProductDescription(productName) {
    const descriptions = {
        'Pro Series Standing Desk': 'Advanced height memory, anti-collision system',
        'Pro Series Desk': 'Advanced height memory, anti-collision system',
        'Essential Standing Desk': 'Reliable and affordable solution',
        'Essential Desk': 'Reliable and affordable solution',
        'Executive Standing Desk': 'Premium materials and advanced features',
        'Executive Desk': 'Premium materials and advanced features',
        'Bamboo Desktop': 'Sustainable bamboo with natural finish',
        'Solid Wood Desktop': 'Premium solid wood with elegant finish',
        'Laminate Desktop': 'Durable laminate in various colors',
        'Desktop Converter': 'Transform your existing desk',
        'Anti-Fatigue Mat': 'Comfortable mat for prolonged standing',
        'Cable Management Kit': 'Keep cables organized and tidy',
        'Monitor Arm': 'Adjustable for optimal viewing height'
    };
    return descriptions[productName] || 'Premium standing desk';
}

function showError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.add('show');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.addToBasket = addToBasket;
window.removeFromBasket = removeFromBasket;
window.updateQuantity = updateQuantity;
window.checkout = checkout;
// Product Data
const products = [
    {
        id: 1,
        name: "Grandslam X1 Neem Herbal Floor Cleaner",
        image: "https://5.imimg.com/data5/SELLER/Default/2026/1/578613139/OO/GD/QC/9092497/1l-grandslam-x1-neem-herbal-floor-cleaner-500x500.jpg",
        price: 199
    },
    {
        id: 2,
        name: "Grandslam 5 Star Lemongrass Room Spray",
        image: "https://5.imimg.com/data5/SELLER/Default/2026/1/578612524/XF/SG/CH/9092497/500ml-grandslam-5-star-lemongrass-room-spray-1000x1000.jpg",
        price: 249
    }
];

// Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('grandslam_cart')) || [];

// DOM Elements
const cartBadge = document.getElementById('cart-badge');
const productList = document.getElementById('product-list');
const cartContainer = document.getElementById('cart-container');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const subtotalEl = document.getElementById('subtotal');
const gstEl = document.getElementById('gst');
const finalTotalEl = document.getElementById('final-total');
const placeOrderBtn = document.getElementById('place-order-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');

// Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const proceedWhatsappBtn = document.getElementById('proceed-whatsapp-btn');
const customerNameInput = document.getElementById('customerName');
const customerPhoneInput = document.getElementById('customerPhone');
const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');

// Initialize App
function init() {
    updateCartBadge();
    
    // Check which page we are on
    if (productList) {
        renderProducts();
    }
    
    if (cartItemsContainer) {
        renderCart();
        
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', openCheckoutModal);
        }
        
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeCheckoutModal);
        }
        
        if (proceedWhatsappBtn) {
            proceedWhatsappBtn.addEventListener('click', processOrder);
        }
    }
}

// Render Products on products.html
function renderProducts() {
    productList.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">₹${product.price}</div>
            <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        
        productList.appendChild(card);
    });
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    
    // Optional: Show a small toast/alert
    alert(`${product.name} added to cart!`);
}

// Update quantity
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart();
        updateCartBadge();
        renderCart();
    }
}

// Remove item from cart
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartBadge();
        renderCart();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('grandslam_cart', JSON.stringify(cart));
}

// Update cart badge count
function updateCartBadge() {
    if (!cartBadge) return;
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = totalItems;
}

// Render Cart on cart.html
function renderCart() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartContainer.classList.add('hidden');
        emptyCartMsg.classList.remove('hidden');
        return;
    }
    
    cartContainer.classList.remove('hidden');
    emptyCartMsg.classList.add('hidden');
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <div class="cart-item-actions">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="item-total">₹${itemTotal}</div>
                <button class="btn btn-danger btn-sm" onclick="removeItem(${item.id})">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    calculateTotals();
}

// Calculate and display totals
function calculateTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const finalTotal = subtotal + gst;
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
    if (finalTotalEl) finalTotalEl.textContent = `₹${finalTotal.toFixed(2)}`;
}

// Checkout Modal Logic
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }
    checkoutModal.classList.remove('hidden');
    // Reset inputs and errors
    customerNameInput.value = '';
    customerPhoneInput.value = '';
    nameError.classList.add('hidden');
    phoneError.classList.add('hidden');
}

function closeCheckoutModal() {
    checkoutModal.classList.add('hidden');
}

function processOrder() {
    const name = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    
    let isValid = true;
    
    if (!name) {
        nameError.classList.remove('hidden');
        isValid = false;
    } else {
        nameError.classList.add('hidden');
    }
    
    if (!/^[0-9]{10}$/.test(phone)) {
        phoneError.classList.remove('hidden');
        isValid = false;
    } else {
        phoneError.classList.add('hidden');
    }
    
    if (!isValid) return;
    
    if (cart.length === 0) {
        alert("Cart is empty");
        closeCheckoutModal();
        return;
    }
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    let message = `🛒 NEW ORDER - GRANDSLAM\n\n`;
    message += `Customer Details:\n`;
    message += `Name: ${name}\n`;
    message += `Contact: +91 ${phone}\n\n`;
    message += `Order Details:\n`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    message += `\nSubtotal: ₹${subtotal.toFixed(2)}\n`;
    message += `GST (18%): ₹${gst.toFixed(2)}\n`;
    message += `Total Payable: ₹${total.toFixed(2)}\n\n`;
    message += `Please confirm this order.\n`;
    message += `Thank you.`;
    
    const encodedMessage = encodeURIComponent(message);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    
    // Open WhatsApp
    window.open(`https://wa.me/918456969860?text=${encodedMessage}`, "_blank");
    
    // Redirect to success page
    window.location.href = "order-success.html";
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

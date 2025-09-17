// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupEventListeners();
    updateCartCount();
});

// Initialize Cart
function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(name, price);
            showNotification(`${name} added to cart`);
        });
    });
    
    // Buy Now buttons
    const buyNowButtons = document.querySelectorAll('.btn-buy');
    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Clear cart and add only this item
            localStorage.setItem('cart', JSON.stringify([{ name, price, quantity: 1 }]));
            updateCartCount();
            
            // Redirect to order page
            window.location.href = 'order.html';
        });
    });
    
    // Cart modal functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close');
    
    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showCartModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // Order form handling
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        populateOrderSummary();
        orderForm.addEventListener('submit', function(e) {
            // Set hidden fields with order details before submission
            const orderDetails = getOrderDetails();
            document.getElementById('order-details').value = orderDetails;
            document.getElementById('order-total').value = calculateTotal();
            
            // Form will submit to Formspree
        });
    }
    
    // Reservation form handling
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        // Set today as min date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').setAttribute('min', today);
        
        // Form will submit to Formspree
    }
}

// Cart Functions
function addToCart(name, price) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function removeFromCart(name) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const updatedCart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
    
    // Refresh cart modal if open
    if (document.getElementById('cart-modal').style.display === 'block') {
        showCartModal();
    }
    
    // Refresh order page if on it
    if (window.location.pathname.includes('order.html')) {
        populateOrderSummary();
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }
}

function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}

function getOrderDetails() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return cart.map(item => `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
}

// Modal Functions
function showCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price');
    
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price} x ${item.quantity}</p>
                </div>
                <div>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-name="${item.name}">Remove</button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
        
        // Add event listeners to remove buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                removeFromCart(name);
            });
        });
        
        cartTotal.textContent = calculateTotal();
    }
    
    modal.style.display = 'block';
}

// Order Page Functions
function populateOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total-price');
    
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p>Your cart is empty. <a href="menu.html">Browse our menu</a></p>';
        orderTotal.textContent = '0';
    } else {
        orderItems.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price} x ${item.quantity}</p>
                </div>
                <div>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-name="${item.name}">Remove</button>
                </div>
            `;
            orderItems.appendChild(itemElement);
        });
        
        // Add event listeners to remove buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                removeFromCart(name);
            });
        });
        
        orderTotal.textContent = calculateTotal();
    }
}

// Notification Function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--accent-color)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '3px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}



    // Cart functionality
        let cart = [];
        const cartCount = document.querySelector('.cart-count');
        const cartModal = document.querySelector('.cart-modal');
        const cartItems = document.querySelector('.cart-items');
        const cartTotalPrice = document.querySelector('.cart-total-price');
        const cartIcon = document.querySelector('.cart-icon');
        const closeCart = document.querySelector('.cart-close');
        const continueShopping = document.getElementById('continue-shopping');
        const placeOrderBtn = document.getElementById('place-order-btn');
        
        // Formspree modals
        const singleItemModal = document.getElementById('single-item-modal');
        const cartOrderModal = document.getElementById('cart-modal');
        const singleItemClose = singleItemModal.querySelector('.formspree-close');
        const cartOrderClose = cartOrderModal.querySelector('.formspree-close');

        // Initialize cart from localStorage if available
        function initCart() {
            const savedCart = localStorage.getItem('restaurantCart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                updateCartCount();
            }
        }

        cartIcon.addEventListener('click', function() {
    renderCartItems();
    cartModal.style.display = 'block';
});

        // Update cart count badge
        function updateCartCount() {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        // Add item to cart
        function addToCart(id, name, price, img) {
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id,
                    name,
                    price,
                    img,
                    quantity: 1
                });
            }
            
            // Save to localStorage
            localStorage.setItem('restaurantCart', JSON.stringify(cart));
            
            updateCartCount();
            showNotification(`${name} added to cart`);
            
            // Open cart modal when adding an item
            renderCartItems();
            cartModal.style.display = 'block';
        }

        // Remove item from cart
        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            localStorage.setItem('restaurantCart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }

        // Update item quantity
        function updateQuantity(id, change) {
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity += change;
                
                if (item.quantity <= 0) {
                    removeFromCart(id);
                } else {
                    localStorage.setItem('restaurantCart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartItems();
                }
            }
        }

        // Render cart items
        function renderCartItems() {
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
                cartTotalPrice.textContent = '$0.00';
                placeOrderBtn.disabled = true;
                return;
            }
            
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                `;
                
                cartItems.appendChild(cartItem);
            });
            
            cartTotalPrice.textContent = `$${total.toFixed(2)}`;
            placeOrderBtn.disabled = false;
            
            // Add event listeners to quantity buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    updateQuantity(id, -1);
                });
            });
            
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    updateQuantity(id, 1);
                });
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    removeFromCart(id);
                });
            });
        }

        // Show notification
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'var(--accent-color)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '3px';
            notification.style.zIndex = '10000';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }

        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', function() {
            initCart();
            
            // Mobile Menu Toggle
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger && navMenu) {
                hamburger.addEventListener('click', function() {
                    hamburger.classList.toggle('active');
                    navMenu.classList.toggle('active');
                });
            }
            
            // Close mobile menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (hamburger && navMenu) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                });
            });
            
            // Add to Cart buttons
            const addToCartButtons = document.querySelectorAll('.btn-add');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const name = this.getAttribute('data-name');
                    const price = parseFloat(this.getAttribute('data-price'));
                    const img = this.getAttribute('data-img');
                    
                    addToCart(id, name, price, img);
                });
            });
            
            // Buy Now buttons
            const buyNowButtons = document.querySelectorAll('.btn-buy');
            const productName = document.getElementById('product-name');
            const formProduct = document.getElementById('form-product');
            const formPrice = document.getElementById('form-price');
            const summaryProductName = document.getElementById('summary-product-name');
            const summaryProductPrice = document.getElementById('summary-product-price');
            
            buyNowButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const name = this.getAttribute('data-name');
                    const price = this.getAttribute('data-price');
                    
                    productName.textContent = name;
                    formProduct.value = name;
                    formPrice.value = price;
                    summaryProductName.textContent = name;
                    summaryProductPrice.textContent = `$${price}`;
                    
                    singleItemModal.style.display = 'block';
                });
            });
            
            // Cart functionality
            cartIcon.addEventListener('click', function() {
                renderCartItems();
                cartModal.style.display = 'block';
            });
            
            closeCart.addEventListener('click', function() {
                cartModal.style.display = 'none';
            });
            
            continueShopping.addEventListener('click', function() {
                cartModal.style.display = 'none';
            });
            
            placeOrderBtn.addEventListener('click', function() {
                // Prepare order details for Formspree
                let orderDetails = '';
                let total = 0;
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    orderDetails += `${item.quantity}x ${item.name} - $${itemTotal.toFixed(2)}\n`;
                });
                
                document.getElementById('order-details').value = orderDetails;
                document.getElementById('order-total').value = total.toFixed(2);
                
                // Update order summary in the form
                const cartOrderSummary = document.getElementById('cart-order-summary');
                cartOrderSummary.innerHTML = '';
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    const orderItem = document.createElement('div');
                    orderItem.className = 'order-item';
                    orderItem.innerHTML = `
                        <span>${item.quantity}x ${item.name}</span>
                        <span>$${itemTotal.toFixed(2)}</span>
                    `;
                    cartOrderSummary.appendChild(orderItem);
                });
                
                document.getElementById('cart-summary-total').textContent = `$${total.toFixed(2)}`;
                
                // Show the cart order modal
                cartModal.style.display = 'none';
                cartOrderModal.style.display = 'block';
            });
            
            // Close modals when clicking on close buttons
            singleItemClose.addEventListener('click', function() {
                singleItemModal.style.display = 'none';
            });
            
            cartOrderClose.addEventListener('click', function() {
                cartOrderModal.style.display = 'none';
            });
            
            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    cartModal.style.display = 'none';
                }
                if (e.target === singleItemModal) {
                    singleItemModal.style.display = 'none';
                }
                if (e.target === cartOrderModal) {
                    cartOrderModal.style.display = 'none';
                }
            });
            
            // Category navigation
            const categoryLinks = document.querySelectorAll('.category-link');
            categoryLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    categoryLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Scroll to section
                    const targetId = this.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        window.scrollTo({
                            top: targetSection.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
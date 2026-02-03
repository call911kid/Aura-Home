import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "../Scripts/firebase.js";// Shopping Cart Functionality for Aura Home
const cartKey = 'aura_cart';

// Helper: Get cart from local storage
function getCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartIconCount();
    renderCart();
}

// Helper: Toast (reuse from wishlist if available, or simple log)
function showToast(message) {
    console.log(message);
}

// Toggle Cart Sidebar
function toggleCart() {
    const sidebarElement = document.getElementById('cartSidebar');
    if (sidebarElement) {
        let bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
        if (!bsOffcanvas) {
            bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
        }
        bsOffcanvas.show(); 
    } else {
        console.error("Sidebar element #cartSidebar not found!");
    }
}
// Add Item to Cart (or increment quantity)
function addToCartFromPage(btn) {
    const card = btn.closest('.card');
    const id = card.getAttribute('data-id');
    const name = card.getAttribute('data-name');
    const price = parseFloat(card.getAttribute('data-price'));
    const img = card.getAttribute('data-img');
    if (!id) {
        console.error("Product ID is missing from HTML attributes!");
        return;
    }

    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }

    saveCart(cart);
    updateCartIconCount();

    // Optional: Open cart or show success message
     toggleCart(); 
    const badge = document.getElementById('cart-count');
    if(badge)
    badge.classList.add('animate__animated', 'animate__bounceIn'); // Example animation class
    setTimeout(() => badge.classList.remove('animate__animated', 'animate__bounceIn'), 1000);
}


// Remove Item from Cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

// from Wishing List 
function moveFromWishlistToCart(id) {
    let wishlist = getWishlist();
    const product = wishlist.find(item => item.id === id);

    if (product) {
        let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
        
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ 
                id: product.id, 
                name: product.name, 
                price: parseFloat(product.price), 
                img: product.img, 
                quantity: 1 
            });
        }

        localStorage.setItem('aura_cart', JSON.stringify(cart));
        
        if (typeof updateCartIconCount === "function") updateCartIconCount();
        if (typeof renderCart === "function") renderCart();

         removeFromWishlist(id); 

        alert(` Added Product ${product.name} to cart   ! 🛒`);
    }
}

// Update Item Quantity
function updateQuantity(id, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        // If quantity drops to 0 or below, remove item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
}

// Calculate Total Price
function calculateTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}

// Render Cart Items in Sidebar
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    let cart = getCart();
    
cart = cart.filter(item => item && item.id !== null && item.id !== "null");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div class="text-center text-muted mt-5"><i class="fa-solid fa-cart-shopping fa-3x mb-3"></i><p>Your cart is empty.</p></div>';
        if (totalElement) totalElement.innerText = '$0.00';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="d-flex align-items-center border-bottom py-3">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
            <div class="ms-3 flex-grow-1">
                <h6 class="mb-1 fw-bold" style="font-size: 0.95rem;">${item.name}</h6>
                <div class="text-muted" style="font-size: 0.85rem;">$${item.price} x ${item.quantity}</div>
                <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="mx-2" style="font-size: 0.9rem;">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="text-end ms-2">
                <div class="fw-bold mb-2">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-sm text-danger p-0" onclick="removeFromCart('${item.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (totalElement) {
        totalElement.innerText = '$' + calculateTotal(cart);
    }
}

// Update Cart Count Badge in Navbar
function updateCartIconCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const badge = document.getElementById('cart-count'); 
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartIconCount();
    
    if (document.getElementById('cart-items-container')) {
        renderCart();
    }
});

//Create order 
async function createOrder(cart, total) {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            items: cart,
            totalAmount: parseFloat(total),
            status: "pending",
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "Orders"), orderData);
        return docRef.id;
    } catch (error) {
        console.error("Error in createOrder:", error);
        return null;
    }
}


async function handleCheckout() {
    
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const btn = document.querySelector('.checkout-btn-main');

    if (cart.length === 0) {
        alert("Your cart is empty! Add some products first.");
        return;
    }

   const user = auth.currentUser; 

    if (!user) {
        alert("Please login first to complete your order.");
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = "login.html"; 
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing Order...';
    }

    const total = calculateTotal(cart);
    const orderId = await createOrder(cart, total); 

    if (orderId) {
        localStorage.removeItem(cartKey);
        updateCartIconCount();
        renderCart();

        window.location.href = `Order.html?orderId=${orderId}`;
    } else {
        alert("Failed to place order. Please try again.");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Try Again';
        }
    }
}

/*window.handleCheckout = handleCheckout;
function showOrderSuccess(id) {
    alert(`Thank you for your purchase! \nOrder ID: ${id}\nStatus: Pending: will review your order shortly.`);
}*/
window.addToCartFromPage = addToCartFromPage;
window.handleCheckout = handleCheckout;
window.addToCartFromPage = addToCartFromPage;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
window.toggleCart = toggleCart;
window.renderCart = renderCart
window.updateCartIconCount = updateCartIconCount;

const wishlistKey = 'aura_wishlist';

// Helper: Get wishlist from local storage
function getWishlist() {
    return JSON.parse(localStorage.getItem(wishlistKey)) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    updateWishlistIconCount();
    renderWishlist();
}

// Toggle Wishlist Sidebar
function toggleWishlist() {
    const sidebarElement = document.getElementById('wishlistSidebar');
    if (sidebarElement) {
        let bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
        if (!bsOffcanvas) {
            bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
        }
        bsOffcanvas.show(); 
    }
}

// Add Item to Wishlist
function addToWishlist(btn) {
    const card = btn.closest('.card');
    const id = card.getAttribute('data-id');
    const name = card.getAttribute('data-name');
    const price = parseFloat(card.getAttribute('data-price'));
    const img = card.getAttribute('data-img');

    let wishlist = getWishlist();
    if (!wishlist.find(item => item.id === id)) {
        wishlist.push({ id, name, price, img });
        saveWishlist(wishlist);
        alert(`${name} added to wishlist! ❤️`);
    } else {
        alert("Product already in wishlist!");
    }
}

// Remove from Wishlist
window.removeFromWishlist = function(id) {
    let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    
    if (window.updateWishlistIconCount) window.updateWishlistIconCount();
    if (window.renderWishlist) window.renderWishlist();
    
    const productCard = document.querySelector(`.card[data-id="${id}"]`);
    if (productCard) {
        const heartIcon = productCard.querySelector('.wishlist-btn-overlay i');
        if (heartIcon) {
            heartIcon.classList.replace('fa-solid', 'fa-regular');
        }
    }
};


// Move from Wishlist to Cart
function moveToCart(id) {
    let wishlist = getWishlist();
    const item = wishlist.find(i => i.id === id);
    if (item) {
        // Use your existing addToCart logic or call it directly
        // Assuming addToCartFromPage style or similar
        let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
        const existing = cart.find(c => c.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        localStorage.setItem('aura_cart', JSON.stringify(cart));
        
        // Remove from wishlist and update UI
        removeFromWishlist(id);
        if (typeof updateCartIconCount === "function") updateCartIconCount();
        if (typeof renderCart === "function") renderCart();
        alert("Moved to cart! 🛒");
    }
}

// Render Wishlist
window.renderWishlist = function() {
    const container = document.getElementById('wishlist-items-container');
    const wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
    
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '<div class="text-center text-muted mt-5"><i class="fa-regular fa-heart fa-3x mb-3"></i><p>Your wishlist is empty.</p></div>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="d-flex align-items-center border-bottom py-3">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
            <div class="ms-3 flex-grow-1">
                <h6 class="mb-1 fw-bold" style="font-size: 0.95rem;">${item.name}</h6>
                <div class="text-muted" style="font-size: 0.85rem;">$${item.price}</div>
                <button class="btn btn-sm btn-success mt-2 py-1 px-2" onclick="moveToCart('${item.id}')">Add to Cart 🛒</button>
            </div>
            <div class="text-end ms-2">
                <button class="btn btn-sm text-danger p-0" onclick="removeFromWishlist('${item.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');
};

window.updateWishlistIconCount = function() {
    const wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
    const badge = document.getElementById('wishlist-count'); 
    if (badge) {
        badge.innerText = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'block' : 'none';
    }
};


// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistIconCount();
    renderWishlist();
});

// Export functions to window
window.toggleWishlist = toggleWishlist;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.moveToCart = moveToCart;

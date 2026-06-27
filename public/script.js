// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis for buttery smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Update GSAP ScrollTrigger when Lenis scrolls
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const hoverTargets = document.querySelectorAll('.hover-target, a, button, .glass-card');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = mouseX;
let followerY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate update for the small dot
    if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }
});

// Animate follower for smooth lagging effect
gsap.ticker.add(() => {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    if (cursorFollower) {
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
    }
});

hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    target.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// 3. GSAP Animations & ScrollTriggers

// Initial Hero Reveal
const tl = gsap.timeline();
tl.to('.gsap-reveal', {
    y: 0,
    opacity: 1,
    duration: 1.5,
    stagger: 0.2,
    ease: 'power4.out',
    delay: 0.5
});

// Scroll animations for sections
gsap.utils.toArray('.gsap-fade').forEach(element => {
    gsap.to(element, {
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
        },
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
    });
});

// Marquee text scrolling based on scroll direction
const marquee = document.querySelector('.marquee');
if (marquee) {
    let mm = gsap.matchMedia();

    gsap.to(marquee, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: ".parallax-text",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        }
    });
}

// Parallax Images
gsap.utils.toArray('.p-img').forEach(img => {
    const speed = img.getAttribute('data-speed');
    gsap.to(img, {
        y: () => -100 * speed,
        ease: "none",
        scrollTrigger: {
            trigger: ".parallax-text",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// 4. Three.js Background (Interactive Particle Field)
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// WebGL Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles in a wide area
    posArray[i] = (Math.random() - 0.5) * 200;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0x4f46e5, // Primary color
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction for particles
let particleMouseX = 0;
let particleMouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    particleMouseX = (event.clientX - windowHalfX);
    particleMouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate slowly over time
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Smooth follow mouse
    targetX = particleMouseX * 0.001;
    targetY = particleMouseY * 0.001;
    
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

    renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 5. Marketplace Logic (Simulating MongoDB with LocalStorage for immediate testing)
const marketContainer = document.getElementById('market-items-container');
const sellForm = document.getElementById('sellItemForm');

// Default initial items (acting as our mock DB)
const defaultItems = [
    { name: 'Biology 101 Textbook', price: 350, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80' },
    { name: 'Monitor 24"', price: 4500, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' },
    { name: 'Desk Lamp', price: 200, image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80' },
    { name: 'College Backpack', price: 800, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80' },
    { name: 'Mechanical Keyboard', price: 1200, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80' },
    { name: 'Mattress Pad', price: 500, image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=500&q=80' }
];

// Initialize DB with premium seed data if it's empty
if(!localStorage.getItem('dormItems') || JSON.parse(localStorage.getItem('dormItems')).length === 0) {
    const seedItems = [
        { name: "Casio Scientific Calculator", price: "450", image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?w=500&q=80", category: "Electronics", condition: "Like New (Barely touched before finals)", sellerName: "Aditi", sellerMobile: "9876543210", sellerAvatar: "🐼" },
        { name: "Engineering Drawing Board", price: "800", image: "https://images.unsplash.com/photo-1603807008857-ad66b70431aa?w=500&q=80", category: "Textbooks", condition: "Used (Has some character & highlighted notes)", sellerName: "Rahul", sellerMobile: "9876543211", sellerAvatar: "🐯" },
        { name: "Study Table Lamp", price: "350", image: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=500&q=80", category: "Furniture", condition: "Like New (Barely touched before finals)", sellerName: "Sneha", sellerMobile: "9876543212", sellerAvatar: "🦉" },
        { name: "Acoustic Guitar", price: "2500", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80", category: "Hobbies", condition: "Used (Has some character & highlighted notes)", sellerName: "Kabir", sellerMobile: "9876543213", sellerAvatar: "🎸" },
        { name: "Organic Chemistry 8th Ed", price: "600", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80", category: "Textbooks", condition: "Desperate Seller (Leaving campus tomorrow, dirt cheap)", sellerName: "Priya", sellerMobile: "9876543214", sellerAvatar: "🦊" }
    ];
    localStorage.setItem('dormItems', JSON.stringify(seedItems));
}

// Render items
function renderItems(searchTerm = '') {
    if (!marketContainer) return; // Skip if not on marketplace page

    // Get current category from URL or default to 'All'
    const urlParams = new URLSearchParams(window.location.search);
    let currentCategory = urlParams.get('category') || 'All';

    // Highlight the correct filter pill
    const filterPills = document.querySelectorAll('#marketplaceFilters .filter-pill');
    filterPills.forEach(pill => {
        if (pill.getAttribute('data-category') === currentCategory) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
        
        // Add click listener to pills to filter without reloading page
        pill.onclick = () => {
            const newCat = pill.getAttribute('data-category');
            // Update URL without reloading
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?category=' + newCat;
            window.history.pushState({path:newUrl},'',newUrl);
            renderItems(); // Re-render
        };
    });

    const items = JSON.parse(localStorage.getItem('dormItems')) || [];
    const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
    
    // Get filter values
    const locationSelect = document.getElementById('locationFilter');
    const conditionSelect = document.getElementById('conditionFilter');
    
    const locationVal = locationSelect ? locationSelect.value : 'All';
    const conditionVal = conditionSelect ? conditionSelect.value : 'All';

    // Filter items based on category, search term, location, and condition
    let itemsToRender = items;
    if (currentCategory !== 'All') {
        itemsToRender = itemsToRender.filter(item => item.category === currentCategory);
    }
    
    if (searchTerm.trim() !== '') {
        itemsToRender = itemsToRender.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Condition Filter
    if (conditionVal !== 'All') {
        itemsToRender = itemsToRender.filter(item => item.condition === conditionVal);
    }
    
    // Location Filter
    if (locationVal !== 'All') {
        itemsToRender = itemsToRender.filter(item => {
            const seller = allUsers.find(u => u.mobile === item.sellerMobile);
            return seller && seller.wing === locationVal;
        });
    }
    
    // Sort Filter Logic
    const sortSelect = document.getElementById('sortFilter');
    const sortVal = sortSelect ? sortSelect.value : 'newest';
    
    if (sortVal === 'priceLowHigh') {
        itemsToRender.sort((a, b) => {
            const priceA = parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0;
            const priceB = parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0;
            return priceA - priceB;
        });
    } else if (sortVal === 'priceHighLow') {
        itemsToRender.sort((a, b) => {
            const priceA = parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0;
            const priceB = parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0;
            return priceB - priceA;
        });
    } else {
        // Newest First (Assuming items appended at end are newest)
        // Reverse the array to show newest first, assuming original order is chronological
        itemsToRender.reverse();
    }

    marketContainer.innerHTML = '';
    
    if (itemsToRender.length === 0) {
        marketContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #aaa; font-size: 1.2rem; margin-top: 2rem;">No items found in ${currentCategory}.</p>`;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('dormUser'));

    itemsToRender.forEach(item => {
        // Anonymize the Seller for the public marketplace
        const isOwner = currentUser && currentUser.mobile === item.sellerMobile;
        const displayName = isOwner ? `${item.sellerName} (You)` : 'Anonymous Student';
        const displayAvatar = isOwner ? (item.sellerAvatar || '👤') : '🎭';
        const itemCondition = item.condition || 'Used';
        
        // Find seller location
        const seller = allUsers.find(u => u.mobile === item.sellerMobile);
        const sellerLocation = seller && seller.wing ? seller.wing : 'Campus';
        
        const card = document.createElement('div');
        card.className = 'market-item';
        card.setAttribute('data-tilt', '');
        card.setAttribute('data-tilt-max', '10');
        card.setAttribute('data-tilt-speed', '400');
        
        // Shorten condition for the badge
        let badgeColor = '#ff6b6b';
        let conditionText = 'Used';
        if (itemCondition.includes('Like New')) { badgeColor = '#4ade80'; conditionText = 'Like New'; }
        if (itemCondition.includes('Desperate')) { badgeColor = '#f59e0b'; conditionText = 'Clearance'; }
        
        let rentBadge = '';
        let priceDisplay = `₹${item.price}`;
        let escrowInfo = '';
        let buttonText = '<i class="ri-secure-payment-line"></i> Lock (Smart COD)';
        let buttonAction = `joinWaitlist('${item.name}', '₹${item.price}', '${item.sellerMobile}')`;

        if (item.listingType === 'Rent') {
            rentBadge = `<span style="position: absolute; top: 10px; left: 10px; background: #c084fc; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);"><i class="ri-calendar-2-line"></i> RENTAL</span>`;
            priceDisplay = `₹${item.price} <span style="font-size:0.9rem; color:#aaa; font-weight:400;">/ ${item.rentDuration || 'Day'}</span>`;
            escrowInfo = `<p style="font-size: 0.75rem; color: #c084fc; margin-top: 5px;"><i class="ri-lock-line"></i> Escrow Deposit: ₹${item.securityDeposit || 0}</p>`;
            buttonText = 'Request Rental';
            buttonAction = `requestRental('${item.id || item.name}', '${item.name}', '₹${item.price}', '${item.securityDeposit}', '${item.sellerMobile}')`;
        }

        let imageHTML = '';
        if (item.images && item.images.length > 1) {
            let imgSlides = item.images.map(imgUrl => `<div style="min-width: 100%; height: 200px; background: url('${imgUrl}') center/cover; scroll-snap-align: start;"></div>`).join('');
            imageHTML = `
                <div class="market-img" style="position: relative; overflow-x: auto; display: flex; scroll-snap-type: x mandatory; scroll-behavior: smooth; border-radius: 12px 12px 0 0; height: 200px;">
                    ${imgSlides}
                    ${rentBadge}
                    <span style="position: absolute; top: 10px; right: 10px; background: ${badgeColor}; color: #000; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">${conditionText}</span>
                    <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">${item.images.length} Photos <i class="ri-arrow-right-line"></i></div>
                </div>
            `;
        } else {
            imageHTML = `
                <div class="market-img" style="background: url('${item.image}') center/cover; position: relative; height: 200px; border-radius: 12px 12px 0 0;">
                    ${rentBadge}
                    <span style="position: absolute; top: 10px; right: 10px; background: ${badgeColor}; color: #000; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">${conditionText}</span>
                </div>
            `;
        }

        card.innerHTML = `
            ${imageHTML}
            <div class="market-info">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">${displayAvatar}</span>
                        <span style="font-size: 0.85rem; color: #aaa;">Listed by ${displayName}</span>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--accent);"><i class="ri-map-pin-line"></i> ${sellerLocation}</span>
                </div>
                <h4>${item.name}</h4>
                <p class="market-price" style="margin-bottom: 0;">${priceDisplay}</p>
                ${escrowInfo}
                <button onclick="${buttonAction}" class="btn-primary hover-target" style="margin-top:10px; font-size: 0.9rem; padding: 0.8rem; ${item.listingType === 'Rent' ? 'background: #c084fc;' : ''}">${buttonText}</button>
            </div>
        `;
        marketContainer.appendChild(card);
    });

    // Re-initialize VanillaTilt for new dynamic elements
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".market-item"));
    }
}

// Render Trending Items (For index.html)
function renderTrendingItems() {
    const trendingContainer = document.getElementById('trending-items-container');
    if (!trendingContainer) return; // Skip if not on index page

    const items = JSON.parse(localStorage.getItem('dormItems')) || [];
    trendingContainer.innerHTML = '';
    
    // Take up to 3 items
    const trendingItems = items.slice(0, 3);
    
    trendingItems.forEach(item => {
        const sellerName = item.sellerName || 'Anonymous';
        const sellerAvatar = item.sellerAvatar || '👤';
        
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.setAttribute('data-tilt', '');
        card.setAttribute('data-tilt-max', '15');
        card.setAttribute('data-tilt-speed', '400');
        card.setAttribute('data-tilt-glare', 'true');
        card.setAttribute('data-tilt-max-glare', '0.5');
        
        card.innerHTML = `
            <div class="card-content">
                <div class="icon-3d" style="background: url('${item.image}') center/cover;"></div>
                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 0.5rem; margin-top: 1rem;">
                    <span style="font-size: 1.2rem;">${sellerAvatar}</span>
                    <span style="font-size: 0.85rem; color: #aaa;">Listed by ${sellerName}</span>
                </div>
                <h3>${item.name}</h3>
                <p class="price">₹${item.price}</p>
                <button onclick="sendBuyNotification('${item.name}', '₹${item.price}', '${sellerName}')" class="btn-primary hover-target" style="margin-top:10px; font-size: 0.9rem; border: none; font-family: 'Outfit', sans-serif;">Buy Now</button>
            </div>
        `;
        trendingContainer.appendChild(card);
    });

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".glass-card"));
    }
}

// Handle form submission
if(sellForm) {
    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('dormUser'));
        if (!currentUser) {
            alert("You must be logged in to sell an item!");
            return;
        }
        
        const lifespanDays = document.getElementById('itemLifespan') ? parseInt(document.getElementById('itemLifespan').value) : 7;
        const expirationMs = Date.now() + (lifespanDays * 24 * 60 * 60 * 1000);

        const listingType = document.getElementById('listingType') ? document.getElementById('listingType').value : 'Sell';

        const imageInputs = document.querySelectorAll('.item-image-input');
        let imagesArray = [];
        if (imageInputs.length > 0) {
            imagesArray = Array.from(imageInputs).map(input => input.value).filter(val => val.trim() !== '');
        } else {
            const oldImageInput = document.getElementById('itemImage');
            if (oldImageInput && oldImageInput.value) {
                imagesArray.push(oldImageInput.value);
            }
        }
        
        const primaryImage = imagesArray.length > 0 ? imagesArray[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

        const newItem = {
            id: Date.now().toString(), // added ID for exact targeting
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            image: primaryImage,
            images: imagesArray,
            category: document.getElementById('itemCategory') ? document.getElementById('itemCategory').value : 'Other',
            condition: document.getElementById('itemCondition') ? document.getElementById('itemCondition').value : 'Used (Has some character & highlighted notes)',
            lifespan: lifespanDays,
            expirationDate: expirationMs,
            listingType: listingType,
            rentDuration: listingType === 'Rent' ? document.getElementById('rentDuration').value : null,
            securityDeposit: listingType === 'Rent' ? document.getElementById('securityDeposit').value : null,
            sellerName: currentUser.name,
            sellerMobile: currentUser.mobile,
            sellerAvatar: currentUser.avatar || '🦊',
            sellerEmail: currentUser.email
        };
        
        const items = JSON.parse(localStorage.getItem('dormItems')) || [];
        // Add to beginning of array
        items.unshift(newItem);
        localStorage.setItem('dormItems', JSON.stringify(items));
        
        // Clear form
        sellForm.reset();
        alert('Item successfully listed!');
        // Redirect to marketplace
        window.location.href = 'marketplace.html';
    });
}

// Search Event Listener
const marketSearch = document.getElementById('marketSearch');
if (marketSearch) {
    marketSearch.addEventListener('input', (e) => {
        renderItems(e.target.value);
    });
}

// Dropdown Event Listeners
const locationFilter = document.getElementById('locationFilter');
const conditionFilter = document.getElementById('conditionFilter');
const sortFilter = document.getElementById('sortFilter');

[locationFilter, conditionFilter, sortFilter].forEach(filterElement => {
    if (filterElement) {
        filterElement.addEventListener('change', () => {
            renderItems(marketSearch ? marketSearch.value : '');
        });
    }
});

// Automated Inventory Flusher
function flushGhostListings() {
    let items = JSON.parse(localStorage.getItem('dormItems')) || [];
    const now = Date.now();
    const originalLength = items.length;
    
    // Filter out expired items
    items = items.filter(item => !item.expirationDate || item.expirationDate > now);
    
    if (items.length < originalLength) {
        console.log(`[FLUSHER] Removed ${originalLength - items.length} ghost listings from the feed.`);
        localStorage.setItem('dormItems', JSON.stringify(items));
    }
}

// Simulated WhatsApp Alert for Expiring Items
function simulateWhatsAppAlert() {
    const currentUser = JSON.parse(localStorage.getItem('dormUser'));
    if (!currentUser) return;
    
    let items = JSON.parse(localStorage.getItem('dormItems')) || [];
    const now = Date.now();
    const OneDayMs = 24 * 60 * 60 * 1000;
    
    let dbUpdated = false;

    items.forEach(item => {
        if (item.sellerMobile === currentUser.mobile && item.expirationDate) {
            const timeRemaining = item.expirationDate - now;
            
            // If expiring within 24 hours
            if (timeRemaining > 0 && timeRemaining < OneDayMs) {
                // Simulate WhatsApp Alert using prompt
                const response = prompt(`🟢 WhatsApp Automated Alert:\n\nYour listing for "${item.name}" expires tomorrow.\nIs it still available?\n\nReply 'YES' to keep it live for 3 more days, or 'NO' to archive it immediately.`);
                
                if (response && response.trim().toUpperCase() === 'YES') {
                    // Extend by 3 days
                    item.expirationDate = now + (3 * OneDayMs);
                    dbUpdated = true;
                    alert(`Got it! "${item.name}" has been extended for 3 more days.`);
                } else if (response && response.trim().toUpperCase() === 'NO') {
                    // Expire immediately
                    item.expirationDate = now - 1000; 
                    dbUpdated = true;
                    alert(`"${item.name}" has been archived and removed from the feed.`);
                }
            }
        }
    });
    
    if (dbUpdated) {
        localStorage.setItem('dormItems', JSON.stringify(items));
        flushGhostListings(); // Clear immediately if they said NO
    }
}

// Campus Pulse Logic
function updateCampusPulse() {
    let items = JSON.parse(localStorage.getItem('dormItems')) || [];
    let waitlist = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
    const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
    
    const pulseTickers = document.querySelectorAll('#footer-pulse-ticker');
    const savingsTickers = document.querySelectorAll('#footer-savings-ticker');
    
    if (pulseTickers.length > 0) {
        if (items.length > 0) {
            // Find most popular wing
            const wingCounts = {};
            items.forEach(item => {
                const seller = allUsers.find(u => u.mobile === item.sellerMobile);
                const wing = seller && seller.wing ? seller.wing : 'Campus';
                wingCounts[wing] = (wingCounts[wing] || 0) + 1;
            });
            const topWing = Object.keys(wingCounts).reduce((a, b) => wingCounts[a] > wingCounts[b] ? a : b);
            
            pulseTickers.forEach(ticker => {
                ticker.innerText = `🔥 ${items.length} active listings right now (Hotspot: ${topWing})!`;
            });
        } else {
            pulseTickers.forEach(ticker => {
                ticker.innerText = `Campus is quiet today... Be the first to list!`;
            });
        }
    }
    
    if (savingsTickers.length > 0) {
        let totalTransactedVolume = 0;
        waitlist.forEach(w => {
            const priceNum = parseInt(String(w.itemPrice).replace(/[^0-9]/g, '')) || 0;
            totalTransactedVolume += priceNum;
        });
        
        savingsTickers.forEach(ticker => {
            ticker.innerText = `₹${totalTransactedVolume.toLocaleString()}`;
        });
    }
}

// Initial render
flushGhostListings();
simulateWhatsAppAlert();
updateCampusPulse();
renderItems();
renderTrendingItems();

// 6. Join Waitlist System (Smart COD)
window.joinWaitlist = function(itemName, itemPrice, sellerMobile) {
    const currentUser = JSON.parse(localStorage.getItem('dormUser'));
    if (!currentUser) {
        alert("You must be logged in to lock an item!");
        return;
    }
    
    // Check if user is trying to buy their own item
    if (currentUser.mobile === sellerMobile) {
        alert("You cannot lock your own item!");
        return;
    }
    
    let waitlist = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
    
    // Check if already on waitlist
    const alreadyWaiting = waitlist.find(w => w.itemName === itemName && w.buyerMobile === currentUser.mobile);
    if (alreadyWaiting) {
        alert("You have already locked this item!");
        return;
    }

    // Smart COD Logic
    // Extract numerical price
    const priceNum = parseInt(itemPrice.replace(/[^0-9]/g, ''));
    const tokenAmount = 50; // ₹50 website fee
    const remainingBalance = priceNum > tokenAmount ? priceNum - tokenAmount : 0;

    const confirmed = confirm(`🔒 SMART COD: Commitment Token Required\n\nTo prevent ghosting, we require a ₹${tokenAmount} non-refundable commitment token (Website Fee).\n\nItem: ${itemName}\nTotal Price: ₹${priceNum}\n\n1. Pay ₹${tokenAmount} now via UPI.\n2. Pay the remaining ₹${remainingBalance} to the seller ONLY after physical inspection.\n\nDo you want to proceed and lock this item?`);

    if (confirmed) {
        // Simulate UPI Payment
        const upiPin = prompt(`🟢 SIMULATED UPI GATEWAY\n\nPaying ₹${tokenAmount} to Dorm2Dorm Escrow...\nEnter any 4-digit PIN to confirm payment:`);
        
        if (upiPin && upiPin.length >= 4) {
            waitlist.push({
                itemName: itemName,
                itemPrice: `₹${remainingBalance} (Balance)`,
                sellerMobile: String(sellerMobile),
                buyerName: currentUser.name,
                buyerMobile: currentUser.mobile,
                date: new Date().toLocaleDateString(),
                type: 'Purchase',
                tokenPaid: tokenAmount
            });
            
            localStorage.setItem('dormWaitlist', JSON.stringify(waitlist));
            updateCampusPulse(); // Update the savings dynamically
            
            // Change button text visually
            if (event && event.target) {
                event.target.innerHTML = '✓ Locked (Pending Meetup)';
                event.target.style.background = '#4ade80';
                event.target.style.color = '#000';
            }
            
            alert(`✅ Payment Successful! You have locked ${itemName}.\n\nClick OK to automatically open WhatsApp and coordinate the meetup with the seller!`);
            const waMessage = `Hey! I just paid the commitment token and locked your item "${itemName}" on Dorm2Dorm. When and where can we meet so I can inspect it and pay the remaining balance?`;
            window.open(`https://wa.me/91${sellerMobile}?text=${encodeURIComponent(waMessage)}`, '_blank');
        } else {
            alert("Payment cancelled or invalid PIN.");
        }
    }
};

// 6.5 Rental Escrow System
window.requestRental = function(itemId, itemName, itemPrice, securityDeposit, sellerMobile) {
    const currentUser = JSON.parse(localStorage.getItem('dormUser'));
    if (!currentUser) {
        alert("You must be logged in to rent an item!");
        return;
    }
    
    if (currentUser.mobile === sellerMobile) {
        alert("You cannot rent your own item!");
        return;
    }
    
    // Simulate Escrow Logic
    const confirmed = confirm(`🛡️ ESCROW PROTOCOL INITIATED\n\nYou are about to request to rent: ${itemName}\nRental Fee: ${itemPrice}\nSecurity Deposit: ₹${securityDeposit || 0}\n\nThe security deposit will be securely held in the Dorm2Dorm Escrow and fully refunded to you once the lender marks the item as returned.\n\nDo you accept these terms?`);
    
    if (confirmed) {
        // Save to waitlist/rentals DB
        let waitlist = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
        
        // Check if already rented/requested
        const alreadyWaiting = waitlist.find(w => w.itemName === itemName && w.buyerMobile === currentUser.mobile);
        if (alreadyWaiting) {
            alert("You have already requested to rent this item!");
            return;
        }
        
        waitlist.push({
            itemName: itemName,
            itemPrice: itemPrice,
            sellerMobile: String(sellerMobile),
            buyerName: currentUser.name,
            buyerMobile: currentUser.mobile,
            date: new Date().toLocaleDateString(),
            type: 'Rental',
            status: 'Active',
            securityDeposit: securityDeposit
        });
        
        localStorage.setItem('dormWaitlist', JSON.stringify(waitlist));
        
        // Change button visually
        if (event && event.target) {
            event.target.innerText = '✓ Rental Requested';
            event.target.style.background = '#4ade80';
            event.target.style.color = '#000';
            event.target.style.border = 'none';
        }
        
        alert(`Request sent! Your ₹${securityDeposit} deposit is pending escrow transfer.\n\nClick OK to automatically open WhatsApp and coordinate the rental with the lender!`);
        const waMessage = `Hey! I just initiated the rental request for "${itemName}" on Dorm2Dorm. My security deposit is pending in Escrow. When can I come pick it up?`;
        window.open(`https://wa.me/91${sellerMobile}?text=${encodeURIComponent(waMessage)}`, '_blank');
    }
};

// Escrow Release Simulation
window.releaseEscrow = function(itemId, buyerName) {
    const confirmed = confirm(`Do you confirm that ${buyerName} has returned the rented item in good condition? \n\nClicking OK will release the security deposit from Escrow back to the borrower.`);
    if (confirmed) {
        alert(`✅ Escrow Released! The security deposit has been refunded to ${buyerName}.`);
        // Remove from waitlist to signify completion
        let waitlist = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
        waitlist = waitlist.filter(w => !(w.buyerName === buyerName && (w.itemName === itemId || w.itemName.includes(itemId))));
        localStorage.setItem('dormWaitlist', JSON.stringify(waitlist));
        
        // Refresh profile
        document.getElementById('navProfileBtn').click();
    }
};

// 7. Auth System (Password Login/Signup) & Profile
const authOverlay = document.getElementById('auth-overlay');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const signupFields = document.getElementById('signup-fields');
const authSubtitle = document.getElementById('authSubtitle');

const mobileNumber = document.getElementById('mobileNumber');
const userPassword = document.getElementById('userPassword');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userWing = document.getElementById('userWing');
const referralCodeInput = document.getElementById('referralCodeInput');
const emojiBtns = document.querySelectorAll('.emoji-btn');

let isSignupMode = false;
let selectedAvatar = '🦊';

// Emoji selection logic
emojiBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all
        emojiBtns.forEach(b => {
            b.style.background = 'transparent';
            b.style.borderColor = 'transparent';
        });
        // Add active class to clicked
        const clicked = e.target;
        clicked.style.background = 'rgba(255,255,255,0.2)';
        clicked.style.borderColor = 'var(--accent)';
        selectedAvatar = clicked.innerText;
    });
});

// Check if user is already logged in
const savedUser = JSON.parse(localStorage.getItem('dormUser'));
if(savedUser && savedUser.mobile && authOverlay) {
    authOverlay.style.display = 'none'; // Skip auth if logged in
}

if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', () => {
        isSignupMode = !isSignupMode;
        if (isSignupMode) {
            signupFields.style.display = 'block';
            authSubmitBtn.innerText = 'Sign Up';
            authSubtitle.innerText = 'Create your account to start trading.';
            toggleAuthMode.innerHTML = 'Already have an account? <b>Log in</b>';
            const pwdHint = document.getElementById('passwordHint');
            if (pwdHint) pwdHint.style.display = 'block';
        } else {
            signupFields.style.display = 'none';
            authSubmitBtn.innerText = 'Login';
            authSubtitle.innerText = 'Secure login to the campus marketplace.';
            toggleAuthMode.innerHTML = "Don't have an account? <b>Sign up</b>";
            const pwdHint = document.getElementById('passwordHint');
            if (pwdHint) pwdHint.style.display = 'none';
        }
    });
}

const authFormContainer = document.getElementById('auth-form-container');
if (authFormContainer) {
    authFormContainer.addEventListener('submit', (e) => {
        e.preventDefault();
        const mobile = mobileNumber.value.trim();
        const pass = userPassword.value.trim();

        if (mobile.length < 10 || pass.length < 4) {
            alert("Please enter a valid mobile number and password.");
            return;
        }

        if (isSignupMode) {
            const name = userName.value.trim();
            const email = userEmail.value.trim();
            const wing = userWing ? userWing.value : 'Unknown Wing';
            const roomNode = document.getElementById('userRoom');
            const room = roomNode ? roomNode.value.trim() : '';
            
            if (!name || !email || !wing || !room) {
                alert("Please fill all fields (including your Hostel Wing and Room No) to sign up.");
                return;
            }

            // Password Validation: At least 1 letter, 1 number, and 1 special character
            const pwdRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;
            if (!pwdRegex.test(pass)) {
                alert("Security Alert: Your password must contain at least one letter, one number, and one special sign (e.g. @, $, #)!");
                return;
            }
            
            // Check if user already exists
            let allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
            if (allUsers.find(u => u.mobile === mobile)) {
                alert("Account with this mobile number already exists! Please login.");
                return;
            }
            
            // Generate Unique Referral ID (First 3 letters of name + 4 random numbers)
            const myReferralCode = (name.substring(0,3).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000));
            
            // Check if they used a referral code
            const inputReferral = referralCodeInput ? referralCodeInput.value.trim().toUpperCase() : '';
            if (inputReferral) {
                // Find the referrer and give them points
                const referrerIndex = allUsers.findIndex(u => u.referralCode === inputReferral);
                if (referrerIndex > -1) {
                    allUsers[referrerIndex].bonusPoints = (allUsers[referrerIndex].bonusPoints || 0) + 100;
                    console.log(`[BONUS] 100 points awarded to ${allUsers[referrerIndex].name}`);
                }
            }

            // Save user to simulated DB
            const newUser = { 
                name, 
                email, 
                mobile, 
                password: pass, 
                avatar: selectedAvatar, 
                wing: wing,
                room: room,
                referralCode: myReferralCode,
                bonusPoints: 0
            };
            
            localStorage.setItem('dormUser', JSON.stringify(newUser));
            
            // Log credentials to local DB (Simulation)
            allUsers.push(newUser);
            localStorage.setItem('allDormUsers_DB', JSON.stringify(allUsers));
            console.log(`[SECURE SERVER LOG] User ${newUser.email} saved securely to database folder.`);
            
            // Instantly update the leaderboard points
            if(typeof renderLeaderboard === 'function') renderLeaderboard();
            
            alert(`Signup successful! Your unique referral code is: ${myReferralCode}`);
            loginUser();
        } else {
            // Login mode
            const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
            const userFound = allUsers.find(u => u.mobile === mobile && u.password === pass);
            
            if (userFound) {
                // Set the current session
                localStorage.setItem('dormUser', JSON.stringify(userFound));
                loginUser();
            } else {
                alert("Invalid Mobile Number or Password. If you don't have an account, please sign up first!");
            }
        }
    });
}

function loginUser() {
    if (authOverlay) {
        authOverlay.style.opacity = '0';
        setTimeout(() => {
            authOverlay.style.display = 'none';
        }, 500);
    }
    // Also re-render elements if needed on login
    renderItems();
}

// 8. Profile Page Logic
const profileOverlay = document.getElementById('profile-overlay');
const navProfileBtn = document.getElementById('navProfileBtn');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

const pInitials = document.getElementById('profileInitials');
const pName = document.getElementById('profileNameDisplay');
const pEmail = document.getElementById('profileEmailDisplay');
const pPhone = document.getElementById('profilePhoneDisplay');

if (navProfileBtn) {
    navProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('dormUser'));
        if (user) {
            pName.innerText = user.name;
            pEmail.innerHTML = `<i class="ri-mail-line"></i> ${user.email}`;
            pPhone.innerHTML = `<i class="ri-phone-line"></i> ${user.mobile}`;
            const roomDisplay = document.getElementById('profileRoomDisplay');
            if (roomDisplay) {
                roomDisplay.innerHTML = `<i class="ri-map-pin-user-line"></i> ${user.wing} ${user.room ? '- Room ' + user.room : ''}`;
            }
            pInitials.innerText = user.avatar || '🦊';
            
            // Get fresh data for points
            const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
            const freshUser = allUsers.find(u => u.mobile === user.mobile) || user;
            
            const profileReferralCodeDisplay = document.getElementById('profileReferralCodeDisplay');
            if (profileReferralCodeDisplay) {
                profileReferralCodeDisplay.innerText = freshUser.referralCode || 'N/A';
            }
            const profilePointsDisplay = document.getElementById('profilePointsDisplay');
            if (profilePointsDisplay) {
                profilePointsDisplay.innerText = `Points: ${freshUser.bonusPoints || 0}`;
            }
            
            // Admin Tool Logic
            const adminDownloadBtn = document.getElementById('adminDownloadBtn');
            if (adminDownloadBtn) {
                if (user.mobile === "1234567890") {
                    adminDownloadBtn.style.display = 'block';
                } else {
                    adminDownloadBtn.style.display = 'none';
                }
            }
            
            // Populate listed items & Leads (My Store)
            const myItemsList = document.getElementById('my-items-list');
            const allItems = JSON.parse(localStorage.getItem('dormItems')) || [];
            const allWaitlists = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
            
            // Filter items that match the logged-in user's mobile number
            const myItems = allItems.filter(item => item.sellerMobile === user.mobile);
            
            if (myItems.length === 0) {
                myItemsList.innerHTML = '<p style="color: #666; font-style: italic;">No items listed yet.</p>';
            } else {
                myItemsList.innerHTML = ''; // Clear list
                myItems.forEach(item => {
                    // Find people waiting for THIS item
                    const itemLeads = allWaitlists.filter(w => w.itemName === item.name && w.sellerMobile === user.mobile);
                    let leadsHTML = '';
                    
                    if(itemLeads.length > 0) {
                        const title = item.listingType === 'Rent' ? 'Rental Requests (Escrow Locked):' : 'Waitlist / Interested Buyers:';
                        
                        leadsHTML = `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);">
                            <p style="font-size: 0.8rem; color: #aaa; margin-bottom: 5px;">${title}</p>
                            ${itemLeads.map(lead => {
                                let actionBtn = '';
                                if (item.listingType === 'Rent') {
                                    actionBtn = `<button onclick="releaseEscrow('${item.id || item.name}', '${lead.buyerName}')" style="margin-left: 10px; background: #c084fc; border: none; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">Release Deposit</button>`;
                                }
                                return `<div style="font-size: 0.85rem; color: ${item.listingType === 'Rent' ? '#c084fc' : '#4ade80'}; margin-bottom: 4px;">
                                    <i class="ri-user-smile-line"></i> ${lead.buyerName} (${lead.buyerMobile}) ${actionBtn}
                                </div>`;
                            }).join('')}
                        </div>`;
                    } else {
                        leadsHTML = `<p style="font-size: 0.8rem; color: #666; margin-top: 5px;"><i class="ri-time-line"></i> No waitlist/requests yet.</p>`;
                    }

                    myItemsList.innerHTML += `
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; font-size: 1.1rem;">${item.listingType === 'Rent' ? '<i class="ri-calendar-2-line" style="color: #c084fc;"></i> ' : ''}${item.name}</span>
                                <div>
                                    <span style="color: var(--accent); font-weight: bold; margin-right: 15px;">₹${item.price}</span>
                                    <button onclick="deleteMyItem('${item.name}')" style="background: transparent; border: none; color: #ff6b6b; cursor: pointer; font-size: 1.2rem;" class="hover-target" title="Delete Item"><i class="ri-delete-bin-line"></i></button>
                                </div>
                            </div>
                            ${leadsHTML}
                        </div>
                    `;
                });
            }

            // Populate My Waitlists (Items I want to buy)
            const myWaitlistsList = document.getElementById('my-waitlists-list');
            const myWaitlistedItems = allWaitlists.filter(w => w.buyerMobile === user.mobile);
            
            if (myWaitlistsList) {
                if (myWaitlistedItems.length === 0) {
                    myWaitlistsList.innerHTML = '<p style="color: #666; font-style: italic;">You haven\'t joined any waitlists.</p>';
                } else {
                    myWaitlistsList.innerHTML = '';
                    myWaitlistedItems.forEach(waitItem => {
                        const waitTypeIcon = waitItem.type === 'Rental' ? '<i class="ri-calendar-2-line"></i> Rental' : '<i class="ri-shopping-cart-2-line"></i> Purchase';
                        const waitBg = waitItem.type === 'Rental' ? 'rgba(192, 132, 252, 0.05)' : 'rgba(74, 222, 128, 0.05)';
                        const waitBorder = waitItem.type === 'Rental' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(74, 222, 128, 0.2)';
                        const waitColor = waitItem.type === 'Rental' ? '#c084fc' : '#4ade80';

                        myWaitlistsList.innerHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: ${waitBg}; padding: 0.7rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; border: 1px solid ${waitBorder};">
                                <div>
                                    <span style="font-weight: 600; color: ${waitColor};">${waitItem.itemName}</span>
                                    <div style="font-size: 0.75rem; color: #aaa; margin-top: 2px;">
                                        <span style="background: ${waitColor}; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-right: 5px;">${waitTypeIcon}</span>
                                        Seller Contact: ${waitItem.sellerMobile}
                                    </div>
                                </div>
                                <span style="color: white; font-weight: bold;">₹${waitItem.itemPrice}</span>
                            </div>
                        `;
                    });
                }
            }
            
            profileOverlay.style.display = 'flex';
            setTimeout(() => { profileOverlay.style.opacity = '1'; }, 10);
        } else {
            alert("Please login first to view your profile.");
        }
    });
}

window.deleteMyItem = function(itemName) {
    if(confirm(`Are you sure you want to permanently delete ${itemName} from the marketplace?`)) {
        let allItems = JSON.parse(localStorage.getItem('dormItems')) || [];
        const user = JSON.parse(localStorage.getItem('dormUser'));
        
        // Find index of item
        const index = allItems.findIndex(i => i.name === itemName && i.sellerMobile === user.mobile);
        if (index > -1) {
            allItems.splice(index, 1);
            localStorage.setItem('dormItems', JSON.stringify(allItems));
            
            // Refresh views
            document.getElementById('navProfileBtn').click(); // Reload profile modal
            renderItems();
            renderTrendingItems();
        }
    }
};

if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', () => {
        profileOverlay.style.opacity = '0';
        setTimeout(() => { profileOverlay.style.display = 'none'; }, 500);
    });
}

// 9. Admin CSV Export Feature
const adminDownloadBtn = document.getElementById('adminDownloadBtn');
if (adminDownloadBtn) {
    adminDownloadBtn.addEventListener('click', () => {
        const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
        const allWaitlists = JSON.parse(localStorage.getItem('dormWaitlist')) || [];
        
        if (allUsers.length === 0) {
            alert('No users found in database to export.');
            return;
        }

        // --- 1. Export Users CSV ---
        const userHeaders = ["Name", "Email", "Mobile", "Wing", "Referral Code", "Bonus Points", "Signup Date"];
        const userCsvRows = [];
        userCsvRows.push(userHeaders.join(','));

        allUsers.forEach(user => {
            const row = [
                `"${user.name}"`,
                `"${user.email}"`,
                `"${user.mobile}"`,
                `"${user.wing || 'Unknown'}"`,
                `"${user.referralCode || 'N/A'}"`,
                `${user.bonusPoints || 0}`,
                `"${new Date().toLocaleDateString()}"`
            ];
            userCsvRows.push(row.join(','));
        });

        const userBlob = new Blob([userCsvRows.join('\n')], { type: 'text/csv' });
        const userUrl = window.URL.createObjectURL(userBlob);
        const userA = document.createElement('a');
        userA.setAttribute('hidden', '');
        userA.setAttribute('href', userUrl);
        userA.setAttribute('download', 'Dorm2Dorm_Users_Database.csv');
        document.body.appendChild(userA);
        userA.click();
        document.body.removeChild(userA);
        window.URL.revokeObjectURL(userUrl);

        // --- 2. Export Waitlist Leads CSV ---
        if (allWaitlists.length > 0) {
            const waitlistHeaders = ["Item Name", "Item Price", "Seller Mobile", "Buyer Name", "Buyer Mobile", "Date Added"];
            const waitlistCsvRows = [];
            waitlistCsvRows.push(waitlistHeaders.join(','));

            allWaitlists.forEach(w => {
                const row = [
                    `"${w.itemName}"`,
                    `"${w.itemPrice}"`,
                    `"${w.sellerMobile}"`,
                    `"${w.buyerName}"`,
                    `"${w.buyerMobile}"`,
                    `"${w.date}"`
                ];
                waitlistCsvRows.push(row.join(','));
            });

            const waitlistBlob = new Blob([waitlistCsvRows.join('\n')], { type: 'text/csv' });
            const waitlistUrl = window.URL.createObjectURL(waitlistBlob);
            const waitlistA = document.createElement('a');
            waitlistA.setAttribute('hidden', '');
            waitlistA.setAttribute('href', waitlistUrl);
            waitlistA.setAttribute('download', 'Dorm2Dorm_Marketplace_Waitlists.csv');
            document.body.appendChild(waitlistA);
            
            // Slight delay so the browser allows a second download
            setTimeout(() => {
                waitlistA.click();
                document.body.removeChild(waitlistA);
                window.URL.revokeObjectURL(waitlistUrl);
            }, 500);
        }
    });
}

// 10. Dynamic Leaderboard Challenge Logic
function renderLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) return; // Only run if on index.html
    
    const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
    const allItems = JSON.parse(localStorage.getItem('dormItems')) || [];
    
    let wingData = {};
    let userContributions = {};

    // First pass: Calculate every user's total contribution
    allUsers.forEach(user => {
        userContributions[user.mobile] = {
            name: user.name,
            avatar: user.avatar || '🦊',
            wing: user.wing,
            points: 50 + (user.bonusPoints || 0)
        };
    });

    // Add item listing points
    allItems.forEach(item => {
        if (userContributions[item.sellerMobile]) {
            userContributions[item.sellerMobile].points += 20;
        }
    });

    // Second pass: Aggregate by wing and find top contributor
    Object.values(userContributions).forEach(user => {
        if (user.wing) {
            if (!wingData[user.wing]) {
                wingData[user.wing] = { points: 0, topUser: null, maxUserPoints: -1 };
            }
            wingData[user.wing].points += user.points;
            
            if (user.points > wingData[user.wing].maxUserPoints) {
                wingData[user.wing].maxUserPoints = user.points;
                wingData[user.wing].topUser = user;
            }
        }
    });
    
    // Convert to sorted array
    const sortedWings = Object.keys(wingData).map(wing => ({
        name: wing,
        points: wingData[wing].points,
        topUser: wingData[wing].topUser
    })).sort((a, b) => b.points - a.points);
    
    if (sortedWings.length === 0) {
        leaderboardContainer.innerHTML = '<p style="text-align: center; color: #aaa;">No points recorded yet. Be the first to sign up!</p>';
        return;
    }
    
    leaderboardContainer.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    const colors = ['rgba(255,215,0,0.15)', 'rgba(192,192,192,0.1)', 'rgba(205,127,50,0.1)', 'rgba(255,255,255,0.02)'];
    const borderColors = ['rgba(255,215,0,0.5)', 'rgba(192,192,192,0.3)', 'rgba(205,127,50,0.3)', 'rgba(255,255,255,0.05)'];
    const textColors = ['gold', 'silver', '#cd7f32', '#aaa'];
    
    sortedWings.slice(0, 4).forEach((wing, index) => {
        const medal = index < 3 ? medals[index] : (index + 1) + '.';
        const bg = index < 3 ? colors[index] : colors[3];
        const border = index < 3 ? borderColors[index] : borderColors[3];
        const color = index < 3 ? textColors[index] : textColors[3];
        const weight = index < 3 ? '800' : '600';
        
        let topUserHtml = '';
        if (wing.topUser) {
            topUserHtml = `<div style="font-size: 0.85rem; color: #aaa; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                👑 MVP: <strong>${wing.topUser.avatar} ${wing.topUser.name}</strong> <span style="color: ${color}; opacity: 0.8;">(${wing.topUser.points} pts)</span>
            </div>`;
        }
        
        leaderboardContainer.innerHTML += `
            <div style="padding: 1rem; background: ${bg}; border: 1px solid ${border}; border-radius: 8px; margin-bottom: 0.8rem; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: ${weight}; font-size: 1.2rem; color: ${index >= 3 ? color : 'white'};">${medal} ${wing.name}</span>
                    <span style="font-weight: bold; color: ${color}; font-size: 1.2rem;">${wing.points.toLocaleString()} pts</span>
                </div>
                ${topUserHtml}
            </div>
        `;
    });
}

// Initialize Leaderboard
renderLeaderboard();

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('dormUser');
        profileOverlay.style.display = 'none';
        
        // Reset auth fields
        mobileNumber.value = '';
        userPassword.value = '';
        userName.value = '';
        userEmail.value = '';
        
        // Show auth overlay again
        authOverlay.style.display = 'flex';
        setTimeout(() => { authOverlay.style.opacity = '1'; }, 10);
    });
}

// 9. Local DB Save Simulation (Since browsers can't write text files securely)
function saveCredentialsToLocalText(userObj) {
    // We store an array of all registered users in localStorage to simulate users.txt
    let allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
    allUsers.push(userObj);
    localStorage.setItem('allDormUsers_DB', JSON.stringify(allUsers));
    console.log(`[SECURE SERVER LOG] User ${userObj.email} saved securely to database folder.`);
}

// Ensure default testing user exists
if (!localStorage.getItem('allDormUsers_DB')) {
    const adminUser = { name: "Himanshu", email: "himanshu931588@gmail.com", mobile: "1234567890", password: "password", avatar: "🦊", wing: "Sadbhawna", referralCode: "HIM9999", bonusPoints: 0 };
    localStorage.setItem('allDormUsers_DB', JSON.stringify([adminUser]));
}

// 11. Dynamic Campus Pulse Footer
function updateFooterPulse() {
    const pulseTicker = document.getElementById('footer-pulse-ticker');
    if (!pulseTicker) return;
    
    const allItems = JSON.parse(localStorage.getItem('dormItems')) || [];
    const allUsers = JSON.parse(localStorage.getItem('allDormUsers_DB')) || [];
    
    if (allItems.length > 0) {
        // Find most recent item wing
        const recentItem = allItems[0];
        const seller = allUsers.find(u => u.mobile === recentItem.sellerMobile);
        const wingName = seller && seller.wing ? seller.wing : 'campus';
        
        pulseTicker.innerHTML = `🔥 Just listed: <strong>${recentItem.name}</strong> from ${wingName}!`;
        
        // Calculate total campus value
        const totalValue = allItems.reduce((sum, item) => sum + parseInt(item.price), 0);
        
        const savingsNodes = document.querySelectorAll('footer span');
        savingsNodes.forEach(node => {
            if(node.innerText.includes('₹')) {
                // Assuming buying used saves ~50% compared to new, savings = totalValue
                node.innerText = `₹${(totalValue).toLocaleString()}`;
            }
        });
    }
}
// 12. Drop & Split Notice Board Logic
const noticeForm = document.getElementById('noticeForm');
if (noticeForm) {
    noticeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('dormUser'));
        if (!currentUser) {
            alert("You must be logged in to post a notice!");
            return;
        }

        const newNotice = {
            type: document.getElementById('noticeType').value,
            wing: document.getElementById('noticeWing').value,
            message: document.getElementById('noticeMessage').value,
            vibe: document.getElementById('noticeVibe') ? document.getElementById('noticeVibe').value : '',
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar || '🦊',
            authorMobile: currentUser.mobile,
            timestamp: Date.now(),
            interestedUsers: []
        };

        const notices = JSON.parse(localStorage.getItem('dormNotices_DB')) || [];
        notices.unshift(newNotice);
        localStorage.setItem('dormNotices_DB', JSON.stringify(notices));

        document.getElementById('postNoticeModal').style.display = 'none';
        noticeForm.reset();
        renderNotices();
    });
}

function renderNotices() {
    const deliveryBoard = document.getElementById('deliveryBoard');
    const roommateBoard = document.getElementById('roommateBoard');
    
    if (!deliveryBoard || !roommateBoard) return;

    const notices = JSON.parse(localStorage.getItem('dormNotices_DB')) || [];
    
    const deliveryNotices = notices.filter(n => n.type === 'Delivery');
    const roommateNotices = notices.filter(n => n.type === 'Roommate');

    // Render Delivery
    if (deliveryNotices.length === 0) {
        deliveryBoard.innerHTML = '<p style="color: #666; font-style: italic;">No delivery splits posted yet.</p>';
    } else {
        deliveryBoard.innerHTML = '';
        deliveryNotices.forEach(n => {
            const dateStr = new Date(n.timestamp).toLocaleDateString();
            let interestedHTML = '';
            if (n.interestedUsers && n.interestedUsers.length > 0) {
                interestedHTML = `<div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,107,107,0.3); font-size: 0.85rem; color: #ccc;">
                    <span style="color: var(--accent); font-weight: bold;">Interested to Split:</span> 
                    ${n.interestedUsers.map(u => `<span>${u.avatar} ${u.name} (${u.mobile})</span>`).join(', ')}
                </div>`;
            }

            deliveryBoard.innerHTML += `
                <div class="notice-card">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--accent); font-weight: bold;"><i class="ri-map-pin-line"></i> ${n.wing}</span>
                        <span style="color: #666; font-size: 0.8rem;">${dateStr}</span>
                    </div>
                    <p style="font-size: 1.1rem; line-height: 1.5; margin-bottom: 1rem;">"${n.message}"</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.2rem;">${n.authorAvatar}</span>
                            <span style="color: #aaa; font-size: 0.9rem;">${n.authorName}</span>
                        </div>
                        <button onclick="joinNotice(${n.timestamp})" class="btn-primary hover-target" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: transparent; border: 1px solid var(--accent); color: var(--accent);">Split It</button>
                    </div>
                    ${interestedHTML}
                </div>
            `;
        });
    }

    // Render Roommates
    if (roommateNotices.length === 0) {
        roommateBoard.innerHTML = '<p style="color: #666; font-style: italic;">No roommate requests posted yet.</p>';
    } else {
        roommateBoard.innerHTML = '';
        roommateNotices.forEach(n => {
            const dateStr = new Date(n.timestamp).toLocaleDateString();
            const vibeBadge = n.vibe ? `<div style="display: inline-block; background: rgba(74, 222, 128, 0.1); color: #4ade80; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; margin-top: 0.5rem; border: 1px solid rgba(74, 222, 128, 0.3);"><i class="ri-radar-line"></i> Vibe: ${n.vibe}</div>` : '';
            
            let interestedHTML = '';
            if (n.interestedUsers && n.interestedUsers.length > 0) {
                interestedHTML = `<div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed rgba(74, 222, 128, 0.3); font-size: 0.85rem; color: #ccc;">
                    <span style="color: #4ade80; font-weight: bold;">Interested Roommates:</span> 
                    ${n.interestedUsers.map(u => `<span>${u.avatar} ${u.name} (${u.mobile})</span>`).join(', ')}
                </div>`;
            }

            roommateBoard.innerHTML += `
                <div class="notice-card roommate-card">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #4ade80; font-weight: bold;"><i class="ri-building-line"></i> ${n.wing}</span>
                        <span style="color: #666; font-size: 0.8rem;">${dateStr}</span>
                    </div>
                    <p style="font-size: 1.1rem; line-height: 1.5; margin-bottom: 0.5rem;">"${n.message}"</p>
                    ${vibeBadge}
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; margin-top: 1rem;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.2rem;">${n.authorAvatar}</span>
                            <span style="color: #aaa; font-size: 0.9rem;">${n.authorName}</span>
                        </div>
                        <button onclick="joinNotice(${n.timestamp})" class="btn-primary hover-target" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: transparent; border: 1px solid #4ade80; color: #4ade80;">Connect</button>
                    </div>
                    ${interestedHTML}
                </div>
            `;
        });
    }
}

window.joinNotice = function(timestamp) {
    const currentUser = JSON.parse(localStorage.getItem('dormUser'));
    if (!currentUser) {
        alert("You must be logged in to connect with this notice!");
        return;
    }

    let notices = JSON.parse(localStorage.getItem('dormNotices_DB')) || [];
    const noticeIndex = notices.findIndex(n => n.timestamp === timestamp);
    
    if (noticeIndex > -1) {
        // Prevent author from joining their own notice
        if (notices[noticeIndex].authorMobile === currentUser.mobile) {
            alert("You cannot join your own notice!");
            return;
        }

        // Initialize array if it doesn't exist
        if (!notices[noticeIndex].interestedUsers) {
            notices[noticeIndex].interestedUsers = [];
        }

        // Check if already joined
        const alreadyJoined = notices[noticeIndex].interestedUsers.some(u => u.mobile === currentUser.mobile);
        if (alreadyJoined) {
            alert("You have already joined this notice!");
            return;
        }

        // Add user
        notices[noticeIndex].interestedUsers.push({
            name: currentUser.name,
            mobile: currentUser.mobile,
            avatar: currentUser.avatar || '🦊'
        });

        localStorage.setItem('dormNotices_DB', JSON.stringify(notices));
        renderNotices();
        
        alert(`Successfully connected! ${notices[noticeIndex].authorName} can now see your contact details.`);
    }
}

// Call initially
renderNotices();

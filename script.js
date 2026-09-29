// ===== MOBILE MENU ===== 
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.flexDirection = 'column';
        navMenu.style.gap = '1rem';
        navMenu.style.padding = '1rem 20px';
        navMenu.style.backgroundColor = 'white';
        navMenu.style.borderBottom = '1px solid #e0e0e0';
        navMenu.style.zIndex = '999';
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.style.display = 'none';
        });
    });
}

// ===== SAMPLE TECHNICIAN DATA ===== 
const techniciansDatabase = [
    {
        id: 1,
        name: 'Mike Johnson',
        specialty: 'Electronics & Phones',
        rating: 4.8,
        reviews: 156,
        rate: '$45-80',
        distance: '2.3 miles',
        city: 'new york',
        zipcode: '10001'
    },
    {
        id: 2,
        name: 'Sarah Chen',
        specialty: 'Appliances',
        rating: 4.9,
        reviews: 198,
        rate: '$60-120',
        distance: '1.8 miles',
        city: 'new york',
        zipcode: '10001'
    },
    {
        id: 3,
        name: 'David Martinez',
        specialty: 'Bicycles',
        rating: 4.7,
        reviews: 87,
        rate: '$30-75',
        distance: '3.1 miles',
        city: 'new york',
        zipcode: '10001'
    },
    {
        id: 4,
        name: 'Emily Rodriguez',
        specialty: 'Furniture',
        rating: 4.6,
        reviews: 124,
        rate: '$50-150',
        distance: '2.8 miles',
        city: 'los angeles',
        zipcode: '90001'
    },
    {
        id: 5,
        name: 'James Wilson',
        specialty: 'Electronics & Phones',
        rating: 4.9,
        reviews: 302,
        rate: '$40-85',
        distance: '1.2 miles',
        city: 'los angeles',
        zipcode: '90001'
    },
    {
        id: 6,
        name: 'Lisa Park',
        specialty: 'Appliances',
        rating: 4.8,
        reviews: 215,
        rate: '$55-130',
        distance: '2.5 miles',
        city: 'los angeles',
        zipcode: '90001'
    },
    {
        id: 7,
        name: 'Robert Thompson',
        specialty: 'Bicycles',
        rating: 4.7,
        reviews: 92,
        rate: '$35-80',
        distance: '1.9 miles',
        city: 'chicago',
        zipcode: '60601'
    },
    {
        id: 8,
        name: 'Jessica Anderson',
        specialty: 'Furniture',
        rating: 4.8,
        reviews: 178,
        rate: '$45-140',
        distance: '2.2 miles',
        city: 'chicago',
        zipcode: '60601'
    }
];

// ===== SEARCH TECHNICIANS FUNCTION ===== 
function searchTechnicians() {
    const location = document.getElementById('locationInput').value.toLowerCase().trim();
    const category = document.getElementById('categorySelect').value;
    const resultsContainer = document.getElementById('technicianResults');

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Validation
    if (!location || !category) {
        resultsContainer.innerHTML = '<div class="no-results" style="grid-column: 1/-1;">Please enter a location and select a category to search.</div>';
        return;
    }

    // Filter technicians
    const categoryMap = {
        'electronics': 'Electronics & Phones',
        'appliances': 'Appliances',
        'furniture': 'Furniture',
        'bicycles': 'Bicycles'
    };

    const filtered = techniciansDatabase.filter(tech => {
        const matchCity = tech.city.includes(location) || tech.zipcode.includes(location);
        const matchSpecialty = tech.specialty === categoryMap[category];
        return matchCity && matchSpecialty;
    });

    // Display results
    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results" style="grid-column: 1/-1;">No technicians found in your area. Try a different location or category.</div>';
        return;
    }

    filtered.forEach(tech => {
        const stars = '⭐'.repeat(Math.floor(tech.rating));
        const card = document.createElement('div');
        card.className = 'technician-card';
        card.innerHTML = `
            <div class="tech-name">${tech.name}</div>
            <div class="tech-specialty">${tech.specialty}</div>
            <div class="tech-rating">${stars} <span>${tech.rating} (${tech.reviews} reviews)</span></div>
            <div class="tech-info"><strong>Rate:</strong> ${tech.rate}</div>
            <div class="tech-distance"><strong>Distance:</strong> ${tech.distance}</div>
            <button class="btn-contact" onclick="contactTechnician('${tech.name}')">View Profile & Book</button>
        `;
        resultsContainer.appendChild(card);
    });
}

// ===== CONTACT TECHNICIAN ===== 
function contactTechnician(technicianName) {
    alert(`Great! You're about to book ${technicianName}.\n\nIn the full platform, you would:\n1. Schedule a pickup time\n2. Describe your item issue\n3. Get a confirmed quote\n4. Track the repair status\n\nThis is currently a demo. The booking system would connect with real technicians.`);
}

// ===== ALLOW ENTER KEY TO SEARCH ===== 
document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchTechnicians();
    }
});

document.getElementById('categorySelect')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchTechnicians();
    }
});

// ===== SMOOTH SCROLL FOR MOBILE ===== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            const element = document.querySelector(href);
            if (element) {
                e.preventDefault();
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== PAGE LOAD ANIMATION ===== 
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.feature-card, .category-card, .testimonial-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
});

// ===== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ===== 
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card, .category-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// ===== FORM VALIDATION ===== 
function validateSearch() {
    const location = document.getElementById('locationInput').value.trim();
    const category = document.getElementById('categorySelect').value;

    if (!location) {
        alert('Please enter a location (city name or zipcode)');
        return false;
    }

    if (!category) {
        alert('Please select a repair category');
        return false;
    }

    return true;
}

// ===== DEMO MESSAGE ON PAGE LOAD ===== 
window.addEventListener('load', () => {
    console.log('RepairHub Frontend loaded successfully!');
    console.log('Try searching technicians with location "new york" or "los angeles" or "chicago"');
});

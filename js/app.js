/**
 * ShoreSquad - Interactive Beach Cleanup Map App
 * Gen-Z Eco-Friendly Movement for Singapore
 * 
 * Features:
 * - Interactive Leaflet map with cleanup location markers
 * - Real-time impact statistics with data persistence
 * - User streak tracking with LocalStorage
 * - Mobile-first responsive design
 * - Accessibility (WCAG 2.1 AA) compliance
 * - Progressive enhancement with Service Worker ready
 */

// ============================================
// APP STATE & CONSTANTS
// ============================================

const APP_STATE = {
    user: {
        name: localStorage.getItem('userName') || null,
        email: localStorage.getItem('userEmail') || null,
        streak: parseInt(localStorage.getItem('userStreak') || '0'),
        lastCleanup: localStorage.getItem('lastCleanup') || null,
        area: localStorage.getItem('preferredArea') || null,
    },
    stats: {
        cleanups: parseInt(localStorage.getItem('totalCleanups') || '0'),
        volunteers: parseInt(localStorage.getItem('totalVolunteers') || '0'),
        trash: parseInt(localStorage.getItem('totalTrash') || '0'),
    },
    map: null,
    markers: [],
};

// Mock cleanup events for the map
const CLEANUP_EVENTS = [
    {
        id: 1,
        name: 'East Coast Beach Cleanup',
        location: [1.3043, 103.8916],
        date: '2025-12-06',
        time: '09:00',
        volunteers: 24,
        status: 'active',
        description: 'Join us for a morning cleanup session at East Coast Park.',
        trash: 15,
    },
    {
        id: 2,
        name: 'Sentosa Island Restoration',
        location: [1.2494, 103.8303],
        date: '2025-12-07',
        time: '08:00',
        volunteers: 18,
        status: 'upcoming',
        description: 'Help restore Sentosa\'s beautiful shores.',
        trash: 0,
    },
    {
        id: 3,
        name: 'Changi Beach Deep Dive',
        location: [1.4043, 103.9747],
        date: '2025-12-06',
        time: '15:00',
        volunteers: 12,
        status: 'active',
        description: 'Afternoon cleanup focusing on marine debris.',
        trash: 8,
    },
    {
        id: 4,
        name: 'Lazarus Island Sweep',
        location: [1.2101, 103.8283],
        date: '2025-12-08',
        time: '10:00',
        volunteers: 9,
        status: 'upcoming',
        description: 'Island-wide cleanup initiative.',
        trash: 0,
    },
    {
        id: 5,
        name: 'West Coast Pier Cleanup',
        location: [1.3521, 103.7618],
        date: '2025-12-06',
        time: '16:00',
        volunteers: 7,
        status: 'active',
        description: 'Focused cleanup around fishing areas.',
        trash: 5,
    },
];

// ============================================
// MAP INITIALIZATION
// ============================================

function initMap() {
    // Google Maps iframe is already embedded in HTML
    // This function handles event panel interactions for cleanup events
    
    // Setup event panel close button
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.addEventListener('click', (e) => {
            // Allow legend clicks without closing panel
            if (!e.target.closest('.map-legend')) {
                // Can add click handlers for alternative map interactions
            }
        });
    }

    // Display available cleanup events in a list format
    displayCleanupEventsList();
}

/**
 * Display cleanup events in a grid for users to browse and select
 */
function displayCleanupEventsList() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    eventsGrid.innerHTML = ''; // Clear existing events

    CLEANUP_EVENTS.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card-grid';
        eventCard.dataset.eventId = event.id;
        
        const statusBadge = event.status === 'active' ? 'active' : event.status === 'upcoming' ? 'upcoming' : 'completed';
        const statusEmoji = event.status === 'active' ? '🔴' : event.status === 'upcoming' ? '⏰' : '✅';
        
        eventCard.innerHTML = `
            <div class="event-status-badge ${statusBadge}">${statusEmoji} ${event.status}</div>
            <div class="event-card-title">${event.name}</div>
            <div class="event-card-details">
                <div class="event-card-detail">
                    <span>📅</span>
                    <span><strong>${event.date}</strong> at ${event.time}</span>
                </div>
                <div class="event-card-detail">
                    <span>📍</span>
                    <span>${event.location[0].toFixed(4)}°, ${event.location[1].toFixed(4)}°</span>
                </div>
                <div class="event-card-detail">
                    <span>📝</span>
                    <span>${event.description}</span>
                </div>
            </div>
            <div class="event-card-stats">
                <div class="event-card-stat">
                    <div class="event-card-stat-number">${event.volunteers}</div>
                    <div class="event-card-stat-label">Volunteers</div>
                </div>
                <div class="event-card-stat">
                    <div class="event-card-stat-number">${event.trash}</div>
                    <div class="event-card-stat-label">kg Trash</div>
                </div>
            </div>
        `;
        
        // Add click handler to show map and details
        eventCard.addEventListener('click', () => {
            // Update all cards - remove active state
            document.querySelectorAll('.event-card-grid').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active state to clicked card
            eventCard.classList.add('active');
            
            // Show event details
            showEventDetails(event);
            
            // Update map to show this location
            updateMapLocation(event);
            
            // Scroll to map
            setTimeout(() => {
                document.querySelector('.map-display-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        });
        
        eventsGrid.appendChild(eventCard);
    });

    // Set first event as default
    if (CLEANUP_EVENTS.length > 0) {
        const firstCard = eventsGrid.querySelector('.event-card-grid');
        if (firstCard) {
            firstCard.classList.add('active');
            updateMapLocation(CLEANUP_EVENTS[0]);
        }
    }
}

/**
 * Update the embedded Google Map to show a specific event location
 * Uses Google Maps embed with coordinates
 */
function updateMapLocation(event) {
    const mapIframe = document.getElementById('map');
    if (!mapIframe) return;

    // Create Google Maps embed URL with the event coordinates
    const lat = event.location[0];
    const lng = event.location[1];
    
    // Google Maps embed URL - using search parameter with location name for proper embed
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    
    mapIframe.src = mapUrl;
}

function showEventDetails(event) {
    const panel = document.getElementById('event-panel');
    const details = document.getElementById('event-details');

    details.innerHTML = `
        <h3>${event.name}</h3>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Volunteers:</strong> ${event.volunteers} joined</p>
        <p><strong>Status:</strong> <span style="color: ${event.status === 'active' ? '#34D399' : '#2DD4BF'}; font-weight: bold;">${event.status.toUpperCase()}</span></p>
        <p><strong>Description:</strong> ${event.description}</p>
        ${event.trash > 0 ? `<p><strong>Trash Collected:</strong> ${event.trash} kg</p>` : ''}
    `;

    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-SG', options);
}

// ============================================
// STATISTICS & DATA PERSISTENCE
// ============================================

function updateStatistics() {
    // Calculate totals from all active cleanup events
    const totalCleanups = CLEANUP_EVENTS.filter(e => e.status === 'active').length;
    const totalVolunteers = CLEANUP_EVENTS.reduce((sum, e) => sum + e.volunteers, 0);
    const totalTrash = CLEANUP_EVENTS.reduce((sum, e) => sum + e.trash, 0);
    
    document.getElementById('stat-cleanups').textContent = totalCleanups;
    document.getElementById('stat-volunteers').textContent = totalVolunteers;
    document.getElementById('stat-trash').textContent = totalTrash;
    document.getElementById('stat-streak').textContent = APP_STATE.user.streak;
}

function incrementStats(cleanupId) {
    const event = CLEANUP_EVENTS.find(e => e.id === cleanupId);
    if (!event) return;

    APP_STATE.stats.cleanups += 1;
    APP_STATE.stats.volunteers += 1;
    APP_STATE.stats.trash += event.trash;

    // Update user streak
    const today = new Date().toISOString().split('T')[0];
    const lastCleanup = APP_STATE.user.lastCleanup;

    if (lastCleanup === today) {
        // Already cleaned today
        showToast('Already joined today! Come back tomorrow.', 'info');
    } else if (lastCleanup === getYesterdayDate()) {
        // Streak continues
        APP_STATE.user.streak += 1;
        showToast(`🔥 Streak extended to ${APP_STATE.user.streak} days!`, 'success');
    } else {
        // Restart streak
        APP_STATE.user.streak = 1;
        showToast('🌊 New streak started! Keep it up!', 'success');
    }

    APP_STATE.user.lastCleanup = today;

    // Persist to localStorage
    localStorage.setItem('totalCleanups', APP_STATE.stats.cleanups);
    localStorage.setItem('totalVolunteers', APP_STATE.stats.volunteers);
    localStorage.setItem('totalTrash', APP_STATE.stats.trash);
    localStorage.setItem('userStreak', APP_STATE.user.streak);
    localStorage.setItem('lastCleanup', APP_STATE.user.lastCleanup);

    updateStatistics();
    updateStreakDisplay();
    animateStatUpdate();
}

function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

function updateStreakDisplay() {
    const streakDiv = document.getElementById('user-streak');

    if (APP_STATE.user.name) {
        const streakText = APP_STATE.user.streak > 0
            ? `<p><strong>${APP_STATE.user.name}</strong>, you're on a <strong>${APP_STATE.user.streak} day</strong> 🔥 cleaning streak!</p>`
            : `<p>Welcome back, <strong>${APP_STATE.user.name}</strong>! Start your streak today.</p>`;
        streakDiv.innerHTML = streakText;
    }
}

function animateStatUpdate() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'pulse 0.6s ease-out';
        }, 10);
    });
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

// ============================================
// FORM HANDLING
// ============================================

function setupFormHandlers() {
    const signupForm = document.getElementById('signup-form');
    const joinEventBtn = document.getElementById('join-event-btn');
    const panelClose = document.getElementById('panel-close');
    const heroCta = document.getElementById('hero-cta');

    signupForm.addEventListener('submit', handleSignup);
    joinEventBtn.addEventListener('click', handleJoinEvent);
    panelClose.addEventListener('click', () => {
        document.getElementById('event-panel').hidden = true;
    });
    heroCta.addEventListener('click', () => {
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    });
}

function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const area = document.getElementById('area').value;

    // Validate
    if (!name || !email || !area) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Save to app state
    APP_STATE.user.name = name;
    APP_STATE.user.email = email;
    APP_STATE.user.area = area;

    // Persist
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('preferredArea', area);

    // Reset form
    e.target.reset();

    // Update UI
    updateStreakDisplay();

    showToast(`Welcome to ShoreSquad, ${name}! 🌊`, 'success');
}

function handleJoinEvent() {
    if (!APP_STATE.user.name) {
        showToast('Please sign up first to join an event', 'error');
        document.getElementById('join-section').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Find the currently displayed event
    const eventTitle = document.querySelector('.event-panel h3')?.textContent;
    const event = CLEANUP_EVENTS.find(e => e.name === eventTitle);

    if (event) {
        incrementStats(event.id);
        document.getElementById('event-panel').hidden = true;
    }
}

// ============================================
// NOTIFICATIONS (TOAST SYSTEM)
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add slideOutRight animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOutRight {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(slideOutStyle);

// ============================================
// MOBILE NAVIGATION
// ============================================

function setupMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when link clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// PERFORMANCE: LAZY LOADING & DEBOUNCING
// ============================================

// Intersection Observer for lazy loading
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px',
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            if (element.dataset.src) {
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
                observer.unobserve(element);
            }
        }
    });
}, observerOptions);

// Observe all images with data-src attribute
document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
});

// Debounce helper for resize events
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Handle responsive map resizing
window.addEventListener('resize', debounce(() => {
    if (APP_STATE.map) {
        APP_STATE.map.invalidateSize();
    }
}, 250));

// ============================================
// SERVICE WORKER REGISTRATION (Progressive Enhancement)
// ============================================

if ('serviceWorker' in navigator) {
    // Commented out for now - can be implemented for offline support
    // navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed', err));
}

// ============================================
// GEOLOCATION API
// ============================================

function enableLocationFeatures() {
    if ('geolocation' in navigator) {
        const button = document.createElement('button');
        button.textContent = '📍 Use My Location';
        button.className = 'btn btn-secondary';
        button.style.marginTop = '1rem';
        button.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    APP_STATE.map.setView([latitude, longitude], 13);
                    showToast('Found your location! 📍', 'success');
                },
                (error) => {
                    showToast('Location access denied', 'error');
                }
            );
        });

        // Find a suitable place to add the button (optional enhancement)
        // For now, it's available in the map legend area
    }
}

// ============================================
// WEATHER API INTEGRATION (NEA 24-Hour Forecast)
// ============================================

/**
 * Fetch real-time weather data from Singapore's NEA API
 * API: https://api.data.gov.sg/v1/environment/24-hour-weather-forecast
 * Fallback to mock data if API is unavailable
 */
async function fetchWeatherForecast() {
    const weatherContainer = document.getElementById('weather-section');
    if (!weatherContainer) return;

    try {
        const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayWeatherForecast(data);
    } catch (error) {
        console.error('Weather API Error:', error);
        console.log('Using fallback weather data...');
        
        // Use mock data as fallback
        displayWeatherForecast(getMockWeatherData());
    }
}

/**
 * Mock weather data for development/fallback
 */
function getMockWeatherData() {
    return {
        items: [
            {
                valid_period: {
                    start: new Date().toISOString(),
                    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                },
                forecasts: [
                    { name: 'Pasir Ris', forecast: 'Partly Cloudy' },
                    { name: 'East Coast', forecast: 'Partly Cloudy' },
                    { name: 'Sentosa', forecast: 'Sunny' },
                    { name: 'Changi Beach', forecast: 'Fair' },
                    { name: 'West Coast', forecast: 'Cloudy' }
                ],
                temperature: [{ low: 23, high: 31 }],
                relative_humidity: [{ low: 60, high: 85 }]
            }
        ]
    };
}

/**
 * Parse and display weather forecast data
 * Filters for beach-relevant locations: Pasir Ris, East Coast, Sentosa
 */
function displayWeatherForecast(data) {
    const forecastContainer = document.getElementById('weather-forecast');
    if (!forecastContainer) return;
    
    // Clear loading message
    forecastContainer.innerHTML = '';
    
    if (!data || !data.items || data.items.length === 0) {
        forecastContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">Weather data unavailable. Please try again later.</p>';
        return;
    }

    try {
        // Extract the 24-hour forecast
        const forecastItem = data.items[0];
        const { valid_period, forecasts, relative_humidity, temperature } = forecastItem;

        // Beach locations to highlight
        const beachLocations = ['Pasir Ris', 'East Coast', 'Sentosa', 'Changi', 'West Coast'];

        // Filter forecasts for beach areas
        const beachForecasts = forecasts && forecasts.length > 0 
            ? forecasts.filter(forecast =>
                beachLocations.some(beach => forecast.name && forecast.name.includes(beach))
            )
            : [];

        // Get temperature data
        const tempData = temperature || [];

        // Build forecast HTML
        let forecastHTML = `
            <div class="weather-header">
                <h3>⛅ Singapore Beach Weather Forecast</h3>
                <p class="weather-period">${formatWeatherPeriod(valid_period)}</p>
            </div>
            
            <div class="weather-grid">
        `;

        // Add forecast cards for each beach
        if (beachForecasts.length > 0) {
            beachForecasts.forEach((forecast) => {
                const iconEmoji = getWeatherEmoji(forecast.forecast || '');
                
                forecastHTML += `
                    <div class="weather-card">
                        <div class="weather-location">${forecast.name || 'Unknown'}</div>
                        <div class="weather-icon">${iconEmoji}</div>
                        <div class="weather-condition">${forecast.forecast || 'N/A'}</div>
                    </div>
                `;
            });
        } else {
            // Fallback: show all forecasts if no beach matches
            if (forecasts && forecasts.length > 0) {
                forecasts.slice(0, 5).forEach((forecast) => {
                    const iconEmoji = getWeatherEmoji(forecast.forecast || '');
                    forecastHTML += `
                        <div class="weather-card">
                            <div class="weather-location">${forecast.name || 'Unknown'}</div>
                            <div class="weather-icon">${iconEmoji}</div>
                            <div class="weather-condition">${forecast.forecast || 'N/A'}</div>
                        </div>
                    `;
                });
            }
        }

        // Add temperature and humidity info
        if (tempData.length > 0 && tempData[0].low && tempData[0].high) {
            const { low, high } = tempData[0];
            forecastHTML += `
                <div class="weather-card weather-metrics">
                    <div class="metric">
                        <strong>🌡️ High:</strong> ${high}°C
                    </div>
                    <div class="metric">
                        <strong>❄️ Low:</strong> ${low}°C
                    </div>
                </div>
            `;
        }

        if (relative_humidity && relative_humidity.length > 0 && relative_humidity[0].low && relative_humidity[0].high) {
            const { low: rhLow, high: rhHigh } = relative_humidity[0];
            forecastHTML += `
                <div class="weather-card weather-metrics">
                    <div class="metric">
                        <strong>💧 Humidity:</strong> ${rhLow}% - ${rhHigh}%
                    </div>
                </div>
            `;
        }

        forecastHTML += `
            </div>
            <p class="weather-source">Data from National Environment Agency (NEA)</p>
        `;

        forecastContainer.innerHTML = forecastHTML;
    } catch (err) {
        console.error('Error displaying weather forecast:', err);
        forecastContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">Error loading weather forecast.</p>';
    }
}

/**
 * Convert forecast text to emoji representation
 */
function getWeatherEmoji(forecast) {
    const text = forecast.toLowerCase();
    
    if (text.includes('rain')) return '🌧️';
    if (text.includes('thundery')) return '⛈️';
    if (text.includes('showers')) return '🌦️';
    if (text.includes('partly cloudy')) return '⛅';
    if (text.includes('cloudy')) return '☁️';
    if (text.includes('fair') || text.includes('sunny')) return '☀️';
    if (text.includes('windy')) return '💨';
    
    return '🌤️'; // Default
}

/**
 * Format the valid period from NEA API (ISO 8601 format)
 */
function formatWeatherPeriod(validPeriod) {
    if (!validPeriod) return 'Current Forecast';
    
    const start = new Date(validPeriod.start);
    const end = new Date(validPeriod.end);
    
    const startStr = start.toLocaleDateString('en-SG', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    const endStr = end.toLocaleTimeString('en-SG', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    return `${startStr} to ${endStr}`;
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

function setupAccessibility() {
    // Announce dynamic updates to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    document.body.appendChild(announcer);

    window.announceToScreenReader = (message) => {
        announcer.textContent = message;
    };

    // Keyboard navigation for stats
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                card.click();
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Initialize map
    initMap();

    // Setup all handlers
    setupFormHandlers();
    setupMobileNav();
    setupAccessibility();
    enableLocationFeatures();

    // Update UI with stored data
    updateStatistics();
    updateStreakDisplay();

    // Fetch weather forecast from NEA API
    fetchWeatherForecast();

    // Log initialization
    console.log('ShoreSquad initialized successfully');
    console.log('App State:', APP_STATE);
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// ============================================
// EXPORT FOR TESTING (if using modules)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_STATE,
        CLEANUP_EVENTS,
        incrementStats,
        showToast,
        formatDate,
    };
}

/**
 * ================================================================================
 * AESTHETIC STOPWATCH - PREMIUM TIMER APPLICATION
 * ================================================================================
 * 
 * Created by: Chinmay
 * Description: Beautiful glassmorphic stopwatch with modern UI/UX design
 * Features: Timer functionality, lap tracking, custom themes, modal management
 * 
 * File Structure:
 * - PWA & Service Worker Setup
 * - Performance Optimizations  
 * - Modal Management System
 * - UI Component Managers (Share, Developer, Settings)
 * - Core Stopwatch Functionality
 * - Performance Monitoring
 * - Initialization & Event Binding
 * ================================================================================
 */

// ================================================================================================
// PWA SERVICE WORKER REGISTRATION
// ================================================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/assets/js/sw.js');
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New content available, refresh for updates');
                        // Could show update notification here
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    });
}

// ================================================================================================
// PERFORMANCE OPTIMIZATIONS & UTILITIES
// ================================================================================================
// Lazy load images and optimize rendering
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, observerOptions);

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ================================================================================================
// CENTRALIZED MODAL MANAGEMENT SYSTEM
// ================================================================================================
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.modalHandlers = new Map();
        this.lastCloseTime = 0; // Track when last modal was closed
        this.init();
    }

    init() {
        // Single global ESC handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });

        // Prevent body scroll when modals are open
        this.setupScrollLock();
    }

    registerModal(modalId, openHandler, closeHandler) {
        this.modalHandlers.set(modalId, { open: openHandler, close: closeHandler });
    }

    openModal(modalId) {
        // Prevent rapid open/close cycles that might cause conflicts
        const now = Date.now();
        if (now - this.lastCloseTime < 100) {
            return; // Ignore if too soon after closing another modal
        }
        
        // Close other modals first (except settings)
        if (modalId !== 'settingsPanel') {
            this.closeAllModals(['settingsPanel']);
        }
        
        this.activeModals.add(modalId);
        const handler = this.modalHandlers.get(modalId);
        if (handler && handler.open) {
            handler.open();
        }
        
        this.updateBodyScrollLock();
    }

    closeModal(modalId) {
        this.activeModals.delete(modalId);
        const handler = this.modalHandlers.get(modalId);
        if (handler && handler.close) {
            handler.close();
        }
        
        // Track close time to prevent rapid reopening
        this.lastCloseTime = Date.now();
        
        this.updateBodyScrollLock();
    }

    closeAllModals(except = []) {
        const toClose = [...this.activeModals].filter(id => !except.includes(id));
        toClose.forEach(modalId => this.closeModal(modalId));
    }

    handleEscapeKey(event) {
        // Handle modals in priority order
        const modalPriority = ['shareModal', 'developerModal', 'settingsPanel'];
        
        for (const modalId of modalPriority) {
            if (this.activeModals.has(modalId)) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation(); // Prevent any other handlers from running
                this.closeModal(modalId);
                break; // Only close the highest priority modal
            }
        }
    }

    setupScrollLock() {
        this.originalOverflow = document.body.style.overflow;
        this.scrollbarWidth = this.getScrollbarWidth();
    }

    getScrollbarWidth() {
        // Create a temporary div to measure scrollbar width
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    updateBodyScrollLock() {
        if (this.activeModals.size > 0) {
            // Prevent layout shift by adding padding equal to scrollbar width
            const hasScrollbar = document.documentElement.scrollHeight > window.innerHeight;
            if (hasScrollbar) {
                document.body.style.paddingRight = `${this.scrollbarWidth}px`;
            }
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = this.originalOverflow || '';
            document.body.style.paddingRight = '';
        }
    }

    isModalOpen(modalId) {
        return this.activeModals.has(modalId);
    }

    hasActiveModal() {
        return this.activeModals.size > 0;
    }

    getActiveModals() {
        return [...this.activeModals];
    }
}

// Create global modal manager instance
const modalManager = new ModalManager();

// ================================================================================================
// UI COMPONENT MANAGERS - BACKGROUNDS & FULLSCREEN
// ================================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- BACKGROUND PRESETS & UPLOAD ---
    const presetBtns = document.querySelectorAll('.preset-btn');
    const backgroundUpload = document.getElementById('backgroundUpload');
    // Preset backgrounds (user can fill URLs in HTML)
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            if (url) {
                const heroBg = document.getElementById('heroBg');
                if (heroBg) heroBg.style.backgroundImage = `url(${url})`;
                localStorage.setItem('customBackgroundUrl', url);
            }
        });
    });
    // Custom upload
    if (backgroundUpload) {
        backgroundUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const heroBg = document.getElementById('heroBg');
                if (heroBg) heroBg.style.backgroundImage = `url(${ev.target.result})`;
                localStorage.setItem('customBackgroundUrl', ev.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
    // On load, restore custom background if set
    const savedBg = localStorage.getItem('customBackgroundUrl');
    if (savedBg) {
    const heroBg = document.getElementById('heroBg');
    if (heroBg) heroBg.style.backgroundImage = `url(${savedBg})`;
    }
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!fullscreenBtn) return;
    let isFullscreen = false;
    const maximizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v3a1 1 0 0 1-1 1H3"/><path d="M21 8h-3a1 1 0 0 1-1-1V3"/><path d="M16 21v-3a1 1 0 0 1 1-1h3"/><path d="M3 16h3a1 1 0 0 1 1 1v3"/></svg>`;
    const minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 21v-3a1 1 0 0 0-1-1H3"/><path d="M21 16h-3a1 1 0 0 0-1 1v3"/><path d="M16 3v3a1 1 0 0 0 1 1h3"/><path d="M3 8h3a1 1 0 0 0 1-1V3"/></svg>`;
    function setIcon() {
        fullscreenBtn.querySelector('.fab-icon').innerHTML = isFullscreen ? minimizeIcon : maximizeIcon;
    }
    setIcon();
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            isFullscreen = true;
        } else {
            document.exitFullscreen();
            isFullscreen = false;
        }
        setTimeout(setIcon, 200);
    });
    document.addEventListener('fullscreenchange', () => {
        isFullscreen = !!document.fullscreenElement;
        setIcon();
    });
});
// ================================================================================================
// SHARE MODAL MANAGEMENT
// ================================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Share Modal functionality
    const shareInfoBtn = document.getElementById('shareBtn');
    const shareModal = document.getElementById('shareModal');
    const shareOverlay = document.getElementById('shareOverlay');
    const closeShareBtn = document.getElementById('closeShareBtn');

    function openShareModal() {
        modalManager.openModal('shareModal');
    }

    function closeShareModal() {
        modalManager.closeModal('shareModal');
    }

    // Register share modal with manager
    modalManager.registerModal('shareModal', () => {
        shareModal.style.display = 'flex';
        shareOverlay.style.display = 'block';
        setTimeout(() => {
            shareModal.classList.add('active');
            shareOverlay.classList.add('active');
        }, 10);
        // Hide FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.add('hidden');
    }, () => {
        shareModal.classList.remove('active');
        shareOverlay.classList.remove('active');
        setTimeout(() => {
            shareModal.style.display = 'none';
            shareOverlay.style.display = 'none';
        }, 400);
        // Show FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.remove('hidden');
    });

    if (shareInfoBtn) shareInfoBtn.addEventListener('click', openShareModal);
    if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
    if (shareOverlay) shareOverlay.addEventListener('click', closeShareModal);

    // Copy link functionality
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    if (copyShareLinkBtn) {
        copyShareLinkBtn.addEventListener('click', () => {
            const url = 'https://stopwatch.chinmayjha.tech/';
            navigator.clipboard.writeText(url).then(() => {
                const btnText = copyShareLinkBtn.querySelector('.btn-text') || copyShareLinkBtn;
                const originalText = btnText.textContent;
                btnText.textContent = 'Copied!';
                setTimeout(() => {
                    btnText.textContent = originalText;
                }, 1200);
            }).catch(() => {
                // Fallback for browsers without clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const btnText = copyShareLinkBtn.querySelector('.btn-text') || copyShareLinkBtn;
                const originalText = btnText.textContent;
                btnText.textContent = 'Copied!';
                setTimeout(() => {
                    btnText.textContent = originalText;
                }, 1200);
            });
        });
    }
});

// ================================================================================================
// DEVELOPER MODAL MANAGEMENT  
// ================================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Developer Info Modal functionality
    const developerInfoBtn = document.getElementById('developerInfoBtn');
    const developerModal = document.getElementById('developerModal');
    const developerOverlay = document.getElementById('developerOverlay');
    const closeDeveloperBtn = document.getElementById('closeDeveloperBtn');

    function openDeveloperModal() {
        modalManager.openModal('developerModal');
    }

    function closeDeveloperModal() {
        modalManager.closeModal('developerModal');
    }

    // Register developer modal with manager
    modalManager.registerModal('developerModal', () => {
        developerModal.style.display = 'block';
        developerOverlay.style.display = 'block';
        setTimeout(() => {
            developerModal.classList.add('active');
            developerOverlay.classList.add('active');
        }, 10);
        // Hide FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.add('hidden');
    }, () => {
        developerModal.classList.remove('active');
        developerOverlay.classList.remove('active');
        setTimeout(() => {
            developerModal.style.display = 'none';
            developerOverlay.style.display = 'none';
        }, 300);
        // Show FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.remove('hidden');
    });

    if (developerInfoBtn) developerInfoBtn.addEventListener('click', openDeveloperModal);
    if (closeDeveloperBtn) closeDeveloperBtn.addEventListener('click', closeDeveloperModal);
    if (developerOverlay) developerOverlay.addEventListener('click', closeDeveloperModal);

    // Remove individual ESC handler - will be managed centrally
});

// ================================================================================================
// CORE STOPWATCH FUNCTIONALITY
// ================================================================================================
class Stopwatch {
    constructor() {
        // State management
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.laps = [];
        this.animationFrame = null;
        
        // DOM elements

    // Hero layout elements
    this.timeDisplay = document.getElementById('timeDisplay');
    this.subtitleHero = document.getElementById('subtitleHero');
    this.startPauseBtn = document.getElementById('startPauseBtn');
    this.lapBtn = document.getElementById('lapBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.startPauseIcon = document.getElementById('startPauseIcon');
    this.lapsContainer = document.getElementById('lapsContainer');
    this.lapsList = document.getElementById('lapsList');
        
        // Settings elements
        this.settingsToggle = document.getElementById('settingsToggle');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        
        // Initialize
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
        this.initializeUI();
        
        // Add loaded class for animations after a brief delay
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }
    
    bindEvents() {
        // Stopwatch controls
        this.startPauseBtn.addEventListener('click', () => this.toggleStopwatch());
        this.lapBtn.addEventListener('click', () => this.addLap());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Settings panel
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.settingsOverlay.addEventListener('click', () => this.closeSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeypress(e));
        
        // Prevent settings panel from closing when clicking inside
        this.settingsPanel.addEventListener('click', (e) => e.stopPropagation());
        // Trap focus inside settings panel
        this.settingsPanel.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = this.settingsPanel.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        });
    }
    
    initializeUI() {
        this.updateDisplay();
        this.updateButtons();
        if (this.lapsContainer) this.lapsContainer.style.display = 'none';
    }
    
    toggleStopwatch() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        this.startTime = performance.now() - this.elapsedTime;
        this.updateLoop();
        this.updateButtons();
        if (this.timeDisplay) this.timeDisplay.classList.add('running');
        this.playSound('start');
        this.vibrate();
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.updateDisplay(); // Make sure display is updated when paused
        this.updateButtons();
        if (this.timeDisplay) this.timeDisplay.classList.remove('running');
        this.playSound('pause');
        this.vibrate();
    }
    
    reset() {
        this.isRunning = false;
        this.elapsedTime = 0;
        this.laps = [];
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.updateDisplay();
        this.updateButtons();
        this.updateLaps();
        if (this.timeDisplay) this.timeDisplay.classList.remove('running');
        this.playSound('reset');
        this.vibrate();
    }
    
    addLap() {
        if (this.isRunning || this.elapsedTime > 0) {
            const lapTime = this.elapsedTime;
            const lapNumber = this.laps.length + 1;
            const previousLap = this.laps.length > 0 ? this.laps[this.laps.length - 1].time : 0;
            const difference = lapTime - previousLap;
            
            this.laps.push({
                number: lapNumber,
                time: lapTime,
                difference: difference
            });
            
            this.updateLaps();
            this.playSound('lap');
            this.vibrate();
        }
    }
    
    updateLoop() {
        if (this.isRunning) {
            this.elapsedTime = performance.now() - this.startTime;
            this.updateDisplay();
            this.animationFrame = requestAnimationFrame(() => this.updateLoop());
        }
    }
    

    updateDisplay() {
        const formatted = this.formatTime(this.elapsedTime);
        
        if (this.timeDisplay) {
            // Simple text update without flip animation
            this.timeDisplay.textContent = formatted;
            
            // Add/remove running class for animations
            if (this.isRunning) {
                this.timeDisplay.classList.add('running');
            } else {
                this.timeDisplay.classList.remove('running');
            }
        }
        
        // Update subtitle based on timer state with smooth transitions
        if (this.subtitleHero) {
            let newText = '';
            if (this.isRunning) {
                newText = 'Running...';
            } else if (this.elapsedTime > 0) {
                newText = 'Paused';
            } else {
                newText = 'Ready to time your moments';
            }
            
            if (this.subtitleHero.textContent !== newText) {
                this.subtitleHero.style.opacity = '0';
                setTimeout(() => {
                    this.subtitleHero.textContent = newText;
                    this.subtitleHero.style.opacity = '1';
                }, 150);
            }
        }
        
        this.updatePageTitle(formatted);
    }
    
    updatePageTitle(timeString) {
        const pageTitle = document.getElementById('pageTitle');
        // Remove milliseconds if present
        let cleanTime = timeString.split('.')[0];
        if (pageTitle) {
            pageTitle.textContent = `${cleanTime} | Aesthetic Stopwatch | Chinmay`;
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const hours = Math.floor(minutes / 60);
        const displayMinutes = minutes % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${displayMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateButtons() {
        const btnText = this.startPauseBtn.querySelector('.btn-text');
        const btnIcon = this.startPauseIcon;
        if (this.isRunning) {
            btnText.textContent = 'Pause';
            if (btnIcon) btnIcon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            this.lapBtn.disabled = false;
            this.resetBtn.disabled = false;
        } else {
            btnText.textContent = this.elapsedTime > 0 ? 'Resume' : 'Start';
            if (btnIcon) btnIcon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            this.lapBtn.disabled = this.elapsedTime === 0;
            this.resetBtn.disabled = this.elapsedTime === 0;
        }
    }
    
    updateLaps() {
        // Update lap count
        const lapsCount = document.getElementById('lapsCount');
        if (lapsCount) {
            const count = this.laps.length;
            lapsCount.textContent = count === 0 ? '0 laps' : count === 1 ? '1 lap' : `${count} laps`;
        }

        if (this.laps.length === 0) {
            if (this.lapsContainer) {
                this.lapsContainer.style.display = 'none';
                this.lapsContainer.classList.remove('show');
            }
            return;
        }
        
        if (this.lapsContainer) {
            this.lapsContainer.style.display = 'block';
            setTimeout(() => {
                this.lapsContainer.classList.add('show');
            }, 50);
        }
        
        // Clear existing laps
        if (this.lapsList) {
            this.lapsList.innerHTML = '';
            
            // Add laps in reverse order (newest first)
            const reversedLaps = [...this.laps].reverse();
        
            reversedLaps.forEach((lap, index) => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            // Determine if this lap is faster or slower than the previous
            let diffClass = '';
            let diffText = '';
            
            if (index < reversedLaps.length - 1) {
                const nextLap = reversedLaps[index + 1];
                const timeDiff = lap.time - nextLap.time;
                
                if (timeDiff < lap.difference) {
                    diffClass = 'faster';
                    diffText = `-${this.formatTimeDifference(lap.difference - timeDiff)}`;
                } else if (timeDiff > lap.difference) {
                    diffClass = 'slower';
                    diffText = `+${this.formatTimeDifference(timeDiff - lap.difference)}`;
                }
            }
            
            lapElement.innerHTML = `
                <div class="lap-number">Lap ${lap.number}</div>
                <div class="lap-time">${this.formatTime(lap.time)}</div>
                ${diffText ? `<div class="lap-diff ${diffClass}">${diffText}</div>` : ''}
            `;
            
                this.lapsList.appendChild(lapElement);
            });
        }
    }
    
    formatTimeDifference(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        if (totalSeconds >= 60) {
            const minutes = Math.floor(totalSeconds / 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    }
    
    handleKeypress(event) {
        // Allow ESC key even when any modal is open, but ignore other keypresses
        if ((modalManager.hasActiveModal() && event.code !== 'Escape') || 
            event.target.tagName === 'INPUT' || 
            event.target.tagName === 'SELECT') {
            return;
        }
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.toggleStopwatch();
                break;
            case 'KeyR':
                event.preventDefault();
                this.reset();
                break;
            case 'KeyL':
                event.preventDefault();
                this.addLap();
                break;
            case 'Escape':
                // ESC key is now handled globally by modalManager
                // This prevents duplicate handling and conflicts
                break;
        }
    }
    
    // Settings Panel Methods
    toggleSettings() {
        if (modalManager.isModalOpen('settingsPanel')) {
            modalManager.closeModal('settingsPanel');
        } else {
            modalManager.openModal('settingsPanel');
        }
    }
    
    openSettings() {
        modalManager.openModal('settingsPanel');
    }
    
    closeSettings() {
        modalManager.closeModal('settingsPanel');
    }
    
    // Audio and Haptic Feedback
    playSound(type) {
        const soundEnabled = this.getSetting('soundEnabled', true);
        if (!soundEnabled) return;
        
        try {
            // Create audio context for better browser support
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different tones for different actions
            switch (type) {
                case 'start':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    break;
                case 'pause':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    break;
                case 'reset':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
                case 'lap':
                    oscillator.frequency.value = 1000;
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                    break;
            }
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not available:', error);
        }
    }
    
    vibrate() {
        const vibrationEnabled = this.getSetting('vibrationEnabled', true);
        if (!vibrationEnabled) return;
        
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    // Settings Management
    loadSettings() {
        // Load and apply background
        const background = this.getSetting('background', 'morning-mist');
        this.setBackground(background);
        
        // Load and apply theme
        const theme = this.getSetting('theme', 'light');
        this.setTheme(theme);
        
        // Load and apply accent color
        const accentColor = this.getSetting('accentColor', '#66a6ff');
        this.setAccentColor(accentColor);
        
        // Auto theme detection
        if (theme === 'auto') {
            this.setupAutoTheme();
        }
    }
    
    getSetting(key, defaultValue) {
        try {
            const value = localStorage.getItem(`stopwatch_${key}`);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }
    
    setSetting(key, value) {
        try {
            localStorage.setItem(`stopwatch_${key}`, JSON.stringify(value));
        } catch (error) {
            console.log('Unable to save setting:', error);
        }
    }
    
    setBackground(preset) {
        // Remove existing background classes
        document.body.classList.remove('morning-mist', 'cyber-night', 'cotton-candy', 'minimal-sand', 'custom-bg');
        const heroBg = document.getElementById('heroBg');
        let bgUrl = '';
        if (preset === 'morning-mist') {
            bgUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
        } else if (preset === 'cyber-night') {
            bgUrl = 'https://plus.unsplash.com/premium_photo-1720694818685-60a176ddfedf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWVzdGhldGljfGVufDB8fDB8fHww';
        } else if (preset === 'cotton-candy') {
            bgUrl = 'https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFlc3RoZXRpY3xlbnwwfHwwfHx8MA%3D%3D';
        } else if (preset === 'minimal-sand') {
            bgUrl = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80';
        }
        if (preset !== 'custom') {
            if (heroBg) heroBg.style.backgroundImage = `url(${bgUrl})`;
        }
        this.setSetting('background', preset);
    }
    
    setCustomBackground(imageUrl) {
    document.body.classList.remove('morning-mist', 'cyber-night', 'cotton-candy', 'minimal-sand');
    document.body.classList.add('custom-bg');
    const heroBg = document.getElementById('heroBg');
    if (heroBg) heroBg.style.backgroundImage = `url('${imageUrl}')`;
    this.setSetting('background', 'custom');
    this.setSetting('customBackgroundUrl', imageUrl);
    }
    
    setTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        // Update radio UI
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.checked = (radio.value === theme);
        });
        if (theme === 'auto') {
            this.setupAutoTheme();
        } else {
            document.body.classList.add(`theme-${theme}`);
            // Remove auto theme listener if present
            if (this._autoThemeListener) {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this._autoThemeListener);
                this._autoThemeListener = null;
            }
        }
        this.setSetting('theme', theme);
    }
    
    setupAutoTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateTheme = (e) => {
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(e.matches ? 'theme-dark' : 'theme-light');
            // Update radio UI to reflect system theme
            document.querySelectorAll('input[name="theme"]').forEach(radio => {
                radio.checked = false;
            });
        };
        updateTheme(mediaQuery);
        if (this._autoThemeListener) {
            mediaQuery.removeEventListener('change', this._autoThemeListener);
        }
        this._autoThemeListener = updateTheme;
        mediaQuery.addEventListener('change', updateTheme);
    }
    
    setAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        this.setSetting('accentColor', color);
    }
}

// ================================================================================================
// SETTINGS MANAGEMENT SYSTEM
// ================================================================================================
class SettingsManager {
    constructor(stopwatch) {
        this.stopwatch = stopwatch;
        this.init();
    }
    
    init() {
        this.bindSettingsEvents();
        this.loadSettingsUI();
    }
    
    bindSettingsEvents() {
        // Background presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bgType = btn.dataset.bg;
                if (bgType) {
                    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.stopwatch.setBackground(bgType);
                }
            });
        });
        
        // Custom background upload
        const backgroundUpload = document.getElementById('backgroundUpload');
        if (backgroundUpload) {
            backgroundUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.stopwatch.setCustomBackground(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Theme selector
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.stopwatch.setTheme(e.target.value);
            });
        });
        
        // Accent color picker
        const accentColorPicker = document.getElementById('accentColorPicker');
        accentColorPicker.addEventListener('input', (e) => {
            this.stopwatch.setAccentColor(e.target.value);
        });
        
        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                accentColorPicker.value = color;
                this.stopwatch.setAccentColor(color);
                this.updateColorPresets(color);
            });
        });
        
        // Sound and vibration toggles
        const soundToggle = document.getElementById('soundToggle');
        const vibrationToggle = document.getElementById('vibrationToggle');
        
        soundToggle.addEventListener('change', (e) => {
            this.stopwatch.setSetting('soundEnabled', e.target.checked);
        });
        
        vibrationToggle.addEventListener('change', (e) => {
            this.stopwatch.setSetting('vibrationEnabled', e.target.checked);
        });
    }
    
    loadSettingsUI() {
        // Load background preset
        const currentBackground = this.stopwatch.getSetting('background', 'morning-mist');
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === currentBackground);
        });
        
        // Load theme
        const currentTheme = this.stopwatch.getSetting('theme', 'light');
        const themeRadio = document.querySelector(`input[name="theme"][value="${currentTheme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
        
        // Load accent color
        const currentAccentColor = this.stopwatch.getSetting('accentColor', '#66a6ff');
        document.getElementById('accentColorPicker').value = currentAccentColor;
        this.updateColorPresets(currentAccentColor);
        
        // Load sound and vibration settings
        document.getElementById('soundToggle').checked = this.stopwatch.getSetting('soundEnabled', true);
        document.getElementById('vibrationToggle').checked = this.stopwatch.getSetting('vibrationEnabled', true);
    }
    
    updateColorPresets(activeColor) {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === activeColor);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const stopwatch = new Stopwatch();
    const settingsManager = new SettingsManager(stopwatch);
    
    // Register settings modal with modal manager
    modalManager.registerModal('settingsPanel', () => {
        stopwatch.settingsPanel.classList.add('show');
        stopwatch.settingsOverlay.classList.add('show');
        // Hide FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.add('hidden');
    }, () => {
        stopwatch.settingsPanel.classList.remove('show');
        stopwatch.settingsOverlay.classList.remove('show');
        // Show FAB buttons
        const fabGroup = document.querySelector('.fab-group');
        if (fabGroup) fabGroup.classList.remove('hidden');
    });
    
    // Set initial hero background on load
    const bgPreset = stopwatch.getSetting('background', 'morning-mist');
    if (bgPreset === 'custom') {
        const customUrl = stopwatch.getSetting('customBackgroundUrl', '');
        if (customUrl) {
            const heroBg = document.getElementById('heroBg');
            if (heroBg) heroBg.style.backgroundImage = `url('${customUrl}')`;
        }
    } else {
        stopwatch.setBackground(bgPreset);
    }
    // Export for debugging
    window.stopwatch = stopwatch;
});

// ================================================================================================
// PERFORMANCE MONITORING & ERROR HANDLING
// ================================================================================================
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {
            errors: [],
            interactions: [],
            performance: {}
        };
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.recordLoadMetrics();
        });

        // Monitor errors
        window.addEventListener('error', (e) => {
            this.recordError('JavaScript Error', e.error, e.filename, e.lineno);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.recordError('Promise Rejection', e.reason);
        });

        // Monitor user interactions
        this.setupInteractionTracking();

        // Monitor web vitals if available
        this.setupWebVitals();
    }

    recordLoadMetrics() {
        if (performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.performance = {
                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    firstByte: navigation.responseStart - navigation.requestStart,
                    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                    tcp: navigation.connectEnd - navigation.connectStart,
                    render: navigation.loadEventStart - navigation.fetchStart
                };
            }
        }
    }

    recordError(type, error, file = '', line = 0) {
        const errorData = {
            type,
            message: error.message || error,
            file,
            line,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.metrics.errors.push(errorData);
        console.error('Performance Monitor - Error recorded:', errorData);
        
        // In production, you could send this to an analytics service
        // this.sendToAnalytics('error', errorData);
    }

    recordInteraction(type, element, duration = 0) {
        const interactionData = {
            type,
            element: element?.tagName || 'unknown',
            elementId: element?.id || '',
            duration,
            timestamp: new Date().toISOString()
        };
        
        this.metrics.interactions.push(interactionData);
        
        // Keep only last 50 interactions to prevent memory issues
        if (this.metrics.interactions.length > 50) {
            this.metrics.interactions = this.metrics.interactions.slice(-50);
        }
    }

    setupInteractionTracking() {
        // Track button clicks with timing
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .fab-btn, .control-btn-premium')) {
                const startTime = performance.now();
                // Record after a brief delay to capture any processing time
                requestAnimationFrame(() => {
                    const duration = performance.now() - startTime;
                    this.recordInteraction('click', e.target, duration);
                });
            }
        });

        // Track keyboard interactions
        document.addEventListener('keydown', (e) => {
            if (['Space', 'KeyR', 'KeyL', 'Escape'].includes(e.code)) {
                this.recordInteraction('keyboard', e.target);
            }
        });
    }

    setupWebVitals() {
        // Monitor First Contentful Paint
        if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('paint')) {
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.performance.fcp = entry.startTime;
                    }
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });
        }

        // Monitor Largest Contentful Paint
        if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.performance.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // Monitor Cumulative Layout Shift
        if (PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
            let clsScore = 0;
            const clsObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                        this.metrics.performance.cls = clsScore;
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    getMetrics() {
        return this.metrics;
    }

    // Method to send metrics to analytics (placeholder)
    sendToAnalytics(type, data) {
        // In production, implement sending to your analytics service
        // Example: Google Analytics, Mixpanel, etc.
        console.log(`Analytics - ${type}:`, data);
    }
}

// ================================================================================================
// APPLICATION INITIALIZATION & FINAL SETUP
// ================================================================================================

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Optimize animations based on user preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0.01ms');
    document.documentElement.style.setProperty('--transition-medium', '0.01ms');
    document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}

// Battery API for performance optimization
if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
        // Reduce animations if battery is low
        if (battery.level < 0.2 || battery.charging === false) {
            document.documentElement.classList.add('low-power-mode');
        }
        
        battery.addEventListener('levelchange', () => {
            if (battery.level < 0.2) {
                document.documentElement.classList.add('low-power-mode');
            } else {
                document.documentElement.classList.remove('low-power-mode');
            }
        });
    });
}
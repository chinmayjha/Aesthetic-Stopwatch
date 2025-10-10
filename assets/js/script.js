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
// PWA SERVICE WORKER REGISTRATION & INSTALL PROMPT
// ================================================================================================
let deferredPrompt;

// Listen for install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./assets/js/sw.js"
      );
      console.log(
        "Service Worker registered successfully:",
        registration.scope
      );

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("New content available, refresh for updates");
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.log("Service Worker registration failed:", error);
    }
  });
}

// Show install button
function showInstallButton() {
  const installBtn = document.createElement("button");
  installBtn.className = "install-btn";
  installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Install App
    `;
  installBtn.addEventListener("click", handleInstallClick);

  // Add to navbar or fab group
  const navbar = document.querySelector(".navbar-content");
  if (navbar) {
    installBtn.classList.add("install-btn-navbar");
    navbar.appendChild(installBtn);
  }
}

// Handle install click
async function handleInstallClick() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    hideInstallButton();
  }
}

// Hide install button
function hideInstallButton() {
  const installBtn = document.querySelector(".install-btn");
  if (installBtn) {
    installBtn.remove();
  }
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement("div");
  notification.className = "update-notification";
  notification.innerHTML = `
        <div class="update-content">
            <span>New version available!</span>
            <button onclick="window.location.reload()">Update</button>
        </div>
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);
}

// ================================================================================================
// PERFORMANCE OPTIMIZATIONS & UTILITIES
// ================================================================================================
// Lazy load images and optimize rendering
const observerOptions = {
  root: null,
  rootMargin: "50px",
  threshold: 0.1,
};

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
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
// QUOTE TOGGLE CHECKBOX (Display Options)
// ================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const quoteContainer = document.getElementById("quoteContainer");
  const showQuotesToggle = document.getElementById("showQuotesToggle");
  if (showQuotesToggle && quoteContainer) {
    // Restore state from localStorage (default: true)
    const showQuotes = localStorage.getItem("showQuotes");
    if (showQuotes === null) {
      showQuotesToggle.checked = true;
      quoteContainer.style.display = "";
    } else {
      showQuotesToggle.checked = showQuotes === "true";
      quoteContainer.style.display = showQuotesToggle.checked ? "" : "none";
    }
    showQuotesToggle.addEventListener("change", () => {
      const shouldShow = showQuotesToggle.checked;
      quoteContainer.style.display = shouldShow ? "" : "none";
      localStorage.setItem("showQuotes", shouldShow);
    });
  }
});
// ================================================================================================
// MOTIVATIONAL QUOTES API
// ================================================================================================
class QuotesManager {
  constructor() {
    this.quotes = [
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
      },
      {
        text: "Don't let yesterday take up too much of today.",
        author: "Will Rogers",
      },
      {
        text: "You learn more from failure than from success.",
        author: "Anonymous",
      },
      {
        text: "It's not whether you get knocked down, it's whether you get up.",
        author: "Vince Lombardi",
      },
      {
        text: "If you are working on something that you really care about, you don't have to be pushed.",
        author: "Steve Jobs",
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
      },
      {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs",
      },
      {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
      },
      {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
      },
      {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
      },
      { text: "Progress, not perfection, is the goal.", author: "Anonymous" },
      { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
      {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss",
      },
    ];
    this.currentQuoteIndex = 0;
    // Multiple reliable APIs for quotes
    this.apis = [
      {
        url: "https://api.quotable.io/random?minLength=50&maxLength=150",
        parser: (data) => ({ text: data.content, author: data.author })
      },
      {
        url: "https://zenquotes.io/api/random",
        parser: (data) => Array.isArray(data) && data[0] ? { text: data[0].q, author: data[0].a } : null
      },
      {
        url: "https://api.adviceslip.com/advice",
        parser: (data) => data.slip ? { text: data.slip.advice, author: "Chinmay" } : null
      }
    ];
    this.currentApiIndex = 0;
    this.init();
  }

  init() {
    this.loadQuote();

    // Auto-refresh quote every 15 minutes
    setInterval(() => {
      this.loadQuote();
    }, 900000);
  }

  async loadQuote() {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    if (!quoteText || !quoteAuthor) return;

    // Try all APIs in sequence
    for (let i = 0; i < this.apis.length; i++) {
      try {
        const api = this.apis[i];
        const quote = await Promise.race([
          this.fetchFromAPI(api),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);
        
        if (quote && quote.text && quote.author) {
          this.displayQuote(quote.text, quote.author);
          console.log(`Quote loaded from API ${i + 1}`);
          return;
        }
      } catch (error) {
        console.log(`API ${i + 1} failed:`, error.message);
        continue;
      }
    }

    // Use local quotes as final fallback
    console.log("All APIs failed, using local quotes");
    this.displayLocalQuote();
  }

  async fetchFromAPI(api) {
    try {
      const response = await fetch(api.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return api.parser(data);
    } catch (error) {
      throw error;
    }
  }

  displayLocalQuote() {
    const quote = this.quotes[this.currentQuoteIndex];
    this.displayQuote(quote.text, quote.author);
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
  }

  displayQuote(text, author) {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    if (!quoteText || !quoteAuthor) return;

    // Clean up text
    const cleanText = text.replace(/["'"]/g, "").trim();
    const cleanAuthor = author || "Anonymous";

    // Add fade effect with transform
    quoteText.style.opacity = "0";
    quoteAuthor.style.opacity = "0";
    quoteText.style.transform = "translateY(10px)";
    quoteAuthor.style.transform = "translateY(10px)";

    setTimeout(() => {
      quoteText.textContent = cleanText;
      quoteAuthor.textContent = cleanAuthor;

      quoteText.style.opacity = "1";
      quoteAuthor.style.opacity = "1";
      quoteText.style.transform = "translateY(0)";
      quoteAuthor.style.transform = "translateY(0)";
    }, 300);
  }

  // Method to get quote based on context (studying, working, etc.)
  getContextualQuote(context = "general") {
    const contextQuotes = {
      studying: [
        {
          text: "Education is the most powerful weapon which you can use to change the world.",
          author: "Nelson Mandela",
        },
        {
          text: "The expert in anything was once a beginner.",
          author: "Helen Hayes",
        },
        {
          text: "Learning never exhausts the mind.",
          author: "Leonardo da Vinci",
        },
      ],
      working: [
        {
          text: "Choose a job you love, and you will never have to work a day in your life.",
          author: "Confucius",
        },
        {
          text: "The way to get started is to quit talking and begin doing.",
          author: "Walt Disney",
        },
        {
          text: "Focus on being productive instead of busy.",
          author: "Tim Ferriss",
        },
      ],
    };

    return contextQuotes[context] || this.quotes;
  }
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
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
    if (modalId !== "settingsPanel") {
      this.closeAllModals(["settingsPanel"]);
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
    const toClose = [...this.activeModals].filter((id) => !except.includes(id));
    toClose.forEach((modalId) => this.closeModal(modalId));
  }

  handleEscapeKey(event) {
    // Handle modals in priority order
    const modalPriority = ["shareModal", "developerModal", "settingsPanel"];

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
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    outer.style.msOverflowStyle = "scrollbar";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  updateBodyScrollLock() {
    if (this.activeModals.size > 0) {
      // Prevent layout shift by adding padding equal to scrollbar width
      const hasScrollbar =
        document.documentElement.scrollHeight > window.innerHeight;
      if (hasScrollbar) {
        document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = this.originalOverflow || "";
      document.body.style.paddingRight = "";
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
document.addEventListener("DOMContentLoaded", () => {
  // --- BACKGROUND PRESETS & UPLOAD ---
  const presetBtns = document.querySelectorAll(".preset-btn");
  const backgroundUpload = document.getElementById("backgroundUpload");
  // Preset backgrounds (user can fill URLs in HTML)
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.style.backgroundImage
        .replace(/^url\(["']?/, "")
        .replace(/["']?\)$/, "");
      if (url) {
        const heroBg = document.getElementById("heroBg");
        if (heroBg) heroBg.style.backgroundImage = `url(${url})`;
        localStorage.setItem("customBackgroundUrl", url);
      }
    });
  });
  // Custom upload
  if (backgroundUpload) {
    backgroundUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        const heroBg = document.getElementById("heroBg");
        if (heroBg) heroBg.style.backgroundImage = `url(${ev.target.result})`;
        localStorage.setItem("customBackgroundUrl", ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
  // On load, restore custom background if set
  const savedBg = localStorage.getItem("customBackgroundUrl");
  if (savedBg) {
    const heroBg = document.getElementById("heroBg");
    if (heroBg) heroBg.style.backgroundImage = `url(${savedBg})`;
  }
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (!fullscreenBtn) return;
  let isFullscreen = false;
  function setIcon() {
    const name = isFullscreen ? "minimize" : "maximize";
    const tgt = fullscreenBtn.querySelector(".fab-icon");
    if (tgt && window.lucide?.icons?.[name]) {
      tgt.innerHTML = window.lucide.icons[name].toSvg({
        width: 26,
        height: 26,
      });
    }
  }
  setIcon();
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
    setTimeout(setIcon, 200);
  });
  document.addEventListener("fullscreenchange", () => {
    isFullscreen = !!document.fullscreenElement;
    setIcon();
  });
});
// ================================================================================================
// SHARE MODAL MANAGEMENT
// ================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Share Modal functionality
  const shareInfoBtn = document.getElementById("shareBtn");
  const shareModal = document.getElementById("shareModal");
  const shareOverlay = document.getElementById("shareOverlay");
  const closeShareBtn = document.getElementById("closeShareBtn");

  function openShareModal() {
    modalManager.openModal("shareModal");
  }

  function closeShareModal() {
    modalManager.closeModal("shareModal");
  }

  // Register share modal with manager
  modalManager.registerModal(
    "shareModal",
    () => {
      shareOverlay.classList.add("active");
      shareModal.classList.add("active");
      // Hide FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.add("hidden");
    },
    () => {
      shareModal.classList.remove("active");
      shareOverlay.classList.remove("active");
      // Show FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.remove("hidden");
    }
  );

  if (shareInfoBtn) shareInfoBtn.addEventListener("click", openShareModal);
  if (closeShareBtn) closeShareBtn.addEventListener("click", closeShareModal);
  if (shareOverlay) shareOverlay.addEventListener("click", closeShareModal);

  // Copy URL functionality
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener("click", async () => {
      const url = "https://stopwatch.chinmayjha.tech/";
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!");
      } catch (err) {
        // Fallback for browsers without clipboard API
        const shareUrl = document.getElementById("shareUrl");
        shareUrl.select();
        document.execCommand("copy");
        showToast("Link copied to clipboard!");
      }
    });
  }

  // Social sharing functionality
  const socialBtns = document.querySelectorAll(".social-btn");
  socialBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const platform = btn.dataset.platform;
      const url = "https://stopwatch.chinmayjha.tech/";
      const text = "Check out this beautiful aesthetic stopwatch!";

      let shareUrl = "";
      switch (platform) {
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(
            text + " " + url
          )}`;
          break;
        case "telegram":
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    });
  });

  // Toast notification function
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  }
});

// ================================================================================================
// DEVELOPER MODAL MANAGEMENT
// ================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Developer Info Modal functionality
  const developerInfoBtn = document.getElementById("developerInfoBtn");
  const developerModal = document.getElementById("developerModal");
  const developerOverlay = document.getElementById("developerOverlay");
  const closeDeveloperBtn = document.getElementById("closeDeveloperBtn");

  function openDeveloperModal() {
    modalManager.openModal("developerModal");
  }

  function closeDeveloperModal() {
    modalManager.closeModal("developerModal");
  }

  // Register developer modal with manager
  modalManager.registerModal(
    "developerModal",
    () => {
      developerModal.style.display = "block";
      developerOverlay.style.display = "block";
      setTimeout(() => {
        developerModal.classList.add("active");
        developerOverlay.classList.add("active");
      }, 10);
      // Hide FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.add("hidden");
    },
    () => {
      developerModal.classList.remove("active");
      developerOverlay.classList.remove("active");
      setTimeout(() => {
        developerModal.style.display = "none";
        developerOverlay.style.display = "none";
      }, 300);
      // Show FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.remove("hidden");
    }
  );

  if (developerInfoBtn)
    developerInfoBtn.addEventListener("click", openDeveloperModal);
  if (closeDeveloperBtn)
    closeDeveloperBtn.addEventListener("click", closeDeveloperModal);
  if (developerOverlay)
    developerOverlay.addEventListener("click", closeDeveloperModal);

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
    this._lastRenderedSec = -1; // throttle UI to once per second for zero-lag

    // DOM elements

    // Hero layout elements
    this.timeDisplay = document.getElementById("timeDisplay");
    this.subtitleHero = document.getElementById("subtitleHero");
    this.startPauseBtn = document.getElementById("startPauseBtn");
    this.lapBtn = document.getElementById("lapBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.startPauseIcon = document.getElementById("startPauseIcon");
    this.lapsContainer = document.getElementById("lapsContainer");
    this.lapsList = document.getElementById("lapsList");

    // Settings elements
    this.settingsToggle = document.getElementById("settingsToggle");
    this.settingsPanel = document.getElementById("settingsPanel");
    this.settingsOverlay = document.getElementById("settingsOverlay");
    this.closeSettingsBtn = document.getElementById("closeSettingsBtn");

    // Initialize
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.initializeUI();

    // Restore persisted stopwatch state if exists
    this.restoreState();

    // Add loaded class for animations after a brief delay
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 100);
  }

  bindEvents() {
    // Stopwatch controls
    this.startPauseBtn.addEventListener("click", () => this.toggleStopwatch());
    this.lapBtn.addEventListener("click", () => this.addLap());
    this.resetBtn.addEventListener("click", () => this.reset());

    // Settings panel
    this.settingsToggle.addEventListener("click", () => this.toggleSettings());
    this.closeSettingsBtn.addEventListener("click", () => this.closeSettings());
    this.settingsOverlay.addEventListener("click", () => this.closeSettings());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeypress(e));

    // Prevent settings panel from closing when clicking inside
    this.settingsPanel.addEventListener("click", (e) => e.stopPropagation());
    // Trap focus inside settings panel
    this.settingsPanel.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const focusable = this.settingsPanel.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"])'
        );
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
    this.updateDisplay(true);
    this.updateButtons();
    if (this.lapsContainer) this.lapsContainer.style.display = "none";
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
    if (this.timeDisplay) this.timeDisplay.classList.add("running");
    this.playSound("start");
    this.vibrate();
    this.persistState();
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.updateDisplay(); // Make sure display is updated when paused
    this.updateButtons();
    if (this.timeDisplay) this.timeDisplay.classList.remove("running");
    this.playSound("pause");
    this.vibrate();
    this.persistState();
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
    // Force clear the laps list UI
    if (this.lapsList) {
      this.lapsList.innerHTML = "";
    }
    if (this.lapsContainer) {
      this.lapsContainer.style.display = "none";
      this.lapsContainer.classList.remove("show");
    }
    if (this.timeDisplay) this.timeDisplay.classList.remove("running");
    this.playSound("reset");
    this.vibrate();
    this.persistState(true);
  }

  addLap() {
    if (this.isRunning || this.elapsedTime > 0) {
      const lapTime = this.elapsedTime;
      const lapNumber = this.laps.length + 1;
      const previousLap =
        this.laps.length > 0 ? this.laps[this.laps.length - 1].time : 0;
      const difference = lapTime - previousLap;

      this.laps.push({
        number: lapNumber,
        time: lapTime,
        difference: difference,
      });

      this.updateLaps(true);
      this.playSound("lap");
      this.vibrate();
      this.persistState();
    }
  }

  updateLoop() {
    if (!this.isRunning) return;
    this.elapsedTime = performance.now() - this.startTime;
    this.updateDisplay();
    this.animationFrame = requestAnimationFrame(() => this.updateLoop());
  }

  updateDisplay(force = false) {
    const formatted = this.formatTime(this.elapsedTime);

    if (this.timeDisplay) {
      // Throttle to reduce DOM churn: only update if seconds changed or forced
      const sec = Math.floor(this.elapsedTime / 1000);
      if (force || sec !== this._lastRenderedSec) {
        this.timeDisplay.textContent = formatted;
        this._lastRenderedSec = sec;
        this.updatePageTitle(formatted);
      }

      // Add/remove running class for animations
      if (this.isRunning) {
        this.timeDisplay.classList.add("running");
      } else {
        this.timeDisplay.classList.remove("running");
      }
    }

    // Update subtitle based on timer state with smooth transitions
    if (this.subtitleHero) {
      let newText = "";
      if (this.isRunning) {
        newText = "Running...";
      } else if (this.elapsedTime > 0) {
        newText = "Paused";
      } else {
        newText = "Ready to time your moments";
      }

      if (this.subtitleHero.textContent !== newText) {
        this.subtitleHero.style.opacity = "0";
        setTimeout(() => {
          this.subtitleHero.textContent = newText;
          this.subtitleHero.style.opacity = "1";
        }, 150);
      }
    }

    // Title already updated in the throttled block above
  }

  updatePageTitle(timeString) {
    const pageTitle = document.getElementById("pageTitle");
    // Remove milliseconds if present
    let cleanTime = timeString.split(".")[0];
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
      return `${hours.toString().padStart(2, "0")}:${displayMinutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${displayMinutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }

  updateButtons() {
    const btnText = this.startPauseBtn.querySelector(".btn-text");
    const btnIcon = this.startPauseIcon;
    if (this.isRunning) {
      btnText.textContent = "Pause";
      if (btnIcon && window.lucide?.icons?.pause)
        btnIcon.innerHTML = window.lucide.icons.pause.toSvg({
          width: 22,
          height: 22,
        });
      this.lapBtn.disabled = false;
      this.resetBtn.disabled = false;
    } else {
      btnText.textContent = this.elapsedTime > 0 ? "Resume" : "Start";
      if (btnIcon && window.lucide?.icons?.play)
        btnIcon.innerHTML = window.lucide.icons.play.toSvg({
          width: 22,
          height: 22,
        });
      this.lapBtn.disabled = this.elapsedTime === 0;
      this.resetBtn.disabled = this.elapsedTime === 0;
    }
  }

  updateLaps(appendOnly = false) {
    // Update statistics
    this.updateLapStats();

    if (this.laps.length === 0) {
      if (this.lapsContainer) {
        this.lapsContainer.style.display = "none";
      }
      if (this.lapsList) {
        this.lapsList.innerHTML = `
          <div class="no-laps-message">
            <div class="no-laps-icon">🏁</div>
            <h3>No lap times yet</h3>
            <p>Start the stopwatch and press the lap button to record your first lap time!</p>
          </div>
        `;
      }
      return;
    }

    if (this.lapsContainer) {
      this.lapsContainer.style.display = "block";
    }
    if (!this.lapsList) return;

    // Efficient rendering: if appending, only render latest item to top
    if (appendOnly && this.laps.length > 0) {
      // Remove no-laps message if present
      const noLapsMsg = this.lapsList.querySelector('.no-laps-message');
      if (noLapsMsg) {
        this.lapsList.innerHTML = '';
      }
      
      const lap = this.laps[this.laps.length - 1];
      const el = this._renderMegaLap(lap, this.laps.length - 1);
      this.lapsList.prepend(el);
      return;
    }

    // Full re-render
    const frag = document.createDocumentFragment();
    const reversedLaps = [...this.laps].reverse();
    this.lapsList.innerHTML = "";
    reversedLaps.forEach((lap, idx) => {
      frag.appendChild(this._renderMegaLap(lap, this.laps.length - 1 - idx));
    });
    this.lapsList.appendChild(frag);
  }

  updateLapStats() {
    const lapsCount = document.getElementById("lapsCount");
    const bestLap = document.getElementById("bestLap");
    const avgLap = document.getElementById("avgLap");
    const lastLap = document.getElementById("lastLap");

    if (lapsCount) {
      lapsCount.textContent = this.laps.length.toString();
    }

    if (this.laps.length === 0) {
      if (bestLap) bestLap.textContent = "--:--";
      if (avgLap) avgLap.textContent = "--:--";
      if (lastLap) lastLap.textContent = "--:--";
      return;
    }

    // Calculate segment times
    const segmentTimes = this.laps.map((lap, index) => {
      if (index === 0) return lap.time;
      return lap.time - this.laps[index - 1].time;
    });

    // Best lap (fastest segment)
    if (bestLap) {
      const fastest = Math.min(...segmentTimes);
      bestLap.textContent = this.formatTime(fastest);
    }

    // Average lap
    if (avgLap) {
      const average = segmentTimes.reduce((a, b) => a + b, 0) / segmentTimes.length;
      avgLap.textContent = this.formatTime(average);
    }

    // Last lap
    if (lastLap) {
      const lastSegment = segmentTimes[segmentTimes.length - 1];
      lastLap.textContent = this.formatTime(lastSegment);
    }
  }

  _renderMegaLap(lap, originalIndex) {
    const lapRow = document.createElement("div");
    lapRow.className = "lap-row";

    // Calculate segment time
    const segmentTime = originalIndex === 0 
      ? lap.time 
      : lap.time - this.laps[originalIndex - 1].time;

    // Determine diff against previous segment
    let diffClass = "same";
    let diffText = "--";
    if (originalIndex > 0) {
      const prevSegTime = originalIndex === 1 
        ? this.laps[0].time 
        : this.laps[originalIndex - 1].time - this.laps[originalIndex - 2].time;
      
      const delta = segmentTime - prevSegTime;
      if (delta < -50) { // More than 50ms faster
        diffClass = "faster";
        diffText = `-${this.formatTimeDifference(-delta)}`;
      } else if (delta > 50) { // More than 50ms slower
        diffClass = "slower";
        diffText = `+${this.formatTimeDifference(delta)}`;
      } else {
        diffText = "±0.0s";
      }
    }

    lapRow.innerHTML = `
      <div class="lap-col lap-number">
        <span class="lap-number">${lap.number}</span>
      </div>
      <div class="lap-col lap-time">${this.formatTime(segmentTime)}</div>
      <div class="lap-col lap-total">${this.formatTime(lap.time)}</div>
      <div class="lap-col lap-diff ${diffClass}">${diffText}</div>
      <div class="lap-col lap-actions">
        <div class="lap-row-actions">
          <button class="lap-action-btn" title="Copy lap time" onclick="navigator.clipboard?.writeText('Lap ${lap.number}: ${this.formatTime(segmentTime)}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="lap-action-btn" title="Delete lap" onclick="this.closest('.lap-row').style.display='none'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    return lapRow;
  }

  formatTimeDifference(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const seconds = totalSeconds % 60;
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${seconds}s`;
    }
  }

  handleKeypress(event) {
    // Allow ESC key even when any modal is open, but ignore other keypresses
    if (
      (modalManager.hasActiveModal() && event.code !== "Escape") ||
      event.target.tagName === "INPUT" ||
      event.target.tagName === "SELECT"
    ) {
      return;
    }

    switch (event.code) {
      case "Space":
        event.preventDefault();
        this.toggleStopwatch();
        break;
      case "KeyR":
        event.preventDefault();
        this.reset();
        break;
      case "KeyL":
        event.preventDefault();
        this.addLap();
        break;
      case "Escape":
        // ESC key is now handled globally by modalManager
        // This prevents duplicate handling and conflicts
        break;
    }
  }

  // Settings Panel Methods
  toggleSettings() {
    if (modalManager.isModalOpen("settingsPanel")) {
      modalManager.closeModal("settingsPanel");
    } else {
      modalManager.openModal("settingsPanel");
    }
  }

  openSettings() {
    modalManager.openModal("settingsPanel");
  }

  closeSettings() {
    modalManager.closeModal("settingsPanel");
  }

  // Audio and Haptic Feedback
  playSound(type) {
    const soundEnabled = this.getSetting("soundEnabled", true);
    if (!soundEnabled) return;

    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different tones for different actions
      switch (type) {
        case "start":
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.1
          );
          break;
        case "pause":
          oscillator.frequency.value = 400;
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.15
          );
          break;
        case "reset":
          oscillator.frequency.value = 600;
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.2
          );
          break;
        case "lap":
          oscillator.frequency.value = 1000;
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.05
          );
          break;
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio not available:", error);
    }
  }

  vibrate() {
    const vibrationEnabled = this.getSetting("vibrationEnabled", true);
    if (!vibrationEnabled) return;

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  // Settings Management
  loadSettings() {
    // Load and apply background
    const background = this.getSetting("background", "morning-mist");
    this.setBackground(background);

    // Load and apply theme (default dark for first-time users)
    const theme = this.getSetting("theme", "dark");
    this.setTheme(theme);

    // Load and apply accent color
    const accentColor = this.getSetting("accentColor", "#66a6ff");
    this.setAccentColor(accentColor);

    // Auto theme detection
    if (theme === "auto") {
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
      console.log("Unable to save setting:", error);
    }
  }

  setBackground(preset) {
    // Remove existing background classes
    document.body.classList.remove(
      "morning-mist",
      "cyber-night",
      "cotton-candy",
      "minimal-sand",
      "custom-bg"
    );
    const heroBg = document.getElementById("heroBg");
    let bgUrl = "";
    if (preset === "morning-mist") {
      bgUrl =
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
    } else if (preset === "cyber-night") {
      bgUrl =
        "https://plus.unsplash.com/premium_photo-1720694818685-60a176ddfedf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWVzdGhldGljfGVufDB8fDB8fHww";
    } else if (preset === "cotton-candy") {
      bgUrl =
        "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFlc3RoZXRpY3xlbnwwfHwwfHx8MA%3D%3D";
    } else if (preset === "minimal-sand") {
      bgUrl =
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80";
    }
    if (preset !== "custom") {
      if (heroBg) heroBg.style.backgroundImage = `url(${bgUrl})`;
    }
    this.setSetting("background", preset);
  }

  setCustomBackground(imageUrl) {
    document.body.classList.remove(
      "morning-mist",
      "cyber-night",
      "cotton-candy",
      "minimal-sand"
    );
    document.body.classList.add("custom-bg");
    const heroBg = document.getElementById("heroBg");
    if (heroBg) heroBg.style.backgroundImage = `url('${imageUrl}')`;
    this.setSetting("background", "custom");
    this.setSetting("customBackgroundUrl", imageUrl);
  }

  setTheme(theme) {
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.body.classList.remove("theme-light", "theme-dark", "theme-auto");
    // Update radio UI
    document.querySelectorAll('input[name="theme"]').forEach((radio) => {
      radio.checked = radio.value === theme;
    });
    if (theme === "auto") {
      this.setupAutoTheme();
    } else {
      document.documentElement.classList.add(`theme-${theme}`);
      document.body.classList.add(`theme-${theme}`);
      // Remove auto theme listener if present
      if (this._autoThemeListener) {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", this._autoThemeListener);
        this._autoThemeListener = null;
      }
    }
    this.setSetting("theme", theme);
  }

  setupAutoTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (e) => {
      document.documentElement.classList.remove("theme-light", "theme-dark");
      document.body.classList.remove("theme-light", "theme-dark");
      const cls = e.matches ? "theme-dark" : "theme-light";
      document.documentElement.classList.add(cls);
      document.body.classList.add(cls);
      // Update radio UI to reflect system theme
      document.querySelectorAll('input[name="theme"]').forEach((radio) => {
        radio.checked = false;
      });
    };
    updateTheme(mediaQuery);
    if (this._autoThemeListener) {
      mediaQuery.removeEventListener("change", this._autoThemeListener);
    }
    this._autoThemeListener = updateTheme;
    mediaQuery.addEventListener("change", updateTheme);
  }

  setAccentColor(color) {
    document.documentElement.style.setProperty("--accent-color", color);
    this.setSetting("accentColor", color);
  }

  // Persist/restore stopwatch state
  persistState(clear = false) {
    try {
      if (clear) {
        localStorage.removeItem("stopwatch_state");
        return;
      }
      const state = {
        isRunning: this.isRunning,
        startTimeEpoch: this.isRunning ? Date.now() - this.elapsedTime : null,
        elapsedTime: this.elapsedTime,
        laps: this.laps,
      };
      localStorage.setItem("stopwatch_state", JSON.stringify(state));
    } catch {}
  }

  restoreState() {
    try {
      const raw = localStorage.getItem("stopwatch_state");
      if (!raw) return;
      const state = JSON.parse(raw);
      if (Array.isArray(state.laps)) this.laps = state.laps;
      this.updateLaps();
      if (state.isRunning && state.startTimeEpoch) {
        // Reconstruct elapsed based on wall clock to avoid drift during sleep
        this.elapsedTime = Date.now() - state.startTimeEpoch;
        this.start();
      } else if (typeof state.elapsedTime === "number") {
        this.elapsedTime = state.elapsedTime;
        this.updateDisplay(true);
        this.updateButtons();
      }
    } catch {}
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
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bgType = btn.dataset.bg;
        if (bgType) {
          document
            .querySelectorAll(".preset-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.stopwatch.setBackground(bgType);
        }
      });
    });

    // Custom background upload
    const backgroundUpload = document.getElementById("backgroundUpload");
    if (backgroundUpload) {
      backgroundUpload.addEventListener("change", (e) => {
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
    document.querySelectorAll('input[name="theme"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.stopwatch.setTheme(e.target.value);
      });
    });

    // Accent color picker
    const accentColorPicker = document.getElementById("accentColorPicker");
    accentColorPicker.addEventListener("input", (e) => {
      this.stopwatch.setAccentColor(e.target.value);
    });

    // Color presets
    document.querySelectorAll(".color-preset").forEach((preset) => {
      preset.addEventListener("click", () => {
        const color = preset.dataset.color;
        accentColorPicker.value = color;
        this.stopwatch.setAccentColor(color);
        this.updateColorPresets(color);
      });
    });

    // Sound and vibration toggles
    const soundToggle = document.getElementById("soundToggle");
    const vibrationToggle = document.getElementById("vibrationToggle");

    soundToggle.addEventListener("change", (e) => {
      this.stopwatch.setSetting("soundEnabled", e.target.checked);
    });

    vibrationToggle.addEventListener("change", (e) => {
      this.stopwatch.setSetting("vibrationEnabled", e.target.checked);
    });
  }

  loadSettingsUI() {
    // Load background preset
    const currentBackground = this.stopwatch.getSetting(
      "background",
      "morning-mist"
    );
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.bg === currentBackground);
    });

    // Load theme
    const currentTheme = this.stopwatch.getSetting("theme", "dark");
    const themeRadio = document.querySelector(
      `input[name="theme"][value="${currentTheme}"]`
    );
    if (themeRadio) {
      themeRadio.checked = true;
    }

    // Load accent color
    const currentAccentColor = this.stopwatch.getSetting(
      "accentColor",
      "#66a6ff"
    );
    document.getElementById("accentColorPicker").value = currentAccentColor;
    this.updateColorPresets(currentAccentColor);

    // Load sound and vibration settings
    document.getElementById("soundToggle").checked = this.stopwatch.getSetting(
      "soundEnabled",
      true
    );
    document.getElementById("vibrationToggle").checked =
      this.stopwatch.getSetting("vibrationEnabled", true);
  }

  updateColorPresets(activeColor) {
    document.querySelectorAll(".color-preset").forEach((preset) => {
      preset.classList.toggle("active", preset.dataset.color === activeColor);
    });
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  const stopwatch = new Stopwatch();
  const settingsManager = new SettingsManager(stopwatch);

  // Register settings modal with modal manager
  modalManager.registerModal(
    "settingsPanel",
    () => {
      stopwatch.settingsPanel.classList.add("show");
      stopwatch.settingsOverlay.classList.add("show");
      // Hide FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.add("hidden");
    },
    () => {
      stopwatch.settingsPanel.classList.remove("show");
      stopwatch.settingsOverlay.classList.remove("show");
      // Show FAB buttons
      const fabGroup = document.querySelector(".fab-group");
      if (fabGroup) fabGroup.classList.remove("hidden");
    }
  );

  // Set initial hero background on load
  const bgPreset = stopwatch.getSetting("background", "morning-mist");
  if (bgPreset === "custom") {
    const customUrl = stopwatch.getSetting("customBackgroundUrl", "");
    if (customUrl) {
      const heroBg = document.getElementById("heroBg");
      if (heroBg) heroBg.style.backgroundImage = `url('${customUrl}')`;
    }
  } else {
    stopwatch.setBackground(bgPreset);
  }
  // Export for debugging
  window.stopwatch = stopwatch;

  // Wire lap actions
  const copyBtn = document.getElementById("copyLapsBtn");
  const exportBtn = document.getElementById("exportLapsBtn");
  const clearBtn = document.getElementById("clearLapsBtn");
  function lapsToText() {
    if (!stopwatch.laps.length) return "";
    return stopwatch.laps
      .map((l, i) => {
        const seg = i === 0 ? l.time : l.time - stopwatch.laps[i - 1].time;
        return `Lap ${l.number}\tTotal ${stopwatch.formatTime(
          l.time
        )}\tSegment ${stopwatch.formatTimeDifference(seg)}`;
      })
      .join("\n");
  }
  copyBtn?.addEventListener("click", async () => {
    const txt = lapsToText();
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
    } catch {}
  });
  exportBtn?.addEventListener("click", () => {
    if (!stopwatch.laps.length) return;
    const header = "Lap,Total,Segment\n";
    const rows = stopwatch.laps
      .map((l, i) => {
        const seg = i === 0 ? l.time : l.time - stopwatch.laps[i - 1].time;
        return `${l.number},${stopwatch.formatTime(
          l.time
        )},${stopwatch.formatTimeDifference(seg)}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laps.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  clearBtn?.addEventListener("click", () => {
    stopwatch.laps = [];
    stopwatch.updateLaps();
    stopwatch.persistState();
  });

  // Lap search functionality
  const lapSearch = document.getElementById("lapSearch");
  lapSearch?.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const lapRows = document.querySelectorAll('.lap-row');
    
    lapRows.forEach(row => {
      const lapNumber = row.querySelector('.lap-number')?.textContent || '';
      const lapTime = row.querySelector('.lap-time')?.textContent || '';
      const lapTotal = row.querySelector('.lap-total')?.textContent || '';
      
      const searchContent = `${lapNumber} ${lapTime} ${lapTotal}`.toLowerCase();
      
      if (searchContent.includes(searchTerm)) {
        row.style.display = 'grid';
      } else {
        row.style.display = 'none';
      }
    });
  });

  // Lucide icons render pass
  try {
    if (window.lucide?.createIcons) {
      // replace any data-lucide attributes if present (future-proof)
      window.lucide.createIcons();
    }
    // Directly set dynamic icons we control
    const setSvg = (el, name, size = 22) => {
      if (!el || !window.lucide?.icons?.[name]) return;
      el.innerHTML = window.lucide.icons[name].toSvg({
        width: size,
        height: size,
      });
    };
    // Start/Pause icon placeholder exists in #startPauseIcon
    setSvg(document.getElementById("startPauseIcon"), "play", 22);
    // Lap icon
    document
      .querySelectorAll(".lap-icon")
      .forEach((icon) => setSvg(icon, "flag", 18));
    // FAB icons
    document.querySelector("#shareBtn .fab-icon") &&
      (document.querySelector("#shareBtn .fab-icon").innerHTML =
        window.lucide.icons["share-2"].toSvg({ width: 26, height: 26 }));
    document.querySelector("#fullscreenBtn .fab-icon") &&
      (document.querySelector("#fullscreenBtn .fab-icon").innerHTML =
        window.lucide.icons["maximize"].toSvg({ width: 26, height: 26 }));
    document.querySelector("#settingsToggle .fab-icon") &&
      (document.querySelector("#settingsToggle .fab-icon").innerHTML =
        window.lucide.icons["settings"].toSvg({ width: 26, height: 26 }));
    // Navbar logo
    document.querySelector(".navbar-logo") &&
      (document.querySelector(".navbar-logo").innerHTML = window.lucide.icons[
        "timer"
      ].toSvg({ width: 32, height: 32 }));
    // Share modal icon and close button
    setSvg(document.querySelector(".share-icon"), "share-2", 28);
    setSvg(document.getElementById("closeShareBtn"), "x", 18);
    setSvg(document.getElementById("copyShareLinkBtn"), "copy", 16);
    // Developer button avatar (use user icon within round btn)
    setSvg(
      document.querySelector(".developer-info-btn .developer-avatar"),
      "user",
      24
    );
  } catch {}
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
      performance: {},
    };
    this.init();
  }

  init() {
    // Monitor page load performance
    window.addEventListener("load", () => {
      this.recordLoadMetrics();
    });

    // Monitor errors
    window.addEventListener("error", (e) => {
      this.recordError("JavaScript Error", e.error, e.filename, e.lineno);
    });

    window.addEventListener("unhandledrejection", (e) => {
      this.recordError("Promise Rejection", e.reason);
    });

    // Monitor user interactions
    this.setupInteractionTracking();

    // Monitor web vitals if available
    this.setupWebVitals();
  }

  recordLoadMetrics() {
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType("navigation")[0];
      if (navigation) {
        this.metrics.performance = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          render: navigation.loadEventStart - navigation.fetchStart,
        };
      }
    }
  }

  recordError(type, error, file = "", line = 0) {
    const errorData = {
      type,
      message: error.message || error,
      file,
      line,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.metrics.errors.push(errorData);
    console.error("Performance Monitor - Error recorded:", errorData);

    // In production, you could send this to an analytics service
    // this.sendToAnalytics('error', errorData);
  }

  recordInteraction(type, element, duration = 0) {
    const interactionData = {
      type,
      element: element?.tagName || "unknown",
      elementId: element?.id || "",
      duration,
      timestamp: new Date().toISOString(),
    };

    this.metrics.interactions.push(interactionData);

    // Keep only last 50 interactions to prevent memory issues
    if (this.metrics.interactions.length > 50) {
      this.metrics.interactions = this.metrics.interactions.slice(-50);
    }
  }

  setupInteractionTracking() {
    // Track button clicks with timing
    document.addEventListener("click", (e) => {
      if (e.target.matches("button, .fab-btn, .control-btn-premium")) {
        const startTime = performance.now();
        // Record after a brief delay to capture any processing time
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          this.recordInteraction("click", e.target, duration);
        });
      }
    });

    // Track keyboard interactions
    document.addEventListener("keydown", (e) => {
      if (["Space", "KeyR", "KeyL", "Escape"].includes(e.code)) {
        this.recordInteraction("keyboard", e.target);
      }
    });
  }

  setupWebVitals() {
    // Monitor First Contentful Paint
    if (
      PerformanceObserver &&
      PerformanceObserver.supportedEntryTypes?.includes("paint")
    ) {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === "first-contentful-paint") {
            this.metrics.performance.fcp = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ["paint"] });
    }

    // Monitor Largest Contentful Paint
    if (
      PerformanceObserver &&
      PerformanceObserver.supportedEntryTypes?.includes(
        "largest-contentful-paint"
      )
    ) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.performance.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    }

    // Monitor Cumulative Layout Shift
    if (
      PerformanceObserver &&
      PerformanceObserver.supportedEntryTypes?.includes("layout-shift")
    ) {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            this.metrics.performance.cls = clsScore;
          }
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
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
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.style.setProperty("--transition-fast", "0.01ms");
  document.documentElement.style.setProperty("--transition-medium", "0.01ms");
  document.documentElement.style.setProperty("--transition-slow", "0.01ms");
}

// Battery API for performance optimization
if ("getBattery" in navigator) {
  navigator.getBattery().then((battery) => {
    // Reduce animations if battery is low
    if (battery.level < 0.2 || battery.charging === false) {
      document.documentElement.classList.add("low-power-mode");
    }

    battery.addEventListener("levelchange", () => {
      if (battery.level < 0.2) {
        document.documentElement.classList.add("low-power-mode");
      } else {
        document.documentElement.classList.remove("low-power-mode");
      }
    });
  });
}

// ================================================================================================
// INITIALIZE QUOTES MANAGER
// ================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize quotes manager
  window.quotesManager = new QuotesManager();

  // Load first quote with slight delay for better UX
  setTimeout(() => {
    window.quotesManager.loadQuote();
  }, 1500);
});

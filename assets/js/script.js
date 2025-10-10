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
// Silence console output in production per requirements
const __DEBUG__ = false;
if (!__DEBUG__) {
  ["log", "warn", "error"].forEach((m) => {
    try {
      console[m] = () => {};
    } catch {}
  });
}
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

// Global toast utility (reusable across modules)
function showToast(message) {
  try {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    // Minimal inline style fallback if CSS missing
    toast.style.position = "fixed";
    toast.style.bottom = "1.25rem";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(0,0,0,0.75)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "10px";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.transition = "opacity .2s ease";
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 250);
    }, 1800);
  } catch {}
}

// ================================================================================================
// ================================================================================================
// MOTIVATIONAL QUOTES API
// ================================================================================================
class QuotesManager {
  constructor() {
    this.quotes = [
      // Motivation & Success
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

      // Productivity & Focus
      {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss",
      },
      { text: "Progress, not perfection, is the goal.", author: "Anonymous" },
      { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
      {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
      },
      {
        text: "Time is what we want most, but what we use worst.",
        author: "William Penn",
      },
      {
        text: "You may delay, but time will not.",
        author: "Benjamin Franklin",
      },
      {
        text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        author: "Stephen Covey",
      },

      // Perseverance & Growth
      {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
      },
      {
        text: "Great things never come from comfort zones.",
        author: "Anonymous",
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      },
      {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
      },
      {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
      },
      {
        text: "A year from now you may wish you had started today.",
        author: "Karen Lamb",
      },
      {
        text: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson",
      },

      // Mindfulness & Present
      {
        text: "Yesterday is history, tomorrow is a mystery, today is a gift.",
        author: "Eleanor Roosevelt",
      },
      {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
      },
      {
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
      },
      {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
      },
      {
        text: "The present moment is the only time over which we have dominion.",
        author: "Thich Nhat Hanh",
      },
      {
        text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
        author: "Buddha",
      },

      // Achievement & Excellence
      {
        text: "Excellence is never an accident. It is always the result of high intention.",
        author: "Aristotle",
      },
      { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
      {
        text: "Strive not to be a success, but rather to be of value.",
        author: "Albert Einstein",
      },
      {
        text: "The difference between ordinary and extraordinary is that little extra.",
        author: "Jimmy Johnson",
      },
      {
        text: "Champions aren't made in gyms. Champions are made from something deep inside them.",
        author: "Muhammad Ali",
      },

      // Wisdom & Life
      {
        text: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu",
      },
      {
        text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        author: "Ralph Waldo Emerson",
      },
      { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
      {
        text: "Life is 10% what happens to you and 90% how you react to it.",
        author: "Charles R. Swindoll",
      },
      {
        text: "The mind is everything. What you think you become.",
        author: "Buddha",
      },
    ];

    this.currentQuoteIndex = Math.floor(Math.random() * this.quotes.length);
    this.init();
  }

  init() {
    this.loadRandomQuote();

    // Auto-refresh quote every 5 minutes for variety
    setInterval(() => {
      this.loadRandomQuote();
    }, 300000);

    // Load new quote on scroll
    this.setupScrollQuotes();
  }

  setupScrollQuotes() {
    let scrollTimeout;
    let lastScrollY = 0;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      // Only trigger on significant scroll movement
      if (Math.abs(currentScrollY - lastScrollY) > 50) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.loadRandomQuote();
          lastScrollY = currentScrollY;
        }, 1000); // Wait 1 second after scroll stops
      }
    });
  }

  loadRandomQuote() {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    if (!quoteText || !quoteAuthor) {
      console.warn("⚠️ Quote elements not found - DOM may not be ready");
      setTimeout(() => this.loadRandomQuote(), 1000);
      return;
    }

    // Get a random quote (different from current)
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.quotes.length);
    } while (newIndex === this.currentQuoteIndex && this.quotes.length > 1);

    this.currentQuoteIndex = newIndex;
    const quote = this.quotes[this.currentQuoteIndex];

    console.log(
      `✨ Loading random quote: "${quote.text.substring(0, 30)}..." - ${
        quote.author
      }`
    );
    this.displayQuote(quote.text, quote.author);
  }

  displayQuote(text, author) {
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");

    if (!quoteText || !quoteAuthor) return;

    // Clean up text
    const cleanText = text.replace(/["'"]/g, "").trim();
    const cleanAuthor = author || "Anonymous";

    // Enhanced fade effect with rotation and scale
    quoteText.style.opacity = "0";
    quoteAuthor.style.opacity = "0";
    quoteText.style.transform = "translateY(15px) scale(0.98)";
    quoteAuthor.style.transform = "translateY(10px) scale(0.98)";

    setTimeout(() => {
      quoteText.textContent = cleanText;
      quoteAuthor.textContent = cleanAuthor;

      // Smooth transition back
      quoteText.style.opacity = "1";
      quoteAuthor.style.opacity = "1";
      quoteText.style.transform = "translateY(0) scale(1)";
      quoteAuthor.style.transform = "translateY(0) scale(1)";
    }, 400);
  }

  // Get random quote from current collection
  getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
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
window.modalManager = modalManager; // Make globally available

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
// ENHANCED FAB & MODAL MANAGEMENT
// ================================================================================================
function initializeFABButtons() {
  // Initialize FAB Buttons and modals; with Web Share API support

  // Share Modal functionality
  const shareBtn = document.getElementById("shareBtn");
  const shareModal = document.getElementById("shareModal");
  const shareOverlay = document.getElementById("shareOverlay");
  const closeShareBtn = document.getElementById("closeShareBtn");
  const supportsWebShare =
    typeof navigator !== "undefined" && !!navigator.share;

  // Hide or disable share button if not supported
  // Keep share button visible; if Web Share unsupported, fallback to custom modal

  // Settings Modal functionality
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");

  // No-op logs removed

  // Register Share Modal with modalManager
  if (window.modalManager && shareModal && shareOverlay) {
    modalManager.registerModal(
      "shareModal",
      () => {
        shareOverlay.classList.add("active");
        shareModal.classList.add("active");
        document.body.classList.add("modal-open");
        // opened
      },
      () => {
        shareModal.classList.remove("active");
        shareOverlay.classList.remove("active");
        document.body.classList.remove("modal-open");
        // closed
      }
    );
  }

  // Share Modal Functions
  function openShareModal() {
    if (window.modalManager) {
      modalManager.openModal("shareModal");
    } else {
      // Fallback direct approach
      if (shareModal && shareOverlay) {
        shareOverlay.classList.add("active");
        shareModal.classList.add("active");
        document.body.classList.add("modal-open");
        // opened
      }
    }
  }

  function closeShareModal() {
    if (window.modalManager) {
      modalManager.closeModal("shareModal");
    } else {
      // Fallback direct approach
      if (shareModal && shareOverlay) {
        shareModal.classList.remove("active");
        shareOverlay.classList.remove("active");
        document.body.classList.remove("modal-open");
        // closed
      }
    }
  }

  // Settings Panel Functions - integrate with modalManager
  function openSettingsPanel() {
    if (window.modalManager) {
      modalManager.openModal("settingsPanel");
    } else {
      // Fallback direct approach
      if (settingsPanel && settingsOverlay) {
        settingsOverlay.classList.add("show");
        settingsPanel.classList.add("show");
        document.body.classList.add("modal-open");
        // opened
      }
    }
  }

  function closeSettingsPanel() {
    if (window.modalManager) {
      modalManager.closeModal("settingsPanel");
    } else {
      // Fallback direct approach
      if (settingsPanel && settingsOverlay) {
        settingsPanel.classList.remove("show");
        settingsOverlay.classList.remove("show");
        document.body.classList.remove("modal-open");
        // closed
      }
    }
  }


  // Robust event delegation for share/settings buttons
  document.addEventListener("click", async (e) => {
    const shareBtn = e.target.closest("#shareBtn");
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof supportsWebShare !== "undefined" && supportsWebShare && window.stopwatch) {
        try {
          const currentTime = window.stopwatch.formatTime(window.stopwatch.elapsedTime);
          await navigator.share({
            title: "My Stopwatch Time",
            text: `Time: ${currentTime}`,
            url: window.location.href,
          });
          showToast("Shared successfully");
        } catch (err) {
          showToast("Share canceled or failed");
        }
      } else {
        openShareModal();
      }
      return;
    }
    const settingsBtn = e.target.closest("#settingsToggle");
    if (settingsBtn) {
      e.preventDefault();
      e.stopPropagation();
      openSettingsPanel();
      return;
    }
  });

  // Bind Close Button Events
  if (closeShareBtn) {
    closeShareBtn.addEventListener("click", closeShareModal);
  }
  if (shareOverlay) {
    shareOverlay.addEventListener("click", closeShareModal);
  }
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettingsPanel);
  }
  if (settingsOverlay) {
    settingsOverlay.addEventListener("click", closeSettingsPanel);
  }

  // Keyboard navigation support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Let modalManager handle ESC key if available, otherwise handle directly
      if (window.modalManager && modalManager.hasActiveModal) {
        // modalManager should handle this globally
        return;
      }

      // Fallback: Close active modals on Escape
      if (shareModal && shareModal.classList.contains("active")) {
        closeShareModal();
      }
      if (settingsPanel && settingsPanel.classList.contains("show")) {
        closeSettingsPanel();
      }
    }
  });

  // complete

  // No need for setTimeout rebinding or cloneNode with event delegation

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
        if (shareUrl) {
          shareUrl.value = url;
          shareUrl.style.display = "block";
          shareUrl.select();
          shareUrl.setSelectionRange(0, url.length);
          try {
            document.execCommand("copy");
            showToast("Link copied to clipboard!");
          } catch (err2) {
            showToast("Copy failed. Please copy manually.");
          }
          shareUrl.style.display = "none";
        } else {
          showToast("Copy failed. Please copy manually.");
        }
      }
    });
  }
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

// moved showToast to global utility above

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

    // Debug element finding
    console.log("🔍 Element check:");
    console.log(
      "  lapsContainer:",
      this.lapsContainer ? "✅ Found" : "❌ Missing"
    );
    console.log("  lapsList:", this.lapsList ? "✅ Found" : "❌ Missing");

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
    this.startPauseBtn?.addEventListener("click", () => this.toggleStopwatch());
    this.lapBtn?.addEventListener("click", () => this.addLap());
    this.resetBtn?.addEventListener("click", () => this.reset());

    // Settings panel - handled by FAB initialization

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeypress(e));

    // Prevent settings panel from closing when clicking inside
    this.settingsPanel?.addEventListener("click", (e) => e.stopPropagation());
    // Trap focus inside settings panel
    this.settingsPanel?.addEventListener("keydown", (e) => {
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
    if (this.lapsContainer) this.lapsContainer.classList.add("hidden");
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
      this.lapsContainer.classList.add("hidden");
    }
    document.body.classList.remove("laps-open");
    if (this.timeDisplay) this.timeDisplay.classList.remove("running");
    this.playSound("reset");
    this.vibrate();
    this.persistState(true);
    showToast("Stopwatch reset");
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
      showToast("Lap added");
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

    // updated laps


    if (this.laps.length === 0) {
      if (this.lapsContainer) {
        this.lapsContainer.classList.add("hidden");
      }
      document.body.classList.remove("laps-open");
      if (this.lapsList) {
        this.lapsList.innerHTML = `
          <li class="laps-empty" id="lapsEmptyMsg" role="status" aria-live="polite">
            <span class="laps-empty-icon">🏁</span>
            <span class="laps-empty-title">No lap times yet</span>
            <span class="laps-empty-desc">Start timing and press lap to begin!</span>
          </li>
        `;
      }
      return;
    }

    if (this.lapsContainer) {
      this.lapsContainer.classList.remove("hidden");
      // Clear any inline display style to ensure CSS takes control
      this.lapsContainer.style.display = "";
    }
    document.body.classList.add("laps-open");
    if (!this.lapsList) return;

    // Full re-render (always, for accessibility and event delegation)
    const frag = document.createDocumentFragment();
    const reversedLaps = [...this.laps].reverse();
    this.lapsList.innerHTML = "";
    reversedLaps.forEach((lap, idx) => {
      frag.appendChild(this._renderMegaLapLi(lap, this.laps.length - 1 - idx));
    });
    this.lapsList.appendChild(frag);

    // Event delegation for copy buttons
    this.lapsList.removeEventListener('click', this._lapListClickHandler);
    this._lapListClickHandler = (e) => {
      const btn = e.target.closest('.lap-copy-btn');
      if (btn) {
        const li = btn.closest('li[data-lap-index]');
        if (!li) return;
        const idx = parseInt(li.getAttribute('data-lap-index'), 10);
        const lap = this.laps[idx];
        if (!lap) return;
        const segment = idx === 0 ? lap.time : lap.time - this.laps[idx - 1].time;
        const text = `Lap ${lap.number}: ${this.formatTime(segment)} (Total: ${this.formatTime(lap.time)})`;
        this._copyToClipboard(text);
      }
    };
    this.lapsList.addEventListener('click', this._lapListClickHandler);
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
      const average =
        segmentTimes.reduce((a, b) => a + b, 0) / segmentTimes.length;
      avgLap.textContent = this.formatTime(average);
    }

    // Last lap
    if (lastLap) {
      const lastSegment = segmentTimes[segmentTimes.length - 1];
      lastLap.textContent = this.formatTime(lastSegment);
    }
  }

  _renderMegaLapLi(lap, originalIndex) {
    // <li> for semantic, role, and accessibility
    const li = document.createElement('li');
    li.className = "flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 group animate-slide-in";
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '-1');
    li.setAttribute('data-lap-index', originalIndex);
    // Calculate segment time once for ARIA and logic
    let segmentTime = lap.time;
    if (originalIndex > 0 && this.laps[originalIndex - 1]) {
      segmentTime = lap.time - this.laps[originalIndex - 1].time;
    }
    li.setAttribute('aria-label', `Lap ${lap.number}, segment ${this.formatTime(segmentTime)}, total ${this.formatTime(lap.time)}`);

    // ...segmentTime already calculated above...

    // Difference calculation with bounds check
    let diffClass = "text-white/60";
    let diffText = "--";
    if (originalIndex > 0 && this.laps[originalIndex - 1]) {
      let prevSegTime = this.laps[originalIndex - 1].time;
      if (originalIndex > 1 && this.laps[originalIndex - 2]) {
        prevSegTime = this.laps[originalIndex - 1].time - this.laps[originalIndex - 2].time;
      }
      const delta = segmentTime - prevSegTime;
      // Use a 50ms threshold, but could be made configurable
      if (delta < -50) {
        diffClass = "text-green-400";
        diffText = `-${this.formatTimeDifference(-delta)}`;
      } else if (delta > 50) {
        diffClass = "text-red-400";
        diffText = `+${this.formatTimeDifference(delta)}`;
      } else {
        diffText = "±0.0s";
      }
    }

    // Build DOM safely (no innerHTML for user data)
    const left = document.createElement('div');
    left.className = 'flex items-center gap-4 flex-1';
    const num = document.createElement('div');
    num.className = 'flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-full text-sm font-bold';
    num.textContent = lap.number;
    const mid = document.createElement('div');
    mid.className = 'flex-1';
    const seg = document.createElement('div');
    seg.className = 'text-white font-space font-semibold';
    seg.textContent = this.formatTime(segmentTime);
    const tot = document.createElement('div');
    tot.className = 'text-xs text-white/50 font-inter';
    tot.textContent = `Total: ${this.formatTime(lap.time)}`;
    mid.appendChild(seg);
    mid.appendChild(tot);
    left.appendChild(num);
    left.appendChild(mid);

    const right = document.createElement('div');
    right.className = 'flex items-center gap-3';
    const diff = document.createElement('div');
    diff.className = `text-sm font-inter ${diffClass} hidden sm:block`;
    diff.textContent = diffText;
    right.appendChild(diff);
    const copyBtn = document.createElement('button');
    copyBtn.className = 'p-1.5 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 lap-copy-btn';
    copyBtn.setAttribute('type', 'button');
    copyBtn.setAttribute('title', 'Copy lap time');
    copyBtn.setAttribute('aria-label', `Copy Lap ${lap.number} time`);
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/60 hover:text-white"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    right.appendChild(copyBtn);

    li.appendChild(left);
    li.appendChild(right);
    return li;
  }

  _copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast('Lap copied'), () => showToast('Copy failed'));
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast('Lap copied');
      } catch (err) {
        showToast('Copy failed');
      }
      document.body.removeChild(textarea);
    }
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
        this.flashButton(this.startPauseBtn);
        break;
      case "KeyR":
        event.preventDefault();
        this.reset();
        this.flashButton(this.resetBtn);
        break;
      case "KeyL":
        event.preventDefault();
        if (this.isRunning || this.elapsedTime > 0) {
          this.addLap();
          this.flashButton(this.lapBtn);
        }
        break;
      case "KeyQ":
        event.preventDefault();
        // Get new random quote
        if (window.quotesManager) {
          window.quotesManager.loadRandomQuote();
          console.log("🔄 New random quote loaded via keyboard shortcut");
        }
        break;
      case "Escape":
        // ESC key is now handled globally by modalManager
        // This prevents duplicate handling and conflicts
        break;
    }
  }

  // Visual feedback for keyboard shortcuts
  flashButton(button) {
    if (!button) return;
    button.style.transform = "scale(0.95)";
    button.style.transition = "transform 0.1s ease";
    setTimeout(() => {
      button.style.transform = "";
      button.style.transition = "";
    }, 100);
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
// Removed duplicate initialization block to prevent multiple Stopwatch instances

// ================================================================================================
// PERFORMANCE MONITORING & ERROR HANDLING
// ================================================================================================
class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.metrics = { errors: [], interactions: [], performance: {} };
    this.init();
  }

  init() {
    window.addEventListener("load", () => {
      this.recordLoadMetrics();
    });

    window.addEventListener("error", (e) => {
      this.recordError("JavaScript Error", e.error, e.filename, e.lineno);
    });

    window.addEventListener("unhandledrejection", (e) => {
      this.recordError("Promise Rejection", e.reason);
    });

    this.setupInteractionTracking();
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
      message: error?.message || error,
      file,
      line,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.metrics.errors.push(errorData);
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
    if (this.metrics.interactions.length > 50) {
      this.metrics.interactions = this.metrics.interactions.slice(-50);
    }
  }

  setupInteractionTracking() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, .fab-btn, .control-btn-premium");
      if (target) {
        const startTime = performance.now();
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          this.recordInteraction("click", target, duration);
        });
      }
    });

    document.addEventListener("keydown", (e) => {
      if (["Space", "KeyR", "KeyL", "Escape"].includes(e.code)) {
        this.recordInteraction("keyboard", e.target);
      }
    });
  }

  setupWebVitals() {
    if (
      typeof PerformanceObserver !== "undefined" &&
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

    if (
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes?.includes(
        "largest-contentful-paint"
      )
    ) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) this.metrics.performance.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    }

    if (
      typeof PerformanceObserver !== "undefined" &&
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

  sendToAnalytics(type, data) {
    // placeholder
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
// INITIALIZE APPLICATION WITH ENHANCED ERROR HANDLING
// ================================================================================================
// Single-run app initializer (creates Stopwatch, Settings, modals, and actions)
function initializeApp() {
  try {
    if (window.__APP_INITIALIZED__) return;
    window.__APP_INITIALIZED__ = true;

    // Core instances
    const stopwatch = new Stopwatch();
    window.stopwatch = stopwatch;
    window.quotesManager = new QuotesManager();

    // Settings manager (binds settings UI to stopwatch)
    const settingsManager = new SettingsManager(stopwatch);
    window.settingsManager = settingsManager;

    // Register Settings panel with modal manager (for proper show/hide + scroll lock)
    const settingsPanel = document.getElementById("settingsPanel");
    const settingsOverlay = document.getElementById("settingsOverlay");
    if (settingsPanel && settingsOverlay && window.modalManager) {
      modalManager.registerModal(
        "settingsPanel",
        () => {
          settingsOverlay.classList.add("show");
          settingsPanel.classList.add("show");
          document.body.classList.add("modal-open");
        },
        () => {
          settingsPanel.classList.remove("show");
          settingsOverlay.classList.remove("show");
          document.body.classList.remove("modal-open");
        }
      );
    }

    // Initialize FAB buttons (share/settings/fullscreen + modals)
    initializeFABButtons();

    // Wire Lap actions (copy/export/clear)
    const copyLapsBtn = document.getElementById("copyLapsBtn");
    if (copyLapsBtn) {
      copyLapsBtn.addEventListener("click", async () => {
        if (!stopwatch || stopwatch.laps.length === 0) {
          showToast("No laps to copy");
          return;
        }
        const lines = stopwatch.laps.map((lap, i) => {
          const segment = i === 0 ? lap.time : lap.time - stopwatch.laps[i - 1].time;
          return `Lap ${lap.number}: ${stopwatch.formatTime(segment)} (Total: ${stopwatch.formatTime(lap.time)})`;
        });
        try {
          await navigator.clipboard.writeText(lines.join("\n"));
          showToast("Laps copied");
        } catch (_) {
          showToast("Copy failed");
        }
      });
    }

    const exportLapsBtn = document.getElementById("exportLapsBtn");
    if (exportLapsBtn) {
      exportLapsBtn.addEventListener("click", () => {
        if (!stopwatch || stopwatch.laps.length === 0) {
          showToast("No laps to export");
          return;
        }
        const header = ["Lap", "Segment", "Total"]; 
        const rows = stopwatch.laps.map((lap, i) => {
          const segment = i === 0 ? lap.time : lap.time - stopwatch.laps[i - 1].time;
          return [
            lap.number,
            stopwatch.formatTime(segment),
            stopwatch.formatTime(lap.time),
          ];
        });
        const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laps-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("CSV exported");
      });
    }

    const clearLapsBtn = document.getElementById("clearLapsBtn");
    if (clearLapsBtn) {
      clearLapsBtn.addEventListener("click", () => {
        if (!stopwatch) return;
        if (stopwatch.laps.length === 0) {
          showToast("No laps to clear");
          return;
        }
        stopwatch.laps = [];
        stopwatch.updateLaps();
        stopwatch.persistState();
        showToast("Laps cleared");
      });
    }

    // Optional: initialize Lucide if available
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch {}
    }

  } catch (e) {
    // In production, console is silenced; still try to surface a toast
    try { showToast("Initialization error"); } catch {}
  }
}

// Multiple initialization strategies for maximum compatibility
document.addEventListener("DOMContentLoaded", initializeApp);

// Fallback for late initialization
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  setTimeout(initializeApp, 100);
}

// Final fallback
window.addEventListener("load", () => {
  if (!window.stopwatch || !window.quotesManager) {
    initializeApp();
  }
});

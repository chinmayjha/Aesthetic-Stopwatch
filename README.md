# ⏱️ Aesthetic Stopwatch

<div align="center">

![Aesthetic Stopwatch](https://img.shields.io/badge/Aesthetic-Stopwatch-66a6ff?style=for-the-badge&logo=clockify&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-success?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)
![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-orange?style=for-the-badge)

**A beautiful, minimal, glassmorphic stopwatch for timing, productivity, and workouts**

[🚀 Live Demo](https://stopwatch.chinmayjha.tech) • [📱 Install as App](https://stopwatch.chinmayjha.tech) • [🐛 Report Bug](https://github.com/chinmayjha/Aesthetic-Stopwatch/issues)

</div>

---

## ✨ Features

### 🎨 **Design & Experience**
- **Glassmorphic UI** – Modern blur, transparency, and beautiful gradients
- **Responsive Design** – Mobile-first, optimized for phones, tablets (landscape/portrait), and desktops
- **Custom Backgrounds** – Upload your own images or use presets
- **Modern Share Modal** – Redesigned, with social and copy options
- **Smooth Animations** – 60fps performance

### ⚡ **Performance & PWA**
- **PWA Support** – Install as a native app
- **Offline Ready** – Works without internet
- **Battery Optimization** – Smart power management
- **Keyboard Shortcuts** – Fast navigation
- **Audio & Haptics** – Rich feedback

### 💡 **Motivational Quotes**
- **Live Quotes** – Fetches motivational quotes from a live API (with fallback)
- **Hide/Show Quotes** – Toggle motivational quotes in the settings panel (Display Options)

### 🎯 **Core Functionality**
- ⏱️ **Precision Timing** – Accurate to milliseconds
- 🏁 **Lap Tracking** – Record and compare splits
- 📤 **Lap Actions** – Copy to clipboard, export CSV, clear all
- 🎵 **Sound Effects** – Customizable audio feedback
- 📳 **Haptic Feedback** – Tactile responses on mobile
- ⌨️ **Keyboard Controls** – Space (start/stop), R (reset), L (lap)
- 📱 **Share Results** – Easy sharing with one click

---

## 🚀 Quick Start

### 💻 **Local Development**

```bash
# Clone the repository
git clone https://github.com/chinmayjha/Aesthetic-Stopwatch.git

# Navigate to project directory
cd Aesthetic-Stopwatch

# Open in your preferred server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server
# Install Live Server extension and click "Go Live"
```

### 📱 **Install as App**

1. **Desktop**: Visit [stopwatch.chinmayjha.tech](https://stopwatch.chinmayjha.tech)
2. **Chrome**: Click the install icon in the address bar
3. **Safari**: Add to Home Screen
4. **Mobile**: "Add to Home Screen" from browser menu

---

## 📁 Project Structure

```
Aesthetic-Stopwatch/
├── 📄 index.html                 # Main application
├── 📄 404.html                   # Beautiful error page  
├── 📄 README.md                  # You are here
│
├── 📁 assets/                    # Static resources
│   ├── 📁 css/
│   │   └── 🎨 styles.css         # Glassmorphic styling
│   ├── 📁 js/
│   │   ├── ⚡ script.js          # Main application logic
│   │   └── 🔧 sw.js              # Service worker
│   └── 📁 icons/
│       └── 🖼️ favicon.svg        # App icons
│
└── 📁 config/                    # Configuration
    ├── ⚙️ manifest.json          # PWA manifest
    ├── 🤖 robots.txt             # SEO configuration
    ├── 🗺️ sitemap.xml             # Site structure
    └── 🛡️ _headers               # Security headers
```

---

## 🎮 Usage Guide

### ⌨️ **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| `Space` | Start/Stop timer |
| `R` | Reset timer |
| `L` | Add lap |
| `Esc` | Close modals |

### 🎨 **Customization**

1. **Themes**: Click settings → Choose Light/Dark/Auto
2. **Backgrounds**: Select from presets or upload custom image
3. **Sound**: Toggle audio feedback in settings
4. **Haptics**: Enable vibration on mobile devices

---

## 🛠️ Technical Details

### 🏗️ **Architecture**

- **Modular Design** - Organized class-based structure
- **Modal Management** - Centralized system preventing conflicts
- **Performance Monitoring** - Built-in metrics and error tracking
- **Progressive Enhancement** - Works without JavaScript

### 📊 **Browser Support**

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |

### ⚡ **Performance**

- **Zero-lag UI**: Timer display throttled to once/sec rendering to avoid DOM thrash
- **Accurate core**: High-res clock using performance.now() with drift-free pause/resume
- **Work-efficient laps**: DocumentFragment + prepend for O(1) new laps

---

## 🔧 Development

### 🚀 **Getting Started**

```bash
# Install development dependencies (optional)
npm install -g live-server

# Start development server
live-server --port=3000

# Open in browser
# http://localhost:3000
```

### 🧪 **Testing**

```bash
# Test PWA features
npx pwa-asset-generator

# Validate HTML
npx html-validate index.html

# Check accessibility
npx pa11y https://localhost:3000
```

### 📦 **Building**

```bash
# Optimize images
npx imagemin assets/icons/* --out-dir=dist/icons

# Minify CSS
npx cleancss -o dist/styles.min.css assets/css/styles.css

# Minify JavaScript
npx terser assets/js/script.js -o dist/script.min.js
```

---

## 🌟 Contributing

We love contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** your feature branch: `git checkout -b amazing-feature`
3. **💝 Commit** your changes: `git commit -m 'Add amazing feature'`
4. **🚀 Push** to branch: `git push origin amazing-feature`
5. **🎉 Open** a Pull Request

### 🐛 **Bug Reports**

Found a bug? Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## � License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Chinmay Jha**

[![Website](https://img.shields.io/badge/Website-chinmayjha.tech-blue?style=flat-square&logo=google-chrome)](https://chinmayjha.tech)
[![Email](https://img.shields.io/badge/Email-chinmayjha2021@gmail.com-red?style=flat-square&logo=gmail)](mailto:chinmayjha2021@gmail.com)

*16-year-old developer passionate about creating beautiful, functional web applications*

</div>

---

## 🎯 Roadmap

- [ ] 🌍 **Multi-language Support** - Internationalization
- [ ] 📊 **Analytics Dashboard** - Timing insights and stats
- [ ] 🔗 **Team Features** - Collaborative timing sessions
- [ ] 🎨 **Theme Store** - Community-created themes
- [ ] ⏰ **Preset Timers** - Pomodoro, workout intervals
- [ ] 📱 **Mobile App** - Native iOS/Android versions

---

## ⭐ Support

If you found this project helpful:

- ⭐ **Star** this repository
- 🐦 **Share** on social media
- 💝 **Sponsor** development
- 🍕 [**Buy me a pizza**](https://buymeacoffee.com/chinmayjha) (I'm 16, coffee isn't my thing yet!)

---

<div align="center">

**Made with ❤️ by [Chinmay](https://chinmayjha.tech)**

*Crafting digital experiences one pixel at a time*

</div>
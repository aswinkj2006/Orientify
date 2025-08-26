# Orientation-Based Mobile Web App
## "Prompt This Into Existence!" Hackathon Submission

A stunning mobile-first web application that adapts its functionality based on device orientation, featuring Apple's Liquid Glass design aesthetic.

## 🌟 Features

### Orientation-Based Components
- **Portrait (Upright)** → **Alarm Clock** - Set alarms and view current time
- **Landscape (Right)** → **Stopwatch** - High-precision timing with lap functionality  
- **Portrait (Upside Down)** → **Timer** - Countdown timer with custom duration
- **Landscape (Left)** → **Weather** - Real-time weather data with location detection

### Design Highlights
- **Liquid Glass UI** - Apple-inspired glassmorphism design
- **Smooth Transitions** - Seamless orientation change animations
- **Mobile-First** - Optimized for touch interaction
- **Responsive** - Works perfectly on all screen sizes
- **Cross-Platform** - Compatible with Android and iOS browsers

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
3. **Configure your API keys** in `.env.local`:
   ```env
   WEATHER_API_KEY=your_actual_openweathermap_api_key
   ```
4. **Open `index.html`** in a modern web browser

### Environment Setup Options

#### Option 1: Local Development (.env.local file)
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your API keys
WEATHER_API_KEY=your_openweathermap_api_key_here
DEBUG_MODE=true
```

#### Option 2: Browser Local Storage (Testing)
```javascript
// Set in browser console for testing
localStorage.setItem('ENV_WEATHER_API_KEY', 'your_api_key');
localStorage.setItem('ENV_DEBUG_MODE', 'true');
```

#### Option 3: Meta Tags (Production Deployment)
```html
<!-- Add to <head> section for production -->
<meta name="env-weather_api_key" content="your_api_key">
<meta name="env-debug_mode" content="false">
```

## 📱 How to Use

### Testing Orientation Changes
- **Desktop**: Use browser developer tools to simulate device rotation
- **Mobile**: Simply rotate your device to see different components

### Component Functions

#### 🕐 Alarm Clock (Portrait Upright)
- View current time and date
- Set custom alarm times
- Receive alarm notifications

#### ⏱️ Stopwatch (Landscape Right)  
- Start/stop timing
- Record lap times
- High precision (centisecond accuracy)

#### ⏲️ Timer (Portrait Upside Down)
- Set custom countdown duration
- Start/pause/reset functionality
- Completion notifications

#### 🌤️ Weather (Landscape Left)
- Automatic location detection
- Real-time weather data
- Temperature, humidity, and conditions

## 🛠️ Technical Implementation

### Orientation Detection
- Uses `Screen Orientation API` for modern browsers
- Falls back to `orientationchange` events
- Enhanced with `DeviceOrientation API` for precision

### Weather API Integration
- **Service**: OpenWeatherMap API (free tier)
- **Fallback**: Mock data when API unavailable
- **Geolocation**: Automatic location detection

### Performance Features
- **Smooth animations** with CSS transitions
- **Optimized rendering** with GPU acceleration
- **Touch-friendly** interface with haptic feedback
- **Memory efficient** with proper cleanup

## 🎨 Design System

### Liquid Glass Aesthetic
- **Glassmorphism effects** with backdrop blur
- **Subtle animations** and micro-interactions
- **Apple-inspired typography** (SF Pro Display)
- **Gradient backgrounds** with depth
- **Responsive glass cards** that adapt to content

### Color Palette
- **Primary**: Glass transparency with white accents
- **Background**: Dynamic gradient (purple to blue)
- **Accent**: iOS blue (#007AFF) for primary actions
- **Text**: High contrast white with opacity variations

## 📋 Browser Compatibility

### Fully Supported
- **iOS Safari** 12+
- **Chrome Mobile** 80+
- **Firefox Mobile** 75+
- **Samsung Internet** 12+

### Desktop Testing
- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🔧 Development Notes

### File Structure
```
├── index.html          # Main HTML structure
├── styles.css          # Liquid Glass styling
├── script.js           # App logic and orientation handling
├── config.js           # Environment variable management
├── .env                # Environment variables template
├── .env.example        # Example environment file
├── .gitignore          # Git ignore rules
└── README.md           # Documentation
```

### Environment Variable Management

The app uses a flexible configuration system that supports multiple deployment scenarios:

#### Development
- Use `.env.local` file for local development
- Variables are loaded via the `config.js` module
- Debug mode available for troubleshooting

#### Production Deployment
- **Netlify/Vercel**: Use environment variables in dashboard
- **Static hosting**: Use meta tags or build-time injection
- **CDN**: Pre-configure variables in `config.js`

#### Security Features
- API keys never exposed in source code
- `.gitignore` protects sensitive files
- Multiple fallback methods for configuration

### Key Technologies
- **Vanilla JavaScript** - No dependencies
- **CSS3** - Advanced animations and glassmorphism
- **Web APIs** - Orientation, Geolocation, Weather
- **Progressive Enhancement** - Graceful fallbacks

## 🏆 Hackathon Requirements Met

✅ **Mobile-first design** - Optimized for mobile devices  
✅ **Responsive & touch-friendly** - Perfect touch interactions  
✅ **Orientation detection** - All 4 orientations supported  
✅ **Browser-only** - No native app required  
✅ **Cross-platform** - Android & iOS compatible  
✅ **Weather API integration** - Real-time weather data  
✅ **Seamless transitions** - Smooth orientation changes  

## 🎯 Demo Instructions

1. **Open on mobile device** or use browser dev tools
2. **Rotate device** to see different components:
   - Hold upright → Alarm Clock
   - Rotate right → Stopwatch  
   - Flip upside down → Timer
   - Rotate left → Weather
3. **Interact with each component** to test functionality
4. **Notice smooth transitions** between orientations

## 🔑 API Setup (Optional)

For live weather data:
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key
4. Replace `demo_key` in `script.js` with your key

Without API key, the app shows mock weather data.

## 🚀 Deployment Ready

This app is ready for immediate deployment to any static hosting service:
- **Netlify** - Drag and drop deployment
- **Vercel** - Git integration
- **GitHub Pages** - Direct from repository
- **Firebase Hosting** - Google's platform

---

**Built with ❤️ for the "Prompt This Into Existence!" Hackathon**

class OrientationApp {
    constructor() {
        this.currentOrientation = null;
        this.components = {
            'portrait-primary': document.getElementById('alarm-clock'),
            'landscape-primary': document.getElementById('stopwatch'),
            'portrait-secondary': document.getElementById('timer'),
            'landscape-secondary': document.getElementById('weather')
        };
        
        // App state
        this.alarmTime = null;
        this.stopwatchRunning = false;
        this.stopwatchTime = 0;
        this.stopwatchInterval = null;
        this.lapCounter = 0;
        this.timerRunning = false;
        this.timerTime = 300; // 5 minutes default
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.setupOrientationDetection();
        this.setupAlarmClock();
        this.setupStopwatch();
        this.setupTimer();
        this.setupWeather();
        this.updateCurrentTime();
        this.detectInitialOrientation();
    }

    setupOrientationDetection() {
        // Screen orientation API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(() => this.handleOrientationChange(), 100);
            });
        }
        
        // Fallback for older browsers
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        // Device orientation API for more precise detection
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.handleDeviceOrientation(event);
            });
        }
    }

    detectInitialOrientation() {
        this.handleOrientationChange();
    }

    handleOrientationChange() {
        const orientation = this.getOrientation();
        if (orientation !== this.currentOrientation) {
            this.currentOrientation = orientation;
            this.switchComponent(orientation);
            this.updateDebugInfo();
        }
    }

    handleDeviceOrientation(event) {
        // Use device orientation for more precise detection
        const { beta, gamma } = event;
        
        // Update debug info with device orientation
        document.getElementById('debug-angle').textContent = 
            `β:${Math.round(beta)}° γ:${Math.round(gamma)}°`;
    }

    getOrientation() {
        const angle = screen.orientation ? screen.orientation.angle : window.orientation;
        
        switch (angle) {
            case 0:
                return 'portrait-primary'; // Normal portrait
            case 90:
                return 'landscape-primary'; // Rotated left (landscape)
            case 180:
                return 'portrait-secondary'; // Upside down
            case -90:
            case 270:
                return 'landscape-secondary'; // Rotated right (landscape)
            default:
                // Fallback based on window dimensions
                return window.innerHeight > window.innerWidth ? 'portrait-primary' : 'landscape-primary';
        }
    }

    switchComponent(orientation) {
        // Hide all components
        Object.values(this.components).forEach(component => {
            component.classList.remove('active');
            setTimeout(() => component.classList.add('hidden'), 300);
        });

        // Show the appropriate component
        const targetComponent = this.components[orientation];
        if (targetComponent) {
            setTimeout(() => {
                targetComponent.classList.remove('hidden');
                setTimeout(() => targetComponent.classList.add('active'), 50);
            }, 300);
        }
    }

    updateDebugInfo() {
        document.getElementById('debug-orientation').textContent = this.currentOrientation;
    }

    // Alarm Clock Functions
    setupAlarmClock() {
        const setAlarmBtn = document.getElementById('set-alarm-btn');
        const clearAlarmBtn = document.getElementById('clear-alarm-btn');
        
        setAlarmBtn.addEventListener('click', () => this.setAlarm());
        clearAlarmBtn.addEventListener('click', () => this.clearAlarm());
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('current-time').textContent = timeString;
        document.getElementById('current-date').textContent = dateString;
        
        // Check alarm
        if (this.alarmTime && timeString === this.alarmTime) {
            this.triggerAlarm();
        }
    }

    setAlarm() {
        const time = prompt('Set alarm time (HH:MM format):', '07:00');
        if (time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            this.alarmTime = time + ':00';
            document.getElementById('alarm-time').textContent = time;
            document.getElementById('alarm-time-display').classList.remove('hidden');
        }
    }

    clearAlarm() {
        this.alarmTime = null;
        document.getElementById('alarm-time-display').classList.add('hidden');
    }

    triggerAlarm() {
        alert('⏰ Alarm! Time to wake up!');
        this.clearAlarm();
    }

    // Stopwatch Functions
    setupStopwatch() {
        const startStopBtn = document.getElementById('start-stop-btn');
        const lapResetBtn = document.getElementById('lap-reset-btn');
        
        startStopBtn.addEventListener('click', () => this.toggleStopwatch());
        lapResetBtn.addEventListener('click', () => this.lapOrReset());
    }

    toggleStopwatch() {
        const startStopBtn = document.getElementById('start-stop-btn');
        const lapResetBtn = document.getElementById('lap-reset-btn');
        
        if (this.stopwatchRunning) {
            this.stopStopwatch();
            startStopBtn.textContent = 'Start';
            lapResetBtn.textContent = 'Reset';
        } else {
            this.startStopwatch();
            startStopBtn.textContent = 'Stop';
            lapResetBtn.textContent = 'Lap';
        }
    }

    startStopwatch() {
        this.stopwatchRunning = true;
        this.stopwatchInterval = setInterval(() => {
            this.stopwatchTime += 10;
            this.updateStopwatchDisplay();
        }, 10);
    }

    stopStopwatch() {
        this.stopwatchRunning = false;
        if (this.stopwatchInterval) {
            clearInterval(this.stopwatchInterval);
        }
    }

    lapOrReset() {
        if (this.stopwatchRunning) {
            this.addLap();
        } else {
            this.resetStopwatch();
        }
    }

    addLap() {
        this.lapCounter++;
        const lapTime = this.formatTime(this.stopwatchTime);
        const lapElement = document.createElement('div');
        lapElement.className = 'lap-time';
        lapElement.innerHTML = `<span>Lap ${this.lapCounter}</span><span>${lapTime}</span>`;
        document.getElementById('lap-times').appendChild(lapElement);
    }

    resetStopwatch() {
        this.stopwatchTime = 0;
        this.lapCounter = 0;
        document.getElementById('lap-times').innerHTML = '';
        this.updateStopwatchDisplay();
    }

    updateStopwatchDisplay() {
        document.getElementById('stopwatch-time').textContent = this.formatTime(this.stopwatchTime);
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    // Timer Functions
    setupTimer() {
        const startTimerBtn = document.getElementById('start-timer-btn');
        const resetTimerBtn = document.getElementById('reset-timer-btn');
        const minutesInput = document.getElementById('timer-minutes');
        const secondsInput = document.getElementById('timer-seconds');
        
        startTimerBtn.addEventListener('click', () => this.toggleTimer());
        resetTimerBtn.addEventListener('click', () => this.resetTimer());
        
        minutesInput.addEventListener('change', () => this.updateTimerFromInputs());
        secondsInput.addEventListener('change', () => this.updateTimerFromInputs());
        
        this.updateTimerDisplay();
    }

    updateTimerFromInputs() {
        const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
        this.timerTime = (minutes * 60) + seconds;
        this.updateTimerDisplay();
    }

    toggleTimer() {
        const startTimerBtn = document.getElementById('start-timer-btn');
        
        if (this.timerRunning) {
            this.stopTimer();
            startTimerBtn.textContent = 'Start';
        } else {
            this.startTimer();
            startTimerBtn.textContent = 'Pause';
        }
    }

    startTimer() {
        if (this.timerTime <= 0) return;
        
        this.timerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timerTime--;
            this.updateTimerDisplay();
            
            if (this.timerTime <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    stopTimer() {
        this.timerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    resetTimer() {
        this.stopTimer();
        this.timerTime = 300; // Reset to 5 minutes
        document.getElementById('timer-minutes').value = 5;
        document.getElementById('timer-seconds').value = 0;
        document.getElementById('start-timer-btn').textContent = 'Start';
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerTime / 60);
        const seconds = this.timerTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-time').textContent = timeString;
    }

    timerComplete() {
        this.stopTimer();
        document.getElementById('start-timer-btn').textContent = 'Start';
        alert('⏰ Timer finished!');
        this.resetTimer();
    }

    // Weather Functions
    setupWeather() {
        this.getWeatherData();
    }

    async getWeatherData() {
        try {
            // Check if we have a valid API key
            if (!window.AppConfig.hasWeatherApiKey()) {
                console.warn('No valid weather API key configured, using mock data');
                this.displayMockWeatherData();
                return;
            }

            // Get user's location
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            // Use configured weather API
            const weatherUrl = window.AppConfig.getWeatherApiUrl(latitude, longitude);
            const response = await fetch(weatherUrl);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayWeatherData(data);
            
        } catch (error) {
            console.error('Weather error:', error);
            this.displayMockWeatherData();
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
        });
    }

    displayWeatherData(data) {
        const weatherIcon = this.getWeatherIcon(data.weather[0].main);
        
        document.getElementById('weather-loading').classList.add('hidden');
        document.getElementById('weather-content').classList.remove('hidden');
        
        document.getElementById('weather-icon').textContent = weatherIcon;
        document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}°`;
        document.getElementById('weather-description').textContent = data.weather[0].description;
        document.getElementById('weather-location').textContent = data.name;
        document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    }

    displayMockWeatherData() {
        // Fallback mock data for demo purposes
        document.getElementById('weather-loading').classList.add('hidden');
        document.getElementById('weather-content').classList.remove('hidden');
        
        document.getElementById('weather-icon').textContent = '☀️';
        document.getElementById('weather-temp').textContent = '24°';
        document.getElementById('weather-description').textContent = 'sunny';
        document.getElementById('weather-location').textContent = 'Your Location';
        document.getElementById('feels-like').textContent = '26°';
        document.getElementById('humidity').textContent = '65%';
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️'
        };
        
        return icons[condition] || '🌤️';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OrientationApp();
});

// Handle visibility changes to pause/resume timers
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App is hidden, could pause non-essential timers
        console.log('App hidden');
    } else {
        // App is visible again
        console.log('App visible');
    }
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Add haptic feedback for supported devices
function hapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Add haptic feedback to all buttons
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('glass-button')) {
        hapticFeedback();
    }
});

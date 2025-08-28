class OrientifyApp {
    constructor() {
        this.currentOrientation = null;
        this.components = {};
        
        // Initialize components after DOM is ready
        setTimeout(() => {
            this.components = {
                'portrait-primary': document.getElementById('alarm-clock'),
                'landscape-primary': document.getElementById('stopwatch'),
                'portrait-secondary': document.getElementById('timer'),
                'landscape-secondary': document.getElementById('weather')
            };
            console.log('Components initialized:', this.components);
            
            // Force show alarm clock initially
            this.forceShowAlarmClock();
        }, 50);
        
        // App state
        this.alarms = [];
        this.timers = [];
        this.weatherLocations = [];
        this.temperatureUnit = 'celsius';
        this.stopwatchRunning = false;
        this.stopwatchTime = 0;
        this.stopwatchInterval = null;
        this.lapTimes = [];
        this.activeAlarm = null;
        this.snoozeTimeout = null;
        this.triggeredAlarms = new Set(); // Track already triggered alarms
        
        this.init();
    }

    forceShowAlarmClock() {
        // Hide all components first
        Object.values(this.components).forEach(component => {
            if (component) {
                component.classList.add('hidden');
                component.classList.remove('active');
            }
        });
        
        const alarmClock = document.getElementById('alarm-clock');
        console.log('Alarm clock element:', alarmClock);
        
        if (alarmClock) {
            // Remove all classes and force show
            alarmClock.className = 'component alarm-clock active';
            alarmClock.style.display = 'flex';
            alarmClock.style.opacity = '1';
            alarmClock.style.visibility = 'visible';
            console.log('Alarm clock forced to show');
        } else {
            console.error('Alarm clock element not found!');
        }
    }

    init() {
        this.loadStoredData();
        this.setupOrientationDetection();
        this.startAlarmChecker();
        this.startClock();
        
        // Setup components after DOM is ready
        setTimeout(() => {
            this.setupAlarmClock();
            this.setupStopwatch();
            this.setupTimer();
            this.setupWeather();
            
            const initialOrientation = this.getOrientation();
            console.log('Initial orientation detected:', initialOrientation);
            this.switchComponent(initialOrientation);
        }, 200);
    }

    setupOrientationDetection() {
        // Screen orientation API (most reliable for modern devices)
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                console.log('Screen orientation changed');
                setTimeout(() => this.handleOrientationChange(), 150);
            });
        }
        
        // Orientation change event (iOS Safari and older browsers)
        window.addEventListener('orientationchange', () => {
            console.log('Window orientation changed');
            setTimeout(() => this.handleOrientationChange(), 150);
        });
        
        // Resize event as additional trigger (for when orientation APIs fail)
        window.addEventListener('resize', () => {
            console.log('Window resized');
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        // Visual viewport API for better mobile detection
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                console.log('Visual viewport changed');
                setTimeout(() => this.handleOrientationChange(), 100);
            });
        }
        
        // Device orientation API for debugging
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
        // Use Screen Orientation API first (most reliable)
        if (screen.orientation) {
            const type = screen.orientation.type;
            console.log('Screen orientation type:', type);
            
            if (type.includes('portrait-primary')) return 'portrait-primary';
            if (type.includes('landscape-primary')) return 'landscape-primary';
            if (type.includes('portrait-secondary')) return 'portrait-secondary';
            if (type.includes('landscape-secondary')) return 'landscape-secondary';
            if (type.includes('portrait')) return 'portrait-primary';
            if (type.includes('landscape')) return 'landscape-primary';
        }
        
        // Fallback to orientation angle
        const angle = screen.orientation ? screen.orientation.angle : window.orientation;
        console.log('Orientation angle:', angle);
        
        switch (angle) {
            case 0:
                return 'portrait-primary';
            case 90:
                return 'landscape-primary';
            case 180:
                return 'portrait-secondary';
            case -90:
            case 270:
                return 'landscape-secondary';
            default:
                // Final fallback - use actual device orientation detection
                const isPortrait = window.innerHeight > window.innerWidth;
                console.log('Fallback orientation - isPortrait:', isPortrait);
                return isPortrait ? 'portrait-primary' : 'landscape-primary';
        }
    }

    switchComponent(orientation) {
        console.log('Switching to orientation:', orientation);
        console.log('Available components:', this.components);
        
        // Hide all components first
        Object.values(this.components).forEach(component => {
            component.classList.add('hidden');
            component.classList.remove('active', 'transitioning-out', 'transitioning-in');
        });

        // Show the appropriate component
        const targetComponent = this.components[orientation];
        console.log('Target component:', targetComponent);
        
        if (targetComponent) {
            targetComponent.classList.remove('hidden');
            targetComponent.classList.add('active');
            console.log('Component activated:', orientation);
        } else {
            console.error('No component found for orientation:', orientation);
            // Fallback to alarm clock
            const alarmComponent = this.components['portrait-primary'];
            if (alarmComponent) {
                alarmComponent.classList.remove('hidden');
                alarmComponent.classList.add('active');
                console.log('Fallback to alarm clock activated');
            }
        }
        
        this.currentOrientation = orientation;
        this.updateDebugInfo();
    }

    updateDebugInfo() {
        const debugOrientation = document.getElementById('debug-orientation');
        const debugAngle = document.getElementById('debug-angle');
        
        if (debugOrientation) {
            debugOrientation.textContent = this.currentOrientation || 'unknown';
        }
        if (debugAngle) {
            const angle = screen.orientation ? screen.orientation.angle : window.orientation;
            debugAngle.textContent = angle || 'unknown';
        }
    }

    // Clock Functions
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    startAlarmChecker() {
        setInterval(() => this.checkAlarms(), 1000);
    }

    updateClock() {
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

        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        
        if (timeElement) timeElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;
    }

    // Alarm Clock Functions
    setupAlarmClock() {
        const addAlarmBtn = document.getElementById('add-alarm-btn');
        const clearAllAlarmsBtn = document.getElementById('clear-all-alarms-btn');
        
        console.log('Setting up alarm buttons:', { addAlarmBtn, clearAllAlarmsBtn });
        
        if (addAlarmBtn) {
            // Remove any existing event listeners to prevent duplicates
            addAlarmBtn.replaceWith(addAlarmBtn.cloneNode(true));
            const newAddAlarmBtn = document.getElementById('add-alarm-btn');
            
            newAddAlarmBtn.addEventListener('click', () => {
                console.log('Add alarm button clicked');
                this.addAlarm();
            });
            console.log('Add alarm event listener attached');
        } else {
            console.error('Add alarm button not found');
        }
        
        if (clearAllAlarmsBtn) {
            // Remove any existing event listeners to prevent duplicates
            clearAllAlarmsBtn.replaceWith(clearAllAlarmsBtn.cloneNode(true));
            const newClearAllAlarmsBtn = document.getElementById('clear-all-alarms-btn');
            
            newClearAllAlarmsBtn.addEventListener('click', () => {
                console.log('Clear all alarms button clicked');
                this.clearAllAlarms();
            });
            console.log('Clear all alarms event listener attached');
        } else {
            console.error('Clear all alarms button not found');
        }
    }

    addAlarm() {
        const time = prompt('Enter alarm time (HH:MM format):') || '00:00';
        if (!time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            alert('Please enter a valid time in HH:MM format');
            return;
        }

        const label = prompt('Enter alarm label:') || 'Alarm';
        const daysInput = prompt('Enter days (Mon,Tue,Wed,Thu,Fri,Sat,Sun):', 'Mon,Tue,Wed,Thu,Fri');
        const daysList = daysInput.split(',').map(day => day.trim());
        const selectedDays = daysList.filter(day => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(day));
        
        if (selectedDays.length === 0) {
            selectedDays.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri');
        }

        const snoozeInput = prompt('Enter snooze interval (minutes):', '5');
        const snoozeInterval = parseInt(snoozeInput) || 5;

        const alarm = {
            id: Date.now().toString(),
            time: time,
            enabled: true,
            days: selectedDays,
            snoozeInterval: snoozeInterval,
            label: label
        };

        console.log('Creating alarm:', alarm);
        this.alarms.push(alarm);
        console.log('Alarms array:', this.alarms);
        this.renderAlarmList();
        this.saveData();
        this.addHapticFeedback();
    }

    renderAlarmList() {
        const alarmList = document.getElementById('alarm-list');
        if (!alarmList) {
            console.error('alarm-list element not found');
            return;
        }

        console.log('Rendering alarms:', this.alarms);

        if (this.alarms.length === 0) {
            alarmList.innerHTML = '<div class="no-alarms">No alarms set</div>';
            return;
        }

        const html = this.alarms.map(alarm => {
            console.log('Rendering alarm:', alarm);
            return `
                <div class="alarm-item" data-id="${alarm.id}">
                    <div class="alarm-main">
                        <div class="alarm-info">
                            <div class="alarm-time">${alarm.time}</div>
                            <div class="alarm-label">${alarm.label}</div>
                        </div>
                    </div>
                    <div class="alarm-settings">
                        <div class="setting-item">Days: ${alarm.days.join(', ')}</div>
                        <div class="setting-item">Snooze: ${alarm.snoozeInterval} min</div>
                    </div>
                    <div class="alarm-controls">
                        <label class="ios-switch">
                            <input type="checkbox" ${alarm.enabled ? 'checked' : ''} data-alarm-id="${alarm.id}">
                            <span class="slider"></span>
                        </label>
                        <button class="edit-btn" data-alarm-id="${alarm.id}">✏️</button>
                        <button class="delete-btn" data-alarm-id="${alarm.id}">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Generated HTML:', html);
        alarmList.innerHTML = html;
        
        // Add event listeners after rendering
        this.attachAlarmEventListeners();
    }

    attachAlarmEventListeners() {
        // Toggle switches
        document.querySelectorAll('.ios-switch input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const alarmId = e.target.getAttribute('data-alarm-id');
                this.toggleAlarm(alarmId);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alarmId = e.target.getAttribute('data-alarm-id');
                this.editAlarm(alarmId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alarmId = e.target.getAttribute('data-alarm-id');
                this.deleteAlarm(alarmId);
            });
        });
    }

    toggleAlarm(id) {
        console.log('Toggling alarm:', id);
        const alarm = this.alarms.find(a => a.id == id);
        if (alarm) {
            alarm.enabled = !alarm.enabled;
            console.log('Alarm toggled:', alarm);
            this.renderAlarmList();
            this.saveData();
        }
    }

    editAlarm(id) {
        console.log('Editing alarm:', id);
        const alarm = this.alarms.find(a => a.id == id);
        if (!alarm) {
            console.error('Alarm not found:', id);
            return;
        }
        
        const newTime = prompt('Edit alarm time (HH:MM format):', alarm.time);
        if (!newTime || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
            alert('Please enter a valid time in HH:MM format');
            return;
        }
        
        const newLabel = prompt('Edit alarm label:', alarm.label) || alarm.label;
        const newDaysInput = prompt('Edit days (Mon,Tue,Wed,Thu,Fri,Sat,Sun):', alarm.days.join(',')) || alarm.days.join(',');
        const newDaysList = newDaysInput.split(',').map(day => day.trim());
        const newSelectedDays = newDaysList.filter(day => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(day));
        
        if (newSelectedDays.length === 0) {
            newSelectedDays.push(...alarm.days);
        }
        
        const newSnoozeInput = prompt('Edit snooze interval (minutes):', alarm.snoozeInterval.toString());
        const newSnoozeInterval = parseInt(newSnoozeInput) || alarm.snoozeInterval;
        
        alarm.time = newTime;
        alarm.label = newLabel;
        alarm.days = newSelectedDays;
        alarm.snoozeInterval = newSnoozeInterval;
        
        console.log('Alarm updated:', alarm);
        this.renderAlarmList();
        this.saveData();
        this.addHapticFeedback();
    }

    deleteAlarm(id) {
        console.log('Deleting alarm:', id);
        if (confirm('Are you sure you want to delete this alarm?')) {
            this.alarms = this.alarms.filter(a => a.id != id);
            console.log('Alarm deleted, remaining alarms:', this.alarms);
            this.renderAlarmList();
            this.saveData();
            this.addHapticFeedback();
        }
    }

    clearAllAlarms() {
        if (confirm('Clear all alarms?')) {
            this.alarms = [];
            this.renderAlarmList();
            this.saveData();
        }
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
        const currentMinute = `${currentTime}-${currentDay}`;

        this.alarms.forEach(alarm => {
            const alarmKey = `${alarm.id}-${currentMinute}`;
            
            if (alarm.enabled && 
                alarm.time === currentTime && 
                alarm.days.includes(currentDay) && 
                !this.triggeredAlarms.has(alarmKey) &&
                !this.activeAlarm) { // Don't trigger if modal is already open
                
                this.triggeredAlarms.add(alarmKey);
                this.triggerAlarm(alarm);
                
                // Clean up old triggered alarms after 2 minutes
                setTimeout(() => {
                    this.triggeredAlarms.delete(alarmKey);
                }, 120000);
            }
        });
    }

    triggerAlarm(alarm) {
        this.showAlarmModal(alarm);
        this.addHapticFeedback();
        if (navigator.vibrate) {
            navigator.vibrate([1000, 500, 1000]);
        }
    }

    showAlarmModal(alarm) {
        // Remove any existing modal first
        const existingModal = document.getElementById('alarm-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create new modal
        const modal = document.createElement('div');
        modal.id = 'alarm-modal';
        modal.className = 'alarm-modal';
        modal.innerHTML = `
            <div class="alarm-modal-content">
                <h2>⏰ Alarm</h2>
                <p id="alarm-modal-time">${alarm.time}</p>
                <p id="alarm-modal-label">${alarm.label}</p>
                <div class="alarm-modal-buttons">
                    <button id="snooze-btn" class="glass-button secondary">Snooze</button>
                    <button id="turn-off-btn" class="glass-button primary">Turn Off</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Show modal
        modal.style.display = 'flex';
        this.activeAlarm = alarm;

        // Add event listeners with immediate removal after click
        const snoozeBtn = document.getElementById('snooze-btn');
        const turnOffBtn = document.getElementById('turn-off-btn');
        
        snoozeBtn.addEventListener('click', () => {
            this.snoozeAlarm();
        }, { once: true });
        
        turnOffBtn.addEventListener('click', () => {
            this.turnOffAlarm();
        }, { once: true });
        
        // Allow clicking outside modal to dismiss
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.turnOffAlarm();
            }
        });
    }

    snoozeAlarm() {
        if (this.activeAlarm) {
            const snoozeTime = this.activeAlarm.snoozeInterval * 60 * 1000;
            this.snoozeTimeout = setTimeout(() => {
                this.triggerAlarm(this.activeAlarm);
            }, snoozeTime);
        }
        this.dismissAlarm();
    }

    turnOffAlarm() {
        this.dismissAlarm();
    }

    dismissAlarm() {
        const modal = document.getElementById('alarm-modal');
        if (modal) {
            modal.remove();
        }
        this.activeAlarm = null;
        if (this.snoozeTimeout) {
            clearTimeout(this.snoozeTimeout);
            this.snoozeTimeout = null;
        }
        console.log('Alarm dismissed, activeAlarm cleared');
    }

    playAlarmSound() {
        // Create audio context for alarm sound
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
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
        
        // Check alarms
        this.checkAlarms();
        
        // Update running timers
        this.updateRunningTimers();
    }

    startTimeUpdates() {
        setInterval(() => this.updateCurrentTime(), 1000);
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
            startStopBtn.innerHTML = '<span class="button-icon">▶️</span><span>Start</span>';
            lapResetBtn.innerHTML = '<span class="button-icon">⏹️</span><span>Reset</span>';
        } else {
            this.startStopwatch();
            startStopBtn.innerHTML = '<span class="button-icon">⏸️</span><span>Stop</span>';
            lapResetBtn.innerHTML = '<span class="button-icon">⏱️</span><span>Lap</span>';
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
        const lapTime = this.stopwatchTime;
        this.lapTimes.push(lapTime);
        
        const lapElement = document.createElement('div');
        lapElement.className = 'lap-time';
        
        // Determine if this is best/worst lap
        const bestLap = Math.min(...this.lapTimes);
        const worstLap = Math.max(...this.lapTimes);
        
        if (lapTime === bestLap && this.lapTimes.length > 1) {
            lapElement.classList.add('best');
        } else if (lapTime === worstLap && this.lapTimes.length > 1) {
            lapElement.classList.add('worst');
        }
        
        lapElement.innerHTML = `
            <span class="lap-number">Lap ${this.lapTimes.length}</span>
            <span class="lap-time-value">${this.formatTime(lapTime)}</span>
        `;
        
        document.getElementById('lap-times').insertBefore(lapElement, document.getElementById('lap-times').firstChild);
        
        // Update stats
        document.getElementById('lap-count').textContent = this.lapTimes.length;
        document.getElementById('best-lap').textContent = this.formatTime(bestLap);
    }

    resetStopwatch() {
        this.stopwatchTime = 0;
        this.lapTimes = [];
        document.getElementById('lap-times').innerHTML = '';
        document.getElementById('lap-count').textContent = '0';
        document.getElementById('best-lap').textContent = '--:--';
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
        const addTimerBtn = document.getElementById('add-timer-btn');
        const clearAllTimersBtn = document.getElementById('clear-all-timers-btn');
        
        addTimerBtn.addEventListener('click', () => this.addTimer());
        clearAllTimersBtn.addEventListener('click', () => this.clearAllTimers());
    }

    addTimer() {
        const minutes = parseInt(prompt('Timer minutes:', '5')) || 5;
        const seconds = parseInt(prompt('Timer seconds:', '0')) || 0;
        
        const timer = {
            id: Date.now(),
            originalTime: (minutes * 60) + seconds,
            remainingTime: (minutes * 60) + seconds,
            running: false,
            label: `${minutes}:${seconds.toString().padStart(2, '0')}`
        };

        this.timers.push(timer);
        this.renderTimers();
        this.saveData();
    }

    renderTimers() {
        const timerList = document.getElementById('timer-list');
        timerList.innerHTML = '';

        this.timers.forEach(timer => {
            const timerElement = document.createElement('div');
            timerElement.className = 'timer-item';
            timerElement.innerHTML = `
                <div class="timer-display">${this.formatTimerTime(timer.remainingTime)}</div>
                <div class="timer-controls">
                    <button class="glass-button ${timer.running ? 'secondary' : 'primary'}" 
                            onclick="app.toggleTimer(${timer.id})">
                        <span class="button-icon">${timer.running ? '⏸️' : '▶️'}</span>
                        <span>${timer.running ? 'Pause' : 'Start'}</span>
                    </button>
                    <button class="glass-button secondary" onclick="app.deleteTimer(${timer.id})">
                        <span class="button-icon">🗑️</span>
                        <span>Delete</span>
                    </button>
                </div>
            `;
            timerList.appendChild(timerElement);
        });
    }


    clearAllTimers() {
        if (confirm('Clear all timers?')) {
            this.timers = [];
            this.renderTimers();
            this.saveData();
        }
    }

    updateRunningTimers() {
        this.timers.forEach(timer => {
            if (timer.running && timer.remainingTime > 0) {
                timer.remainingTime--;
                if (timer.remainingTime <= 0) {
                    timer.running = false;
                    this.timerComplete(timer);
                }
            }
        });
        this.renderTimers();
    }


    formatTimerTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleTimer(id) {
        const timer = this.timers.find(t => t.id === id);
        if (!timer) return;
        
        timer.running = !timer.running;
        this.renderTimers();
        this.saveData();
        this.addHapticFeedback();
    }

    deleteTimer(id) {
        this.timers = this.timers.filter(t => t.id !== id);
        this.renderTimers();
        this.saveData();
        this.addHapticFeedback();
    }

    clearAllTimers() {
        if (confirm('Clear all timers?')) {
            this.timers = [];
            this.renderTimers();
            this.saveData();
        }
    }

    timerComplete(timer) {
        alert(`Timer "${timer.label}" completed!`);
        this.addHapticFeedback();
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500]);
        }
    }

    addHapticFeedback() {
        // Add haptic feedback for supported devices
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    // Weather Functions
    setupWeather() {
        const addLocationBtn = document.getElementById('add-location-btn');
        const currentLocationBtn = document.getElementById('current-location-btn');
        const celsiusBtn = document.getElementById('celsius-btn');
        const fahrenheitBtn = document.getElementById('fahrenheit-btn');
        
        addLocationBtn.addEventListener('click', () => this.addWeatherLocation());
        currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        celsiusBtn.addEventListener('click', () => this.setTemperatureUnit('celsius'));
        fahrenheitBtn.addEventListener('click', () => this.setTemperatureUnit('fahrenheit'));
        
        this.getCurrentLocationWeather();
    }

    async addWeatherLocation() {
        const location = prompt('Enter city name:', 'New York');
        if (!location) return;

        try {
            const weatherData = await this.fetchWeatherByCity(location);
            const locationData = {
                id: Date.now(),
                name: weatherData.name,
                country: weatherData.sys.country,
                weather: weatherData,
                isCurrentLocation: false
            };

            this.weatherLocations.push(locationData);
            this.renderWeatherLocations();
            this.saveData();
        } catch (error) {
            alert('Could not find weather for that location');
        }
    }

    getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            this.addMockCurrentLocation();
            return;
        }

        // Request permission explicitly
        navigator.permissions.query({name: 'geolocation'}).then((result) => {
            if (result.state === 'granted' || result.state === 'prompt') {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        this.fetchWeatherByCoords(lat, lon, 'Current Location');
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        let errorMsg = 'Location access denied.';
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMsg = 'Location access denied. Please enable location permissions.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMsg = 'Location information unavailable.';
                                break;
                            case error.TIMEOUT:
                                errorMsg = 'Location request timed out.';
                                break;
                        }
                        alert(errorMsg);
                        this.addMockCurrentLocation();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            } else {
                alert('Location permission denied. Using mock data.');
                this.addMockCurrentLocation();
            }
        }).catch(() => {
            // Fallback for browsers without permissions API
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    this.fetchWeatherByCoords(lat, lon, 'Current Location');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.addMockCurrentLocation();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        });
    }

    async fetchWeatherByCoords(lat, lon, locationName = 'Current Location') {
        try {
            if (!window.AppConfig || !window.AppConfig.hasWeatherApiKey()) {
                console.warn('Weather API not configured');
                return null;
            }
            
            const weatherUrl = window.AppConfig.getWeatherApiUrl(lat, lon);
            const response = await fetch(weatherUrl);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const weatherData = await response.json();
            
            // Add to weather locations if successful
            const locationData = {
                id: 'current',
                name: locationName,
                country: weatherData.sys?.country || 'XX',
                weather: weatherData,
                isCurrentLocation: true
            };
            
            // Remove existing current location and add new one
            this.weatherLocations = this.weatherLocations.filter(loc => !loc.isCurrentLocation);
            this.weatherLocations.unshift(locationData);
            this.renderWeatherLocations();
            this.saveData();
            
            return weatherData;
        } catch (error) {
            console.warn('Weather fetch failed:', error);
            this.addMockCurrentLocation();
            return null;
        }
    }

    async fetchWeatherByCity(city) {
        try {
            if (!window.AppConfig || !window.AppConfig.hasWeatherApiKey()) {
                console.warn('Weather API not configured');
                return null;
            }
            
            const apiKey = window.AppConfig.get('WEATHER_API_KEY');
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
        
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Weather fetch failed:', error);
            return null;
        }
    }

    addMockCurrentLocation() {
        const mockLocation = {
            id: 'current',
            name: 'Your Location',
            country: 'XX',
            weather: {
                main: { temp: 24, feels_like: 26, humidity: 65 },
                weather: [{ main: 'Clear', description: 'sunny' }]
            },
            isCurrentLocation: true
        };

        this.weatherLocations = this.weatherLocations.filter(loc => !loc.isCurrentLocation);
        this.weatherLocations.unshift(mockLocation);
        this.renderWeatherLocations();
    }

    renderWeatherLocations() {
        const weatherLocations = document.getElementById('weather-locations');
        weatherLocations.innerHTML = '';

        this.weatherLocations.forEach(location => {
            const temp = this.convertTemperature(location.weather.main.temp);
            const feelsLike = this.convertTemperature(location.weather.main.feels_like);
            const unit = this.temperatureUnit === 'celsius' ? '°C' : '°F';

            const locationElement = document.createElement('div');
            locationElement.className = 'weather-location-card';
            locationElement.innerHTML = `
                <div class="weather-card-header">
                    <div class="location-name">
                        ${location.isCurrentLocation ? '📍 ' : ''}${location.name}
                    </div>
                    ${!location.isCurrentLocation ? `<button class="delete-location-btn" onclick="app.deleteWeatherLocation(${location.id})">×</button>` : ''}
                </div>
                <div class="weather-main">
                    <div class="weather-icon">${this.getWeatherIcon(location.weather.weather[0].main)}</div>
                    <div class="weather-temp">${Math.round(temp)}${unit}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-description">${location.weather.weather[0].description}</div>
                    <div class="weather-stats">
                        <span>Feels like ${Math.round(feelsLike)}${unit}</span>
                        <span>Humidity ${location.weather.main.humidity}%</span>
                    </div>
                </div>
            `;
            weatherLocations.appendChild(locationElement);
        });
    }

    deleteWeatherLocation(id) {
        this.weatherLocations = this.weatherLocations.filter(loc => loc.id !== id);
        this.renderWeatherLocations();
        this.saveData();
    }

    setTemperatureUnit(unit) {
        this.temperatureUnit = unit;
        
        document.getElementById('celsius-btn').classList.toggle('active', unit === 'celsius');
        document.getElementById('fahrenheit-btn').classList.toggle('active', unit === 'fahrenheit');
        
        this.renderWeatherLocations();
        this.saveData();
    }

    convertTemperature(celsius) {
        return this.temperatureUnit === 'fahrenheit' ? (celsius * 9/5) + 32 : celsius;
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

    // Data persistence
    saveData() {
        const data = {
            alarms: this.alarms,
            timers: this.timers,
            weatherLocations: this.weatherLocations,
            temperatureUnit: this.temperatureUnit
        };
        localStorage.setItem('orientify-data', JSON.stringify(data));
    }

    loadStoredData() {
        const stored = localStorage.getItem('orientify-data');
        if (stored) {
            const data = JSON.parse(stored);
            this.alarms = data.alarms || [];
            this.timers = data.timers || [];
            this.weatherLocations = data.weatherLocations || [];
            this.temperatureUnit = data.temperatureUnit || 'celsius';
            
            this.renderAlarmList();
            this.renderTimers();
            this.renderWeatherLocations();
            this.setTemperatureUnit(this.temperatureUnit);
        }
    }
}

// Make sure app is globally accessible for button onclick handlers
window.app = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Wait for DOM to be fully ready
    setTimeout(() => {
        window.app = new OrientifyApp();
        
        // Additional setup after app initialization
        setTimeout(() => {
            console.log('Checking DOM elements:');
            console.log('alarm-clock:', document.getElementById('alarm-clock'));
            console.log('add-alarm-btn:', document.getElementById('add-alarm-btn'));
            console.log('clear-all-alarms-btn:', document.getElementById('clear-all-alarms-btn'));
            
            // Force show alarm clock if nothing is visible
            const alarmClock = document.getElementById('alarm-clock');
            if (alarmClock) {
                alarmClock.classList.remove('hidden');
                alarmClock.classList.add('active');
                alarmClock.style.display = 'flex';
                console.log('Forced alarm clock to show');
            }
            
            // Re-setup buttons if needed
            if (window.app && window.app.setupAlarmClock) {
                window.app.setupAlarmClock();
            }
        }, 300);
    }, 100);
});

// Handle visibility changes to pause/resume timers
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App hidden');
    } else {
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

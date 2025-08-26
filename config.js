// Configuration management for environment variables
class Config {
    constructor() {
        this.env = {};
        this.loadEnvironmentVariables();
    }

    // Load environment variables from various sources
    loadEnvironmentVariables() {
        // For development: try to load from .env file (requires build tool)
        // For production: use environment variables injected at build time
        
        // Default configuration
        this.env = {
            WEATHER_API_KEY: this.getEnvVar('WEATHER_API_KEY', 'demo_key'),
            WEATHER_API_URL: this.getEnvVar('WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5/weather'),
            APP_NAME: this.getEnvVar('APP_NAME', 'Orientation Mobile App'),
            DEBUG_MODE: this.getEnvVar('DEBUG_MODE', 'false') === 'true'
        };

        // Log configuration in debug mode (without sensitive data)
        if (this.env.DEBUG_MODE) {
            console.log('App Configuration:', {
                APP_NAME: this.env.APP_NAME,
                WEATHER_API_URL: this.env.WEATHER_API_URL,
                WEATHER_API_KEY: this.env.WEATHER_API_KEY ? '[SET]' : '[NOT SET]',
                DEBUG_MODE: this.env.DEBUG_MODE
            });
        }
    }

    // Get environment variable with fallback
    getEnvVar(key, defaultValue = null) {
        // Try multiple sources for environment variables
        
        // 1. Runtime environment (for build tools like Vite, Webpack)
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }

        // 2. Window object (for runtime injection)
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }

        // 3. Meta tags (for deployment platforms)
        if (typeof document !== 'undefined') {
            const metaTag = document.querySelector(`meta[name="env-${key.toLowerCase()}"]`);
            if (metaTag) {
                return metaTag.getAttribute('content');
            }
        }

        // 4. Local storage (for development testing)
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(`ENV_${key}`);
            if (stored) {
                return stored;
            }
        }

        // 5. Return default value
        return defaultValue;
    }

    // Get configuration value
    get(key) {
        return this.env[key];
    }

    // Set configuration value (for testing)
    set(key, value) {
        this.env[key] = value;
        if (this.env.DEBUG_MODE) {
            console.log(`Config updated: ${key} = ${key.includes('KEY') ? '[HIDDEN]' : value}`);
        }
    }

    // Check if API key is configured
    hasWeatherApiKey() {
        const key = this.get('WEATHER_API_KEY');
        return key && key !== 'demo_key' && key !== 'your_openweathermap_api_key_here';
    }

    // Get weather API URL with parameters
    getWeatherApiUrl(lat, lon) {
        const baseUrl = this.get('WEATHER_API_URL');
        const apiKey = this.get('WEATHER_API_KEY');
        return `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }
}

// Create global config instance
window.AppConfig = new Config();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}


const weatherApp = {
    apiKey: "d05b1498283f299b578082db4c13942e",
    apiBaseUrl: "https://api.openweathermap.org/data/2.5/weather",


    elements: {
        searchBox: document.querySelector(".search input"),
        searchBtn: document.querySelector(".search button"),
        weatherIcon: document.querySelector(".weather-icon"),
        weatherDisplay: document.querySelector(".weather"),
        errorDisplay: document.querySelector(".error"),
        errorText: document.querySelector(".error p"),
        loader: document.querySelector(".loader"),
        cityDisplay: document.querySelector(".city"),
        tempDisplay: document.querySelector(".temp"),
        humidityDisplay: document.querySelector(".humidity"),
        conditionDisplay: document.querySelector(".condition"),
        windDisplay: document.querySelector(".wind"),
    },

    init() {
        this.addEventListeners();
        this.getLocationWeather(); 
    },

    addEventListeners() {
        this.elements.searchBtn.addEventListener("click", () => this.performSearch());
        this.elements.searchBox.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                this.performSearch();
            }
        });
    },

    performSearch() {
        const city = this.elements.searchBox.value.trim();
        if (city) {
            this.getWeatherByCity(city);
        }
    },

    async getWeatherByCity(city) {
        this.setUIState("loading");
        const url = `${this.apiBaseUrl}?units=metric&q=${city}&appid=${this.apiKey}`;
        await this.fetchWeatherData(url);
    },

    getLocationWeather() {
        if (!navigator.geolocation) {
            this.setUIState("error", "Geolocation is not supported. Please search for a city.");
            return;
        }

        this.setUIState("loading");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const url = `${this.apiBaseUrl}?units=metric&lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`;
                await this.fetchWeatherData(url);
            },
            (error) => {
                // Handle user denying permission or other geolocation errors
                this.setUIState("error", "Location access denied. Please search for a city.");
            }
        );
    },

    async fetchWeatherData(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) throw new Error("City not found.");
                if (response.status === 401) throw new Error("Invalid API Key.");
                throw new Error("An error occurred. Please try again.");
            }
            const data = await response.json();
            this.displayWeather(data);
        } catch (error) {
            this.setUIState("error", error.message);
        }
    },

    displayWeather(data) {
        this.elements.cityDisplay.innerHTML = data.name;
        this.elements.tempDisplay.innerHTML = Math.round(data.main.temp) + "°C";
        this.elements.humidityDisplay.innerHTML = data.main.humidity + "%";
        this.elements.windDisplay.innerHTML = data.wind.speed + " km/h";
        this.elements.conditionDisplay.innerHTML = data.weather[0].description.replace(/\b\w/g, char => char.toUpperCase());


        this.elements.weatherIcon.src = "images.jpeg";

        const weatherCondition = data.weather[0].main.toLowerCase();
        document.body.className = weatherCondition;

        this.setUIState("success");
    },

    setUIState(state, message = "") {

        this.elements.loader.style.display = "none";
        this.elements.weatherDisplay.classList.remove("visible");
        this.elements.errorDisplay.classList.remove("visible");

        if (state === "loading") { 
            this.elements.loader.style.display = "block";
        } else if (state === "success") {
            this.elements.weatherDisplay.classList.add("visible");
        } else if (state === "error") {
            this.elements.errorText.textContent = message;
            this.elements.errorDisplay.classList.add("visible");
        }
    }
};

weatherApp.init();
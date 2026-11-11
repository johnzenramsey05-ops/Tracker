/* exported login, forgotPassword, changePassword, goToCreateAccount, createAccount, goToLogin, openSearch, closeSearch, sendResetEmail, logout, getLocation */
//check login info
function login() {
    window.location.href = "HomePage.html";
}
function forgotPassword() {
    window.location.href = "ForgotPassword.html";
}
function changePassword() {
    window.location.href = "ChangePassword.html";
}
//from login page to create account page
function goToCreateAccount() {
    window.location.href = "CreateAccount.html";
}
function createAccount() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registrationMessage");
    const errors = window.CyberTrakValidation.validateRegistration({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    });

    if (errors.length > 0) {
        message.textContent = errors.join(" ");
        return;
    }

    message.textContent = "Form checks passed. Account creation is not connected yet.";
}
function goToLogin() {
    window.location.href = "LoginPage.html";
}

function openSearch() {
    document.getElementById("searchButton").style.display = "none";

    const container = document.getElementById("search-container");
    container.style.display = "flex";

    document.getElementById("searchInput").focus();
}
function closeSearch() {

    document.getElementById("search-container").style.display = "none";
    document.getElementById("searchInput").value = "";

    document.getElementById("searchButton").style.display = "flex";
}

function sendResetEmail() {
    const email = document.getElementById("resetEmail").value.trim();

    if (email === "") {
        document.getElementById("resetMessage").textContent =
            "Please enter your email.";
        return;
    }

    document.getElementById("resetMessage").textContent =
        "Password reset instructions have been sent to your email.";
}
//appearance
const appearanceOptions = document.querySelectorAll(
    'input[name="appearance"]'
);

function applyAppearance(mode) {
    const root = document.documentElement;

    if (mode === "system") {
        // Follow the phone or computer's theme
        const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        root.setAttribute("data-theme", isDark ? "dark" : "light");

    } else if (mode === "auto") {
        // Light during the day, dark at night
        updateAutoTheme();

    } else {
        root.setAttribute("data-theme", mode);
    }
}

function updateAutoTheme() {
    const hour = new Date().getHours();

    // Light mode from 6 AM to 5:59 PM
    const isDaytime = hour >= 6 && hour < 18;

    document.documentElement.setAttribute(
        "data-theme",
        isDaytime ? "light" : "dark"
    );
}

// Update theme when a setting is selected
appearanceOptions.forEach(option => {
    option.addEventListener("change", () => {
        const selectedMode = option.value;

        localStorage.setItem("appearance", selectedMode);
        applyAppearance(selectedMode);
    });
});

// Follow system theme changes in real time
const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
);

systemTheme.addEventListener("change", () => {
    if (localStorage.getItem("appearance") === "system") {
        applyAppearance("system");
    }
});

// Load the saved preference
const savedMode = localStorage.getItem("appearance") || "system";

const selectedOption = document.querySelector(
    `input[name="appearance"][value="${savedMode}"]`
);

if (selectedOption) {
    selectedOption.checked = true;
}

applyAppearance(savedMode);

// Recheck auto scheduling when the page becomes active
document.addEventListener("visibilitychange", () => {
    if (
        !document.hidden &&
        localStorage.getItem("appearance") === "auto"
    ) {
        updateAutoTheme();
    }
});

function logout() {
    window.location.href = "LoginPage.html";
}







//Get user location
let map;
let marker;
function getLocation() {
    if (!navigator.geolocation) {
        document.getElementById("locationMessage").textContent =
            "Geolocation is not supported.";
        return;
    }
    navigator.geolocation.getCurrentPosition(showPosition, locationError);
}

function showPosition(position) {
    const coords = position && position.coords;
    const latitude = coords && coords.latitude;
    const longitude = coords && coords.longitude;
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        locationError({ code: 2 });
        return;
    }

    if (!map) {
        map = L.map("map").setView([latitude, longitude], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    } else {
        map.setView([latitude, longitude], 15);
    }
    if (marker) {
        marker.setLatLng([latitude, longitude]);
    } else {
        marker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup("You are here!")
            .openPopup();
    }
    document.getElementById("locationMessage").textContent =
        "Your location has been found.";
}

function locationError(error) {
    console.log("Unable to get your location.");
    const messages = {
        1: "Location permission was denied.",
        2: "Your location is unavailable.",
        3: "The location request timed out."
    };
    const message = error && messages[error.code]
        ? messages[error.code]
        : "Unable to get your location.";
    document.getElementById("locationMessage").textContent = message;
}

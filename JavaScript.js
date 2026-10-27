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
//logout button then goes to login page



//from create account page to home page
//make if statement about them not putting in any info.
function createAccount() {
    alert("Account created!");
    window.location.href = "HomePage.html";
}
function goToLogin() {
    window.location.href = "LoginPage.html";
}

function openSearch() {
    document.getElementById("searchButton").style.display = "none";

    const container = document.getElementById("search-container");
    container.style.display = "flex";

    const input = document.getElementById("searchInput").focus();
}
function closeSearch() {

    document.getElementById("search-container").style.display = "none";
    document.getElementById("searchInput").value = "";

    document.getElementById("searchButton").style.display = "flex";
}

function sendResetEmail() {
    let email = document.getElementById("resetEmail").value;

    if (email == "") {
        document.getElementById("resetMessage").textContent =
            "Please enter your email.";
        return;
    }

    document.getElementById("resetMessage").textContent =
        "Password reset instructions have beens ent to your email.";
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
    if (!navigator.getLocation) {
        document.getElementById("locationMessage").textContent =
            "Geolocation is not supported.";
        return;
    }
    navigator.geolocation.getCurrentPosition(showPosition, locationError);
}

function showPostion(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
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
    document.getElementById("loactionMessage").textContent =
        "Your location has been found.";
}

function locationError() {
    console.log("Unable to get your location.");
}
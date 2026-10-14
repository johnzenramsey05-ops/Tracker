function login() {
    //check login info
    window.location.href = "HomePage.html";
}
function forgotPassword() {
    window.location.href = "ForgotPassword.html";
}
//from login page to create account page
function goToCreateAccount() {
    window.location.href = "CreateAccount.html";
}
//from create account page to home page
//make if statement about them not putting in any info.
function createAccount() {
    alert("Account created!");
    window.location.href = "HomePage.html";
}
function goToLogin() {
    window.location.href = "LoginPage.html";
}
function openSearch(){
    document.getElementById("search-container").style.display = "flex";
    document.getElementById("searchInput").focus();
}
function closeSearch() {
    document.getElementById("search-container").style.display = "none";
    document.getElementById("searchInput").value = "";
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
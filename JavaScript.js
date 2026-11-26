/* exported login, forgotPassword, changePassword, goToCreateAccount, createAccount, goToLogin, openSearch, closeSearch, sendResetEmail, logout, getLocation */

/*=================================================================
Navigation: login, logout, goToLogin & goToCreateAccount, goBack
===================================================================*/
function login() {
    window.location.href = "HomePage.html";
}
function logout() {
    window.location.href = "LoginPage.html";
}
function goToLogin() {
    window.location.href = "LoginPage.html";
}
//from login page to create account page
function goToCreateAccount() {
    window.location.href = "CreateAccount.html";
}
/*=================================================================
Account functions: createAccount, forgotPassword, changePassword,
sendRestEmail               
===================================================================*/

function createAccount() {
    const userName = document.getElementById("username").value;
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
function forgotPassword() {
    window.location.href = "ForgotPassword.html";
}
function changePassword() {
    window.location.href = "ChangePassword.html";
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
/*=================================================================
Search: openSearch & close Search                           DONE
===================================================================*/
function openSearch() {
    const container = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");

    container.classList.add("active");
    searchInput.focus();
}
function closeSearch() {
    const container = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");

    container.classList.remove("active");
    searchInput.value = "";
}
/*=================================================================
Event creation: goToCreateEvent, saveEventDetails, displayEventTime    
===================================================================*/
function goToCreateEvent() {
    window.location.href = "CreateEvent.html";
}
function saveEventDetails() {
    const eventDraft = {
        eventName: document.getElementById("eventName").value.trim(),
        date: document.getElementById("eventDate").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
        location: document.getElementById("eventLocation").value.trim(),
        selectedFriends: []
    };

    //save event info
    sessionStorage.setItem("eventDraft", JSON.stringify(eventDraft));

    //go to select friends page
    window.location.href = "SelectFriends.html";
}
function displayEventTime() {
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (startTime && endTime) {
        document.getElementById("eventTimeDisplay").textContent =
            `${startTime} - ${endTime}`;
    }
}
/*=================================================================
Friend selection: displayFriends, updateSelectedCount,
continueToConfirmation
===================================================================*/
function selectFriends() {
    window.location.href = "SelectFriends.html";
}

//select friends
const friends = [
    { id: 1, name: "Jane Doe" },
    { id: 2, name: "Maria Black" },
    { id: 3, name: "Cierra Johnsonn" },
    { id: 4, name: "Emily Davison" },
    { id: 5, name: "John Doe" }
];
//store selected friends
const eventDraft = JSON.parse(sessionStorage.getItem("eventDraft") || "{}");
let selectedFriends = eventDraft.selectedFriends || [];
//display friends
function displayFriends() {
    const friendsList = document.getElementById("friendsList");
    friendsList.innerHTML = "";

    friends.forEach(friend => {
        const friendRow = document.createElement("label");
        friendRow.className = "friend-item";

        friendRow.innerHTML = `
            <div class="friend-avatar"> ${friend.name.charAt(0)}</div>
            <span class="friend-name">${friend.name}</span>
            <input type="checkbox" class="friend-checkbox" value="${friend.id}">`;

        const checkbox = friendRow.querySelector("input");

        //restore previously selected friends
        checkbox.checked = selectedFriends.some(selected => selected.id === friend.id);

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                if (!selectedFriends.some(selected => selected.id === friend.id)) {
                    selectedFriends.push(friend);
                }
            } else {
                selectedFriends = selectedFriends.filter
                    (selected => selected.id !== friend.id);
            }
            updateSelectedCount();
        });
        friendsList.appendChild(friendRow);
    });
    updateSelectedCount();
}
//update selected friends count
function updateSelectedCount() {
    document.getElementById("selectedCount").textContent =
        selectedFriends.length + " friends selected";

    document.getElementById("continueButton").disabled =
        selectedFriends.length === 0;
}
function continueToConfirmation() {
    if (selectedFriends.length === 0) {
        alert("Please select at least one friend.");
        return;
    }
    //retrieve existing event details
    let eventDraft = JSON.parse(sessionStorage.getItem("eventDraft") || "{}");

    //save selected friends to event 
    eventDraft.selectedFriends = selectedFriends;
    sessionStorage.setItem("eventDraft", JSON.stringify(eventDraft));

    //go to confirmation page
    window.location.href = "ConfirmInvites.html"
}
//only run friend selection on the selectFriends page
if (document.getElementById("friendsList")) {
    displayFriends();
}

/*=================================================================
Event confirmation: displaySelectedFriends, displayEventDetails,
sendInvitations, goBackToFriends, ConfirmInvites & confirmation 
page
===================================================================*/
function displaySelectedFriends() {
    const friendsList = document.getElementById("confirmFriendsList");

    friendsList.innerHTML = "";

    if (selectedFriends.length === 0) {
        friendsList.innerHTML = "<p>No friends selected.</p>";
    }
    selectedFriends.forEach(friend => {
        const friendRow = document.createElement("div");

        friendRow.className = "confirm-friend-item";

        friendRow.innerHTML = `
            <div class="confirm-friend-avatar"> ${friend.name.charAt(0)}</div>
            <span class="confirm-friend-name">${friend.name}</span>
            <span class="confirm-check">✓</span>`;

        friendsList.appendChild(friendRow);
    });
}
function displayEventDetails() {
    const eventDetails = document.getElementById("eventDetails");

    //retrieve saved event
    const eventDraft = JSON.parse(sessionStorage.getItem("eventDraft") || "{}");

    //format the date
    const eventDate = new Date(eventDraft.date + "T00:00:00");
    const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    //format the time
    function formatTime(time) {
        const [hour, minute] = time.split(":");
        const date = new Date();
        date.setHours(hour, minute);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    }
    //display info
    eventDetails.innerHTML = `
        <h3>${eventDraft.eventName}</h3>
        <p><strong>Date:</strong>${formattedDate}</p>
        <p><strong>Time:</strong>${formatTime(eventDraft.startTime)}- ${formatTime(eventDraft.endTime)}</p>
        <p><strong>Location:</strong>${eventDraft.location}</p>
    `;
}
//sample
const defaultInvitations = [
    {
        id: 1,
        eventName: "Friday Night Out",
        date: "November 28, 2026",
        time: "7:30 PM",
        location: "Rafter's Bar",
        invitedBy: "John Doe",
        status: "Pending"
    }
];
const invitations = JSON.parse(localStorage.getItem("invitations")) || defaultInvitations;
function displayInvitations() {
    const invitationsContainer = document.getElementById("invitationsContent");

    if (!invitationsContainer) {
        return;
    }

    if (invitations.length === 0) {
        invitationsContainer.innerHTML = "<p>No invitations yet.</p>";
        return;
    }
    invitationsContainer.innerHTML = "";

    invitations.forEach(invitation => {
        const invitationCard = document.createElement("div");
        invitationCard.className = "invitation-card";
        invitationCard.setAttribute("data-invitation-id", invitation.id);

        invitationCard.innerHTML = `
        <div class="invitation-top">
            <h3>${invitation.eventName}</h3>
            <span class="status">${invitation.status}</span>
        </div>

        <p class="invited-by">Invited by ${invitation.invitedBy}</p>

        <div class="invitation-details">
            <p>${invitation.date}</p>
            <p>${invitation.time}</p>
            <p>${invitation.location}</p>
        </div>

        <div class="invitation-actions">
            <button type="button" class="accept-button"
                onclick="acceptInvitation(${invitation.id})">
                Accept
            </button>

            <button type="button" class="decline-button"
                onclick="declineInvitation(${invitation.id})">
                Decline
            </button>
        </div>`;

        invitationsContainer.appendChild(invitationCard);
    });
}
function sendInvitations() {
    const currentEvent = JSON.parse(sessionStorage.getItem("eventDraft") || "{}");
    if (selectedFriends.length === 0) {
        alert("No friends selected.");
        return;
    }
    //save invitation info
    eventDraft.invitationStatus = "sent";
    eventDraft.invitedFriends = selectedFriends;

    sessionStorage.setItem("eventDraft", JSON.stringify(currentEvent));
    //display succes message
    document.querySelector(".confirm-content").innerHTML = `
        <div class="confirm-success">
            <h1> Invitations Sent!</h1>
            <P>You have invited ${selectedFriends.length} 
            friend(s) to your event.<p>
            <button class="send-invites-button" onclick ="window.location.href='HomePage.html'">
                Return Home
            </button> 
        </div>`;
}
//only run friend confirmation on the ConfirmInvites page
if (document.getElementById("confirmFriendsList")) {
    displaySelectedFriends();
}
//only display event details on the confirmation page
if (document.getElementById("eventDetails")) {
    displayEventDetails();
}
/*=================================================================
Homepage events: displayHomeEvents, event time & date formatting
===================================================================*/
function displayHomeEvents() {
    const eventsList = document.getElementById("eventsList");
    if (!eventsList) return;
    const eventDraft = JSON.parse(sessionStorage.getItem("eventDraft") || "{}");

    //if no event has been created
    if (!eventDraft.eventName) {
        eventsList.innerHTML = "<p>No events yet. Create an event to get started!<p>";
        return;
    }
    eventsList.innerHTML = "";

    //create event car
    const eventCard = document.createElement("div");
    eventCard.className = "event-card";

    //event name
    const eventName = document.createElement("h3");
    eventName.textContent = eventDraft.eventName;

    //date
    const eventDate = document.createElement("p");
    if (eventDraft.date) {
        const date = new Date(eventDraft.date + "T00:00:00");
        eventDate.textContent = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }
    //time
    const eventTime = document.createElement("p");
    eventTime.textContent = formatEventTime(eventDraft.startTime) +
        " - " + formatEventTime(eventDraft.endTime);
    //location
    const eventLocation = document.createElement("p");
    eventLocation.textContent = "📍 " + (eventDraft.location || "Location not provided");

    //friends invited
    const invitedCount = document.createElement("p");
    invitedCount.textContent = (eventDraft.selectedFriends?.length || 0) + " friends invited";

    //add info to card
    eventCard.appendChild(eventName);
    eventCard.appendChild(eventDate);
    eventCard.appendChild(eventTime);
    eventCard.appendChild(eventLocation);
    eventCard.appendChild(invitedCount);

    eventsList.appendChild(eventCard);
}
//format event time
function formatEventTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}
/*=================================================================
Invitations: openInvitations, acceptInvitation, declineInvitation
===================================================================*/
function openInvitations() {
    window.location.href = "Invitations.html";
}
function acceptInvitation(id) {
    const invitation = document.querySelector(`[data-invitation-id="${id}"]`);

    if (!invitation) {
        return;
    }

    invitation.querySelector(".status").textContent = "Accepted";
    const selectedInvitation = invitations.find(item => item.id === id);
    if (selectedInvitation) {
        selectedInvitation.status = "Accepted";
        localStorage.setItem("invitations", JSON.stringify(invitations));
    }
    invitation.querySelector(".status").classList.add("accepted");

    invitation.querySelector(".invitation-actions").remove();

    const message = document.createElement("p");
    message.className = "invitation-message";
    message.textContent = "✓ You joined this event!";
    invitation.appendChild(message);
}
function declineInvitation(id) {
    const invitation = document.querySelector(`[data-invitation-id="${id}"]`);

    if (!invitation) {
        return;
    }

    invitation.querySelector(".status").textContent = "Declined";
    const selectedInvitation = invitations.find(item => item.id === id);
    if (selectedInvitation) {
        selectedInvitation.status = "Declined";
        localStorage.setItem("invitations", JSON.stringify(invitations));
    }
    invitation.querySelector(".status").classList.add("declined");

    invitation.querySelector(".invitation-actions").remove();

    const message = document.createElement("p");
    message.className = "invitation-message";
    message.textContent = "Invitation declined!";
    invitation.appendChild(message);
}
/*=================================================================
Friends & menu: addFriends, joinEvent, toggleMenu    
===================================================================*/
function addFriends() {
    window.location.href = "AddFriends.html";
}
function joinEvent() {
    window.location.href = "JoinEvent.html";
}
function toggleMenu() {
    const menuOptions = document.getElementById("menuOptions");
    menuOptions.style.display = menuOptions.style.display === "block" ? "none" : "block";
}
/*=================================================================
Location & map: getLocation, showPosition, locationError, 
shareLocation, closePopup
===================================================================*/
//Get user location
let map;
let marker;
//initialize map
function initializeMap() {
    if (map) return;

    map = L.map("map").setView([34.0, -89.0], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
}
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
function shareLocation() {
    closePopup();

    if (navigator.geolocation) {
        document.getElementById("locationMessage").textContent =
            "Geolocation is not supported.";
        return;
    }
    navigator.geolocation.getCurrentPosition(showPosition, locationError);
}
function closePopup() {
    document.getElementById("popup").classList.remove("show");
    localStorage.setItem("locationPromptAnswered", "true");
}
/*=================================================================
SOS: SOS, cancelSOS, call911                                    
===================================================================*/
//sos button 
let sosTimer;
let countdown = 5;
function SOS() {
    const popup = document.getElementById("sosPopup");
    popup.style.display = "flex";

    countdown = 5;
    document.getElementById("countdown").textContent = countdown;
    clearInterval(sosTimer);

    sosTimer = setInterval(function () {
        countdown--;

        document.getElementById("countdown").textContent = countdown;

        if (countdown <= 0) {
            clearInterval(sosTimer);

            document.getElementById("countdown").textContent = "Need help?";
        }
    }, 1000);
}
function cancelSOS() {
    clearInterval(sosTimer);
    document.getElementById("sosPopup").style.display = "none";
}
function call911() {
    clearInterval(sosTimer);
    window.location.href = "tel:911";
}
/*=================================================================
Appearance: applyAppearance, updateAutoTheme
===================================================================*/
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

/*=================================================================
friend requests, find friends
===================================================================*/
function displayFriendRequests(){
    const requestsContainer = document.getElementById("friendsRequests");

    const requests = JSON.parse(localStorage.getItem("friendRequests")) || [];

    if (requests.length === 0) {
        requestsContainer.innerHTML = '<p class="empty-message">No new friend requests.</p>';
        return;
    }
    requestsContainer.innerHTML = "";

    requests.forEach((request, index) => {
        const requestCard = document.createElement("div");
        requestCard.className = "friend-request-card";

        requestCard.innerHTML = ` 
        <div class="request-info"> 
            <strong>${request.name}</strong>
            <p>@${request.username}</p>
        </div>
        
        <div class="request-actions">
            <button onclick="acceptFriendRequest(${index})">
                Accept
            </button>
            <button onclick="declineFriendRequest(${index})">
                Decline
            </button>
        </div>`;
        requestsContainer.appendChild(requestCard);
    });
}
function acceptFriendRequest(index) {
    const requests = JSON.parse(localStorage.getItem("friendRequests")) || [];
    const request = requests[index];

    if (!request) return;

    const friends = JSON.parse(localStorage.getItem("myFriends")) || [];

    friends.push(request);

    localStorage.setItem("myFriends", JSON.stringify(friends));

    requests.splice(index, 1);

    localStorage.setItem("friendRequests", JSON.stringify(requests));

    displayFriendRequests();
    displayMyFriends();
}
function declineFriendRequest(index) {
    const requests = JSON.parse(localStorage.getItem("friendRequests")) || [];
    
    requests.splice(index, 1);

    localStorage.setItem("friendRequests", JSON.stringify(requests));

    displayFriendRequests();
}
function displayMyFriends() {
    const friendsContainer = document.getElementById("myFriends");

    const friends = JSON.parse(localStorage.getItem("myFriends")) || [];

    if (friends.length === 0) {
        friendsContainer.innerHTML = '<p class="empty-message">You haven\'t added any friends yet.</p>';
        return;
    }
    friendsContainer.innerHTML = "";

    friends.forEach((friend) => {
        const friendCard = document.createElement("div");
        friendCard.className = "friend-card";

        friendCard.innerHTML = ` 
        <div class="friend-info"> 
            <strong>${friend.name}</strong>
            <p>@${friend.username}</p>
        </div>`;
        friendsContainer.appendChild(friendCard);
    });
}
function searchFriends() {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("findFriends");
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === "") {
        resultsContainer.innerHTML = "<p>No suggestions yet.</p>";
        return;
    }

    const results = sampleUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p>No users found.</p>";
        return;
    }

    resultsContainer.innerHTML = "";

    results.forEach(user => {
        const userCard = document.createElement("div");
        userCard.className = "friend-card";

        userCard.innerHTML = `
            <div class="friend-info">
                <strong>${user.name}</strong>
                <p>@${user.username}</p>
            </div>
        `;

        resultsContainer.appendChild(userCard);
    });
}
// Sample users for Find Friends
const sampleUsers = [
    { name: "Jane Doe", username: "janedoe" },
    { name: "Maria Black", username: "mariablack" },
    { name: "Cierra Johnson", username: "cierraj" },
    { name: "Emily Davison", username: "emilyd" },
    { name: "John Doe", username: "johndoe" }
];
/*=================================================================
Page Initialization
===================================================================*/
//load add friends page
document.addEventListener("DOMContentLoaded", () => {
    displayFriendRequests();
    displayMyFriends();
});
document.querySelector(".add-friends .search-bar input")
    ?.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchFriends();
        }
});
const publicEvents = [
    {
        name: "Friday Night Out",
        date: "November 28, 2026",
        time: "7:30 PM",
        location: "Rafter's Bar",
        host: "Jane Doe",
        members:["Jane Doe", "Maria Black", "Cierra Johnson"]
    }
];
function displayPublicEvents() {
    const eventsContainer = document.getElementById("publicEvents");

    if (!eventsContainer) {
        return;
    }

    if (publicEvents.length === 0) {
        eventsContainer.innerHTML = "<p>No public events available.</p>";
        return;
    }
    eventsContainer.innerHTML = "";

    publicEvents.forEach(event => {
        const eventCard = document.createElement("div");
        eventCard.className = "public-event-card";

        eventCard.innerHTML = `
        <h3>${event.name}</h3>
        <p>Hosted by ${event.host}</p>
        <p>${event.date} · ${event.time}</p>
        <p><strong>Group Members:</strong></p>
        <p>${event.members.join(", ")}</p>
        <button type="button" onclick="joinEvent('${event.name}')">
            Join Event
        </button>`;
        

        eventsContainer.appendChild(eventCard);
    });
}
document.addEventListener("DOMContentLoaded", displayPublicEvents);
document.addEventListener("DOMContentLoaded", displayInvitations);
//display event only on the home page
if (document.getElementById("eventsList")) {
    initializeMap();
    displayHomeEvents();

    if (!localStorage.getItem("locationPromptAnswered")) {
        document.getElementById("popup").classList.add("show");
    }
}
const assert = require("node:assert/strict");
const test = require("node:test");
const { createApp, createLeafletMock } = require("./app-fixture");

test("navigation actions lead to their corresponding pages", () => {
    const { app } = createApp();

    app.login();
    assert.equal(app.window.location.href, "HomePage.html");
    app.forgotPassword();
    assert.equal(app.window.location.href, "ForgotPassword.html");
    app.goToCreateAccount();
    assert.equal(app.window.location.href, "CreateAccount.html");
    app.goToLogin();
    assert.equal(app.window.location.href, "LoginPage.html");
    app.logout();
    assert.equal(app.window.location.href, "LoginPage.html");
});

test("password reset rejects blank input and accepts a nonblank address", () => {
    const { app, elements } = createApp();
    const email = elements.get("resetEmail");
    const message = elements.get("resetMessage");

    email.value = "   ";
    app.sendResetEmail();
    assert.equal(message.textContent, "Please enter your email.");

    email.value = "friend@example.com";
    app.sendResetEmail();
    assert.equal(
        message.textContent,
        "Password reset instructions have been sent to your email."
    );
});

test("search opens and focuses the input, then clears and closes", () => {
    const { app, elements } = createApp();
    const searchButton = elements.get("searchButton");
    const container = elements.get("search-container");
    const input = elements.get("searchInput");

    app.openSearch();
    assert.equal(searchButton.style.display, "none");
    assert.equal(container.style.display, "flex");
    assert.equal(input.focused, true);

    input.value = "friends nearby";
    app.closeSearch();
    assert.equal(input.value, "");
    assert.equal(container.style.display, "none");
    assert.equal(searchButton.style.display, "flex");
});

test("location reports unsupported browsers without attempting a request", () => {
    const { app, elements } = createApp();

    app.getLocation();

    assert.equal(
        elements.get("locationMessage").textContent,
        "Geolocation is not supported."
    );
});

test("location success initializes the map and updates its marker on later fixes", () => {
    const leaflet = createLeafletMock();
    const { app, elements } = createApp({
        leaflet: leaflet.leaflet,
        navigator: {
            geolocation: {
                getCurrentPosition(success, error) {
                    this.success = success;
                    this.error = error;
                }
            }
        }
    });

    app.getLocation();
    app.navigator.geolocation.success({
        coords: { latitude: 40.015, longitude: -105.2705 }
    });
    assert.equal(
        elements.get("locationMessage").textContent,
        "Your location has been found."
    );

    app.getLocation();
    app.navigator.geolocation.success({
        coords: { latitude: 40.016, longitude: -105.271 }
    });

    assert.deepEqual(leaflet.calls.map, ["map"]);
    assert.deepEqual(
        leaflet.calls.marker.map(coords => Array.from(coords)),
        [[40.015, -105.2705]]
    );
    assert.deepEqual(
        leaflet.calls.setLatLng.map(coords => Array.from(coords)),
        [[40.016, -105.271]]
    );
    assert.deepEqual(
        leaflet.calls.setView.map(({ coords, zoom }) => ({
            coords: Array.from(coords),
            zoom
        })),
        [
            { coords: [40.015, -105.2705], zoom: 15 },
            { coords: [40.016, -105.271], zoom: 15 }
        ]
    );
});

test("invalid GPS coordinates report an error and preserve the last valid map position", () => {
    const leaflet = createLeafletMock();
    const { app, elements } = createApp({
        leaflet: leaflet.leaflet
    });

    app.showPosition({
        coords: { latitude: 40.015, longitude: -105.2705 }
    });
    app.showPosition({
        coords: { latitude: Number.NaN, longitude: -105.271 }
    });
    app.showPosition({
        coords: { latitude: 91, longitude: -181 }
    });
    app.showPosition({});

    assert.deepEqual(leaflet.calls.setView.map(({ coords, zoom }) => ({
        coords: Array.from(coords),
        zoom
    })), [
        { coords: [40.015, -105.2705], zoom: 15 }
    ]);
    assert.equal(
        elements.get("locationMessage").textContent,
        "Your location is unavailable."
    );
});

test("valid GPS coordinates at the geographic limits are accepted", () => {
    const leaflet = createLeafletMock();
    const { app, elements } = createApp({
        leaflet: leaflet.leaflet
    });

    app.showPosition({
        coords: { latitude: -90, longitude: -180 }
    });
    app.showPosition({
        coords: { latitude: 90, longitude: 180 }
    });

    assert.equal(leaflet.calls.setView.length, 2);
    assert.equal(leaflet.calls.marker.length, 1);
    assert.deepEqual(
        leaflet.calls.setLatLng.map(coords => Array.from(coords)),
        [[90, 180]]
    );
    assert.equal(
        elements.get("locationMessage").textContent,
        "Your location has been found."
    );
});

test("location failures report permission, unavailable, timeout, and unknown errors", () => {
    const { app, elements } = createApp();
    const message = elements.get("locationMessage");

    for (const [error, expected] of [
        [{ code: 1 }, "Location permission was denied."],
        [{ code: 2 }, "Your location is unavailable."],
        [{ code: 3 }, "The location request timed out."],
        [{ code: 99 }, "Unable to get your location."],
        [undefined, "Unable to get your location."]
    ]) {
        app.locationError(error);
        assert.equal(message.textContent, expected);
    }
});

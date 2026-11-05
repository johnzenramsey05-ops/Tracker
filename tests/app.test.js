const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const appScript = fs.readFileSync(
    path.join(__dirname, "..", "JavaScript.js"),
    "utf8"
);

function createApp(options = {}) {
    const elements = new Map();
    const makeElement = () => ({
        style: {},
        value: "",
        textContent: "",
        focus() {
            this.focused = true;
        }
    });

    for (const id of [
        "locationMessage",
        "resetEmail",
        "resetMessage",
        "searchButton",
        "search-container",
        "searchInput"
    ]) {
        elements.set(id, makeElement());
    }

    const rootAttributes = {};
    const listeners = {};
    const locationCalls = [];
    const document = {
        documentElement: {
            setAttribute(name, value) {
                rootAttributes[name] = value;
            }
        },
        hidden: false,
        getElementById(id) {
            if (!elements.has(id)) {
                elements.set(id, makeElement());
            }
            return elements.get(id);
        },
        querySelectorAll() {
            return [];
        },
        querySelector() {
            return null;
        },
        addEventListener(name, callback) {
            listeners[name] = callback;
        }
    };

    const matchMedia = {
        matches: options.prefersDark ?? false,
        addEventListener() {}
    };
    const storage = new Map(
        Object.entries(options.storage || {})
    );
    const localStorage = {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, String(value));
        }
    };

    const sandbox = {
        console: { log() {} },
        document,
        localStorage,
        navigator: options.navigator || {},
        window: {
            location: { href: "" },
            matchMedia() {
                return matchMedia;
            }
        },
        alert() {},
        L: options.leaflet,
        Date
    };
    vm.createContext(sandbox);
    vm.runInContext(appScript, sandbox, { filename: "JavaScript.js" });

    return {
        app: sandbox,
        elements,
        listeners,
        locationCalls,
        rootAttributes,
        storage
    };
}

function createLeafletMock() {
    const calls = {
        map: [],
        setView: [],
        tileLayer: [],
        marker: [],
        setLatLng: []
    };
    const map = {
        setView(coords, zoom) {
            calls.setView.push({ coords, zoom });
            return this;
        }
    };
    const marker = {
        addTo(targetMap) {
            assert.equal(targetMap, map);
            return this;
        },
        bindPopup() {
            return this;
        },
        openPopup() {
            return this;
        },
        setLatLng(coords) {
            calls.setLatLng.push(coords);
        }
    };
    const leaflet = {
        map(containerId) {
            calls.map.push(containerId);
            return map;
        },
        tileLayer(url, options) {
            calls.tileLayer.push({ url, options });
            return { addTo() {} };
        },
        marker(coords) {
            calls.marker.push(coords);
            return marker;
        }
    };
    return { calls, leaflet };
}

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

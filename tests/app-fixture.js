const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

module.exports = { createApp, createLeafletMock };

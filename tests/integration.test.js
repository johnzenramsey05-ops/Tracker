const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { createApp, createLeafletMock } = require("./app-fixture");

const repositoryRoot = path.join(__dirname, "..");

function loadPage(name) {
    const html = fs.readFileSync(
        path.join(repositoryRoot, name),
        "utf8"
    );
    const scriptReferences = [
        ...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)
    ].map(match => match[1]);

    assert.equal(
        scriptReferences.filter(src => src === "JavaScript.js").length,
        1,
        `${name} should load JavaScript.js exactly once`
    );
    return html;
}

function clickButton(app, html, label) {
    const buttons = [...html.matchAll(
        /<button\b([^>]*)>([\s\S]*?)<\/button>/gi
    )];
    const button = buttons.find(([, , content]) =>
        content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() === label
    );

    assert.ok(button, `Expected a "${label}" button in page markup`);
    const handler = button[1].match(/\bonclick=["']\s*([A-Za-z_$][\w$]*)\s*\(\s*\)\s*["']/i);
    assert.ok(handler, `Expected "${label}" button to call an app function`);
    assert.equal(
        typeof app[handler[1]],
        "function",
        `Expected ${handler[1]} to be defined by JavaScript.js`
    );
    app[handler[1]]();
}

test("login page buttons invoke the shared app navigation", () => {
    const html = loadPage("LoginPage.html");
    const { app } = createApp();

    clickButton(app, html, "Login");
    assert.equal(app.window.location.href, "HomePage.html");

    clickButton(app, html, "Forgot Password?");
    assert.equal(app.window.location.href, "ForgotPassword.html");

    clickButton(app, html, "Create Account");
    assert.equal(app.window.location.href, "CreateAccount.html");
});

test("forgot-password page connects its input, feedback, and back navigation", () => {
    const html = loadPage("ForgotPassword.html");
    const { app, elements } = createApp();

    assert.match(html, /id=["']resetEmail["']/);
    assert.match(html, /id=["']resetMessage["']/);
    elements.get("resetEmail").value = "   ";
    clickButton(app, html, "Send Reset Email");
    assert.equal(
        elements.get("resetMessage").textContent,
        "Please enter your email."
    );

    elements.get("resetEmail").value = "friend@example.com";
    clickButton(app, html, "Send Reset Email");
    assert.equal(
        elements.get("resetMessage").textContent,
        "Password reset instructions have been sent to your email."
    );

    clickButton(app, html, "Back to Login");
    assert.equal(app.window.location.href, "LoginPage.html");
});

test("home page location control requests GPS and displays the map result", () => {
    const html = loadPage("HomePage.html");
    const leaflet = createLeafletMock();
    let successCallback;
    const { app, elements } = createApp({
        leaflet: leaflet.leaflet,
        navigator: {
            geolocation: {
                getCurrentPosition(success) {
                    successCallback = success;
                }
            }
        }
    });

    assert.match(
        html,
        /<script\b[^>]*src=["']https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js["'][^>]*>/i
    );
    assert.match(html, /id=["']map["']/);
    assert.match(html, /id=["']locationMessage["']/);

    clickButton(app, html, "My Location");
    assert.equal(typeof successCallback, "function");
    successCallback({
        coords: { latitude: 40.015, longitude: -105.2705 }
    });

    assert.deepEqual(leaflet.calls.map, ["map"]);
    assert.equal(
        elements.get("locationMessage").textContent,
        "Your location has been found."
    );
});

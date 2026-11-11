const test = require("node:test");
const assert = require("node:assert/strict");
const {
    isValidEmail,
    validatePassword,
    validateRegistration
} = require("../validation.js");

test("accepts valid addresses from common email providers", () => {
    for (const email of [
        "alex.jones@gmail.com",
        "sam@yahoo.com",
        "taylor@outlook.com",
        "casey@hotmail.com",
        "jordan@icloud.com"
    ]) {
        assert.equal(isValidEmail(email), true, `${email} should be accepted`);
    }
});

test("accepts valid email formats beyond a fixed provider allowlist", () => {
    assert.equal(isValidEmail("first.last+tag@school.edu"), true);
    assert.equal(isValidEmail("person@mail.example.co.uk"), true);
});

test("rejects malformed email addresses", () => {
    for (const email of [
        "plainaddress",
        "@gmail.com",
        "person@",
        "person@gmail",
        "first..last@yahoo.com",
        "person name@outlook.com",
        "person@@gmail.com",
        " person@gmail.com",
        "@email.sss",
        "person@.com",
        "person@email..com",
        "person@-email.com",
        "person@email-.com"
    ]) {
        assert.equal(isValidEmail(email), false, `${email} should be rejected`);
    }
});

test("accepts a 12-character password with capital, number, and symbol", () => {
    assert.deepEqual(validatePassword("SecurePass1!", "Alex", "Jones"), []);
});

test("accepts registration at the 12-character password boundary", () => {
    assert.deepEqual(validateRegistration({
        firstName: "Alex",
        lastName: "Jones",
        email: "alex.jones+test@gmail.com",
        password: "SecurePass1!",
        confirmPassword: "SecurePass1!"
    }), []);
});

test("rejects passwords shorter than 12 characters", () => {
    const errors = validatePassword("Abcdefg1!xy", "Alex", "Jones");
    assert.ok(errors.some(error => error.includes("12 characters")));
});

test("rejects passwords without a capital letter, number, or symbol", () => {
    assert.ok(validatePassword("lowercaseonly1!", "Alex", "Jones")
        .some(error => error.includes("capital letter")));
    assert.ok(validatePassword("NoNumberHere!!", "Alex", "Jones")
        .some(error => error.includes("number")));
    assert.ok(validatePassword("NoSymbolHere123", "Alex", "Jones")
        .some(error => error.includes("symbol")));
});

test("rejects a password containing the first name, ignoring case", () => {
    const errors = validatePassword("AlexSecure9!xx", "Alex", "Jones");
    assert.ok(errors.some(error => error.includes("first or last name")));
});

test("rejects a password containing the last name, ignoring case", () => {
    const errors = validatePassword("SafeJONES9!xxx", "Alex", "Jones");
    assert.ok(errors.some(error => error.includes("first or last name")));
});

test("rejects an exactly 12-character password that contains the first name", () => {
    const password = "AlexSecure1!";
    assert.equal(password.length, 12);

    const errors = validatePassword(password, "Alex", "Jones");
    assert.ok(errors.some(error => error.includes("first or last name")));
    assert.equal(errors.some(error => error.includes("12 characters")), false);
});

test("registration rejects a valid email when the 12-character password contains the last name", () => {
    const password = "JonesSafe1!x";
    assert.equal(password.length, 12);

    const errors = validateRegistration({
        firstName: "Alex",
        lastName: "Jones",
        email: "alex@yahoo.com",
        password,
        confirmPassword: password
    });
    assert.deepEqual(errors, ["Password must not contain your first or last name."]);
});

test("registration validation rejects invalid email and mismatched passwords", () => {
    const errors = validateRegistration({
        firstName: "Alex",
        lastName: "Jones",
        email: "not-an-email",
        password: "SecurePass1!",
        confirmPassword: "DifferentPass1!"
    });
    assert.ok(errors.some(error => error.includes("valid email")));
    assert.ok(errors.some(error => error.includes("do not match")));
});

test("security regression: whitespace alone must not satisfy the symbol rule", () => {
    const password = "Abcdefghij1 ";
    assert.equal(password.length, 12);

    const errors = validatePassword(password, "Alex", "Jones");
    assert.ok(errors.some(error => error.includes("symbol")));
});

test("regression: registration must reject missing required names", () => {
    const errors = validateRegistration({
        firstName: " ",
        lastName: "",
        email: "alex.jones@gmail.com",
        password: "SecurePass1!",
        confirmPassword: "SecurePass1!"
    });
    assert.ok(errors.some(error => error.includes("first name")));
    assert.ok(errors.some(error => error.includes("last name")));
});

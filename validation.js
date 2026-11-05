/* Shared account-form validation for the browser and the Node test suite. */
(function (root) {
    function isValidEmail(email) {
        if (typeof email !== "string" || email.length > 254 || email.trim() !== email) {
            return false;
        }

        const at = email.lastIndexOf("@");
        if (at < 1 || at !== email.indexOf("@")) {
            return false;
        }

        const local = email.slice(0, at);
        const domain = email.slice(at + 1);
        const localPartPattern = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
        if (local.length > 64 || !localPartPattern.test(local) || domain.length > 253) {
            return false;
        }

        const labels = domain.split(".");
        if (labels.length < 2) {
            return false;
        }

        const validLabel = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
        if (!labels.every(label => label.length <= 63 && validLabel.test(label))) {
            return false;
        }

        const topLevelDomain = labels[labels.length - 1];
        return /^[A-Za-z]{2,63}$/.test(topLevelDomain)
            || /^xn--[A-Za-z0-9-]{2,59}$/i.test(topLevelDomain);
    }

    function validatePassword(password, firstName, lastName) {
        const errors = [];
        if (typeof password !== "string" || password.length < 12) {
            errors.push("Password must be at least 12 characters long.");
        }
        if (typeof password !== "string" || !/[A-Z]/.test(password)) {
            errors.push("Password must include a capital letter.");
        }
        if (typeof password !== "string" || !/[0-9]/.test(password)) {
            errors.push("Password must include a number.");
        }
        if (typeof password !== "string" || !/[^A-Za-z0-9]/.test(password)) {
            errors.push("Password must include a symbol.");
        }

        const normalizedPassword = typeof password === "string" ? password.toLowerCase() : "";
        const names = [firstName, lastName]
            .filter(name => typeof name === "string" && name.trim() !== "")
            .map(name => name.trim().toLowerCase());
        if (names.some(name => normalizedPassword.includes(name))) {
            errors.push("Password must not contain your first or last name.");
        }

        return errors;
    }

    function validateRegistration(fields) {
        const errors = [];
        const email = fields.email;
        if (!isValidEmail(email)) {
            errors.push("Enter a valid email address.");
        }

        errors.push(...validatePassword(fields.password, fields.firstName, fields.lastName));

        if (fields.password !== fields.confirmPassword) {
            errors.push("Passwords do not match.");
        }
        return errors;
    }

    const validation = { isValidEmail, validatePassword, validateRegistration };
    root.CyberTrakValidation = validation;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = validation;
    }
})(typeof window !== "undefined" ? window : globalThis);

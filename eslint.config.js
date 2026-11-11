const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: ["node_modules/**"]
    },
    js.configs.recommended,
    {
        files: ["JavaScript.js"],
        languageOptions: {
            sourceType: "script",
            globals: {
                ...globals.browser,
                L: "readonly"
            }
        },
        rules: {
            eqeqeq: "error"
        }
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: globals.node
        }
    }
];

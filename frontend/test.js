function add(a, b) {
    return a + b;
}

if (add(2, 3) !== 5) {
    process.exit(1);
}

console.log("Frontend tests passed.");
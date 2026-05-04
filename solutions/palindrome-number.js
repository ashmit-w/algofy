const input = require("fs").readFileSync(0, "utf-8").trim();
const x = Number(input);

function isPalindrome(x) {
    if (x < 0) return false;

    let original = x;
    let reversed = 0;

    while (x > 0) {
        reversed = reversed * 10 + (x % 10);
        x = Math.floor(x / 10);
    }

    return original === reversed;
}

console.log(isPalindrome(x));
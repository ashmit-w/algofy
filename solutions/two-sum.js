const input = require("fs").readFileSync(0, "utf-8").trim().split("\n");

const arr = input[0].split(" ").map(Number);
const target = Number(input[1]);

function twoSum(arr, target) {
    const map = {};

    for (let i = 0; i < arr.length; i++) {
        const complement = target - arr[i];

        if (map.hasOwnProperty(complement)) {
            return [map[complement], i];
        }

        map[arr[i]] = i;
    }
}

const result = twoSum(arr, target);
console.log(result.sort((a, b) => a - b).join(" "));
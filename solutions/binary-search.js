const input = require("fs").readFileSync(0, "utf-8").trim().split("\n");

const arr = input[0].split(" ").map(Number);
const target = Number(input[1]);

function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

console.log(binarySearch(arr, target));
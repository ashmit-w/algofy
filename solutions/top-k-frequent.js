const input = require("fs").readFileSync(0, "utf-8").trim().split("\n");

const nums = input[0].split(" ").map(Number);
const k = Number(input[1]);

function topKFrequent(nums, k) {
    const freq = {};

    for (let num of nums) {
        freq[num] = (freq[num] || 0) + 1;
    }

    const buckets = Array(nums.length + 1).fill().map(() => []);

    for (let num in freq) {
        buckets[freq[num]].push(Number(num));
    }

    const res = [];
    for (let i = buckets.length - 1; i >= 0 && res.length < k; i--) {
        for (let num of buckets[i]) {
            res.push(num);
            if (res.length === k) break;
        }
    }

    return res;
}

console.log(topKFrequent(nums, k).join(" "));
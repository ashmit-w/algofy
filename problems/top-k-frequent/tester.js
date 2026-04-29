module.exports = function (input, output) {
  const lines = input.trim().split("\n");
  const nums = lines[0].trim().split(" ").map(Number);
  const k = parseInt(lines[1].trim(), 10);

  const userNums = output.trim().split(" ").map(Number);
  if (userNums.length !== k) return false;
  if (userNums.some(isNaN)) return false;

  // build frequency map
  const freq = {};
  for (const n of nums) freq[n] = (freq[n] || 0) + 1;

  // find the k-th highest frequency (minimum frequency required)
  const sortedFreqs = Object.values(freq).sort((a, b) => b - a);
  const minFreq = sortedFreqs[k - 1];

  // every element the user returned must have frequency >= minFreq
  // and must actually exist in the input
  for (const n of userNums) {
    if (!freq[n] || freq[n] < minFreq) return false;
  }

  // no duplicates in user output
  if (new Set(userNums).size !== userNums.length) return false;

  return true;
};

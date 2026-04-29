module.exports = function (input, output) {
  const nums = input.trim().split(' ').map(Number);
  const idx = parseInt(output.trim(), 10);

  if (isNaN(idx) || idx < 0 || idx >= nums.length) return false;

  const left  = idx === 0              ? -Infinity : nums[idx - 1];
  const right = idx === nums.length - 1 ? -Infinity : nums[idx + 1];

  return nums[idx] > left && nums[idx] > right;
};

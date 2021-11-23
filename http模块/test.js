var isMatch = function (s, p) {
  const dp = [];
  for (let i = 0; i <= s.length; i++) {
    dp[i] = [];
    for (let j = 0; j <= p.length; j++) {
      dp[i][j] = 0;
    }
  }
  // dp[i][j]表示s的前i个字符与p的前j个字符是否匹配
  dp[0][0] = 1;

  // 初始化首行
  for (let j = 2; j <= p.length; j += 2) {
    // 首行i=0，表示匹配串为空，只有模式串的偶数位上的字符均为*时才匹配
    if (dp[0][j - 2] && p[j - 1] === "*") {
      dp[0][j] = 1;
    }
  }

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= p.length; j++) {
      if (p[j - 1] !== "*") {
        if (s[i - 1] === p[j - 1] || p[j - 1] === ".") {
          dp[i][j] = dp[i - 1][j - 1];
        }
      } else {
        dp[i][j] = dp[i][j - 2]; // *前的字符重复0次
        if (s[i - 1] === p[j - 2] || p[j - 2] === ".") {
          dp[i][j] |= dp[i - 1][j];
        }
      }
    }
  }
  console.log(dp);
  return dp[s.length][p.length];
};
console.log(isMatch("aaa", "ab*a*c*a"));
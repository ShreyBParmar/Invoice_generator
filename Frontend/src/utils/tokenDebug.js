// TOKEN DEBUGGING UTILITY

export const checkTokenStatus = () => {
  const token = localStorage.getItem("token");
  
  const status = {
    exists: !!token,
    token: token || "NOT FOUND",
    length: token ? token.length : 0,
    firstChars: token ? token.substring(0, 20) + "..." : "N/A",
    storedAt: token ? "localStorage" : "NOT STORED",
    timestamp: new Date().toLocaleTimeString()
  };
  
  console.log("=== TOKEN DEBUG ===");
  console.log("Token Exists:", status.exists);
  console.log("Token Length:", status.length);
  console.log("First chars:", status.firstChars);
  console.log("Full Token:", token);
  console.log("All localStorage keys:", Object.keys(localStorage));
  console.log("All localStorage values:", { ...localStorage });
  console.log("================");
  
  return status;
};

export const displayTokenStatus = () => {
  const status = checkTokenStatus();
  const message = `
  🔍 TOKEN STATUS:
  ✓ Exists: ${status.exists}
  ✓ Length: ${status.length}
  ✓ Stored in: ${status.storedAt}
  ✓ Time: ${status.timestamp}
  ✓ Token: ${status.firstChars}
  `;
  console.log(message);
  return status;
};

export const clearToken = () => {
  localStorage.removeItem("token");
  console.log("✓ Token cleared from localStorage");
};

export const setTestToken = () => {
  const testToken = "test_token_" + Date.now();
  localStorage.setItem("token", testToken);
  console.log("✓ Test token set:", testToken);
  checkTokenStatus();
};

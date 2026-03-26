const URL = "http://localhost:3000/api";
const email = "admin" + Date.now() + "@test.com";

async function testFlow() {
  try {
    console.log("== 1. Registering new admin user ==");
    const regRes = await fetch(`${URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123", role: "ADMIN" })
    });
    console.log("Status:", regRes.status);
    console.log("Response:", await regRes.text());

    console.log("\n== 2. Logging in to get Token ==");
    const loginRes = await fetch(`${URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123" })
    });
    const loginText = await loginRes.text();
    console.log("Status:", loginRes.status);
    
    let token = loginText;
    try {
      const data = JSON.parse(loginText);
      token = data.token || data;
    } catch(e) {}
    
    // Remove quotes if the token was returned as a raw string
    token = token.replace(/"/g, '');
    console.log("Token received.");

    console.log("\n== 3. Accessing Protected Admin Route (Triggers AI Engine) ==");
    const adminRes = await fetch(`${URL}/admin`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "User-Agent": "TestAutomation/1.0"
      }
    });
    console.log("Status:", adminRes.status);
    const adminText = await adminRes.text();
    let prettyAdmin = adminText;
    try { prettyAdmin = JSON.stringify(JSON.parse(adminText), null, 2); } catch(e){}
    console.log("Response:\n" + prettyAdmin);

  } catch (err) {
    console.error("Test failed:", err);
  }
}

testFlow();

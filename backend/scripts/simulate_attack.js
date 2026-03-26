const { Pool } = require("pg");
require("dotenv").config({ path: ".env" });

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/insider_threat_db" });

async function runAttack() {
  console.log("Preparing Zero-Trust AI Execution Test...");
  const usersRes = await pgPool.query("SELECT id, email FROM users WHERE is_active = true LIMIT 1");
  
  if(usersRes.rowCount === 0) { 
    console.log("No active targets found."); 
    process.exit(1); 
  }
  
  const victim = usersRes.rows[0];
  console.log(`[ATTACK INITIATED] Compensating Target: ${victim.email}`);
  console.log(`Launching brute-force exfiltration packet. Machine Learning should catch this instantly!`);
  
  // Fire off 25 downloads in under 2 seconds
  let count = 0;
  const attackInterval = setInterval(async () => {
    try {
      const payload = {
        userId: victim.id,
        action: "MASS_SENSITIVE_DATA_EXFILTRATION",
        ipAddress: "185.22.4." + Math.floor(Math.random() * 255), // Suspicious distinct external IPs
        userAgent: "Python-urllib/Bot-0.2"
      };

      await fetch("http://localhost:5000/api/platform/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      console.log(`[MALICIOUS] Exfiltrating block ${count} for ${victim.email}`);
    } catch(e) { }
    
    count++;
    if(count >= 25) {
      clearInterval(attackInterval);
      console.log("\n[SUCCESS] Attack Burst Complete!");
      console.log("Check the React Dashboard IMMEDIATELY to watch the Zero-Trust Quarantine go into effect.");
      process.exit(0);
    }
  }, 75); // Extreme speed
}

runAttack();

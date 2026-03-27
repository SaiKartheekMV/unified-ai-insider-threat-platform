const { Pool } = require("pg");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/insider_threat_db" });

async function runSimulation() {
  console.log("Fetching users from DB...");
  const usersRes = await pgPool.query("SELECT id, email FROM users WHERE is_active = true");
  
  if(usersRes.rowCount === 0) { 
    console.log("No active users found. Please register a user first!"); 
    process.exit(1); 
  }
  
  const users = usersRes.rows;
  console.log(`Found ${users.length} active users. Starting Baseline Traffic Simulation...`);
  
  const ACTIONS = ["LOGIN", "VIEW_DASHBOARD", "VIEW_FILE", "DOWNLOAD_FILE"];

  setInterval(async () => {
    try {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      
      const payload = {
        userId: user.id,
        action: action,
        ipAddress: "192.168.1." + Math.floor(Math.random() * 255),
        userAgent: "Corporate-Intranet-Browser/1.0"
      };

      await fetch("http://localhost:5000/api/platform/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      console.log(`[OK] Traffic generation: ${action} for ${user.email}`);
    } catch(e) {
      console.error("[ERROR] Failed to ingest API log. Ensure backend is running on port 5000");
    }
  }, 2000); // 1 request every 2 seconds
}

runSimulation();

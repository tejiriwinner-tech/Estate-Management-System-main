const postgres = require("c:/Users/ACER/Desktop/Estate-Management-System-main/frontend/node_modules/postgres");
const sql = (postgres.default || postgres)(
  "postgresql://postgres.pcckpgzapymifibcdlaf:LincolnEstate@123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  { ssl: "require", connect_timeout: 15 }
);

async function testSupabase() {
  try {
    const time = await sql`SELECT NOW() as current_time, current_database() as db`;
    console.log("SUPABASE_STATUS: ACTIVE & CONNECTED");
    console.log("Database Name:", time[0].db);
    console.log("Server Time:", time[0].current_time);

    const [users] = await sql`SELECT count(*)::int as count FROM users`;
    const [vehicles] = await sql`SELECT count(*)::int as count FROM vehicles`;
    const [accessLogs] = await sql`SELECT count(*)::int as count FROM access_logs`;
    const [guestPasses] = await sql`SELECT count(*)::int as count FROM guest_passes`;
    const [payments] = await sql`SELECT count(*)::int as count FROM fin_payments`;
    const [invoices] = await sql`SELECT count(*)::int as count FROM fin_invoices`;
    const [chatMessages] = await sql`SELECT count(*)::int as count FROM chat_messages`;

    console.log("LIVE_TELEMETRY:", JSON.stringify({
      users: users.count,
      vehicles: vehicles.count,
      accessLogs: accessLogs.count,
      guestPasses: guestPasses.count,
      payments: payments.count,
      invoices: invoices.count,
      chatMessages: chatMessages.count
    }, null, 2));

    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error("SUPABASE_ERROR:", err.message);
    process.exit(1);
  }
}

testSupabase();

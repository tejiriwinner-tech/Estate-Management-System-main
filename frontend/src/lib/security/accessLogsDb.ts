import { sql } from "@/lib/db";

let accessLogsEnsured = false;

export async function ensureAccessLogsTable() {
  if (accessLogsEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS access_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name VARCHAR(255),
      visitor_name VARCHAR(255),
      person_name VARCHAR(255),
      role VARCHAR(80) DEFAULT 'Visitor',
      gate VARCHAR(80) DEFAULT 'Gate 1',
      gate_number VARCHAR(80) DEFAULT 'Gate 1',
      direction VARCHAR(20) DEFAULT 'in',
      status VARCHAR(40) DEFAULT 'granted',
      verification_type VARCHAR(80) DEFAULT 'QR Code',
      reason TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS user_id INTEGER`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(255)`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS person_name VARCHAR(255)`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS role VARCHAR(80) DEFAULT 'Visitor'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS gate VARCHAR(80) DEFAULT 'Gate 1'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS gate_number VARCHAR(80) DEFAULT 'Gate 1'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS direction VARCHAR(20) DEFAULT 'in'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS status VARCHAR(40) DEFAULT 'granted'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS verification_type VARCHAR(80) DEFAULT 'QR Code'`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS reason TEXT`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`;
  await sql`ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`;

  const reqCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'access_logs'
      AND is_nullable = 'NO'
      AND column_default IS NULL
      AND column_name <> 'id'
  `;
  for (const c of reqCols) {
    await sql.unsafe(`ALTER TABLE access_logs ALTER COLUMN "${c.column_name}" DROP NOT NULL`).catch(() => {});
  }
  accessLogsEnsured = true;
}

export async function insertAccessLog(params: {
  name: string;
  role?: string;
  gate?: string;
  direction: "in" | "out";
  status: "granted" | "denied";
  verificationType?: string;
  reason: string;
}) {
  await ensureAccessLogsTable();
  const gate = params.gate || "Gate 1";
  const role = params.role || "Visitor";
  const verif = params.verificationType || "QR Code";
  await sql`
    INSERT INTO access_logs (
      name, visitor_name, person_name, role, gate, gate_number,
      direction, status, verification_type, reason, notes, created_at, updated_at
    )
    VALUES (
      ${params.name}, ${params.name}, ${params.name}, ${role}, ${gate}, ${gate},
      ${params.direction}, ${params.status}, ${verif}, ${params.reason}, ${params.reason}, NOW(), NOW()
    )
  `;
}

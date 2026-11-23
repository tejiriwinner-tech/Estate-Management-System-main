const postgres = require("c:/Users/ACER/Desktop/Estate-Management-System-main/frontend/node_modules/postgres");
const sql = (postgres.default || postgres)(
  "postgresql://postgres.pcckpgzapymifibcdlaf:LincolnEstate@123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
  { ssl: "require", connect_timeout: 15 }
);

async function seed() {
  console.log("Starting dynamic data seed...");

  // 1. Vehicles
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM vehicles`;
    if (count === 0) {
      await sql`
        INSERT INTO vehicles (user_id, owner_name, owner_role, house_unit, vehicle_type, plate_number, status, valid_until, created_at, updated_at)
        VALUES
          (2, 'Chinedu Resident', 'Resident', 'Villa A-402', 'Toyota Land Cruiser Prado', 'ABC-123-XY', 'active', '2027-12-31', NOW(), NOW()),
          (2, 'Ngozi Adeleke', 'Spouse', 'Villa A-402', 'Lexus RX 350', 'LND-456-AA', 'active', '2027-12-31', NOW(), NOW()),
          (4, 'Marcus Reed', 'Agent', 'Commercial Hub', 'Mercedes-Benz C300', 'KJA-789-ZZ', 'active', '2027-06-30', NOW(), NOW()),
          (1, 'Estate Management', 'Admin', 'HQ', 'Toyota Hilux 4x4', 'LE-PAT-01', 'active', '2028-01-01', NOW(), NOW()),
          (3, 'Security Operations', 'Security', 'Gate 1', 'Ford Ranger Rapid Response', 'LE-SEC-04', 'active', '2028-01-01', NOW(), NOW());
      `;
      console.log("Seeded vehicles.");
    }
  } catch (e) {
    console.log("Vehicles seed err:", e.message);
  }

  // 2. Access logs
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM access_logs`;
    if (count === 0) {
      await sql`
        INSERT INTO access_logs (user_id, name, role_label, gate, verification_type, direction, person_type, house_no, vehicle_plate, status, occurred_at, created_at, updated_at)
        VALUES
          (2, 'Chinedu Resident', 'Resident', 'Gate 1', 'RFID Scanner', 'in', 'Resident', 'Villa A-402', 'ABC-123-XY', 'granted', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes', NOW()),
          (null, 'Tunde Bakare (Visitor)', 'Guest', 'Gate 1', 'QR Pass', 'in', 'Visitor', 'Villa A-402', 'KJA-881-AB', 'granted', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes', NOW()),
          (null, 'Adewale DHL Courier', 'Courier', 'Gate 2', 'ID Verification', 'in', 'Delivery', 'Plot 14', 'LND-202-XY', 'granted', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW()),
          (null, 'Adewale DHL Courier', 'Courier', 'Gate 2', 'ID Verification', 'out', 'Delivery', 'Plot 14', 'LND-202-XY', 'granted', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW()),
          (4, 'Marcus Reed', 'Agent', 'Gate 1', 'RFID Scanner', 'in', 'Agent', 'Commercial Hub', 'KJA-789-ZZ', 'granted', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW());
      `;
      console.log("Seeded access_logs.");
    }
  } catch (e) {
    console.log("Access logs err:", e.message);
  }

  // 3. Guest Passes
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM guest_passes`;
    if (count === 0) {
      await sql`
        INSERT INTO guest_passes (name, invited_by, kind, expires_at, status, created_by, created_at, updated_at)
        VALUES
          ('Engr. Tunde Bakare', 'Chinedu Resident', 'guest', NOW() + INTERVAL '1 day', 'active', 2, NOW(), NOW()),
          ('Mrs. Folashade Adeleke', 'Chinedu Resident', 'guest', NOW() + INTERVAL '2 days', 'active', 2, NOW(), NOW()),
          ('CleanPro Facility Team', 'Estate Admin', 'service', NOW() + INTERVAL '12 hours', 'active', 1, NOW(), NOW());
      `;
      console.log("Seeded guest_passes.");
    }
  } catch (e) {
    console.log("Guest passes err:", e.message);
  }

  // 4. Away Notices
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM away_notices`;
    if (count === 0) {
      await sql`
        INSERT INTO away_notices (user_id, resident_name, unit, departure_date, expected_return_date, emergency_contact_phone, notes, status, created_at, updated_at)
        VALUES
          (2, 'Chinedu Resident', 'Villa A-402', CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days', '+234 801 234 5678', 'Traveling for annual summit. Suspend package deliveries at gate.', 'active', NOW(), NOW()),
          (2, 'Sarah Ibrahim', 'Flat B-102', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', '+234 802 345 6789', 'Notify security before any visitor enters unit.', 'active', NOW(), NOW());
      `;
      console.log("Seeded away_notices.");
    }
  } catch (e) {
    console.log("Away notices err:", e.message);
  }

  // 5. Blacklist Entries
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM blacklist_entries`;
    if (count === 0) {
      await sql`
        INSERT INTO blacklist_entries (list_type, entity_type, name, entity_ref, reason, details, risk_level, status, created_at, updated_at)
        VALUES
          ('blacklist', 'individual', 'Marcus Sterling', 'LE-99101-X', 'Unauthorized commercial canvassing and trespass', 'Found trespassing past North Gate without tag.', 'HIGH', 'active', NOW(), NOW()),
          ('blacklist', 'vehicle', 'Toyota Hilux (LND-442-AA)', 'VEH-442', 'Reckless driving & barrier hit-and-run', 'Tailgated through Gate 2 damaging arm.', 'EXTREME', 'active', NOW(), NOW());
      `;
      console.log("Seeded blacklist_entries.");
    }
  } catch (e) {
    console.log("Blacklist err:", e.message);
  }

  // 6. Reminders
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM reminders`;
    if (count === 0) {
      await sql`
        INSERT INTO reminders (text, due_time, is_completed, priority, user_id, created_at, updated_at)
        VALUES
          ('Estate Residents Annual General Meeting (AGM) at Central Clubhouse', '10:00 AM Today', false, 'high', 1, NOW(), NOW()),
          ('Quarterly Estate Facility Maintenance & Security Levy Due Date', '05:00 PM Tomorrow', false, 'high', 1, NOW(), NOW()),
          ('Biometric ANPR Gate Scanner calibration inspection at Main Gate 1', '02:00 PM', true, 'medium', 3, NOW(), NOW());
      `;
      console.log("Seeded reminders.");
    }
  } catch (e) {
    console.log("Reminders err:", e.message);
  }

  // 7. Estate Updates
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM estate_updates`;
    if (count === 0) {
      await sql`
        INSERT INTO estate_updates (headline_prefix, headline_highlight, image_url, lead_paragraph, body_paragraph, category, author_name, author_role, published_at, created_at, updated_at)
        VALUES (
          'Estate Infrastructure Update: ',
          'Solar Power Grid Phase 1 Live',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          'We are delighted to report the successful commissioning of our dedicated solar battery bank.',
          'All estate street lights, automated boom barriers, and surveillance cameras now operate with 24/7 uninterrupted clean energy.',
          'Infrastructure', 'Estate Administrator', 'HQ Facilities Management', NOW(), NOW(), NOW()
        );
      `;
      console.log("Seeded estate_updates.");
    }
  } catch (e) {
    console.log("Estate updates err:", e.message);
  }

  // 8. Finance (Service Charges, Invoices, Payments)
  try {
    const [{ count: pCount }] = await sql`SELECT COUNT(*)::int as count FROM fin_payments`;
    if (pCount === 0) {
      await sql`
        INSERT INTO fin_service_charges (name, category, fee_kobo, frequency, is_active, created_at, updated_at)
        VALUES
          ('Estate Security Levy (Q4)', 'Security', 15000000, 'quarterly', true, NOW(), NOW()),
          ('Facility Maintenance & Cleaning', 'Maintenance', 7500000, 'monthly', true, NOW(), NOW()),
          ('Power & Generator Infrastructure', 'Utilities', 4500000, 'monthly', true, NOW(), NOW());
      `;

      await sql`
        INSERT INTO fin_invoices (user_id, service_charge_id, service_name, reference, amount_kobo, paid_kobo, issued_on, due_date, created_at, updated_at)
        VALUES
          (2, 1, 'Estate Security Levy (Q4)', 'INV-2026-001', 15000000, 15000000, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', NOW(), NOW()),
          (2, 2, 'Facility Maintenance & Cleaning', 'INV-2026-002', 7500000, 7500000, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', NOW(), NOW()),
          (2, 3, 'Power & Generator Infrastructure', 'INV-2026-003', 4500000, 0, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', NOW(), NOW());
      `;

      await sql`
        INSERT INTO fin_payments (invoice_id, user_id, amount_kobo, method, reference, gateway_reference, status, paid_at, created_at, updated_at)
        VALUES
          (1, 2, 15000000, 'Paystack Card', 'REC-2026-001', 'PST_88129381', 'success', NOW() - INTERVAL '5 days', NOW(), NOW()),
          (2, 2, 7500000, 'Direct Bank Transfer', 'REC-2026-002', 'TRF_99182391', 'success', NOW() - INTERVAL '3 days', NOW(), NOW());
      `;
      console.log("Seeded finance tables.");
    }
  } catch (e) {
    console.log("Finance seed err:", e.message);
  }

  // 9. Resident Properties, Activities, Family Members
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM resident_properties`;
    if (count === 0) {
      await sql`
        INSERT INTO resident_properties (user_id, type, name, property_number, sector, unit_type, ownership_status, colour, others, status, created_at, updated_at)
        VALUES
          (2, 'Residential House', 'Villa Royale', 'Villa A-402', 'Phase 1 - Palm Crescent', '4-Bedroom Terrace Duplex', 'Owner-Occupier', 'Ivory White', 'Private Solar Inverter System', 'Verified', NOW(), NOW()),
          (2, 'Vehicle', 'Toyota Land Cruiser Prado', 'ABC-123-XY', 'Phase 1', 'SUV', 'Owned', 'Black', 'RFID Decal #0402', 'Verified', NOW(), NOW());
      `;

      await sql`
        INSERT INTO family_members (user_id, name, role_in_family, age, gender, created_at, updated_at)
        VALUES
          (2, 'Ngozi Adeleke', 'Spouse', 34, 'Female', NOW(), NOW()),
          (2, 'David Adeleke', 'Child', 8, 'Male', NOW(), NOW()),
          (2, 'Chidinma Adeleke', 'Child', 5, 'Female', NOW(), NOW());
      `;

      await sql`
        INSERT INTO resident_activities (user_id, name, out_at, out_with, in_at, in_with, created_at, updated_at)
        VALUES
          (2, 'Chinedu Resident', NOW() - INTERVAL '4 hours', 'Toyota Land Cruiser (ABC-123-XY)', NOW() - INTERVAL '1 hour', 'Toyota Land Cruiser (ABC-123-XY)', NOW(), NOW()),
          (2, 'David Adeleke', NOW() - INTERVAL '7 hours', 'Lincoln School Bus', NOW() - INTERVAL '2 hours', 'Lincoln School Bus', NOW(), NOW());
      `;
      console.log("Seeded resident tables.");
    }
  } catch (e) {
    console.log("Resident seed err:", e.message);
  }

  // 10. Chat Rooms & Messages
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM chat_rooms`;
    if (count === 0) {
      const rooms = await sql`
        INSERT INTO chat_rooms (type, name, created_at, updated_at)
        VALUES
          ('estate', 'Estate General Community', NOW(), NOW()),
          ('security', 'Security Command & Gate Desk', NOW(), NOW())
        RETURNING id
      `;

      await sql`
        INSERT INTO chat_messages (chat_room_id, user_id, body, created_at, updated_at)
        VALUES
          (${rooms[0].id}, 1, 'Welcome all residents to the Lincoln Estate official communication channel.', NOW() - INTERVAL '1 day', NOW()),
          (${rooms[0].id}, 2, 'Thank you management. The new street lighting in Phase 1 looks fantastic.', NOW() - INTERVAL '12 hours', NOW()),
          (${rooms[1].id}, 3, 'Security Shift 1 handover complete. All perimeter infrared sensors functioning normally.', NOW() - INTERVAL '3 hours', NOW());
      `;
      console.log("Seeded chat.");
    }
  } catch (e) {
    console.log("Chat seed err:", e.message);
  }

  // 11. Estate Alerts & Meeting Reports
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM estate_alerts`;
    if (count === 0) {
      await sql`
        INSERT INTO estate_alerts (sender_id, category, message, location, status, created_at, updated_at)
        VALUES
          (3, 'intelligence', 'Infrared beam alert near Phase 2 fence - patrol unit cleared as tree branch contact.', 'North Fence Phase 2', 'resolved', NOW() - INTERVAL '6 hours', NOW()),
          (3, 'intelligence', 'Vehicle ANPR barcode scanning operating with 100% throughput across all lanes.', 'Gate 1', 'open', NOW() - INTERVAL '1 hour', NOW());
      `;

      await sql`
        INSERT INTO meeting_reports (created_by, title, body, held_at, created_at, updated_at)
        VALUES
          (1, 'Q4 Estate Infrastructure & Budget Townhall', 'Resolutions approved: 100% adoption of digital access cards and rollout of smart solar street lamps across Phase 1 and 2.', NOW() - INTERVAL '10 days', NOW(), NOW());
      `;
      console.log("Seeded alerts and meetings.");
    }
  } catch (e) {
    console.log("Alerts and meetings err:", e.message);
  }

  console.log("All dynamic data seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

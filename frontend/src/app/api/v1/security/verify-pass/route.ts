import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { insertAccessLog } from "@/lib/security/accessLogsDb";

export const dynamic = "force-dynamic";

async function logGateClearance(visitorName: string, unitOrReason: string, direction: "in" | "out", status: "granted" | "denied") {
  try {
    await insertAccessLog({
      name: visitorName,
      role: unitOrReason.startsWith("Resident") ? "Resident" : "Visitor",
      gate: "Gate 1",
      direction,
      status,
      verificationType: "QR Code",
      reason: unitOrReason,
    });
  } catch (e: any) {
    console.error("Access log insert error:", e?.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = String(body.code || "").trim();

    if (!rawInput) {
      return NextResponse.json({ valid: false, message: "Enter or scan a QR pass code." }, { status: 400 });
    }

    const upper = rawInput.toUpperCase();

    // Case 1: Resident Digital Exit/Entry QR Token
    // Format: PAHE-RESIDENT:RES-...:Resident-Name:Unit:Vehicle:EXIT-CLEARANCE
    if (upper.startsWith("PAHE-RESIDENT:") || upper.startsWith("LINCOLN-RESIDENT:") || upper.startsWith("RES-")) {
      const parts = rawInput.split(":");
      const code = parts[1] || upper;
      const name = (parts[2] || "Verified Resident").replace(/-/g, " ");
      const unit = (parts[3] || "Estate Unit").replace(/-/g, " ");
      const vehicle = parts[4] || "On Foot";
      const isEntry = (parts[5] || "EXIT-CLEARANCE").toUpperCase().includes("ENTRY");
      const action = isEntry ? "Resident Entry" : "Resident Exit";

      await logGateClearance(name, `${action} • ${unit} • ${vehicle}`, isEntry ? "in" : "out", "granted");

      return NextResponse.json({
        valid: true,
        passType: "RESIDENT",
        action,
        code,
        personName: name,
        unit,
        vehicle,
        status: "CLEARANCE GRANTED",
        message: `${action} authorized for ${name} (${unit}). Barrier opened.`,
      });
    }

    // Case 2: Structured Visitor QR Token (extract code & verify in DB)
    let lookupCode = upper;
    let tokenPin = "";
    let tokenUnit = "";
    let tokenVisitor = "";
    let tokenPurpose = "";
    if (upper.startsWith("PAHE-PASS:") || upper.startsWith("LINCOLN-PASS:")) {
      const parts = rawInput.split(":");
      lookupCode = (parts[1] || "").toUpperCase();
      tokenPin = (parts[2] || "").replace("PIN-", "");
      tokenUnit = (parts[3] || "").replace(/-/g, " ");
      tokenVisitor = (parts[4] || "").replace(/-/g, " ");
      tokenPurpose = (parts[5] || "").replace(/-/g, " ");
    }

    // Case 3: Database verification against guest_passes (single source of truth)
    try {
      const dbPass = await sql`
        SELECT * FROM guest_passes
        WHERE UPPER(code) = ${lookupCode}
        ORDER BY id DESC
        LIMIT 1
      `;
      if (dbPass.length > 0) {
        const p = dbPass[0];
        const guestName = p.guest_name || p.visitor_name || tokenVisitor || "Verified Visitor";
        const hostUnit = p.invited_by || tokenUnit || "Estate Resident";
        const purpose = p.purpose || tokenPurpose || "Registered Guest Pass";

        if (p.status === "revoked") {
          await logGateClearance(guestName, `Revoked Pass ${lookupCode} (${hostUnit})`, "in", "denied");
          return NextResponse.json(
            {
              valid: false,
              status: "ACCESS DENIED (REVOKED)",
              message: `Visitor pass ${lookupCode} was revoked by ${hostUnit}. Do not open barrier.`,
            },
            { status: 403 }
          );
        }

        if (p.valid_until && new Date(p.valid_until).getTime() < Date.now()) {
          await logGateClearance(guestName, `Expired Pass ${lookupCode} (${hostUnit})`, "in", "denied");
          return NextResponse.json(
            {
              valid: false,
              status: "ACCESS DENIED (EXPIRED)",
              message: `Visitor pass ${lookupCode} has expired. Ask resident to issue a new pass.`,
            },
            { status: 403 }
          );
        }

        if (p.status === "checked_out" || p.status === "confirmed_out") {
          return NextResponse.json(
            {
              valid: false,
              status: "PASS COMPLETED",
              message: `Visitor pass ${lookupCode} for ${guestName} has already checked out.`,
            },
            { status: 403 }
          );
        }

        if (p.status === "used") {
          await sql`UPDATE guest_passes SET status = 'checked_out', updated_at = NOW() WHERE id = ${Number(p.id)}`.catch(() => {});
          await logGateClearance(guestName, `Visitor Check-Out ${lookupCode} • Host: ${hostUnit}`, "out", "granted");
          return NextResponse.json({
            valid: true,
            passType: "VISITOR_CHECKOUT",
            action: "Visitor Check-Out",
            code: lookupCode,
            personName: guestName,
            unit: hostUnit,
            purpose,
            status: "CHECK-OUT VERIFIED",
            message: `Check-out verified for ${guestName} (Host: ${hostUnit}). Exit logged for resident confirmation.`,
          });
        }

        await sql`UPDATE guest_passes SET status = 'used', updated_at = NOW() WHERE id = ${Number(p.id)}`.catch(() => {});
        await logGateClearance(guestName, `Visitor Pass ${lookupCode} • Host: ${hostUnit} • ${purpose}`, "in", "granted");

        return NextResponse.json({
          valid: true,
          passType: "VISITOR",
          action: "Visitor Entry",
          code: lookupCode,
          pin: p.pin || tokenPin || undefined,
          personName: guestName,
          unit: hostUnit,
          purpose,
          status: "CLEARANCE GRANTED",
          message: `Guest pass ${lookupCode} verified for ${guestName} (Host: ${hostUnit}). Gate access granted.`,
        });
      }
    } catch (e: any) {
      console.warn("Verify pass DB lookup error:", e.message);
    }

    await logGateClearance("Unknown Visitor", `Invalid Pass Code: ${rawInput}`, "in", "denied");
    return NextResponse.json(
      {
        valid: false,
        status: "ACCESS DENIED",
        message: `Unrecognized or unissued pass code "${rawInput}". Only active passes issued by a verified resident can be cleared.`,
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ valid: false, status: "ERROR", message: err.message }, { status: 500 });
  }
}

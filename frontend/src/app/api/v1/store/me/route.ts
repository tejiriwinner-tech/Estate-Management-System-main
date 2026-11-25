import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

let inMemoryStoreState = {
  isOpen: true,
  name: "Post Army House Mart",
};

export async function GET() {
  try {
    try {
      const stores = await sql`SELECT id, name, is_open FROM stores LIMIT 1`;
      if (stores.length > 0) {
        return NextResponse.json({
          data: {
            id: stores[0].id,
            name: stores[0].name || "Post Army House Mart",
            isOpen: Boolean(stores[0].is_open ?? inMemoryStoreState.isOpen),
            is_open: Boolean(stores[0].is_open ?? inMemoryStoreState.isOpen),
          },
        });
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      data: {
        id: 1,
        name: inMemoryStoreState.name,
        isOpen: inMemoryStoreState.isOpen,
        is_open: inMemoryStoreState.isOpen,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not fetch store status", error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const newStatus = Boolean(body.is_open ?? body.isOpen);
    inMemoryStoreState.isOpen = newStatus;

    try {
      await sql`UPDATE stores SET is_open = ${newStatus} WHERE id = (SELECT id FROM stores LIMIT 1)`;
    } catch {
      // in memory state preserved
    }

    return NextResponse.json({
      data: {
        id: 1,
        name: inMemoryStoreState.name,
        isOpen: newStatus,
        is_open: newStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not update store status", error: err.message },
      { status: 500 }
    );
  }
}

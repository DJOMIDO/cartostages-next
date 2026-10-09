import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { db } from "@/lib/db/client";
import { offers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { archived } = await req.json();
  if (typeof archived !== "boolean") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await db.update(offers).set({ archived, updatedAt: new Date() }).where(eq(offers.id, id));
  return NextResponse.json({ ok: true });
}

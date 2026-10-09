import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { syncWaga } from "@/lib/crawler/sync";

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncWaga();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

import "dotenv/config";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db/client";
import { user } from "../src/lib/db/auth-schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] ?? "Admin";
if (!email || !password) {
  console.error("usage: npx tsx --env-file=.env scripts/create-admin.ts <email> <password> [name]");
  process.exit(1);
}

async function main() {
  const res = await auth.api.signUpEmail({ body: { email, password, name } });
  if (!res) throw new Error("signup failed");
  const rows = await db.select().from(user).where(eq(user.email, email));
  await db.update(user).set({ role: "admin" }).where(eq(user.id, rows[0]!.id));
  console.log(`admin created: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

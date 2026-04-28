/**
 * Firebase Admin Seed Script (JS version)
 * Run: node firebase/seed.js
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ADMIN_EMAIL = "admin@resq.org";
const ADMIN_PASSWORD = "ResQ2026!";
const ADMIN_NAME = "ResQ Admin";

async function seed() {
  console.log("🌱 ResQ Admin Seed Script");
  console.log("========================\n");

  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error("❌ Missing Firebase Admin credentials in .env.local");
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  const auth = getAuth();
  const db = getFirestore();

  let uid;
  try {
    const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existingUser.uid;
    console.log("✅ Admin user already exists:", ADMIN_EMAIL, "(uid:", uid + ")");
    await auth.updateUser(uid, { password: ADMIN_PASSWORD });
    console.log("✅ Password updated for", ADMIN_EMAIL);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME, emailVerified: true,
      });
      uid = newUser.uid;
      console.log("✅ Created admin user:", ADMIN_EMAIL, "(uid:", uid + ")");
    } else {
      console.error("❌ Error:", err.message);
      process.exit(1);
    }
  }

  try {
    await db.collection("admins").doc(uid).set(
      { uid, email: ADMIN_EMAIL, name: ADMIN_NAME, created_at: new Date() },
      { merge: true }
    );
    console.log("✅ Admin document created in Firestore admins/" + uid);
  } catch (err) {
    console.error("❌ Firestore error:", err.message);
    process.exit(1);
  }

  console.log("\n🎉 Seed complete!");
  console.log("   Email:    " + ADMIN_EMAIL);
  console.log("   Password: " + ADMIN_PASSWORD);
  console.log("   UID:      " + uid + "\n");
}

seed().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });

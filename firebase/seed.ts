/**
 * Firebase Admin Seed Script
 * Creates the default admin user and Firestore document.
 *
 * Run: npx ts-node firebase/seed.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ADMIN_EMAIL = "admin@resq.org";
const ADMIN_PASSWORD = "ResQ2026!";
const ADMIN_NAME = "ResQ Admin";

async function seed() {
  console.log("🌱 ResQ Admin Seed Script");
  console.log("========================\n");

  // Initialize Firebase Admin
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error("❌ Missing Firebase Admin credentials in .env.local");
    console.error("   Required: FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  const auth = getAuth();
  const db = getFirestore();

  // Step 1: Create or get admin user in Firebase Auth
  let uid: string;
  try {
    const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existingUser.uid;
    console.log(`✅ Admin user already exists: ${ADMIN_EMAIL} (uid: ${uid})`);

    // Update password in case it changed
    await auth.updateUser(uid, { password: ADMIN_PASSWORD });
    console.log(`✅ Password updated for ${ADMIN_EMAIL}`);
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
        emailVerified: true,
      });
      uid = newUser.uid;
      console.log(`✅ Created admin user: ${ADMIN_EMAIL} (uid: ${uid})`);
    } else {
      console.error("❌ Error checking/creating user:", err.message);
      process.exit(1);
    }
  }

  // Step 2: Create or update admin doc in Firestore
  try {
    const adminRef = db.collection("admins").doc(uid);
    await adminRef.set(
      {
        uid,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        created_at: new Date(),
      },
      { merge: true }
    );
    console.log(`✅ Admin document created/updated in Firestore admins/${uid}`);
  } catch (err: any) {
    console.error("❌ Error creating admin document:", err.message);
    process.exit(1);
  }

  console.log("\n========================");
  console.log("🎉 Seed complete!");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   UID:      ${uid}`);
  console.log("========================\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

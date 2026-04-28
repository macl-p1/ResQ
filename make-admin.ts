import { adminDb, adminAuth } from "./lib/firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function makeAdmin(email: string) {
  try {
    console.log(`Looking up user by email: ${email}...`);
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`✅ Found user! UID: ${userRecord.uid}`);

    console.log(`Adding UID to 'admins' collection in Firestore...`);
    await adminDb.collection("admins").doc(userRecord.uid).set({
      role: "admin",
      email: email,
      created_at: new Date()
    });

    console.log(`✅ Success! ${email} is now officially an Admin.`);
    console.log(`\nIf you STILL can't log in, your Firestore Security Rules are blocking access!`);
  } catch (error) {
    console.error(`❌ Failed:`, error);
  }
}

// Replace this with the user's email if they pass it as an argument
const emailArg = process.argv[2] || "admin@resq.org";
makeAdmin(emailArg);

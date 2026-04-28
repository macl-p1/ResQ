import { adminDb } from "./lib/firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testFirebase() {
  try {
    console.log("Testing Firebase Admin SDK connection...");
    
    // 1. Write a test document
    const testDocRef = adminDb.collection("needs").doc("test-connection");
    await testDocRef.set({
      message: "Firebase connection successful!",
      timestamp: new Date()
    });
    console.log("✅ Successfully wrote test document to 'needs' collection.");

    // 2. Read the document back
    const snapshot = await testDocRef.get();
    if (snapshot.exists) {
      console.log("✅ Successfully read test document back.");
      console.log("   Data:", snapshot.data()?.message);
    } else {
      throw new Error("Document was written but not found on read.");
    }

    // 3. Clean up the test document
    await testDocRef.delete();
    console.log("✅ Successfully cleaned up test document.");
    console.log("\n🎉 Firebase is fully connected and ready to go!");

  } catch (error) {
    console.error("\n❌ Firebase connection test failed:");
    console.error(error);
  }
}

testFirebase();

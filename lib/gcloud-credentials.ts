/**
 * Shared Google Cloud credential resolver.
 * 
 * Tries GOOGLE_CLOUD_* credentials first, then falls back to FIREBASE_ADMIN_*
 * credentials. Both service accounts belong to GCP projects that can have
 * Cloud APIs enabled (Vision, Speech, TTS).
 * 
 * The Firebase Admin SA lives in project resq-466cc.
 * The resq-backend SA lives in project resq-494208.
 * 
 * KEY INSIGHT: The private key MUST match the client_email. If they are from
 * different service accounts, auth will fail with "DECODER routines::unsupported".
 */

export function getGCloudCredentials(): { client_email: string; private_key: string } | null {
  // Try GOOGLE_CLOUD_* first
  const gcEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const gcKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

  // Try FIREBASE_ADMIN_* as fallback
  const fbEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const fbKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  // Check if the GOOGLE_CLOUD key looks like a real key (not a placeholder)
  const gcKeyIsReal = gcKey && gcKey.includes('BEGIN PRIVATE KEY') && gcKey.length > 200;
  const fbKeyIsReal = fbKey && fbKey.includes('BEGIN PRIVATE KEY') && fbKey.length > 200;

  // Validate that we don't have mismatched credentials (email from one SA, key from another)
  // The GOOGLE_CLOUD key and FIREBASE_ADMIN key are identical if they were copy-pasted
  const keysAreIdentical = gcKey === fbKey;

  let email: string | undefined;
  let key: string | undefined;

  if (gcKeyIsReal && gcEmail && !keysAreIdentical) {
    // GOOGLE_CLOUD credentials are unique and real — use them
    email = gcEmail;
    key = gcKey;
  } else if (fbKeyIsReal && fbEmail) {
    // Fall back to Firebase Admin credentials
    email = fbEmail;
    key = fbKey;
  } else if (gcKeyIsReal && gcEmail) {
    // Keys are identical but GOOGLE_CLOUD ones exist — use with GC email? No, that's mismatched.
    // Use FB email with FB key instead.
    if (fbEmail && fbKeyIsReal) {
      email = fbEmail;
      key = fbKey;
    }
  }

  if (!email || !key) {
    console.error('[GCloud Credentials] No valid credentials found!');
    console.error('  GOOGLE_CLOUD_CLIENT_EMAIL:', gcEmail ? '✅ set' : '❌ missing');
    console.error('  GOOGLE_CLOUD_PRIVATE_KEY:', gcKeyIsReal ? '✅ real key' : gcKey ? '⚠️ placeholder/invalid' : '❌ missing');
    console.error('  FIREBASE_ADMIN_CLIENT_EMAIL:', fbEmail ? '✅ set' : '❌ missing');
    console.error('  FIREBASE_ADMIN_PRIVATE_KEY:', fbKeyIsReal ? '✅ real key' : '❌ missing');
    return null;
  }

  // Replace escaped newlines with actual newlines
  const privateKey = key.replace(/\\n/g, '\n');

  console.log('[GCloud Credentials] Using:', email);
  return { client_email: email, private_key: privateKey };
}

export function printCredentialDiagnostics() {
  const gcEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const gcKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
  const fbEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const fbKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const gcKeyIsReal = gcKey && gcKey.includes('BEGIN PRIVATE KEY') && gcKey.length > 200;
  const fbKeyIsReal = fbKey && fbKey.includes('BEGIN PRIVATE KEY') && fbKey.length > 200;
  const keysIdentical = gcKey === fbKey;

  const diag = {
    GOOGLE_CLOUD_CLIENT_EMAIL: gcEmail || '❌ MISSING',
    GOOGLE_CLOUD_PRIVATE_KEY: gcKeyIsReal ? `✅ ${gcKey!.length} chars` : (gcKey ? '⚠️ PLACEHOLDER' : '❌ MISSING'),
    FIREBASE_ADMIN_CLIENT_EMAIL: fbEmail || '❌ MISSING',
    FIREBASE_ADMIN_PRIVATE_KEY: fbKeyIsReal ? `✅ ${fbKey!.length} chars` : '❌ MISSING',
    keys_identical: keysIdentical ? '⚠️ YES — using Firebase Admin key for both' : '✅ Different keys',
    resolved_email: getGCloudCredentials()?.client_email || '❌ NONE',
  };

  return diag;
}

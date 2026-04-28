import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('volunteers').get();
    const fixes: any[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const update: any = {};

      // Fix camelCase to snake_case
      if (data.isAvailable !== undefined && data.is_available === undefined) {
        update.is_available = data.isAvailable;
      }
      if (data.activeTaskCount !== undefined && data.active_task_count === undefined) {
        update.active_task_count = data.activeTaskCount;
      }
      // If neither exists, set default
      if (data.is_available === undefined && data.isAvailable === undefined) {
        update.is_available = true;
      }
      if (data.active_task_count === undefined && data.activeTaskCount === undefined) {
        update.active_task_count = 0;
      }

      if (Object.keys(update).length > 0) {
        await adminDb.collection('volunteers').doc(doc.id).update(update);
        fixes.push({ id: doc.id, name: data.name, fixed: update });
      }
    }

    return Response.json({
      success: true,
      total_volunteers: snapshot.size,
      fixed: fixes.length,
      details: fixes,
    });
  } catch (error: any) {
    console.error('Fix volunteers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

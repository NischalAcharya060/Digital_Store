import "server-only";

import { firebaseAdminDb } from "@/lib/firebase/admin";

export function col<T = FirebaseFirestore.DocumentData>(name: string) {
  return firebaseAdminDb.collection(name) as FirebaseFirestore.CollectionReference<T>;
}

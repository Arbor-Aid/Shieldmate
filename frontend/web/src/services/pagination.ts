import { DocumentData, Query, QueryConstraint, QueryDocumentSnapshot, getDocs, limit, orderBy, startAfter } from "firebase/firestore";

export interface PageResult<T> {
  items: T[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}

export async function paginateQuery<T>(
  baseQuery: Query<DocumentData>,
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData>,
  mapFn?: (doc: QueryDocumentSnapshot<DocumentData>) => T
): Promise<PageResult<T>> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(pageSize)];
  const pagedQuery = cursor ? (baseQuery as any).withConverter(null).startAfter(cursor) : baseQuery;
  const snapshot = await getDocs(pagedQuery);
  const items = snapshot.docs.map((d) => (mapFn ? mapFn(d) : (d.data() as T)));
  const nextCursor = snapshot.docs.length === pageSize ? snapshot.docs[snapshot.docs.length - 1] : undefined;
  return { items, nextCursor };
}

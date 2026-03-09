import { eq, ilike } from 'drizzle-orm';
import db from '@/db';
import { exercises } from '@/db/schema';

export async function searchExercises(query: string): Promise<(typeof exercises.$inferSelect)[]> {
  return db
    .select()
    .from(exercises)
    .where(ilike(exercises.name, `%${query}%`))
    .limit(20);
}

export async function getExerciseById(id: string): Promise<typeof exercises.$inferSelect | null> {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
  return exercise ?? null;
}

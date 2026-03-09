import { and, count, eq } from 'drizzle-orm';
import db from '@/db';
import { sets, workoutExercises, workouts } from '@/db/schema';

export async function addSet(
  workoutExerciseId: string,
  reps: number | null,
  weightKg: string | null,
): Promise<typeof sets.$inferSelect> {
  const [{ value: setCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber: setCount + 1, reps, weightKg })
    .returning();
  return set;
}

export async function deleteSet(userId: string, setId: string): Promise<void> {
  const [setRow] = await db.select().from(sets).where(eq(sets.id, setId));
  if (!setRow) return;

  const [we] = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.id, setRow.workoutExerciseId));
  if (!we) return;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, we.workoutId), eq(workouts.userId, userId)));
  if (!workout) throw new Error('Unauthorized');

  await db.delete(sets).where(eq(sets.id, setId));
}

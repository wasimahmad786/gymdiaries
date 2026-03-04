import { and, eq, gte, lt } from 'drizzle-orm';
import db from '@/db';
import { exercises, sets, workoutExercises, workouts } from '@/db/schema';

export async function createWorkout(
  userId: string,
  name: string | null,
  startedAt: Date,
): Promise<typeof workouts.$inferSelect> {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}

export async function getWorkout(
  userId: string,
  workoutId: string,
): Promise<typeof workouts.$inferSelect | null> {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string | null; startedAt: Date },
): Promise<typeof workouts.$inferSelect> {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export type WorkoutWithDetails = {
  workout: typeof workouts.$inferSelect;
  exercises: {
    workoutExercise: typeof workoutExercises.$inferSelect;
    exercise: typeof exercises.$inferSelect;
    sets: (typeof sets.$inferSelect)[];
  }[];
};

export async function getWorkoutsByDate(
  userId: string,
  date: string,
): Promise<WorkoutWithDetails[]> {
  const rows = await db
    .select()
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, new Date(`${date}T00:00:00Z`)),
        lt(workouts.startedAt, new Date(`${date}T23:59:59.999Z`)),
      ),
    )
    .orderBy(workouts.startedAt, workoutExercises.order, sets.setNumber);

  const workoutMap = new Map<string, WorkoutWithDetails>();
  const exerciseMap = new Map<string, WorkoutWithDetails['exercises'][number]>();

  for (const row of rows) {
    const w = row.workouts;
    if (!workoutMap.has(w.id)) {
      workoutMap.set(w.id, { workout: w, exercises: [] });
    }

    const we = row.workout_exercises;
    const ex = row.exercises;
    const s = row.sets;

    if (we && ex) {
      if (!exerciseMap.has(we.id)) {
        const entry = { workoutExercise: we, exercise: ex, sets: [] as (typeof sets.$inferSelect)[] };
        exerciseMap.set(we.id, entry);
        workoutMap.get(w.id)!.exercises.push(entry);
      }
      if (s) {
        exerciseMap.get(we.id)!.sets.push(s);
      }
    }
  }

  return Array.from(workoutMap.values());
}

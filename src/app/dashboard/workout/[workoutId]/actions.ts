'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout, getWorkout, addExerciseToWorkout, deleteExerciseFromWorkout } from '@/data/workouts';
import { searchExercises } from '@/data/exercises';
import { addSet, deleteSet } from '@/data/sets';

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().max(100).nullable(),
  startedAt: z.string().min(1),
});

type UpdateWorkoutInput = {
  workoutId: string;
  name: string | null;
  startedAt: string;
};

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = updateWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  return updateWorkout(userId, parsed.data.workoutId, {
    name: parsed.data.name,
    startedAt: new Date(parsed.data.startedAt),
  });
}

const searchExercisesSchema = z.object({
  query: z.string().min(1).max(100),
});

export async function searchExercisesAction(input: { query: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = searchExercisesSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  return searchExercises(parsed.data.query);
}

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
});

export async function addExerciseToWorkoutAction(input: { workoutId: string; exerciseId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = addExerciseToWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  const workout = await getWorkout(userId, parsed.data.workoutId);
  if (!workout) throw new Error('Workout not found');

  return addExerciseToWorkout(parsed.data.workoutId, parsed.data.exerciseId);
}

const deleteExerciseFromWorkoutSchema = z.object({
  workoutExerciseId: z.string().uuid(),
});

export async function deleteExerciseFromWorkoutAction(input: { workoutExerciseId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = deleteExerciseFromWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  await deleteExerciseFromWorkout(userId, parsed.data.workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  reps: z.number().int().positive().nullable(),
  weightKg: z.string().nullable(),
});

export async function addSetAction(input: {
  workoutExerciseId: string;
  reps: number | null;
  weightKg: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = addSetSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  return addSet(parsed.data.workoutExerciseId, parsed.data.reps, parsed.data.weightKg);
}

const deleteSetSchema = z.object({
  setId: z.string().uuid(),
});

export async function deleteSetAction(input: { setId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const parsed = deleteSetSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  await deleteSet(userId, parsed.data.setId);
}

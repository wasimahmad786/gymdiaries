'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout } from '@/data/workouts';

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

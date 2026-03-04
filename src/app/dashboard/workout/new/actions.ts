'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().max(100).nullable(),
  startedAt: z.string().min(1),
});

type CreateWorkoutInput = {
  name: string | null;
  startedAt: string;
};

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  const workout = await createWorkout(
    userId,
    parsed.data.name,
    new Date(parsed.data.startedAt),
  );

  redirect(`/dashboard?date=${parsed.data.startedAt.slice(0, 10)}`);
}

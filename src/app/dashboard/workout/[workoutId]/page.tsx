import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getWorkout } from '@/data/workouts';
import EditWorkoutForm from './edit-workout-form';

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { workoutId } = await params;
  const workout = await getWorkout(userId, workoutId);
  if (!workout) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  );
}

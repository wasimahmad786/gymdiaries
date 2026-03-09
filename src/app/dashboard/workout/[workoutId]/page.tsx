import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getWorkoutWithDetails } from '@/data/workouts';
import EditWorkoutForm from './edit-workout-form';
import ExerciseList from './exercise-list';

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { workoutId } = await params;
  const workoutDetails = await getWorkoutWithDetails(userId, workoutId);
  if (!workoutDetails) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit workout</h1>
      <EditWorkoutForm workout={workoutDetails.workout} />
      <ExerciseList workoutId={workoutId} initialExercises={workoutDetails.exercises} />
    </div>
  );
}

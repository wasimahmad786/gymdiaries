import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import NewWorkoutForm from './new-workout-form';

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Log workout</h1>
      <NewWorkoutForm />
    </div>
  );
}

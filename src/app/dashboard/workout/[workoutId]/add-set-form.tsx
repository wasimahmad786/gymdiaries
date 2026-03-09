'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addSetAction } from './actions';

export default function AddSetForm({ workoutExerciseId }: { workoutExerciseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isBodyweight, setIsBodyweight] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedReps = reps ? parseInt(reps, 10) : null;
    const parsedWeight = isBodyweight ? null : weightKg.trim() || null;

    startTransition(async () => {
      await addSetAction({
        workoutExerciseId,
        reps: parsedReps,
        weightKg: parsedWeight,
      });
      router.refresh();
      setReps('');
      setWeightKg('');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3">
      <Input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="w-20"
        min={1}
        disabled={isPending}
      />
      <Input
        type="number"
        placeholder="kg"
        value={isBodyweight ? '' : weightKg}
        onChange={(e) => setWeightKg(e.target.value)}
        className="w-20"
        disabled={isPending || isBodyweight}
        step="0.01"
        min={0}
      />
      <Button
        type="button"
        variant={isBodyweight ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsBodyweight((v) => !v)}
        disabled={isPending}
      >
        BW
      </Button>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Adding…' : 'Add set'}
      </Button>
    </form>
  );
}

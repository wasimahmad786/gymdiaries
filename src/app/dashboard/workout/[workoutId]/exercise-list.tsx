'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExerciseCard from './exercise-card';
import ExerciseSearch from './exercise-search';
import type { WorkoutWithDetails } from '@/data/workouts';

type Props = {
  workoutId: string;
  initialExercises: WorkoutWithDetails['exercises'];
};

export default function ExerciseList({ workoutId, initialExercises }: Props) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exercises</h2>
        <Button
          variant={showSearch ? 'secondary' : 'default'}
          size="sm"
          onClick={() => setShowSearch((v) => !v)}
        >
          {showSearch ? 'Cancel' : 'Add exercise'}
        </Button>
      </div>

      {showSearch && <ExerciseSearch workoutId={workoutId} />}

      {initialExercises.length === 0 && !showSearch && (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Click &quot;Add exercise&quot; to get started.
        </p>
      )}

      <div className="space-y-3">
        {initialExercises.map((entry) => (
          <ExerciseCard key={entry.workoutExercise.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

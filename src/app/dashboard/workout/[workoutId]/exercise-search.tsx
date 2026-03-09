'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchExercisesAction, addExerciseToWorkoutAction } from './actions';
import type { exercises } from '@/db/schema';

type Exercise = typeof exercises.$inferSelect;

export default function ExerciseSearch({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [isAdding, startAddTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const found = await searchExercisesAction({ query: query.trim() });
        setResults(found);
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleAdd(exerciseId: string) {
    startAddTransition(async () => {
      await addExerciseToWorkoutAction({ workoutId, exerciseId });
      router.refresh();
      setQuery('');
      setResults([]);
    });
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isAdding}
        autoFocus
      />
      {(results.length > 0 || isSearching) && (
        <div className="rounded-md border bg-popover shadow-sm">
          {isSearching && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Searching…</p>
          )}
          {!isSearching && results.length === 0 && query.trim() && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No exercises found.</p>
          )}
          {results.map((exercise) => (
            <Button
              key={exercise.id}
              variant="ghost"
              className="w-full justify-start rounded-none text-sm"
              disabled={isAdding}
              onClick={() => handleAdd(exercise.id)}
            >
              <span>{exercise.name}</span>
              {exercise.category && (
                <span className="ml-2 text-xs text-muted-foreground">{exercise.category}</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

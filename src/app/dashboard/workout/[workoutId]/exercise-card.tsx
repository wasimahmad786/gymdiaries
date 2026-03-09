'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteSetAction, deleteExerciseFromWorkoutAction } from './actions';
import AddSetForm from './add-set-form';
import type { WorkoutWithDetails } from '@/data/workouts';

type Props = {
  entry: WorkoutWithDetails['exercises'][number];
};

export default function ExerciseCard({ entry }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction({ setId });
      router.refresh();
    });
  }

  function handleRemoveExercise() {
    startTransition(async () => {
      await deleteExerciseFromWorkoutAction({
        workoutExerciseId: entry.workoutExercise.id,
      });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{entry.exercise.name}</CardTitle>
          {entry.exercise.category && (
            <Badge variant="secondary">{entry.exercise.category}</Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleRemoveExercise}
            >
              Remove exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {entry.sets.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Set</TableHead>
                <TableHead className="w-20">Reps</TableHead>
                <TableHead className="w-24">Weight</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.sets.map((set) => (
                <TableRow key={set.id}>
                  <TableCell>{set.setNumber}</TableCell>
                  <TableCell>{set.reps ?? '—'}</TableCell>
                  <TableCell>{set.weightKg ?? 'BW'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleDeleteSet(set.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <AddSetForm workoutExerciseId={entry.workoutExercise.id} />
      </CardContent>
    </Card>
  );
}

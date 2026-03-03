'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const mockWorkouts = [
  {
    id: '1',
    name: 'Push Day',
    startedAt: '07:00',
    duration: '1h 15m',
    exercises: [
      {
        id: 'e1',
        name: 'Bench Press',
        category: 'chest',
        sets: [
          { setNumber: 1, reps: 10, weightKg: '80.00' },
          { setNumber: 2, reps: 8,  weightKg: '85.00' },
          { setNumber: 3, reps: 6,  weightKg: '90.00' },
        ],
      },
      {
        id: 'e2',
        name: 'Overhead Press',
        category: 'shoulders',
        sets: [
          { setNumber: 1, reps: 10, weightKg: '50.00' },
          { setNumber: 2, reps: 8,  weightKg: '55.00' },
          { setNumber: 3, reps: 6,  weightKg: '57.50' },
        ],
      },
      {
        id: 'e3',
        name: 'Tricep Dips',
        category: 'arms',
        sets: [
          { setNumber: 1, reps: 12, weightKg: null },
          { setNumber: 2, reps: 10, weightKg: null },
          { setNumber: 3, reps: 8,  weightKg: null },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="size-4" />
              {format(date, 'do MMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="mb-8 text-sm text-muted-foreground">
        {format(date, 'EEEE, do MMM yyyy')}
      </p>

      {/* Workout list */}
      {mockWorkouts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No workouts logged for this day.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {mockWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {workout.startedAt} · {workout.duration}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {workout.exercises.length}{' '}
                    {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {exercise.category}
                      </Badge>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Set</TableHead>
                          <TableHead className="text-right">Reps</TableHead>
                          <TableHead className="text-right">Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exercise.sets.map((set) => (
                          <TableRow key={set.setNumber}>
                            <TableCell className="text-muted-foreground">
                              {set.setNumber}
                            </TableCell>
                            <TableCell className="text-right">{set.reps}</TableCell>
                            <TableCell className="text-right">
                              {set.weightKg != null ? `${set.weightKg} kg` : 'BW'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

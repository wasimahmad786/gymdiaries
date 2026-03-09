import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { getWorkoutsByDate } from '@/data/workouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DatePicker from './date-picker';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ date?: string }>;
};

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return '';
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { date: dateParam } = await searchParams;
  const date = dateParam ?? format(new Date(), 'yyyy-MM-dd');

  const workoutList = await getWorkoutsByDate(userId, date);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <DatePicker date={date} />
      </div>

      <p className="mb-8 text-sm text-muted-foreground">
        {format(parseISO(date), 'EEEE, do MMM yyyy')}
      </p>

      {/* Workout list */}
      {workoutList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-muted-foreground">No workouts logged for this day.</p>
            <Button asChild>
              <Link href="/dashboard/workout/new">Log workout</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {workoutList.map(({ workout, exercises }) => (
            <Link key={workout.id} href={`/dashboard/workout/${workout.id}`} className="block">
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(workout.startedAt, 'HH:mm')}
                      {workout.completedAt && (
                        <> · {formatDuration(workout.startedAt, workout.completedAt)}</>
                      )}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {exercises.length}{' '}
                    {exercises.length === 1 ? 'exercise' : 'exercises'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {exercises.map(({ exercise, sets }) => (
                  <div key={exercise.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      {exercise.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {exercise.category}
                        </Badge>
                      )}
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
                        {sets.map((set) => (
                          <TableRow key={set.id}>
                            <TableCell className="text-muted-foreground">
                              {set.setNumber}
                            </TableCell>
                            <TableCell className="text-right">{set.reps ?? '—'}</TableCell>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { updateWorkoutAction } from './actions';

type Workout = {
  id: string;
  name: string | null;
  startedAt: Date;
};

export default function EditWorkoutForm({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [name, setName] = useState(workout.name ?? '');
  const [date, setDate] = useState(format(workout.startedAt, 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(workout.startedAt, 'HH:mm'));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startedAt = `${date}T${time}:00.000Z`;
    startTransition(async () => {
      await updateWorkoutAction({ workoutId: workout.id, name: name.trim() || null, startedAt });
      router.push(`/dashboard?date=${date}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g. Push day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                  <CalendarIcon className="size-4" />
                  {format(new Date(`${date}T00:00:00`), 'do MMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(`${date}T00:00:00`)}
                  onSelect={(d) => {
                    if (d) {
                      setDate(format(d, 'yyyy-MM-dd'));
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="time">Start time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

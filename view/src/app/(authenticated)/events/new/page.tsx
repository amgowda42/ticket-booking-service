"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowLeft, CalendarPlus, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEventMutation } from "@/features/events/api/events-api";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { toast } from "sonner";

export default function NewEventPage() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await createEvent({ title: String(data.get("title")), venue: String(data.get("venue")), startsAt: new Date(String(data.get("startsAt"))).toISOString(), totalSeats: Number(data.get("totalSeats")) }).unwrap();
      toast.success("Event published successfully");
      router.replace("/");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      toast.error(message);
    }
  }

  return <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8"><Button variant="ghost" onClick={() => router.back()}><ArrowLeft aria-hidden="true" />Back</Button><Card className="mt-5 p-6 sm:p-8"><p className="text-sm font-medium text-accent">Admin workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Create an event</h1><p className="mt-2 text-sm text-muted-foreground">Publish an event and set its initial ticket inventory.</p><form className="mt-8 space-y-5" onSubmit={submit}><Field id="title" label="Event title" required /><Field id="venue" label="Venue" required /><Field id="startsAt" label="Start date and time" type="datetime-local" required /><Field id="totalSeats" label="Total seats" type="number" min="1" required />{error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">{error}</p>}<Button className="h-11 w-full rounded-xl" size="lg" type="submit" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : <><CalendarPlus />Publish event</>}</Button></form></Card></div>;
}

function Field({ id, label, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={id} {...props} /></div>; }

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRegistrationEmail } from "@/lib/email";
import type { RegistrationField } from "@/lib/types/database";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, full_name, email, phone, custom_fields } = body;

    if (!event_id || !full_name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title_he, title_en, event_date, location_he, location_en, max_participants, registration_deadline, registration_fields, is_published")
      .eq("id", event_id)
      .eq("is_published", true)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Validate custom registration fields
    const registrationFields = (event.registration_fields || []) as RegistrationField[];
    if (registrationFields.length > 0) {
      const fieldErrors: Record<string, string> = {};
      const fields = custom_fields || {};

      for (const field of registrationFields) {
        const value = fields[field.id];

        // Check required fields
        if (field.required && (value === undefined || value === null || value === "")) {
          fieldErrors[field.id] = `${field.label_en || field.label_he} is required`;
          continue;
        }

        if (value === undefined || value === null || value === "") continue;

        // Type-specific validation
        if (field.type === "email" && typeof value === "string" && !validateEmail(value)) {
          fieldErrors[field.id] = "Invalid email format";
        } else if (field.type === "number") {
          const num = Number(value);
          if (isNaN(num)) {
            fieldErrors[field.id] = "Must be a number";
          }
        } else if (field.type === "select" && field.options && field.options.length > 0) {
          if (!field.options.includes(String(value))) {
            fieldErrors[field.id] = "Invalid selection";
          }
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        return NextResponse.json(
          { error: "Validation failed", fields: fieldErrors },
          { status: 400 }
        );
      }
    }

    // Check registration deadline
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    // Check capacity
    let status: "confirmed" | "waitlist" = "confirmed";
    if (event.max_participants) {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event_id)
        .eq("status", "confirmed");

      if (count && count >= event.max_participants) {
        status = "waitlist";
      }
    }

    // Check for duplicate registration
    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event_id)
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 409 }
      );
    }

    // Insert registration
    const { data: registration, error: insertError } = await supabase
      .from("event_registrations")
      .insert({
        event_id,
        full_name,
        email,
        phone,
        custom_fields: custom_fields || {},
        status,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking)
    sendRegistrationEmail({
      to: email,
      participantName: full_name,
      eventTitle: event.title_he || event.title_en,
      eventDate: event.event_date,
      eventLocation: event.location_he || event.location_en,
      status,
    });

    return NextResponse.json({ registration, status });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

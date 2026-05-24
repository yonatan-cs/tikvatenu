import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { DEFAULT_FEEDBACK_FIELDS } from "@/lib/constants/default-feedback-fields";
import type { RegistrationField } from "@/lib/types/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, respondent_name, responses } = body;

    if (!event_id || !respondent_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, event_date, feedback_fields, is_published")
      .eq("id", event_id)
      .eq("is_published", true)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (new Date(event.event_date) >= new Date()) {
      return NextResponse.json(
        { error: "Feedback is only available after the event has started" },
        { status: 400 }
      );
    }

    const storedFields = (event.feedback_fields || []) as RegistrationField[];
    const feedbackFields: RegistrationField[] = storedFields.length > 0 ? storedFields : DEFAULT_FEEDBACK_FIELDS;
    const fieldErrors: Record<string, string> = {};
    const submittedResponses = (responses || {}) as Record<string, unknown>;

    for (const field of feedbackFields) {
      const value = submittedResponses[field.id];

      if (field.required && (value === undefined || value === null || value === "")) {
        fieldErrors[field.id] = `${field.label_he || field.label_en} is required`;
        continue;
      }

      if (value === undefined || value === null || value === "") continue;

      if (field.type === "number") {
        if (isNaN(Number(value))) {
          fieldErrors[field.id] = "Must be a number";
        }
      } else if (field.type === "rating") {
        const n = Number(value);
        if (isNaN(n) || n < 1 || n > 5) {
          fieldErrors[field.id] = "Rating must be 1-5";
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

    const { data: feedback, error: insertError } = await adminSupabase
      .from("event_feedbacks")
      .insert({
        event_id,
        respondent_name,
        responses: submittedResponses,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("[feedback] unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

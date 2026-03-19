export type RegistrationFieldType = "text" | "email" | "phone" | "number" | "select" | "checkbox";

export interface RegistrationField {
  id: string;
  label_he: string;
  label_en: string;
  type: RegistrationFieldType;
  required: boolean;
  options?: string[]; // for select type
}

export interface Event {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  description_he: string;
  description_en: string;
  body_he: string | null;
  body_en: string | null;
  cover_image: string | null;
  location_he: string | null;
  location_en: string | null;
  location_url: string | null;
  event_date: string;
  event_end_date: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  registration_fields: RegistrationField[];
  is_published: boolean;
  summary_he: string | null;
  summary_en: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  custom_fields: Record<string, string | number | boolean>;
  status: "confirmed" | "cancelled" | "waitlist";
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  excerpt_he: string | null;
  excerpt_en: string | null;
  body_he: string | null;
  body_en: string | null;
  cover_image: string | null;
  pdf_url: string | null;
  category: "thought" | "press" | "opinion" | "spirit";
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Update {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  body_he: string | null;
  body_en: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title_he: string;
  title_en: string;
  description_he: string | null;
  description_en: string | null;
  cover_image: string | null;
  event_id: string | null;
  is_published: boolean;
  sort_order: number;
  author_id: string;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  album_id: string;
  image_url: string;
  caption_he: string | null;
  caption_en: string | null;
  sort_order: number;
  created_at: string;
}

export interface JoinSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  interests: string | null;
  how_heard: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

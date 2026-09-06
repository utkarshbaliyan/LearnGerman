export const STORY_PROGRESS_STORAGE_KEY = "leselaut:story-progress:v1";
export const PROGRESS_SYNCED_EVENT = "leselaut:progress-synced";
export const CLOUD_PROGRESS_OWNER_STORAGE_KEY = "leselaut:cloud-progress-owner:v1";
export const PROGRESS_STORAGE_KEYS = {
  course: "leselaut:course-progress:v1", stories: STORY_PROGRESS_STORAGE_KEY,
  grammar: "leselaut:grammar-progress:v1", vocabulary: "leselaut:vocabulary-progress:v2",
} as const;

/** The address hash `tag/<name>` (no `.md`, so never a note) names the task view for a tag. */
export const tagFromPath = (path: string): string | null => /^tag\/([\p{L}\p{N}_-]+)$/u.exec(path)?.[1].toLowerCase() ?? null;

/** The task line as the note shows it, without the checkbox. */
export const taskLabel = (text: string): string => text.replace(/^\s*- \[.\]\s*/, "");

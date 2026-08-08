/**
 * Descriptions are markdown and get shown in full on the build page, so the cap
 * is generous. Enforced by the write schemas and by the editor's `maxLength`;
 * rows written before the cap existed may be longer, so render paths must not
 * assume it.
 */
export const MAX_DESCRIPTION_LENGTH = 5000;

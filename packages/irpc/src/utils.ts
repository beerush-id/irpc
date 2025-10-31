let lastTimestamp = 0;
let sequence = 0;

/**
 * Generates a short unique identifier string.
 * 
 * This function creates a unique ID by combining:
 * - A timestamp in base-36 format
 * - A sequence number in base-36 format (padded to 3 characters)
 * - A random string in base-36 format (4 characters)
 * 
 * The sequence number ensures uniqueness when multiple IDs are generated within the same millisecond.
 * The random part adds additional entropy to reduce predictability.
 * 
 * @returns A unique string identifier
 */
export function shortId(): string {
  const timestamp = Date.now();

  if (timestamp === lastTimestamp) {
    sequence++;
  } else {
    sequence = 0;
  }
  lastTimestamp = timestamp;

  const timestampPart = timestamp.toString(36);
  const sequencePart = sequence.toString(36).padStart(3, '0');
  const randomPart = Math.random().toString(36).substring(2, 6);

  return `${timestampPart}${sequencePart}${randomPart}`;
}

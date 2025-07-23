/**
 * Converts milliseconds into a "m:ss.SSS" time format.
 * Rounds the input and ensures exactly three decimal places.
 * Returns a placeholder if the input is invalid or zero.
 * @param ms - The time in milliseconds.
 * @returns A formatted time string (e.g., "1:43.253").
 */
export function formatTimeFromMs(ms: number | null | undefined): string {
    if (ms === null || ms === undefined || ms <= 0) {
        return '--:--.---';
    }

    // --- KEY FIX: Round the total milliseconds FIRST to avoid floating point issues ---
    const totalMilliseconds = Math.round(ms);

    const minutes = Math.floor(totalMilliseconds / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    // Use padStart to ensure the format is always consistent (ss.SSS)
    const paddedSeconds = String(seconds).padStart(2, '0');
    const paddedMilliseconds = String(milliseconds).padStart(3, '0');

    return `${minutes}:${paddedSeconds}.${paddedMilliseconds}`;
}

/**
 * Converts milliseconds into a human-readable duration format (e.g., "45m 32s").
 * @param ms - The duration in milliseconds.
 * @returns A formatted duration string.
 */
export function formatDurationFromMs(ms: number | null | undefined): string {
    if (ms === null || ms === undefined || ms < 1000) {
        return '0s';
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
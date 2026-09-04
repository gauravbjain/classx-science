/**
 * Tints are derived from a single hue so a new subject only ever supplies
 * one colour per unit — no Tailwind classes to safelist, no shared file to edit.
 */
export const tint = (hue: string, pct = 10) => `color-mix(in srgb, ${hue} ${pct}%, transparent)`;
export const onTint = (hue: string) => `color-mix(in srgb, ${hue} 78%, var(--ink))`;

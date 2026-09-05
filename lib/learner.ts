/**
 * Who this site is for. Change the name here to personalise the whole site.
 */
export const LEARNER_NAME = "Sanyam";

/**
 * A rotating line of encouragement. One is shown per day (stable within a day),
 * so it feels fresh each visit without flickering. Keep them warm and specific
 * to a Class 10 student heading toward the boards.
 */
export const PEP_TALKS = [
  "Small steps every day beat one long night of cramming.",
  "You don't have to be perfect — just a little better than yesterday.",
  "The ten minutes you study now is a mark you keep in the exam hall.",
  "Every topper was once exactly where you are. Keep going.",
  "Understanding beats memorising. Ask “why” and the marks follow.",
  "One chapter at a time is how the whole syllabus gets finished.",
  "A question you got wrong today is a question you'll get right in March.",
  "Consistency is a superpower. Show up, even for fifteen minutes.",
  "Revise what's hard, not just what's comfortable — that's where the growth is.",
  "You're not behind. You're exactly one study session ahead of yesterday.",
  "Confused is the feeling right before you understand. Push through it.",
  "Practice like it's the exam, so the exam feels like practice.",
  "Your brain is a muscle. Every hard problem makes it stronger.",
  "Done is better than perfect. Finish the chapter, then polish it.",
  "The best time to start was yesterday. The second best time is now.",
  "Believe you can, and you're already halfway there.",
  "Marks are earned in the quiet hours no one sees. Keep at it.",
  "Mistakes aren't failure — they're the map to your next 5 marks.",
];

/** Index into PEP_TALKS that changes once a day. */
export function pepOfTheDay(list: string[] = PEP_TALKS): string {
  const start = Date.UTC(2026, 0, 1);
  const day = Math.floor((Date.now() - start) / 86400000);
  return list[((day % list.length) + list.length) % list.length];
}

export function greetingWord(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Studying late";
}

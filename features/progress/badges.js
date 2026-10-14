export const BADGES = [
  { id: "first-lesson", label: "First step", text: "Complete your first lesson", icon: "footprints", test: (s) => s.lessons >= 1 },
  { id: "ten-lessons", label: "Getting serious", text: "Complete 10 lessons", icon: "book", test: (s) => s.lessons >= 10 },
  { id: "fifty-lessons", label: "Marathoner", text: "Complete 50 lessons", icon: "medal", test: (s) => s.lessons >= 50 },
  { id: "streak-3", label: "On a roll", text: "Study 3 days in a row", icon: "flame", test: (s) => s.bestStreak >= 3 },
  { id: "streak-7", label: "Week warrior", text: "Study 7 days in a row", icon: "flame", test: (s) => s.bestStreak >= 7 },
  { id: "streak-30", label: "Unstoppable", text: "Study 30 days in a row", icon: "zap", test: (s) => s.bestStreak >= 30 },
  { id: "first-quiz", label: "Quiz taker", text: "Pass your first quiz", icon: "check", test: (s) => s.quizzesPassed >= 1 },
  { id: "perfect", label: "Perfectionist", text: "Score 100% on a quiz", icon: "target", test: (s) => s.perfectScores >= 1 },
  { id: "ten-hours", label: "Ten hours in", text: "Study for 10 hours", icon: "clock", test: (s) => s.minutes >= 600 },
  { id: "first-certificate", label: "Certified", text: "Earn your first certificate", icon: "award", test: (s) => s.certificates >= 1 },
  { id: "three-certificates", label: "Collector", text: "Earn 3 certificates", icon: "trophy", test: (s) => s.certificates >= 3 },
  { id: "note-taker", label: "Note taker", text: "Save 5 lesson notes", icon: "notebook", test: (s) => s.notes >= 5 },
  { id: "curious", label: "Curious mind", text: "Ask a question in a lesson", icon: "message", test: (s) => s.questions >= 1 },
  { id: "reviewer", label: "Helpful voice", text: "Review a course", icon: "star", test: (s) => s.reviews >= 1 },
];

export const evaluateBadges = (stats) => BADGES.map(({ test, ...badge }) => ({ ...badge, earned: test(stats) }));

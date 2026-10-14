export const normalizeAnswer = (value = "") =>
  String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,!?;:'"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const isAnswerCorrect = (question, answer) => {
  if (question.type === "short_answer") {
    const given = normalizeAnswer(answer?.text);
    return Boolean(given) && (question.acceptedAnswers ?? []).some((accepted) => normalizeAnswer(accepted) === given);
  }
  const correct = question.options.filter((o) => o.isCorrect).map((o) => String(o._id ?? o.id));
  const selected = (answer?.selected ?? []).map(String);
  return correct.length > 0 && selected.length === correct.length && selected.every((id) => correct.includes(id));
};

export const scoreAttempt = (questions, questionOrder, answers, passingPercent = 0) => {
  const byId = new Map(questions.map((q) => [String(q._id ?? q.id), q]));
  let score = 0;
  let maxScore = 0;
  questionOrder.forEach((questionId) => {
    const question = byId.get(String(questionId));
    if (!question) return;
    maxScore += question.points;
    const answer = answers.find((a) => String(a.questionId) === String(questionId));
    if (isAnswerCorrect(question, answer)) score += question.points;
  });
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percent, passed: percent >= passingPercent };
};

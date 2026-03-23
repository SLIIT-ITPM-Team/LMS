function splitSummary(summary) {
  return (summary || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function createQuestion(sourceText, index) {
  const base = sourceText.replace(/\s+/g, ' ').trim();
  const fallback = `Key idea ${index + 1}`;
  const answer = base.length ? base : fallback;

  const distractors = [
    'Unrelated concept',
    'Opposite meaning',
    'Not mentioned in summary'
  ];

  const options = [
    { text: answer, isCorrect: true },
    ...distractors.map((text) => ({ text, isCorrect: false }))
  ];

  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    questionText: `Which option best matches summary point ${index + 1}?`,
    options,
    correctAnswer: answer
  };
}

function generateQuizQuestions(summary, count = 10) {
  const items = splitSummary(summary);
  const safeCount = Math.max(1, count);

  const questions = [];
  for (let index = 0; index < safeCount; index += 1) {
    const source = items[index % Math.max(1, items.length)] || '';
    questions.push(createQuestion(source, index));
  }

  return questions;
}

module.exports = { generateQuizQuestions };

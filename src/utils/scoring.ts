import { PsychTest, TestResult, ScoreRange } from '../types';

export function calculateScore(
  test: PsychTest,
  answers: { questionId: string; value: number }[]
): Omit<TestResult, 'testId' | 'completedAt'> {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));

  let totalScore = 0;
  const subscaleScores: { [key: string]: number } = {};

  if (test.specialScoring === 'pss10') {
    // PSS-10: reverse score items marked as reversed
    for (const q of test.questions) {
      const val = answerMap.get(q.id) ?? 0;
      const score = q.reversed ? 4 - val : val;
      totalScore += score;
    }
  } else if (test.specialScoring === 'rses') {
    // Rosenberg: options are 1-4, reversed items flip
    for (const q of test.questions) {
      const val = answerMap.get(q.id) ?? 1;
      const score = q.reversed ? 5 - val : val;
      totalScore += score;
    }
  } else if (test.specialScoring === 'dass21') {
    // DASS-21: each subscale sum * 2
    for (const subscale of test.subscales ?? []) {
      let sub = 0;
      for (const qid of subscale.questionIds) {
        sub += answerMap.get(qid) ?? 0;
      }
      const scaledScore = sub * (subscale.multiplier ?? 1);
      subscaleScores[subscale.id] = scaledScore;
      totalScore += sub;
    }
  } else if (test.specialScoring === 'gds15') {
    // GDS-15: yes/no items; reversed items score 1 for "Үгүй" (value=0), non-reversed score 1 for "Тийм" (value=1)
    for (const q of test.questions) {
      const val = answerMap.get(q.id) ?? 0;
      totalScore += q.reversed ? (val === 0 ? 1 : 0) : val;
    }
  } else if (test.specialScoring === 'bigfive') {
    // Big Five: each pair of questions, reversed items flipped
    for (const subscale of test.subscales ?? []) {
      let sub = 0;
      for (const qid of subscale.questionIds) {
        const q = test.questions.find((q) => q.id === qid);
        const val = answerMap.get(qid) ?? 3;
        sub += q?.reversed ? 6 - val : val;
      }
      subscaleScores[subscale.id] = sub;
      totalScore += sub;
    }
  } else if (test.specialScoring === 'mbti') {
    // MBTI: 4 subscales (EI, SN, TF, JP), 6 questions each (1-5 scale)
    // E/S/T/J questions: not reversed (high = more of that trait)
    // I/N/F/P questions: reversed (6-val), so high subscale score = first pole (E/S/T/J)
    for (const subscale of test.subscales ?? []) {
      let sub = 0;
      for (const qid of subscale.questionIds) {
        const q = test.questions.find((q) => q.id === qid);
        const val = answerMap.get(qid) ?? 3;
        sub += q?.reversed ? 6 - val : val;
      }
      subscaleScores[subscale.id] = sub;
    }
    const ei = subscaleScores['EI'] ?? 45;
    const sn = subscaleScores['SN'] ?? 45;
    const tf = subscaleScores['TF'] ?? 45;
    const jp = subscaleScores['JP'] ?? 45;
    // Threshold = questions_per_subscale * 3 (neutral midpoint)
    // High subscale score (>threshold) = first pole (E/S/T/J); low = second pole (I/N/F/P)
    const mid = (test.subscales?.[0]?.questionIds.length ?? 15) * 3;
    totalScore = (ei <= mid ? 1 : 0) | (sn <= mid ? 2 : 0) | (tf <= mid ? 4 : 0) | (jp <= mid ? 8 : 0);
  } else {
    // Standard: sum all answers, compute subscales if any
    for (const q of test.questions) {
      const val = answerMap.get(q.id) ?? 0;
      totalScore += val;

      if (q.subscale) {
        subscaleScores[q.subscale] = (subscaleScores[q.subscale] ?? 0) + val;
      }
    }

    if (test.subscales) {
      for (const subscale of test.subscales) {
        if (!(subscale.id in subscaleScores)) {
          let sub = 0;
          for (const qid of subscale.questionIds) {
            sub += answerMap.get(qid) ?? 0;
          }
          subscaleScores[subscale.id] = sub * (subscale.multiplier ?? 1);
        } else if (subscale.multiplier && subscale.multiplier > 1) {
          subscaleScores[subscale.id] = subscaleScores[subscale.id] * subscale.multiplier;
        }
      }
    }
  }

  const range = findRange(test.ranges, totalScore);

  return {
    answers,
    subscaleScores,
    totalScore,
    interpretation: range?.label ?? 'Тодорхойгүй',
    severity: range?.severity ?? 'minimal',
  };
}

export function findRange(ranges: ScoreRange[], score: number): ScoreRange | null {
  return ranges.find((r) => score >= r.min && score <= r.max) ?? null;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minimal': return 'text-green-700 bg-green-100';
    case 'mild': return 'text-yellow-700 bg-yellow-100';
    case 'moderate': return 'text-orange-700 bg-orange-100';
    case 'severe': return 'text-red-700 bg-red-100';
    case 'extreme': return 'text-red-900 bg-red-200';
    default: return 'text-gray-700 bg-gray-100';
  }
}

export function getSeverityBorder(severity: string): string {
  switch (severity) {
    case 'minimal': return 'border-green-400';
    case 'mild': return 'border-yellow-400';
    case 'moderate': return 'border-orange-400';
    case 'severe': return 'border-red-500';
    case 'extreme': return 'border-red-700';
    default: return 'border-gray-300';
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

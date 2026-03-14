const OPENROUTER_KEY = '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';
const MODEL = 'google/gemma-3-4b-it:free';

// ── Tracks all questions asked so they never repeat ──
const askedQuestions: string[] = [];

export type Question = {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type StudentProfile = {
  topic: string;
  difficulty: number;
  cvState: string;
  budget: number;
  correctCount: number;
  wrongCount: number;
  streak: number;
  recentAnswers: boolean[];
  avgTimeSpent: number;
};

function buildPrompt(profile: StudentProfile): string {
  // Build history string so AI never repeats
  const history = askedQuestions.length > 0
    ? `\nDO NOT repeat these already asked:\n${askedQuestions.slice(-5).map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  // Difficulty description
  const diffDesc =
    profile.difficulty <= 2 ? 'very easy, simple recall' :
    profile.difficulty <= 4 ? 'easy, basic understanding' :
    profile.difficulty <= 6 ? 'medium, application based' :
    profile.difficulty <= 8 ? 'hard, deep analysis' :
                              'expert, synthesis level';

  // CV adaptation
  const cvHint =
    profile.cvState === 'TIRED'      ? 'Student is TIRED: make it simpler and shorter' :
    profile.cvState === 'FRUSTRATED' ? 'Student is FRUSTRATED: make it confidence building' :
    profile.cvState === 'DISTRACTED' ? 'Student is DISTRACTED: make it interesting' :
                                       'Student is FOCUSED: full difficulty';

  // Performance hints
  const perfHint =
    profile.streak >= 3              ? 'On a hot streak: push slightly harder' :
    profile.recentAnswers.slice(-2).filter(a => !a).length === 2 ? 'Last 2 wrong: go easier' :
    profile.budget < 30              ? 'Very low budget: keep question short and simple' :
                                       'Normal performance';

  return `You are an adaptive learning AI. Generate exactly 1 multiple choice question.

STUDENT PROFILE:
- Topic: ${profile.topic}
- Difficulty: ${profile.difficulty}/10 (${diffDesc})
- Accuracy: ${profile.correctCount}/${profile.correctCount + profile.wrongCount}
- Streak: ${profile.streak}
- Budget: ${profile.budget}/100
- Recent answers: ${profile.recentAnswers.slice(-5).map(a => a ? '✓' : '✗').join(' ') || 'none yet'}
${history}

ADAPTATION: ${cvHint}
PERFORMANCE: ${perfHint}

Return ONLY this exact JSON, no markdown, no extra text:
{
  "text": "unique question here",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_index": 0,
  "explanation": "brief explanation of correct answer"
}`;
}

export async function generateQuestion(profile: StudentProfile): Promise<Question> {
  try {
    console.log(`=== Question #${askedQuestions.length + 1} | Difficulty: ${profile.difficulty} | CV: ${profile.cvState} ===`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(profile) }],
        max_tokens: 350,
        temperature: 0.9, // ← high = more variety, never same question
      }),
    });

    console.log('Status:', response.status);
    const text = await response.text();
    const data = JSON.parse(text);

    // ── Handle API errors ──
    if (data.error) {
      console.error('API Error:', data.error);
      return getFallback(profile.topic, askedQuestions.length);
    }

    const content = data.choices[0].message.content;
    console.log('Content:', content);

    // ── Extract JSON from response ──
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in:', content);
      return getFallback(profile.topic, askedQuestions.length);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // ── Validate fields ──
    if (!parsed.text || !parsed.options || parsed.correct_index === undefined) {
      console.error('Missing fields:', parsed);
      return getFallback(profile.topic, askedQuestions.length);
    }

    // ── Save to history so it never repeats ──
    askedQuestions.push(parsed.text);
    console.log(`✅ Question generated and saved. History: ${askedQuestions.length}`);

    return {
      text:         parsed.text,
      options:      parsed.options,
      correctIndex: parsed.correct_index,
      explanation:  parsed.explanation || '',
    };

  } catch (err) {
    console.error('Full error:', err);
    return getFallback(profile.topic, askedQuestions.length);
  }
}

// ── Fallback questions — unique per index so they don't repeat either ──
function getFallback(topic: string, index: number): Question {
  const fallbacks = [
    { text: `What is the main concept of ${topic}?`,        correct: 0 },
    { text: `Which best describes ${topic}?`,               correct: 1 },
    { text: `What is a key principle of ${topic}?`,         correct: 2 },
    { text: `How is ${topic} best defined?`,                correct: 0 },
    { text: `What makes ${topic} significant?`,             correct: 1 },
    { text: `Which statement about ${topic} is correct?`,   correct: 2 },
    { text: `What is the core idea behind ${topic}?`,       correct: 0 },
    { text: `How would you summarize ${topic}?`,            correct: 1 },
    { text: `What is the origin of ${topic}?`,              correct: 2 },
    { text: `Why is ${topic} important?`,                   correct: 0 },
  ];

  const f = fallbacks[index % fallbacks.length];
  return {
    text:         f.text,
    options:      ['Fundamental principle', 'Core application', 'Advanced theory', 'Expert analysis'],
    correctIndex: f.correct,
    explanation:  'API unavailable — using fallback question',
  };
}
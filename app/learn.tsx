import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    StatusBar, TouchableOpacity, ActivityIndicator
  } from 'react-native';
  import { useState, useEffect, useRef } from 'react';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { colors, spacing, radius } from '@/constants/theme';
  import { generateQuestion, type Question, type StudentProfile } from '@/utils/questionEngine';
  
  // ─────────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────────
  const API_BASE  = 'http://192.168.1.100:5000'; // ← your IP on Day 4
  const USE_BACKEND = false; // ← flip to true on Day 4
  
  // ─────────────────────────────────────────────────────────
  // TYPES
  // ─────────────────────────────────────────────────────────
  type CVState = 'FOCUSED' | 'TIRED' | 'FRUSTRATED' | 'DISTRACTED' | 'SLEEPING';
  
  // ─────────────────────────────────────────────────────────
  // CV CONFIG — depletion rates exactly from PDF
  // ─────────────────────────────────────────────────────────
  const CV_CONFIG: Record<CVState, {
    color: string;
    icon: string;
    label: string;
    depletionPer5Sec: number;
  }> = {
    FOCUSED:    { color: colors.focused,    icon: '◉', label: 'Focused',    depletionPer5Sec: 0.125 },
    TIRED:      { color: colors.tired,      icon: '◔', label: 'Tired',      depletionPer5Sec: 1.25  },
    FRUSTRATED: { color: colors.frustrated, icon: '◈', label: 'Frustrated', depletionPer5Sec: 0.83  },
    DISTRACTED: { color: colors.distracted, icon: '◌', label: 'Distracted', depletionPer5Sec: 0     },
    SLEEPING:   { color: '#6B7280',         icon: '◯', label: 'Sleeping',   depletionPer5Sec: 0     },
  };
  
  const OPTION_LABELS = ['A', 'B', 'C', 'D'];
  const TOTAL_QUESTIONS = 10;
  
  // ─────────────────────────────────────────────────────────
  // SMALL COMPONENTS
  // ─────────────────────────────────────────────────────────
  function CVBar({ cvState, blinkRate, gaze, emotion }: {
    cvState: CVState; blinkRate: number; gaze: string; emotion: string;
  }) {
    const cfg = CV_CONFIG[cvState];
    return (
      <View style={[cvs.wrap, { borderColor: cfg.color + '40', backgroundColor: cfg.color + '10' }]}>
        <Text style={[cvs.icon, { color: cfg.color }]}>{cfg.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[cvs.state, { color: cfg.color }]}>CV: {cfg.label}</Text>
          <Text style={cvs.metrics}>
            👁 {blinkRate}/min · {gaze === 'on_screen' ? '◉ On screen' : '◌ Off screen'} · {emotion}
          </Text>
        </View>
        <View style={cvs.right}>
          <Text style={[cvs.depVal, { color: cfg.color }]}>-{cfg.depletionPer5Sec}</Text>
          <Text style={cvs.depLabel}>per 5s</Text>
        </View>
      </View>
    );
  }
  const cvs = StyleSheet.create({
    wrap:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, padding: spacing.sm },
    icon:     { fontSize: 20 },
    state:    { fontSize: 12, fontWeight: '700' },
    metrics:  { fontSize: 10, color: colors.textMuted, marginTop: 2 },
    right:    { alignItems: 'center' },
    depVal:   { fontSize: 14, fontWeight: '800' },
    depLabel: { fontSize: 8, color: colors.textMuted },
  });
  
  function BudgetBar({ budget }: { budget: number }) {
    const color = budget > 60 ? colors.budgetHigh : budget > 30 ? colors.budgetMed : colors.budgetLow;
    const label = budget > 60 ? 'FOCUSED' : budget > 30 ? 'FADING' : 'DEPLETED';
    return (
      <View style={bgs.wrap}>
        <View style={bgs.left}>
          <Text style={bgs.label}>COGNITIVE BUDGET</Text>
          <Text style={[bgs.value, { color }]}>
            {Math.round(budget)}<Text style={bgs.max}>/100</Text>
          </Text>
        </View>
        <View style={bgs.right}>
          <View style={bgs.track}>
            <View style={[bgs.fill, { width: `${budget}%`, backgroundColor: color }]} />
          </View>
          <View style={[bgs.badge, { borderColor: color + '60', backgroundColor: color + '15' }]}>
            <View style={[bgs.dot, { backgroundColor: color }]} />
            <Text style={[bgs.badgeText, { color }]}>{label}</Text>
          </View>
        </View>
      </View>
    );
  }
  const bgs = StyleSheet.create({
    wrap:      { backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    left:      { alignItems: 'center', minWidth: 70 },
    label:     { fontSize: 8, letterSpacing: 1.5, color: colors.textMuted, fontWeight: '600' },
    value:     { fontSize: 28, fontWeight: '900' },
    max:       { fontSize: 12, color: colors.textMuted },
    right:     { flex: 1, gap: 6 },
    track:     { height: 6, backgroundColor: colors.border, borderRadius: 3 },
    fill:      { height: 6, borderRadius: 3 },
    badge:     { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
    dot:       { width: 5, height: 5, borderRadius: 999 },
    badgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  });
  
  // ─────────────────────────────────────────────────────────
  // MAIN SCREEN
  // ─────────────────────────────────────────────────────────
  export default function LearnScreen() {
    const router = useRouter();
    const { topic } = useLocalSearchParams<{ topic: string }>();
  
    // ── Question ──
    const [question, setQuestion]   = useState<Question | null>(null);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState<number | null>(null);
    const [answered, setAnswered]   = useState(false);
    const [apiError, setApiError]   = useState('');
  
    // ── Session stats ──
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [correctCount, setCorrectCount]   = useState(0);
    const [streak, setStreak]               = useState(0);
    const [sessionDone, setSessionDone]     = useState(false);
  
    // ── Adaptive difficulty (PDF rules) ──
    const [difficulty, setDifficulty]   = useState(5);
    const [consCorrect, setConsCorrect] = useState(0);
    const [consWrong, setConsWrong]     = useState(0);
  
    // ── Cognitive budget ──
    const [budget, setBudget] = useState(100);
  
    // ── CV state (your trained model feeds this on Day 4) ──
    const [cvState, setCvState]     = useState<CVState>('FOCUSED');
    const [blinkRate, setBlinkRate] = useState(17);
    const [gaze, setGaze]           = useState('on_screen');
    const [emotion, setEmotion]     = useState('neutral');
  
    // ── Answer history for Gemini context ──
    const [recentAnswers, setRecentAnswers] = useState<boolean[]>([]);
    const [totalTime, setTotalTime]         = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
  
    // ── Timer ──
    const startTimeRef = useRef<number>(Date.now());
  
    const diffColor = difficulty <= 3 ? colors.budgetHigh
      : difficulty <= 7 ? colors.budgetMed
      : colors.budgetLow;
  
    // ── Load first question on mount ──
    useEffect(() => {
      loadNextQuestion();
    }, []);
  
    // ── Poll CV state every 5 seconds (PDF rule) ──
    useEffect(() => {
      const interval = setInterval(async () => {
        if (!USE_BACKEND) {
          // Simulate CV changes for demo
          const rand = Math.random();
          const newState: CVState =
            rand < 0.65 ? 'FOCUSED'    :
            rand < 0.80 ? 'TIRED'      :
            rand < 0.92 ? 'DISTRACTED' :
            rand < 0.98 ? 'FRUSTRATED' : 'SLEEPING';
  
          setCvState(newState);
  
          // Deplete budget at PDF rates
          setBudget(b => Math.max(b - CV_CONFIG[newState].depletionPer5Sec, 0));
  
          // CV overrides difficulty (PDF rule)
          if (newState === 'TIRED' || newState === 'SLEEPING') {
            setDifficulty(d => Math.max(d - 1, 1));
          }
          return;
        }
  
        // Day 4 — real CV data from your trained model via backend
        try {
          const res = await fetch(`${API_BASE}/api/cv/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: cvState }),
          });
          const data = await res.json();
          if (data.budget    !== undefined) setBudget(data.budget);
          if (data.state)                   setCvState(data.state);
          if (data.blink_rate !== undefined) setBlinkRate(data.blink_rate);
          if (data.gaze)                    setGaze(data.gaze);
          if (data.emotion)                 setEmotion(data.emotion);
          if (data.difficulty !== undefined) setDifficulty(data.difficulty);
        } catch (e) {
          console.log('Backend not available yet');
        }
      }, 5000);
  
      return () => clearInterval(interval);
    }, [cvState]);
  
    // ─────────────────────────────────────────────────────
    // LOAD NEXT QUESTION
    // Sends full student profile to Gemini
    // Every question is uniquely generated
    // ─────────────────────────────────────────────────────
    const loadNextQuestion = async () => {
      setLoading(true);
      setSelected(null);
      setAnswered(false);
      setApiError('');
      startTimeRef.current = Date.now();
  
      // Full student profile — Gemini adapts based on ALL of this
      const profile: StudentProfile = {
        topic:        topic || 'General Knowledge',
        difficulty,
        cvState,
        budget,
        correctCount,
        wrongCount:   totalAnswered - correctCount,
        streak,
        recentAnswers: recentAnswers.slice(-5), // last 5 answers
        avgTimeSpent:  questionCount > 0
                         ? Math.round(totalTime / questionCount)
                         : 15,
      };
  
      try {
        const q = await generateQuestion(profile);
        setQuestion(q);
      } catch (err) {
        setApiError('Failed to generate question. Check your Gemini key.');
      }
  
      setLoading(false);
    };
  
    // ─────────────────────────────────────────────────────
    // HANDLE ANSWER
    // ─────────────────────────────────────────────────────
    const handleSubmit = async () => {
      if (selected === null || answered || !question) return;
      setAnswered(true);
  
      const correct   = selected === question.correctIndex;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const newTotal  = totalAnswered + 1;
  
      // ── Update stats ──
      setTotalAnswered(newTotal);
      setRecentAnswers(prev => [...prev.slice(-9), correct]);
      setTotalTime(t => t + timeSpent);
      setQuestionCount(c => c + 1);
  
      if (correct) {
        setCorrectCount(c => c + 1);
        setStreak(s => s + 1);
      } else {
        setStreak(0);
      }
  
      // ── Difficulty adaptation — exact PDF rules ──
      if (correct) {
        const newCC = consCorrect + 1;
        setConsCorrect(newCC);
        setConsWrong(0);
        if (newCC >= 2) {
          // 2 correct in a row → difficulty up
          setDifficulty(d => Math.min(d + 1, 10));
          setConsCorrect(0);
        }
      } else {
        const newCW = consWrong + 1;
        setConsWrong(newCW);
        setConsCorrect(0);
        if (newCW >= 2) {
          // 2 wrong in a row → difficulty down
          setDifficulty(d => Math.max(d - 1, 1));
          setConsWrong(0);
        }
      }
  
      // ── CV state overrides performance (PDF rule) ──
      if (cvState === 'TIRED' || cvState === 'SLEEPING') {
        setDifficulty(d => Math.max(d - 1, 1));
      }
  
      // ── Send answer to backend on Day 4 ──
      if (USE_BACKEND) {
        try {
          await fetch(`${API_BASE}/api/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic, correct, difficulty, time_spent: timeSpent, cv_state: cvState
            }),
          });
        } catch (e) {
          console.log('Backend not available');
        }
      }
  
      // ── Next question after 2s ──
      setTimeout(() => {
        if (newTotal >= TOTAL_QUESTIONS) {
          setSessionDone(true);
        } else {
          loadNextQuestion();
        }
      }, 2000);
    };
  
    // ─────────────────────────────────────────────────────
    // SESSION COMPLETE
    // ─────────────────────────────────────────────────────
    if (sessionDone) {
      const accuracy    = Math.round((correctCount / totalAnswered) * 100);
      const budgetColor = budget > 60 ? colors.budgetHigh : budget > 30 ? colors.budgetMed : colors.budgetLow;
  
      return (
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
          <ScrollView contentContainerStyle={s.doneScroll}>
            <Text style={s.doneIcon}>🎯</Text>
            <Text style={s.doneTitle}>Session Complete!</Text>
            <Text style={s.doneSub}>
              {correctCount}/{totalAnswered} correct · {accuracy}% accuracy
            </Text>
  
            {/* Stats */}
            <View style={s.doneCard}>
              <View style={s.doneStat}>
                <Text style={[s.doneStatVal, { color: diffColor }]}>{difficulty}</Text>
                <Text style={s.doneStatLabel}>Final Difficulty</Text>
              </View>
              <View style={s.doneStatDivider} />
              <View style={s.doneStat}>
                <Text style={[s.doneStatVal, { color: budgetColor }]}>{Math.round(budget)}</Text>
                <Text style={s.doneStatLabel}>Budget Left</Text>
              </View>
              <View style={s.doneStatDivider} />
              <View style={s.doneStat}>
                <Text style={[s.doneStatVal, { color: colors.cyan }]}>🔥 {streak}</Text>
                <Text style={s.doneStatLabel}>Best Streak</Text>
              </View>
            </View>
  
            {/* Grade */}
            <View style={[s.gradeCard, {
              borderColor: accuracy >= 80
                ? colors.budgetHigh + '60'
                : accuracy >= 60
                ? colors.budgetMed + '60'
                : colors.budgetLow + '60',
              backgroundColor: accuracy >= 80
                ? colors.budgetHigh + '10'
                : accuracy >= 60
                ? colors.budgetMed + '10'
                : colors.budgetLow + '10',
            }]}>
              <Text style={[s.gradeEmoji]}>
                {accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'}
              </Text>
              <Text style={[s.gradeText, {
                color: accuracy >= 80
                  ? colors.budgetHigh
                  : accuracy >= 60
                  ? colors.budgetMed
                  : colors.budgetLow
              }]}>
                {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Job!' : 'Keep Going!'}
              </Text>
              <Text style={s.gradeSub}>
                {accuracy >= 80
                  ? 'Difficulty will increase next session'
                  : accuracy >= 60
                  ? 'Stay consistent, you are improving'
                  : 'Try easier topics to build confidence'}
              </Text>
            </View>
  
            <TouchableOpacity
              style={[s.doneBtn, { backgroundColor: colors.cyan }]}
              onPress={() => router.back()}
            >
              <Text style={s.doneBtnText}>BACK TO HOME</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={[s.doneBtn, { backgroundColor: colors.violet }]}
              onPress={() => router.push('/explore')}
            >
              <Text style={s.doneBtnText}>VIEW ANALYTICS</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={[s.doneBtn, {
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colors.border,
              }]}
              onPress={() => {
                setTotalAnswered(0);
                setCorrectCount(0);
                setStreak(0);
                setConsCorrect(0);
                setConsWrong(0);
                setSessionDone(false);
                setRecentAnswers([]);
                setTotalTime(0);
                setQuestionCount(0);
                setBudget(100);
                loadNextQuestion();
              }}
            >
              <Text style={[s.doneBtnText, { color: colors.textSecondary }]}>
                PLAY AGAIN
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }
  
    // ─────────────────────────────────────────────────────
    // MAIN LEARNING UI
    // ─────────────────────────────────────────────────────
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
  
          {/* ── Top bar ── */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Text style={s.backBtnText}>‹</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.topicName} numberOfLines={1}>
                {topic || 'Learning Session'}
              </Text>
              <Text style={s.progressLabel}>
                Question {totalAnswered + 1} of {TOTAL_QUESTIONS}
              </Text>
            </View>
            <View style={s.diffBadge}>
              <Text style={s.diffBadgeLabel}>LEVEL</Text>
              <Text style={[s.diffBadgeVal, { color: diffColor }]}>{difficulty}/10</Text>
            </View>
          </View>
  
          {/* ── Progress bar ── */}
          <View style={s.progressBar}>
            <View style={[s.progressFill, {
              width: `${(totalAnswered / TOTAL_QUESTIONS) * 100}%`
            }]} />
          </View>
  
          {/* ── Budget bar ── */}
          <BudgetBar budget={budget} />
  
          {/* ── CV bar ── */}
          <CVBar
            cvState={cvState}
            blinkRate={blinkRate}
            gaze={gaze}
            emotion={emotion}
          />
  
          {/* ── Stats chips ── */}
          <View style={s.chipsRow}>
            <View style={[s.chip, { borderColor: colors.budgetHigh + '50' }]}>
              <Text style={[s.chipVal, { color: colors.budgetHigh }]}>
                {totalAnswered > 0
                  ? Math.round((correctCount / totalAnswered) * 100)
                  : 0}%
              </Text>
              <Text style={s.chipLabel}>Accuracy</Text>
            </View>
  
            <View style={[s.chip, { borderColor: colors.cyan + '50' }]}>
              <Text style={[s.chipVal, { color: colors.cyan }]}>🔥 {streak}</Text>
              <Text style={s.chipLabel}>Streak</Text>
            </View>
  
            <View style={[s.chip, { borderColor: diffColor + '50' }]}>
              <Text style={[s.chipVal, { color: diffColor, fontSize: 11 }]}>
                {consCorrect > 0
                  ? `${consCorrect}/2 ✓`
                  : consWrong > 0
                  ? `${consWrong}/2 ✗`
                  : '— —'}
              </Text>
              <Text style={s.chipLabel}>To shift</Text>
            </View>
  
            <View style={[s.chip, { borderColor: CV_CONFIG[cvState].color + '50' }]}>
              <Text style={[s.chipVal, { color: CV_CONFIG[cvState].color, fontSize: 18 }]}>
                {CV_CONFIG[cvState].icon}
              </Text>
              <Text style={s.chipLabel}>{CV_CONFIG[cvState].label}</Text>
            </View>
          </View>
  
          {/* ── Difficulty tier banner ── */}
          <View style={[s.tierBanner, {
            borderColor:     diffColor + '40',
            backgroundColor: diffColor + '10',
          }]}>
            <Text style={[s.tierText, { color: diffColor }]}>
              {difficulty <= 3
                ? '🟢 EASY — 2 correct in a row → Medium'
                : difficulty <= 7
                ? '🟡 MEDIUM — 2 correct → Hard  |  2 wrong → Easy'
                : '🔴 HARD — 2 wrong in a row → Medium'}
            </Text>
          </View>
  
          {/* ── Question card ── */}
          {loading ? (
            <View style={s.loadingCard}>
              <ActivityIndicator color={colors.cyan} size="large" />
              <Text style={s.loadingTitle}>Gemini is generating your question...</Text>
              <Text style={s.loadingDetail}>
                Difficulty {difficulty}/10 · CV: {cvState} · Budget: {Math.round(budget)}
              </Text>
              <Text style={s.loadingHint}>
                Question adapts to your performance in real-time
              </Text>
            </View>
          ) : apiError ? (
            <View style={s.errorCard}>
              <Text style={s.errorIcon}>⚠️</Text>
              <Text style={s.errorText}>{apiError}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={loadNextQuestion}>
                <Text style={s.retryText}>RETRY</Text>
              </TouchableOpacity>
            </View>
          ) : question ? (
            <View style={s.questionCard}>
  
              {/* Difficulty dots */}
              <View style={s.diffRow}>
                <Text style={s.diffRowLabel}>DIFFICULTY</Text>
                <View style={s.dots}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <View key={i} style={[
                      s.dot,
                      {
                        backgroundColor: i < difficulty
                          ? (i < 3
                            ? colors.budgetHigh
                            : i < 7
                            ? colors.budgetMed
                            : colors.budgetLow)
                          : colors.border
                      }
                    ]} />
                  ))}
                </View>
                <Text style={[s.diffRowVal, { color: diffColor }]}>{difficulty}/10</Text>
              </View>
  
              {/* Question text */}
              <View style={s.questionBox}>
                <Text style={s.questionText}>{question.text}</Text>
              </View>
  
              {/* Options */}
              <View style={s.options}>
                {question.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect  = answered && idx === question.correctIndex;
                  const isWrong    = answered && isSelected && idx !== question.correctIndex;
  
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        s.option,
                        isSelected && !answered && s.optionSelected,
                        isCorrect  && s.optionCorrect,
                        isWrong    && s.optionWrong,
                      ]}
                      onPress={() => !answered && setSelected(idx)}
                      activeOpacity={0.7}
                      disabled={answered}
                    >
                      <View style={[
                        s.optionBubble,
                        isSelected && !answered && { backgroundColor: colors.cyan,      borderColor: colors.cyan },
                        isCorrect              && { backgroundColor: colors.budgetHigh, borderColor: colors.budgetHigh },
                        isWrong                && { backgroundColor: colors.budgetLow,  borderColor: colors.budgetLow },
                      ]}>
                        <Text style={[
                          s.optionBubbleText,
                          (isSelected || isCorrect || isWrong) && { color: colors.bg }
                        ]}>
                          {OPTION_LABELS[idx]}
                        </Text>
                      </View>
                      <Text style={[
                        s.optionText,
                        isCorrect && { color: colors.budgetHigh },
                        isWrong   && { color: colors.budgetLow },
                      ]}>
                        {opt}
                      </Text>
                      {isCorrect && <Text>✓</Text>}
                      {isWrong   && <Text>✗</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
  
              {/* Submit button */}
              {!answered ? (
                <TouchableOpacity
                  style={[s.submitBtn, selected === null && s.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={selected === null}
                  activeOpacity={0.8}
                >
                  <Text style={s.submitText}>SUBMIT ANSWER</Text>
                </TouchableOpacity>
              ) : (
                <View style={[
                  s.resultBanner,
                  {
                    backgroundColor: selected === question.correctIndex
                      ? colors.budgetHigh + '20'
                      : colors.budgetLow + '20',
                    borderColor: selected === question.correctIndex
                      ? colors.budgetHigh + '60'
                      : colors.budgetLow + '60',
                  }
                ]}>
                  {/* Result title */}
                  <Text style={[
                    s.resultTitle,
                    { color: selected === question.correctIndex ? colors.budgetHigh : colors.budgetLow }
                  ]}>
                    {selected === question.correctIndex ? '✓  CORRECT!' : '✗  INCORRECT'}
                  </Text>
  
                  {/* Difficulty shift hint */}
                  <Text style={s.resultShift}>
                    {selected === question.correctIndex
                      ? consCorrect >= 2
                        ? '⬆ Difficulty going UP!'
                        : `${2 - consCorrect} more correct → difficulty up`
                      : consWrong >= 2
                      ? '⬇ Difficulty going DOWN'
                      : `${2 - consWrong} more wrong → difficulty down`}
                  </Text>
  
                  {/* Explanation from Gemini */}
                  {question.explanation ? (
                    <View style={s.explanationBox}>
                      <Text style={s.explanationLabel}>EXPLANATION</Text>
                      <Text style={s.explanationText}>{question.explanation}</Text>
                    </View>
                  ) : null}
  
                  <Text style={s.resultNext}>⏳ Loading next question...</Text>
                </View>
              )}
            </View>
          ) : null}
  
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // ─────────────────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    safe:             { flex: 1, backgroundColor: colors.bg },
    content:          { padding: spacing.md, gap: spacing.md },
    topBar:           { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
    backBtn:          { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    backBtnText:      { fontSize: 26, color: colors.textPrimary, lineHeight: 30 },
    topicName:        { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    progressLabel:    { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    diffBadge:        { alignItems: 'center', backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 4 },
    diffBadgeLabel:   { fontSize: 8, color: colors.textMuted, letterSpacing: 1 },
    diffBadgeVal:     { fontSize: 20, fontWeight: '900' },
    progressBar:      { height: 4, backgroundColor: colors.border, borderRadius: 2 },
    progressFill:     { height: 4, backgroundColor: colors.cyan, borderRadius: 2 },
    chipsRow:         { flexDirection: 'row', gap: spacing.sm },
    chip:             { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, paddingVertical: spacing.sm, alignItems: 'center', gap: 3 },
    chipVal:          { fontSize: 13, fontWeight: '800' },
    chipLabel:        { fontSize: 7, color: colors.textMuted, letterSpacing: 0.3, textAlign: 'center' },
    tierBanner:       { borderRadius: radius.md, borderWidth: 1, padding: spacing.sm + 2 },
    tierText:         { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    loadingCard:      { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
    loadingTitle:     { fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
    loadingDetail:    { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
    loadingHint:      { fontSize: 10, color: colors.violet, textAlign: 'center', fontStyle: 'italic' },
    errorCard:        { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.budgetLow + '60', padding: spacing.xl, alignItems: 'center', gap: spacing.md },
    errorIcon:        { fontSize: 40 },
    errorText:        { fontSize: 13, color: colors.budgetLow, textAlign: 'center' },
    retryBtn:         { backgroundColor: colors.cyan, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.md },
    retryText:        { fontSize: 12, fontWeight: '800', color: colors.bg, letterSpacing: 2 },
    questionCard:     { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md },
    diffRow:          { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    diffRowLabel:     { fontSize: 9, letterSpacing: 1.5, color: colors.textMuted, fontWeight: '600' },
    dots:             { flexDirection: 'row', gap: 3, flex: 1 },
    dot:              { width: 10, height: 10, borderRadius: 2 },
    diffRowVal:       { fontSize: 11, fontWeight: '700' },
    questionBox:      { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.cyan },
    questionText:     { fontSize: 15, color: colors.textPrimary, lineHeight: 24, fontWeight: '500' },
    options:          { gap: spacing.sm },
    option:           { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
    optionSelected:   { borderColor: colors.cyan,      backgroundColor: colors.cyanGlow },
    optionCorrect:    { borderColor: colors.budgetHigh, backgroundColor: colors.budgetHigh + '15' },
    optionWrong:      { borderColor: colors.budgetLow,  backgroundColor: colors.budgetLow  + '15' },
    optionBubble:     { width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard },
    optionBubbleText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    optionText:       { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },
    submitBtn:        { backgroundColor: colors.cyan, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
    submitDisabled:   { backgroundColor: colors.border },
    submitText:       { fontSize: 13, fontWeight: '800', color: colors.bg, letterSpacing: 2 },
    resultBanner:     { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.sm, alignItems: 'center' },
    resultTitle:      { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
    resultShift:      { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
    explanationBox:   { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm, width: '100%' },
    explanationLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
    explanationText:  { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
    resultNext:       { fontSize: 10, color: colors.textMuted },
    doneScroll:       { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
    doneIcon:         { fontSize: 80 },
    doneTitle:        { fontSize: 28, fontWeight: '900', color: colors.textPrimary },
    doneSub:          { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    doneCard:         { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, width: '100%', justifyContent: 'space-around', alignItems: 'center' },
    doneStat:         { alignItems: 'center', gap: 4 },
    doneStatVal:      { fontSize: 28, fontWeight: '900' },
    doneStatLabel:    { fontSize: 10, color: colors.textMuted },
    doneStatDivider:  { width: 1, height: 40, backgroundColor: colors.border },
    gradeCard:        { width: '100%', borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, alignItems: 'center', gap: 6 },
    gradeEmoji:       { fontSize: 40 },
    gradeText:        { fontSize: 20, fontWeight: '800' },
    gradeSub:         { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
    doneBtn:          { width: '100%', borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
    doneBtnText:      { fontSize: 13, fontWeight: '800', color: colors.bg, letterSpacing: 2 },
  });
  
  
  
  
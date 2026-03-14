
import { View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '@/constants/theme';

const RECENT_TOPICS = [
  { id: 1, name: 'Alexander the Great', questions: 24, accuracy: 87, icon: '⚔️' },
  { id: 2, name: 'Photosynthesis',       questions: 18, accuracy: 72, icon: '🌿' },
  { id: 3, name: 'World War II',         questions: 31, accuracy: 91, icon: '🌍' },
  { id: 4, name: 'Quantum Physics',      questions: 12, accuracy: 58, icon: '⚛️' },
];

const SUGGESTED = ['Neural Networks', 'Roman Empire', 'Calculus', 'DNA', 'French Revolution'];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [budget] = useState(74);
  const router = useRouter();

  const goToLearn = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed) return;
    router.push({ pathname: '/learn', params: { topic: trimmed } });
  };

  const budgetColor = budget > 60 ? colors.budgetHigh : budget > 30 ? colors.budgetMed : colors.budgetLow;
  const cvState = 'FOCUSED';
  const cvColor = colors.focused;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.wordmark}><Text style={{ color: colors.cyan }}>NEUR</Text>LEARN</Text>
            <Text style={s.tagline}>Speed-adaptive learning</Text>
          </View>
          <View style={s.sessionBadge}>
            <View style={s.sessionDot} />
            <Text style={s.sessionText}>Session Active</Text>
          </View>
        </View>

        {/* ── SEARCH ── */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search any topic..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={s.goBtn}
              onPress={() => goToLearn(query)}
            >
              <Text style={s.goBtnText}>GO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TAGS ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.tags}>
            {SUGGESTED.map(t => (
              <TouchableOpacity
                key={t}
                style={s.tag}
                onPress={() => {
                  setQuery(t);
                  goToLearn(t);
                }}
              >
                <Text style={s.tagText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── BUDGET + CV ROW ── */}
        <View style={s.row}>
          {/* Budget card */}
          <View style={s.budgetCard}>
            <Text style={s.cardLabel}>COGNITIVE BUDGET</Text>
            <Text style={[s.budgetNumber, { color: budgetColor }]}>{budget}</Text>
            <Text style={s.budgetSub}>/ 100</Text>
            <View style={s.budgetBarTrack}>
              <View style={[s.budgetBarFill, { width: `${budget}%`, backgroundColor: budgetColor }]} />
            </View>
            <View style={[s.badge, { borderColor: budgetColor + '60', backgroundColor: budgetColor + '15' }]}>
              <View style={[s.dot, { backgroundColor: budgetColor }]} />
              <Text style={[s.badgeText, { color: budgetColor }]}>
                {budget > 60 ? 'FOCUSED' : budget > 30 ? 'FADING' : 'DEPLETED'}
              </Text>
            </View>
          </View>

          {/* CV card */}
          <View style={s.cvCard}>
            <Text style={s.cardLabel}>CV MONITOR</Text>
            <View style={s.webcam}>
              <Text style={s.webcamIcon}>👤</Text>
              {/* Corner brackets */}
              <View style={[s.corner, s.cTL]} />
              <View style={[s.corner, s.cTR]} />
              <View style={[s.corner, s.cBL]} />
              <View style={[s.corner, s.cBR]} />
            </View>
            <View style={[s.badge, { borderColor: cvColor + '60', backgroundColor: cvColor + '15' }]}>
              <View style={[s.dot, { backgroundColor: cvColor }]} />
              <Text style={[s.badgeText, { color: cvColor }]}>{cvState}</Text>
            </View>
            <View style={s.cvMetrics}>
              <Text style={s.cvMetric}>👁 17 blinks/min</Text>
              <Text style={s.cvMetric}>◉ On screen</Text>
              <Text style={s.cvMetric}>😐 Neutral</Text>
            </View>
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <Text style={s.sectionLabel}>QUICK START</Text>
        <View style={s.row}>
          <TouchableOpacity
            style={[s.quickBtn, { borderColor: colors.cyan + '60', backgroundColor: colors.cyanGlow }]}
            onPress={() => goToLearn(query || 'Challenge Mode')}
          >
            <Text style={s.quickIcon}>⚡</Text>
            <Text style={[s.quickText, { color: colors.cyan }]}>Challenge</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickBtn, { borderColor: colors.violet + '60', backgroundColor: colors.violetGlow }]}
            onPress={() => goToLearn(query || 'Review Mode')}
          >
            <Text style={s.quickIcon}>↩</Text>
            <Text style={[s.quickText, { color: colors.violet }]}>Review</Text>
          </TouchableOpacity>
        </View>

        {/* ── RECENT TOPICS ── */}
        <Text style={s.sectionLabel}>RECENT TOPICS</Text>
        {RECENT_TOPICS.map(topic => {
          const acc = topic.accuracy;
          const c = acc >= 80 ? colors.budgetHigh : acc >= 60 ? colors.budgetMed : colors.budgetLow;
          return (
            <TouchableOpacity
              key={topic.id}
              style={s.topicCard}
              onPress={() => goToLearn(topic.name)}
            >
              <Text style={s.topicIcon}>{topic.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.topicName}>{topic.name}</Text>
                <Text style={s.topicMeta}>{topic.questions} questions</Text>
              </View>
              <Text style={[s.topicAcc, { color: c }]}>{acc}%</Text>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* ── ANALYTICS TEASER ── */}
        <TouchableOpacity style={s.teaser} onPress={() => router.push('/explore')}>
          <LinearGradient colors={[colors.violet + '40', colors.cyan + '20']}
            style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
          <View style={{ flex: 1, padding: spacing.md }}>
            <Text style={s.teaserTitle}>View your Speed Fingerprint →</Text>
            <Text style={s.teaserSub}>You learn 44% faster in mornings · Calibration: 78%</Text>
          </View>
          <Text style={{ fontSize: 32, marginRight: spacing.md }}>📊</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bg },
  content:      { padding: spacing.md, gap: spacing.md },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: spacing.sm },
  wordmark:     { fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: 3 },
  tagline:      { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.budgetHigh + '15', borderWidth: 1, borderColor: colors.budgetHigh + '40', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  sessionDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.budgetHigh },
  sessionText:  { fontSize: 10, color: colors.budgetHigh, fontWeight: '600' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cyan + '40', paddingHorizontal: spacing.md, height: 52, gap: spacing.sm },
  searchIcon:   { fontSize: 20, color: colors.cyan },
  searchInput:  { flex: 1, fontSize: 14, color: colors.textPrimary },
  goBtn:        { backgroundColor: colors.cyan, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.md },
  goBtnText:    { fontSize: 11, fontWeight: '800', color: colors.bg, letterSpacing: 2 },
  tags:         { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  tag:          { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagText:      { fontSize: 12, color: colors.textSecondary },
  row:          { flexDirection: 'row', gap: spacing.sm },
  budgetCard:   { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center', gap: 4 },
  cardLabel:    { fontSize: 9, letterSpacing: 2, color: colors.textMuted, fontWeight: '600' },
  budgetNumber: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  budgetSub:    { fontSize: 12, color: colors.textMuted, marginTop: -6 },
  budgetBarTrack: { width: '100%', height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 4 },
  budgetBarFill:  { height: 4, borderRadius: 2 },
  badge:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, marginTop: 4 },
  dot:          { width: 6, height: 6, borderRadius: 3 },
  badgeText:    { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  cvCard:       { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 6 },
  webcam:       { height: 90, backgroundColor: colors.bg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  webcamIcon:   { fontSize: 28, opacity: 0.4 },
  corner:       { position: 'absolute', width: 12, height: 12, borderColor: colors.cyan, opacity: 0.7 },
  cTL: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  cTR: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  cBL: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  cBR: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },
  cvMetrics:    { gap: 3 },
  cvMetric:     { fontSize: 10, color: colors.textSecondary },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: colors.textMuted, fontWeight: '600' },
  quickBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  quickIcon:    { fontSize: 16 },
  quickText:    { fontSize: 12, fontWeight: '700' },
  topicCard:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm + 4 },
  topicIcon:    { fontSize: 22 },
  topicName:    { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  topicMeta:    { fontSize: 11, color: colors.textMuted },
  topicAcc:     { fontSize: 18, fontWeight: '800' },
  arrow:        { fontSize: 20, color: colors.textMuted },
  teaser:       { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.violet + '40', flexDirection: 'row', alignItems: 'center', minHeight: 70 },
  teaserTitle:  { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  teaserSub:    { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
});
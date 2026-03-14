
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  StatusBar, TouchableOpacity
} from 'react-native';
import { useState } from 'react';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, spacing, radius } from '@/constants/theme';

// ── RADAR CHART ──────────────────────────────────────────────────────────────
const RADAR_LABELS = ['Visual', 'Text', 'Morning', 'Evening', 'Hi Energy', 'Lo Energy'];
const RADAR_VALUES = [82, 45, 88, 31, 79, 28];
const SIZE = 220, CX = 110, CY = 110, R = 80, LEVELS = 5;

function polar(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function RadarChart() {
  const n = RADAR_VALUES.length;
  const dataPoints = RADAR_VALUES.map((v, i) => {
    const p = polar((360 / n) * i, (v / 100) * R);
    return `${p.x},${p.y}`;
  }).join(' ');

  const gridLevel = (level: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = polar((360 / n) * i, (level / LEVELS) * R);
      return `${p.x},${p.y}`;
    }).join(' ');

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>SPEED FINGERPRINT</Text>
      <Text style={s.cardSub}>When do you learn fastest?</Text>
      <View style={{ alignItems: 'center' }}>
        <Svg width={SIZE} height={SIZE}>
          {/* Grid */}
          {Array.from({ length: LEVELS }).map((_, i) => (
            <Polygon key={i} points={gridLevel(i + 1)}
              fill="none" stroke={colors.border} strokeWidth={1} />
          ))}
          {/* Axes */}
          {Array.from({ length: n }).map((_, i) => {
            const p = polar((360 / n) * i, R);
            return <Line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke={colors.border} strokeWidth={1} />;
          })}
          {/* Data */}
          <Polygon points={dataPoints}
            fill={colors.cyan + '30'} stroke={colors.cyan} strokeWidth={2} />
          {/* Dots */}
          {RADAR_VALUES.map((v, i) => {
            const p = polar((360 / n) * i, (v / 100) * R);
            return <Circle key={i} cx={p.x} cy={p.y} r={4}
              fill={colors.cyan} stroke={colors.bg} strokeWidth={2} />;
          })}
          {/* Labels */}
          {RADAR_LABELS.map((label, i) => {
            const p = polar((360 / n) * i, R + 20);
            return <SvgText key={i} x={p.x} y={p.y} textAnchor="middle"
              fontSize={10} fill={colors.textMuted} fontWeight="600">{label}</SvgText>;
          })}
        </Svg>
      </View>
      {/* Legend */}
      <View style={s.legendGrid}>
        {RADAR_LABELS.map((label, i) => (
          <View key={label} style={s.legendItem}>
            <Text style={s.legendLabel}>{label}</Text>
            <Text style={[s.legendVal, {
              color: RADAR_VALUES[i] >= 70 ? colors.budgetHigh :
                     RADAR_VALUES[i] >= 40 ? colors.cyan : colors.textMuted
            }]}>{RADAR_VALUES[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── CONFIDENCE MATRIX ────────────────────────────────────────────────────────
const QUADRANTS = [
  { key: 'FO', label: 'Fast &\nOverconfident', color: colors.tired },
  { key: 'FC', label: 'Fast &\nCalibrated',    color: colors.budgetHigh },
  { key: 'SO', label: 'Slow &\nOverconfident', color: colors.frustrated },
  { key: 'SC', label: 'Slow &\nCalibrated',    color: colors.cyan },
];

function ConfidenceMatrix({ active = 'SC' }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>CONFIDENCE MATRIX</Text>
      <View style={s.matrixGrid}>
        {QUADRANTS.map(q => {
          const isActive = q.key === active;
          return (
            <View key={q.key} style={[
              s.quadrant,
              { borderColor: q.color + (isActive ? 'FF' : '30'),
                backgroundColor: q.color + (isActive ? '25' : '08') }
            ]}>
              {isActive && <View style={[s.activeDot, { backgroundColor: q.color }]} />}
              <Text style={[s.quadLabel, { color: isActive ? q.color : colors.textMuted }]}>
                {q.label}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={s.matrixStats}>
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: colors.cyan }]}>18.5s</Text>
          <Text style={s.statLabel}>Avg Time</Text>
        </View>
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: colors.budgetHigh }]}>25%</Text>
          <Text style={s.statLabel}>Calib. Error</Text>
        </View>
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: colors.cyan }]}>SC</Text>
          <Text style={s.statLabel}>Quadrant</Text>
        </View>
      </View>
    </View>
  );
}

// ── COACH PANEL ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '☕', title: 'Take a 5-min break', gain: '+28%', desc: "You've been going 25 mins", urgency: 'high' },
  { icon: '🌅', title: 'Study at 9am tomorrow', gain: '+44%', desc: 'Your peak performance window', urgency: 'med' },
  { icon: '↩',  title: 'Switch to review mode', gain: '+17%', desc: 'Easier now → better recall', urgency: 'low' },
];

function CoachPanel() {
  const urgencyColor = (u: string) =>
    u === 'high' ? colors.frustrated : u === 'med' ? colors.tired : colors.cyan;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>SPEED COACH</Text>
      <Text style={s.cardSub}>Counterfactual suggestions</Text>
      {SUGGESTIONS.map((sg, i) => (
        <View key={i} style={[s.suggestion, { borderLeftColor: urgencyColor(sg.urgency) }]}>
          <Text style={s.suggestIcon}>{sg.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.suggestTitle}>{sg.title}</Text>
            <Text style={s.suggestDesc}>{sg.desc}</Text>
          </View>
          <View style={[s.gainBadge, {
            backgroundColor: urgencyColor(sg.urgency) + '20',
            borderColor: urgencyColor(sg.urgency) + '60'
          }]}>
            <Text style={[s.gainVal, { color: urgencyColor(sg.urgency) }]}>{sg.gain}</Text>
            <Text style={[s.gainLabel, { color: urgencyColor(sg.urgency) }]}>faster</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── INTEGRITY CARD ───────────────────────────────────────────────────────────
function IntegrityCard() {
  const score = 94;
  const color = score >= 80 ? colors.budgetHigh : colors.budgetLow;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.cardTitle}>ACADEMIC INTEGRITY</Text>
        <Text style={[s.integrityScore, { color }]}>{score}/100</Text>
      </View>
      <View style={s.integrityBar}>
        <View style={[s.integrityFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      {[
        { label: 'Tab Switches',      value: '2',         ok: true },
        { label: 'Impossible Speeds', value: '0',         ok: true },
        { label: 'Copy-Paste Events', value: '0',         ok: true },
        { label: 'Random Guessing',   value: 'No pattern', ok: true },
      ].map((f, i) => (
        <View key={i} style={s.flagRow}>
          <View style={[s.flagDot, { backgroundColor: f.ok ? colors.budgetHigh : colors.budgetLow }]} />
          <Text style={s.flagLabel}>{f.label}</Text>
          <Text style={[s.flagVal, { color: f.ok ? colors.budgetHigh : colors.budgetLow }]}>{f.value}</Text>
        </View>
      ))}
      <View style={s.integrityNote}>
        <Text style={s.integrityNoteText}>✓ Learning patterns appear authentic</Text>
      </View>
    </View>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Sessions', 'Integrity'];
const SESSIONS = [
  { topic: 'Alexander the Great', date: 'Today, 9am',     accuracy: 87, questions: 24, state: 'FOCUSED' },
  { topic: 'Photosynthesis',      date: 'Yesterday, 8pm', accuracy: 72, questions: 18, state: 'TIRED'   },
  { topic: 'World War II',        date: 'Mon, 7am',       accuracy: 91, questions: 31, state: 'FOCUSED' },
];

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Analytics</Text>
          <Text style={s.subtitle}>142 questions · 7 sessions</Text>
        </View>

        {/* Summary row */}
        <View style={s.summaryRow}>
          {[
            { label: 'Questions', value: '142',  icon: '📝', color: colors.textPrimary },
            { label: 'Accuracy',  value: '79%',  icon: '🎯', color: colors.budgetHigh },
            { label: 'Peak Time', value: '9am',  icon: '⚡', color: colors.cyan },
            { label: 'Streak',    value: '🔥 5', icon: '',   color: colors.textPrimary },
          ].map(item => (
            <View key={item.label} style={s.summaryCard}>
              <Text style={s.summaryIcon}>{item.icon}</Text>
              <Text style={[s.summaryVal, { color: item.color }]}>{item.value}</Text>
              <Text style={s.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Overview' && (
          <>
            <RadarChart />
            <ConfidenceMatrix active="SC" />
            <CoachPanel />
          </>
        )}

        {activeTab === 'Sessions' && SESSIONS.map((sess, i) => {
          const stateColor = sess.state === 'FOCUSED' ? colors.focused : colors.tired;
          const accColor = sess.accuracy >= 80 ? colors.budgetHigh : colors.budgetMed;
          return (
            <View key={i} style={s.sessionCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.sessionTopic}>{sess.topic}</Text>
                <Text style={s.sessionDate}>{sess.date}</Text>
                <View style={[s.stateBadge, { borderColor: stateColor + '60', backgroundColor: stateColor + '15' }]}>
                  <Text style={[s.stateText, { color: stateColor }]}>{sess.state}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={[s.sessionAcc, { color: accColor }]}>{sess.accuracy}%</Text>
                <Text style={s.sessionQ}>{sess.questions} questions</Text>
              </View>
            </View>
          );
        })}

        {activeTab === 'Integrity' && <IntegrityCard />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.bg },
  content:       { padding: spacing.md, gap: spacing.md },
  header:        { paddingTop: spacing.sm, gap: 4 },
  title:         { fontSize: 24, fontWeight: '900', color: colors.textPrimary },
  subtitle:      { fontSize: 12, color: colors.textMuted },
  summaryRow:    { flexDirection: 'row', gap: spacing.sm },
  summaryCard:   { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, alignItems: 'center', gap: 2 },
  summaryIcon:   { fontSize: 16 },
  summaryVal:    { fontSize: 15, fontWeight: '800' },
  summaryLabel:  { fontSize: 8, color: colors.textMuted, letterSpacing: 0.5, textAlign: 'center' },
  tabs:          { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 4, gap: 4 },
  tab:           { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive:     { backgroundColor: colors.cyan },
  tabText:       { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.bg, fontWeight: '800' },
  card:          { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  cardTitle:     { fontSize: 11, letterSpacing: 2, color: colors.textMuted, fontWeight: '600' },
  cardSub:       { fontSize: 12, color: colors.textSecondary },
  legendGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  legendItem:    { width: '30%', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bg, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  legendLabel:   { fontSize: 9, color: colors.textMuted },
  legendVal:     { fontSize: 12, fontWeight: '700' },
  matrixGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quadrant:      { width: '47%', borderRadius: radius.sm, borderWidth: 1, padding: spacing.sm, gap: 2, position: 'relative', minHeight: 60 },
  activeDot:     { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 999 },
  quadLabel:     { fontSize: 11, fontWeight: '700', lineHeight: 16 },
  matrixStats:   { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm, marginTop: 4 },
  statItem:      { alignItems: 'center', gap: 2 },
  statVal:       { fontSize: 18, fontWeight: '800' },
  statLabel:     { fontSize: 9, color: colors.textMuted },
  suggestion:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, padding: spacing.sm },
  suggestIcon:   { fontSize: 20 },
  suggestTitle:  { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  suggestDesc:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  gainBadge:     { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, minWidth: 48 },
  gainVal:       { fontSize: 15, fontWeight: '800' },
  gainLabel:     { fontSize: 8, fontWeight: '600' },
  integrityScore: { fontSize: 28, fontWeight: '900' },
  integrityBar:  { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  integrityFill: { height: 6, borderRadius: 3 },
  flagRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  flagDot:       { width: 8, height: 8, borderRadius: 4 },
  flagLabel:     { flex: 1, fontSize: 13, color: colors.textSecondary },
  flagVal:       { fontSize: 13, fontWeight: '700' },
  integrityNote: { backgroundColor: colors.budgetHigh + '15', borderRadius: radius.md, borderWidth: 1, borderColor: colors.budgetHigh + '40', padding: spacing.sm },
  integrityNoteText: { fontSize: 12, color: colors.budgetHigh },
  sessionCard:   { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  sessionTopic:  { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sessionDate:   { fontSize: 11, color: colors.textMuted },
  stateBadge:    { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  stateText:     { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  sessionAcc:    { fontSize: 22, fontWeight: '800' },
  sessionQ:      { fontSize: 11, color: colors.textMuted },
});
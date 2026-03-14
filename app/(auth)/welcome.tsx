import { colors, radius, spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated, Dimensions,
    SafeAreaView, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const logoAnim    = useRef(new Animated.Value(0)).current;
  const titleAnim   = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const btnAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation on mount
    Animated.stagger(200, [
      Animated.spring(logoAnim,     { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.spring(titleAnim,    { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.spring(subtitleAnim, { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.spring(cardAnim,     { toValue: 1, useNativeDriver: true, tension: 40 }),
      Animated.spring(btnAnim,      { toValue: 1, useNativeDriver: true, tension: 40 }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Background gradient */}
      <LinearGradient
        colors={['#050810', '#0a0e1a', '#050810']}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow effects */}
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      <View style={s.container}>

        {/* ── Logo ── */}
        <Animated.View style={[s.logoWrap, {
          opacity: logoAnim,
          transform: [{
            translateY: logoAnim.interpolate({
              inputRange: [0, 1], outputRange: [-30, 0]
            })
          }]
        }]}>
          <View style={s.logoOuter}>
            <View style={s.logoInner}>
              <Text style={s.logoIcon}>⚡</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Title ── */}
        <Animated.View style={[s.titleWrap, {
          opacity: titleAnim,
          transform: [{
            translateY: titleAnim.interpolate({
              inputRange: [0, 1], outputRange: [20, 0]
            })
          }]
        }]}>
          <Text style={s.wordmark}>
            <Text style={{ color: colors.cyan }}>NEUR</Text>LEARN
          </Text>
          <Text style={s.tagline}>Speed-Adaptive Learning Platform</Text>
        </Animated.View>

        {/* ── Feature cards ── */}
        <Animated.View style={[s.cards, {
          opacity: cardAnim,
          transform: [{
            translateY: cardAnim.interpolate({
              inputRange: [0, 1], outputRange: [30, 0]
            })
          }]
        }]}>
          {[
            { icon: '👁', title: 'CV Detection',    desc: 'Tracks your focus in real-time' },
            { icon: '🧠', title: 'Adaptive AI',     desc: 'Questions adapt to your state' },
            { icon: '📈', title: 'Smart Progress',  desc: 'Learn faster, retain more' },
          ].map((f, i) => (
            <View key={i} style={s.featureCard}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── Buttons ── */}
        <Animated.View style={[s.btnWrap, {
          opacity: btnAnim,
          transform: [{
            translateY: btnAnim.interpolate({
              inputRange: [0, 1], outputRange: [40, 0]
            })
          }]
        }]}>
          {/* Get Started */}
          <TouchableOpacity
            style={s.getStartedBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.cyan, '#00B8CC']}
              style={s.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={s.getStartedText}>GET STARTED  →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Already have account */}
          <TouchableOpacity
            style={s.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={s.loginBtnText}>
              Already have an account?{' '}
              <Text style={{ color: colors.cyan, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  container:  { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center', gap: spacing.xl },

  // Glow
  glowTop: {
    position: 'absolute',
    top: -100,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.cyan,
    opacity: 0.04,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.violet,
    opacity: 0.06,
  },

  // Logo
  logoWrap:  { alignItems: 'center' },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.cyan + '10',
    borderWidth: 1,
    borderColor: colors.cyan + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.cyan + '20',
    borderWidth: 2,
    borderColor: colors.cyan + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon:  { fontSize: 36 },

  // Title
  titleWrap: { alignItems: 'center', gap: spacing.sm },
  wordmark:  { fontSize: 36, fontWeight: '900', color: colors.textPrimary, letterSpacing: 4 },
  tagline:   { fontSize: 13, color: colors.textMuted, letterSpacing: 1, textAlign: 'center' },

  // Feature cards
  cards: { gap: spacing.sm },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  featureIcon:  { fontSize: 24, width: 36, textAlign: 'center' },
  featureTitle: { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  featureDesc:  { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Buttons
  btnWrap: { gap: spacing.md },
  getStartedBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.bg,
    letterSpacing: 3,
  },
  loginBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
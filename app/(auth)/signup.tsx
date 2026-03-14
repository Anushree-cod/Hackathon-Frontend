import { signUp } from '@/utils/firebase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '',       color: '#1e2a40', width: '0%'   };
    if (password.length < 4)   return { label: 'Weak',   color: '#E24B4A', width: '25%'  };
    if (password.length < 8)   return { label: 'Fair',   color: '#EF9F27', width: '55%'  };
    return                              { label: 'Strong', color: '#1D9E75', width: '100%' };
  };

  const strength = getPasswordStrength();

const handleSignup = async () => {
  if (!name || !email || !password || !confirm) {
    Alert.alert('Missing Fields', 'Please fill in all fields.');
    return;
  }
  if (password !== confirm) {
    Alert.alert('Password Mismatch', 'Passwords do not match.');
    return;
  }
  if (password.length < 6) {
    Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    return;
  }

  setLoading(true);
  try {
    await signUp(name, email, password); // ← real Firebase now
    Alert.alert('Account Created! 🎉', 'You can now sign in.', [
      { text: 'Sign In', onPress: () => router.replace('/(auth)/login') },
    ]);
  } catch (error: any) {
    // Firebase error messages
    if (error.code === 'auth/email-already-in-use') {
      Alert.alert('Email Taken', 'This email is already registered.');
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert('Invalid Email', 'Please enter a valid email.');
    } else {
      Alert.alert('Signup Failed', error.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your adaptive learning journey</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#555577"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#555577"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Min. 6 characters"
              placeholderTextColor="#555577"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Strength bar */}
          <View style={styles.strengthTrack}>
            <View
              style={[
                styles.strengthFill,
                { width: strength.width as any, backgroundColor: strength.color },
              ]}
            />
          </View>
          {strength.label !== '' && (
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label} password
            </Text>
          )}

          {/* Confirm Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              confirm.length > 0 && {
                borderColor: confirm === password ? '#1D9E75' : '#E24B4A',
              },
            ]}
            placeholder="Re-enter your password"
            placeholderTextColor="#555577"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          {/* Match hint */}
          {confirm.length > 0 && (
            <Text
              style={[
                styles.matchHint,
                { color: confirm === password ? '#1D9E75' : '#E24B4A' },
              ]}
            >
              {confirm === password ? '✓ Passwords match' : '✗ Passwords do not match'}
            </Text>
          )}

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled, { marginTop: 22 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#0a0e1a" />
              : <Text style={styles.primaryBtnText}>Create Account</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Already have account */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>
              Already have an account?{' '}
              <Text style={styles.signInHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  backBtn: { marginBottom: 24 },
  backText: { color: '#00e5ff', fontSize: 15, fontWeight: '500' },

  header: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#00e5ff15', borderWidth: 2,
    borderColor: '#00e5ff', justifyContent: 'center',
    alignItems: 'center', marginBottom: 14,
  },
  logoLetter: { fontSize: 28, fontWeight: '700', color: '#00e5ff' },
  title: { fontSize: 26, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#666688', marginTop: 6 },

  card: {
    backgroundColor: '#111827', borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#1e2a40',
  },

  label: { fontSize: 13, color: '#aaaacc', fontWeight: '500', marginBottom: 7 },
  input: {
    backgroundColor: '#0d1124', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e2a40',
    color: '#ffffff', paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, marginBottom: 16,
  },

  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1124', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e2a40', marginBottom: 10,
  },
  passwordInput: {
    flex: 1, color: '#ffffff',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeIcon: { fontSize: 16 },

  strengthTrack: {
    height: 4, backgroundColor: '#1e2a40',
    borderRadius: 2, overflow: 'hidden', marginBottom: 5,
  },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, textAlign: 'right', marginBottom: 4 },

  matchHint: { fontSize: 12, marginTop: -10, marginBottom: 8 },

  primaryBtn: {
    backgroundColor: '#00e5ff', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: '#0a0e1a', fontSize: 16, fontWeight: '700' },

  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e2a40' },
  dividerText: { color: '#444466', paddingHorizontal: 12, fontSize: 13 },

  secondaryBtn: {
    borderWidth: 1, borderColor: '#00e5ff30',
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
  },
  secondaryBtnText: { color: '#666688', fontSize: 14 },
  signInHighlight: { color: '#00e5ff', fontWeight: '600' },
});

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // switches to success view

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // ── Firebase Auth (uncomment when ready) ──────────────────────
      // import { sendPasswordResetEmail } from 'firebase/auth';
      // import { auth } from '../../firebaseConfig';
      // await sendPasswordResetEmail(auth, email);
      // ──────────────────────────────────────────────────────────────

      // Temporary simulation — remove when Firebase is added
      await new Promise(res => setTimeout(res, 1000));

      setEmailSent(true); // show success screen
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* ── STEP 1: Enter Email ── */}
        {!emailSent ? (
          <>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🔑</Text>
            </View>

            <Text style={styles.title}>Forgot your password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your registered email and we'll send you a reset link.
            </Text>

            <View style={styles.card}>
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
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#0a0e1a" />
                  : <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ── STEP 2: Success ── */
          <>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <Text style={styles.iconEmoji}>✅</Text>
            </View>

            <Text style={styles.title}>Check your inbox!</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to:{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.card}>
              <Text style={styles.tipText}>
                Didn't get it? Check your spam folder or tap below to resend.
              </Text>

              {/* Resend */}
              <TouchableOpacity
                style={[styles.primaryBtn, { marginBottom: 12 }]}
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Resend Email</Text>
              </TouchableOpacity>

              {/* Back to login */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // Back
  backBtn: {
    marginBottom: 32,
  },
  backText: {
    color: '#00e5ff',
    fontSize: 15,
    fontWeight: '500',
  },

  // Icon
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00e5ff15',
    borderWidth: 2,
    borderColor: '#00e5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    backgroundColor: '#1D9E7515',
    borderColor: '#1D9E75',
  },
  iconEmoji: {
    fontSize: 32,
  },

  // Text
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666688',
    lineHeight: 23,
    marginBottom: 32,
  },
  emailHighlight: {
    color: '#00e5ff',
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e2a40',
  },
  label: {
    fontSize: 13,
    color: '#aaaacc',
    fontWeight: '500',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#0d1124',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2a40',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  tipText: {
    color: '#666688',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: '#00e5ff',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    color: '#0a0e1a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#00e5ff30',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#00e5ff',
    fontSize: 15,
    fontWeight: '600',
  },
});
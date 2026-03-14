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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // ✅ TODO: Swap this with Firebase when ready:
      // import { signInWithEmailAndPassword } from 'firebase/auth';
      // import { auth } from '../../firebaseConfig';
      // await signInWithEmailAndPassword(auth, email, password);

      await new Promise(res => setTimeout(res, 1000)); // remove when Firebase added
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
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
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.brandName}>NeurLearn</Text>
          <Text style={styles.tagline}>Adaptive learning powered by you</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue learning</Text>

          {/* Email Field */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#5a5a7a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Enter your password"
              placeholderTextColor="#5a5a7a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forget-password')}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#0a0e1a" />
              : <Text style={styles.primaryBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Go to Sign Up */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.outlineBtnText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  // Brand
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#00e5ff15',
    borderWidth: 2,
    borderColor: '#00e5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 30,
    fontWeight: '700',
    color: '#00e5ff',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#8888aa',
    marginTop: 6,
  },

  // Card
  card: {
    backgroundColor: '#131729',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e2240',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888aa',
    marginBottom: 24,
  },

  // Form
  label: {
    fontSize: 13,
    color: '#aaaacc',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0d1124',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2240',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  eyeIcon: {
    fontSize: 16,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    color: '#00e5ff',
    fontSize: 13,
    fontWeight: '500',
  },

  // Buttons
  primaryBtn: {
    backgroundColor: '#00e5ff',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#0a0e1a',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e2240',
  },
  dividerLabel: {
    color: '#5a5a7a',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#00e5ff44',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#00e5ff',
    fontSize: 15,
    fontWeight: '600',
  },
});
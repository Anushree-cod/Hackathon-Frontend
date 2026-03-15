import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Labels ──────────────────────────────────────────────────────────────────
const LABELS = ['Neutral', 'Tired / Stressed'];

const RESULT_COLORS: Record<string, string> = {
  'Neutral': '#1D9E75',
  'Tired / Stressed': '#E24B4A',
};

const RESULT_EMOJI: Record<string, string> = {
  'Neutral': '😐',
  'Tired / Stressed': '😓',
};

// ─── Model assets ─────────────────────────────────────────────────────────────
const modelJson    = require('@/assets/model.json');
const modelWeights = require('@/assets/weights.bin');

// ─── Component ───────────────────────────────────────────────────────────────
export default function DetectScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading TensorFlow...');
  const cameraRef = useRef<CameraView>(null);

  // ── Load TF and model on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function loadModel() {
      try {
        // 1. Init TensorFlow.js
        await tf.ready();
        setLoadingMsg('Loading model...');

        // 2. Load model using bundleResourceIO (reads from assets)
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights)
        );

        setModel(loadedModel);
        setTfReady(true);
        setLoadingMsg('');
      } catch (err) {
        console.error('Model load error:', err);
        setLoadingMsg('Model load failed');
      }
    }
    loadModel();
  }, []);

  // ── Permission not determined ──────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // ── Permission denied ──────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSubtitle}>
          This app uses your camera to detect stress and fatigue levels.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Capture and detect ─────────────────────────────────────────────────────
  async function handleDetect() {
    if (!cameraRef.current || !model || isProcessing) return;

    setIsProcessing(true);
    setResult(null);
    setConfidence(null);

    try {
      // 1. Capture photo as base64
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        skipProcessing: true,
      });

      if (!photo?.base64) throw new Error('Photo capture failed');

      // 2. Convert base64 → Uint8Array → tensor
      const imgBuffer = tf.util.encodeString(photo.base64, 'base64').buffer;
      const imgArray = new Uint8Array(imgBuffer);
      let imgTensor = decodeJpeg(imgArray);

      // 3. Resize to 224x224 (Teachable Machine input size)
      imgTensor = tf.image.resizeBilinear(imgTensor, [224, 224]);

      // 4. Normalize 0-255 → 0-1 and add batch dimension [1, 224, 224, 3]
      const normalized = imgTensor.div(255.0).expandDims(0);

      // 5. Run prediction
      // 5. Run prediction
    const prediction = model.predict(normalized) as tf.Tensor;

// 6. Get highest confidence class
   const probabilities: number[] = Array.from(await prediction.data());
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
const maxConfidence = Math.round((probabilities[maxIndex] ?? 0) * 100);  
      setResult(LABELS[maxIndex]);
      setConfidence(maxConfidence);

      // 7. Cleanup tensors
      tf.dispose([imgTensor, normalized, prediction]);

    } catch (err) {
      console.error('Detection error:', err);
      setResult('Error — try again');
    } finally {
      setIsProcessing(false);
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />

      {/* Model loading overlay */}
      {!tfReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>{loadingMsg}</Text>
        </View>
      )}

      {/* Result card */}
      {result && (
        <View style={[
          styles.resultCard,
          { borderColor: RESULT_COLORS[result] ?? '#888' }
        ]}>
          <Text style={styles.resultEmoji}>
            {RESULT_EMOJI[result] ?? '🔍'}
          </Text>
          <Text style={[
            styles.resultText,
            { color: RESULT_COLORS[result] ?? '#fff' }
          ]}>
            {result}
          </Text>
          {confidence !== null && (
            <Text style={styles.confidenceText}>
              {confidence}% confidence
            </Text>
          )}
        </View>
      )}

      {/* Detect button */}
      <TouchableOpacity
        style={[
          styles.detectBtn,
          (!tfReady || isProcessing) && styles.detectBtnDisabled,
        ]}
        onPress={handleDetect}
        disabled={!tfReady || isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.detectBtnText}>
            {!tfReady ? loadingMsg : '🔍  Detect'}
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(10,14,26,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 15,
  },
  resultCard: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(10,14,26,0.88)',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
    minWidth: 220,
  },
  resultEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  confidenceText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 6,
  },
  detectBtn: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 50,
    minWidth: 180,
    alignItems: 'center',
  },
  detectBtnDisabled: {
    opacity: 0.45,
  },
  detectBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
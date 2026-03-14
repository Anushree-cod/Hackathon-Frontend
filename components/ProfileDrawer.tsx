import { useRouter } from "expo-router";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Paste your Firebase config values here ──────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCgxU8AnzyVzTgHRPHozTPO_lgHdYZUb3Y",
  authDomain: "nuerlearn.firebaseapp.com",
  projectId: "nuerlearn",
  storageBucket: "nuerlearn.firebasestorage.app",
  messagingSenderId: "651183106481",
  appId: "1:651183106481:web:1a342fb791b9cd11f6b590"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
}

// ─── Firebase user hook ───────────────────────────────────────────────────────
function useUser(): UserProfile {
  const [user, setUser] = useState<UserProfile>({ name: "", email: "" });
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          name: u.displayName || u.email?.split("@")[0] || "User",
          email: u.email || "",
        });
      } else {
        setUser({ name: "", email: "" });
      }
    });
    return unsub;
  }, []);
  return user;
}

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const MENU_ITEMS = [
  { icon: "📚", label: "My Courses" },
  { icon: "🔖", label: "Saved Content" },
  { icon: "📝", label: "Study Material" },
  { icon: "🎥", label: "Free Classes" },
  { icon: "⚙️", label: "Settings" },
  { icon: "🚪", label: "Logout", danger: true },
];

// ─── Shared ref so HamburgerButton can open the drawer ───────────────────────
type DrawerRef = { open: () => void };
export const drawerRef: React.MutableRefObject<DrawerRef | null> = { current: null };

// ─── Hamburger Button ─────────────────────────────────────────────────────────
export function HamburgerButton() {
  return (
    <TouchableOpacity
      onPress={() => drawerRef.current?.open()}
      style={styles.hamburger}
      accessibilityLabel="Open menu"
    >
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </TouchableOpacity>
  );
}

// ─── Drawer Modal ─────────────────────────────────────────────────────────────
export default function ProfileDrawer() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    drawerRef.current = { open: () => setOpen(true) };
    return () => { drawerRef.current = null; };
  }, []);

  async function handleMenuClick(label: string) {
    if (label === "Logout") {
      try {
        await signOut(auth);
        setOpen(false);
        router.replace("/(auth)/login");
      } catch (e) {
        console.error("Logout failed:", e);
      }
    }
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => setOpen(false)}
    >
      {/* Backdrop — tap to close */}
      <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

      {/* Drawer slides in from LEFT */}
      <View style={styles.drawer}>

        {/* Close Button */}
        <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user.name || "Loading..."}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user.email || ""}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Menu Items */}
        {MENU_ITEMS.map(({ icon, label, danger }) => (
          <TouchableOpacity
            key={label}
            onPress={() => handleMenuClick(label)}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CV Detection App · v1.0</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hamburger: { padding: 8, marginLeft: 8, justifyContent: "center" },
  bar: { width: 24, height: 2.5, borderRadius: 2, backgroundColor: "#ffffff", marginVertical: 2 },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  drawer: {
    position: "absolute",
    top: 0,
    left: 0,        // ← LEFT side
    bottom: 0,
    width: "80%",
    backgroundColor: "#ffffff",
    borderTopRightRadius: 20,       // ← rounded on RIGHT side now
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },  // ← shadow on right
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: { fontSize: 16, color: "#444" },

  profileHeader: {
    backgroundColor: "#667eea",
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopRightRadius: 20,      // ← rounded on right now
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileInfo: { flex: 1 },
  profileName: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  profileEmail: { color: "rgba(255,255,255,0.8)", fontSize: 13 },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 8 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 14,
  },
  menuIcon: { fontSize: 20, width: 28, textAlign: "center" },
  menuLabel: { fontSize: 15, color: "#2d3748", fontWeight: "500" },
  menuLabelDanger: { color: "#e53e3e" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
  },
  footerText: { color: "#aaa", fontSize: 12 },
});

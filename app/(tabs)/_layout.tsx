import ProfileDrawer, { HamburgerButton } from '@/components/ProfileDrawer';
import { colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <>
      {/* Drawer lives here, outside Tabs, so Modal works properly */}
      <ProfileDrawer />

      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.bgCard },
          headerTintColor: colors.cyan,
          headerLeft: () => <HamburgerButton />,   // ← just the button, no modal
          tabBarStyle: {
            backgroundColor: colors.bgCard,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.cyan,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabIcon icon="⌂" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <TabIcon icon="◈" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{icon}</Text>;
}

import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../../constants/Colors";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            height: 85,
          },
          headerTintColor: theme.text,
          drawerStyle: {
            backgroundColor: theme.background,
          },
          drawerLabelStyle: {
            color: theme.text,
          },
        }}
      >
        <Drawer.Screen
          name="HomeScreen"
          options={{
            drawerLabel: "Home",
            title: "Home",
          }}
        />
        <Drawer.Screen
          name="SwapRequests"
          options={{
            drawerLabel: "Swap Requests",
            title: "Swap Requests",
          }}
        />
        <Drawer.Screen
          name="AddItem"
          options={{
            drawerLabel: "Add Item",
            title: "Add Item",
          }}
        />
        <Drawer.Screen
          name="MyItems"
          options={{
            drawerLabel: "My Items",
            title: "My Items",
          }}
        />
        <Drawer.Screen
          name="Chat"
          options={{
            drawerLabel: "Chat",
            title: "Chat",
          }}
        />
        <Drawer.Screen
          name="Profile"
          options={{
            drawerLabel: "Profile",
            title: "Profile",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

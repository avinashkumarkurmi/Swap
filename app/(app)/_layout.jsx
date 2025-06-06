import { router, useSegments } from 'expo-router';
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../../constants/Colors";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const segments = useSegments(); // ['explore', 'details'] when you're on /explore/details

  // If in /explore/details or /explore/map, hide the drawer header
  const nestedScreensToHideHeader = ['SwapDetail', 'MapView', 'AnotherDetail'];
const shouldHideHeader = nestedScreensToHideHeader.includes(segments[2]);

  // const shouldHideHeader = segments[2] === 'SwapDetail' && segments.length > 1;

 
  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: !shouldHideHeader,
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
            drawerLabel: 'Home',
            // Override behavior here
            listener: {
              drawerItemPress: (e) => {
                e.preventDefault(); // stop default
                router.replace("/HomeScreen/Home"); // force go to home
              },
            },
          }}
          // options={{
          //   drawerLabel: "Home",
          //   title: "Home",
          // }}
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
          name="Convscreen"
          options={{
            drawerLabel: "Conversations",
            title: "Conversations",
          }}
        />
        <Drawer.Screen
          name="Profile"
          options={{
            drawerLabel: "Profile",
            title: "Profile",
          }}
        />
        {/* <Drawer.Screen
        name="Chat"
        options={{
          drawerItemStyle: { display: 'none' },  // hides this item from drawer menu
          title: 'Chat',
          // You can also disable swipe gesture to open it from drawer if needed
          swipeEnabled: false,
        }}
      /> */}
      </Drawer>
    </GestureHandlerRootView>
  );
}

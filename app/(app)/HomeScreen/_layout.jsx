// app/explore/_layout.jsx
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../../constants/Colors";

export default function HomeScreenLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
          // height: 85,
        },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen
        name="SwapDetail"
        // options={{
         
        //   //       header: () => (
        //   //         <View
        //   //   style={{
        //   //     height: 50,
        //   //     backgroundColor: theme.background,
        //   //     flexDirection: 'row',
        //   //     alignItems: 'center',
        //   //     paddingHorizontal: 10,
        //   //     // paddingTop: 40,
        //   //   }}
        //   // >
        //   //   <TouchableOpacity onPress={() => router.back()}>
        //   //     <Ionicons name="arrow-back" size={22} color={theme.text} />
        //   //   </TouchableOpacity>
        //   //           <Text style={{ fontSize: 20, color: theme.text, marginLeft: 10 , fontWeight: '400' }}>Swap detail</Text>
        //   //         </View>
        //   //       ),
        // }}

        // options={({ route }) => {
        //   const from = route.params?.from || "";
        //   console.log(from);
          

        //   return {
        //     headerLeft: () => (
        //       <TouchableOpacity
        //         onPress={() => {
        //           if (from === "MyItem") {
        //             router.replace("/MyItems");
        //           } else {
        //             router.back();
        //           }
        //         }}
        //       >
        //         <Text style={{ marginLeft: 10 }}>← Back</Text>
        //       </TouchableOpacity>
        //     ),
        //   };
        // }}

      />

      {/* <Stack.Screen name="map" options={{ title: 'Map View' }} /> */}
    </Stack>
  );
}

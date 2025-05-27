import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
// import { Provider } from 'react-redux';
// import { store } from '../../store/index';


export default function AppLayout() {

  
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // require("../")
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* <Provider store={store}> */}
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: colorScheme === "dark" ? "#151718" : "#fff" },
          ]}
        >
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="SignUp"  />
            <Stack.Screen name="Login" />
            {/* <Stack.Screen name="+not-found" /> */}
          </Stack>
        </SafeAreaView>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "#151718" : "#fff"}
        />
    {/* </Provider> */}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

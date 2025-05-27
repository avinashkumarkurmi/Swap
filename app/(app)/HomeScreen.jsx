// app/index.jsx
import { router } from "expo-router";
import { Button, Text, View } from "react-native";
import { removeUID } from "../../util/aysnStore";

export default function HomeScreen() {
    
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Main App Screen</Text>
      <Button title="Click" onPress={()=>console.log(router.back())} />
        <Button title="logout" onPress={()=>{if(removeUID()){router.replace('/(auth)/Login');}}} />
    </View>
  );
}

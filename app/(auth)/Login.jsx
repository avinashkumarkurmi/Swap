import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Alert from "../../components/Alert";
import { Colors } from "../../constants/Colors";
import { auth } from "../../firebase";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../store/features/auth/authSlice";
import { saveUID } from "../../util/aysnStore";

export default function Login() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch();
  // const { user, loading, error } = useSelector(state => state.auth);
  // console.log(user, loading, error);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isAlert, setIsAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail(email) || !email || !password) {
      if (!email) {
        setAlertMsg({ type: "error", msg: "Pls enter email id" });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2600);
      } else if (!isValidEmail(email)) {
        setAlertMsg({ type: "error", msg: "pls enter vaild email id" });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2600);
      } else if (!password) {
        setAlertMsg({ type: "error", msg: "pls enter password" });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2600);
      }
      return;
    }
    try {
      setIsLoading(true);
      dispatch(loginStart());

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      dispatch(
        loginSuccess({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        })
      );

      saveUID(user.uid);
      setIsLoading(false);
      setEmail("");
      setPassword("");
      console.log("Suceess!! user login..");
      router.replace("/(app)/HomeScreen");
    } catch (error) {
      if (error.message == "Firebase: Error (auth/invalid-credential).") {
        setAlertMsg({type:"error",msg:"Invalid credential"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 3000)
      }
      

      setIsLoading(false);
      console.error("Error creating user:",error.message);
      dispatch(loginFailure(error.message));
    }
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.alert}>
        {isAlert && <Alert type={alertMsg.type} message={alertMsg.msg} />}
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContainer]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome Back 👋
            </Text>
  
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.icon },
              ]}
            />
  
            <View style={[styles.passwordContainer, { borderColor: theme.icon }]}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[
                  styles.input,
                  { flex: 1, color: theme.text, borderColor: "transparent" },
                ]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
  
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                style={{
                  alignSelf: "flex-end",
                  color: theme.text,
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                Already have Account?
              </Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // fallback color
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },
  alert: {
    position: "absolute",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    // height: 50,
    marginBottom: 8,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

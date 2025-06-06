import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import {
  setUserData
} from "../../store/features/user/userSlice";
// import { useSelector } from 'react-redux';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Alert from "../../components/Alert";
import { Colors } from "../../constants/Colors";
import { auth, db } from "../../firebase";
import { loginFailure, loginStart, loginSuccess } from "../../store/features/auth/authSlice";
import { saveUID } from "../../util/aysnStore";

export default function SignUp() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  // const { user, loading, error } = useSelector(state => state.auth);
  const theme = Colors[colorScheme ?? "light"];

  const [username, setUsername] = useState("");
  const [isAlert, setIsAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password => typeof password === 'string' && password.length >= 6;


  const registerUser = async () => {
    if (!username || !isValidEmail(email) || !(password===confirmPassword) || !isValidPassword(password)) {
      if(!username ){
        setAlertMsg({type:"error",msg:"Pls Enter user name"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 2600)
      }
      else if(!isValidEmail(email)){
        setAlertMsg({type:"error",msg:"Pls Enter a valid email id"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 2600)
      }
      else if(!(password===confirmPassword)){
        setAlertMsg({type:"error",msg:"Password and Confirm Password doesn't match"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 2600)
      }
      else if(!isValidPassword(password)){
        setAlertMsg({type:"error",msg:"Pls set harder password"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 2600)
      }
      return;
    }


    try {
      setIsLoading(true);
      dispatch(loginStart());

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: username,
        });

  
        dispatch(
          loginSuccess({
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          })
        );
        dispatch(
          setUserData({
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            uid: user.uid, // <-- Important for identifying the user in DB
          })
        );
        
        await setDoc(doc(db, "users", user.uid), {
          fullName: username,
          email:  user.email,
          location: null,
          profileImage: null,
          joinDate: new Date().toISOString(),
        });
        setIsLoading(false);
        saveUID(user.uid);
        setEmail("");
        setUsername("");
        setConfirmPassword("");
        setPassword("")
        console.log("Suceess!! user login..");
      router.replace("/(app)/HomeScreen");
      
    } catch (error) {
      if (error.message == "Firebase: Error (auth/email-already-in-use).") {
        setAlertMsg({type:"warning",msg:"Email already be register..Pls Login"});
        setIsAlert(true);
        setTimeout(()=> setIsAlert(false), 3000)
      }

      setIsLoading(false);
      console.log("Error creating user:",error.message);
      dispatch(loginFailure(error.message));
    }
  };
  // if(isAlert){
  //   return(<Alert type={alertMsg.type} message={alertMsg.msg} />)
  // }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
           
            <Text style={[styles.title, { color: theme.text }]}>
              Create Your Account 🚀
            </Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor={theme.icon}
              value={username}
              onChangeText={setUsername}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.icon },
              ]}
            />

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

            <View
              style={[styles.passwordContainer, { borderColor: theme.icon }]}
            >
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

            <View
              style={[styles.passwordContainer, { borderColor: theme.icon }]}
            >
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={theme.icon}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={[
                  styles.input,
                  { flex: 1, color: theme.text, borderColor: "transparent" },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.navigate("/Login");
              }}
            >
              <Text
                style={{
                  alignSelf: "flex-end",
                  color: theme.text,
                  fontSize: 14,
                }}
              >
                Already have Account?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={registerUser}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center", // okay now because it's scrollable
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 28,
    textAlign: "center",
  },
  alert:{
    position:"absolute",
    width:"100%"
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
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

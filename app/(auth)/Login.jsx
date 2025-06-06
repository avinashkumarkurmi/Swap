import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, or, query, where } from "firebase/firestore";
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
import { auth, db } from "../../firebase";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../store/features/auth/authSlice";
import {
  setAvailableForSwap,
  setItems,
  setSwapReqItems,
  setUserData
} from "../../store/features/user/userSlice";
import { saveUID } from "../../util/aysnStore";

export default function Login() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const fetchSwapRequestsByUserId = async (userId) => {
    if (!userId) throw new Error("User ID is required");

    const swapRequestsRef = collection(db, "swapRequests");
    const q = query(
      swapRequestsRef,
      or(where("fromUserId", "==", userId), where("toUserId", "==", userId))
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fromItemId: data.fromItemId || null,
        toItemId: data.toItemId || null,
        fromUserId: data.fromUserId || null,
        toUserId: data.toUserId || null,
        status: data.status || "pending",
        timestamp: data.timestamp?.toDate().toISOString() || null,
      };
    });
  };

  const getAvailableSwapItemsForUser = (userItems, swapRequests, userId) => {
    if (!Array.isArray(userItems) || !Array.isArray(swapRequests)) return [];
  
    // 1. Track item IDs involved in accepted or fulfilled requests
    const unavailableItemIds = new Set();
  
    for (const req of swapRequests) {
      if (req.status === "accepted" || req.status === "fulfilled") {
        unavailableItemIds.add(req.fromItemId);
        unavailableItemIds.add(req.toItemId);
      }
    }
  
    // 2. Track multiple pending requests for same toItemId from this user
    const pendingMap = new Map(); // toItemId -> fromItemId[]
  
    for (const req of swapRequests) {
      if (req.status === "pending" && req.fromUserId === userId) {
        if (!pendingMap.has(req.toItemId)) {
          pendingMap.set(req.toItemId, []);
        }
        pendingMap.get(req.toItemId).push(req.fromItemId);
      }
    }
  
    // 3. Track duplicate fromItems in pending requests
    const duplicateFromItemIds = new Set();
  
    for (const [toItemId, fromIds] of pendingMap.entries()) {
      if (fromIds.length > 1) {
        fromIds.slice(1).forEach(id => duplicateFromItemIds.add(id));
      }
    }
  
    // 4. Filter items: not accepted/fulfilled and not duplicate from pending
    return userItems.filter(item =>
      !unavailableItemIds.has(item.id) &&
      !duplicateFromItemIds.has(item.id)
    );
  };
  

  const fetchSwapItemsByUserId = async (userId) => {
    const swapItemsRef = collection(db, "items");
    const q = query(swapItemsRef, where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate().toISOString() || null,
      };
    });
  };

  const handleLogin = async () => {
    if (!isValidEmail(email) || !email || !password) {
      const msg =
        !email
          ? "Pls enter email id"
          : !isValidEmail(email)
          ? "pls enter vaild email id"
          : "pls enter password";
      setAlertMsg({ type: "error", msg });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      return;
    }

    try {
      setIsLoading(true);
      dispatch(loginStart());

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const [swapRequests, userItems] = await Promise.all([
        fetchSwapRequestsByUserId(user.uid),
        fetchSwapItemsByUserId(user.uid),
      ]);

      const availableItems = getAvailableSwapItemsForUser(userItems, swapRequests, user.uid);
      // const list = await fetchSwapItemsByUserId(userId);

      dispatch(setAvailableForSwap(availableItems));
      dispatch(setSwapReqItems(swapRequests));
      dispatch(setItems(userItems));
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
          uid: user.uid,
        })
      );

      saveUID(user.uid);
      setIsLoading(false);
      setEmail("");
      setPassword("");
      router.replace("/(app)/HomeScreen");
    } catch (error) {
      setIsLoading(false);
      setAlertMsg({ type: "error", msg: "Invalid credential" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 3000);
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
  
            <TouchableOpacity onPress={() => router.navigate("/SignUp")}>
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

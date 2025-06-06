import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { getAuth, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../../constants/Colors";
import { city } from "../../constants/varibale";
import { db } from "../../firebase";
import { logout } from "../../store/features/auth/authSlice";
import {
    clearUser,
    updateReduxProfile,
} from "../../store/features/user/userSlice";
import { removeUID } from "../../util/aysnStore";

import { uploadImageUrisToCloudinary } from "../../util/backend";

export default function Profile() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch();
  const { email, displayName, photoURL, uid } = useSelector(
    (state) => state.user
  );

  console.log( useSelector(
    (state) => state.user
  ));
  

  const [profile, setProfile] = useState({
    fullName: displayName || "",
    location: "",
    profileImage: photoURL || null,
  });
  const [localImageUri, setLocalImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfileFromFirebase = async () => {
      try {
        const docRef = doc(db, "users", uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile((prev) => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            location: data.location || "",
            profileImage: data.profileImage || prev.profileImage,
          }));
        }
      } catch (error) {
        console.log("Error loading profile:", error.message);
      }
    };

    if (uid) loadProfileFromFirebase();
  }, [uid]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLocalImageUri(uri);
      setProfile({ ...profile, profileImage: uri });
    }
  };

  const handleSave = async () => {
    if (!profile.fullName || !profile.location) {
      Alert.alert("Please complete all fields");
      return;
    }

    try {
      setLoading(true);
      let uploadedImageUrl = profile.profileImage;

      if (localImageUri) {
        const cloudinaryResult = await uploadImageUrisToCloudinary([
          localImageUri,
        ]);
        if (cloudinaryResult?.length > 0) {
          uploadedImageUrl = cloudinaryResult[0];
        }
      }

      const updatedData = {
        fullName: profile.fullName,
        location: profile.location,
        profileImage: uploadedImageUrl,
      };

      await updateDoc(doc(db, "users", uid), updatedData);

      dispatch(
        updateReduxProfile({
          displayName: updatedData.fullName,
          photoURL: updatedData.profileImage,
        })
      );

      Alert.alert("Profile updated successfully");
      setIsEditing(false);
      setLocalImageUri(null);
    } catch (error) {
      Alert.alert("Error updating profile", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
    removeUID();
    router.replace("/(auth)/Login");
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Password must be at least 6 characters long.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    try {
        
        await updatePassword(user, newPassword);
    } catch (error) {
        console.log(error,"??");
        
    }
    Alert.alert("Password updated successfully");

    // TODO: Integrate Firebase Auth updatePassword logic
    // Alert.alert("Password change feature is coming soon.");
    setNewPassword("");
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 20, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity
        onPress={isEditing ? pickImage : null}
        style={{
          alignSelf: "center",
          marginBottom: 20,
          borderWidth: 2,
          borderColor: theme.primary,
          borderRadius: 100,
          padding: 4,
        }}
      >
        {profile.profileImage ? (
          <Image
            source={{ uri: profile.profileImage }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "#ccc",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#555" }}>Pick Image</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: theme.text, fontWeight: "bold", marginBottom: 6 }}
        >
          Email
        </Text>
        <Text style={{ fontSize: 16, color: theme.text }}>{email}</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: theme.text, fontWeight: "bold", marginBottom: 6 }}
        >
          Full Name
        </Text>
        {isEditing ? (
          <TextInput
            style={{
              backgroundColor: theme.background,
              border: 5,
              borderWidth: 1,
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              fontSize: 16,
              color: theme.text,
              borderColor: theme.icon,
            }}
            value={profile.fullName}
            onChangeText={(text) => setProfile({ ...profile, fullName: text })}
          />
        ) : (
          <Text style={{ fontSize: 16, color: theme.text }}>
            {profile.fullName}
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: theme.text, fontWeight: "bold", marginBottom: 6 }}
        >
          Location
        </Text>
        {isEditing ? (
          <View
            style={{
              backgroundColor: theme.background,
              border: 5,
              borderWidth: 1,
              borderRadius: 10,
              //   padding: 14,
              //   marginBottom: 16,
              fontSize: 16,
              color: theme.text,
              borderColor: theme.icon,
            }}
          >
            <Picker
              selectedValue={profile.location}
              onValueChange={(value) =>
                setProfile({ ...profile, location: value })
              }
              style={{ color: theme.text }}
            >
              <Picker.Item label="Select location" value="" />
              {city.map((loc) => (
                <Picker.Item key={loc} label={loc} value={loc} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={{ fontSize: 16, color: theme.text }}>
            {profile.location || "Not specified"}
          </Text>
        )}
      </View>

      {isEditing && (
        <>
          <Text
            style={{ color: theme.text, fontWeight: "bold", marginBottom: 6 }}
          >
            Change Password
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.background,
              border: 5,
              borderWidth: 1,
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              fontSize: 16,
              color: theme.text,
              borderColor: theme.icon,
            }}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={theme.text}
          />
          <TouchableOpacity
            onPress={handlePasswordChange}
            style={{
              backgroundColor: "#555",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Change Password
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
        style={{
          backgroundColor: theme.tint,
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 20,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <Text style={{ color: theme.text, fontWeight: "600" }}>
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#e63946",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

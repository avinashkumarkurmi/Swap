// import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import CustomPicker from "../../components/CustomPicker";
import { Colors } from "../../constants/Colors";
import { categories_, city } from "../../constants/varibale";
import { db } from "../../firebase";
import { addItem } from "../../store/features/user/userSlice";
import { getUID } from "../../util/aysnStore";
import { uploadImageUrisToCloudinary } from "../../util/backend";
// import {  } from "firebase/firestore";

// const categories_ = [
//   "Books",
//   "Clothing",
//   "Electronics",
//   "Furniture",
//   "Home Appliances",
//   "Toys & Games",
//   "Sports Equipment",
//   "Musical Instruments",
//   "Stationery",
//   "Pet Supplies",
//   "Beauty & Personal Care",
//   "Baby Products",
//   "Tools & Hardware",
//   "Art & Craft",
//   "Bags & Accessories",
//   "Footwear",
//   "Mobile Phones & Accessories",
//   "Bicycles",
//   "Gardening",
//   "Other",
// ];
// const city = [
//   "Mumbai",
//   "Delhi",
//   "Bengaluru",
//   "Hyderabad",
//   "Chennai",
//   "Kolkata",
//   "Pune",
//   "Ahmedabad",
//   "Jaipur",
//   "Lucknow",
//   "Chandigarh",
//   "Surat",
//   "Indore",
//   "Nagpur",
//   "Bhopal",
//   "Patna",
//   "Thiruvananthapuram",
//   "Kochi",
//   "Visakhapatnam",
//   "Vadodara",
//   "Ranchi",
//   "Raipur",
//   "Guwahati",
//   "Noida",
//   "Gurugram",
//   "other",
// ];

export default function AddItems() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUris, setImageUris] = useState([]);
  //   const [category, setCategory] = useState('');

  const [isAlert, setIsAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [isUploadingImage, setIsUploadingImages] = useState(false);
  const [category, setCategory] = useState("");
  const [categoryCity, setCategoryCity] = useState("");

  //   const categories = ["Books", "Electronics", "Clothes", "Furniture"];

  const pickImage = async (index) => {
    try {
      const mediaTypes = ImagePicker.MediaType
        ? [ImagePicker.MediaType.IMAGE]
        : ImagePicker.MediaTypeOptions.Images;

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = [...imageUris];
        newUris[index] = result.assets[0].uri;
        setImageUris(newUris);
      }
    } catch (e) {
      setAlertMsg({ type: "error", msg: "Failed to pick image" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      console.log("Image picker error:", e);
      //   Alert.alert("Error", "Failed to pick image");
    }
  };

  const getUserById = async (userId) => {
    if (!userId) return null;

    try {
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        console.warn(`User with ID ${userId} not found.`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user by ID:", error.message);
      return null;
    }
  };

  const handleSubmit = async () => {
    const filteredImages = imageUris.filter(Boolean);

    if (!title || !description) {
      setAlertMsg({ type: "error", msg: "Please fill title and description" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      return;
    }
    if (filteredImages.length < 2) {
      setAlertMsg({ type: "warning", msg: "At least 2 images are required" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      //   Alert.alert("At least 2 images are required");
      return;
    }
    const userId = await getUID();
    if (category == "" && categoryCity == "") {
      setAlertMsg({ type: "warning", msg: "Pls select Category and city" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);

      return;
    }
    if (userId) {
      const user = await getUserById(userId);
      if (user.location == null) {
        setAlertMsg({ type: "warning", msg: "Pls add location to user profile" });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 3200);
        return;
      }
    }

    setIsUploadingImages(true);

    try {
      uploadImageUrisToCloudinary(filteredImages).then(async (urls) => {
        console.log("✅ Uploaded URLs:", urls);

        const uid = await getUID();

        await addDoc(collection(db, "items"), {
          ownerId: uid,
          title,
          description,
          images: urls,
          isAvailable: true,
          timestamp: serverTimestamp(),
          category: category,
          location: categoryCity,
        });


        dispatch(addItem({
          ownerId: uid,
          title,
          description,
          images: urls,
          isAvailable: true,
          category,
          location: categoryCity,
          timestamp: Date.now(), // ✅ Use plain timestamp OR omit it entirely here
        }));
        
        // Alert.alert("Item added successfully");
        setAlertMsg({ type: "success", msg: "Item added successfully" });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2600);
        setTitle("");
        setDescription("");
        setImageUris([]);
        setIsUploadingImages(false);
      });
    } catch (error) {
      setIsUploadingImages(false);
      setAlertMsg({
        type: "error",
        msg: "error in Add Items during upload(line number 97)",
      });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      console.log("error in Add Items during upload(line number 97): ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={styles.alert}>
            {isAlert && <Alert type={alertMsg.type} message={alertMsg.msg} />}
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 0 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: "100%" }}>
              <TextInput
                placeholder="Item Title"
                value={title}
                onChangeText={setTitle}
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholderTextColor={theme.text + "99"}
              />

              <TextInput
                placeholder="Item Description"
                value={description}
                onChangeText={setDescription}
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholderTextColor={theme.text + "99"}
              />
              <CustomPicker
                label="Category"
                options={categories_}
                selectedValue={category}
                onValueChange={setCategory}
                containerStyle={{
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: theme.card,
                  padding: 14,
                }}
                labelStyle={{
                  // fontWeight: "600",
                  fontSize: 14,
                  marginBottom: 6,
                  color: theme.text,
                }}
                valueStyle={{
                  fontSize: 17,
                  color: theme.text,
                }}
                optionStyle={{
                  paddingVertical: 12,
                  marginBottom: 5,
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  backgroundColor: theme.card,
                  // borderBottomWidth: 1,
                  // borderBottomColor: theme.border,
                }}
                optionTextStyle={{
                  fontSize: 16,
                  color: theme.text,
                }}
              />
              <CustomPicker
                label="Select the city the product and be swap"
                options={city}
                selectedValue={categoryCity}
                onValueChange={setCategoryCity}
                containerStyle={{
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: theme.card,
                  padding: 14,
                }}
                labelStyle={{
                  // fontWeight: "600",
                  fontSize: 14,
                  marginBottom: 6,
                  color: theme.text,
                }}
                valueStyle={{
                  fontSize: 17,
                  color: theme.text,
                }}
                optionStyle={{
                  paddingVertical: 12,
                  marginBottom: 5,
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  //   backgroundColor: theme.success,
                  // borderBottomWidth: 1,
                  // borderBottomColor: theme.border,
                }}
                optionTextStyle={{
                  fontSize: 16,
                  color: theme.text,
                }}
              />

              <Text
                style={{
                  color: theme.text,
                  alignSelf: "flex-end",
                  marginBottom: 10,
                }}
              >
                Pls add at least 2 photos before proceeding
              </Text>

              <View style={styles.imageGrid}>
                {[...Array(6)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageSlot}
                    onPress={() => pickImage(index)}
                  >
                    {imageUris[index] ? (
                      <Image
                        source={{ uri: imageUris[index] }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <Text style={{ color: theme.text }}>+</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      imageUris.filter(Boolean).length >= 2
                        ? theme.tint
                        : "#ccc",
                  },
                ]}
                onPress={handleSubmit}
                disabled={imageUris.filter(Boolean).length < 2}
              >
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    // paddingBottom: 100, // ⬅️ Add this
    // alignItems: "center",
  },
  alert: {
    position: "absolute",
    top: 0,
    width: "100%",
    // paddingVertical: 12,
    // paddingHorizontal: 20,
    zIndex: 9999,
    // elevation: ,
    // borderBottomWidth: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    //   height: 200
    //   marginBottom: 20,
  },
  imageSlot: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  submitButton: {
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

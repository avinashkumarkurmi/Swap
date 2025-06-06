import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  useColorScheme,
  View
} from "react-native";
import SwapActionSection from "../../../components/SwapActionSection";
import { Colors } from "../../../constants/Colors";
import { removeAvailableForSwap } from "../../../store/features/user/userSlice";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/Alert";
import ThemedButton from "../../../components/ThemedButton";
import { db } from "../../../firebase";

export default function SwapDetail() {
  const { item: itemParam } = useLocalSearchParams();
  const { uid, availableForSwap } = useSelector((state) => state.user);

  // console.log(typeof from);
  const getOrCreateConversation = async (user1, user2) => {
    const participants = [user1, user2].sort(); // ensure consistent order

    const q = query(
      collection(db, "conversations"),
      where("participants", "==", participants)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      return existing.docs[0].id;
    }

    // No conversation found, create a new one
    try {
      const docRef = await addDoc(collection(db, "conversations"), {
        participants,
        createdAt: serverTimestamp(),
        lastMessage: "",
      });
      console.log(docRef, "docRef");
    } catch (error) {
      console.log(error, "error");
    }

    return docRef.id;
  };

  const getOtherUserFullName = async (currentUserId, conversationId) => {
    try {
      // Get conversation document
      const convoRef = doc(db, "conversations", conversationId);
      const convoSnap = await getDoc(convoRef);

      if (!convoSnap.exists()) {
        console.warn("Conversation not found");
        return "Unknown Conversation";
      }

      const participants = convoSnap.data().participants;
      const otherUserId = participants.find((uid) => uid !== currentUserId);

      if (!otherUserId) {
        console.warn("Other user not found in participants");
        return "Unknown User";
      }

      // Get user document for the other user
      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().fullName || "Unnamed";
      } else {
        return "User Not Found";
      }
    } catch (error) {
      console.error("Error fetching other user full name:", error);
      return "Error";
    }
  };
  // useEffect(() => {
  //   const backAction = () => {
  //     if (from === "Home") {
  //       router.navigate("/home");
  //     } else if (from === "MyItems") {
  //       router.navigate("/MyItems");
  //     } else {
  //       router.back(); // fallback
  //     }
  //     return true; // prevent default behavior
  //   };

  //   const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

  //   return () => backHandler.remove();
  // }, [from]);

  // console.log(itemParam,"??,,,");

  // console.log(availableForSwap,"=====");

  // const fetchSwapRequestsByUserId = async (userId) => {
  //   if (!userId) throw new Error("User ID is required");

  //   try {
  //     const swapRequestsRef = collection(db, "swapRequests");

  //     const q = query(
  //       swapRequestsRef,
  //       or(where("fromUserId", "==", userId), where("toUserId", "==", userId))
  //     );

  //     const querySnapshot = await getDocs(q);

  //     const requests = [];
  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data();

  //       // Convert Firestore timestamp to ISO string
  //       const timestamp = data.timestamp?.toDate().toISOString() || null;

  //       requests.push({
  //         id: doc.id,
  //         ...data,
  //         timestamp,
  //       });
  //     });

  //     return requests;
  //   } catch (error) {
  //     console.error("Error fetching swap requests:", error);
  //     throw error;
  //   }
  // };

  const item =
    typeof itemParam === "string" ? JSON.parse(itemParam) : itemParam;

  // const router = useRouter();
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const theme = Colors[colorScheme ?? "light"];
  const [owner, setOwner] = useState(null);
  // const [itemsCanBeSwap, setItemsCanBeSwap] = useState([]);
  const [loadingOwner, setLoadingOwner] = useState(true);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

  const sendSwapRequest = async ({
    fromUserId,
    toUserId,
    fromItemId,
    toItemId,
  }) => {
    //     console.log("fromUserId:", fromUserId);
    // console.log("toUserId:", toUserId);
    // console.log("fromItemId:", fromItemId);
    // console.log("toItemId:", toItemId);

    try {
      const swapRequest = {
        fromUserId,
        toUserId,
        fromItemId,
        toItemId,
        status: "pending",
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "swapRequests"), swapRequest);
      console.log("Swap request sent!");
    } catch (err) {
      console.error("Error sending swap request:", err);
      throw err;
    }
  };
  // console.log(item.ownerId,uid,"//");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const userRef = doc(getFirestore(), "users", item.ownerId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setOwner(docSnap.data());
        }
      } catch (err) {
        console.error("Failed to fetch owner", err);
      } finally {
        setLoadingOwner(false);
      }
    };
    fetchOwner();
  }, []);
  // useEffect(()=>{
  //   function ___() {
  //     const excludedIds = new Set(
  //       (swapReqItems.swapRequests ?? []).flatMap((req) => [
  //         req.fromItemId,
  //         req.toItemId,
  //       ])
  //     )

  //     const filteredItems = items.filter((item) => !excludedIds.has(item.id))

  //     setItemsCanBeSwap(filteredItems);
  //   }
  //   ___();

  // },[isAlert]);

  const handleSwapRequest = async (r) => {
    if (r == undefined) {
      setAlertMsg({ type: "error", msg: "No Item to be swap" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2100);
    }
    // console.log(r);

    // console.log("fkdcngfb",r);

    const fromUserId = uid;
    const fromItemId = r.id;
    const toItemId = item.id; // item you're viewing
    const toUserId = item.ownerId;
    try {
      await sendSwapRequest({
        fromUserId,
        toUserId,
        fromItemId,
        toItemId,
      });

      // const swapReqItems = await fetchSwapRequestsByUserId(uid);
      // dispatch(setSwapReqItems(swapReqItems));
      // const filteredItems = items.filter((item) => item.id !== r.id);

      dispatch(removeAvailableForSwap(r.id));
      // setItemsCanBeSwap(filteredItems);
      setAlertMsg({ type: "Sucess", msg: "Swap Request Sent!!" });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2800);
    } catch (error) {
      setAlertMsg({ type: "error", msg: error.message });
      setIsAlert(true);
      setTimeout(() => setIsAlert(false), 2600);
      console.log(error, "line no 168 in Swap Detail screen");
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background, flex: 1 }}>
      {/* Images */}
      <View
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        {isAlert && <Alert type={alertMsg.type} message={alertMsg.msg} />}
      </View>
      <FlatList
        data={item.images}
        horizontal
        keyExtractor={(uri, index) => index.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{
              width: 300,
              height: 200,
              marginRight: 10,
              borderRadius: 10,
            }}
          />
        )}
        showsHorizontalScrollIndicator={false}
        style={{ padding: 10 }}
      />

      {/* Title and Description */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text }}>
          {item.title}
        </Text>
        <Text style={{ color: theme.textSecondary, marginVertical: 10 }}>
          {item.description}
        </Text>

        <Text style={{ color: theme.text }}>
          <Text style={{ fontWeight: "600" }}>Category:</Text> {item.category}
        </Text>
        <Text style={{ color: theme.text }}>
          <Text style={{ fontWeight: "600" }}>Location:</Text> {item.location}
        </Text>

        {/* Owner */}
        {loadingOwner ? (
          <ActivityIndicator color={theme.tint} style={{ marginTop: 16 }} />
        ) : owner ? (
          <View
            style={{
              marginTop: 30,
              backgroundColor: theme.card,
              padding: 20,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 12,
              }}
            >
              Swap With
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {owner.profileImage ? (
                <Image
                  source={{ uri: owner.profileImage }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 16,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 16,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}
                  >
                    {owner.fullName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: theme.text }}
                >
                  {owner.fullName}
                </Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {owner.email}
                </Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {owner.location}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Joined: {new Date(owner.joinDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={{ color: theme.error, marginTop: 20 }}>
            Owner info not available
          </Text>
        )}

        {/* Swap Request Button */}
        {/* <TouchableOpacity
          onPress={handleSwapRequest}
          style={{
            marginTop: 30,
            backgroundColor: theme.tint,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Send Swap Request
          </Text>
        </TouchableOpacity> */}
        <View style={{ flex: 1}}>
          <SwapActionSection
            handleSwapRequest={handleSwapRequest}
            theme={theme}
            items={availableForSwap}
          />
          <ThemedButton title="Message user" 
          style={{backgroundColor: theme.secondary}}
            onPress={async () => {
              const conversationId = await getOrCreateConversation(
                uid,
                item.ownerId
              );
              const name = await getOtherUserFullName(uid, conversationId);
              try {
                router.push(
                  `/Convscreen/Chat?conversationId=${conversationId}&name=${name}`
                );
              } catch (error) {
                console.log(error);
              }
            }
          } /> 
          {/* <Button
            title="Chat"
            onPress={async () => {
              const conversationId = await getOrCreateConversation(
                uid,
                item.ownerId
              );
              const name = await getOtherUserFullName(uid, conversationId);
              try {
                router.push(
                  `/Convscreen/Chat?conversationId=${conversationId}&name=${name}`
                );
              } catch (error) {
                console.log(error);
              }
            }}
          /> */}
        </View>
      </View>
    </ScrollView>
  );
}

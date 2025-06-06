import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { db } from "../../firebase";
import { getUID } from "../../util/aysnStore";

export default function SwapRequests() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoading(true);
      const uid = await getUID();
  
      const q = query(
        collection(db, "swapRequests"),
        where("fromUserId", "==", uid)
      );
      const querySnapshot = await getDocs(q);
  
      const requests = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const request = { id: docSnap.id, ...docSnap.data() };
  
          // Get recipient user data
          let recipient = null;
          try {
            const userDoc = await getDoc(doc(db, "users", request.toUserId));
            if (userDoc.exists()) {
              recipient = userDoc.data();
            }
          } catch (err) {
            console.error("Error fetching user:", err);
          }
  
          // Get target item data
          let item = null;
          try {
            const itemDoc = await getDoc(doc(db, "items", request.toItemId));
            if (itemDoc.exists()) {
              item = itemDoc.data();
            }
          } catch (err) {
            console.error("Error fetching item:", err);
          }
  
          // Find conversation ID between fromUserId and toUserId
          let conversationId = null;
          try {
            const convQuery = query(
              collection(db, "conversations"),
              where("participants", "array-contains", request.fromUserId)
            );
  
            const convSnapshot = await getDocs(convQuery);
  
            for (const convDoc of convSnapshot.docs) {
              const data = convDoc.data();
              if (
                data.participants.includes(request.toUserId) &&
                data.participants.includes(request.fromUserId)
              ) {
                conversationId = convDoc.id;
                break;
              }
            }
          } catch (err) {
            console.error("Error fetching conversation:", err);
          }
  
          return {
            ...request,
            toUserFullName: recipient?.fullName || "Unknown",
            itemData: item,
            conversationId,
          };
        })
      );
  
      setSentRequests(requests);
      setLoading(false);
    };
  
    fetchSentRequests();
  }, []);
  

  const renderItem = ({ item }) => {
    const name = item.toUserFullName;
    const conversationId = item.conversationId;
  
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={{ flex: 8 }}
          onPress={() =>
            router.push({
              pathname: "/HomeScreen/SwapDetail",
              params: { item: JSON.stringify(item.itemData) },
            })
          }
        >
          <Text style={[styles.text, { color: theme.text }]}>To: {name}</Text>
          <Text style={[styles.itemText, { color: theme.text }]}>
            Item: {item.itemData?.title || "Unknown"}
          </Text>
          <Text
            style={[styles.status, { color: getStatusColor(item.status) }]}
          >
            Status: {item.status}
          </Text>
        </TouchableOpacity>
  
        <Ionicons
          onPress={() => {
            if (!conversationId) return alert("No conversation found");
            router.navigate(
              `/Convscreen/Chat?conversationId=${conversationId}&name=${name}`
            );
          }}
          style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
          name="chatbubble-outline"
          size={24}
          color={theme.icon}
        />
      </View>
    );
  };
  

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>
          You haven't sent any swap requests yet.
        </Text>
      </View>
    );
  }

  return (
    // <View  >

    <FlatList
      style={{ flex: 1, backgroundColor: theme.background }}
      data={sentRequests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[
        styles.list,
        { backgroundColor: theme.background },
      ]}
    />
    //  </View>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "accepted":
      return "#28a745";
    case "rejected":
      return "#dc3545";
    case "fulfilled":
      return "#6f42c1";
    default:
      return "#6c757d"; // pending or unknown
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: "row",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  itemText: {
    fontSize: 15,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
  },
});

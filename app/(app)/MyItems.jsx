import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { Colors } from "../../constants/Colors";
import { auth, db } from "../../firebase";

export default function MyItems() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = Colors[colorScheme ?? "light"];
  const items = useSelector((state) => state.user.items);
  
  const uid = auth.currentUser.uid;

  const [requests, setRequests] = useState([]);

// console.log(items);

  useEffect(() => {
    fetchSwapRequests();
  }, [items]);


  const fetchSwapRequests = async () => {
    try {
      const q = query(
        collection(db, "swapRequests"),
        where("toUserId", "==", uid)
      );
      const snapshot = await getDocs(q);

      const reqs = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const userDoc = await getDoc(doc(db, "users", data.fromUserId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: docSnap.id,
            ...data,
            fromUser: {
              id: data.fromUserId,
              ...userData,
            },
          };
        })
      );

      setRequests(reqs);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  //   const handleAccept = async (acceptedRequestId, item) => {
  //     try {
  //       const acceptedRequest = requests.find((r) => r.id === acceptedRequestId);
  //       if (!acceptedRequest) return alert("Request not found.");

  //       await updateDoc(doc(db, "items", item.id), {
  //         isAvailable: false,
  //       });
  //       // Accept the selected request
  //       await updateDoc(doc(db, "swapRequests", acceptedRequestId), {
  //         status: "accepted",
  //       });

  //       // Reject all other requests for the same toItemId
  //       const batchRejects = requests
  //         .filter(
  //           (r) =>
  //             r.toItemId === acceptedRequest.toItemId &&
  //             r.id !== acceptedRequestId &&
  //             r.status === "pending"
  //         )
  //         .map((r) =>
  //           updateDoc(doc(db, "swapRequests", r.id), {
  //             status: "rejected",
  //           })
  //         );

  //       await Promise.all(batchRejects);

  //       alert("Request accepted. Other requests rejected.");
  //       fetchSwapRequests();
  //     } catch (err) {
  //       console.error("Accept failed", err);
  //       alert("Something went wrong.");
  //     }
  //   };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, "swapRequests", requestId), {
        status: "rejected",
      });
      alert("Request rejected");
      fetchSwapRequests();
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

//   const openUserModal = async (user) => {
//     // console.log(user.id);
//     // const itemInfo = await getItemsByUserId(user.id)
//     // setItemSwapInfo(itemInfo)
//     // console.log(itemInfo);
    
//     setUserDetails(user);
//     setModalVisible(true);
//   };

  const handleAccept = async (acceptedRequestId, item) => {
    // console.log(">><<");

    try {
      const response = await fetch(
        `http://192.168.180.24:3000/api/accept-swap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.currentUser.stsTokenManager.accessToken}`,
          },
          body: JSON.stringify({
            requestId: acceptedRequestId,
            itemId: item.id,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Accept failed");
      }

      alert("Swap request accepted. Other requests rejected.");
      fetchSwapRequests();
    } catch (err) {
      console.error("Accept failed", err);
      alert("Something went wrong.");
    }
  };


  const getItemById = async (itemId) => {
    try {
      const itemRef = doc(db, "items", itemId);
      const itemSnap = await getDoc(itemRef);
  
      if (!itemSnap.exists()) {
        throw new Error(`Item with ID ${itemId} not found.`);
      }
  
      return {
        id: itemSnap.id,
        ...itemSnap.data(),
      };
    } catch (error) {
      console.error("Error fetching item:", error.message);
      throw error;
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      await updateDoc(doc(db, "swapRequests", requestId), {
        status: "fulfilled",
      });
      alert(
        "Swap marked as fulfilled. Consider messaging the other user to coordinate the swap location."
      );
      fetchSwapRequests();
    } catch (err) {
      console.error("Fulfill failed", err);
      alert("Something went wrong while fulfilling the swap.");
    }
  };




  const renderItem = ({ item }) => {
    // console.log(requests);
    
    const itemRequests = requests.filter((r) => r.toItemId === item.id);
    const acceptedRequest = itemRequests.find((r) => r.status === "accepted");
    const fulfilledRequest = itemRequests.find((r) => r.status === "fulfilled");

  // console.log(itemRequests);
  

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        <Text style={{ color: theme.text }}>
          {item.description.slice(0, 80)}...
        </Text>

        {fulfilledRequest ? (
          <View style={styles.reqContainer}>
            <Text style={{ fontWeight: "bold", color: theme.text }}>
              Swap Fulfilled with:
            </Text>
            {/* <TouchableOpacity
              onPress={() => openUserModal(fulfilledRequest.fromUser)}
            > */}
              <Text style={{ color: theme.text, fontWeight: "bold" }}>
                {fulfilledRequest.fromUser.fullName ??
                  fulfilledRequest.fullName}
              </Text>
            {/* </TouchableOpacity> */}
            <Text
              style={{ marginTop: 8, fontStyle: "italic", color: theme.text }}
            >
              Swap marked as fulfilled.
            </Text>
          </View>
        ) : acceptedRequest ? (
          <View style={styles.reqContainer}>
            <Text style={{ fontWeight: "bold", color: theme.text }}>
              Accepted Swap Request by:
            </Text>
            {/* <TouchableOpacity
              onPress={() => openUserModal(acceptedRequest.fromUser)}
            > */}
              <Text style={{ color: theme.textSecondary, fontWeight: "bold" }}>
                {acceptedRequest.fromUser.fullName ??
                  acceptedRequest.fromUser.fullName}
              </Text>
            {/* </TouchableOpacity> */}

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: theme.secondary, marginTop: 10 },
              ]}
              onPress={() => handleFulfill(acceptedRequest.id)}
            >
              <Text style={styles.btnText}>Mark as Fulfilled</Text>
            </TouchableOpacity>

            <Text
              style={{ marginTop: 8, fontStyle: "italic", color: theme.text }}
            >
              Consider messaging the user to coordinate swap location, time,
              etc.
            </Text>
          </View>
        ) : itemRequests.filter((r) => r.status === "pending").length > 0 ? (
          <View style={styles.reqContainer}>
            <Text style={{ fontWeight: "bold", color: theme.text }}>
              Swap Requests:
            </Text>
            {itemRequests
              .filter((r) => r.status === "pending")
              .map((req) => (
                <View key={req.id} style={styles.request}>
                  <TouchableOpacity onPress={async() => {

// console.log(req.fromItemId);


const x = await getItemById(req.fromItemId)
router.push({
    pathname: "/HomeScreen/SwapDetail",
    params: { item: JSON.stringify(x), from: 'MyItem' }
  });
                    //   console.log(x,">>>");
                      // openUserModal(req.fromUser)
                  }
                    
                    }>
                    <Text style={{ color: "#007BFF", fontWeight: "bold" }}>
                      {req.fromUser.name ?? req.fromUser.id.slice(0, 10)}...
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.acceptBtn]}
                      onPress={() => handleAccept(req.id, item)}
                    >
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.rejectBtn]}
                      onPress={() => handleReject(req.id)}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        ) : itemRequests.length === 0 ? (
          <Text style={{ color: theme.text }}>No swap requests</Text>
        ) : (
          <Text style={{ color: theme.text }}>No pending requests</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Modal */}
      {/* <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {userDetails?.profileImage && (
              <Image
                source={{ uri: userDetails.profileImage }}
                style={styles.modalImage}
              />
            )}
            <Text style={styles.modalTitle}>{userDetails?.fullName}</Text>
            <Text>{userDetails?.email}</Text>
            {userDetails?.bio && (
              <Text style={{ marginTop: 6 }}>{userDetails.bio}</Text>
            )}
           {itemSwapInfo.map((item) => (
  <TouchableOpacity
    key={item.swapRequestId}
    style={{ marginVertical: 8, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 10 }}
    onPress={() => {
      setModalVisible(false);
      router.push({
        pathname: "/HomeScreen/SwapDetail",
        params: { item: JSON.stringify(item) }
      });
    }}
  >
    <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
    <Text>Swap ID: {item.swapRequestId}</Text>
    <Text>Owner: {item.ownerId}</Text>
    <Text style={{ color: "#007bff" }}>View Swap Request</Text>
  </TouchableOpacity>
))}


            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: theme.error, marginTop: 16 },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
    
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  reqContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  request: {
    marginTop: 8,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    marginTop: 6,
    gap: 8,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
  },
  rejectBtn: {
    backgroundColor: "#f44336",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
});

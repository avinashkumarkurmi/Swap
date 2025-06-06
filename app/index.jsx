import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingScreen from "../components/LoadingScreen";
import { db } from "../firebase";
import { loginSuccess } from "../store/features/auth/authSlice";
import {
  setAvailableForSwap,
  setItems,
  setSwapReqItems,
  setUserData,
} from "../store/features/user/userSlice";
import { getUID } from "../util/aysnStore";


export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [userId, setUserId] = useState(null);
  // removeUID();

  useEffect(() => {
    const loadUID = async () => {
      try {
        const uid = await getUID();
        
        console.log(uid);
        setUserId(uid);
      } catch (error) {
        console.log(error);
        
      }
      
      // removeUID();

    };

    loadUID();
  }, []);

  const getUserProfileByUid = async (uid) => {
    if (!uid) throw new Error("UID is required");

    try {
      const userRef = doc(db, "users", uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return snapshot.data(); // returns user profile object
      } else {
        console.warn("No user found with UID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      throw error;
    }
  };

  async function fetchSwapItemsByUserId(userId) {
    if (!userId) {
      throw new Error("User ID is required to fetch swap items");
    }

    try {
      const swapItemsRef = collection(db, "items");
      const q = query(swapItemsRef, where("ownerId", "==", userId));
      const querySnapshot = await getDocs(q);

      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Convert timestamp to ISO string to avoid Redux serialization warnings
        const serializedData = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate().toISOString() || null,
        };

        items.push(serializedData);
      });

      return items;
    } catch (error) {
      console.error("Error fetching swap items:", error);
      throw error;
    }
  }

  const fetchSwapRequestsByUserId = async (userId) => {
    if (!userId) throw new Error("User ID is required");
  
    try {
      const swapRequestsRef = collection(db, "swapRequests");
  
      const q = query(
        swapRequestsRef,
        or(where("fromUserId", "==", userId), where("toUserId", "==", userId))
      );
  
      const querySnapshot = await getDocs(q);
  
      const requests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        // Convert Firestore timestamp to ISO string
        const timestamp = data.timestamp?.toDate().toISOString() || null;
  
        requests.push({
          id: doc.id,
          ...data,
          timestamp,
        });
      });
  
      return requests;
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      throw error;
    }
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
  

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const user = await getUserProfileByUid(userId);
        const list = await fetchSwapItemsByUserId(userId);
        const swapRequests = await fetchSwapRequestsByUserId(userId);

        const avaForSwap =  getAvailableSwapItemsForUser(list, swapRequests, userId);
        
// console.log(swapRequests, "swap items");

        dispatch(setItems(list));

        dispatch(
          loginSuccess({
            email: user.email,
            displayName: user.fullName,
            photoURL: user.profileImage || user.photoURL || null,
            emailVerified: user.emailVerified ?? true,
          })
        );

        // try {
        dispatch(
          setUserData({
            email: user.email,
            displayName: user.fullName,
            photoURL: user.profileImage || user.photoURL || null,
            emailVerified: user.emailVerified ?? true,
            uid: userId,
          })
        );
        dispatch(
          setSwapReqItems(
            swapRequests
          )
        );
        dispatch(setAvailableForSwap(avaForSwap));
        // } catch (error) {
        //   console.log(error);
        // }
        // console.log(user, "??");

        router.replace("/(app)/HomeScreen");
      } else {
        router.replace("/(auth)/Login");
      }
    };

    fetchUser();
  }, [userId]);

  return <LoadingScreen />;
}

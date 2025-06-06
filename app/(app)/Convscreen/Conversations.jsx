// screens/Conversations.js
import { router } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from "../../../constants/Colors";
import { db } from '../../../firebase';
import { getUID } from '../../../util/aysnStore';

const Conversations = () => {
  const [userId, setUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({}); // 🟢 Store UID => fullname

  useEffect(() => {
    async function fetchUID() {
      const uid = await getUID();
      setUserId(uid);
    }
    fetchUID();
  }, []);

  // 🔄 Listen to conversations
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 🟡 Extract other user IDs
      const otherUserIds = data
        .map(c => c.participants.find(uid => uid !== userId))
        .filter(Boolean);

      // 🟢 Fetch missing user names
      for (const uid of otherUserIds) {
        if (!userNames[uid]) {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          console.log(docSnap.data());
          
          if (docSnap.exists()) {
            const fullName = docSnap.data().fullName || "Unnamed";
            setUserNames(prev => ({ ...prev, [uid]: fullName }));
          }
        }
      }

      setConversations(data);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.center,{backgroundColor:theme.background}]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.center,{backgroundColor:theme.background}]}>
        <Text style={[styles.noChatsText,{color:theme.text}]}>No conversations yet</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const otherUserId = item.participants.find((uid) => uid !== userId);
    const otherUserName = userNames[otherUserId] || "Loading...";
// console.log(userNames);

    return (
      <TouchableOpacity
        style={[styles.card,{backgroundColor:theme.card}]}
        onPress={() =>
          router.navigate(`/Convscreen/Chat?conversationId=${item.id}&name=${otherUserName}`)
        }
      >
        <Text style={[styles.usernameText,{color:theme.tint}]}>{otherUserName}</Text>
        <Text style={[styles.lastMessageText,{color:theme.text}]}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
    style={{flex:1, backgroundColor: theme.background}}
      data={conversations}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
};


export default Conversations;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    elevation: 2,
  },
  usernameText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  lastMessageText: {
    color: '#333',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 16,
    color: 'gray',
  },
});




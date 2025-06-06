import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme
} from "react-native";
import ThemedButton from "../../../components/ThemedButton";
import { Colors } from "../../../constants/Colors";
import { db } from "../../../firebase";
import { getUID } from "../../../util/aysnStore";

export default function Chat() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const { conversationId, name } = useLocalSearchParams();
  // console.log(name,"name");
  
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ headerShown: false });
    navigation.setOptions({ title: name });
    return () => navigation.getParent()?.setOptions({ headerShown: true });
  }, [navigation]);

  useEffect(() => {
    getUID().then(setUserId);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const messagesQuery = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy("timestamp", "desc") // latest at top for FlatList normal order
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        senderId: userId,
        text: text.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });

      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        {
          backgroundColor:
            item.senderId === userId
              ? theme.primary
              : theme.card,
          alignSelf:
            item.senderId === userId ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Text style={{ color: theme.text }}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />

        <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={theme.text}
            value={text}
            onChangeText={setText}
            style={[
              styles.textInput,
              {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.card ?? "#f9f9f9",
              },
            ]}
            multiline
          />
          <ThemedButton title="send"  onPress={sendMessage} textStyle={theme.primary} style={{with:90, paddingVertical:5, height:40}} />
          {/* <Button title="Send" onPress={sendMessage} color={theme.primary} /> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesContainer: {
    padding: 10,
    paddingBottom: 60,
  },
  messageBubble: {
    maxWidth: "75%",
    marginVertical: 4,
    padding: 10,
    borderRadius: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 120,
  },
});

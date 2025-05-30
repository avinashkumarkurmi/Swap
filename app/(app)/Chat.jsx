import { collection, doc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { db } from "../../firebase"; // adjust as needed

export default function Chat() {


 

const migrateTimestamps = async () => {
    console.log("dcbjssjkjcjvdsxcj");
    
  const snapshot = await getDocs(collection(db, "items"));
  for (const document of snapshot.docs) {
    const data = document.data();
    if (typeof data.timestamp === "string") {
      await updateDoc(doc(db, "items", document.id), {
        timestamp: Timestamp.fromDate(new Date(data.timestamp))
      });
    }
  }
};
useEffect(()=>{
    migrateTimestamps();
    console.log("ended.....");
    
})
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>Hello form Chat</Text></View>
    );
}
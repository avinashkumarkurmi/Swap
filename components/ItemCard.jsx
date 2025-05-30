import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedButton from "../components/ThemedButton"; // adjust the path
import { Colors } from "../constants/Colors";
// adjust the import path as needed

export default function ItemCard({ item, onPress }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const imageUrl = item?.images?.length > 0 ? item.images[0] : null;

  

  return (
    <TouchableOpacity onPress={()=> onPress(item)}>
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, shadowColor: theme.border },
      ]}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}


      <View style={styles.content}>
        <View style={styles.titleContainor}>
          <Text style={[styles.title, { color: theme.text }]}>
            {item.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4,marginBottom:4 }}>
            <Icon name="location-on" size={16} color={theme.icon} />
            <Text style={{ color: theme.textSecondary }}>{item.location}</Text>
          </View>
        </View>

        {/* <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {item.category} • {item.timestamp}
        </Text> */}
        <View style={styles.descAndButton}>
        <Text
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.description.split(" ").slice(0, 4).join(" ")}...
          </Text>
          <ThemedButton title="Send Swap" onPress={() => console.log("Pressed!")} style={{width: 100, height:35, paddingVertical: 5, paddingHorizontal :2}} textStyle={{fontSize:15}}/>

        </View>
        
      </View>
    </View></TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  titleContainor:{
    flexDirection: 'row',
    // height: 27
    justifyContent: "space-between"
  },
  descAndButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center"
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
  },

//   button:{
//     width:80,
//     backgroundColor: "red"
//   }
});

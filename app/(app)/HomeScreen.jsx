import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FilterModal from "../../components/FilterModal";
import ItemCard from "../../components/ItemCard";
import { Colors } from "../../constants/Colors";
import { categories_, city } from "../../constants/varibale";
import { db } from "../../firebase";

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const [items, setItems] = useState([]);
  const [allData, setAllData] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({ category: "", location: "" });
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // const categories = ["Furniture", "Electronics", "Clothing"];
  // // const locations = ["Jaipur", "Delhi", "Mumbai"];

  // const locations = [
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


  const applyFilters = () => {
    console.log("Filters Applied:", filters);
  
    const { category, location } = filters;
  
    const filteredItems = allData.filter(item => {
      const matchCategory = category ? item.category === category : true;
      const matchLocation = location ? item.location === location : true;
      return matchCategory && matchLocation;
    });
  
    setItems(filteredItems);
    setModalVisible(false);
  };
  

  const fetchPaginatedItems = async (startAfterTimestamp = null) => {
    try {
      let q = query(
        collection(db, "items"),
        orderBy("timestamp", "desc"),
        ...(startAfterTimestamp ? [startAfter(startAfterTimestamp)] : []),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);

      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newLastTimestamp =
        newItems.length > 0 ? newItems[newItems.length - 1].timestamp : null;

      console.log("📦 Fetched", newItems.length, "items");
      console.log("🕒 New Last Timestamp:", newLastTimestamp?.toDate?.());

      return { newItems, newLastTimestamp };
    } catch (error) {
      console.error("❌ Error fetching items:", error);
      return { newItems: [], newLastTimestamp: null };
    }
  };

  const loadInitialItems = async () => {
    setLoading(true);
    const { newItems, newLastTimestamp } = await fetchPaginatedItems();
    setItems(newItems);
    setAllData(newItems);
    setLastTimestamp(newLastTimestamp);
    setHasMore(newItems.length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMoreItems = async () => {
    console.log("Loading more items");

    if (loadingMore || !hasMore || !lastTimestamp) return;
    setLoadingMore(true);

    const q = query(
      collection(db, "items"),
      orderBy("timestamp", "desc"),
      startAfter(lastTimestamp),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const newItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const newLast =
      newItems.length > 0 ? newItems[newItems.length - 1].timestamp : null;

    console.log("📦 Fetched", newItems.length, "items");
    console.log("🕒 New Last Timestamp:", newLast?.toDate?.());

    setItems((prev) => [...prev, ...newItems]);
    setAllData((prev) => [...prev, ...newItems]);
    setLastTimestamp(newLast);
    setHasMore(newItems.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleCardClick = (cardItem) => {
    console.log("card Click !", cardItem);
  };

  useEffect(() => {
    loadInitialItems();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={handleCardClick} />
        )}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: "row",
                marginVertical: 5,
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "300", color: theme.text }}
              >
                {(filters.category || filters.location) &&
                  `${filters.location} ${filters.category}`}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Icon name="filter-outline" size={24} color={theme.icon} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    marginLeft: 8,
                    color: theme.textSecondary,
                  }}
                >
                  Filters
                </Text>
              </TouchableOpacity>
            </View>

            <FilterModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              filters={filters}
              setFilters={setFilters}
              categories={categories_}
              locations={city}
              onApply={applyFilters}
            />
          </>
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color="gray" /> : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="gray" />
          ) : (
            <View style={{ justifyContent:"center", alignContent: 'center', flex:1,marginTop: 300}}>
              <Text style={{color:theme.text, textAlign: 'center' }}>No Swap found.</Text>
              </View>
          )
        }
      />
    </View>
  );
}

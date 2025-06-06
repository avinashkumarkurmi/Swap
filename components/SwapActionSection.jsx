import { Picker } from "@react-native-picker/picker"; // install this if not already
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const SwapActionSection = ({ handleSwapRequest, theme, items }) => {
  // const  {items}  = useSelector((state) => state.user);
  // console.log(typeof items);
  
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [noItem, setNoItem] = useState(false);

  useEffect(() => {
    if (items?.length > 0) {
      setSelectedItemId(items[0].id);
    }else{
      setNoItem(true);
      console.log("?????>>>>");
      
    }
  }, [items]);

  const onSendRequest = () => {
    const selectedItem = items.find((item) => item.id === selectedItemId);
    // console.log("hereee");
    
    handleSwapRequest(selectedItem);
  };

  if(noItem){
    <View style={{ marginTop: 30 }}>
      <Text style={{ color: theme.text, fontWeight: "600", marginBottom: 10 }}>
        No items to be Swap..
      </Text>
      </View>
  }

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={{ color: theme.text, fontWeight: "600", marginBottom: 10 }}>
        Choose your item to swap
      </Text>

      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Picker
          selectedValue={selectedItemId}
          dropdownIconColor={theme.text}
          onValueChange={(itemValue) => setSelectedItemId(itemValue)}
          style={{
            color: theme.text,
            padding: 10,
          }}
        >
          {items.map((item) => (
            <Picker.Item key={item.id} label={item.title} value={item.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={onSendRequest}
        style={{
          marginTop: 20,
          backgroundColor: theme.tint,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Send Swap Request
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SwapActionSection;

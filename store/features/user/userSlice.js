import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
  displayName: null,
  photoURL: null,
  emailVerified: null,
  uid: null,
  items: [], // <-- new state for items ready to swap
  swapReqItems: [], // all th swap request you sent to other user
  availableForSwap: [], //list of all the item which you can swap
};

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      const { email, displayName, photoURL, emailVerified, uid } = action.payload;
      state.email = email;
      state.displayName = displayName;
      state.photoURL = photoURL;
      state.emailVerified = emailVerified;
      state.uid = uid;
    },

    updateReduxProfile(state, action) {
      const { displayName, photoURL } = action.payload;
      if (displayName) state.displayName = displayName;
      if (photoURL) state.photoURL = photoURL;
    },

    // Add a single item to swapItems list
    addItem(state, action) {
      state.items.push(action.payload);
    },

    // Update an existing swap item by id
    updateItem(state, action) {

      // console.log("update swap item");
      
      const updatedItem = action.payload;
      const index = state.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedItem };
      }
    },

    // Remove an item by id
    removeItem(state, action) {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== idToRemove);
    },

    // Replace entire swapItems list
    setItems(state, action) {
      state.items = action.payload;
    },

    clearUser(state) {
      return initialState;
    },
    addSwapReqItem(state, action) {
      state.swapReqItems.push(action.payload);
    },

    // Update an existing swap item by id
    updateSwapReqItem(state, action) {

      // console.log("update swap item");
      
      const updatedItem = action.payload;
      const index = state.swapReqItems.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.swapReqItems[index] = { ...state.swapReqItems[index], ...updatedItem };
      }
    },

    // Remove an item by id
    removeSwapReqItem(state, action) {
      const idToRemove = action.payload;
      state.swapReqItems = state.swapReqItems.filter(item => item.id !== idToRemove);
    },

    // Replace entire swapItems list
    setSwapReqItems(state, action) {
      console.log(action.payload,"paylod");
      
      state.swapReqItems = action.payload;
    },

    addAvailableForSwap(state, action) {
      state.availableForSwap.push(action.payload);
    },

    // Update an existing swap item by id
    updateAvailableForSwap(state, action) {

      // console.log("update swap item");
      
      const updatedItem = action.payload;
      const index = state.availableForSwap.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.availableForSwap[index] = { ...state.availableForSwap[index], ...updatedItem };
      }
    },

    // Remove an item by id
    removeAvailableForSwap(state, action) {
      const idToRemove = action.payload;
      console.log(idToRemove,"idToRemove");
      
      state.availableForSwap = state.availableForSwap.filter(item => item.id !== idToRemove);
    },

    // Replace entire swapItems list
    setAvailableForSwap(state, action) {
      // console.log(action.payload,"paylod");
      
      state.availableForSwap = action.payload;
    },
  },
});

export const {
  setUserData,
  updateReduxProfile,
  clearUser,
  addItem,
  updateItem,
  removeItem,
  setItems,
  addSwapReqItem,
  updateSwapReqItem,
  removeSwapReqItem,
  setSwapReqItems,

  addAvailableForSwap,
  updateAvailableForSwap,
  removeAvailableForSwap,
  setAvailableForSwap,
} = authSlice.actions;

export default authSlice.reducer;

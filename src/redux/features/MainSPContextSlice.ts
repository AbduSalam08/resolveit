/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

const mainData = {
  value: [],
  currentUserDetails: {
    userName: "",
    role: "",
    email: "",
    id: "",
  },
};

const MainSPContext: any = createSlice({
  name: "MainSPContext",
  initialState: mainData,
  reducers: {
    setMainSPContext: (state, action) => {
      state.value = action?.payload;
    },
    setCurrentUserDetails: (state, payload) => {
      state.currentUserDetails = payload.payload;
    },
  },
});

export const { setMainSPContext, setCurrentUserDetails } =
  MainSPContext.actions;
export default MainSPContext.reducer;

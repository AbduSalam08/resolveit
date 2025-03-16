/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from "@reduxjs/toolkit";
import MainSPContext from "../features/MainSPContextSlice";

const store: any = configureStore({
  reducer: {
    MainSPContext: MainSPContext,
  },
});

export { store };

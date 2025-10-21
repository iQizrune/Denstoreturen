import React from "react";
import { Stack } from "expo-router";
import DevHub from "../components/dev/DevHub";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {__DEV__ && <DevHub />}
    </>
  );
}

import React from "react";
import { Drawer } from "expo-router/drawer";

export default function HomeLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ title: "Home" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      <Drawer.Screen name="signup" options={{ title: "Sign Up" }} />
      <Drawer.Screen name="playlist" options={{ title: "Playlist" }} />
    </Drawer>
  );
}

import { Drawer } from "expo-router/drawer";
import React from "react";

export default function HomeLayout() {
  return (
      <Drawer
        screenOptions={{
          swipeEnabled: true,
          swipeEdgeWidth: 50,
          swipeMinDistance: 20,
          drawerActiveBackgroundColor: "#222",
          drawerActiveTintColor: "#ffffffff",
          drawerInactiveTintColor: "#fff",
          drawerStyle: { backgroundColor: "#2c2c2cff" },
          headerStyle: {
            backgroundColor: "#000",
            borderBottomWidth: 1,
            borderBottomColor: "#707070",
          },
          headerTintColor: "#fff",
        }}
      >
        <Drawer.Screen
          name="profile"
          options={{
            title: "Profile",
            drawerLabelStyle: { fontSize: 20, fontWeight: "bold" },
            drawerItemStyle: { paddingBottom: 15 },
          }}
        />
        <Drawer.Screen name="home" options={{ title: "Home" }} />
        <Drawer.Screen name="playlist" options={{ title: "Playlist" }} />
        <Drawer.Screen name="settings" options={{ title: "Settings" }} />
        <Drawer.Screen name="signup" options={{ title: "Sign Up" }} />
        <Drawer.Screen
          name="playlistDetail"
          options={{
            drawerItemStyle: { display: 'none' }, title: "Playlist Detail" // hides this item from the drawer list
          }}
        />
        <Drawer.Screen
          name="[id]" // if this is actually the route name you see
          options={{ drawerItemStyle: { display: 'none' } }}
        />
      </Drawer>
  );
}

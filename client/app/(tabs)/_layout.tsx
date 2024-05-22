import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Map from "./map";
import Lists from "./lists";
import Settings from "./settings";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Octicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const MyTabs = () => {
    const { onLogout } = useAuth();
    
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "black",
                tabBarInactiveTintColor: "gray",
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Octicons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={Map}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Feather name="map" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="My Lists"
                component={Lists}
                options={{
                    headerShown: true,
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="list" size={28} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    headerRight: () => (
                        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                            <Text>Logout</Text>
                        </TouchableOpacity>
                    ),
                    tabBarIcon: ({ color }) => (
                        <Feather name="settings" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}


const styles = StyleSheet.create({
    logoutButton: {
        marginRight: 10,
        padding: 8,
    },
});

export default MyTabs;

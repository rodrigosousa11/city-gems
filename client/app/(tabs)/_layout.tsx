import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Map from "./map";
import Lists from "./lists";
import Settings from "./settings";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { api, API_URL, useAuth } from "../context/AuthContext";
import { Octicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const MyTabs = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { onLogout } = useAuth();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                console.log("Fetching user details...");
                const response = await api.get(`${API_URL}/user/me`);
                console.log("API response:", response.data);
                const user = response.data.user;
                setIsAdmin(user.role === 'admin');
                console.log("User role is admin:", user.role === 'admin');
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserDetails();
    }, []);
    
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
            {!isAdmin && (
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
            )}
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

import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./index";
import Map from "./map";
import Lists from "./lists";
import Settings from "./settings";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Octicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, api } from "../context/AuthContext";
import * as FileSystem from 'expo-file-system';

import { POI } from '../screens/Poi'; 

const Tab = createBottomTabNavigator();

const MyTabs = () => {
    const { onLogout } = useAuth();
    const [pois, setPois] = useState<POI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        preFetchImages();
    }, []);

    const preFetchImages = async () => {
        try {
            const response = await api.get(`${API_URL}/poi/all`);
            const fetchedPois = response.data;
            await downloadAndSaveImages(fetchedPois);
            setPois(fetchedPois);
        } catch (error) {
            console.error("Error fetching POIs:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const downloadAndSaveImages = async (pois: POI[]) => { // Ensure pois is typed correctly
        const downloadedImages = await Promise.all(
            pois.map(async (poi) => {
                const downloadedImageFileUris = await Promise.all(
                    poi.images.map(async (imageUrl: string) => { // Assume imageUrl is a string
                        const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                        const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
                        const exist = await FileSystem.getInfoAsync(destinationUri);
                        if (!exist.exists) {
                            const downloadResult = await FileSystem.downloadAsync(
                                imageUrl,
                                destinationUri
                            );
                            return downloadResult.uri;
                        }
                        return destinationUri;
                    })
                );
                return downloadedImageFileUris;
            })
        );
        console.log("Downloaded images:", downloadedImages);
        return downloadedImages;
    };

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "black",
                tabBarInactiveTintColor: "gray",
            }}
        >
            <Tab.Screen
                name="Home"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Octicons name="home" size={24} color={color} />
                    ),
                }}
            >
                {(props) => <Home {...props} pois={pois} loading={loading} />} 
            </Tab.Screen>

            <Tab.Screen
                name="Map"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Feather name="map" size={24} color={color} />
                    ),
                }}
            >
                {(props) => <Map {...props} pois={pois} />} 
            </Tab.Screen>
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

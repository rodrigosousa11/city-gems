import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./index";
import Map from "./map";
import Lists from "./lists";
import Settings from "./settings";
import { Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Octicons } from "@expo/vector-icons";
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MyTabs() {
    const { onLogout } = useAuth();

    return (
        <Tab.Navigator
            screenOptions={{ 
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray'
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{ 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Octicons name="home" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Map"
                component={Map}
                options={{ 
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Feather name="map" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Lists"
                component={Lists}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />
                }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    headerRight: () => (
                        <Button onPress={onLogout} title="Logout" />
                    ),
                    tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />
                    
                }}
            />
        </Tab.Navigator>
    );
}

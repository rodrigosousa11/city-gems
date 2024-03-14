import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabOneScreen from "./index";
import TabTwoScreen from "./two";
import Settings from "./settings";
import { Button } from "react-native";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

export default function MyTabs() {
    const { onLogout } = useAuth();

    return (
        <Tab.Navigator>
            <Tab.Screen
                name="1"
                component={TabOneScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name="2"
                component={TabTwoScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    headerRight: () => (
                        <Button
                            onPress={onLogout}
                            title="Logout"
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

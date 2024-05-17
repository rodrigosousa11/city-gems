import { AuthProvider, useAuth } from "./app/context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./app/screens/Login";
import Register from "./app/screens/Register";
import Index from "./app/screens/Index";
import POIDetails, { POI } from "./app/screens/Poi";
import MyTabs from "./app/(tabs)/_layout";
import List from "./app/screens/List";
import MostVisitedLocations from "./app/components/MostVisitedLocations";
import NearbyLocations from "./app/components/NearbyLocations";

type RootStackParamList = {
    MyTabs: undefined;
    POIDetails: {
        poi: POI;
    };
    Index: undefined;
    Login: undefined;
    Register: undefined;
    List: { name: string } | undefined;
    MostVisitedLocations: undefined; // Added MostVisitedLocations
    NearbyLocations: undefined; // Added NearbyLocations
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <AuthProvider>
            <Layout />
        </AuthProvider>
    );
}

export const Layout = () => {
    const { authState } = useAuth();
    
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerBackTitleVisible: false, 
                }}
            >
                {authState?.authenticated ? (
                    <>
                        <Stack.Screen
                            name="MyTabs"
                            component={MyTabs}
                            options={{ 
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen 
                            name="POIDetails" 
                            component={POIDetails} 
                            options={({ route }) => ({ 
                                title: route.params?.poi.name || 'POI Details' 
                            })}
                        />
                        <Stack.Screen 
                            name="List" 
                            component={List} 
                            options={({ route }) => ({ 
                                title: route.params?.name || 'My list' 
                            })}
                        />
                        <Stack.Screen 
                            name="MostVisitedLocations" 
                            component={MostVisitedLocations} 
                        />
                        <Stack.Screen 
                            name="NearbyLocations" 
                            component={NearbyLocations} 
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

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
import PasswordRecovery from "./app/screens/PasswordRecovery";
import VerifyCodeScreen from "./app/screens/VerifyCodeScreen"; 

export type RootStackParamList = {
    MyTabs: undefined;
    POIDetails: {
        poi: POI;
    };
    Index: undefined;
    Login: undefined;
    Register: undefined;
    List: { name: string } | undefined;
    MostVisitedLocations: {
        pois: POI[];
    };
    NearbyLocations: {
        pois: POI[];
    };
    PasswordRecovery: undefined;
    ResetPassword: { token: string };
    VerifyCode: { email: string };
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
                    headerTintColor: 'black',
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
                            options={{
                                title: "Most Visited Locations"
                            }}
                        />
                        <Stack.Screen 
                            name="NearbyLocations" 
                            component={NearbyLocations} 
                            options={{
                                title: "Nearby Locations"
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                        <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} options={{ headerShown: false }} />
                        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

import { AuthProvider, useAuth } from "./app/context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./app/screens/Login";
import Register from "./app/screens/Register";
import Index from "./app/screens/Index";
import MyTabs from "./app/(tabs)/_layout";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <Layout></Layout>
        </AuthProvider>
    );
}

export const Layout = () => {
    const { authState } = useAuth();
    
    return (
        <NavigationContainer>
            <Stack.Navigator>
                {authState?.authenticated ? (
                    <Stack.Screen
                        name="MyTabs"
                        component={MyTabs}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

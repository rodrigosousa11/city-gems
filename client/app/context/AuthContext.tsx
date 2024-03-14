import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from 'jwt-decode';


interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onRegister?: (firstName: string, lastName: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'token';
export const API_URL = 'http://localhost:3000';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const [authState, setAuthState] = useState<{ 
        token: string | null; 
        authenticated: boolean | null 
    }>({
        token: null,
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('stored:', token);

            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                setAuthState({ 
                    token: token, 
                    authenticated: true 
                });
            }
        };

        const checkTokenExpiration = async () => {
            const token = authState.token;
            if (token) {
                const decodedToken: any = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
                if (decodedToken.exp < currentTime + 60) { // Check if token is about to expire within 60 seconds
                    try {
                        const response = await axios.post(`${API_URL}/auth/refreshToken`, {
                            token: authState.token,
                        });
                        const newAccessToken = response.data.accessToken;
                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        setAuthState(prevState => ({
                            ...prevState,
                            token: newAccessToken,
                        }));
                        await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
                        

                        console.log('refreshed:', newAccessToken);
                    } catch (error) {
                        console.error("Failed to refresh token:", error);
                        // Handle token refresh failure here
                    }
                }
            }
        };

        const tokenInterval = setInterval(() => {
            checkTokenExpiration();
        }, 60000); // Check token expiration every minute

        loadToken();

        return () => clearInterval(tokenInterval); // Cleanup interval on unmount
    }, [authState.token]); // Include authState.token in dependency array

    // Rest of the code remains unchanged

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                firstName,
                lastName,
                email,
                password,
            });
            return response.data;
        } catch (error) {
            return {error: true, message: (error as any).response.data.message};
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            setAuthState({
                token: response.data.refreshToken,
                authenticated: true,
            });

            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.refreshToken}`;

            await SecureStore.setItemAsync(TOKEN_KEY, response.data.accessToken);

            console.log('refresh:', response.data.refreshToken);

            return response;
        } catch (error) {
            return {error: true, message: (error as any).response.data.message};
        }
    };

    const logout = async () => {
        const refreshToken = authState.token;
        
        try {
            const response = await axios.delete(`${API_URL}/auth/logout`, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            });
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            axios.defaults.headers.common['Authorization'] = '';
            setAuthState({
                token: null,
                authenticated: false,
            });
            return response.data;
        } catch (error) {
            return { error: true, message: (error as any).response.data.message };
        }
    };
    
    const value = {
        onRegister: register,  
        onLogin: login, 
        onLogout: logout,
        authState,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

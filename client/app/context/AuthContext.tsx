import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onRegister?: (firstName: string, lastName: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
export const API_URL = 'http://localhost:3000';
export const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const api = axios.create({
    baseURL: API_URL,
});

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
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthState({ 
                    token: token, 
                    authenticated: true 
                });
            }
        };

        loadToken();
    }, []);


    api.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
                originalRequest._retry = true;
                const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY); // Get refresh token from SecureStore
                try {
                    // Make a request to the refresh token endpoint
                    const response = await axios.post(`${API_URL}/auth/token`, { token: refreshToken });
                    const newAccessToken = response.data.accessToken;
                    
                    console.log('New access token:', newAccessToken); // Log the new access token

                    // Store the new access token in SecureStore
                    await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
    
                    // Set the Authorization header for the instance
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    
                    // Retry the original request
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (err) {
                    console.error(err);
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);
        }
    );

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            const response = await api.post(`${API_URL}/auth/register`, {
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
            const response = await api.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            
            setAuthState({
                token: response.data.accessToken,
                authenticated: true,
            });
            
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            
            await SecureStore.setItemAsync(TOKEN_KEY, response.data.accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refreshToken);
            
    
            console.log('refresh:', response.data.refreshToken);
            console.log('access:', response.data.accessToken);
    
            return response;
        } catch (error) {
            return {error: true, message: (error as any).response.data.message};
        }
    };

    const logout = async () => {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        try {
            // Make a request to the logout endpoint
            await api.delete('/auth/logout', { data: { token: refreshToken } });
    
            // Delete the tokens from SecureStore and reset the Authorization header
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            api.defaults.headers.common['Authorization'] = '';
            setAuthState({
                token: null,
                authenticated: false,
            });
            console.log('Logged out');
        } catch (error) {
            console.error('Failed to log out:', error);
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

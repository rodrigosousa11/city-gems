import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AxiosError } from "axios";
import { API_URL, api } from "../context/AuthContext";

export default function Settings() {
    const [userData, setUserData] = useState({ firstName: "", lastName: "" });

    useEffect(() => {
        api.get(`${API_URL}/auth/me`)
            .then(response => {
                const { firstName, lastName } = response.data;
                setUserData({ firstName, lastName });
            })
            .catch((error: AxiosError) => {
                if (error.isAxiosError && !error.response) {
                    console.error("Network Error:", error.message);
                } else {
                    console.error("Error fetching user data:", error);
                }
            });
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text>{userData.firstName} {userData.lastName}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    }
});
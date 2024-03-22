import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { AxiosError } from "axios";
import { API_URL, api } from "../context/AuthContext";

export default function Settings() {
    const [userData, setUserData] = useState({ firstName: "", lastName: "", role: "" });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    useEffect(() => {
        api.get(`${API_URL}/user/me`)
            .then(response => {
                const { firstName, lastName, role } = response.data;
                setUserData({ firstName, lastName, role });
            })
            .catch((error: AxiosError) => {
                if (error.isAxiosError && !error.response) {
                    console.error("Network Error:", error.message);
                } else {
                    console.error("Error fetching user data:", error);
                }
            });
    }, []);

    const createPOI = () => {
        api.post(`${API_URL}/poi/new`, {
            name,
            description,
            latitude,
            longitude
        })
        .then(response => {
            console.log("POI created:", response.data);
            setName("");
            setDescription("");
            setLatitude("");
            setLongitude("");
        })
        .catch(error => {
            console.error("Error creating POI:", error);
        });
    };

    const renderAddPOIForm = () => {
        if (userData.role === "admin") {
            return (
                <View style={styles.formContainer}>
                    <Text style={styles.formLabel}>Add POI Form</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={(text) => setName(text)}
                        value={name}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        onChangeText={(text) => setDescription(text)}
                        value={description}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Latitude"
                        onChangeText={(text) => setLatitude(text)}
                        value={latitude}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Longitude"
                        onChangeText={(text) => setLongitude(text)}
                        value={longitude}
                    />
                    <Button title="Create POI" onPress={createPOI} />
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{userData.firstName} {userData.lastName} {userData.role}</Text>
            {renderAddPOIForm()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    formContainer: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
});

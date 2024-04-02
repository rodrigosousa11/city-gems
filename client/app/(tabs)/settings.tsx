import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image } from "react-native";
import { AxiosError } from "axios";
import { API_URL, api } from "../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";

export default function Settings() {
    const [userData, setUserData] = useState({ firstName: "", lastName: "", role: "" });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [images, setImages] = useState<Array<{ uri: string, url: string }>>([]);

    useEffect(() => {
        // Fetch user data on component mount
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

    const pickImage = async () => {
        // Pick an image from the gallery
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        if (!result.canceled && result.assets) {
            try {
                const uri = result.assets[0].uri;
                setImages(prevImages => [...prevImages, { uri, url: '' }]);
            } catch (error) {
                console.error("Error picking image:", error);
            }
        }
    };

    const uploadImagesToFirebase = async () => {
        try {
            const urls = await Promise.all(images.map(async (image) => {
                const imageRef = ref(storage, 'images/' + Math.random().toString(36).substring(7));
                const response = await fetch(image.uri);
                const blob = await response.blob();
                const snapshot = await uploadBytesResumable(imageRef, blob);
                const downloadURL = await getDownloadURL(snapshot.ref);
                return downloadURL;
            }));
            return urls;
        } catch (error) {
            console.error("Error uploading images to Firebase:", error);
            return [];
        }
    };
    
    const createPOI = async () => {
        const imageUrls = await uploadImagesToFirebase();
    
        try {
            const response = await api.post(`${API_URL}/poi/new`, {
                name,
                description,
                latitude,
                longitude,
                images: imageUrls 
            });
            console.log("POI created:", response.data);
            setName("");
            setDescription("");
            setLatitude("");
            setLongitude("");
            setImages([]);
        } catch (error) {
            console.error("Error creating POI:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{userData.firstName} {userData.lastName} {userData.role}</Text>
            {userData.role === "admin" && (
                <View style={styles.formContainer}>
                    <Text style={styles.formLabel}>Add a POI</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={(text) => setName(text)}
                        value={name}
                        autoCapitalize="none" />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        onChangeText={(text) => setDescription(text)}
                        value={description}
                        autoCapitalize="none" />
                    <TextInput
                        style={styles.input}
                        placeholder="Latitude"
                        onChangeText={(text) => setLatitude(text)}
                        value={latitude}
                        autoCapitalize="none" />
                    <TextInput
                        style={styles.input}
                        placeholder="Longitude"
                        onChangeText={(text) => setLongitude(text)}
                        value={longitude}
                        autoCapitalize="none" />
                    <Button title="Pick images from gallery" onPress={pickImage} />
                    <ScrollView horizontal>
                        {images.map((image, index) => (
                            <Image key={index} source={{ uri: image.uri }} style={styles.image} />
                        ))}
                    </ScrollView>
                    <Button title="Create POI" onPress={createPOI} />
                </View>
            )}
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
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
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

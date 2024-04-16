import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image, Modal, ActivityIndicator } from "react-native";
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
    const [showLoading, setShowLoading] = useState(false);

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
            const uploadPromises = images.map(async (image) => {
                const imageRef = ref(storage, 'images/' + Math.random().toString(36).substring(7));
                const response = await fetch(image.uri);
                const blob = await response.blob();
                const uploadTask = uploadBytesResumable(imageRef, blob);

                // Return a promise that resolves with the download URL after upload is complete
                return new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        () => {},
                        (error) => {
                            console.error("Error uploading image:", error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            });
    
            // Wait for all uploads to complete and obtain the URLs
            const imageUrls = await Promise.all(uploadPromises);
            return imageUrls.filter(url => url); // Filter out any null URLs
        } catch (error) {
            console.error("Error uploading images to Firebase:", error);
            return [];
        }
    };
    
    
    const createPOI = async () => {
        setShowLoading(true);
        const imageUrls = await uploadImagesToFirebase();
        setShowLoading(false);
    
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
            <Text style={styles.title}>{userData.firstName} {userData.lastName} - {userData.role}</Text>
            {userData.role === "Admin" && (
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
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLoading}
                onRequestClose={() => setShowLoading(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#000000" />
                    </View>
                </View>
            </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
    },
});

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image, Modal, ActivityIndicator, Alert } from "react-native";
import { AxiosError } from "axios";
import { API_URL, api } from "../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import * as ImageManipulator from 'expo-image-manipulator';

export default function Settings() {
    const [userData, setUserData] = useState({ firstName: "", lastName: "", email: "", role: "" });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [images, setImages] = useState<Array<{ uri: string, url: string }>>([]);
    const [showLoading, setShowLoading] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState("");
    const [editedLastName, setEditedLastName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    useEffect(() => {
        api.get(`${API_URL}/user/me`)
            .then(response => {
                const { user: { firstName, lastName, email, isAdmin } } = response.data;
                const role = isAdmin ? "Admin" : "User";
                setUserData({ firstName, lastName, email, role });
                setEditedFirstName(firstName);
                setEditedLastName(lastName);
                setEditedEmail(email);
            })
            .catch((error: AxiosError) => {
                if (error.isAxiosError && !error.response) {
                    console.error("Network Error:", error.message);
                } else {
                    console.error("Error fetching user data:", error);
                }
            });
    }, []);

    const updateUserDetails = async () => {
        try {
            if (!passwordsMatch()) {
                return;
            }

            const userDataToUpdate = {
                firstName: editedFirstName,
                lastName: editedLastName,
                email: editedEmail,
                currentPassword,
                newPassword
            };
            const response = await api.put(`${API_URL}/user/details`, userDataToUpdate);
            console.log("User details updated:", response.data);
            setUserData({ ...userData, firstName: editedFirstName, lastName: editedLastName, email: editedEmail });
            setCurrentPassword(""); // Clear current password field
            setNewPassword(""); // Clear new password field
            setConfirmPassword(""); // Clear confirm password field
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        if (!result.canceled && result.assets) {
            try {
                const uri = result.assets[0].uri;
                const compressedImage = await compressImage(uri);
                setImages(prevImages => [...prevImages, { uri: compressedImage.uri, url: '' }]);
            } catch (error) {
                console.error("Error picking image:", error);
            }
        }
    };
    
    const compressImage = async (uri: string) => {
        const compressedImage = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.1 });
        return compressedImage;
    };
    
    const uploadImagesToFirebase = async () => {    
        try {
            const uploadPromises = images.map(async (image) => {
                const imageRef = ref(storage, 'images/' + Math.random().toString(36).substring(7));
                const response = await fetch(image.uri);
                const blob = await response.blob();
                const uploadTask = uploadBytesResumable(imageRef, blob);
    
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
    
            const imageUrls = await Promise.all(uploadPromises);
            return imageUrls.filter(url => url);
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
    
    // Function to validate if passwords match
    const passwordsMatch = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Passwords do not match");
            return false;
        }
        return true;
    };

    const togglePasswordEditing = () => {
        setIsEditingPassword(!isEditingPassword);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Account Details</Text>
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    onChangeText={(text) => setEditedFirstName(text)}
                    value={editedFirstName}
                    autoCapitalize="none" />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    onChangeText={(text) => setEditedLastName(text)}
                    value={editedLastName}
                    autoCapitalize="none" />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={(text) => setEditedEmail(text)}
                    value={editedEmail}
                    autoCapitalize="none" />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="********"
                        value="********"
                        secureTextEntry={true}
                        editable={false}
                    />
                    <Button title="Edit" onPress={togglePasswordEditing} />
                </View>
                {isEditingPassword && (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            onChangeText={(text) => setCurrentPassword(text)}
                            value={currentPassword}
                            secureTextEntry={true}
                            autoCapitalize="none" />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            onChangeText={(text) => setNewPassword(text)}
                            value={newPassword}
                            secureTextEntry={true}
                            autoCapitalize="none" />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            onChangeText={(text) => setConfirmPassword(text)}
                            value={confirmPassword}
                            secureTextEntry={true}
                            autoCapitalize="none" />
                    </View>
                )}
                <Button title="Update User Details" onPress={updateUserDetails} />
                {userData.role === "Admin" && (
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Add a POI</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            onChangeText={(text) => setName(text)}
                            value={name}
                            autoCapitalize="none" />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Description"
                            onChangeText={(text) => setDescription(text)}
                            value={description}
                            autoCapitalize="none"
                            multiline={true}
                            numberOfLines={6}
                        />
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    data: {
        fontSize: 18,
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
    input: {
        borderWidth: 1,
        borderColor: "#7d7d7d",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        textAlignVertical: 'top',
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: "#7d7d7d",
        borderRadius: 5,
        padding: 10,
        height: 140,
        marginBottom: 10,
        textAlignVertical: 'top', 
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    passwordInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#7d7d7d",
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
});

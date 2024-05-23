import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Image, Modal, ActivityIndicator, Alert } from "react-native";
import { AxiosError } from "axios";
import { API_URL, api } from "../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from "../context/AuthContext";

export default function Settings({ navigation }: { navigation: any }) {
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
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isAnyFieldEdited, setIsAnyFieldEdited] = useState(false);
    const [emailToUpdateRole, setEmailToUpdateRole] = useState("");
    const [emailToDelete, setEmailToDelete] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const { onLogout } = useAuth();
    
    useEffect(() => {
        api.get(`${API_URL}/user/me`)
            .then(response => {
                const { user: { firstName, lastName, email, role } } = response.data;
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

    useEffect(() => {
        const isEdited = 
            Boolean(editedFirstName && editedFirstName !== userData.firstName) ||
            Boolean(editedLastName && editedLastName !== userData.lastName) ||
            Boolean(editedEmail && editedEmail !== userData.email) ||
            Boolean(isEditingPassword && (currentPassword || newPassword || confirmPassword));
    
        setIsAnyFieldEdited(isEdited);
    }, [editedFirstName, editedLastName, editedEmail, currentPassword, newPassword, confirmPassword, userData, isEditingPassword]);

    const updateUserDetails = async () => {
        try {
            if (!editedFirstName && !editedLastName && !editedEmail && !currentPassword && !newPassword && !confirmPassword) {
                Alert.alert("Error", "Please update at least one field.");
                return;
            }
    
            const isEditingPasswordFields = currentPassword || newPassword || confirmPassword;
    
            if (isEditingPasswordFields) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    Alert.alert("Error", "Please fill in all password fields.");
                    return;
                }
                if (!passwordsMatch()) {
                    return;
                }
            }
    
            const userDataToUpdate: any = {};
            if (editedFirstName) userDataToUpdate.firstName = editedFirstName;
            if (editedLastName) userDataToUpdate.lastName = editedLastName;
            if (editedEmail) userDataToUpdate.email = editedEmail;
            if (isEditingPasswordFields) {
                userDataToUpdate.currentPassword = currentPassword;
                userDataToUpdate.newPassword = newPassword;
            }
    
            const response = await api.put(`${API_URL}/user/details`, userDataToUpdate);
            console.log("User details updated:", response.data);
    
            setUserData(prevData => ({
                ...prevData,
                ...userDataToUpdate,
                firstName: editedFirstName || prevData.firstName,
                lastName: editedLastName || prevData.lastName,
                email: editedEmail || prevData.email,
            }));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsEditingPassword(false);
            setIsEditingDetails(false);
        } catch (error) {
            if ((error as any).response?.status === 401) {
                Alert.alert("Incorrect current password.");
                return;
            }

            console.error("Error updating user details:", error);
            Alert.alert("Failed to update user details. Please try again later.");
        }
    };
    
    const updateUserRole = async () => {
        try {
            if (!emailToUpdateRole) {
                Alert.alert("Please enter the email of the user to update role.");
                return;
            }

            const response = await api.put(`${API_URL}/user/role`, { email: emailToUpdateRole });
            console.log("User role updated:", response.data);
            Alert.alert("User role updated successfully");
        } catch (error) {
            console.error("Error updating user role:", error);
            Alert.alert("Failed to update user role. Please try again later.");
        }
    };

    const deleteOwnAccount = async () => {
        if (!deletePassword) {
            Alert.alert("Please enter your password to delete your account.");
            return;
        }

        if (!onLogout) {
            console.error("Logout function is not defined");
            return;
        }

        try {
            await onLogout();
            const response = await api.delete(`${API_URL}/user/delete`, { data: { email: userData.email, password: deletePassword } });
            console.log("Own account deleted:", response.data);
            Alert.alert("Account deleted successfully");
        } catch (error) {
            if ((error as any).response?.status === 401) {
                Alert.alert("Incorrect password.");
                return;
            }
            console.error("Error deleting own account:", error);
            Alert.alert("Failed to delete account. Please try again later.");
        }
    };

    const deleteUserAccount = async () => {
        try {
            if (!emailToDelete) {
                Alert.alert("Please enter the email of the user to delete.");
                return;
            }

            const response = await api.delete(`${API_URL}/user/delete`, { data: { email: emailToDelete } });
            console.log("User account deleted:", response.data);
            Alert.alert("User account deleted successfully");
        } catch (error) {
            console.error("Error deleting user account:", error);
            Alert.alert("Failed to delete user account. Please try again later.");
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
                        () => { },
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
        if (!name || !description || !latitude || !longitude) {
            Alert.alert("Please fill in all POI fields.");
            return;
        }

        setShowLoading(true);
        const imageUrls = await uploadImagesToFirebase();
        setShowLoading(false);

        try {
            const response = await api.post(`${API_URL}/poi/new`, {
                name, description, latitude, longitude,
                images: imageUrls
            });

            console.log("POI created:", response.data);
            Alert.alert("POI created successfully");
            setName("");
            setDescription("");
            setLatitude("");
            setLongitude("");
            setImages([]);
        } catch (error) {
            console.error("Error creating POI:", error);
        }
    };

    const passwordsMatch = (): boolean => {
        if (newPassword !== confirmPassword) {
            Alert.alert("New passwords do not match.");
            return false;
        }
        return true;
    };

    const startEditingPassword = () => {
        setIsEditingPassword(true);
        setIsEditingDetails(false);
    };

    const startEditingDetails = () => {
        setIsEditingDetails(true);
        setIsEditingPassword(false);
    };

    const cancelEditing = () => {
        setIsEditingPassword(false);
        setIsEditingDetails(false);
        setEditedFirstName(userData.firstName);
        setEditedLastName(userData.lastName);
        setEditedEmail(userData.email);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const renderInputField = (label: string, value: string, onChangeText: (text: string) => void, editable = true, secureTextEntry = false) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, !editable && styles.disabledInput]}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileContainer}>
                <Text style={styles.title}>Profile Details</Text>
                {renderInputField("First Name", editedFirstName, setEditedFirstName, isEditingDetails)}
                {renderInputField("Last Name", editedLastName, setEditedLastName, isEditingDetails)}
                {renderInputField("Email", editedEmail, setEditedEmail, isEditingDetails)}
                {isEditingPassword && (
                    <>
                        {renderInputField("Current Password", currentPassword, setCurrentPassword, true, true)}
                        {renderInputField("New Password", newPassword, setNewPassword, true, true)}
                        {renderInputField("Confirm New Password", confirmPassword, setConfirmPassword, true, true)}
                    </>
                )}
                <View style={styles.buttonContainer}>
                    {!isEditingDetails && !isEditingPassword ? (
                        <>
                            <Button title="Edit Details" onPress={startEditingDetails} color="#B68B38" />
                            <Button title="Change Password" onPress={startEditingPassword} color="#B68B38" />
                        </>
                    ) : (
                        <>
                            <Button title="Save Changes" onPress={updateUserDetails} disabled={!isAnyFieldEdited} color="#B68B38" />
                            <Button title="Cancel" onPress={cancelEditing} color="#a32743" />
                        </>
                    )}
                </View>
            </View>

            {userData.role === "admin" && (
                <>
                    <View style={styles.roleUpdateContainer}>
                        <Text style={styles.title}>Update User Role</Text>
                        {renderInputField("Email", emailToUpdateRole, setEmailToUpdateRole)}
                        <Button title="Update Role" onPress={updateUserRole} color="#B68B38" />
                    </View>

                    <View style={styles.deleteAccountContainer}>
                        <Text style={styles.title}>Delete User Account</Text>
                        {renderInputField("Email", emailToDelete, setEmailToDelete)}
                        <Button title="Delete Account" onPress={deleteUserAccount} color="#a32743" />
                    </View>

                    <View style={styles.poiContainer}>
                        <Text style={styles.title}>Create POI</Text>
                        {renderInputField("Name", name, setName)}
                        <TextInput
                            style={[styles.input, styles.description]}
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            numberOfLines={5}
                        />
                        {renderInputField("Latitude", latitude, setLatitude, true)}
                        {renderInputField("Longitude", longitude, setLongitude, true)}
                        <Button title="Pick Image" onPress={pickImage} color="#B68B38" />
                        {images.map((image, index) => (
                            <Image key={index} source={{ uri: image.uri }} style={styles.image} />
                        ))}
                        <Button title="Create POI" onPress={createPOI} color="#B68B38" />
                        {showLoading && <ActivityIndicator size="large" color="#0000ff" />}
                    </View>
                </>
            )}

            <View style={styles.deleteOwnAccount}>
                <Text style={styles.title}>Delete Own Account</Text>
                {renderInputField("Password", deletePassword, setDeletePassword, true, true)}
                <Button title="Delete My Account" onPress={deleteOwnAccount} color="#a32743" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    profileContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    inputContainer: {
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
    },
    description: {
        height: 200, 
        overflow: 'scroll',
        marginBottom: 24,
    },
    disabledInput: {
        backgroundColor: "#f5f5f5",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    roleUpdateContainer: {
        marginBottom: 24,
    },
    deleteAccountContainer: {
        marginBottom: 24,
    },
    deleteOwnAccount: {
        marginBottom: 74,
    },
    poiContainer: {
        marginBottom: 24,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 8,
    },
});

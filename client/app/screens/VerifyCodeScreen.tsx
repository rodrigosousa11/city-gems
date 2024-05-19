import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const VerifyCodeScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const { email } = route.params;
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleVerifyCode = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                email,
                code,
                newPassword,
            });
    
            if (response.status === 200) {
                Alert.alert('Success', 'Password has been reset successfully', [
                    {text: 'OK', onPress: () => navigation.navigate('Login')}
                ]);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to reset password');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.label}>Enter the verification code sent to your email and your new password</Text>
            <TextInput
                style={styles.input}
                onChangeText={setCode}
                value={code}
                placeholder="Verification Code"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                onChangeText={setNewPassword}
                value={newPassword}
                placeholder="New Password"
                secureTextEntry
            />
            <TouchableOpacity onPress={handleVerifyCode} style={styles.button}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 45,
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: '90%',
    },
    button: {
        width: "90%",
        borderRadius: 8,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1E232C",
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 19,
    },
    cancelButton: {
        width: "90%",
        borderRadius: 8,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#B68B38",
        marginBottom: 12,
    },
    cancelButtonText: {
        color: '#B68B38',
        fontSize: 19,
    },
});

export default VerifyCodeScreen;

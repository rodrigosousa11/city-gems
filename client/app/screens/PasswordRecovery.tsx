import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const PasswordRecovery = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');

    const handlePasswordReset = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            navigation.navigate('VerifyCode', { email });
        } catch (error) {
            alert('Failed to send verification code');
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.label}>Enter your email address to reset your password</Text>
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TouchableOpacity onPress={handlePasswordReset} style={styles.button}>
                <Text style={styles.buttonText}>Send Verification Code</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
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
        borderColor: "#B68B38", // You can change this color
        marginBottom: 12,
    },
    cancelButtonText: {
        color: '#B68B38',
        fontSize: 19,
    },
});

export default PasswordRecovery;

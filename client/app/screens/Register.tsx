import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from '@react-navigation/native';

const Register = ({ navigation }: { navigation: any }) => {
    const { onRegister } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleRegister = async () => {
        if (!validatePassword(password)) {
            setPasswordError("Password must contain at least 8 characters, including uppercase and lowercase letters, and at least one number or special character.");
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        const response = await onRegister!(firstName, lastName, email, password);
        if (response && response.error) {
            alert(response.message);
        } else {
            navigation.navigate('Login');
        }
    }

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9\W]).{8,}$/;
        return passwordRegex.test(password);
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordError('');
        setConfirmPasswordError('');
    }

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        setConfirmPasswordError('');
    }

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setEmailError('');
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Create an account.</Text>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setFirstName}
                    value={firstName}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={handleEmailChange}
                    value={email}
                    autoCapitalize="none"
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={handlePasswordChange}
                    value={password}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={handleConfirmPasswordChange}
                    value={confirmPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
                {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.linkText}>Have an account already? <Link to={{ screen: 'Login' }} style={styles.link}>Sign In</Link></Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    form: {
        width: '90%',
    },
    label: {
        fontSize: 18,
        color: '#333',
        marginBottom: 2,
        alignSelf: 'flex-start',
    },
    input: {
        height: 45,
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: '100%',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    button: {
        width: '100%',
        borderRadius: 8,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E232C',
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 19,
    },
    linkText: {
        fontSize: 16,
        textAlign: 'center',
    },
    link: {
        color: '#B68B38',
    },
    error: {
        color: 'red',
        marginBottom: 15,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
});

export default Register;

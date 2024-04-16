import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from '@react-navigation/native';

const Register = ({navigation}: {navigation: any}) => {
    const { onRegister } = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleRegister = async () => {
        const response = await onRegister!(firstName, lastName, email, password);
        if (response && response.error) {
            alert(response.message);
        } else {
            navigation.navigate('Login');
        }
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
                    autoCapitalize="none" />
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName} 
                    autoCapitalize="none" />
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email} 
                    autoCapitalize="none" />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true} 
                    autoCapitalize="none" />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <Text style={styles.linkText}>Have an account already? <Link to={{ screen: 'Login' }} style={styles.link}>Sign In</Link></Text>
                </View>
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
    },
    input: {
        height: 45,
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        width: "100%",
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
    linkText: {
        fontSize: 16,
    },
    link: {
        color: '#B68B38',
    },
});


export default Register;
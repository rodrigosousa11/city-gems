import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from '@react-navigation/native';

const Login = ({ navigation }: { navigation: any }) => {
    const { onLogin } = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [Error, setError] = useState('');

    const handleLogin = async () => {
        const response = await onLogin!(email, password);
        if (response && response.error) {
            setError(response.message + '!');
        } else {
            navigation.navigate('MyTabs');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Welcome back!</Text>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    autoCapitalize="none"
                    secureTextEntry={true}
                />
                {Error ? <Text style={styles.error}>{Error}</Text> : null}
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
                <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>
                        <Link to={{ screen: 'PasswordRecovery' }} style={styles.link}>Forgot your password?</Link>
                    </Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.linkText}>
                    Not a member? <Link to={{ screen: 'Register' }} style={styles.link}>Sign Up</Link>
                </Text>
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
    },
    input: {
        height: 45,
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: '100%',
    },
    link: {
        color: '#B68B38',
    },
    linkContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 5,
        paddingEnd: 5,
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
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    error: {
        color: 'red',
        marginBottom: 15,
    },
});

export default Login;

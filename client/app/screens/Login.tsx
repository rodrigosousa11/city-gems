import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from '@react-navigation/native';

const Login = ({navigation}: {navigation: any}) => {
    const { onLogin } = useAuth();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleLogin = async () => {
        const response = await onLogin!(email, password);
        if (response && response.error) {
            alert(response.message);
        } else {
            navigation.navigate('MyTabs');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <View style={styles.form}>
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
                    autoCapitalize="none" 
                    secureTextEntry={true} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Iniciar sessão</Text>
                    </TouchableOpacity>
                    <Text style={styles.linkText}>Não tens conta? <Link to={{ screen: 'Register' }} style={styles.link}>Regista-te</Link></Text>
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
        fontSize: 24,
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
    link: {
        color: '#B68B38',
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
});

export default Login;

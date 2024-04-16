import { View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
const logo = require('../../assets/logo.png');

const Index = ({navigation}: {navigation: any}) => {

    return (
        <View style={styles.container}>
            <Image
                source={logo} 
                style={styles.image}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    buttonContainer: {
        width: '90%',
        alignItems: 'center',
        marginTop: 60,
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
    registerButton: {
        width: "100%",
        borderRadius: 8,
        borderWidth: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        marginBottom: 12,
    },
    registerButtonText: {
        color: '#1E232C',
        fontSize: 19,
    },
    image: {
        width: 180,
        height: 180,
        marginBottom: 60,
    }
});

export default Index;

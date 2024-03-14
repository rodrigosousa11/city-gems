import { View, Text, Button, Image, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

const Initial = ({navigation}: {navigation: any}) => {

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'url_do_seu_logo' }} 
                style={{ width: 100, height: 100 }}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Iniciar sessão</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerButtonText}>Registo</Text>
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
});

export default Initial;

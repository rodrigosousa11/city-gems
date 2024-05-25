import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { API_URL, api } from '../context/AuthContext';

interface EditPoiModalProps {
    visible: boolean;
    onClose: () => void;
    poi: {
        _id: string;
        name: string;
        description: string;
        latitude: number;
        longitude: number;
    } | null;
    onPoiEdited: () => void;
}

const EditPoiModal: React.FC<EditPoiModalProps> = ({ visible, onClose, poi, onPoiEdited }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    useEffect(() => {
        if (poi) {
            setName(poi.name);
            setDescription(poi.description);
            setLatitude(poi.latitude?.toString() ?? '');
            setLongitude(poi.longitude?.toString() ?? '');
        }
    }, [poi]);

    const handleEditPoi = async () => {
        if (!poi) return;

        try {
            const response = await api.put(`${API_URL}/poi/update/${poi._id}`, {
                name,
                description,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            });

            if (response.data) {
                onPoiEdited();
                onClose();
            } else {
                throw new Error('Failed to get updated POI data from response.');
            }
        } catch (error) {
            console.error('Error updating POI:', error);
            Alert.alert('Error', 'Failed to update POI. Please try again later.');
        }
    };

    if (!poi) {
        return (
            <Modal visible={visible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Loading...</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit POI</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Name"
                    />
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description"
                        multiline={true}
                        numberOfLines={4}
                    />
                    <TextInput
                        style={styles.input}
                        value={latitude}
                        onChangeText={setLatitude}
                        placeholder="Latitude"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={longitude}
                        onChangeText={setLongitude}
                        placeholder="Longitude"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleEditPoi}>
                        <Text style={styles.buttonText}>Edit POI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
    },
    descriptionInput: {
        height: 250,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#262626',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    closeButton: {
        borderRadius: 10,  
        padding: 10,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#a32743',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    cancelButtonText: {
        color: '#a32743',
        fontSize: 16,
    },
});

export default EditPoiModal;

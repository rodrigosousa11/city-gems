import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { POI } from '../screens/Poi';
import { API_URL, api } from '../context/AuthContext';

interface AddToListModalProps {
    visible: boolean;
    onClose: () => void;
    poi: POI;
    existingLists: List[];
    refreshLists: () => void; 
}

interface List {
    _id: string;
    name: string;
}

const AddToListModal: React.FC<AddToListModalProps> = ({ visible, onClose, poi, existingLists, refreshLists }) => {
    const [newListName, setNewListName] = useState<string>('');

    const handleAddToList = async (listId: string) => {
        try {
            const response = await api.post(`${API_URL}/user/lists/${listId}`, { poiId: poi._id });
            if (response.data) {
                refreshLists();
            } else {
                console.error("No data returned from the server");
            }
            onClose();
        } catch (err) {
            const error = err as { response?: { status: number, data: { message: string } } };
            if (error.response && error.response.status === 400 && error.response.data.message === "POI already exists in the list") {
                Alert.alert("Error", "POI already exists in the list");
            } else {
                console.error("Error adding POI:", error);
            }
        }
    };

    const handleCreateAndAddToList = async () => {
        if (newListName.trim() !== '') {
            try {
                const response = await api.post(`${API_URL}/user/list`, { name: newListName });
                const newList = response.data;
                if (newList) {
                    await handleAddToList(newList._id);
                    setNewListName('');
                } else {
                    console.error("No data returned from the server");
                }
            } catch (error) {
                console.error("Error creating list:", error);
            }
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Select or Create a List</Text>
                    <ScrollView style={styles.listsContainer}>
                        {existingLists.map(list => (
                            <TouchableOpacity key={list._id} style={styles.listItem} onPress={() => handleAddToList(list._id)}>
                                <Text style={styles.listItemText}>{list.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter new list name"
                        value={newListName}
                        onChangeText={setNewListName}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleCreateAndAddToList}>
                        <Text style={styles.buttonText}>Create New List</Text>
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalText: {
        marginBottom: 15,
        fontSize: 21,
        fontWeight: 'bold',
    },
    listsContainer: {
        width: '100%',
        maxHeight: 150,
        marginBottom: 10,
    },
    listItem: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    listItemText: {
        fontSize: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        paddingLeft: 10,
        width: '100%',
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
        borderColor: '#B68B38',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    cancelButtonText: {
        color: '#B68B38',
        fontSize: 16,
    },
});

export default AddToListModal;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { POI } from '../screens/Poi';
import { API_URL, api } from '../context/AuthContext';

interface AddToListModalProps {
    visible: boolean;
    onClose: () => void;
    poi: POI;
    existingLists: List[];
    refreshLists: () => void; // Function to refresh the lists after an update
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
        } catch (error) {
            console.error("Error adding POI:", error);
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
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Select or Create a List</Text>
                    {existingLists.map(list => (
                        <TouchableOpacity key={list._id} onPress={() => handleAddToList(list._id)}>
                            <Text style={styles.listItem}>{list.name}</Text>
                        </TouchableOpacity>
                    ))}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter new list name"
                        value={newListName}
                        onChangeText={setNewListName}
                    />
                    <Button title="Create New List" onPress={handleCreateAndAddToList} />
                    <Button title="Close" onPress={onClose} />
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
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listItem: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
        width: '100%',
    },
});

export default AddToListModal;

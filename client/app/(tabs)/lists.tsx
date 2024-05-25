import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Button } from "react-native";
import { API_URL, api } from "../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export interface List {
    _id: string;
    name: string;
}

export default function Lists({ navigation }: { navigation: any }) {
    const [lists, setLists] = useState<List[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    const fetchLists = async () => {
        try {
            const response = await api.get(`${API_URL}/user/lists`);
            setLists(response.data);
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLists();
        }, [])
    );

    const renderItem = ({ item }: { item: List }) => (
        <TouchableOpacity onPress={() => handleListPress(item)}>
            <View style={styles.listItemContainer}>
                <Text style={styles.listItem}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteList(item._id)}>
                    <MaterialIcons name="delete-outline" size={28} color="#a32743" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const handleListPress = (selectedList: List) => {
        navigation.navigate('List', { 
            name: selectedList.name, 
            listId: selectedList._id 
        });
    };

    const handleDeleteList = async (listId: string) => {
        try {
            await api.delete(`${API_URL}/user/list/${listId}`);
            fetchLists(); 
        } catch (error) {
            console.error("Error deleting list:", error);
        }
    };
    
    const handleAddList = async () => {
        setModalVisible(true);
    };

    const addList = async () => {
        try {
            const response = await api.post(`${API_URL}/user/list`, { name: newListName });
            setModalVisible(false);
            setNewListName('');
            fetchLists(); 
        } catch (error) {
            console.error("Error creating list:", error);
        }
    };

    return (
        <View style={styles.container}>
            {lists.length === 0 ? (
                <View style={styles.noListsContainer}>
                    <Text style={styles.noListsText}>Tap the + button to add a new list.</Text>
                </View>
            ) : (
                <FlatList
                    data={lists}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
            )}
            <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
                <Ionicons name="add-circle-outline" size={60} color="#262626" />
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Enter List Name</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setNewListName}
                            value={newListName}
                            placeholder="(e.g. holiday)"
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#a32743"/>
                            <Button title="Add" onPress={addList} color="#B68B38" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    listItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    listItem: {
        fontSize: 19,
    },
    noListsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noListsText: {
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        height: 40,
        width: 290,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

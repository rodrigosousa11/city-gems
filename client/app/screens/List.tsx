import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { api, API_URL } from "../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

interface ListProps {
    route: any;
    navigation: any;
}

interface POI {
    _id: string;
    name: string;
}

const List: React.FC<ListProps> = ({ route, navigation }) => {
    const [pois, setPOIs] = useState<POI[]>([]);
    const [allPOIs, setAllPOIs] = useState<POI[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { listId } = route.params;

    useEffect(() => {
        fetchPOIs(listId);
        fetchAllPOIs();
    }, [listId]);

    const fetchPOIs = async (listId: string) => {
        try {
            const response = await api.get(`${API_URL}/user/lists/${listId}`);
            setPOIs(response.data);
        } catch (error) {
            console.error("Error fetching POIs:", error);
        }
    };

    const fetchAllPOIs = async () => {
        try {
            const response = await api.get(`${API_URL}/poi/all`);
            setAllPOIs(response.data);
        } catch (error) {
            console.error("Error fetching all POIs:", error);
        }
    };

    const handlePOIPress = (poi: POI) => {
        navigation.navigate('POIDetails', { poi });
    };

    const handleAddPOI = () => {
        setModalVisible(true);
    };

    const addPOI = async (poi: POI) => {
        try {
            const response = await api.post(`${API_URL}/user/lists/${listId}`, { poiId: poi._id });
            if (response.data) {
                setPOIs([...pois, poi]);
            } else {
                console.error("No data returned from the server");
            }
            setModalVisible(false);
        } catch (error) {
            console.error("Error adding POI:", error);
        }
    };

    const handleDeletePOI = async (poiId: string) => {
        try {
            await api.delete(`${API_URL}/user/lists/${listId}/${poiId}`);
            setPOIs(pois.filter(poi => poi._id !== poiId));
        } catch (error) {
            console.error("Error deleting POI:", error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredPOIs = allPOIs.filter(poi =>
        poi.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pois}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePOIPress(item)}>
                        <View style={styles.poiItemContainer}>
                            <Text style={styles.poiItem}>{item.name}</Text>
                            <TouchableOpacity onPress={() => handleDeletePOI(item._id)}>
                                <MaterialIcons name="delete-outline" size={28} color="black" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddPOI}>
                <Ionicons name="add-circle" size={60} color="#262626" />
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <TextInput
                                    style={styles.searchInput}
                                    onChangeText={handleSearch}
                                    placeholder="Search POIs"
                                />
                                <FlatList
                                    data={filteredPOIs}
                                    keyExtractor={item => item._id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => addPOI(item)}>
                                            <View style={styles.poiItemContainer}>
                                                <Text style={styles.poiItem}>{item.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    poiItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    poiItem: {
        fontSize: 18,
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
        width: '90%',
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default List;

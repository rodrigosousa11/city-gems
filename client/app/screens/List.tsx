import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Alert, Button } from 'react-native';
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
    location: string;
}

export interface List {
    _id: string;
    name: string;
    pois: POI[];
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
        } catch (err) {
            const error = err as { response?: { status: number, data: { message: string } } };
            if (error.response && error.response.status === 400) {
                Alert.alert("Error", error.response.data.message);
            } else {
                console.error("Error adding POI:", error);
            }
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
            {pois.length === 0 ? (
                <View style={styles.noPOIsContainer}>
                    <Text style={styles.noPOIsText}>Tap the + button to add a new POI.</Text>
                </View>
            ) : (
                <FlatList
                    data={pois}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePOIPress(item)}>
                            <View style={styles.poiItemContainer}>
                                <View>
                                    <Text style={styles.poiName}>{item.name}</Text>
                                    <View style={styles.locationContainer}>
                                        <Ionicons name="location" size={16} color="#555" style={styles.locationIcon} />
                                        <Text style={styles.locationText}>{item.location}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleDeletePOI(item._id)}>
                                    <MaterialIcons name="delete-outline" size={28} color="#a32743" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddPOI}>
                <Ionicons name="add-circle-outline" size={60} color="#262626" />
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
                                <Text style={styles.modalText}>Select or Create a List</Text>
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
                                            <View style={styles.poiModalItem}>
                                                <Text style={styles.poiItem}>{item.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )} 
                                />
                                <View style={styles.modalButtons}>
                                    <Button title="Cancel" onPress={() => setModalVisible(false)} color="#a32743"/>
                                </View>
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
    poiModalItem: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    poiName: {
        fontSize: 18,
        marginBottom: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        marginRight: 5,
    },
    locationText: {
        fontSize: 16,
        color: '#555',
    },
    poiItem: {
        fontSize: 18,
    },
    noPOIsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPOIsText: {
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    addButton: {
        position: 'absolute',
        bottom: 40,
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalText: {
        marginBottom: 15,
        fontSize: 21,
        fontWeight: 'bold',
    },
});

export default List;

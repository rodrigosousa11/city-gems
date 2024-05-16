import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Keyboard, TextInput, ScrollView } from "react-native";
import { API_URL, api } from '../context/AuthContext';
import { POI } from '../screens/Poi';
import SearchBar from '../components/SearchBar'; 

const Home = ({ navigation }: { navigation: any }) => {
    const [pois, setPois] = useState<POI[]>([]);
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef<TextInput>(null); 
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchPOIs = async () => {
            try {
                const response = await api.get(`${API_URL}/poi/all`);
                const fetchedPois = response.data;
                setPois(fetchedPois);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching POIs:", error);
                setLoading(false);
            }
        };

        fetchPOIs();
    }, []);

    const navigateToPoi = (poi: POI) => {
        navigation.navigate('POIDetails', { poi });
    };

    const handleOutsideClick = () => {
        setShowSuggestions(false); 
        Keyboard.dismiss();
    };

    const handleSearch = (query: string) => {
        // Handle the search query here
        // For example, you might filter the POIs based on the query
    };

    const renderPois = (poiList: POI[]) => (
        poiList.slice(0, 5).map((item, index) => (
            <TouchableOpacity key={index} onPress={() => navigateToPoi(item)}>
                <View style={styles.card}>
                    <Image
                        source={{ uri: item.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        ))
    );

    return (
        <SafeAreaView style={styles.container}>
            <SearchBar onSearch={handleSearch} inputRef={searchInputRef} />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#000000" />
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.heading}>Most Visited Locations</Text>
                            <TouchableOpacity onPress={() => console.log("Hello")}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {renderPois(pois)}
                        </ScrollView>

                        <View style={styles.section}>
                            <Text style={styles.heading}>Nearby Locations</Text>
                            <TouchableOpacity onPress={() => console.log("Hello")}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {renderPois(pois.filter(poi => poi.visits > 10))}
                        </ScrollView>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        marginTop: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        height: 270,
        width: 190,
        marginHorizontal: 5,
        marginBottom: 20,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    location: {
        fontSize: 14,
    },
    seeAll: {
        color: 'blue',
        fontWeight: 'bold',
    }
});

export default Home;

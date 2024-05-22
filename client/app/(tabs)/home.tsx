import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Keyboard,
    TextInput,
    ScrollView,
} from "react-native";
import * as Location from 'expo-location';
import { API_URL, api } from "../context/AuthContext";
import { POI } from "../screens/Poi";
import SearchBar from "../components/SearchBar";

const Home = ({ navigation }: { navigation: any }) => {
    const [pois, setPois] = useState<POI[]>([]);
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef<TextInput>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [poiSuggestions, setPOISuggestions] = useState<POI[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);

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

        const getUserLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
        };

        fetchPOIs();
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation && pois.length > 0) {
            const sortedPOIs = [...pois].map(poi => {
                const distance = getDistance(userLocation.coords.latitude, userLocation.coords.longitude, poi.latitude, poi.longitude);
                return { ...poi, distance };
            }).sort((a, b) => a.distance - b.distance);

            sortedPOIs.forEach(poi => {
                console.log(`POI: ${poi.name}, Distance: ${poi.distance.toFixed(2)} km`);
            });

            setNearbyPOIs(sortedPOIs);
        }
    }, [userLocation, pois]);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    }

    const navigateToPoi = (poi: POI) => {
        navigation.navigate("POIDetails", { poi });
    };

    const handleOutsideClick = () => {
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    const filterPOIs = (query: string) => {
        if (query === "") {
            setPOISuggestions(pois);
        } else {
            const filteredPOIs = pois.filter((poi) =>
                poi.name.toLowerCase().includes(query.toLowerCase())
            );
            setPOISuggestions(filteredPOIs);
        }
    };

    const handleSearchInputChange = (query: string) => {
        setSearchQuery(query);
        filterPOIs(query);
        setShowSuggestions(true);
        if (!query) {
            setShowSuggestions(false);
        }
    };

    const handlePOISuggestionPress = (poi: POI) => {
        setSearchQuery(poi.name);
        setShowSuggestions(false);
        navigateToPoi(poi);
    };

    const renderPOISuggestions = () => {
        return (
            <View style={styles.suggestionsContainer}>
                {poiSuggestions.map((poi) => (
                    <TouchableOpacity
                        key={poi._id}
                        style={styles.suggestionItem}
                        onPress={() => handlePOISuggestionPress(poi)}
                    >
                        <Text>{poi.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderPois = (poiList: POI[]) =>
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
        ));

    return (
        <SafeAreaView style={styles.containerWithoutMargin}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleOutsideClick}
                style={styles.container}
            >
                <SearchBar
                    onSearch={handleSearchInputChange}
                    inputRef={searchInputRef}
                />
                {showSuggestions && renderPOISuggestions()}
                <View style={styles.containerWithoutMargin}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#000000" />
                    ) : (
                        <>
                            <View style={styles.section}>
                                <Text style={styles.heading}>
                                    Most Visited Locations
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("MostVisitedLocations", { pois: pois.slice(0, 10) })}
                                >
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={{ marginBottom: -20 }}
                            >
                                {renderPois(pois)}
                            </ScrollView>

                            <View style={styles.section}>
                                <Text style={styles.heading}>
                                    Nearby Locations
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("NearbyLocations", { pois: nearbyPOIs })}
                                >
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                {renderPois(nearbyPOIs)}
                            </ScrollView>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 7,
    },
    containerWithoutMargin: {
        flex: 1,
    },
    section: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        paddingHorizontal: 8,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
        marginTop: 15,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 10,
        height: 290,
        width: 195,
        marginHorizontal: 7,
        marginBottom: 20,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    cardContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
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
        fontWeight: "bold",
        color: "#B68B38",
    },
    suggestionsContainer: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: "white",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
        zIndex: 1,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
});

export default Home;

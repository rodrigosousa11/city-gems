import React, { useRef, useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import { StyleSheet, View, SafeAreaView, TouchableWithoutFeedback, TouchableOpacity, Text, TextInput } from "react-native";
import { API_URL, api } from "../context/AuthContext";
import { POI } from "../screens/Poi";
import SearchBar from "../components/SearchBar";

const DEFAULT_REGION = {
    // Porto, Portugal
    latitude: 41.1496,
    longitude: -8.6109,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function Map({ navigation }: { navigation: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<null | { name: string; latitude: number; longitude: number; }>(null);
    const [poiSuggestions, setPOISuggestions] = useState<POI[]>([]);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [pois, setPois] = useState<POI[]>([]);
    const searchInputRef = useRef(null);
    const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPOIs = async () => {
            try {
                const response = await api.get(`${API_URL}/poi/all`);
                const fetchedPois = response.data;
                setPois(fetchedPois);
            } catch (error) {
                console.error("Error fetching POIs:", error);
            }
        };

        fetchPOIs();
    }, []);

    const handleOutsideClick = () => {
        setShowSuggestions(false);
        setSelectedPOIId(null); // Reset the selected POI ID
        if (searchInputRef.current) {
            (searchInputRef.current as TextInput).blur(); 
        }
    };

    const filterPOIs = (query: string) => {
        if (query === "") {
            setPOISuggestions(pois);
        } else {
            const filteredPOIs = pois.filter(poi =>
                poi.name.toLowerCase().includes(query.toLowerCase())
            );
            setPOISuggestions(filteredPOIs);
        }
    };

    const handleSearchInputChange = (query: string) => {
        setSearchQuery(query);
        filterPOIs(query);
        setShowSuggestions(true);
        setSelectedPOIId(null); // Clear the selected POI ID when search query changes
        if (!query) {
            setShowSuggestions(false);
        }
    };

    const handlePOISuggestionPress = (poi: POI) => {
        setSearchQuery(poi.name);
        setSearchResult(poi);
        setSelectedPOIId(poi._id); // Set the selected POI ID
        mapRef.current?.animateToRegion({
            latitude: poi.latitude,
            longitude: poi.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
        setShowSuggestions(false);
    };

    const renderPOISuggestions = () => {
        return (
            <View style={[styles.suggestionsContainer, { top: containerHeight + 120 }]}>
                {poiSuggestions.map(poi => (
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

    return (
        <TouchableWithoutFeedback onPress={handleOutsideClick}>
            <SafeAreaView style={styles.container}>
                <View style={styles.searchBarContainer}>
                    <SearchBar onSearch={handleSearchInputChange} inputRef={searchInputRef} />
                </View>
                {showSuggestions && renderPOISuggestions()}
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={DEFAULT_REGION}
                    showsUserLocation
                    showsMyLocationButton
                >
                    {pois.map(poi => (
                        <Marker
                            key={poi._id}
                            coordinate={{
                                latitude: poi.latitude,
                                longitude: poi.longitude,
                            }}
                            title={poi.name}
                            pinColor={poi._id === selectedPOIId ? "blue" : "red"} // Change color based on selection
                            onPress={() => navigation.navigate('POIDetails', { poi })}
                        >
                            {poi._id === selectedPOIId && (
                                <Callout>
                                    <Text>{poi.name}</Text>
                                </Callout>
                            )}
                        </Marker>
                    ))}
                    {searchResult && (
                        <Marker
                            key={"searchResult"}
                            coordinate={{
                                latitude: searchResult.latitude,
                                longitude: searchResult.longitude,
                            }}
                            title={searchResult.name}
                        >
                            <Callout>
                                <Text>{searchResult.name}</Text>
                            </Callout>
                        </Marker>
                    )}
                </MapView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    searchBarContainer: {
        marginHorizontal: 7,
    },
    suggestionsContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 1,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});

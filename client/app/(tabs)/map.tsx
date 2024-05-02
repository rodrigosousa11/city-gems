import React, { useRef, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StyleSheet, View, TextInput, Text, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

import { POI } from "../screens/Poi";

const DEFAULT_REGION = {
    // Porto, Portugal
    latitude: 41.1496,
    longitude: -8.6109,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function Map({ navigation, pois }: { navigation: any; pois: POI[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<null | { name: string; latitude: number; longitude: number; }>(null);
    const [poiSuggestions, setPOISuggestions] = useState<POI[]>([]);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<TextInput>(null); // Ref for the TextInput
    const mapRef = useRef<MapView>(null);

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
        if (!query) {
            setPOISuggestions(pois);
        }
    };

    const handlePOISuggestionPress = (poi: POI) => {
        setSearchQuery(poi.name);
        setSearchResult(poi);
        mapRef.current?.animateToRegion({
            latitude: poi.latitude,
            longitude: poi.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
    };

    const renderPOISuggestions = () => {
        return (
            <View style={[styles.suggestionsContainer, { top: containerHeight + 70 }]}>
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
        <TouchableWithoutFeedback onPress={() => {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }}>
            <SafeAreaView style={styles.container}>
                <View 
                    style={styles.searchContainer} 
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setContainerHeight(height);
                    }}
                >
                    <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={handleSearchInputChange}
                        autoCapitalize="none"
                        onFocus={() => handleSearchInputChange("")}
                    />
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
                            onPress={() => navigation.navigate('POIDetails', { poi })}
                        />
                    ))}

                    {searchResult && (
                        <Marker
                            key={"searchResult"} 
                            coordinate={{
                                latitude: searchResult.latitude,
                                longitude: searchResult.longitude,
                            }}
                            title={searchResult.name}
                        />
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 7,
        paddingBottom: 7,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        marginRight: 10,
        paddingHorizontal: 10,
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
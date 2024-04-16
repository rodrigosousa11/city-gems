import React, { useEffect, useRef, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StyleSheet, View, TextInput, Button, Text, SafeAreaView } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { API_URL, api } from "../context/AuthContext";
import { AxiosError } from "axios";

import { POI } from "../screens/Poi";

const DEFAULT_REGION = {
    // Porto, Portugal
    latitude: 41.1496,
    longitude: -8.6109,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function Map({navigation}: {navigation: any}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<null | { name: string; latitude: number; longitude: number; }>(null);
    const [pois, setPOIs] = useState<POI[]>([]);

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        // Função para fazer a solicitação GET ao servidor
        api.get(`${API_URL}/poi/all`)
            .then(response => {
                const data = response.data;
                setPOIs(data); // Define os POIs recebidos do servidor
            })
            .catch((error: AxiosError) => {
                console.error("Erro ao buscar POIs:", error);
            });
    }, []);

    const handleSearch = () => {
        const result = {
            name: "Search Result",
            latitude: 41.15,
            longitude: -8.61,
        };
        setSearchResult(result);
        // Zoom para a localização do resultado da pesquisa
        mapRef.current?.animateToRegion({
            latitude: result.latitude,
            longitude: result.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <Button title="Search" onPress={handleSearch} />
            </View>
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
});

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from "react-native";
import { API_URL, api } from "../context/AuthContext";
import { POI } from "../screens/Poi";

const MostVisitedLocations = ({ navigation }: { navigation: any }) => {
    const [pois, setPois] = useState<POI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPOIs = async () => {
            try {
                const response = await api.get(`${API_URL}/poi/all`);
                const fetchedPois = response.data;
                // Sort POIs by visit count in descending order
                const sortedPois = fetchedPois.sort((a: POI, b: POI) => b.visits - a.visits);
                // Take the top 10 POIs
                const top10Pois = sortedPois.slice(0, 10);
                setPois(top10Pois);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching POIs:", error);
                setLoading(false);
            }
        };

        fetchPOIs();
    }, []);

    const navigateToPoi = (poi: POI) => {
        navigation.navigate("POIDetails", { poi });
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#000000" />
            ) : (
                <ScrollView>
                    {pois.map((poi: POI) => (
                        <TouchableOpacity key={poi._id} onPress={() => navigateToPoi(poi)}>
                            <View style={styles.card}>
                                <Image source={{ uri: poi.images[0] }} style={styles.image} resizeMode="cover" />
                                <View style={styles.cardContent}>
                                    <Text style={styles.title}>{poi.name}</Text>
                                    <Text style={styles.location}>{poi.location}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    image: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    location: {
        fontSize: 14,
    },
});

export default MostVisitedLocations;

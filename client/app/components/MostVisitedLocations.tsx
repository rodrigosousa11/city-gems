import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { POI } from "../screens/Poi";

type MostVisitedLocationsRouteProp = RouteProp<RootStackParamList, 'MostVisitedLocations'>;

interface MostVisitedLocationsProps {
    navigation: any;
}

const MostVisitedLocations = ({ navigation }: MostVisitedLocationsProps) => {
    const route = useRoute<MostVisitedLocationsRouteProp>();
    const { pois } = route.params;

    const sortedPois = [...pois].sort((a, b) => b.visits - a.visits);

    const navigateToPoi = (poi: POI) => {
        navigation.navigate("POIDetails", { poi });
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {sortedPois.map((poi: POI) => (
                    <TouchableOpacity key={poi._id} onPress={() => navigateToPoi(poi)}>
                        <View style={styles.card}>
                            <Image source={{ uri: poi.images[0] }} style={styles.image} resizeMode="cover" />
                            <View style={styles.textOverlay}>
                                <Text style={styles.title}>{poi.name}</Text>
                                <Text style={styles.location}>{poi.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: 'black',
    },
    location: {
        fontSize: 14,
        color: 'black',
    },
});

export default MostVisitedLocations;

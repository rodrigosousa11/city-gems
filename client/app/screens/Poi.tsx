import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';

// This could be in a separate file where you keep your types
export interface POI {
    _id: string;
    name: string;
    images: string[];
    latitude: number;
    longitude: number;
}

// Define navigation parameters
type POIStackParamList = {
    POIDetails: {
        poi: POI;
    };
};

// Define props type using RouteProp
type POIDetailsProps = {
    route: RouteProp<POIStackParamList, 'POIDetails'>;
};

const POIDetails: React.FC<POIDetailsProps> = ({ route }) => {
    const { poi } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{poi.name}</Text>
            <Text>Latitude: {poi.latitude}</Text>
            <Text>Longitude: {poi.longitude}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default POIDetails;

import React from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";

import { POI } from '../screens/Poi';

const Home = ({ pois, loading }: { pois: POI[], loading: boolean }) => {
    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#000000" />
            ) : (
                pois.map(poi => (
                    <View key={poi._id}>
                        <Text style={styles.title}>{poi.name}</Text>
                        {poi.images.map((imageUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ))}
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 10,
    },
});

export default Home;

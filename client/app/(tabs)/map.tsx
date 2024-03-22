import React, { useEffect, useRef } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View } from "react-native";

const DEFAULT_REGION = {
    // Porto, Portugal
    latitude: 41.1496,
    longitude: -8.6109,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function Map() {

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={DEFAULT_REGION}
                showsUserLocation
                showsMyLocationButton
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
});

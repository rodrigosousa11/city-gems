import React from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View } from "react-native";

const INITIAL_REGION = {
    latitude: 38.736946,
    longitude: -9.142685,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};



export default function Map() {
    return (
        <View style={styles.container}>
            <MapView style={styles.map} 
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
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

import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { API_URL, api } from "../context/AuthContext";

import { POI } from "../screens/Poi";

export default function Home() {
    const [pois, setPois] = useState<POI[]>([]);

    useEffect(() => {
        api.get(`${API_URL}/poi/all`)
            .then(response => {
                setPois(response.data);
            })
            .catch(error => {
                console.error("Error fetching POIs:", error);
            });
    }, []);


    return (
        <View style={styles.container}>
            {pois.map(poi => (
                <View key={poi._id}>
                    <Text>{poi.name}</Text>
                    {poi.images.map(imageUrl => (
                        <Image
                            key={imageUrl}
                            source={{ uri: imageUrl }}
                            style={styles.image}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: "cover",
    }
});


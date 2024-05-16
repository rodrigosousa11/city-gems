import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ImageIndicatorProps {
    imageCount: number;
    currentIndex: number;
}

const ImageIndicator: React.FC<ImageIndicatorProps> = ({ imageCount, currentIndex }) => {
    return (
        <View style={styles.container}>
            {[...Array(imageCount).keys()].map((index) => (
                <View
                    key={index}
                    style={[
                        styles.indicator,
                        currentIndex === index ? styles.activeIndicator : null,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'gray',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: 'white',
    },
});

export default ImageIndicator;

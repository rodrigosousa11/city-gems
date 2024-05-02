import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TextInput, Button } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import { API_URL, api } from '../context/AuthContext';
import AddReviewModal from '../components/ReviewModal'; // Import the corrected component

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
}

export interface Review {
    _id: string;
    user: User;
    rating: number;
    comment: string;
}

export interface POI {
    _id: string;
    name: string;
    images: string[];
    latitude: number;
    longitude: number;
    description: string;
    reviews: Review[];
}

type POIStackParamList = {
    POIDetails: {
        poi: POI;
    };
};

type POIDetailsProps = {
    route: RouteProp<POIStackParamList, 'POIDetails'>;
};

const POIDetails: React.FC<POIDetailsProps> = ({ route }) => {
    const { poi } = route.params;
    const [weather, setWeather] = useState<string>('');
    const [reviews, setReviews] = useState<Review[]>(poi.reviews);
    const [newReview, setNewReview] = useState<string>('');
    const [selectedRating, setSelectedRating] = useState<number>(1); // State to hold the selected rating
    const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // State to control the modal visibility

    useEffect(() => {
        fetchWeatherData();
    }, []);
    
    const fetchWeatherData = () => {
        // Implement weather data fetching logic here
    };

    const handleReviewSubmit = (data: { comment: string; rating: number }) => {
        setNewReview(data.comment);
        setSelectedRating(data.rating);
        setIsModalVisible(false);
    };

    
    const handleAddReview = async () => {
        try {
            console.log("Sending review with comment:", newReview);
            console.log("Sending review with rating:", selectedRating);
    
            const response = await api.post(`${API_URL}/poi/${poi._id}/review`, {
                rating: selectedRating,
                comment: newReview, // Update to send 'comment' instead of 'review'
            });
            console.log("Review added:", response.data);
            setReviews([...reviews, response.data]);
            setNewReview('');
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };
    
    
    const renderWeather = () => {
        if (loadingWeather) {
            return <ActivityIndicator size="small" color="#000000" />;
        }
        return <Text>{weather}</Text>;
    };
    
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={{ color: i <= rating ? 'gold' : 'gray' }}>
                    ★
                </Text>
            );
        }
        return stars;
    };
    
    return (
        <View style={styles.container}>
            {poi.images.length > 0 ? (
                <PagerView style={styles.pagerView} initialPage={0}>
                    {poi.images.map((image, index) => (
                        <View style={styles.page} key={index}>
                            <Image source={{ uri: image }} style={styles.carouselImage} />
                        </View>
                    ))}
                </PagerView>
            ) : (
                <Text>No images available</Text>
            )}

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{poi.name}</Text>
                <Text style={styles.description}>{poi.description}</Text>
                <Text style={styles.weather}>Weather: {renderWeather()}</Text>
                <Text style={styles.reviews}>Reviews:</Text>
            </View>

            <View style={styles.reviewContainer}>
                <FlatList
                    data={reviews}
                    renderItem={({ item }) => (
                        <View style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.userName}>{item.user.firstName} {item.user.lastName}</Text>
                                <View style={styles.ratingContainer}>
                                    {renderStars(item.rating)}
                                </View>
                            </View>
                            <Text style={styles.comment}>{item.comment}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => item._id}
                />
            </View>

            <View style={styles.reviewSubmissionContainer}>
                <Button title="Add Review" onPress={() => setIsModalVisible(true)} />
            </View>

            <AddReviewModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleReviewSubmit}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pagerView: {
        height: 320,
    },
    page: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        marginTop: 5,
    },
    weather: {
        fontSize: 18,
        marginTop: 20,
    },
    reviews: {
        fontSize: 18,
        marginTop: 20,
        marginBottom: 10,
    },
    reviewContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    reviewItem: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    userName: {
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    comment: {
        color: '#333',
    },
    carouselImage: {
        width: '100%',
        aspectRatio: 4 / 3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between', // Add this to distribute space evenly
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginRight: 10,
    },
    ratingPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewSubmissionContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
});

export default POIDetails;

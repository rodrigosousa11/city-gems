import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Button, Linking, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import * as Location from 'expo-location';
import { API_URL, api } from '../context/AuthContext';
import AddReviewModal from '../components/ReviewModal';
import WeatherComponent from '../components/WeatherComponent';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AddToListModal from '../components/AddToListModal';
import { List } from '../(tabs)/lists';

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
    date: Date;
}

export interface POI {
    _id: string;
    name: string;
    images: string[];
    latitude: number;
    longitude: number;
    description: string;
    reviews: Review[];
    visits: number;
    location: string;
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
    const [temperature, setTemperature] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[]>([...poi.reviews].reverse());
    const [newReview, setNewReview] = useState<string>('');
    const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false); 
    const [displayedReviewsCount, setDisplayedReviewsCount] = useState<number>(5);
    const [allReviewsLoaded, setAllReviewsLoaded] = useState<boolean>(false);
    const [humidity, setHumidity] = useState<number>(0);
    const [lists, setLists] = useState<List[]>([]);
    const [isAddToListModalVisible, setIsAddToListModalVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchReviews();
        fetchWeatherData();
        fetchLists();
    }, [route.params.poi._id]);

    const fetchReviews = async () => {
        try {
            const response = await api.get(`${API_URL}/poi/get/${poi._id}`);
            const poiData = response.data;
            if (poiData && Array.isArray(poiData.reviews)) {
                setReviews(poiData.reviews.reverse());
            } else {
                console.error("Unexpected reviews data:", poiData);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const fetchLists = async () => {
        try {
            const response = await api.get(`${API_URL}/user/lists`);
            setLists(response.data);
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };

    const openAddToListModal = () => {
        setIsAddToListModalVisible(true);
    };

    const fetchWeatherData = async () => {
        const API_KEY = process.env.EXPO_PUBLIC_WEATHER;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${poi.latitude}&lon=${poi.longitude}&appid=${API_KEY}&units=metric`;
    
        try {
            const response = await axios.get(url);
            const weatherData = response.data;
            setWeather(weatherData.weather[0].description);
            setTemperature(Math.round(weatherData.main.temp));
            setHumidity(weatherData.main.humidity);
            setLoadingWeather(false);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setLoadingWeather(false);
        }
    };
    
    const handleAddReview = async (data: { comment: string; rating: number }) => {
        try {
            const response = await api.post(`${API_URL}/poi/${poi._id}/review`, {
                rating: data.rating,
                comment: data.comment,
            });
            console.log("Review added:", response.data);
    
            if (response.data && response.data.review) {
                const updatedReviewsResponse = await api.get(`${API_URL}/poi/get/${poi._id}`);
                console.log("Updated reviews:", updatedReviewsResponse.data.reviews);
    
                if (updatedReviewsResponse.data && Array.isArray(updatedReviewsResponse.data.reviews)) {
                    const newReview = updatedReviewsResponse.data.reviews.find(
                        (review: Review) => review._id === response.data.review._id
                    );

                    if (newReview) {
                        setReviews(prevReviews => [newReview, ...prevReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                        setNewReview('');
                    } else {
                        console.error("New review not found in the updated reviews list");
                    }
                } else {
                    console.error("Unexpected updated reviews response structure:", updatedReviewsResponse.data);
                }
            } else {
                console.error("Unexpected review response structure:", response.data);
            }
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };
    
    const calculateAverageRating = () => {
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return reviews.length > 0 ? (total / reviews.length) : 0;
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

    const renderEmptyList = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No reviews yet.</Text>
            <Text style={styles.emptyListSubText}>Be the first to write a review!</Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.container}>
            <PagerView
                style={styles.pagerView}
                initialPage={0}
            >
                {poi.images.map((image, index) => (
                    <View style={styles.page} key={index}>
                        <Image source={{ uri: image }} style={styles.carouselImage} />
                    </View>
                ))}
            </PagerView>
            <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{poi.name}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => openAddToListModal()}>
                        <Ionicons name="add-circle-outline" size={42} color="#000" />
                    </TouchableOpacity>
                </View>
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#555" style={styles.locationIcon} />
                    <Text style={styles.locationText}>{poi.location}</Text>
                </View>
                <Text style={styles.description}>{poi.description}</Text>
                <TouchableOpacity style={styles.button} onPress={openGoogleMaps}>
                    <Ionicons name="navigate" size={20} color="#000" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Get Directions</Text>
                </TouchableOpacity>
                <Text style={styles.subtitle}>Weather</Text>
                <WeatherComponent loading={loadingWeather} weatherDescription={weather} temperature={temperature} humidity={humidity} />
                {reviews.length > 0 && (
                    <View style={styles.reviewHeader}> 
                        <Text style={styles.subtitle}>Reviews</Text>
                        <Text style={styles.subtitle}>{renderStars(calculateAverageRating())}</Text> 
                    </View>
                )}
            </View>
        </View>
    );
    
    
    const openGoogleMaps = async () => {
        Alert.alert(
            'Location Permission',
            'We need to access your location to provide directions to the POI.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== 'granted') {
                            console.error("Permission to access location was denied");
                            return;
                        }

                        const location = await Location.getCurrentPositionAsync({});
                        const userLatitude = location.coords.latitude;
                        const userLongitude = location.coords.longitude;

                        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${poi.latitude},${poi.longitude}&travelmode=driving`;
                        Linking.openURL(url);
                    }
                }
            ]
        );
    };

    const renderFooter = () => {
        return (
            <View style={styles.reviewSubmissionContainer}>
                {reviews.length > 0 && (
                    <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={() => {
                            if (allReviewsLoaded) {
                                setDisplayedReviewsCount(5);
                                setAllReviewsLoaded(false);
                            } else {
                                setDisplayedReviewsCount(prevCount => {
                                    const newCount = prevCount + 5;
                                    if (newCount >= reviews.length) {
                                        setAllReviewsLoaded(true);
                                    }
                                    return newCount;
                                });
                            }
                        }}
                    >
                        <Text style={styles.loadMoreButtonText}>
                            {allReviewsLoaded ? "See less reviews ▲" : "See more reviews ▼"}
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.addReviewButton} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.addReviewButtonText}>Add a Review</Text>
                </TouchableOpacity>
                <AddReviewModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSubmit={handleAddReview}
                />
                <AddToListModal
                    visible={isAddToListModalVisible}
                    onClose={() => setIsAddToListModalVisible(false)}
                    poi={poi}
                    existingLists={lists}
                    refreshLists={fetchLists}
                />
            </View>
        );
    };

    return (
        <FlatList
            data={reviews.slice(0, displayedReviewsCount)}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.userName}>
                            {item.user.firstName} {item.user.lastName}
                        </Text>
                        <View style={styles.ratingContainer}>
                            {renderStars(item.rating)}
                        </View>
                    </View>
                    <Text style={styles.comment}>{item.comment}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
            )}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderFooter}
            keyExtractor={(item, index) => item._id + index}
            style={styles.container}
        />
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
        paddingHorizontal: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
    },
    reviews: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewItem: {
        marginBottom: 10,
        marginHorizontal: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    userName: {
        fontWeight: 'bold',
    },
    comment: {
        color: '#333',
    },
    date: {
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 5, 
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewSubmissionContainer: {
        paddingBottom: 30,
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'center',
    },
    carouselImage: {
        width: '100%',
        height: 300,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText: {
        fontSize: 18,
        color: '#888',
    },
    emptyListSubText: {
        fontSize: 16,
        color: '#aaa',
        marginTop: 10,
    },
    loadMoreButton: {
        borderRadius: 5,
        textAlign: 'center',
        backgroundColor: 'transparent', 
        paddingBottom: 15,
    },
    loadMoreButtonText: {
        textAlign: 'center',
        fontSize: 14,
        color: 'black',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    locationText: {
        fontSize: 16,
        marginLeft: 5,
        color: '#555',
    },
    locationIcon: {
        marginRight: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 15,
        backgroundColor: 'transparent',
    },
    buttonIcon: {
        marginRight: 5,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
    },
    addReviewButton: {
        backgroundColor: '#28a745',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    addReviewButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    addButton: {
        marginLeft: 'auto',
    },
    addIcon: {
        backgroundColor: 'transparent',
    }
});

export default POIDetails;

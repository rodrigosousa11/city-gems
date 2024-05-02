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
    const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // State to control the modal visibility
    const [displayedReviewsCount, setDisplayedReviewsCount] = useState<number>(5); // Change 5 to the initial number of reviews you want to display
    const [allReviewsLoaded, setAllReviewsLoaded] = useState<boolean>(false);

    useEffect(() => {
        fetchWeatherData();
    }, []);
    
    const fetchWeatherData = () => {
        // Implement weather data fetching logic here
    };

    const handleAddReview = async (data: { comment: string; rating: number }) => {
        try {
            console.log("Sending review with comment:", data.comment);
            console.log("Sending review with rating:", data.rating);
    
            const response = await api.post(`${API_URL}/poi/${poi._id}/review`, {
                rating: data.rating,
                comment: data.comment,
            });
            console.log("Review added:", response.data);
    
            // Fetch the updated reviews from the server
            const updatedReviewsResponse = await api.get(`${API_URL}/poi/get/${poi._id}`);
            console.log("Updated reviews:", updatedReviewsResponse.data.reviews);
    
            // Update the state with the updated reviews
            setReviews(updatedReviewsResponse.data.reviews);
            setNewReview('');
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };
    
    const calculateAverageRating = () => {
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return reviews.length > 0 ? (total / reviews.length) : 0;
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

    const renderEmptyList = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No reviews yet.</Text>
            <Text style={styles.emptyListSubText}>Be the first to write a review!</Text>
        </View>
    );
    
    const renderHeader = () => (
        <View>
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
                {reviews.length > 0 && (
                    <View style={styles.reviewsTitle}> 
                        <Text style={styles.reviews}>Reviews</Text>
                        <Text style={styles.reviews}>{renderStars(calculateAverageRating())}</Text> 
                    </View>
                )}
            </View>
        </View>
    );

    const renderFooter = () => {
        return (
            <View style={styles.reviewSubmissionContainer}>
                {reviews.length > 0 && (
                    <Button
                        title={allReviewsLoaded ? "See less reviews ▲" : "See more reviews ▼"}
                        color="black"
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
                    />
                )}
                <Button color="black" title="Add Review" onPress={() => setIsModalVisible(true)} />
                <AddReviewModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onSubmit={handleAddReview}
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
                </View>
            )}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderFooter}
            keyExtractor={item => item._id}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 10,
    },
    weather: {
        fontSize: 14,
        marginBottom: 10,
    },
    reviews: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    reviewItem: {
        marginBottom: 10,
        marginHorizontal: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    reviewsTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewSubmissionContainer: {
        paddingBottom: 30,
    },
    carouselImage: {
        width: '100%',
        height: 300,
    },
    loadMoreButton: {
        textAlign: 'center',
        marginVertical: 10,
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
});

export default POIDetails;
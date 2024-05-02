import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';

interface AddReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { comment: string; rating: number }) => void; // Update to use 'comment'
}


const AddReviewModal: React.FC<AddReviewModalProps> = ({ visible, onClose, onSubmit }) => {
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(1);

    const handleSubmit = () => {
        onSubmit({ comment: review, rating }); // Passing comment instead of review
        setReview('');
        setRating(1);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <Text>Add a Review</Text>
                <TextInput
                    value={review}
                    onChangeText={setReview}
                    placeholder="Write a review..."
                    style={styles.input}
                />
                <Text>Select Rating:</Text>
                <TextInput
                    value={String(rating)}
                    onChangeText={value => setRating(parseInt(value))}
                    keyboardType="numeric"
                    style={styles.input}
                />
                <Button title="Submit" onPress={handleSubmit} />
                <Button title="Cancel" onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        height: 40,
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default AddReviewModal;

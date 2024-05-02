import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';

interface AddReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { comment: string; rating: number }) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ visible, onClose, onSubmit }) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(1);

    const handleSubmit = () => {
        onSubmit({ comment, rating });
        setComment('');
        setRating(1);
        onClose();
    };

    const Star = ({ index }: { index: number }) => (
        <TouchableOpacity onPress={() => setRating(index + 1)}>
            <Text style={index < rating ? styles.selectedStar : styles.unselectedStar}>{'★'}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Add a Review</Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Write a review..."
                        style={styles.input}
                        multiline
                        numberOfLines={4}  // Define o número de linhas
                    />
                    <Text style={styles.modalText}>Select Rating:</Text>
                    <View style={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} index={i} />
                        ))}
                    </View>
                    <Button title="Submit" onPress={handleSubmit} />
                    <Button title="Cancel" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%', // Control the size of the modal
        maxWidth: 400 // Ensure it doesn't get too large on big screens
    },
    modalText: {
        fontSize: 18,
    },
    input: {
        fontSize: 16,
        height: 140, // Aumentado para acomodar mais texto
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 10,
        textAlignVertical: 'top', // Garante que o texto comece de cima para baixo
    },
    star: {
        fontSize: 30,
    },
    selectedStar: {
        fontSize: 30,
        color: 'gold',
    },
    unselectedStar: {
        fontSize: 30,
        color: 'gray',
    },
    stars: {
        flexDirection: 'row',
        marginBottom: 10,
    },
});

export default AddReviewModal;

import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
    onSearch: (query: string) => void;
    inputRef: React.RefObject<TextInput>; 
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, inputRef }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchInputChange = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    return (
        <View style={styles.searchContainer}>
            <FontAwesome name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                autoCapitalize="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingTop: 7,
        paddingBottom: 7,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        borderRadius: 15, 
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        marginRight: 10,
        paddingHorizontal: 10,
    },
});

export default SearchBar;

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Import our new, smaller components
import DonorListItem from '../components/DonorListItem';
import SearchBar from '../components/SearchBar';
import FloatingActionButton from '../components/FloatingActionButton';

const DonorListScreen = ({ navigation }) => {
  const [allDonors, setAllDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonors = async () => {
    try {
      setIsLoading(true);
      const donorsJSON = await AsyncStorage.getItem('donors');
      const savedDonors = donorsJSON ? JSON.parse(donorsJSON) : [];
      const sortedDonors = savedDonors.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
      setAllDonors(sortedDonors);
      setFilteredDonors(sortedDonors);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch donor data.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchDonors();
  }, []));

  // UPDATED: The search function can now optionally filter a specific list
  const handleSearch = (query, listToFilter) => {
    const sourceList = listToFilter || allDonors; // Use provided list or fall back to state
    setSearchQuery(query);
    if (query) {
      const formattedQuery = query.toLowerCase();
      const filteredData = sourceList.filter(donor => {
        const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase();
        const bloodGroup = donor.bloodGroup ? donor.bloodGroup.toLowerCase() : '';
        const mobile = donor.mobile || '';
        const donorId = donor.id.toLowerCase();
        return fullName.includes(formattedQuery) || bloodGroup.includes(formattedQuery) || mobile.includes(formattedQuery) || donorId.includes(formattedQuery);
      });
      setFilteredDonors(filteredData);
    } else {
      setFilteredDonors(sourceList);
    }
  };

  // UPDATED: The delete function now correctly updates the UI state
  const handleDelete = (donorId) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this donor?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            // Create the new list without the deleted donor
            const updatedDonors = allDonors.filter(d => d.id !== donorId);
            // Save the updated list to storage
            await AsyncStorage.setItem('donors', JSON.stringify(updatedDonors));
            // Update the main list in our component's state
            setAllDonors(updatedDonors);
            // Re-run the search on the new, smaller list to update the UI instantly
            handleSearch(searchQuery, updatedDonors);
            Alert.alert("Success", "Donor has been deleted.");
          } catch (e) {
            Alert.alert("Error", "Failed to delete donor.");
          }
        },
      },
    ]);
  };

  const handleEdit = (donorId) => {
    navigation.navigate('RegisterDonor', { donorId: donorId });
  };

  const renderContent = () => {
    if (isLoading) {
      return <View style={styles.centered}><ActivityIndicator size="large" color="#003366" /></View>;
    }
    if (filteredDonors.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.noDataText}>{searchQuery ? 'No donors found.' : 'No donors registered yet.'}</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredDonors}
        renderItem={({ item }) => (
          <DonorListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar query={searchQuery} onQueryChange={(query) => handleSearch(query)} />
      {renderContent()}
      <FloatingActionButton onPress={() => navigation.navigate('RegisterDonor')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#6c757d',
  },
});

export default DonorListScreen;

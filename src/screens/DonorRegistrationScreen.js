import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { countries, bloodGroups, genders } from '../data/locations';
import FormInput from '../components/FormInput';
import FormPicker from '../components/FormPicker';
import ImagePicker from '../components/ImagePicker';
import PincodeInput from '../components/PincodeInput';

const initialFormState = {
  firstName: '',
  lastName: '',
  dob: new Date(),
  gender: '',
  mobile: '',
  whatsapp: '',
  email: '',
  aadhar: '',
  bloodGroup: '',
  houseName: '',
  street: '',
  postOffice: '',
  pinCode: '',
  district: '',
  state: '',
  country: '',
  profilePic: null,
};

const DonorRegistrationScreen = () => {
  const [form, setForm] = useState(initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  // This was the missing line that caused the error
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (name, value) => {
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.dob;
    setShowDatePicker(Platform.OS === 'ios');
    handleInputChange('dob', currentDate);
  };

  const fetchPincodeData = async () => {
    if (form.pinCode.length !== 6) return;
    setIsPincodeLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${form.pinCode}`);
      const data = await response.json();
      if (data && data[0].Status === 'Success') {
        const postOfficeData = data[0].PostOffice[0];
        setForm(prevForm => ({
          ...prevForm,
          postOffice: postOfficeData.Name,
          district: postOfficeData.District,
          state: postOfficeData.State,
          country: postOfficeData.Country,
        }));
      } else {
        Alert.alert('Error', 'Invalid PIN code.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location data.');
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.firstName || !form.bloodGroup || !form.mobile) {
      Alert.alert('Validation Error', 'Please fill in at least First Name, Blood Group, and Mobile No.');
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const humanReadableId = `DONOR-${year}${month}${day}-${hours}${minutes}${seconds}`;

      const newDonor = {
        id: humanReadableId,
        ...form,
        registrationDate: now.toISOString(),
      };
      
      const existingDonorsJSON = await AsyncStorage.getItem('donors');
      const existingDonors = existingDonorsJSON ? JSON.parse(existingDonorsJSON) : [];
      const updatedDonors = [...existingDonors, newDonor];
      await AsyncStorage.setItem('donors', JSON.stringify(updatedDonors));
      Alert.alert('Success!', `Donor registered with ID: ${humanReadableId}`);
      setForm(initialFormState);
    } catch (error) {
      Alert.alert('Error', 'Failed to save donor data.');
      console.error("AsyncStorage Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.header}>DONOR REGISTRATION</Text>

          <Text style={styles.sectionTitle}>Donor Details</Text>
          <View style={styles.row}>
            <FormInput iconName="user" placeholder="First name" value={form.firstName} onChangeText={(val) => handleInputChange('firstName', val)} />
            <FormInput iconName="user" placeholder="Last name" value={form.lastName} onChangeText={(val) => handleInputChange('lastName', val)} />
          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerContainer}>
              <Icon name="calendar-alt" style={styles.icon} />
              <Text style={styles.inputText}>{form.dob.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <FormPicker
              iconName="venus-mars"
              selectedValue={form.gender}
              onValueChange={(val) => handleInputChange('gender', val)}
              items={[{ label: 'Gender', value: '' }, ...genders.map(g => ({ label: g, value: g }))]}
            />
          </View>
          <View style={styles.row}>
            <ImagePicker profilePic={form.profilePic} onImageSelected={(pic) => handleInputChange('profilePic', pic)} />
            <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
              <FormInput iconName="envelope" placeholder="E-mail" value={form.email} onChangeText={(val) => handleInputChange('email', val)} keyboardType="email-address" />
              <FormInput iconName="id-card" placeholder="Aadhar ID" value={form.aadhar} onChangeText={(val) => handleInputChange('aadhar', val)} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <FormInput iconName="mobile-alt" placeholder="Mobile no." value={form.mobile} onChangeText={(val) => handleInputChange('mobile', val)} keyboardType="phone-pad" />
            <FormInput iconName="whatsapp" placeholder="Whatsapp no." value={form.whatsapp} onChangeText={(val) => handleInputChange('whatsapp', val)} keyboardType="phone-pad" />
          </View>
          <FormPicker
            iconName="tint"
            iconColor="#c0392b"
            selectedValue={form.bloodGroup}
            onValueChange={(val) => handleInputChange('bloodGroup', val)}
            items={[{ label: 'Blood group', value: '' }, ...bloodGroups.map(bg => ({ label: bg, value: bg }))]}
          />

          {showDatePicker && (<DateTimePicker testID="dateTimePicker" value={form.dob} mode="date" display="default" onChange={onDateChange} />)}

          <Text style={styles.sectionTitle}>Communication Details</Text>
          <FormInput iconName="home" placeholder="House name" value={form.houseName} onChangeText={(val) => handleInputChange('houseName', val)} />
          <View style={styles.row}>
            <FormInput iconName="road" placeholder="Street" value={form.street} onChangeText={(val) => handleInputChange('street', val)} />
            <PincodeInput
              value={form.pinCode}
              onChangeText={(val) => handleInputChange('pinCode', val)}
              onBlur={fetchPincodeData}
              isLoading={isPincodeLoading}
            />
          </View>
          <FormInput iconName="building" placeholder="Post office" value={form.postOffice} editable={false} />
          <FormInput iconName="city" placeholder="District" value={form.district} editable={false} />
          <FormInput iconName="map-marked-alt" placeholder="State" value={form.state} editable={false} />
          <FormInput iconName="globe-asia" placeholder="Country" value={form.country} editable={false} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.saveButtonText}>Save Donor</Text>)}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  formContainer: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#003366', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#003366', marginTop: 20, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datePickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 50, flex: 1, marginHorizontal: 4, marginBottom: 15 },
  icon: { fontSize: 16, color: '#555', marginHorizontal: 15 },
  inputText: { color: '#333', paddingLeft: 10 },
  saveButton: { backgroundColor: '#003366', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, height: 55, justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default DonorRegistrationScreen;

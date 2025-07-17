import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your two screens
import DonorRegistrationScreen from './src/screens/DonorRegistrationScreen';
import DonorListScreen from './src/screens/DonorListScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DonorList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#003366',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="DonorList"
          component={DonorListScreen}
          options={{ title: 'Registered Donors' }}
        />
        <Stack.Screen
          name="RegisterDonor"
          component={DonorRegistrationScreen}
          options={{ title: 'Register New Donor' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

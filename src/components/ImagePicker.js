import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ImagePicker = ({ profilePic, onImageSelected }) => {
  const handleChoosePhoto = () => {
    launchImageLibrary({ noData: true }, (response) => {
      if (response.assets) {
        onImageSelected(response.assets[0]);
      }
    });
  };

  return (
    <TouchableOpacity onPress={handleChoosePhoto} style={styles.imagePicker}>
      {profilePic ? (
        <Image source={{ uri: profilePic.uri }} style={styles.profileImage} />
      ) : (
        <Icon name="user-circle" size={40} color="#555" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    width: 100,
    height: 115,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default ImagePicker;

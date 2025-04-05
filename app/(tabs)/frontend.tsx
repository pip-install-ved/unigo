import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import Modal from 'react-native-modal';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

export default function HomeScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 26.843683,
    longitude: 75.565081,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'details', title: 'Details' },
    { key: 'club', title: 'Club Info' },
    { key: 'register', title: 'Register' },
  ]);

  const events = [
    {
      id: 1,
      title: 'Tech Fest - LT-3',
      date: 'April 12, 2025',
      time: '10:00 AM - 4:00 PM',
      location: 'Lecture Theatre 3',
      latitude: 26.8433,
      longitude: 75.5648,
      description: 'Workshops, coding contests, games & more.',
      image: 'https://i.imgur.com/AZC1y2t.jpg',
      club: 'Code Warriors',
      registrationLink: 'https://example.com/register/techfest'
    },
    {
      id: 2,
      title: 'E-Sports Arena',
      date: 'April 15, 2025',
      time: '2:00 PM - 8:00 PM',
      location: 'New Auditorium',
      latitude: 26.8441,
      longitude: 75.5665,
      description: 'Valorant, BGMI, FIFA — cash prizes!',
      image: 'https://i.imgur.com/wM3rJCy.jpg',
      club: 'Gamers Guild',
      registrationLink: 'https://example.com/register/esports'
    },
    // Add more events here as needed
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setLocation({ latitude, longitude });
          setRegion((prev) => ({ ...prev, latitude, longitude }));
        }
      );
    })();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setIndex(0);
  };

  const DetailsRoute = () => (
    <View style={styles.tabViewContent}>
      <Text style={styles.modalDetail}>🗓️ {selectedEvent?.date}</Text>
      <Text style={styles.modalDetail}>🕒 {selectedEvent?.time}</Text>
      <Text style={styles.modalDetail}>📍 {selectedEvent?.location}</Text>
      <Text style={styles.modalDescription}>{selectedEvent?.description}</Text>
      <Image source={{ uri: selectedEvent?.image }} style={styles.eventImage} resizeMode="cover" />
    </View>
  );

  const ClubRoute = () => (
    <View style={styles.tabViewContent}>
      <Text style={styles.modalDetail}>🏢 Club: {selectedEvent?.club}</Text>
      <Text style={styles.modalDescription}>This event is hosted by the {selectedEvent?.club}. Join the community for more events!</Text>
    </View>
  );

  const RegisterRoute = () => (
    <View style={styles.tabViewContent}>
      <TouchableOpacity
        onPress={() => alert('Redirecting to registration link...')}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>Register Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScene = SceneMap({
    details: DetailsRoute,
    club: ClubRoute,
    register: RegisterRoute,
  });

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {location && (
          <Marker coordinate={location} title="You are here">
            <View style={styles.avatar} />
          </Marker>
        )}

        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            title={event.title}
            description="Tap for details"
            pinColor="orange"
            onPress={() => {
              setSelectedEvent(event);
              setModalVisible(true);
            }}
          />
        ))}
      </MapView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        swipeDirection="down"
        onSwipeComplete={toggleModal}
      >
        {selectedEvent && (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 {selectedEvent.title}</Text>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: Dimensions.get('window').width }}
              renderTabBar={(props) => (
                <TabBar
                  {...props}
                  indicatorStyle={{ backgroundColor: '#ff8800' }}
                  style={{ backgroundColor: 'white' }}
                  labelStyle={{ color: 'black', fontWeight: 'bold' }}
                />
              )}
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    borderColor: 'white',
    borderWidth: 2,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 300,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalDetail: { fontSize: 16, marginBottom: 4 },
  modalDescription: { fontSize: 14, marginTop: 10, color: '#555' },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#ff8800',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontWeight: 'bold' },
  tabViewContent: { paddingVertical: 10 },
});

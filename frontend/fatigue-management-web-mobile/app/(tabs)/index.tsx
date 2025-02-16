import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from 'react-native';
import axios from "axios";

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const intervalRef = useRef(null);
  const [predictions, setPredictions] = useState([]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function fatigue_detect(picture) {
    try {
      const response = await fetch("http://172.16.44.134:8000/fatigue/detect/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: picture.base64.replace('data:image/jpeg;base64,', '') }),
      });
      const data = await response.json()
      setPredictions(data.predictions);
      console.log('API Response:', data);
      // setImage(picture.uri);
      // takePicture()
    } catch (error) {
      console.error('Error sending image:', error);
    }
  }

  function takePicture() {
    if (cameraRef.current) {
      const picture = cameraRef.current.takePictureAsync({
        base64: true,
        imageType: 'jpg',
        CameraPictureOptions: { shutterSound: false },
        onPictureSaved: fatigue_detect
      });
    }
  }

  function startLoop() {
    if (!isLooping) {
      setIsLooping(true);
      intervalRef.current = setInterval(() => {
        takePicture();
      }, 500);
    }
  }

  function stopLoop() {
    if (isLooping) {
      setIsLooping(false);
      clearInterval(intervalRef.current);
    }
  }

  console.log(predictions)

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} shutt={isLooping ? false : true}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={isLooping ? stopLoop : startLoop}>
            <Text style={styles.text}>{isLooping ? 'Stop Loop' : 'Start Loop'}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Show captured image */}
      {/* {image && <Image source={{ uri: image }} style={styles.previewImage} />} */}

      {/* Display predictions */}
      <View style={styles.predictionsContainer}>
        <Text style={styles.predictionsHeader}>Predictions</Text>
        <FlatList
          data={predictions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.predictionText}>
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}: {(item.confidence * 100).toFixed(2)}%
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  previewImage: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  predictionsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  predictionsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  predictionText: {
    fontSize: 16,
    color: 'white',
  },
});

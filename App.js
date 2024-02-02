import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, Text, Button, View, StatusBar as DeviceStatusBar, TouchableOpacity, TextInput, AppState } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRef, useState, useCallback, memo, useEffect } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'; 
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';


const KeyButton = memo(function ({
  n = null,
  handlePress,
  color = 'black',
  fontSize = 25,
  backgroundColor = 'white'
}) {
  return <View style={styles.keyButton}>
    <TouchableOpacity onPress={() => handlePress(n)} style={{
      height: 70,
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      alignItems: 'center',
      backgroundColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 12,
        height: 12,
      },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 5,
      overflow: 'hidden',
      borderRadius: 15
    }}>
      <Text style={{ color, fontSize }}>{n}</Text>
    </TouchableOpacity>
  </View>
})


const ExpoCamera = function ({ setIsCameraOpen }) {
  const { width } = useWindowDimensions();
  const height = Math.round((width * 4) / 3)
  const cameraRef = useRef(null);
  const [type, setType] = useState(CameraType.back);
  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const [crop, setCrop] = useState({})

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  if (!cameraPermission || !mediaPermission) {
    return null
  }

  if (!cameraPermission.granted || !mediaPermission.granted) {
    return (
      <View style={[styles.container, { marginTop: DeviceStatusBar.currentHeight || 0 }]}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={() => {
          requestCameraPermission()
          requestMediaPermission()
        }} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {

        const photo = await cameraRef.current.takePictureAsync()

        const photoWidth = photo.width
        const photoHeight = photo.height

        const adjustOriginX = crop.originX / width * photoWidth
        const adjustOriginY = crop.originY / height * photoHeight

        const adjustWidth = crop.width / width * photoWidth
        const adjustHeight = crop.height / height * photoHeight

        const adjustCrop = {
          originX: adjustOriginX,
          originY: adjustOriginY,
          height: adjustHeight,
          width: adjustWidth,
        }

        const result = await manipulateAsync(photo.uri, [{ crop: adjustCrop }], [{ format: SaveFormat.PNG }]);

        // const result = await manipulateAsync(photo.uri, [{ resize: { width, height } }, { crop }], [{ compress: 1, format: SaveFormat.JPEG }]);

        await MediaLibrary.createAssetAsync(result.uri)
      } catch (error) {
        console.log(error)
      }
    }
  }

  return <>
    <View style={{ flex: 1, backgroundColor: 'black', marginTop: DeviceStatusBar.currentHeight || 0, }}>
      <View style={{ size: 28, paddingHorizontal: 30, flex: 1, justifyContent: 'space-between', alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
        <AntDesign name="qrcode" size={28} color="white" />
        <Entypo name="flash" size={24} color="white" />
        <FontAwesome6 name="grip" size={28} color="white" />
        <AntDesign name="setting" size={28} color="white" />
      </View>
      <Camera style={[styles.camera, { height: height, width: '100%' }]} type={type} ref={cameraRef} ratio={'4:3'}>
        <View style={styles.viewfinder} onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          const adjust = {
            originX: layout.x,
            originY: layout.y,
            width: layout.width,
            height: layout.height
          };
          setCrop((prev) => ({ ...prev, ...adjust }))
        }}>
          <View style={
            {
              position: 'absolute',
              top: -5,
              left: -5,
              borderColor: 'white',
              borderTopWidth: 30,
              borderStartWidth: 5,
            }
          }></View>
          <View style={
            {
              position: 'absolute',
              top: -5,
              left: -5,
              borderColor: 'white',
              width: 30,
              height: 30,
              borderTopWidth: 5,
              borderLeftWidth: 5,
            }
          }></View>
          <View style={
            {
              position: 'absolute',
              bottom: -5,
              right: -5,
              borderColor: 'white',
              width: 30,
              height: 30,
              borderRightWidth: 5,
              borderBottomWidth: 5
            }
          }></View>
          <View style={
            {
              position: 'absolute',
              top: -5,
              right: -5,
              borderColor: 'white',
              width: 30,
              height: 30,
              borderRightWidth: 5,
              borderTopWidth: 5,
            }
          }></View>
          <View style={
            {
              position: 'absolute',
              bottom: -5,
              left: -5,
              borderColor: 'white',
              width: 30,
              height: 30,
              borderLeftWidth: 5,
              borderBottomWidth: 5
            }
          }></View>
        </View>
      </Camera>
      <View style={{ flex: 1, paddingVertical: 80,paddingHorizontal:30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => { setIsCameraOpen(false) }}>
          <MaterialCommunityIcons name="window-close" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture}>
          <Entypo name="camera" size={50} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCameraType}>
          <MaterialCommunityIcons name="rotate-3d-variant" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </>
}

export default function App() {
  const [result, setResult] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const inputRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri)
    }
  }

  const handlePress = useCallback(function (val) {
    const newInput = inputValue.substring(0, selection.start) + val + inputValue.substring(selection.start);
    setInputValue(newInput);

    const newStart = selection.start + String(val).length;

    setSelection({ start: newStart, end: newStart });

    if (inputRef.current) {
      inputRef.current.focus()
    }

  }, [inputValue, selection, inputRef])


  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  useEffect(() => {
    if (AppState.addEventListener) {
      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        appStateSubscription.remove()
      };
    }
  }, [selection]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleCalculate = useCallback(function () {
    try {
      let text = inputValue
      text = text.replace(/\^/g, '**')
      text = text.replace(/√(\d+)/g, (match, number) => {
        return `Math.sqrt(${number})`;
      })
      const check = ['+', '-', '*', '/', '%'].includes(text.charAt(text.length - 1))
      if (check) {
        text = text.slice(0, -1)
      }
      const sum = new Function(`return ${text}`)
      setResult(sum())
    } catch {
      setResult('Error')
    }
  }, [inputValue])



  const handleRemove = useCallback(function () {
    if (selection.start > 0) {
      const newInput =
        inputValue.substring(0, selection.start - 1) + inputValue.substring(selection.start);
      setInputValue(newInput);
      const newStart = selection.start - 1;
      setSelection({ start: newStart, end: newStart })
    }
  }, [inputValue, selection])

  const handleAc = useCallback(function () {
    setInputValue('')
    setResult('')
  }, [])


  const handleInputChange = function (text) {
    setInputValue(text);
  }

  return (
    <View style={[styles.container]}>
      {
        isCameraOpen ? <ExpoCamera setIsCameraOpen={setIsCameraOpen}></ExpoCamera> : <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'column' }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <TextInput
              ref={inputRef}
              autoFocus={true}
              showSoftInputOnFocus={false}
              selection={selection}
              onChangeText={handleInputChange}
              value={inputValue}
              blurOnSubmit={true}
              onSelectionChange={(e) => {
                const { nativeEvent: { selection } } = e
                setSelection(selection)
              }}
              style={{ color: 'black', fontSize: 60, textAlign: 'right' }} />
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ color: 'gray', fontSize: 60, textAlign: 'right' }}>{result}</Text>
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={() => setIsCameraOpen(!isCameraOpen)} n={<Feather name="camera" size={24} color="black" />} color='#FF0000' />
              <KeyButton handlePress={pickImage} n={<Feather name="image" size={24} color="black" />} />
              <KeyButton handlePress={handlePress} n={'s'} color='#0000FF' />
              <KeyButton handlePress={handleAc} n={'C'} color='#0000FF' />
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={handlePress} n={'('} color='#0000FF' />
              <KeyButton handlePress={handlePress} n={')'} color='#0000FF' />
              <KeyButton handlePress={handlePress} n={'%'} color='#0000FF' />
              <KeyButton handlePress={handlePress} n={'/'} color='#0000FF' />
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={handlePress} n={'7'} />
              <KeyButton handlePress={handlePress} n={'8'} />
              <KeyButton handlePress={handlePress} n={'9'} />
              <KeyButton handlePress={handlePress} n={'*'} color='#0000FF' />
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={handlePress} n={'4'} />
              <KeyButton handlePress={handlePress} n={'5'} />
              <KeyButton handlePress={handlePress} n={'6'} />
              <KeyButton handlePress={handlePress} n={'-'} color='#0000FF' />
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={handlePress} n={'1'} />
              <KeyButton handlePress={handlePress} n={'2'} />
              <KeyButton handlePress={handlePress} n={'3'} />
              <KeyButton handlePress={handlePress} n={'+'} color='#0000FF' />
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
              <KeyButton handlePress={handlePress} n={'.'} />
              <KeyButton handlePress={handlePress} n={'0'} />
              <KeyButton handlePress={handleRemove} n={<FontAwesome5 name="backspace" size={18} color="#0000FF" />} color='#48cae4' />
              <KeyButton handlePress={handleCalculate} color='#0000FF' n={'='} />
            </View>
          </View>
        </View>
      }
      <StatusBar style='auto'></StatusBar>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between'
  },
  keyButton: {
    width: '25%',
    padding: 5
  },
  camera: {
    justifyContent: 'center'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 30
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  viewfinder: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 5,
    alignSelf: 'center',
    width: 250,
    height: 90,
  },
});

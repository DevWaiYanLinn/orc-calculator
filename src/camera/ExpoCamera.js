import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { FontAwesome6, Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Alert, Button, View, TouchableOpacity, Text, useWindowDimensions, StatusBar as DeviceStatusBar } from 'react-native';
import styles from '../styles/styles';
import { useRef, useState } from 'react';

const calculate = function (text) {
    try {
        if (text) {
            text = text.replace(/\^/g, '**')
            text = text.replace(/√(\d+)/g, (match, number) => {
                return `Math.sqrt(${number})`;
            })
            const check = ['+', '-', '*', '/', '%'].includes(text.charAt(text.length - 1))
            if (check) {
                text = text.slice(0, -1)
            }
            const sum = new Function(`return ${text}`)
            return sum()
        } else {
            return ''
        }
    } catch {
       return 'Error'
    }
}

const ExpoCamera = function ({ setIsCameraOpen, setInput, setResult }) {
    const { width } = useWindowDimensions();
    const height = Math.round((width * 4) / 3)
    const cameraRef = useRef(null);
    const [type, setType] = useState(CameraType.back);
    const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const [flash, setFlash] = useState(FlashMode.off)
    const viewFinderRef = useRef(null);
    const [crop, setCrop] = useState({})

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    if (!cameraPermission || !mediaPermission) {
        return <View />;
    }

    if (!cameraPermission?.granted || !mediaPermission?.granted) {
        return (
            <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, { marginTop: DeviceStatusBar.currentHeight || 0 }]}>
                <Text style={{ textAlign: 'center', marginBottom: 10 }}>We need your permission to show the camera</Text>
                <Button onPress={() => {
                    requestCameraPermission()
                    requestMediaPermission()
                }} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef?.current) {
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
                await cameraRef.current.pausePreview()
                const result = await manipulateAsync(photo.uri, [{ crop: adjustCrop }], [{ format: SaveFormat.PNG }]);
                const formData = new FormData();
                formData.append('file', {
                    uri: result.uri,
                    name: 'photo.jpg',
                    type: 'image/jpg',
                })

                await MediaLibrary.createAssetAsync(result.uri)

                const response = await fetch('http://192.168.99.139:5000/api/photo-upload', {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Access': 'application/json'
                    },
                })
                const res = await response.json()
                await cameraRef.current.resumePreview()

                if (!response.ok) {
                    Alert.alert(
                        'Error',
                        `${'server error or we can not detect the image'}`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ],
                        {
                            cancelable: true,
                        },
                    );
                } else {
                    const result = calculate(res.join(''))
                    Alert.alert(
                        'Success',
                        `${'Result is : ' + res.join('') + ' = ' +  result }`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ],
                        {
                            cancelable: true,
                        },
                    );
                    setIsCameraOpen(false)
                    setInput((prev) => ({ ...prev, value: res.join('') }))
                    setResult(result)
                }
            } catch (error) {
                Alert.alert(
                    'Error',
                    `${error || 'unknown error'}`,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ],
                    {
                        cancelable: true,
                    },
                );
            }
        }
    }

    return <View style={{ flex: 1, backgroundColor: 'black', marginTop: DeviceStatusBar.currentHeight || 0, }}>
        <View style={{ paddingHorizontal: 30, paddingVertical: 20, justifyContent: 'space-between', alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <AntDesign name="qrcode" size={28} color="white" />
            <TouchableOpacity onPress={() => {
                setFlash((prev) => {
                    return prev === FlashMode.on ? FlashMode.off : FlashMode.on
                })
            }}>
                <Entypo name="flash" size={28} color={flash === FlashMode.on ? 'yellow' : 'white'} />
            </TouchableOpacity>
            <FontAwesome6 name="grip" size={28} color="white" />
            <AntDesign name="setting" size={28} color="white" />
        </View>
        <Camera flashMode={flash} style={[styles.camera, { height: height, width: '100%' }]} type={type} ref={cameraRef} ratio={'4:3'}>
            <View ref={viewFinderRef} style={styles.viewfinder} onLayout={(event) => {
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
        <View style={{ flex: 1, paddingHorizontal: 30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { setIsCameraOpen(false) }}>
                <AntDesign name="back" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture}>
                <Entypo name="camera" size={50} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraType}>
                <MaterialCommunityIcons name="rotate-3d-variant" size={28} color="white" />
            </TouchableOpacity>
        </View>
    </View>
}

export default ExpoCamera
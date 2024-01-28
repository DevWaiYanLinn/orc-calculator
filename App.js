import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View, StatusBar as DeviceStatusBar, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRef, useState, useCallback, memo } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const KeyButton = memo(function ({ n, handlePress, color = 'black', fontSize = 25, backgroundColor = 'white', }) {
    return <View style={styles.keyButton}>
        <TouchableOpacity onPress={() => handlePress(n)} style={{
            height: 80,
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

export default function App() {
    const [calculate, setCalculate] = useState([])
    const [result, setResult] = useState('')
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    const handlePress = useCallback(function (val) {
        if(['+', '-', '*', '/', '%'].includes(calculate[calculate.length - 1]) && ['+', '-', '*', '/', '%'].includes(val)) {
            return
        }
        setCalculate((cal => [...cal,val]))
    },[])

    const handleCalculate = function () {
        const  cal = [...calculate]
        const check = ['+', '-', '*', '/', '%'].includes(cal[calculate.length - 1])
        if(check) {
            cal.splice(cal.length - 1, 1)
        }
        const sum = new Function(`return ${cal.join('')}`)
        setResult(sum())
    }

    const cameraRef = useRef(null);

    const handleRemove = function () {
        const result = [...calculate].slice(0, -1)
        setCalculate(result)
    }

    const handleAc = function () {
        setCalculate([])
        setResult('')
    }

    if (!permission) {
        return null
    }

    const toggleCamera = () => {
        setIsCameraOpen(!isCameraOpen);
    };

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef) {
            const photo = await cameraRef.current.takePictureAsync()
            console.log(photo)
        }
    }

    return (
        <View style={[styles.container, { marginTop: DeviceStatusBar.currentHeight || 0 }]}>
            {
                isCameraOpen ? <Camera style={styles.camera} type={type} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={toggleCamera}>
                            <MaterialCommunityIcons name="window-close" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePicture}>
                            <Entypo name="camera" size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleCameraType}>
                            <MaterialCommunityIcons name="rotate-3d-variant" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                </Camera> : <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'column' }}>
                    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <Text style={{ color: 'black', fontSize: 60, textAlign: 'right' }}>{calculate.join('')}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ color: 'black', fontSize: 60, textAlign: 'right' }}>{result}</Text>
                        </View>
                        <View style={{ marginBottom: 5, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={toggleCamera} n={<Feather name="camera" size={20} color="#48cae4" />} color='#48cae4' />
                            <KeyButton handlePress={handleAc} n={'AC'} color='#48cae4' />
                            <KeyButton handlePress={handlePress} n={'%'} color='#48cae4' />
                            <KeyButton handlePress={handlePress} n={'/'} color='#48cae4' />
                        </View>
                        <View style={{ marginBottom: 5, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={7} />
                            <KeyButton handlePress={handlePress} n={8} />
                            <KeyButton handlePress={handlePress} n={9} />
                            <KeyButton handlePress={handlePress} n={'*'} color='#48cae4' />
                        </View>
                        <View style={{ marginBottom: 5, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={4} />
                            <KeyButton handlePress={handlePress} n={5} />
                            <KeyButton handlePress={handlePress} n={6} />
                            <KeyButton handlePress={handlePress} n={'-'} color='#48cae4' />
                        </View>
                        <View style={{ marginBottom: 5, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={1} />
                            <KeyButton handlePress={handlePress} n={2} />
                            <KeyButton handlePress={handlePress} n={3} />
                            <KeyButton handlePress={handlePress} n={'+'} color='#48cae4' />
                        </View>
                        <View style={{ marginBottom: 5, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={'.'} />
                            <KeyButton handlePress={handlePress} n={0} />
                            <KeyButton handlePress={handleRemove} n={<FontAwesome5 name="backspace" size={20} color="#48cae4" />} color='#48cae4' />
                            <KeyButton handlePress={handleCalculate} color='#48cae4' n={'='} />
                        </View>
                    </View>
                </View>
            }
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyButton: {
        width: '25%',
        padding: 5
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'transparent',
        // backgroundColor:'red'
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
});

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View, StatusBar as DeviceStatusBar, TouchableOpacity, TextInput, AppState } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRef, useState, useCallback, memo, useEffect } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const KeyButton = memo(function ({
    n = null,
    handlePress,
    color = 'black',
    fontSize = 25,
    backgroundColor = 'white'
}) {
    return <View style={styles.keyButton}>
        <TouchableOpacity onPress={() =>  handlePress(n)} style={{
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

export default function App() {
    const [result, setResult] = useState('')
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [inputValue, setInputValue] = useState('')
    const [selection, setSelection] = useState({ start: 0, end: 0 })
    const inputRef = useRef(null);

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

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }


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

    const cameraRef = useRef(null);

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

    if (!permission) {
        return null
    }

    const toggleCamera = () => {
        setIsCameraOpen(!isCameraOpen);
    };

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={[styles.container, { marginTop: DeviceStatusBar.currentHeight || 0 }]}>
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

    const handleInputChange = function (text) {
        setInputValue(text);
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
                        {/* <Text style={{ color: 'black', fontSize: 60, textAlign: 'right' }}>{calculate.join('')}</Text> */}
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <View style={{ paddingHorizontal: 20 }}>
                            <Text style={{ color: 'gray', fontSize: 60, textAlign: 'right' }}>{result}</Text>
                        </View>
                        <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={toggleCamera} n={'AI'} color='#FF0000' />
                            <KeyButton handlePress={handleAc} n={'C'} color='#0000FF' />
                            <KeyButton handlePress={handlePress} n={'√'} color='#0000FF' />
                            <KeyButton handlePress={handlePress} n={'^'} color='#0000FF' />
                        </View>
                        <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={'('} color='#0000FF' />
                            <KeyButton handlePress={handlePress} n={')'} color='#0000FF' />
                            <KeyButton handlePress={handlePress} n={'%'} color='#0000FF' />
                            <KeyButton handlePress={handlePress} n={'/'} color='#0000FF' />
                        </View>
                        <View style={{  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={'7'} />
                            <KeyButton handlePress={handlePress} n={'8'} />
                            <KeyButton handlePress={handlePress} n={'9'} />
                            <KeyButton handlePress={handlePress} n={'*'} color='#0000FF' />
                        </View>
                        <View style={{  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
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
                        <View style={{  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <KeyButton handlePress={handlePress} n={'.'} />
                            <KeyButton handlePress={handlePress} n={'0'} />
                            <KeyButton handlePress={handleRemove} n={<FontAwesome5 name="backspace" size={18} color="#0000FF" />} color='#48cae4' />
                            <KeyButton handlePress={handleCalculate} color='#0000FF' n={'='} />
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

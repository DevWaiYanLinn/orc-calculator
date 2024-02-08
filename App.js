import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, TextInput, AppState, StatusBar as DeviceStatusBar, Keyboard, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRef, useState, useCallback, memo, useEffect } from 'react';
import ExpoCamera from './src/camera/ExpoCamera';
import styles from './src/styles/styles';
import { calculate } from './src/utils/utility';


const KeyButton = memo(function ({
    n = null,
    handlePress,
    color = 'black',
    fontSize = 25,
    backgroundColor = 'white'
}) {
    return <View style={styles.keyButtonContainer}>
        <TouchableOpacity onPress={() => handlePress(n)} style={[styles.keyButton, { backgroundColor }]}>
            <Text style={{ color, fontSize }}>{n}</Text>
        </TouchableOpacity>
    </View>
})

export default function App() {
    const [result, setResult] = useState('')
    const inputRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [input, setInput] = useState({ value: '', start: 0, end: 0 });
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

    const pickImage = async () => {
        if (!mediaPermission?.granted) {
            requestMediaPermission()
        } else if (mediaPermission?.granted) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                console.log(result.assets[0].uri)
            }
        }

    }

    const handlePress = useCallback(function (val) {
        setInput((prev) => {
            const newInput = prev.value.substring(0, prev.start) + val + prev.value.substring(prev.start);
            const newStart = prev.start + String(val).length;
            return { ...prev, value: newInput, start: newStart, end: newStart }
        })

        if (inputRef.current) {
            inputRef.current.focus()
        }

    }, [inputRef])


    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'background') {
            Keyboard.dismiss();
        } else {
            setTimeout(() => {
                if(inputRef.current) {
                    inputRef.current.focus()
                }
            }, 1000)
        }
    };

    useEffect(() => {
        if (AppState.addEventListener) {
            const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
            return () => {
                appStateSubscription.remove()
            };
        }
    }, []);


    const handleCalculate = useCallback(function () {
        const result = calculate(input.value)
        setResult(result)
    }, [input.value])


    const handleRemove = useCallback(function () {
        setInput((prev) => {
            if (prev.start > 0) {
                const newInput =
                    prev.value.substring(0, prev.start - 1) + prev.value.substring(prev.start);
                const newStart = prev.start - 1;
                return { ...prev, value: newInput, start: newStart, end: newStart }
            }
            return prev
        })
    }, [])

    const handleAc = useCallback(function () {
        setInput({ value: '', start: 0, end: 0 })
        setResult('')
    }, [])


    const handleInputChange = useCallback(function (text) {
        setInput((prev => ({ ...prev, value: text || '' })))
    }, [])

    const onSelectionChange = useCallback((e) => {
        const { nativeEvent: { selection } } = e
        setInput((prev) => ({ ...prev, ...selection }))
    }, [])

    return (
        <View style={[styles.container]}>
            {
                isCameraOpen ? <ExpoCamera
                    setIsCameraOpen={setIsCameraOpen}
                    setInput={setInput}
                    setResult={setResult}>

                </ExpoCamera> :
                    <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'column', marginTop: DeviceStatusBar.currentHeight || 0 }}>
                        <View style={{ paddingHorizontal: 20, flex: 1, justifyContent: 'center' }}>
                            <TextInput
                                on
                                ref={inputRef}
                                autoFocus={true}
                                showSoftInputOnFocus={false}
                                selection={{ start: input.start, end: input.end }}
                                onChangeText={handleInputChange}
                                value={input.value}
                                onSelectionChange={onSelectionChange}
                                style={{ color: 'black', fontSize: input.value.length > 10 ? 30 : 50, textAlign: 'right' }} />
                            <Text style={{ color: 'gray', fontSize: input.value.length || result.length > 10 ? 25 : 35, textAlign: 'right', marginTop: 20 }}>{result}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={() => setIsCameraOpen(true)} n={<Feather name="camera" size={24} color={'white'} />} backgroundColor={'#ff5555'} />
                                {/* <KeyButton handlePress={handlePress} n={'√'} color={'#ff5555'} /> */}
                                <KeyButton handlePress={pickImage} n={<Feather name="image" size={24} color={'#ff5555'} />} />
                                <KeyButton handlePress={handlePress} n={'^'} color={'#ff5555'} />
                                <KeyButton handlePress={handleAc} n={'C'} color={'#ff5555'} />
                            </View>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={handlePress} n={'('} color={'#ff5555'} />
                                <KeyButton handlePress={handlePress} n={')'} color={'#ff5555'} />
                                <KeyButton handlePress={handlePress} n={'%'} color={'#ff5555'} />
                                <KeyButton handlePress={handlePress} n={'/'} color={'#ff5555'} />
                            </View>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={handlePress} n={'7'} />
                                <KeyButton handlePress={handlePress} n={'8'} />
                                <KeyButton handlePress={handlePress} n={'9'} />
                                <KeyButton handlePress={handlePress} n={'*'} color={'#ff5555'} />
                            </View>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={handlePress} n={'4'} />
                                <KeyButton handlePress={handlePress} n={'5'} />
                                <KeyButton handlePress={handlePress} n={'6'} />
                                <KeyButton handlePress={handlePress} n={'-'} color={'#ff5555'} />
                            </View>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={handlePress} n={'1'} />
                                <KeyButton handlePress={handlePress} n={'2'} />
                                <KeyButton handlePress={handlePress} n={'3'} />
                                <KeyButton handlePress={handlePress} n={'+'} color={'#ff5555'} />
                            </View>
                            <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <KeyButton handlePress={handlePress} n={'.'} />
                                <KeyButton handlePress={handlePress} n={'0'} />
                                <KeyButton handlePress={handleRemove} n={<Ionicons name="arrow-back-outline" size={18} color={'#ff5555'} />} />
                                <KeyButton handlePress={handleCalculate} n={<MaterialCommunityIcons name="equal" size={18} color={'#ff5555'} />} />
                            </View>
                        </View>
                    </View>
            }
            <Pressable>
                <View />
            </Pressable>
            <StatusBar style='auto'></StatusBar>
        </View >
    );
}

import { Alert } from 'react-native';


export const AppAlert = function ({ title, message }) {
    return Alert.alert(
        title,
        message,
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
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between'
  },
  keyButtonContainer: {
    width: '25%',
    padding: 5
  },
  keyButton: {
    height: 65,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
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

export default styles
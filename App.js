import { useRef, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from './components/ImageViewer';
import PlaceholderImage from './assets/images/background-image.png';

import { StatusBar } from 'expo-status-bar';
import Button from './components/Button';
import IconButton from './components/IconButton';
import CircleButton from './components/CircleButton';
import EmojiPicker from './components/EmojiPicker';
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';


export default function App() {
	const [status, requestPermission] = MediaLibrary.usePermissions();
	if ( status === null ) {
		requestPermission();
	}

	const [selectedImage, setSelectedImage] = useState( null );
	const imageRef = useRef();
	const pickImageAsync = async () => {
		const result = await ImagePicker.launchImageLibraryAsync( {
			allowsEditing: true,
			quality: 0.5,
		} );
		if ( !result.canceled ) {
			setSelectedImage( result.assets[0].uri );
			setShowAppOptions( true );
		} else {
			alert( 'You did not select any image.' );
		}
	};
	const onSaveImageAsync = async () => {
		if ( Platform.OS !== 'web' ) {
			try {
				const localUri = await captureRef( imageRef, {
					height: 440,
					quality: 1,
				} );
				await MediaLibrary.saveToLibraryAsync( localUri );
				if ( localUri ) {
					alert( 'Saved!' );
				}
			} catch ( e ) {
				console.error( e );
			}
		} else {
			try {
				const dataUrl = await domtoimage.toJpeg( imageRef.current, {
					quality: 0.95,
					width: 320,
					height: 440,
				} );
				const link = document.createElement( 'a' );
				link.download = 'sticker-smash.jpeg';
				link.href = dataUrl;
				link.click();
			} catch ( e ) {
				console.error( e );
			}
		}
	};

	const [showAppOptions, setShowAppOptions] = useState( false );
	const onReset = () => {
		setShowAppOptions( false );
		setPickedEmoji( false );
		setIsModalVisible( false );
		setSelectedImage( null );
	};

	const [pickedEmoji, setPickedEmoji] = useState( null );
	const onAddSticker = () => {
		setIsModalVisible( true );
	};

	const [isModalVisible, setIsModalVisible] = useState( false );
	const onModalClose = () => {
		setIsModalVisible( false );
	};

	return (
		<SafeAreaProvider style={styles.container}>
			<SafeAreaView style={styles.container}>
				<GestureHandlerRootView style={styles.container}>
					<View style={styles.imageContainer}>
						<View ref={imageRef} collapsable={false}>
							<ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage} />
							{pickedEmoji !== null ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> : null }
						</View>
					</View>
					{ showAppOptions ? (
						<View style={styles.optionsContainer}>
							<View style={styles.optionsRow}>
								<IconButton icon="refresh" label="Reset" onPress={onReset} />
								<CircleButton onPress={onAddSticker} />
								<IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
							</View>
						</View>
					) : (
						<View style={styles.footerContainer}>
							<Button label={'Choose photo'} theme="primary" onPress={pickImageAsync}/>
							<Button label={'Use this photo'} onPress={()=>setShowAppOptions( true )} />
						</View>
					)}
					<EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
						<EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
					</EmojiPicker>
					<StatusBar style="light" />
				</GestureHandlerRootView>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create( {
	container: {
		flex: 1,
		backgroundColor: '#25292e',
		alignItems: 'center',
	},
	imageContainer: {
		flex: 1,
		paddingTop: 58,
	},
	footerContainer: {
		flex: 1 / 3,
		alignItems: 'center',
	},
	optionsContainer: {
		position: 'absolute',
		bottom: 80,
	},
	optionsRow: {
		alignItems: 'center',
		flexDirection: 'row',
	},
} );

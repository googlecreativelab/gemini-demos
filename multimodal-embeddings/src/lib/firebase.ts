import { initializeApp } from 'firebase/app';
import { collection, connectFirestoreEmulator, getDocs, getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, connectStorageEmulator } from 'firebase/storage';
import {
	FIREBASE_CONFIG,
	FIREBASE_STORAGE_EMULATOR_BUCKET,
	FIRESTORE_DB_ID,
	useEmulator
} from './consts';

export const app = initializeApp(FIREBASE_CONFIG);
export const fs = getFirestore(FIRESTORE_DB_ID);

// The emulator export comes with its own storage bucket name, used here
export let storage = useEmulator
	? getStorage(app, FIREBASE_STORAGE_EMULATOR_BUCKET)
	: getStorage(app);

if (useEmulator) {
	connectFirestoreEmulator(fs, 'localhost', 8080);
	connectStorageEmulator(storage, 'localhost', 9199);
}

export const allDocsInCollection = async (collName: string) => {
	return await getDocs(collection(fs, collName));
};

export const getThumb = async (thumbPath: string) => {
	return await getDownloadURL(ref(storage, thumbPath));
};

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { FIREBASE_PROJECT_ID, FIRESTORE_DB_ID } from './consts';

const firebaseConfig = {
	projectId: FIREBASE_PROJECT_ID
	// rest of your config, from the firebase console
	// directions: https://firebase.google.com/docs/web/setup
};

export const app = initializeApp(firebaseConfig);
export const fs = getFirestore(FIRESTORE_DB_ID);

export const storage = getStorage(app);

export const allDocsInCollection = async (collName: string) => {
	return await getDocs(collection(fs, collName));
};

export const getThumb = async (thumbPath: string) => {
	return await getDownloadURL(ref(storage, thumbPath));
};

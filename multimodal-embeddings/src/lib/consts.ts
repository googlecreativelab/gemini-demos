// We can set some reasonable defaults for testing with exported data
// using the Firebase emulators. Follow along in the README for more info.
export const useEmulator = import.meta.env.VITE_USE_EMULATOR;

// due to our emulator data being a direct, binary export of our testing databases
// the name here reflects the way for the emulator to properly ingest it for testing
// DONT FORGET - if using the emulator UI - when viewing Firestore, replace 'default'
// with 'cl-demos-firestore' in the URL so you can see the imported test data
export const FIRESTORE_DB_ID = useEmulator ? 'cl-demos-firestore' : 'your-project-firestore-db';
export const FIREBASE_STORAGE_EMULATOR_BUCKET = 'mm-demo.appspot.com'; // same as above, for emulator
export const DEFAULT_EMULATOR_FIRESTORE_COLLECTION = 'weather';
export const FIREBASE_PROJECT_ID = 'your-project-id'; // this should match the auto generated firebase.rc after running `firebase init`
export const FIREBASE_CONFIG = {
	projectId: FIREBASE_PROJECT_ID,
	storageBucket: useEmulator
		? FIREBASE_STORAGE_EMULATOR_BUCKET
		: `${FIREBASE_PROJECT_ID}.appspot.com`
	// while the above might work for initial testing, follow the link below for proper values
	// rest of your config, from the firebase console
	// directions: https://firebase.google.com/docs/web/setup
};

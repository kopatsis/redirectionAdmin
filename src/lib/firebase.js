
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from './firebaseConfig.json'; // Adjust path as necessary if moved

const app = initializeApp(config);
const auth = getAuth(app);

export { auth };

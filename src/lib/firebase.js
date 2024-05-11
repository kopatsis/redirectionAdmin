
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from './firebaseConfig.json';

const app = initializeApp(config);
const auth = getAuth(app);

export { auth };

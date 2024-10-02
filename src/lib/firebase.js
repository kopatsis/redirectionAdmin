
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp(JSON.parse(atob(import.meta.env.VITE_FIREBASE_CONFIG_BASE64)));
const auth = getAuth(app);

export { auth };

// src/routes/reset/+server.js
import { verifyPasswordResetCode } from "firebase/auth";
import { auth } from '$lib/firebase';

export async function load({ url }) {
    const mode = url.searchParams.get('mode');
    const oobCode = url.searchParams.get('oobCode');

    if (mode !== 'resetPassword' || !oobCode) {
        return { status: 400, error: 'Invalid request' };
    }

    try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        console.log(email)
        return { props: { email, oobCode } };
    } catch (error) {
        return { status: 400, error: error.message };
    }
}

import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from '$lib/firebase';
import { invalid } from '@sveltejs/kit';

export async function load({ url }) {
    const mode = url.searchParams.get('mode');
    const oobCode = url.searchParams.get('oobCode');

    if (mode !== 'verifyEmail' || !oobCode) {
        return invalid(400, { error: 'Invalid request' });
    }

    try {
        const apiKey = process.env.API_KEY;
        const email = await checkActionCode(auth, oobCode);
        await applyActionCode(auth, oobCode);

        const response = await fetch('https://adminapi.i9fit.co/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error(`Failed to notify the backend: ${response.statusText}`);
        }

        return {
            props: { email, message: 'Your email has been successfully verified.' }
        };
    } catch (error) {
        return invalid(400, { error: error.message });
    }
}

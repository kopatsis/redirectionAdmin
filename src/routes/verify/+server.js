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
        const email = await checkActionCode(auth, oobCode);
        await applyActionCode(auth, oobCode);

        const response = await fetch('https://backendapi.i9fit.co/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

<script>
	import {
		confirmPasswordReset,
		verifyPasswordResetCode,
		checkActionCode,
		applyActionCode,
		signInWithEmailAndPassword
	} from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import { onMount } from 'svelte';

	let oobCode;

	let mainError = null;
	let noParams = false;
	let verified = false;

	let loading = true;
	let email = '';
	let mode = '';
	let modeVerified = false;

	let password = '';
	let confirmPassword = '';
	let message = '';
	let processing = false;

	let isValidPassword = false;
	let passwordsMatch = false;
	let hasMinimumLength = false;
	let containsLetter = false;
	let containsNumber = false;

	let lengthMessage = '';
	let letterMessage = '';
	let numberMessage = '';
	let matchMessage = '';

	$: hasMinimumLength = password.length >= 10;
	$: containsLetter = /[a-zA-Z]/.test(password);
	$: containsNumber = /\d/.test(password);

	$: isValidPassword = hasMinimumLength && containsLetter && containsNumber;

	$: passwordsMatch = password === confirmPassword;

	$: lengthMessage = hasMinimumLength
		? 'Length is sufficient.'
		: 'Password must be at least 10 characters.';
	$: letterMessage = containsLetter
		? 'Contains at least one letter.'
		: 'Password must contain at least one letter.';
	$: numberMessage = containsNumber
		? 'Contains at least one number.'
		: 'Password must contain at least one number.';
	$: matchMessage = passwordsMatch ? 'Passwords match.' : 'Passwords do not match.';

	async function resetPassword() {
		if (isValidPassword && passwordsMatch) {
			try {
				processing = true;
				await confirmPasswordReset(auth, oobCode, password);

				message = 'Password successfully updated.';
				password = '';
				confirmPassword = '';
			} catch (error) {
				message = `Failed to update password: ${error.message}`;
			} finally {
				try {
					await signInWithEmailAndPassword(auth, email, password);

					const user = auth.currentUser;
					if (user) {
						const idToken = await user.getIdToken(true);
						const url = `${import.meta.env.VITE_ADMIN_URL}/resetdate`;

						await fetch(url, {
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${idToken}`
							}
						});

						await auth.signOut();
					}
				} catch (err) {
					console.error(err);
				} finally {
					processing = false;
				}
			}
		}
	}

	async function verifyEmail() {
		try {
			const email = await checkActionCode(auth, oobCode);
			await applyActionCode(auth, oobCode);
			verified = true;
		} catch (error) {
			mainError = error;
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		oobCode = new URLSearchParams(window.location.search).get('oobCode');
		mode = new URLSearchParams(window.location.search).get('mode');
		console.log(oobCode, mode);

		if (!oobCode && !mode) {
			noParams = true;
			loading = false;
			return;
		}

		if ((mode !== 'resetPassword' && mode !== 'verifyEmail') || !oobCode) {
			mainError = 'wrong params';
			loading = false;
			return;
		}

		if (mode === 'verifyEmail') {
			verifyEmail();
		} else {
			try {
				const em = await verifyPasswordResetCode(auth, oobCode);
				console.log(email);
				email = em;
			} catch (error) {
				mainError = 'invalid code';
			} finally {
				loading = false;
			}
		}
	});
</script>

{#if loading}
	<div>loading...</div>
{:else if noParams}
	<h1>Hello</h1>
	<div>If you are looking for the actual i9 Admin Panel:</div>
	<button><a href="https://seashell-app-t8qro.ondigitalocean.app/">Admin Panel</a></button>
{:else if verified}
	<h1>You verified your email</h1>
	<div>Yay!</div>
{:else if mainError}
	<div>Huge fucking error: {mainError}</div>
{:else if modeVerified}
	<div>Nice! Your email has been verified.</div>
{:else}
	<form on:submit|preventDefault={resetPassword}>
		<h1>Reset Your Password</h1>
		<p>Resetting password for: <strong>{email}</strong></p>
		<div>Please be aware that this will sign you out of all devices.</div>

		<div class="form-group">
			<label for="new-password">New Password:</label>
			<input id="new-password" type="password" bind:value={password} required />
		</div>

		<p>{lengthMessage}</p>
		<p>{letterMessage}</p>
		<p>{numberMessage}</p>

		<div class="form-group">
			<label for="confirm-password">Confirm New Password:</label>
			<input id="confirm-password" type="password" bind:value={confirmPassword} required />
		</div>

		<p>{matchMessage}</p>

		<button type="submit" disabled={processing}>Reset Password</button>

		{#if message}
			<p class={message.startsWith('Failed') ? 'error' : 'success'}>{message}</p>
		{/if}
	</form>
{/if}

<style>
	.form-group {
		margin-bottom: 1rem;
	}
	label {
		display: block;
		margin-bottom: 0.5rem;
	}
	input[type='password'] {
		padding: 0.8rem;
		font-size: 1rem;
	}
	button {
		padding: 0.8rem 1.2rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.error {
		color: red;
	}
	.success {
		color: green;
	}
</style>

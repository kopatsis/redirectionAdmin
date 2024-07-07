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

	function validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	$: emailValid = validateEmail(email);

	$: hasMinimumLength = password.length >= 10;
	$: containsLetter = /[a-zA-Z]/.test(password);
	$: containsNumber = /\d/.test(password);

	$: isValidPassword = hasMinimumLength && containsLetter && containsNumber;

	$: passwordsMatch = password === confirmPassword;

	async function resetPassword() {
		if (isValidPassword && passwordsMatch) {
			try {
				processing = true;
				await confirmPasswordReset(auth, oobCode, password);
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
					message = 'Password successfully updated.';
					password = '';
					confirmPassword = '';
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

<div class="centerpage">
	<div class="wholepage">
		<div class="innercontent">
			{#if loading}
				<div>loading...</div>
			{:else if noParams}
				<h1>Hello, person</h1>
				<div>If you are looking for the actual i9 Admin Panel:</div>
				<button><a href="https://seashell-app-t8qro.ondigitalocean.app">Admin Panel</a></button>
			{:else if verified}
				<h1>You verified your email</h1>
				<div>Yay!</div>
			{:else if mainError}
				<div>Huge fucking error: {mainError}</div>
			{:else if modeVerified}
				<div>Nice! Your email has been verified.</div>
			{:else}
				<form on:submit|preventDefault={resetPassword}>
					<div class="loginouter">
						<div class="logintxt">Reset Your Password</div>
						<div>Resetting password for: <strong>{email}</strong></div>
						<div class="verif">
							Warning: Please be aware that this will sign you out of ALL devices.
						</div>
					</div>

					<div class="form-group">
						<label class="hide" for="new-password">New Password:</label>
						<input id="new-password" type="password" bind:value={password} required />
					</div>

					<div class="verif" class:complete={hasMinimumLength}>
						{#if hasMinimumLength}&check;{:else}&times;{/if} Password must be at least 10 characters
					</div>
					<div class="verif" class:complete={containsLetter}>
						{#if containsLetter}&check;{:else}&times;{/if} Password must contain at least one letter
					</div>
					<div class="verif" class:complete={containsNumber}>
						{#if containsNumber}&check;{:else}&times;{/if} Password must contain at least one number
					</div>

					<div class="form-group">
						<label class="hide" for="confirm-password">Confirm New Password:</label>
						<input id="confirm-password" type="password" bind:value={confirmPassword} required />
					</div>

					<div class="verif" class:invis={!isValidPassword || passwordsMatch}>
						Passwords do not match
					</div>

					{#if isValidPassword && passwordsMatch}
						<button class="submit" on:click|preventDefault={resetPassword}>Sign Up</button>
						<div class="verif complete">Ready to submit!</div>
					{:else}
						<button class="submit" type="button">Sign Up</button>
						<div class="verif">Please complete all required fields</div>
					{/if}

					{#if message}
						<p class={message.startsWith('Failed') ? 'error' : 'success'}>{message}</p>
					{/if}
				</form>
			{/if}
		</div>
	</div>
</div>

<style>

	.centerpage {
		display: flex;
		align-items: center;
		justify-content: center;
		display: flex;
		position: fixed;
		background-color: rgb(97, 97, 97);
		width: 100dvw;
		height: 100dvh;
	}

	.wholepage {
		height: 100dvh;
		width: min(100dvw, 960px);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		position: fixed;
		background: white;
	}

	.innercontent {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		width: 100%;
		align-items: center;
		margin-bottom: -20px;
		padding-bottom: 25px;
	}

	.verif.invis {
		visibility: hidden;
	}

	.logintxt {
		font-size: 48px;
	}

	.loginouter {
		display: flex;
		min-height: 40dvh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	@media (max-height: 700px) {
		.loginouter {
			min-height: 34.2857dvh;
		}
	}

	@media (max-height: 600px) {
		.loginouter {
			min-height: 28.5714dvh;
		}
	}

	@media (max-height: 500px) {
		.loginouter {
			min-height: 25dvh;
		}
	}

	@media (max-height: 400px) {
		.loginouter {
			min-height: fit-content;
		}
	}

	.submit {
		border-radius: 0px;
		transition: border-color 150ms ease-in-out 0s;
		outline: none;
		font-size: 16px;
		margin: 10px;
		padding-top: 6px;
		padding-bottom: 6px;
		padding-left: 12px;
		padding-right: 12px;
		border: 1px solid rgb(137, 151, 155);
		color: inherit;
		background-color: transparent;
		font-weight: normal;
	}

	.submit:hover {
		background-color: aliceblue;
	}

	button {
		cursor: pointer;
	}

	.hide {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		border: 0;
		clip: rect(0, 0, 0, 0);
	}

	input {
		border: 1px solid rgb(137, 151, 155);
		border-radius: 0px;
		transition: border-color 150ms ease-in-out 0s;
		outline: none;
		font-size: 16px;
		margin: 4px;
		padding-left: 10px;
		padding-right: 10px;
		min-width: min(444px, calc(100dvw - 50px));
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.verif {
		font-size: 14px;
		margin-top: -1px;
		margin-bottom: -1px;
		color: red;
	}

	.verif.complete {
		color: green;
	}
</style>

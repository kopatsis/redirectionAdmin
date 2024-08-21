<script>
	import {
		confirmPasswordReset,
		verifyPasswordResetCode,
		checkActionCode,
		applyActionCode,
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

	let password = '';
	let confirmPassword = '';
	let message = '';
	let processing = false;

	let isValidPassword = false;
	let hasMinimumLength = false;
	let containsLetter = false;
	let containsNumber = false;

	$: hasMinimumLength = password.length >= 10;
	$: containsLetter = /[a-zA-Z]/.test(password);
	$: containsNumber = /\d/.test(password);

	$: isValidPassword = hasMinimumLength && containsLetter && containsNumber;

	async function resetPassword() {
		if (isValidPassword) {
			try {
				processing = true;
				await confirmPasswordReset(auth, oobCode, password);
			} catch (error) {
				message = `Failed to update password: ${error.message}`;
			} finally {
				message = 'Password successfully updated.';
				password = '';
				confirmPassword = '';
				processing = false;
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
		<div class="loghead-log">
			<b class="logheadtxt">Shorten Track</b>
		</div>
		<div class="innercontent">
			{#if loading}
				<div class="loading" id="loader" style="display: none">
					<div class="bouncer">
						<img src="/images/i9logotsp.png" alt="sdafa" />
					</div>
					<div class="loader2"></div>
				</div>
			{/if}
			{#if noParams}
				<h1 class="head">Hello, person</h1>
				<div class="head">If you are looking for the actual Shorten Track site:</div>
				<button class="submit"><a href="https://shortentrack.com">Here</a></button>
			{:else if verified}
				<div class="logintxt head">You verified your email</div>
				<div class="head">Yay!</div>
				<div class="head">If you are looking for the Shorten Track site:</div>
				<button class="submit"><a href="https://shortentrack.com">Here</a></button>
			{:else if mainError}
				<div class="head">Something went wrong :/ most likely your code is expired</div>
			{:else}
				<form on:submit|preventDefault={resetPassword}>
					<div class="loginouter">
						<div class="logintxt head">Reset Your Password</div>
						<div class="head">Resetting password for: <strong>{email}</strong></div>
						<div class="head">
							&excl;&nbsp;Warning: Please be aware that this will sign you out of ALL devices.
						</div>
					</div>

					<div class="form-group">
						<label class="hide" for="new-password">New Password:</label>
						<input
							id="new-password"
							type="password"
							bind:value={password}
							placeholder="New Password"
							required
						/>
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

					{#if isValidPassword}
						<button class="submit" type="submit">Reset</button>
						<div class="verif complete">Ready to submit!</div>
					{:else}
						<button class="submit" type="button">Reset</button>
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
		position: fixed;
		background-color: rgb(97, 97, 97);
		width: 100dvw;
		height: 100dvh;
	}

	.wholepage {
		height: 100dvh;
		width: min(100dvw, 900px);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		position: fixed;
		background: rgba(236, 241, 243, 0.85);
		box-shadow:
			rgba(0, 0, 0, 0.25) 0px 54px 55px,
			rgba(0, 0, 0, 0.12) 0px -12px 30px,
			rgba(0, 0, 0, 0.12) 0px 4px 6px,
			rgba(0, 0, 0, 0.17) 0px 12px 13px,
			rgba(0, 0, 0, 0.09) 0px -3px 5px;
	}

	@media (max-width: 900px) {
		.wholepage {
			background: rgba(236, 241, 243, 0.8);
		}
	}

	.centerpage::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			rgb(36, 4, 48) 0%,
			rgba(0, 0, 0, 1) 50%,
			rgb(1, 26, 24) 100%
		);
		z-index: -2;
	}

	.centerpage::after {
		content: '';
		position: absolute;
		top: -300%;
		left: -300%;
		width: 600%;
		height: 600%;
		background-image: url('/images/bgminitr2.png');
		background-repeat: repeat;
		background-size: 121px 51px;
		transform: rotate(45deg);
		transform-origin: center;
		z-index: -1;
	}

	.innercontent {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		width: 100%;
		align-items: center;
	}

	.verif.invis {
		visibility: hidden;
	}

	.logintxt {
		font-size: 36px;
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

	a {
		text-decoration: none;
		color: inherit;
	}

	.head {
		margin: 5px;
		text-align: center;
	}

	.bouncer {
		padding: 10px;
		padding-top: 20px;
	}

	.bouncer img {
		height: auto;
		width: clamp(100px, 50dvw, 300px);
		animation: bounce 0.6s infinite;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(218, 229, 225, 0.85);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2000;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-25px);
			animation-timing-function: cubic-bezier(0.62, 0.1, 0.62, 1.21);
		}
	}

	.loader2 {
		width: 50px;
		aspect-ratio: 1;
		display: grid;
		border-radius: 50%;
		background:
			linear-gradient(0deg, rgb(0 0 0/50%) 30%, #0000 0 70%, rgb(0 0 0/100%) 0) 50%/8% 100%,
			linear-gradient(90deg, rgb(0 0 0/25%) 30%, #0000 0 70%, rgb(0 0 0/75%) 0) 50%/100% 8%;
		background-repeat: no-repeat;
		animation: l23 0.6s infinite steps(12);
	}
	.loader2::before,
	.loader2::after {
		content: '';
		grid-area: 1/1;
		border-radius: 50%;
		background: inherit;
		opacity: 0.915;
		transform: rotate(30deg);
	}
	.loader2::after {
		opacity: 0.83;
		transform: rotate(60deg);
	}
	@keyframes l23 {
		100% {
			transform: rotate(1turn);
		}
	}

	.loghead-log {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		background: white;
		height: clamp(24px, 10dvw, 54px);
		font-size: clamp(16px, 8dvw, 48px);
		z-index: 6;
	}
	.logheadtxt {
		user-select: none;
		font-family: 'Fira Code', Courier, monospace;
	}
</style>

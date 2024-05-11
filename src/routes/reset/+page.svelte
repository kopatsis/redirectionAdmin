<script>
	import { confirmPasswordReset } from 'firebase/auth';
	import { auth } from '$lib/firebase';

	export let email;
	export let oobCode;

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
				processing = false;
			}
		}
	}
</script>

<form on:submit|preventDefault={resetPassword}>
	<h1>Reset Your Password</h1>
	<p>Resetting password for: <strong>{email}</strong></p>

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

<style>
	.form-group {
		margin-bottom: 1rem;
	}
	label {
		display: block;
		margin-bottom: 0.5rem;
	}
	input[type='password'] {
		width: 100%;
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

<script>
    import { confirmPasswordReset } from "firebase/auth";
    import { auth } from '$lib/firebase';
  
    export let email;
    export let oobCode;
  
    let newPassword = '';
    let confirmPassword = '';
    let message = '';
    let processing = false;
  
    function validatePassword(password) {
      return password.length >= 10 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    }
  
    async function resetPassword() {
      message = '';
      if (newPassword !== confirmPassword) {
        message = 'Passwords do not match';
        return;
      }
      if (!validatePassword(newPassword)) {
        message = 'Password must be at least 10 characters long and include at least one letter and one number.';
        return;
      }
  
      try {
        processing = true;
        await confirmPasswordReset(auth, oobCode, newPassword);
        message = 'Password successfully updated. You can now log in with your new password.';
        newPassword = '';
        confirmPassword = '';
      } catch (error) {
        message = `Failed to update password: ${error.message}`;
      } finally {
        processing = false;
      }
    }
  </script>
  
  <form on:submit|preventDefault={resetPassword}>
    <h1>Reset Your Password</h1>
    <p>Resetting password for: <strong>{email}</strong></p>
  
    <div class="form-group">
      <label for="new-password">New Password:</label>
      <input id="new-password" type="password" bind:value={newPassword} required>
    </div>
  
    <div class="form-group">
      <label for="confirm-password">Confirm New Password:</label>
      <input id="confirm-password" type="password" bind:value={confirmPassword} required>
    </div>
  
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
    input[type="password"] {
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
  
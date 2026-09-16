export function friendlyAuthError(error: any): string {
  const code: string = error?.code || error?.name || "";

  if (typeof console !== "undefined") {
    console.error("Auth error:", code, error?.message || error);
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-password":
      return "The email or password is incorrect.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Your password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "A network error occurred. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "Sign-in isn't allowed from this website yet.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't available. Try email & password instead.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The sign-in window was closed. Please try again.";
    case "auth/requires-recent-login":
      return "This action requires a recent sign-in. Please sign out and sign back in.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/configuration-not-found":
    case "auth/api-key-not-valid":
    case "auth/project-not-found":
      return "Sign-in is temporarily unavailable. Please try again in a few minutes.";
    default:
      return "Something went wrong. Please try again.";
  }
}
import { useOktaAuth } from '@okta/okta-react';

function Landing() {
  const { authState, oktaAuth } = useOktaAuth();
  if (!authState?.isAuthenticated) {
    return <button onClick={() => oktaAuth.signInWithRedirect()}>Login with Okta</button>;
  }
  return <div>Welcome! <a href="/upload">Upload Resume</a></div>;
}
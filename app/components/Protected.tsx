import { useAuth } from '../context/AuthContext';

export default function Protected({ children }: { children: JSX.Element }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <div>Please sign in to access this content.</div>;
  }
  
  return children;
}

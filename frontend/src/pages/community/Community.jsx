import { useState, useEffect } from 'react';
import CommunityPage from '../../components/community/CommunityPage';

export default function Community() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get token from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Please log in to access the community.</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  return <CommunityPage token={token} user={user} />;
}

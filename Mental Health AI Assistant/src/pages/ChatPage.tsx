import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatPage as ChatComponent } from '../components/ChatPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function ChatPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Chat', path: '/chat' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="AI Assistant Chat"
      onBack={() => navigate('/')}
      maxWidth="4xl"
    >
      <ChatComponent onBack={() => navigate('/')} />
    </Layout>
  );
}
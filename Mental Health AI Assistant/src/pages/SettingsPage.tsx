import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsPage as SettingsComponent } from '../components/SettingsPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Settings', path: '/settings' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Settings"
      onBack={() => navigate('/dashboard')}
      maxWidth="4xl"
    >
      <SettingsComponent onBack={() => navigate('/dashboard')} />
    </Layout>
  );
}
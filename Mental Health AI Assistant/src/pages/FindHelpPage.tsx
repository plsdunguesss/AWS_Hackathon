import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FindHelpPage as FindHelpComponent } from '../components/FindHelpPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function FindHelpPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Find Help', path: '/find-help' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Find Help"
      onBack={() => navigate('/')}
    >
      <FindHelpComponent 
        onBack={() => navigate('/')}
        onViewProfessionals={() => navigate('/professionals')}
      />
    </Layout>
  );
}
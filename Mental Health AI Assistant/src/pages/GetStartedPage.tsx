import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetStartedPage as GetStartedComponent } from '../components/GetStartedPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function GetStartedPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Get Started', path: '/get-started' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Get Started"
      onBack={() => navigate('/')}
    >
      <GetStartedComponent 
        onBack={() => navigate('/')}
        onStartAssessment={() => navigate('/assessment')}
        onComplete={() => navigate('/dashboard')}
      />
    </Layout>
  );
}
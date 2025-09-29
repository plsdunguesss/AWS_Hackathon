import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearnMorePage as LearnMoreComponent } from '../components/LearnMorePage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function LearnMorePage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Learn More', path: '/learn-more' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Learn More"
      onBack={() => navigate('/')}
    >
      <LearnMoreComponent 
        onBack={() => navigate('/')}
        onGetStarted={() => navigate('/get-started')}
        onStartAssessment={() => navigate('/assessment')}
      />
    </Layout>
  );
}
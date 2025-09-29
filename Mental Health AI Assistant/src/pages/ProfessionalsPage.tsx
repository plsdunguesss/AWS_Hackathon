import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalDirectory } from '../components/ProfessionalDirectory';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function ProfessionalsPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Find Help', path: '/professionals' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Mental Health Professionals"
      onBack={() => navigate('/')}
    >
      <ProfessionalDirectory onBack={() => navigate('/')} />
    </Layout>
  );
}
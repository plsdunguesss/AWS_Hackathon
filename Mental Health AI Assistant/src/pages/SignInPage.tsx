import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInPage as SignInComponent } from '../components/SignInPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function SignInPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Sign In', path: '/sign-in' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Sign In"
      onBack={() => navigate('/')}
    >
      <SignInComponent 
        onBack={() => navigate('/')}
        onGetStarted={() => navigate('/get-started')}
      />
    </Layout>
  );
}
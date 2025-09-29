import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentForm, AssessmentResults } from '../components/AssessmentForm';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function AssessmentPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Assessment', path: '/assessment' }
    ]);
  }, [setBreadcrumbs]);

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentResults(results);
    // Store results in sessionStorage for the results page
    sessionStorage.setItem('assessmentResults', JSON.stringify(results));
    navigate('/results');
  };

  return (
    <Layout 
      title="Mental Health Assessment"
      onBack={() => navigate('/')}
    >
      <AssessmentForm 
        onComplete={handleAssessmentComplete}
        onBack={() => navigate('/')}
      />
    </Layout>
  );
}
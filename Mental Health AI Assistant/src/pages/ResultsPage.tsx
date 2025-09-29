import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { AssessmentResults } from '../components/AssessmentForm';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function ResultsPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Assessment', path: '/assessment' },
      { label: 'Results', path: '/results' }
    ]);

    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('assessmentResults');
    if (storedResults) {
      setAssessmentResults(JSON.parse(storedResults));
    } else {
      // If no results found, redirect to assessment
      navigate('/assessment');
    }
  }, [setBreadcrumbs, navigate]);

  if (!assessmentResults) {
    return null; // Will redirect to assessment
  }

  return (
    <Layout 
      title="Assessment Results"
      onBack={() => navigate('/assessment')}
    >
      <ResultsDisplay 
        results={assessmentResults}
        onBack={() => navigate('/assessment')}
        onViewProfessionals={() => navigate('/professionals')}
      />
    </Layout>
  );
}
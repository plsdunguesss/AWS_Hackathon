import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';

interface SafetyStatus {
  backendConnection: boolean;
  safetyFilters: boolean;
  crisisDetection: boolean;
  professionalReferrals: boolean;
  dataProtection: boolean;
}

interface SafetyMonitorProps {
  onSafetyIssue?: (issue: string) => void;
  showStatus?: boolean;
}

export function SafetyMonitor({ onSafetyIssue, showStatus = false }: SafetyMonitorProps) {
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    backendConnection: false,
    safetyFilters: false,
    crisisDetection: false,
    professionalReferrals: false,
    dataProtection: false
  });
  const [isChecking, setIsChecking] = useState(true);
  const [criticalIssues, setCriticalIssues] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkSafetyStatus();
  }, []);

  const checkSafetyStatus = async () => {
    setIsChecking(true);
    const issues: string[] = [];

    try {
      // Check backend connection
      const backendResponse = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const backendConnected = backendResponse.ok;
      
      // Check safety filters
      let safetyFiltersWorking = false;
      if (backendConnected) {
        try {
          const safetyResponse = await fetch('http://localhost:5000/api/safety/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'test safety filters' })
          });
          safetyFiltersWorking = safetyResponse.ok;
        } catch (error) {
          console.warn('Safety filter check failed:', error);
        }
      }

      // Check crisis detection
      let crisisDetectionWorking = false;
      if (backendConnected) {
        try {
          const crisisResponse = await fetch('http://localhost:5000/api/crisis/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'test crisis detection' })
          });
          crisisDetectionWorking = crisisResponse.ok;
        } catch (error) {
          console.warn('Crisis detection check failed:', error);
        }
      }

      // Check professional referrals
      let professionalReferralsWorking = false;
      try {
        const referralResponse = await fetch('http://localhost:5000/api/professionals', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        professionalReferralsWorking = referralResponse.ok;
      } catch (error) {
        console.warn('Professional referrals check failed:', error);
      }

      // Check data protection (local storage and session management)
      const dataProtectionWorking = typeof(Storage) !== "undefined" && 
                                   sessionStorage.getItem !== undefined;

      // Update status
      setSafetyStatus({
        backendConnection: backendConnected,
        safetyFilters: safetyFiltersWorking,
        crisisDetection: crisisDetectionWorking,
        professionalReferrals: professionalReferralsWorking,
        dataProtection: dataProtectionWorking
      });

      // Collect critical issues
      if (!backendConnected) {
        issues.push('Backend connection failed - AI chat may not work properly');
      }
      if (!safetyFiltersWorking) {
        issues.push('Safety filters not responding - conversations may not be properly monitored');
      }
      if (!crisisDetectionWorking) {
        issues.push('Crisis detection system not responding - emergency situations may not be detected');
      }
      if (!professionalReferralsWorking) {
        issues.push('Professional referral system not available - users may not receive proper help recommendations');
      }
      if (!dataProtectionWorking) {
        issues.push('Data protection systems not working - user privacy may be compromised');
      }

      setCriticalIssues(issues);

      // Notify parent component of issues
      if (issues.length > 0 && onSafetyIssue) {
        onSafetyIssue(issues.join('; '));
      }

    } catch (error) {
      console.error('Safety status check failed:', error);
      setCriticalIssues(['Unable to verify safety systems - please check your connection']);
      if (onSafetyIssue) {
        onSafetyIssue('Safety system verification failed');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleEmergencyMode = () => {
    // Redirect to emergency resources if safety systems are compromised
    navigate('/find-help');
  };

  if (!showStatus && criticalIssues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Safety System Issues Detected:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {criticalIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={checkSafetyStatus}
                  disabled={isChecking}
                >
                  {isChecking ? 'Checking...' : 'Retry Check'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEmergencyMode}
                >
                  Emergency Resources
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showStatus && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Safety System Status:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {safetyStatus.backendConnection ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  }
                  Backend Connection
                </div>
                <div className="flex items-center gap-2">
                  {safetyStatus.safetyFilters ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  }
                  Safety Filters
                </div>
                <div className="flex items-center gap-2">
                  {safetyStatus.crisisDetection ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  }
                  Crisis Detection
                </div>
                <div className="flex items-center gap-2">
                  {safetyStatus.professionalReferrals ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  }
                  Professional Referrals
                </div>
                <div className="flex items-center gap-2">
                  {safetyStatus.dataProtection ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  }
                  Data Protection
                </div>
              </div>
              {criticalIssues.length === 0 && (
                <p className="text-green-600 font-medium">All safety systems operational</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
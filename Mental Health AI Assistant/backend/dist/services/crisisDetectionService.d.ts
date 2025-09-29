import { SafetyFlags, CrisisResponse, CrisisResource } from '../types';
import { SafetyMonitorService } from './safetyMonitorService';
export declare class CrisisDetectionService {
    private safetyMonitor;
    private crisisThreshold;
    private immediateThreshold;
    constructor(safetyMonitor?: SafetyMonitorService);
    /**
     * Perform real-time crisis detection on user message
     */
    detectCrisis(message: string, conversationHistory?: string[]): Promise<{
        isCrisis: boolean;
        isImmediate: boolean;
        safetyFlags: SafetyFlags;
        crisisResponse?: CrisisResponse;
        riskScore: number;
    }>;
    /**
     * Check if conversation should trigger professional referral
     */
    shouldTriggerReferral(riskScore: number, safetyFlags: SafetyFlags): boolean;
    /**
     * Generate crisis response with appropriate resources
     */
    generateCrisisResponse(riskScore: number, isImmediate: boolean, safetyFlags: SafetyFlags): Promise<CrisisResponse>;
    /**
     * Get crisis resources based on urgency level
     */
    getCrisisResources(isImmediate?: boolean): CrisisResource[];
    /**
     * Calculate crisis risk score based on message content and context
     */
    private calculateCrisisRisk;
    /**
     * Generate fallback crisis response for error situations
     */
    private generateFallbackCrisisResponse;
    /**
     * Format crisis response for display
     */
    formatCrisisMessage(crisisResponse: CrisisResponse): string;
    /**
     * Log crisis detection event for monitoring
     */
    logCrisisEvent(sessionId: string, messageId: string, riskScore: number, safetyFlags: SafetyFlags, responseGenerated: boolean): Promise<void>;
}
//# sourceMappingURL=crisisDetectionService.d.ts.map
import { SafetyFlags } from '../types';
export declare class SafetyMonitorService {
    private crisisKeywords;
    private harmKeywords;
    scanForHarmfulContent(message: string): Promise<SafetyFlags>;
    preventHarmfulSuggestions(aiResponse: string): Promise<string>;
    handleCrisisDetection(userId: string, riskLevel: number): Promise<any>;
}
//# sourceMappingURL=safetyMonitorService.d.ts.map
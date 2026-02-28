import { Button } from '@/components/ui/button';

export default function TriageResults({
  symptoms,
  triageData,
  onFindHospital,
  onBack,
}: {
  symptoms: string[];
  triageData: any;
  onFindHospital: () => void;
  onBack: () => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-green-100 border-green-300 text-green-900';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'moderate':
        return '⚡';
      case 'low':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <button
            onClick={onBack}
            className="text-primary hover:text-primary/80 transition-colors mb-4 font-sans text-sm"
          >
            ← Home
          </button>
          <h1 className="text-3xl font-bold text-foreground font-sans">
            Medical Assessment
          </h1>
        </div>

        {/* Severity Badge */}
        {triageData?.severity && (
          <div
            className={`p-6 rounded-lg border mb-6 ${getSeverityColor(
              triageData.severity
            )}`}
          >
            <div className="text-4xl mb-2">{getSeverityEmoji(triageData.severity)}</div>
            <div className="font-semibold text-lg font-sans mb-1">
              {triageData.severity.toUpperCase()}
            </div>
            <div className="text-sm opacity-90 font-sans">
              {triageData.severityDescription || 'See medical professional'}
            </div>
          </div>
        )}

        {/* Reported Symptoms */}
        <div className="bg-card p-4 rounded-lg border border-border mb-6">
          <h2 className="font-semibold text-foreground mb-3 font-sans">
            Your Symptoms
          </h2>
          <ul className="space-y-2">
            {symptoms.map((symptom) => (
              <li
                key={symptom}
                className="flex items-center gap-2 text-sm text-foreground font-sans"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                {symptom}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        {triageData?.recommendations && (
          <div className="bg-card p-4 rounded-lg border border-border mb-6">
            <h2 className="font-semibold text-foreground mb-3 font-sans">
              Recommendations
            </h2>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              {triageData.recommendations}
            </p>
          </div>
        )}

        {/* Conditions */}
        {(triageData?.possibleConditions || []).length > 0 && (
          <div className="bg-card p-4 rounded-lg border border-border mb-6">
            <h2 className="font-semibold text-foreground mb-3 font-sans">
              Possible Conditions
            </h2>
            <ul className="space-y-2">
              {(triageData?.possibleConditions || []).slice(0, 3).map(
                (condition: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground font-sans"
                  >
                    • {condition}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onFindHospital}
            className="w-full bg-primary hover:bg-primary/90 text-white font-sans"
          >
            Find Nearby Hospitals
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full font-sans"
          >
            Back to Home
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <p className="text-xs text-muted-foreground font-sans">
            ⚠️ This assessment is not a substitute for professional medical advice.
            Always consult with a qualified healthcare provider for diagnosis and
            treatment.
          </p>
        </div>
      </div>
    </div>
  );
}

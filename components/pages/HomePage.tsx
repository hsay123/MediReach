import { Button } from '@/components/ui/button';

export default function HomePage({
  onStartSymptomCheck,
  onAdminAccess,
}: {
  onStartSymptomCheck: () => void;
  onAdminAccess: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-sans">
            MediReach
          </h1>
          <p className="text-lg text-muted-foreground font-sans">
            Fast medical triage and hospital finder
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 mb-12">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
              Assess Your Symptoms
            </h2>
            <p className="text-muted-foreground text-sm mb-4 font-sans">
              Get quick medical triage and find the nearest hospital based on your symptoms.
            </p>
            <Button
              onClick={onStartSymptomCheck}
              className="w-full bg-primary hover:bg-primary/90 text-white font-sans"
            >
              Start Symptom Check
            </Button>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2 font-sans">
              How It Works
            </h2>
            <ol className="space-y-2 text-sm text-muted-foreground font-sans">
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">1</span>
                <span>Describe your symptoms to our AI</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">2</span>
                <span>Get medical triage assessment</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">3</span>
                <span>Find nearby hospitals instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary flex-shrink-0">4</span>
                <span>Book appointment or visit</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Admin Access */}
        <button
          onClick={onAdminAccess}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
        >
          Admin Dashboard
        </button>
      </div>
    </div>
  );
}

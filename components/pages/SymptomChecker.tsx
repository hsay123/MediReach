import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COMMON_SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Chest pain',
  'Shortness of breath',
  'Dizziness',
  'Nausea',
  'Fatigue',
  'Sore throat',
  'Body aches',
  'Difficulty breathing',
  'Abdominal pain',
];

const pulseKeyframes = `
@keyframes pulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  70%  { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(239,68,68,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}
`;

export default function SymptomChecker({
  onSubmit,
  onBack,
}: {
  onSubmit: (symptoms: string[], data: any) => void;
  onBack: () => void;
}) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceInput = () => {
    // Mic requires HTTPS or localhost — block early with a clear message
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setMicError(
        '❌ Open http://localhost:3000 in your browser — mic does not work over network IP on HTTP.'
      );
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Voice not supported. Please use Chrome browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
      } else if (interimTranscript) {
        setInputValue(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMicError(
          '❌ Mic blocked. Click the 🔒 icon in browser address bar → Allow Microphone.'
        );
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected. Please try again.');
      } else {
        setMicError('Error: ' + event.error + '. Try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const addSymptom = (symptom: string) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setInputValue('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleAddFromInput = () => {
    if (inputValue.trim()) {
      addSymptom(inputValue.trim());
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (symptoms.length === 0) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) throw new Error('Failed to analyze symptoms');
      const data = await response.json();
      onSubmit(symptoms, data);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Inject pulse animation */}
      <style>{pulseKeyframes}</style>

      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <button
            onClick={onBack}
            className="text-primary hover:text-primary/80 transition-colors mb-4 font-sans text-sm"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-foreground font-sans">
            What symptoms are you experiencing?
          </h1>
        </div>

        {/* Text Input with embedded mic button */}
        <div className="flex gap-2 mb-2">
          <div style={{ position: 'relative', flex: 1 }}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFromInput()}
              placeholder="Type or speak a symptom..."
              className="font-sans pr-12"
            />
            <button
              type="button"
              onClick={startVoiceInput}
              style={{
                position: 'absolute',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isListening ? '#EF4444' : '#2563EB',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                animation: isListening ? 'pulse 1s infinite' : 'none',
                transition: 'background-color 0.2s ease',
              }}
              title={isListening ? 'Tap to stop' : 'Tap to speak'}
            >
              {isListening ? '⏹' : '🎤'}
            </button>
          </div>
          <Button
            onClick={handleAddFromInput}
            variant="outline"
            className="px-4 font-sans"
          >
            Add
          </Button>
        </div>

        {/* Voice status messages */}
        {isListening && (
          <p style={{ color: '#2563EB', fontSize: '13px', marginTop: '6px', marginBottom: '6px' }}>
            🔴 Listening... speak now
          </p>
        )}
        {micError && (
          <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', marginBottom: '6px' }}>
            {micError}
          </p>
        )}

        {/* Common Symptoms */}
        <div className="mb-8 mt-6">
          <p className="text-sm text-muted-foreground mb-3 font-sans">
            Common symptoms:
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => addSymptom(symptom)}
                disabled={symptoms.includes(symptom)}
                className="px-3 py-2 text-sm bg-card border border-border rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Symptoms */}
        {symptoms.length > 0 && (
          <div className="bg-card p-4 rounded-lg border border-border mb-6">
            <p className="text-sm font-semibold text-foreground mb-3 font-sans">
              Selected symptoms ({symptoms.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary rounded-full"
                >
                  <span className="text-sm font-sans">{symptom}</span>
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="text-primary hover:text-primary/80 transition-colors font-sans font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleAnalyzeSymptoms}
          disabled={symptoms.length === 0 || isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90 text-white font-sans"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </Button>
      </div>
    </div>
  );
}

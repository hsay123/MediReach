import { NextRequest, NextResponse } from 'next/server';

// Mock triage logic using symptom analysis
export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Invalid symptoms' },
        { status: 400 }
      );
    }

    // AI-powered symptom analysis
    // In production, integrate with Claude API
    const triageResult = analyzeSymptoms(symptoms);

    return NextResponse.json(triageResult);
  } catch (error) {
    console.error('[v0] Triage API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}

function analyzeSymptoms(symptoms: string[]) {
  // Symptom severity mapping
  const severityMap: { [key: string]: number } = {
    'chest pain': 9,
    'difficulty breathing': 9,
    'severe headache': 7,
    'loss of consciousness': 10,
    'severe bleeding': 10,
    'shortness of breath': 8,
    'abdominal pain': 6,
    'high fever': 7,
    'confusion': 8,
    'seizure': 9,
    'severe allergic reaction': 9,
    'poisoning': 10,
    'broken bone': 6,
    'burns': 7,
    'severe wound': 8,
    'dizziness': 4,
    'nausea': 3,
    'mild headache': 2,
    'fatigue': 2,
    'cough': 3,
    'sore throat': 2,
    'fever': 4,
    'body aches': 3,
  };

  // Calculate severity
  let maxSeverity = 0;
  let severitySum = 0;

  symptoms.forEach((symptom) => {
    const severity = severityMap[symptom.toLowerCase()] || 3;
    maxSeverity = Math.max(maxSeverity, severity);
    severitySum += severity;
  });

  // Determine severity level
  let severity = 'Low';
  if (maxSeverity >= 8) {
    severity = 'Critical';
  } else if (maxSeverity >= 7) {
    severity = 'High';
  } else if (maxSeverity >= 5) {
    severity = 'Moderate';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(severity, symptoms);
  const possibleConditions = generateConditions(symptoms);

  return {
    symptoms: symptoms || [],
    severity,
    severityDescription: getSeverityDescription(severity),
    recommendations,
    possibleConditions: possibleConditions || [],
    shouldSeeEmergency: maxSeverity >= 7,
  };
}

function getSeverityDescription(severity: string): string {
  const descriptions: { [key: string]: string } = {
    Critical:
      'Seek immediate emergency care. Call 911 or go to the nearest emergency room.',
    High: 'Seek urgent medical attention today. Contact your doctor or visit an urgent care center.',
    Moderate:
      'See a healthcare provider soon. You may visit urgent care or schedule an appointment.',
    Low: 'Monitor your symptoms. Rest and stay hydrated. Consult a doctor if symptoms persist.',
  };
  return descriptions[severity] || 'Consult a healthcare provider.';
}

function generateRecommendations(severity: string, symptoms: string[]): string {
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase()).join(' ');

  if (severity === 'Critical') {
    return 'This requires immediate emergency medical attention. Please call 911 or visit the nearest emergency room immediately.';
  }

  if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('cough')) {
    return 'Get plenty of rest and stay hydrated. Monitor your temperature regularly. Seek medical attention if symptoms worsen.';
  }

  if (
    lowerSymptoms.includes('pain') ||
    lowerSymptoms.includes('ache') ||
    lowerSymptoms.includes('discomfort')
  ) {
    return 'Try rest and over-the-counter pain relief if appropriate. Apply ice or heat as needed. Seek medical advice if pain persists.';
  }

  return 'Monitor your symptoms closely. Maintain good hygiene and rest. Seek medical attention if symptoms worsen or persist beyond a few days.';
}

function generateConditions(symptoms: string[]): string[] {
  const conditions: { [key: string]: string[] } = {
    'chest pain': [
      'Angina',
      'Heart Attack',
      'Muscle Strain',
      'Acid Reflux',
      'Pneumonia',
    ],
    'difficulty breathing': [
      'Asthma',
      'Pneumonia',
      'Heart Condition',
      'Anxiety',
      'Allergic Reaction',
    ],
    fever: [
      'Influenza',
      'Common Cold',
      'Infection',
      'COVID-19',
      'Urinary Tract Infection',
    ],
    cough: [
      'Common Cold',
      'Bronchitis',
      'Asthma',
      'Allergies',
      'Pneumonia',
    ],
    headache: [
      'Migraine',
      'Tension Headache',
      'Sinusitis',
      'Dehydration',
      'Meningitis',
    ],
    dizziness: [
      'Vertigo',
      'Low Blood Pressure',
      'Inner Ear Disorder',
      'Dehydration',
      'Anxiety',
    ],
    nausea: [
      'Gastroenteritis',
      'Food Poisoning',
      'Motion Sickness',
      'Medication Side Effect',
      'Pregnancy',
    ],
  };

  const possibleConditions = new Set<string>();

  symptoms.forEach((symptom) => {
    const lowerSymptom = symptom.toLowerCase();
    Object.keys(conditions).forEach((key) => {
      if (lowerSymptom.includes(key) || key.includes(lowerSymptom)) {
        conditions[key].forEach((c) => possibleConditions.add(c));
      }
    });
  });

  // If no specific conditions found, return general conditions
  if (possibleConditions.size === 0) {
    return ['General Illness', 'Infection', 'Allergic Reaction'];
  }

  return Array.from(possibleConditions).slice(0, 5);
}

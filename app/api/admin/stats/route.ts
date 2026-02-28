import { NextRequest, NextResponse } from 'next/server';

// Mock data storage
let appData = {
  totalChecks: 1247,
  checks: [
    { symptoms: ['headache', 'fever'], severity: 'Moderate', timestamp: new Date() },
    { symptoms: ['cough', 'sore throat'], severity: 'Low', timestamp: new Date(Date.now() - 3600000) },
    { symptoms: ['chest pain', 'shortness of breath'], severity: 'Critical', timestamp: new Date(Date.now() - 7200000) },
  ],
  bookings: 156,
};

export async function GET(request: NextRequest) {
  try {
    // Calculate statistics
    const totalChecks = appData.totalChecks;
    const hospitalBookings = appData.bookings;

    // Calculate average severity
    const severityValues: { [key: string]: number } = {
      'Critical': 4,
      'High': 3,
      'Moderate': 2,
      'Low': 1,
    };

    const averageSeverityValue =
      appData.checks.reduce((sum, check) => {
        const value = severityValues[check.severity] || 1;
        return sum + value;
      }, 0) / appData.checks.length;

    let averageSeverity = 'Low';
    if (averageSeverityValue >= 3.5) {
      averageSeverity = 'Critical';
    } else if (averageSeverityValue >= 2.8) {
      averageSeverity = 'High';
    } else if (averageSeverityValue >= 1.8) {
      averageSeverity = 'Moderate';
    }

    // Calculate top symptoms
    const symptomCounts: { [key: string]: number } = {};
    appData.checks.forEach((check) => {
      check.symptoms.forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptom]) => symptom);

    // Generate recent activity
    const recentActivity = appData.checks.slice(0, 10).map((check, idx) => ({
      type: 'Symptom Check',
      description: `User checked symptoms: ${check.symptoms.join(', ')} - Severity: ${check.severity}`,
      timestamp: new Date(check.timestamp).toLocaleTimeString(),
    }));

    return NextResponse.json({
      stats: {
        totalChecks,
        averageSeverity,
        topSymptoms,
        hospitalBookings,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('[v0] Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

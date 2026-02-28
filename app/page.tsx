'use client';

import { useState, useEffect } from 'react';
import HomePage from '@/components/pages/HomePage';
import SymptomChecker from '@/components/pages/SymptomChecker';
import TriageResults from '@/components/pages/TriageResults';
import HospitalFinder from '@/components/pages/HospitalFinder';
import SuccessPage from '@/components/pages/SuccessPage';
import AdminDashboard from '@/components/pages/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triageData, setTriageData] = useState<any | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [adminAccess, setAdminAccess] = useState<boolean>(false);

  const handleStartSymptomCheck = () => {
    setSymptoms([]);
    setCurrentPage('symptom-checker');
  };

  const handleSymptomSubmit = (symptomsList: string[], data: any) => {
    setSymptoms(symptomsList);
    setTriageData(data);
    setCurrentPage('triage-results');
  };

  const handleFindHospital = () => {
    setCurrentPage('hospital-finder');
  };

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
    setCurrentPage('success');
  };

  const handleHomeClick = () => {
    setAdminAccess(false);
    setCurrentPage('home');
  };

  const handleAdminAccess = () => {
    setCurrentPage('admin');
    setAdminAccess(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'home' && (
        <HomePage
          onStartSymptomCheck={handleStartSymptomCheck}
          onAdminAccess={handleAdminAccess}
        />
      )}
      {currentPage === 'symptom-checker' && (
        <SymptomChecker
          onSubmit={handleSymptomSubmit}
          onBack={handleHomeClick}
        />
      )}
      {currentPage === 'triage-results' && (
        <TriageResults
          symptoms={symptoms}
          triageData={triageData}
          onFindHospital={handleFindHospital}
          onBack={handleHomeClick}
        />
      )}
      {currentPage === 'hospital-finder' && (
        <HospitalFinder
          severity={triageData?.severity}
          onHospitalSelect={handleHospitalSelect}
          onBack={() => setCurrentPage('triage-results')}
        />
      )}
      {currentPage === 'success' && (
        <SuccessPage
          hospital={selectedHospital}
          onNewSearch={handleHomeClick}
        />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard onBack={handleHomeClick} />
      )}
    </div>
  );
}

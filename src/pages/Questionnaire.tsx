
import React from 'react';
import Questionnaire from '@/components/questionnaire/Questionnaire';
import ProtectedRoute from '@/components/ProtectedRoute';

const QuestionnairePage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Questionnaire />
      </div>
    </ProtectedRoute>
  );
};

export default QuestionnairePage;

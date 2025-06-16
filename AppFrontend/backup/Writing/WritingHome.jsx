import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WritingPage from './writingPage';
import { useTimer } from '../../lib/TimerContext';
import ExamContainer from '../ui/ExamContainer';

const WritingHome = () => {
  const navigate = useNavigate();
  const { resetTimer, setTimerStarted } = useTimer();
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handleBackToStart = () => {
    resetTimer();
    navigate('/skills');
  };

  const handleStartNow = () => {
    // Only start the timer when user clicks "Start Exam"
    setTimerStarted(true);
    setShowInstructions(false);
  };

  const renderInstructions = () => (
    <ExamContainer>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/skills')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <span className="material-icons mr-1">arrow_back</span>
            Home
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">IELTS Writing Practice</h1>
          
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">IELTS Writing Test Instructions</h1>
            
            <div className="space-y-6 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Overview</h2>
                <p>The IELTS Writing test consists of two tasks. You will need to complete both tasks to receive a complete evaluation.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Test Format</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Task 1:</strong> Describe visual information (graph/chart/diagram) in 150+ words (20 minutes)</li>
                  <li><strong>Task 2:</strong> Write an essay on a given topic in 250+ words (40 minutes)</li>
                  <li>Task 2 contributes twice as much as Task 1 to your final Writing band score</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Assessment Criteria</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Task Achievement/Response:</strong> How well you address all parts of the task</li>
                  <li><strong>Coherence and Cohesion:</strong> How well you organize information and ideas</li>
                  <li><strong>Lexical Resource:</strong> The range and accuracy of your vocabulary</li>
                  <li><strong>Grammatical Range and Accuracy:</strong> The range and accuracy of your grammar</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h2 className="text-xl font-semibold text-yellow-700 mb-2">Important Tips</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plan your time carefully to complete both tasks</li>
                  <li>Write clearly and organize your ideas logically</li>
                  <li>Use a variety of sentence structures and vocabulary</li>
                  <li>Stay on topic and address all parts of the task</li>
                  <li>Check your work for errors when you finish</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={handleStartNow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </ExamContainer>
  );

  return showInstructions ? renderInstructions() : <WritingPage onBackToStart={handleBackToStart} />;
};

export default WritingHome;
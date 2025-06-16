import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../../lib/TimerContext';
import ExamContainer from '../ui/ExamContainer';

const ReadingInstructions = () => {
  const navigate = useNavigate();
  const { resetTimer, setTimerStarted } = useTimer();

  const startExam = () => {
    // Start the timer when navigating to the exam
    setTimerStarted(true);
    navigate('/reading/exam');
  };

  return (
    <ExamContainer>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">IELTS Reading Test Instructions</h1>
        
        <div className="space-y-6 text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Overview</h2>
            <p>The IELTS Reading test assesses your ability to understand written English in various contexts. The test contains 3 sections with increasing difficulty.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Test Format</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Duration: 60 minutes</li>
              <li>3 sections with increasing difficulty</li>
              <li>Total of 40 questions</li>
              <li>Various question types (multiple choice, matching, short answer, etc.)</li>
              <li>No extra time given for transferring answers</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Tips for Success</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Read the instructions carefully for each question</li>
              <li>Pay attention to word limits for short-answer questions</li>
              <li>Manage your time - approximately 20 minutes per section</li>
              <li>Don't spend too long on difficult questions</li>
              <li>Transfer your answers accurately if using an answer sheet</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Important Notes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Spelling and grammar count in your answers</li>
              <li>All answers must be written on the answer sheet</li>
              <li>No extra time is allowed for transferring answers</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={startExam}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Start Exam
          </button>
        </div>
      </div>
    </ExamContainer>
  );
};

export default ReadingInstructions; 
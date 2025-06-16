import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../../../lib/TimerContext';
import ExamContainer from '../../ui/ExamContainer';

const WritingInstructions = ({ onStartExam }) => {
  const navigate = useNavigate();
  const { setTimerStarted } = useTimer();

  const handleStartExam = () => {
    // Start the timer when starting the exam
    setTimerStarted(true);
    
    if (onStartExam) {
      onStartExam();
    } else {
      // Default navigation if no callback is provided
      navigate('/toefl/writing/exam');
    }
  };

  return (
    <ExamContainer>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">TOEFL Writing Test Instructions</h1>
        
        <div className="space-y-6 text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Overview</h2>
            <p>The TOEFL iBT Writing section assesses your ability to write clearly and effectively in an academic context. It consists of two distinct tasks and has a total time allocation of 29 minutes.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Test Format</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Task 1 - Integrated Writing:</strong> Read a passage (250-300 words), listen to a lecture (2 minutes), and write a response that summarizes the main points of the lecture and explains how they relate to the reading passage (20 minutes)</li>
              <li><strong>Task 2 - Writing for an Academic Discussion:</strong> Read a prompt from a professor and two student responses, then write your own contribution to the academic discussion (10 minutes)</li>
              <li>Both tasks are scored on a scale of 0-5 by AI scoring and certified human raters, and converted to a scaled score of 0-30</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Assessment Criteria</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Task 1 (Integrated):</strong> Accuracy and completeness of content, quality of integration from both sources, organization and language use</li>
              <li><strong>Task 2 (Academic Discussion):</strong> Relevance and clarity of contribution, elaboration and support for your opinion, overall language proficiency</li>
              <li><strong>Overall Skills:</strong> Ability to synthesize information, articulate and defend opinions, grammar, vocabulary, and syntax</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Important Tips</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>For Task 1, demonstrate your ability to synthesize information and identify key ideas from both the reading and lecture - do not give your own opinion</li>
              <li>For Task 2, state and support your opinion while engaging with ideas from the professor and other students</li>
              <li>Focus on showing how the lecture supports, contradicts, or offers an alternative perspective to the reading passage in Task 1</li>
              <li>Use appropriate language for academic discussion in Task 2</li>
              <li>Plan your response before writing to ensure clear organization and leave time to review for errors</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={handleStartExam}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Start Exam
          </button>
        </div>
      </div>
    </ExamContainer>
  );
};

export default WritingInstructions;
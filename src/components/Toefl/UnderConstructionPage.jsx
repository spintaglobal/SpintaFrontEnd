import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnderConstructionPage = ({ examType }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/toefl-skills');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-amber-500 mb-6">
            <span className="material-icons text-8xl">construction</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Under Construction</h1>
          <p className="text-xl text-gray-600 mb-6">
            The TOEFL {examType} section is currently under development. Please check back later.
          </p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-200 shadow-md"
          >
            Return to TOEFL Skills
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstructionPage; 
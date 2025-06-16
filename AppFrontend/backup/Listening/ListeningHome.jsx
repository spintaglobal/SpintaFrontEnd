import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const ListeningHome = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">IELTS Listening Practice</h2>
      <p className="text-lg text-slate-600 mb-8">
        Enhance your listening comprehension with practice materials and exercises designed for the IELTS Listening test.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">About IELTS Listening</h3>
            <p className="text-slate-600 mb-4">
              The IELTS Listening test consists of four recorded sections with increasing difficulty, and you'll have 30 minutes to complete it plus 10 minutes for transferring answers.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Section 1: A conversation between two people in a social context</li>
              <li>Section 2: A monologue in a social context</li>
              <li>Section 3: A conversation between up to four people in an educational context</li>
              <li>Section 4: A monologue on an academic subject</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Listening Tips</h3>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Read instructions and questions carefully before listening</li>
              <li>Predict possible answers based on the questions</li>
              <li>Pay attention to signpost words (e.g., 'however', 'therefore')</li>
              <li>Listen for specific information like numbers, dates, and names</li>
              <li>Check spelling and grammar in your answers</li>
              <li>Write in capital letters if you're unsure about your handwriting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center">
        <p className="text-slate-600 mb-6">
          This feature is coming soon. Listening practice tests will be available in future updates.
        </p>
        <Link to="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ListeningHome;
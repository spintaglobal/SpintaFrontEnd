// IELTS Reading Test Types

export interface IeltsQuestion {
  questionNumber: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'SENTENCE_COMPLETION' | 'SHORT_ANSWER' | 'MATCHING_HEADINGS' | 'PARAGRAPH_MATCHING' | 'MATCH_SENTENCE_ENDINGS' | 'IDENTIFYING_WRITERS_VIEWS' | 'IDENTIFYING_INFORMATION' | 'MATCHING_FEATURES';
  correctAnswer?: string;
  maxWords?: number; // For sentence completion and short answer questions
  options?: Array<{ [key: string]: string }>; // For multiple choice questions
  headingsList?: string[]; // For matching headings questions
  items?: Array<{
    itemText: string;
    correctHeading?: string;
    correctAnswer?: string; // For match sentence endings
  }>; // For matching questions
  stems?: string[]; // For match sentence endings questions
  endings?: Array<{ [key: string]: string }>; // For match sentence endings questions
  passageReference?: string; // For referencing the passage
}

export interface IeltsPassage {
  passageNumber: number;
  passageTitle: string;
  passageText: string;
  questions: IeltsQuestion[];
}

export interface IeltsSection {
  sectionNumber: number;
  sectionTitle: string;
  passages: IeltsPassage[];
}

export interface IeltsTest {
  testId: string;
  testTitle: string;
  estimatedTimeMinutes: number;
  sections: IeltsSection[];
}

export interface UserAnswer {
  questionNumber: number;
  answer: string | string[] | { [key: string]: string };
  isSubQuestion?: boolean;
  parentQuestionNumber?: number;
}

export interface TestState {
  currentSectionIndex: number;
  currentPassageIndex: number;
  currentQuestionIndex: number;
  userAnswers: Map<number, UserAnswer>;
  timeRemaining: number;
  isSubmitted: boolean;
} 
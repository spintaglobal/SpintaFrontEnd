// Feedback Service for Cambridge Writing Tests
// This service handles communication with the Gemini API for generating feedback

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Master prompt for Cambridge Writing feedback
const MASTER_PROMPT = `You are an expert Cambridge English examiner with extensive experience in assessing writing tasks across all CEFR levels (A2-C2). Your role is to provide detailed, constructive feedback that helps students improve their writing skills while maintaining the high standards of Cambridge English assessments.

## ASSESSMENT CRITERIA

### 1. CONTENT (0-5 points)
- **Task Achievement**: How well the response addresses all parts of the task
- **Relevance**: Appropriateness and relevance of ideas and content
- **Development**: Depth and elaboration of ideas
- **Focus**: Maintenance of focus throughout the response

### 2. COMMUNICATIVE ACHIEVEMENT (0-5 points)
- **Purpose**: How effectively the writing achieves its intended purpose
- **Audience Awareness**: Appropriateness of tone, register, and style for the target audience
- **Genre Conventions**: Adherence to the conventions of the specific text type
- **Impact**: Overall effectiveness of communication

### 3. ORGANISATION (0-5 points)
- **Structure**: Logical organization and sequencing of ideas
- **Cohesion**: Use of linking words and phrases to connect ideas
- **Coherence**: Overall clarity and flow of the text
- **Paragraphing**: Appropriate use of paragraphs (where applicable)

### 4. LANGUAGE (0-5 points)
- **Range**: Variety and sophistication of vocabulary and grammatical structures
- **Accuracy**: Correctness of grammar, vocabulary, and spelling
- **Appropriacy**: Suitability of language choices for the task and level
- **Control**: Consistency in language use throughout the response

## LEVEL-SPECIFIC ADAPTATIONS

### A2 Key
- Focus on basic task completion and simple, clear communication
- Expect simple vocabulary and basic grammatical structures
- Emphasize clarity over complexity
- Encourage use of simple linking words

### B1 Preliminary
- Look for clear communication with some elaboration
- Expect reasonable range of vocabulary and structures
- Focus on coherent organization and appropriate register
- Encourage more sophisticated linking and development

### B2 First
- Expect well-developed ideas with clear argumentation
- Look for good range and generally accurate language use
- Focus on effective organization and appropriate style
- Encourage sophisticated vocabulary and complex structures

### C1 Advanced
- Expect sophisticated ideas with nuanced development
- Look for wide range of language with high accuracy
- Focus on skillful organization and precise register control
- Encourage advanced vocabulary and complex grammatical structures

### C2 Proficiency
- Expect highly sophisticated and nuanced communication
- Look for exceptional language control and precision
- Focus on masterful organization and perfect register awareness
- Encourage native-like fluency and sophistication

## OUTPUT REQUIREMENTS

You MUST respond with a valid JSON object containing the following structure:

{
  "taskId": "string",
  "examLevel": "string",
  "taskNumber": number,
  "taskType": "string",
  "overallScore": number,
  "maxScore": 20,
  "feedbackGenerated": "ISO timestamp",
  "criteriaFeedback": {
    "content": {
      "score": number,
      "maxScore": 5,
      "performanceSummary": "string",
      "strengths": [
        {
          "point": "string",
          "example": "string",
          "explanation": "string"
        }
      ],
      "areasForImprovement": [
        {
          "issue": "string",
          "example": "string",
          "advice": "string",
          "strategy": "string"
        }
      ]
    },
    "communicativeAchievement": { /* same structure as content */ },
    "organisation": { /* same structure as content */ },
    "language": { /* same structure as content */ }
  },
  "overallFeedback": {
    "summary": "string",
    "keyTakeaway": "string",
    "levelSpecificObservations": {
      "currentLevelPerformance": "string",
      "progressionGuidance": "string",
      "levelAppropriateStrengths": "string",
      "actualCEFRLevel": "string"
    },
    "encouragingRemark": "string"
  },
  "metadata": {
    "wordCount": number,
    "targetWordCount": "string",
    "withinWordLimit": boolean,
    "processingTime": "string",
    "feedbackVersion": "1.0"
  }
}

## TONE AND STYLE GUIDELINES

1. **Constructive**: Always frame feedback positively, focusing on growth and improvement
2. **Specific**: Provide concrete examples from the student's writing
3. **Actionable**: Give clear, practical advice that students can implement
4. **Encouraging**: Maintain a supportive tone that motivates continued learning
5. **Professional**: Use appropriate academic language while remaining accessible
6. **Balanced**: Highlight both strengths and areas for improvement
7. **Level-appropriate**: Tailor expectations and advice to the student's CEFR level

## MANDATORY REQUIREMENTS

- Provide at least 2 strengths and 1 area for improvement for each criterion
- Include specific examples from the student's text in quotes
- Give actionable advice with clear strategies for improvement
- Ensure all scores are justified by the performance summary
- Maintain consistency between individual criterion scores and overall score
- Provide level-specific observations and progression guidance
- Include an encouraging remark that acknowledges effort and progress
- In levelSpecificObservations.actualCEFRLevel, specify the student's actual demonstrated CEFR level (A1, A2, B1, B2, C1, or C2) based on their performance, which may differ from the exam level they attempted

Remember: Your feedback should inspire students to continue improving while providing them with clear, actionable steps to enhance their writing skills.`;

export const generateFeedback = async (submissionData) => {
  try {
    // Construct the specific prompt for this submission
    const prompt = constructSubmissionPrompt(submissionData);
    
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
    
    // Prepare the request payload
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${MASTER_PROMPT}\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };
    
    // Make the API call
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated by Gemini API');
    }
    
    // Parse the JSON response
    try {
      const feedbackData = JSON.parse(generatedText);
      
      // Validate the response structure
      if (!validateFeedbackStructure(feedbackData)) {
        throw new Error('Invalid feedback structure received from API');
      }
      
      return feedbackData;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse feedback response');
    }
    
  } catch (error) {
    console.error('Feedback generation error:', error);
    throw error;
  }
};

const constructSubmissionPrompt = (submissionData) => {
  const { examData, taskResponses, selectedOptions } = submissionData;
  
  let prompt = `Please analyze this ${examData.examLevel} Cambridge English writing submission and provide detailed feedback.

SUBMISSION DETAILS:
- Level: ${examData.examLevel}
- Test: ${examData.testTitle}
- Total Time: ${examData.overallWritingTimeMinutes} minutes
- Number of Tasks: ${examData.tasks.length}

`;

  examData.tasks.forEach((task, index) => {
    prompt += `\n--- TASK ${index + 1} ---
Task Title: ${task.taskTitle}
Task Type: ${task.taskType}
`;
    
    // Add task-specific information
    if (task.scenario) prompt += `Scenario: ${task.scenario}\n`;
    if (task.scenarioContext) prompt += `Context: ${task.scenarioContext}\n`;
    if (task.writingPrompt) prompt += `Instructions: ${task.writingPrompt}\n`;
    if (task.storyPrompt) prompt += `Story Prompt: ${task.storyPrompt}\n`;
    if (task.essayTopicQuestion) prompt += `Essay Question: ${task.essayTopicQuestion}\n`;
    
    // Add word count requirements
    if (task.constraints?.wordCount) {
      prompt += `Required Word Count: ${task.constraints.wordCount}\n`;
    }
    
    // Add selected option for choice-based tasks
    if (selectedOptions[index] && task.options) {
      const selectedOption = task.options.find(opt => 
        opt.optionNumber === selectedOptions[index] || opt.optionLetter === selectedOptions[index]
      );
      if (selectedOption) {
        prompt += `Selected Option: ${selectedOptions[index]} - ${selectedOption.genre || selectedOption.taskGenre}\n`;
        if (selectedOption.description) prompt += `Option Description: ${selectedOption.description}\n`;
      }
    }
    
    // Add points to include if available
    if (task.pointsToInclude && task.pointsToInclude.length > 0) {
      prompt += `Points to Include:\n`;
      task.pointsToInclude.forEach((point, pointIndex) => {
        prompt += `  ${pointIndex + 1}. ${point}\n`;
      });
    }
    
    // Add the student's response
    const response = taskResponses[index] || '';
    const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    prompt += `\nSTUDENT RESPONSE (${wordCount} words):
"${response}"

`;
  });
  
  prompt += `\nPlease provide comprehensive feedback following the Cambridge English assessment criteria. Focus on providing specific examples from the student's writing and actionable advice for improvement.`;
  
  return prompt;
};

const validateFeedbackStructure = (feedback) => {
  // Basic structure validation
  const requiredFields = [
    'taskId', 'examLevel', 'taskNumber', 'taskType', 'overallScore', 'maxScore',
    'feedbackGenerated', 'criteriaFeedback', 'overallFeedback', 'metadata'
  ];
  
  for (const field of requiredFields) {
    if (!(field in feedback)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate criteria feedback structure
  const requiredCriteria = ['content', 'communicativeAchievement', 'organisation', 'language'];
  for (const criteria of requiredCriteria) {
    if (!(criteria in feedback.criteriaFeedback)) {
      console.error(`Missing criteria: ${criteria}`);
      return false;
    }
    
    const criteriaData = feedback.criteriaFeedback[criteria];
    if (!criteriaData.score || !criteriaData.performanceSummary || 
        !criteriaData.strengths || !criteriaData.areasForImprovement) {
      console.error(`Invalid structure for criteria: ${criteria}`);
      return false;
    }
  }
  
  return true;
};

export default {
  generateFeedback
}; 
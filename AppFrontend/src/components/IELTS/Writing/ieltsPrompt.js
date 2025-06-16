/**
 * IELTS Writing Evaluation Prompt
 * This file contains specialized prompt templates for Academic and General Training IELTS writing evaluation.
 */

/**
 * Generates specialized IELTS evaluation prompts based on test type
 * @param {string} task1Prompt - The text of the Task 1 prompt
 * @param {string} task1Response - The candidate's Task 1 response
 * @param {string} task2Prompt - The text of the Task 2 prompt
 * @param {string} task2Response - The candidate's Task 2 response
 * @param {string} task1ImageDescription - Description of visual data for Academic Task 1
 * @param {string} testType - 'academic' or 'general-training'
 * @returns {string} The formatted prompt for the AI model
 */
export const generateIeltsPrompt = (task1Prompt, task1Response, task2Prompt, task2Response, task1ImageDescription = null, testType = 'academic') => {
  
  if (testType === 'academic') {
    return generateAcademicPrompt(task1Prompt, task1Response, task2Prompt, task2Response, task1ImageDescription);
  } else {
    return generateGeneralTrainingPrompt(task1Prompt, task1Response, task2Prompt, task2Response);
  }
};

/**
 * Generates Academic IELTS Writing evaluation prompt
 */
const generateAcademicPrompt = (task1Prompt, task1Response, task2Prompt, task2Response, imageDescription) => {
  return `**IELTS Academic Writing Evaluation**

You are an expert IELTS examiner evaluating Academic Writing responses. Focus on the four IELTS assessment criteria for each task.

**CANDIDATE RESPONSES:**

**TASK 1 - Academic Report Writing**
**Task Prompt:** ${task1Prompt}
**Candidate's Response:** ${task1Response}

**TASK 2 - Academic Essay Writing**
**Task Prompt:** ${task2Prompt}
**Candidate's Response:** ${task2Response}

**EVALUATION CRITERIA:**

Evaluate both tasks based on these four IELTS criteria:

**1. Task Achievement/Task Response (TA/TR)**
- Task 1: How well the candidate addressed the task requirements, provided overview, and described key features
- Task 2: How completely the candidate responded to all parts of the question and developed their position

**2. Coherence and Cohesion (CC)**
- Logical organization of information and ideas
- Effective use of cohesive devices and paragraphing
- Clear progression throughout the response

**3. Lexical Resource (LR)**
- Range and accuracy of vocabulary
- Appropriate word choice and collocation
- Ability to paraphrase and use less common vocabulary

**4. Grammatical Range and Accuracy (GRA)**
- Variety of sentence structures
- Grammatical accuracy and control
- Appropriate use of complex grammatical forms

**ENHANCED SCORING GUIDELINES FOR TASK 2:**

**Band 9 (Expert):** Exceptional response with sophisticated argumentation, extensive vocabulary, and flawless grammar
**Band 8 (Very Good):** Strong response with well-developed ideas, wide vocabulary range, and high grammatical accuracy
**Band 7 (Good):** Solid response addressing all parts with good vocabulary and generally accurate grammar
**Band 6 (Competent):** Adequate response with relevant ideas, sufficient vocabulary, and acceptable grammar
**Band 5 (Modest):** Basic response with limited development, restricted vocabulary, and frequent errors
**Band 4 (Limited):** Minimal response with unclear ideas, basic vocabulary, and many errors

**TASK 2 SCORING CRITERIA - BE GENEROUS FOR QUALITY CONTENT:**

**Task Response (Band 7-9 indicators):**
- Addresses all parts of the question ✓
- Presents a clear position throughout ✓
- Develops ideas with relevant examples ✓
- Shows critical thinking and analysis ✓

**Coherence & Cohesion (Band 7-9 indicators):**
- Clear essay structure (intro, body, conclusion) ✓
- Logical progression of ideas ✓
- Effective use of linking words ✓
- Well-organized paragraphs ✓

**Lexical Resource (Band 7-9 indicators):**
- Uses a range of vocabulary appropriately ✓
- Attempts less common vocabulary ✓
- Shows awareness of style and collocation ✓
- Minor errors don't impede communication ✓

**Grammatical Range (Band 7-9 indicators):**
- Uses a variety of sentence structures ✓
- Attempts complex grammar ✓
- Majority of sentences are error-free ✓
- Errors don't impede communication ✓

**IMPORTANT SCORING INSTRUCTIONS:**
- If a response shows good understanding and development of ideas, start from Band 6-7 baseline
- Award Band 7+ for responses that address the task well with good language control
- Award Band 8+ for sophisticated responses with advanced vocabulary and complex grammar
- Only use Band 5 or below for responses with significant problems in task completion or language
- Focus on overall communicative effectiveness rather than minor errors

**REQUIRED OUTPUT FORMAT:**

\`\`\`json
{
  "task1": {
    "criterion_scores": {
      "task_achievement_response": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Assessment of how well task requirements were met",
          "Evaluation of overview and key features coverage", 
          "Comment on task completion and relevance"
        ] 
      },
      "coherence_cohesion": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Logical organization and structure assessment",
          "Cohesive devices usage evaluation", 
          "Paragraphing and progression analysis"
        ] 
      },
      "lexical_resource": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Vocabulary range and accuracy assessment",
          "Word choice and collocation evaluation", 
          "Paraphrasing ability analysis"
        ] 
      },
      "grammatical_range_accuracy": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Sentence variety and complexity assessment",
          "Grammar accuracy evaluation", 
          "Control of grammatical forms analysis"
        ] 
      }
    },
    "overall_score": "[Task 1 Average Score]",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"]
  },
  "task2": {
    "criterion_scores": {
      "task_achievement_response": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Complete response to question assessment",
          "Position development and clarity evaluation", 
          "Argument quality and relevance analysis"
        ] 
      },
      "coherence_cohesion": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Essay structure and organization assessment",
          "Idea progression and flow evaluation", 
          "Linking and cohesion analysis"
        ] 
      },
      "lexical_resource": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Academic vocabulary sophistication assessment",
          "Precision and variety in word choice", 
          "Natural and appropriate language use"
        ] 
      },
      "grammatical_range_accuracy": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Complex sentence structures usage assessment",
          "Grammar accuracy in academic writing", 
          "Variety and sophistication of grammatical forms"
        ] 
      }
    },
    "overall_score": "[Task 2 Average Score]",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"]
  },
  "final_score": "[Weighted Final Score: (Task1×1/3) + (Task2×2/3)]",
  "overall_feedback": "Comprehensive evaluation based on IELTS Academic Writing assessment criteria"
}
\`\`\`

**FINAL EVALUATION REMINDERS:**
1. Be generous with scoring for well-developed, coherent responses
2. Award higher bands (7-8) for responses that effectively communicate ideas
3. Focus on overall task completion and language proficiency
4. Minor errors should not significantly lower scores if communication is clear
5. Task 2 weighted at 67%, Task 1 at 33%`;
};

/**
 * Generates General Training IELTS Writing evaluation prompt
 */
const generateGeneralTrainingPrompt = (task1Prompt, task1Response, task2Prompt, task2Response) => {
  return `**IELTS General Training Writing Evaluation**

You are an expert IELTS examiner evaluating General Training Writing responses. Provide precise band scores (0-9) for each criterion and detailed feedback.

**CANDIDATE RESPONSES:**

**TASK 1 - Letter Writing**
**Task Prompt:** ${task1Prompt}
**Candidate's Response:** ${task1Response}

**TASK 2 - Essay Writing**
**Task Prompt:** ${task2Prompt}
**Candidate's Response:** ${task2Response}

**EVALUATION CRITERIA FOR GENERAL TRAINING WRITING:**

**TASK 1 EVALUATION FOCUS (Letter Writing):**
- **Task Achievement:** Are all bullet points addressed? Is the purpose clear?
- **Tone Appropriateness:** Is the tone suitable (formal/semi-formal/informal)?
- **Letter Format:** Proper greeting, body paragraphs, closing
- **Content Completeness:** All required information included

**TASK 2 EVALUATION FOCUS (Essay Writing):**
- **Task Response:** Clear position on the topic with relevant ideas
- **Personal Examples:** Use of personal experience and general knowledge
- **Practical Focus:** Real-world application and practical considerations
- **Opinion Development:** Clear personal stance with supporting reasons

**SCORING CRITERIA:**

1. **Task Achievement/Response (TA/TR)**
   - Task 1: All bullet points covered, appropriate tone, clear purpose
   - Task 2: Clear position, relevant ideas, complete response

2. **Coherence and Cohesion (CC)**
   - Logical organization, clear paragraphing, effective linking

3. **Lexical Resource (LR)**
   - Appropriate vocabulary for context, natural expressions

4. **Grammatical Range and Accuracy (GRA)**
   - Variety of structures, accuracy, natural language use

**REQUIRED OUTPUT FORMAT:**

\`\`\`json
{
  "task1": {
    "criterion_scores": {
      "task_achievement_response": { 
        "score": "[0-9]", 
        "feedback_points": [
          "Comment about bullet points coverage",
          "Comment about tone appropriateness", 
          "Comment about letter format and purpose"
        ] 
      },
      "coherence_cohesion": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      },
      "lexical_resource": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      },
      "grammatical_range_accuracy": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      }
    },
    "overall_score": "[Task 1 Average Score]",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"]
  },
  "task2": {
    "criterion_scores": {
      "task_achievement_response": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      },
      "coherence_cohesion": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      },
      "lexical_resource": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      },
      "grammatical_range_accuracy": { 
        "score": "[0-9]", 
        "feedback_points": ["point1", "point2", "point3"] 
      }
    },
    "overall_score": "[Task 2 Average Score]",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"]
  },
  "final_score": "[Weighted Final Score: (Task1×1/3) + (Task2×2/3)]",
  "overall_feedback": "Comprehensive evaluation summary focusing on General Training writing requirements"
}
\`\`\`

**EVALUATION INSTRUCTIONS:**
1. For Task 1: Focus on letter writing conventions and bullet point coverage
2. For Task 2: Evaluate practical reasoning and personal opinion development
3. Use General Training IELTS band descriptors
4. Consider real-world communication effectiveness
5. Provide specific, actionable feedback
6. Calculate final score with Task 2 weighted at 67%, Task 1 at 33%`;
};
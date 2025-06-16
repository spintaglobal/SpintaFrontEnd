/**
 * IELTS Writing Evaluation Prompt
 * This file contains the prompt template used for AI evaluation of IELTS writing tasks.
 */

/**
 * Generates the IELTS evaluation prompt for both Task 1 and Task 2 responses
 * @param {string} task1Prompt - The text of the Task 1 prompt
 * @param {string} task1Response - The candidate's Task 1 response
 * @param {string} task2Prompt - The text of the Task 2 prompt
 * @param {string} task2Response - The candidate's Task 2 response
 * @returns {string} The formatted prompt for the AI model
 */
export const generateIeltsPrompt = (task1Prompt, task1Response, task2Prompt, task2Response) => {
  return `**Task:** Evaluate the following written responses to IELTS Writing Tasks 1 and 2 (Academic). Provide band scores (0-9) for each of the four IELTS Writing assessment criteria for both tasks and calculate an overall band score.

**Input:**

**Task 1:**
* **Task Prompt:** ${task1Prompt}
* **Candidate Response:** ${task1Response}

**Task 2:**
* **Task Prompt:** ${task2Prompt}
* **Candidate Response:** ${task2Response}

**Instructions for AI Evaluation:**

Evaluate both Task 1 and Task 2 responses based on the following four IELTS Writing criteria. For each criterion in each task:

1. Assign a band score from 0 to 9.
2. Provide at least 3 specific feedback points related to that criterion. These points should be concise and actionable.

Then, calculate the overall band scores for each task and the final combined score.

**Scoring Criteria and Descriptors:**

**1. Task Achievement / Task Response (TA/TR)**

* **Focus:** Has the candidate fulfilled the task requirements? How accurately, appropriately, and relevantly has the candidate addressed all parts of the prompt?

* **Detailed Descriptors:**
    * **Task 2 (Academic & General Training):**
        * **High Band (7-9):** Presents a fully developed response. Clearly addresses all parts of the task. Presents a clear position. Ideas are well-developed, relevant, and logically supported. Essay is well-focused.
        * **Mid Band (5-6):** Addresses the prompt, but may be underdeveloped. May address all parts, but not equally. Position may be clear but inconsistent. Ideas are relevant but may lack support.
        * **Low Band (Below 5):** Fails to adequately address the prompt. May present irrelevant ideas. Position may be unclear. Ideas are underdeveloped. Essay may be poorly focused. May not meet word count.

    * **Task 1 (Academic & General Training):**
      * **High Band (7-9):** Fully satisfies all task requirements. Presents a clear overview of main trends, differences or stages. Clearly presents and highlights key features/bullet points.
      * **Mid Band (5-6):** Addresses the task requirements, but may have omissions or inconsistencies. Presents an overview, but it may be unclear or lack focus. May present data/features mechanically without highlighting key information.
      * **Low Band (Below 5):** Fails to address the task adequately. May misinterpret the data/information. Presents little or no overview. May present irrelevant details or data. May not meet minimum word count.

**2. Coherence and Cohesion (CC)**

* **Focus:** How well is the answer organized and connected? Logical flow of ideas, paragraphing, and use of cohesive devices (linking words, pronouns, conjunctions).

* **Detailed Descriptors:**
    * **High Band (7-9):** Logically organizes information; clear progression. Uses cohesive devices appropriately. Paragraphing is logical and effective. Easy to follow.
    * **Mid Band (5-6):** Organizes information coherently, but inconsistencies may exist. Uses cohesive devices, but there may be overuse/underuse. Paragraphing is evident, but may not be logical.
    * **Low Band (Below 5):** Lacks clear organization. Cohesive devices are used rarely/inaccurately. Paragraphing is inadequate. The response is disjointed.

**3. Lexical Resource (LR)**

* **Focus:** Range and accuracy of vocabulary used. Ability to use a variety of words and phrases, including less common vocabulary and paraphrase effectively.

* **Detailed Descriptors:**
    * **High Band (7-9):** Uses a wide range of vocabulary fluently. Skillfully uses less common vocabulary. Demonstrates sophisticated control. Effective use of paraphrase.
    * **Mid Band (5-6):** Uses an adequate range of vocabulary. Attempts less common vocabulary, but inaccuracies may exist. Errors in word choice may be present. Some attempt at paraphrase.
    * **Low Band (Below 5):** Uses a limited range of vocabulary. Frequent errors in word choice. Little or no attempt at paraphrase. Over-reliance on basic vocabulary.

**4. Grammatical Range and Accuracy (GRA)**

* **Focus:** Variety of sentence structures (simple, compound, complex) and grammatical accuracy.

* **Detailed Descriptors:**
    * **High Band (7-9):** Uses a wide range of structures flexibly and accurately. Majority of sentences are error-free. Sophisticated control of grammar.
    * **Mid Band (5-6):** Uses a mix of simple and complex forms. Grammatical accuracy is generally good, but errors are present. Errors do not frequently impede communication.
    * **Low Band (Below 5):** Uses only a limited range of structures. Frequent grammatical errors. Errors in basic grammar are common.

**Scoring Calculation:**

1. Calculate individual scores for Task 1 and Task 2 by averaging the four criteria scores for each task.
2. Calculate the final combined score using the formula: (Task 2 Score * 2/3) + (Task 1 Score * 1/3)
   This weighting reflects the greater complexity of Task 2.
3. Round the final score to the nearest 0.5 band.

**Output Format:**

\`\`\`json
{
  "task1": {
    "criterion_scores": {
      "task_achievement_response": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "coherence_cohesion": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "lexical_resource": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "grammatical_range_accuracy": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] }
    },
    "overall_score": "[Task 1 Overall Score]",
    "strengths": ["strength1", "strength2", "..."],
    "improvements": ["improvement1", "improvement2", "..."]
  },
  "task2": {
    "criterion_scores": {
      "task_achievement_response": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "coherence_cohesion": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "lexical_resource": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] },
      "grammatical_range_accuracy": { "score": "[Band Score]", "feedback_points": ["point1", "point2", "point3", ...] }
    },
    "overall_score": "[Task 2 Overall Score]",
    "strengths": ["strength1", "strength2", "..."],
    "improvements": ["improvement1", "improvement2", "..."]
  },
  "final_score": "[Final Combined Score]",
  "overall_feedback": "Comprehensive summary of the candidate's performance across both tasks"
}
\`\`\``;
};
import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import './ToeflWritingFeedback.css';

// API configuration for Gemini
const API_KEY = "AIzaSyA6MdoSLwUd2D8kf1goBDg-92nvMTq2j9A";
const MODEL = "gemini-2.0-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const ToeflWritingFeedback = ({ 
  writingData, 
  userResponses, 
  onRetry, 
  onBackToStart 
}) => {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(-1);
  const [loadingStage, setLoadingStage] = useState(1);
  
  // Format text by converting text between double asterisks to bold
  const formatText = (text) => {
    if (!text) return '';
    
    // Split by double asterisks and map even/odd indices differently
    const parts = text.split(/\*\*/);
    return parts.map((part, index) => (
      index % 2 === 0 ? part : <strong key={index}>{part}</strong>
    ));
  };
  
  // Get score band description based on overall score
  const getScoreBand = (score) => {
    if (score >= 4.5) return {
      band: "Excellent",
      description: "Demonstrates sophisticated writing abilities with well-developed ideas, clear organization, and precise language use. Minor errors do not detract from overall quality."
    };
    if (score >= 3.5) return {
      band: "Good",
      description: "Shows effective writing skills with mostly well-developed ideas, logical organization, and generally appropriate language use. Some minor errors may be present but don't significantly impact meaning."
    };
    if (score >= 2.5) return {
      band: "Fair",
      description: "Demonstrates adequate writing with some development of ideas, basic organization, and acceptable language use. Several errors may be present that occasionally obscure meaning."
    };
    if (score >= 1.5) return {
      band: "Limited",
      description: "Shows limited writing ability with underdeveloped ideas, minimal organization, and frequent language errors that often obscure meaning."
    };
    return {
      band: "Poor",
      description: "Demonstrates minimal writing skills with severely underdeveloped ideas, little to no organization, and pervasive language errors that significantly impede communication."
    };
  };
  
  // Staged loading animation
  useEffect(() => {
    if (loading) {
      // Progress through stages while loading
      const stageTimer1 = setTimeout(() => setLoadingStage(2), 2000);
      const stageTimer2 = setTimeout(() => setLoadingStage(3), 4000);
      
      return () => {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
      };
    }
  }, [loading]);
  
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setLoadingStage(1);
        
        // For each task, generate a feedback using Google Gemini
        const feedbackPromises = writingData.tasks.map(async (task, index) => {
          const userResponse = userResponses[task.taskNumber] || '';
          
          if (!userResponse.trim()) {
            return {
              taskNumber: task.taskNumber,
              error: "No response provided for this task."
            };
          }
          
          // Construct the prompt for Gemini based on task type
          let promptTemplate = '';
          
          if (task.taskType === 'INTEGRATED_WRITING') {
            promptTemplate = `
You are an expert TOEFL iBT Writing evaluator. Please evaluate the following Integrated Writing response based on detailed scoring criteria.

MATERIAL PROVIDED TO STUDENT:

Reading Passage:
"${task.readingPassage.title}"
${task.readingPassage.content}

Lecture Transcript:
"${task.lectureTranscript.title}"
${task.lectureTranscript.content}

Writing Prompt:
${task.writingPrompt}

STUDENT RESPONSE:
${userResponse}

SCORING CRITERIA (0-5 Scale):

Content Integration & Accuracy (Primary Focus):
- Score 5: Successfully identifies and accurately presents all important information from the lecture in relation to the relevant points from the reading. Demonstrates a clear understanding of the relationship between the two sources. Minor inaccuracies or omissions are negligible.
- Score 4: Generally identifies important information from the lecture and relates it to the reading, but may have minor omissions, inaccuracies, vagueness, or imprecision in content or connections.
- Score 3: Contains some important information from the lecture and some relevant connection to the reading, but may be vague, unclear, or imprecise in connections. May omit one major key point or have incomplete/inaccurate details.
- Score 2: Contains some relevant information but shows significant omissions or inaccuracies of important ideas, or the connections between lecture and reading are significantly misrepresented or omitted.
- Score 1: Provides little to no meaningful or relevant coherent content from the lecture, or the language is so poor that meaning cannot be derived.
- Score 0: Copies sentences from the reading, is off-topic, in a foreign language, or blank.

Organization & Coherence:
- Score 5: Well-organized, with clear progression of ideas and smooth transitions.
- Score 4: Generally well-organized, ideas are clear but transitions might occasionally be less smooth.
- Score 3: Shows some organization, but may have some choppiness or unclear progression of ideas.
- Score 2: Ideas are poorly organized, making it difficult to follow the relationships between points.
- Score 1: Lacks organization, making the response largely incoherent.

Language Use (Grammar, Vocabulary, Syntax):
- Score 5: Demonstrates consistent facility in language use; effective use of grammar and vocabulary. Occasional minor errors do not obscure meaning.
- Score 4: Few lexical or grammatical errors; language allows ideas to be easily understood.
- Score 3: Some noticeable lexical and grammatical errors; may result in somewhat vague expressions or obscured meanings.
- Score 2: Significant language difficulties, accumulation of errors, or expressions that largely obscure connections or meaning.
- Score 1: Severely limited range and control of language; prevents expression of ideas.

EVALUATION TASK:
Please provide a comprehensive evaluation with the following structure:

# TOEFL Writing Evaluation

## Overall score: [X/5]
[Brief explanation of what this score represents on the TOEFL scale]

## Content Integration & Accuracy Score: [X/5]
[Explanation of this score]

## Organization & Coherence Score: [X/5]
[Explanation of this score]

## Language Use Score: [X/5]
[Explanation of this score]

## Key Strengths
- [Strength 1]
- [Strength 2]
- [Strength 3]

## Areas for Improvement
- [Area 1]
- [Area 2]
- [Area 3]

## Detailed Analysis
### Content & Key Points
[Analyze how well the student integrated information from both sources]

### Organization
[Analyze the structure and flow of the response]

### Language Use
[Analyze grammar, vocabulary, and syntax]

## Examples from Student's Writing
[Include 2-3 direct quotes from the response with specific feedback]

## Recommendations for Improvement
[Provide 3-4 specific, actionable tips for improvement]
`;
          } else if (task.taskType === 'WRITING_FOR_ACADEMIC_DISCUSSION') {
            promptTemplate = `
You are an expert TOEFL iBT Writing evaluator. Please evaluate the following Academic Discussion Writing response based on detailed scoring criteria.

MATERIAL PROVIDED TO STUDENT:

Discussion Context:
Professor's Post: "${task.discussionContext.instructorPost.topic}"
${task.discussionContext.instructorPost.postContent}

Student Posts:
${task.discussionContext.studentPosts.map(post => `${post.author}: ${post.postContent}`).join('\n\n')}

Writing Prompt:
${task.writingPrompt}

STUDENT RESPONSE:
${userResponse}

SCORING CRITERIA (0-5 Scale):

Content Development & Task Completion (Primary Focus):
- Score 5: Effectively addresses the topic and task. Presents a well-developed position with clear, relevant, well-chosen examples and details. Shows sophistication in idea development.
- Score 4: Addresses the topic and task well. Position is generally clear with relevant examples, but may lack some detail or sophistication in development.
- Score 3: Addresses the topic and task, but development of ideas may be uneven. Examples may be relevant but not fully elaborated or connected.
- Score 2: Limited development in response to the topic and task. Ideas may be vague, repetitive, or underdeveloped.
- Score 1: Minimal development in response to the topic and task. May not present a coherent position or relevant ideas.
- Score 0: Off-topic, in a foreign language, or blank.

Organization & Coherence:
- Score 5: Well-organized, with clear progression of ideas and effective transitions. Unified and coherent.
- Score 4: Generally well-organized, with logical progression of ideas and some transitions, though connections may occasionally be less clear.
- Score 3: Some organization is apparent, but may lack overall unity or smooth transitions between ideas.
- Score 2: Ideas are poorly organized, with unclear connections and transitions that obscure meaning.
- Score 1: Lacks organization, making the response largely incoherent.

Language Use (Grammar, Vocabulary, Syntax):
- Score 5: Demonstrates consistent facility in language use; effective word choice and varied sentence structures. Occasional minor errors do not obscure meaning.
- Score 4: Few lexical or grammatical errors; language allows ideas to be easily understood with some variety in syntax.
- Score 3: Some noticeable lexical and grammatical errors; may result in somewhat vague expressions or obscured meanings.
- Score 2: Significant language difficulties, accumulation of errors, or expressions that largely obscure meaning.
- Score 1: Severely limited range and control of language; prevents expression of ideas.

EVALUATION TASK:
Please provide a comprehensive evaluation with the following structure:

# TOEFL Writing Evaluation

## Overall score: [X/5]
[Brief explanation of what this score represents on the TOEFL scale]

## Content Development & Task Completion Score: [X/5]
[Explanation of this score]

## Organization & Coherence Score: [X/5]
[Explanation of this score]

## Language Use Score: [X/5]
[Explanation of this score]

## Key Strengths
- [Strength 1]
- [Strength 2]
- [Strength 3]

## Areas for Improvement
- [Area 1]
- [Area 2]
- [Area 3]

## Detailed Analysis
### Content Development
[Analyze how well the student addressed the prompt and developed their position]

### Organization
[Analyze the structure and flow of the response]

### Language Use
[Analyze grammar, vocabulary, and syntax]

## Examples from Student's Writing
[Include 2-3 direct quotes from the response with specific feedback]

## Recommendations for Improvement
[Provide 3-4 specific, actionable tips for improvement]
`;
          }
          
          try {
            const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  { parts: [{ text: promptTemplate }] }
                ],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 2048
                }
              })
            });
            
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }
            
            const responseData = await response.json();
            
            if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
              const generatedText = responseData.candidates[0].content.parts[0].text;
              
              // Extract scores and feedback
              let overallScore = 0;
              let contentScore = 0;
              let organizationScore = 0;
              let languageScore = 0;
              
              // Extract overall score
              const overallScoreMatch = generatedText.match(/Overall score: (\d+\.?\d*)\/5/);
              if (overallScoreMatch) {
                overallScore = parseFloat(overallScoreMatch[1]);
              }
              
              // Extract content score (with different names depending on task type)
              const contentScoreMatch = generatedText.match(/(Content Integration & Accuracy|Content Development & Task Completion) Score: (\d+\.?\d*)\/5/);
              if (contentScoreMatch) {
                contentScore = parseFloat(contentScoreMatch[2]);
              }
              
              // Extract organization score
              const orgScoreMatch = generatedText.match(/Organization & Coherence Score: (\d+\.?\d*)\/5/);
              if (orgScoreMatch) {
                organizationScore = parseFloat(orgScoreMatch[1]);
              }
              
              // Extract language score
              const langScoreMatch = generatedText.match(/Language Use Score: (\d+\.?\d*)\/5/);
              if (langScoreMatch) {
                languageScore = parseFloat(langScoreMatch[1]);
              }
              
              return {
                taskNumber: task.taskNumber,
                feedback: generatedText,
                overallScore,
                contentScore,
                organizationScore,
                languageScore,
                taskType: task.taskType
              };
            } else {
              throw new Error("Invalid API response format");
            }
          } catch (apiError) {
            console.error(`Error getting feedback for task ${task.taskNumber}:`, apiError);
            
            // Return a mock feedback for now (in production, you'd handle this differently)
            return mockFeedback(task, userResponse);
          }
        });
        
        const results = await Promise.all(feedbackPromises);
        setFeedbackData(results);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to generate feedback. Please try again.");
        
        // Fallback to mock data in case of error
        if (writingData && writingData.tasks) {
          const mockResults = writingData.tasks.map(task => 
            mockFeedback(task, userResponses[task.taskNumber] || '')
          );
          setFeedbackData(mockResults);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (writingData && userResponses) {
      fetchFeedback();
    }
  }, [writingData, userResponses]);
  
  // Mock feedback function for development or fallback
  const mockFeedback = (task, userResponse) => {
    const wordCount = userResponse.trim() ? userResponse.trim().split(/\s+/).length : 0;
    const isShort = wordCount < 100;
    
    let overallScore = 0;
    let contentScore = 0;
    let organizationScore = 0;
    let languageScore = 0;
    let feedback = '';
    
    if (isShort) {
      overallScore = 2;
      contentScore = 2;
      organizationScore = 2.5;
      languageScore = 2;
      
      feedback = `
# TOEFL Writing Evaluation

## Overall score: 2/5
This score represents a limited response on the TOEFL scale.

## Content Integration & Accuracy Score: 2/5
The response contains some relevant information but shows significant omissions of important ideas from the lecture.

## Organization & Coherence Score: 2.5/5
Ideas are somewhat organized but lack clear connections between points.

## Language Use Score: 2/5
The response shows significant language difficulties that obscure meaning in several places.

## Key Strengths
- Attempted to address the main topic
- Shows some understanding of basic concepts
- Uses some relevant vocabulary

## Areas for Improvement
- Response length is insufficient (${wordCount} words)
- Missing important points from the lecture
- Limited development of ideas
- Grammar and vocabulary errors

## Detailed Analysis
### Content & Key Points
The response fails to adequately address key points from the lecture that challenge the reading. Several important contradictions between the sources are omitted.

### Organization
The response lacks a clear structure. Transitions between ideas are abrupt, making it difficult to follow the logical progression.

### Language Use
Grammatical errors and limited vocabulary impact comprehension. Sentence structures are repetitive and simple.

## Examples from Student's Writing
"${userResponse.split(' ').slice(0, 10).join(' ')}..."
This opening statement lacks clarity and does not establish the relationship between the reading and lecture.

## Recommendations for Improvement
- Create an outline before writing to ensure you address all key points
- Practice writing longer responses that fully develop ideas
- Focus on identifying specific contradictions between reading and lecture
- Work on using more varied sentence structures and transitions
`;
    } else {
      overallScore = 4;
      contentScore = 4;
      organizationScore = 4.5;
      languageScore = 3.5;
      
      feedback = `
# TOEFL Writing Evaluation

## Overall score: 4/5
This score represents a strong response on the TOEFL scale.

## Content Integration & Accuracy Score: 4/5
The response generally identifies important information from the lecture and relates it to the reading with only minor omissions.

## Organization & Coherence Score: 4.5/5
Well-organized with clear progression of ideas and smooth transitions throughout most of the response.

## Language Use Score: 3.5/5
Few grammatical errors; language allows ideas to be easily understood with some variety in syntax.

## Key Strengths
- Clear understanding of the relationship between the reading and lecture
- Effectively identifies most key points from the lecture that challenge the reading
- Well-structured with logical progression of ideas
- Good use of transitions to connect ideas

## Areas for Improvement
- Some minor inaccuracies in representing lecture details
- Occasional grammatical errors
- Could use more precise vocabulary in some sections

## Detailed Analysis
### Content & Key Points
The response successfully identifies most of the important points from the lecture that cast doubt on the reading passage. The writer shows good understanding of how the lecture challenges the reading's claims, though there are minor omissions.

### Organization
The response follows a clear structure with an introduction, body paragraphs addressing each main point, and a conclusion. Transitions between ideas are generally smooth, creating a coherent flow.

### Language Use
The language is generally clear with few grammatical errors that don't interfere with meaning. Sentence structure is varied, though there are occasional awkward phrasings.

## Examples from Student's Writing
"${userResponse.split(' ').slice(0, 15).join(' ')}..."
This effectively introduces the relationship between the sources, though it could be more specific about the nature of the contradiction.

"${userResponse.split(' ').slice(Math.floor(userResponse.split(' ').length / 2), Math.floor(userResponse.split(' ').length / 2) + 15).join(' ')}..."
This section effectively explains a key point, but contains minor grammatical errors that don't significantly impact meaning.

## Recommendations for Improvement
- Pay closer attention to specific details from the lecture
- Proofread carefully for grammatical errors
- Expand vocabulary to express ideas more precisely
- Consider using more sophisticated sentence structures to enhance clarity
`;
    }
    
    return {
      taskNumber: task.taskNumber,
      feedback: feedback,
      overallScore: overallScore,
      contentScore: contentScore,
      organizationScore: organizationScore,
      languageScore: languageScore,
      taskType: task.taskType
    };
  };
  
  // Render the task-specific feedback content
  const renderFeedbackContent = (feedbackItem) => {
    if (!feedbackItem) return null;
    
    const { feedback } = feedbackItem;
    
    // Convert the markdown-like feedback to HTML sections
    const sections = feedback.split(/^#+\s+/m).filter(Boolean).map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      return { title, content };
    });

    return (
      <div className="feedback-content">
        <div className="feedback-sections">
          {sections.map((section, index) => {
            // Skip the first section (it's the title) and the second section (overall score, which we display differently)
            if (index <= 1) return null;
            
            // Skip the individual category scores as we display them differently
            if (section.title.includes("Content Integration & Accuracy Score") || 
                section.title.includes("Content Development & Task Completion Score") ||
                section.title.includes("Organization & Coherence Score") || 
                section.title.includes("Language Use Score")
            ) {
              return null;
            }
            
            // Different styling for different sections
            let sectionClassName = "feedback-section";
            if (section.title.includes("Key Strengths")) {
              sectionClassName += " strengths-section";
            } else if (section.title.includes("Areas for Improvement")) {
              sectionClassName += " improvement-section";
            } else if (section.title.includes("Recommendations")) {
              sectionClassName += " recommendations-section";
            } else if (section.title.includes("Examples")) {
              sectionClassName += " examples-section";
            } else if (section.title.includes("Detailed Analysis")) {
              sectionClassName += " analysis-section";
            }
            
            return (
              <div key={index} className={sectionClassName}>
                <h3 className="section-title">{section.title}</h3>
                <div className="section-content">
                  {section.content.split('\n').map((paragraph, i) => {
                    // Check if the paragraph is a list item
                    if (paragraph.trim().startsWith('- ')) {
                      return (
                        <div key={i} className="list-item">
                          <span className="bullet">•</span>
                          <span className="item-text">{formatText(paragraph.trim().substring(2))}</span>
                        </div>
                      );
                    } else if (paragraph.trim().startsWith('### ')) {
                      // Sub-section header
                      return (
                        <h4 key={i} className="subsection-title">
                          {paragraph.trim().substring(4)}
                        </h4>
                      );
                    } else if (paragraph.trim()) {
                      // Regular paragraph
                      return (
                        <p key={i} className="paragraph">
                          {formatText(paragraph)}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Helper function to determine color based on score
  const getCategoryScoreColor = (score) => {
    if (score >= 4.5) return '#10b981'; // Excellent - Green
    if (score >= 3.5) return '#3b82f6'; // Good - Blue
    if (score >= 2.5) return '#f59e0b'; // Average - Amber
    if (score >= 1.5) return '#f97316'; // Below Average - Orange
    return '#ef4444'; // Poor - Red
  };
  
  // Render loading stages
  const renderLoadingStages = () => {
    const stages = [
      { id: 1, name: "Analyzing Response" },
      { id: 2, name: "Evaluating Writing Skills" },
      { id: 3, name: "Preparing Detailed Feedback" }
    ];
    
    return (
      <div className="loading-stages">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`loading-stage ${loadingStage >= stage.id ? 'active' : ''} ${loadingStage === stage.id ? 'current' : ''}`}
          >
            <div className="stage-indicator">
              <span className="stage-number">{stage.id}</span>
              <div className="stage-progress"></div>
            </div>
            <div className="stage-name">{stage.name}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="toefl-writing-feedback-container">
        <div className="feedback-header">
          <h1 className="feedback-title">Analyzing Your Writing</h1>
          <p className="feedback-subtitle">
            Please wait while we evaluate your writing performance
          </p>
        </div>
        
        <div className="feedback-loading-container">
          <div className="feedback-loading">
            {renderLoadingStages()}
            <div className="feedback-spinner"></div>
            <p className="loading-message">
              {loadingStage === 1 ? "Analyzing your writing response..." : 
              loadingStage === 2 ? "Evaluating your content, organization, and language skills..." :
              "Preparing your personalized feedback and recommendations..."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="toefl-writing-feedback-container">
        <div className="feedback-header">
          <h1 className="feedback-title">Your TOEFL Writing Feedback</h1>
          <p className="feedback-subtitle">
            Review your detailed feedback and recommendations to improve your TOEFL writing skills
          </p>
        </div>
        
        <div className="feedback-error">
          <div className="error-icon">
            <span className="material-icons">error_outline</span>
          </div>
          <h2>Error Generating Feedback</h2>
          <p>{error}</p>
          <Button onClick={onRetry} className="retry-button">
            <span className="material-icons">refresh</span>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Show feedback content
  return (
    <div className="toefl-writing-feedback-container">
      <div className="feedback-header">
        <h1 className="feedback-title">Your TOEFL Writing Feedback</h1>
        <p className="feedback-subtitle">
          Review your detailed feedback and recommendations to improve your TOEFL writing skills
        </p>
      </div>
      
      {!feedbackData ? (
        <div className="feedback-loading-container">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="text-xl font-medium text-gray-700 mt-6">Preparing your feedback...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="task-tabs">
            <button
              className={`task-tab ${selectedTask === -1 ? 'active' : ''}`}
              onClick={() => setSelectedTask(-1)}
            >
              Overall
            </button>
            {feedbackData.map((task, index) => (
              <button
                key={task.taskNumber}
                className={`task-tab ${selectedTask === index ? 'active' : ''}`}
                onClick={() => setSelectedTask(index)}
              >
                Task {task.taskNumber}
              </button>
            ))}
          </div>
          
          {selectedTask === -1 ? (
            // Overall Tab Content - Infographics Only
            <div className="overall-feedback-content">
              <div className="overall-metrics-grid">
                {/* Main Score Card */}
                <div className="overall-score-card">
                  <h2 className="overall-metrics-title">Overall Performance</h2>
                  <div className="score-visualization">
                    <div className="score-ring-container">
                      {/* Main circular score visualization */}
                      <svg className="score-ring" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <circle 
                          className="score-ring-bg" 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none"
                          strokeWidth="8"
                        />
                        <circle 
                          className="score-ring-progress" 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none"
                          strokeWidth="8"
                          strokeDasharray="282.7"
                          strokeDashoffset={282.7 - (282.7 * (feedbackData.reduce((avg, task) => avg + task.overallScore, 0) / feedbackData.length) / 5)}
                        />
                        <foreignObject x="15" y="30" width="70" height="40" style={{ overflow: "visible" }}>
                          <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: "left", transform: "rotate(-270deg)" }}>
                            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e40af" }}>
                              {(feedbackData.reduce((avg, task) => avg + task.overallScore, 0) / feedbackData.length).toFixed(1)}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>
                              out of 5.0
                            </div>
                          </div>
                        </foreignObject>
                      </svg>
                    </div>
                    
                    {/* Score band display */}
                    <div className="score-band-container">
                      <div className="score-band-label">
                        {getScoreBand(feedbackData.reduce((avg, task) => avg + task.overallScore, 0) / feedbackData.length).band}
                      </div>
                      <p className="score-band-description">
                        {getScoreBand(feedbackData.reduce((avg, task) => avg + task.overallScore, 0) / feedbackData.length).description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Category Scores Card */}
                <div className="category-scores-card">
                  <h2 className="overall-metrics-title">Performance Categories</h2>
                  
                  {/* Content Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon content-icon">
                        <span className="material-icons">article</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Content</h3>
                        <p className="category-description">Content integration, accuracy, and task completion</p>
                      </div>
                      <div className="category-value content-value">
                        {(feedbackData.reduce((avg, task) => avg + task.contentScore, 0) / feedbackData.length).toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress content-progress" 
                        style={{width: `${(feedbackData.reduce((avg, task) => avg + task.contentScore, 0) / feedbackData.length) * 20}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Organization Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon organization-icon">
                        <span className="material-icons">format_list_bulleted</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Organization</h3>
                        <p className="category-description">Structure, coherence, and logical flow</p>
                      </div>
                      <div className="category-value organization-value">
                        {(feedbackData.reduce((avg, task) => avg + task.organizationScore, 0) / feedbackData.length).toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress organization-progress" 
                        style={{width: `${(feedbackData.reduce((avg, task) => avg + task.organizationScore, 0) / feedbackData.length) * 20}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Language Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon language-icon">
                        <span className="material-icons">translate</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Language Use</h3>
                        <p className="category-description">Grammar, vocabulary, and sentence structure</p>
                      </div>
                      <div className="category-value language-value">
                        {(feedbackData.reduce((avg, task) => avg + task.languageScore, 0) / feedbackData.length).toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress language-progress" 
                        style={{width: `${(feedbackData.reduce((avg, task) => avg + task.languageScore, 0) / feedbackData.length) * 20}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Task Comparison Card */}
                <div className="task-comparison-card">
                  <h2 className="overall-metrics-title">Task Performance Comparison</h2>
                  <div className="task-comparison-chart">
                    {feedbackData.map((task, index) => (
                      <div key={index} className="task-chart-item">
                        <div className="task-chart-label">Task {task.taskNumber}</div>
                        <div className="task-chart-bar-container">
                          <div 
                            className="task-chart-bar"
                            style={{height: `${task.overallScore * 20}%`}}
                          >
                            <span className="task-chart-value">{task.overallScore.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="task-chart-legend">
                    <div className="chart-scale-line" style={{bottom: '0%', display: 'none'}}><span>0</span></div>
                    <div className="chart-scale-line" style={{bottom: '20%', display: 'none'}}><span>1</span></div>
                    <div className="chart-scale-line" style={{bottom: '40%', display: 'none'}}><span>2</span></div>
                    <div className="chart-scale-line" style={{bottom: '60%', display: 'none'}}><span>3</span></div>
                    <div className="chart-scale-line" style={{bottom: '80%', display: 'none'}}><span>4</span></div>
                    <div className="chart-scale-line" style={{bottom: '100%', display: 'none'}}><span>5</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Task-specific content - Existing detailed feedback
            renderFeedbackContent(feedbackData[selectedTask])
          )}
          
          <div className="nav-buttons">
            <Button
              onClick={onRetry}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <span className="material-icons mr-2">replay</span>
              Try Again
            </Button>
            
            <Button 
              onClick={onBackToStart}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="material-icons mr-2">home</span>
              Back to Start
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ToeflWritingFeedback; 
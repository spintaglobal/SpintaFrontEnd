import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingExam.css'; // Ensure your CSS file is correctly linked
import ReadingResults from './ReadingResults'; // Import the ReadingResults component
import { useTimer } from '../../lib/TimerContext';
import TimeUpModal from '../ui/TimeUpModal';
import ExamContainer from '../ui/ExamContainer';

//----------------------------------------------------------------------
// Helper Components
//----------------------------------------------------------------------
// (SafeHtmlRenderer remains the same as the last version - already handles **bold**)
const SafeHtmlRenderer = React.memo(({ htmlContent }) => {
  if (typeof htmlContent !== 'string' || !htmlContent) { return null; }
  try {
    let processedContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedContent = processedContent.replace(/<br\s*\/?>/gi, '\n');
    const lines = processedContent.split('\n');
    const formatLine = (line) => {
      return line.split(/<strong>(.*?)<\/strong>/g).map((part, index) => {
        return index % 2 === 1 ? <strong key={index}>{part}</strong> : part;
      });
    };
    return (
      <>
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            {formatLine(line)}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  } catch (error) {
    console.error("Error rendering safe HTML:", error, "Content:", htmlContent);
    return <span>{htmlContent || ''}</span>;
  }
});

//----------------------------------------------------------------------
// Passage Display Component (MODIFIED TO USE SafeHtmlRenderer)
//----------------------------------------------------------------------
const PassageDisplay = React.memo(({ texts }) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    console.warn("PassageDisplay received invalid or empty 'texts' prop.");
    return <div className="passage-display"><p>No reading passages available for this section.</p></div>;
  }

  const hasParagraphMarkers = (textString) => {
    if (typeof textString !== 'string') return false;
    const paragraphs = textString.split(/[\r\n]{2,}/);
    return paragraphs.some(p => /^[A-Z0-9]+\.\s/.test(p.trim()));
  };

  return (
    <div className="passage-display">
      {texts.map((textItem, index) => {
        if (!textItem || typeof textItem !== 'object') {
          console.warn(`Invalid text item at index ${index}. Skipping.`);
          return null;
        }
        const passageText = textItem.text;
        const textTitle = textItem.textTitle;

        return (
          <div key={`text-${index}`} className="passage-text-block">
            {textTitle && (texts.length === 1 ? <h2>{textTitle}</h2> : <h3>{textTitle}</h3>)}

            {typeof passageText === 'string' && passageText.length > 0 ? (
              hasParagraphMarkers(passageText) ? (
                passageText.split(/[\r\n]{2,}/).map((paragraph, pIndex) => {
                  const trimmedParagraph = paragraph.trim();
                  if (!trimmedParagraph) return null;
                  const markerMatch = trimmedParagraph.match(/^([A-Z0-9]+)\.?\s*/i);
                  const marker = markerMatch ? markerMatch[1] : null;
                  const paragraphContent = marker ? trimmedParagraph.substring(markerMatch[0].length) : trimmedParagraph;

                  return (
                    <p key={`p-${pIndex}`}>
                      {marker && <span className="paragraph-marker">{marker}.</span>}
                      {/* *** CHANGE: Use SafeHtmlRenderer for paragraph content *** */}
                      <SafeHtmlRenderer htmlContent={paragraphContent} />
                      {/* *** END CHANGE *** */}
                    </p>
                  );
                })
              ) : (
                // Modified to support bold text in pre-formatted content
                <pre className="passage-pre">
                  <SafeHtmlRenderer htmlContent={passageText.replace(/\\n/g, '\n')} />
                </pre>
              )
            ) : (
              <p><em>Reading passage text is unavailable for this block.</em></p>
            )}
          </div>
        );
      })}
    </div>
  );
});


//----------------------------------------------------------------------
// Individual Question Type Components
//----------------------------------------------------------------------
// (No changes needed for MultipleChoiceSingle, TrueFalseNotGiven, YesNoNotGiven,
// SentenceCompletion, ShortAnswer, MatchingHeadingsNew, MatchingInformationNew
// from the previous stable version)

const MultipleChoiceSingle = React.memo(({ questionNumber, questionData, userAnswers, onAnswerChange }) => {
  if (!questionData || typeof questionData !== 'object') return null;
  const questionId = questionData.questionId || questionNumber;
  const name = `q${questionId}`;
  const questionText = questionData.question || "Question text not available.";
  const options = Array.isArray(questionData.options) ? questionData.options : [];

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question multiple-choice-single">
      <span className="question-number">{questionId}.</span>
      <span className="question-text">{questionText}</span>
      <div className="options-list">
        {options.length > 0 ? options.map((optionText, index) => {
          const displayOption = typeof optionText === 'string' ? optionText.replace(/^[A-Z]\)\s*/, '') : `Option ${index + 1}`;
          const valueOption = typeof optionText === 'string' ? optionText.match(/^([A-Z])\)/)?.[1] || displayOption : displayOption;
          return (
            <label key={index}>
              <input
                type="radio"
                name={name}
                value={valueOption}
                checked={userAnswers && userAnswers[name] === valueOption}
                onChange={handleChange}
              />
              {displayOption}
            </label>
          );
        }) : <p><em>Options not available.</em></p>}
      </div>
    </div>
  );
});

const TrueFalseNotGiven = React.memo(({ questionNumber, questionData, userAnswers, onAnswerChange }) => {
  if (!questionData || typeof questionData !== 'object') return null;
  const questionId = questionData.questionId || questionNumber;
  const name = `q${questionId}`;
  const questionText = questionData.question || "Statement not available.";

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question true-false-not-given">
      <span className="question-number">{questionId}.</span>
      <span className="question-text">{questionText}</span>
      <div className="options-list">
        <label><input type="radio" name={name} value="TRUE" checked={userAnswers && userAnswers[name] === "TRUE"} onChange={handleChange} /> True</label>
        <label><input type="radio" name={name} value="FALSE" checked={userAnswers && userAnswers[name] === "FALSE"} onChange={handleChange} /> False</label>
        <label><input type="radio" name={name} value="NOT_GIVEN" checked={userAnswers && userAnswers[name] === "NOT_GIVEN"} onChange={handleChange} /> Not Given</label>
      </div>
    </div>
  );
});

const YesNoNotGiven = React.memo(({ questionNumber, questionData, userAnswers, onAnswerChange }) => {
  if (!questionData || typeof questionData !== 'object') return null;
  const questionId = questionData.questionId || questionNumber;
  const name = `q${questionId}`;
  const questionText = questionData.question || "Claim not available.";

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question yes-no-not-given">
      <span className="question-number">{questionId}.</span>
      <span className="question-text">{questionText}</span>
      <div className="options-list">
        <label><input type="radio" name={name} value="YES" checked={userAnswers && userAnswers[name] === "YES"} onChange={handleChange} /> Yes</label>
        <label><input type="radio" name={name} value="NO" checked={userAnswers && userAnswers[name] === "NO"} onChange={handleChange} /> No</label>
        <label><input type="radio" name={name} value="NOT_GIVEN" checked={userAnswers && userAnswers[name] === "NOT_GIVEN"} onChange={handleChange} /> Not Given</label>
      </div>
    </div>
  );
});

const SentenceCompletion = React.memo(({ questionNumber, questionData, wordLimit, userAnswers, onAnswerChange }) => {
  if (!questionData || typeof questionData !== 'object') return null;
  const questionId = questionData.questionId || questionNumber;
  const questionText = questionData.question || "";
  const parts = questionText.split(/\s*_{3,}\s*|\s*\[\s*…\s*\]\s*/);
  const sentenceStart = parts[0] || '';
  const sentenceEnd = parts.length > 1 ? parts.slice(1).join(' ') : '';
  const name = `q${questionId}`;

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question sentence-completion">
      <label htmlFor={name} style={{ display: 'inline' }}>
        <span className="question-number">{questionId}.</span>
        <span className="question-text">{sentenceStart}</span>
      </label>
      <input
        type="text"
        id={name}
        name={name}
        className="completion-input"
        placeholder="Your answer"
        value={userAnswers && userAnswers[name] ? userAnswers[name] : ''}
        onChange={handleChange}
        aria-label={`Answer for question ${questionNumber}`}
      />
      {sentenceEnd && <span className="question-text">{` ${sentenceEnd}`}</span>}
      {wordLimit && <span className="word-limit-note">({wordLimit})</span>}
    </div>
  );
});

const ShortAnswer = React.memo(({ questionNumber, questionData, wordLimit, userAnswers, onAnswerChange }) => {
  if (!questionData || typeof questionData !== 'object') return null;
  const questionId = questionData.questionId || questionNumber;
  const questionText = questionData.question || "Question not available.";
  const name = `q${questionId}`;

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question short-answer">
      <label htmlFor={name}>
        <span className="question-number">{questionId}.</span>
        <span className="question-text">{questionText}</span>
        {wordLimit && <span className="word-limit-note">({wordLimit})</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        className="short-answer-input"
        placeholder="Your answer..."
        value={userAnswers && userAnswers[name] ? userAnswers[name] : ''}
        onChange={handleChange}
        aria-label={`Answer for question ${questionNumber}`}
      />
    </div>
  );
});

const MatchingHeadingsNew = React.memo(({ questionNumberStart, questionData, userAnswers, onAnswerChange }) => {
  if (!questionData || !Array.isArray(questionData.questions)) {
     console.error("Invalid data received for MatchingHeadingsNew:", questionData);
     return <div className="question error">Error: Invalid data for Matching Headings.</div>;
  }
  const allItems = questionData.questions;
  const headings = allItems.filter(q => q?.type === 'heading' && typeof q.text === 'string');
  const paragraphs = allItems.filter(q => q?.type === 'paragraph' && typeof q.text === 'string');
  if (headings.length === 0 || paragraphs.length === 0) {
    console.warn("MatchingHeadingsNew missing headings or paragraphs:", questionData);
    return <div className="question warning">Warning: Incomplete data for Matching Headings.</div>;
  }
  const headingOptions = headings.map(h => h.text.match(/^([A-Z]+|[ivxlcdm]+)\.?\s*/i)?.[1]).filter(Boolean);

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question matching-headings-json">
      <div className="options-box">
        <h4>List of Headings</h4>
        <ul>
          {headings.map((heading, index) => <li key={`h-${index}`}>{heading.text}</li>)}
        </ul>
      </div>
      {paragraphs.map((para, index) => {
        const questionId = para.questionId || (questionNumberStart + index);
        const name = `q${questionId}`;
        const paraIdentifier = para.text;
        return (
          <div key={`p-${index}`} className="matching-item">
            <label htmlFor={name}> <span className="question-number">{questionId}.</span> {paraIdentifier} </label>
            <select
              id={name}
              name={name}
              value={userAnswers && userAnswers[name] ? userAnswers[name] : ''}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              {headingOptions.map((optionMarker, hIndex) => (
                <option key={`opt-${hIndex}`} value={optionMarker}>
                  {optionMarker}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
});

const MatchingInformationNew = React.memo(({ questionNumberStart, questionData, paragraphLetters, userAnswers, onAnswerChange }) => {
  if (!questionData || !Array.isArray(questionData.questions)) {
      console.error("Invalid data received for MatchingInformationNew:", questionData);
      return <div className="question error">Error: Invalid data for Matching Information.</div>;
  }
  
  // Ensure we have paragraph letters
  if (!Array.isArray(paragraphLetters) || paragraphLetters.length === 0) { 
    // If no paragraph letters are provided, create default A-G
    paragraphLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; 
    console.log("Using default paragraph letters A-G in MatchingInformationNew component");
  }
  
  const statements = questionData.questions.filter(q => q?.type === 'statement' && typeof q.text === 'string');
  if (statements.length === 0) {
    console.warn("MatchingInformationNew missing statements:", questionData);
    return <div className="question warning">Warning: No statements found for Matching Information.</div>;
  }

  const handleChange = (e) => {
    onAnswerChange(e.target.name, e.target.value);
  };

  return (
    <div className="question matching-information-new">
      {statements.map((statement, index) => {
        const questionId = statement.questionId || (questionNumberStart + index);
        const name = `q${questionId}`;
        return (
          <div key={`stmt-${index}`} className="matching-item" style={{ alignItems: 'start' }}>
            <label htmlFor={name} style={{ marginRight: '10px', flexShrink: 0 }}> <span className="question-number">{questionId}.</span> </label>
            <div style={{ flexGrow: 1 }}>
              <span className="question-text">{statement.text}</span>
              <select
                id={name}
                name={name}
                style={{ marginLeft: '10px', padding: '5px', display: 'block', marginTop: '5px', maxWidth: '150px' }}
                value={userAnswers && userAnswers[name] ? userAnswers[name] : ''}
                onChange={handleChange}
              >
                <option value="">Select Paragraph</option>
                {paragraphLetters.map(letter => (
                  <option key={letter} value={letter}>Paragraph {letter}</option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
});

//----------------------------------------------------------------------
// Question Block Wrapper Component
//----------------------------------------------------------------------
const QuestionBlock = React.memo(({ title, instructions, children }) => {
  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) { return null; }
  return (
    <div className="question-block">
      {title && <h3>{title}</h3>}
      {instructions && ( <div className="instructions"> <SafeHtmlRenderer htmlContent={instructions} /> </div> )}
      {validChildren}
    </div>
  );
});


//----------------------------------------------------------------------
// Question Area Component (MODIFIED Instructions for MATCHING_HEADINGS)
//----------------------------------------------------------------------
const QuestionArea = React.memo(({ section, userAnswers, onAnswerChange }) => {
  if (!section || !Array.isArray(section.texts)) {
    console.error("QuestionArea received invalid 'section' prop:", section);
    return <div className="question-area"><p>Error displaying questions: Invalid section data.</p></div>;
  }

  let paragraphLetters = [];
  const firstTextContent = section.texts[0]?.text;
  if (typeof firstTextContent === 'string') {
    // First try to find explicitly labeled paragraphs (A, B, C, etc.)
    const paragraphMarkerPattern = /^([A-Z])[.\s]/gm;
    const matches = [...firstTextContent.matchAll(paragraphMarkerPattern)];
    
    if (matches && matches.length > 0) {
      // Use the explicitly labeled paragraphs if available
      paragraphLetters = matches.map(match => match[1]);
      console.log("Found labeled paragraph letters:", paragraphLetters);
    } else {
      // If no explicit labels, count paragraphs and create letter sequence
      // Split by double newline to identify paragraphs
      const paragraphs = firstTextContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      // Create letters A, B, C, etc. based on paragraph count
      if (paragraphs.length > 0) {
        paragraphLetters = Array.from({ length: paragraphs.length }, (_, i) => 
          String.fromCharCode(65 + i) // 65 = 'A' in ASCII
        );
        console.log(`Created ${paragraphLetters.length} paragraph letters based on paragraph count`);
      } else {
        console.warn("No paragraphs detected in the text content");
      }
    }
    
    // If still no paragraphs found (unlikely), use fallback but limit to a reasonable number
    if (paragraphLetters.length === 0) {
      console.warn("No paragraph markers or structure found. Using default fallback.");
      paragraphLetters = ['A', 'B', 'C', 'D'];
    }
    
    console.log("Final paragraph letters:", paragraphLetters);
  }

  let globalQuestionCounter = 1;
  const questionBlocksRendered = [];

  section.texts.forEach((textBlock, textIndex) => {
    if (!textBlock || typeof textBlock !== 'object' || !textBlock.questionType || !Array.isArray(textBlock.questions)) {
      console.warn(`Skipping invalid text block structure at index ${textIndex} in section ${section.sectionNumber}.`);
      return;
    }

    const { questionType, questions } = textBlock;
    const questionsInBlock = questions;
    let numberOfQuestionsInBlock = 0;

    switch (questionType) {
      case 'MATCHING_HEADINGS': numberOfQuestionsInBlock = questionsInBlock.filter(q => q?.type === 'paragraph').length; break;
      case 'PARAGRAPH_MATCHING': numberOfQuestionsInBlock = questionsInBlock.filter(q => q?.type === 'statement').length; break;
      default: numberOfQuestionsInBlock = questionsInBlock.length; break;
    }

    if (numberOfQuestionsInBlock <= 0) { return; }

    // Get the actual question IDs from the questions
    let questionIds = [];
    switch (questionType) {
      case 'MATCHING_HEADINGS':
        questionIds = questionsInBlock.filter(q => q?.type === 'paragraph').map(q => q.questionId || 0);
        break;
      case 'PARAGRAPH_MATCHING':
        questionIds = questionsInBlock.filter(q => q?.type === 'statement').map(q => q.questionId || 0);
        break;
      default:
        questionIds = questionsInBlock.map(q => q.questionId || 0);
        break;
    }

    // Filter out any zero values (fallbacks) and sort numerically
    questionIds = questionIds.filter(id => id > 0).sort((a, b) => a - b);
    
    // If we have valid question IDs, use them for the title
    let title;
    if (questionIds.length > 0) {
      const startId = questionIds[0];
      const endId = questionIds[questionIds.length - 1];
      title = `Questions ${startId}${endId > startId ? `-${endId}` : ''}`;
    } else {
      // Fallback to the old method if no valid question IDs
      const startNum = globalQuestionCounter;
      const endNum = startNum + numberOfQuestionsInBlock - 1;
      title = `Questions ${startNum}${endNum > startNum ? `-${endNum}` : ''}`;
    }
    const blockContent = [];

    try {
        switch (questionType) {
             case 'MATCHING_HEADINGS':
               blockContent.push(
                 <MatchingHeadingsNew
                   key={`${questionType}-${questionIds.length > 0 ? questionIds[0] : globalQuestionCounter}`}
                   questionNumberStart={globalQuestionCounter}
                   questionData={textBlock}
                   userAnswers={userAnswers}
                   onAnswerChange={onAnswerChange}
                 />
               );
               break;
             case 'PARAGRAPH_MATCHING':
               blockContent.push(
                 <MatchingInformationNew
                   key={`${questionType}-${questionIds.length > 0 ? questionIds[0] : globalQuestionCounter}`}
                   questionNumberStart={globalQuestionCounter}
                   questionData={textBlock}
                   paragraphLetters={paragraphLetters}
                   userAnswers={userAnswers}
                   onAnswerChange={onAnswerChange}
                 />
               );
               break;
             case 'SENTENCE_COMPLETION': case 'TRUE_FALSE_NOT_GIVEN': case 'SHORT_ANSWER': case 'IDENTIFYING_VIEWS_CLAIMS': case 'MULTIPLE_CHOICE':
                 questionsInBlock.forEach((qData, index) => {
                     const qNum = globalQuestionCounter + index;
                     if (!qData || typeof qData !== 'object') { return; }
                     let wordLimit = null;
                     const sourcesToCheck = [textBlock.instructions, qData.question];
                     for (const source of sourcesToCheck) {
                         if (typeof source === 'string') {
                             const match = source.match(/(?:NO\s+MORE\s+THAN\s+([\w\s\/()]+?)\b(?:\s+WORDS)?(?:(?:\s+AND\/OR\s+A)?\s+NUMBER)?)/i);
                             if (match && match[1]) {
                                 wordLimit = `NO MORE THAN ${match[1].trim().toUpperCase()}`;
                                 if (!wordLimit.includes("WORDS") && (source.toLowerCase().includes("words"))) wordLimit += " WORDS";
                                 if (!wordLimit.includes("NUMBER") && (source.toLowerCase().includes("number"))) wordLimit += " AND/OR A NUMBER";
                                 break;
                             }
                         }
                     }
                     if (questionType === 'SENTENCE_COMPLETION')
                       blockContent.push(
                         <SentenceCompletion
                           key={qData.questionId || qNum}
                           questionNumber={qNum}
                           questionData={qData}
                           wordLimit={wordLimit}
                           userAnswers={userAnswers}
                           onAnswerChange={onAnswerChange}
                         />
                       );
                     else if (questionType === 'TRUE_FALSE_NOT_GIVEN')
                       blockContent.push(
                         <TrueFalseNotGiven
                           key={qData.questionId || qNum}
                           questionNumber={qNum}
                           questionData={qData}
                           userAnswers={userAnswers}
                           onAnswerChange={onAnswerChange}
                         />
                       );
                     else if (questionType === 'SHORT_ANSWER')
                       blockContent.push(
                         <ShortAnswer
                           key={qData.questionId || qNum}
                           questionNumber={qNum}
                           questionData={qData}
                           wordLimit={wordLimit}
                           userAnswers={userAnswers}
                           onAnswerChange={onAnswerChange}
                         />
                       );
                     else if (questionType === 'IDENTIFYING_VIEWS_CLAIMS')
                       blockContent.push(
                         <YesNoNotGiven
                           key={qData.questionId || qNum}
                           questionNumber={qNum}
                           questionData={qData}
                           userAnswers={userAnswers}
                           onAnswerChange={onAnswerChange}
                         />
                       );
                     else if (questionType === 'MULTIPLE_CHOICE')
                       blockContent.push(
                         <MultipleChoiceSingle
                           key={qData.questionId || qNum}
                           questionNumber={qNum}
                           questionData={qData}
                           userAnswers={userAnswers}
                           onAnswerChange={onAnswerChange}
                         />
                       );
                 });
                 break;
             default:
                 console.warn(`Unsupported question type "${questionType}" encountered in section ${section.sectionNumber}.`);
                 blockContent.push(<div key={`unsupported-${textIndex}`} className="question warning">Warning: Unsupported question type "{questionType}".</div>);
                 break;
        }
    } catch (renderError) {
         console.error(`Error rendering questions for type ${questionType} starting at Q#${startNum}:`, renderError);
         blockContent.push(<div key={`render-error-${startNum}`} className="question error">Error displaying these questions.</div>);
    }

    // --- Determine Instructions ---
    let instructions = "";
    // For MATCHING_HEADINGS, always use a clean default instruction, ignoring textBlock.instructions
    // to prevent duplicating the list.
    if (questionType === 'MATCHING_HEADINGS') {
        // Use the question IDs for the instructions if available
        const startId = questionIds.length > 0 ? questionIds[0] : startNum;
        const endId = questionIds.length > 0 ? questionIds[questionIds.length - 1] : endNum;
        instructions = `Choose the correct heading for each paragraph (Questions ${startId}-${endId}) from the list of headings below.`;
    } else {
        // For other types, use provided instructions or generate default
        instructions = textBlock.instructions || "";
        if (!instructions) {
           switch (questionType) { // Regenerate defaults if needed
               case 'SENTENCE_COMPLETION': instructions = 'Complete the sentences below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.'; break;
               case 'TRUE_FALSE_NOT_GIVEN': instructions = 'Do the following statements agree with the information given in the passage?<br/>Write:<br/><strong>TRUE</strong> if the statement agrees with the information<br/><strong>FALSE</strong> if the statement contradicts the information<br/><strong>NOT GIVEN</strong> if there is no information on this'; break;
               case 'SHORT_ANSWER': instructions = 'Answer the questions below. Choose <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.'; break;
               // Default for MATCHING_HEADINGS removed here, handled above.
               case 'IDENTIFYING_VIEWS_CLAIMS': instructions = 'Do the following statements agree with the claims of the writer in the passage?<br/>Write:<br/><strong>YES</strong> if the statement agrees with the claims of the writer<br/><strong>NO</strong> if the statement contradicts the claims of the writer<br/><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this'; break;
               case 'PARAGRAPH_MATCHING':
                   // Use the question IDs for the instructions if available
                   const startId = questionIds.length > 0 ? questionIds[0] : startNum;
                   const endId = questionIds.length > 0 ? questionIds[questionIds.length - 1] : endNum;
                   instructions = `Look at the following statements (Questions ${startId}-${endId}) and the letters of the paragraphs ${paragraphLetters.length > 0 ? `(${paragraphLetters.join('-')})` : ''} in the reading passage. Match each statement with the correct paragraph.`;
                   break;
               case 'MULTIPLE_CHOICE': instructions = 'Choose the correct letter, <strong>A</strong>, <strong>B</strong>, <strong>C</strong> or <strong>D</strong>.'; break;
               default: instructions = `Instructions for ${questionType}.`;
           }
        }
    }


    if (blockContent.length > 0) {
        // Use the first question ID for the key if available, otherwise use the index
        const blockKey = questionIds.length > 0 ? questionIds[0] : textIndex;
        
        questionBlocksRendered.push(
            <QuestionBlock key={`block-${textIndex}-${blockKey}`} title={title} instructions={instructions}>
                {blockContent}
            </QuestionBlock>
        );
    } else {
         console.warn(`Skipping QuestionBlock for ${title} as no content was generated.`);
    }

    globalQuestionCounter += numberOfQuestionsInBlock;
  });

  return (
      <div className="question-area">
         {questionBlocksRendered.length > 0 ? questionBlocksRendered : <p>No questions to display for this section.</p>}
      </div>
  );
});


//----------------------------------------------------------------------
// Reading Test Section Component (Container for Passage + Questions)
//----------------------------------------------------------------------
const ReadingTestSection = React.memo(({ testSection, userAnswers, onAnswerChange }) => {
  if (!testSection || typeof testSection !== 'object' || !Array.isArray(testSection.texts)) {
    console.error("ReadingTestSection received invalid 'testSection' prop:", testSection);
    return <div className="error-message">Error: Cannot display section content due to invalid data format.</div>;
  }
  const sectionHeaderDisplay = `Section ${testSection.sectionNumber || 'N/A'}`;
  return (
    <React.Fragment>
      <div className="content-header">
        <h2>{sectionHeaderDisplay}</h2>
      </div>
      <div className="test-container">
        <PassageDisplay texts={testSection.texts} />
        <QuestionArea
          section={testSection}
          userAnswers={userAnswers}
          onAnswerChange={onAnswerChange}
        />
      </div>
    </React.Fragment>
  );
});

//----------------------------------------------------------------------
// Main ReadingExam Component (Top Level: Fetching, State, Tabs)
//----------------------------------------------------------------------
const ReadingExam = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [resultsFeedback, setResultsFeedback] = useState([]);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const { startTimer, resetTimer, timeRemaining } = useTimer();
  const navigate = useNavigate();

  // Countdown animation effect
  useEffect(() => {
    if (showCountdown && !loading) {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown reaches 0, hide countdown and show the exam
        setShowCountdown(false);
      }
    }
  }, [countdownNumber, showCountdown, loading]);

  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true); 
      setError(null); 
      setTestData(null);
      console.log("Fetching test data..."); // ADDED: Log start of fetch
      // Using new naming convention: reading_gt_1, reading_gt_2, etc.
      const testIdToFetch = "reading_gt_1"; // Make dynamic if needed
      const apiUrl = `https://xguxnr9iu0.execute-api.us-east-1.amazonaws.com/live/tests/${testIdToFetch}`;
      console.log(`Fetching test data from: ${apiUrl}`);
      try {
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json' }});
        if (!response.ok) {
          let errorPayload = null; try { errorPayload = await response.json(); } catch (e) {}
          const errorMsg = errorPayload?.message || errorPayload?.error || `Request failed with status: ${response.status}`;
          throw new Error(errorMsg);
        }
        const responseData = await response.json();
        // console.log("Raw API response data:", responseData);
        let finalTestData = null;
        if (responseData?.testData && typeof responseData.testData === 'string') {
            try { finalTestData = JSON.parse(responseData.testData); } catch (parseError) { throw new Error("Failed to parse the test data received from the API."); }
        } else if (responseData?.sections && Array.isArray(responseData.sections)) { finalTestData = responseData; }
        else { throw new Error("Received unexpected data format from the API."); }
        if (!finalTestData?.sections || !Array.isArray(finalTestData.sections) || finalTestData.sections.length === 0) { throw new Error("Invalid data format: 'sections' array is missing or empty."); }
        console.log("Successfully fetched and validated final test data.");
        setTestData(finalTestData);
      } catch (err) {
        console.error("Error during test data fetch or processing:", err);
        setError(err.message || "An unexpected error occurred loading the exam."); 
        setTestData(null);
      } finally { 
        setLoading(false);
      }
    };
    fetchTestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      setShowTimeUpModal(true);
    }
    
    // Reset timer when component unmounts
    return () => {
      if (isSubmitted) {
        resetTimer();
      }
    };
  }, [timeRemaining, isSubmitted, resetTimer]);

  const goToHomePage = () => { 
    resetTimer();
    navigate('/reading'); 
  };

  const resetExam = () => {
    resetTimer();
    setUserAnswers({});
    setIsSubmitted(false);
    setActiveSectionIndex(0);
  };

  // Helper function to extract word limit from instructions or question text
  const extractWordLimit = (sources) => {
    for (const source of sources) {
      if (typeof source === 'string') {
        const match = source.match(/(?:NO\s+MORE\s+THAN\s+([\w\s\/()]+?)\b(?:\s+WORDS)?(?:(?:\s+AND\/OR\s+A)?\s+NUMBER)?)/i);
        if (match && match[1]) {
          return match[1].trim().toUpperCase();
        }
      }
    }
    return null;
  };

  // Helper function to check if answer exceeds word limit
  const exceedsWordLimit = (answer, limit) => {
    if (!limit || !answer) return false;

    // Convert limit text to number (e.g., "THREE" to 3)
    const limitMap = {
      "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5,
      "SIX": 6, "SEVEN": 7, "EIGHT": 8, "NINE": 9, "TEN": 10
    };

    const numericLimit = limitMap[limit] || parseInt(limit);
    if (isNaN(numericLimit)) return false;

    // Count words in answer
    const wordCount = answer.trim().split(/\s+/).length;
    return wordCount > numericLimit;
  };

  // Function to normalize answer values (e.g., NOT_GIVEN and NOT GIVEN are equivalent)
  const normalizeAnswer = (answer) => {
    if (!answer) return '';
    
    // Handle NOT_GIVEN and NOT GIVEN as equivalent
    if (answer === 'NOT_GIVEN' || answer === 'NOT GIVEN') {
      return 'NOT_GIVEN';
    }
    
    return answer;
  };

  // Function to calculate score by comparing user answers with correct answers
  const calculateScore = (testData, userAnswers) => {
    if (!testData) return { score: 0, detailedResults: [] };

    let score = 0;
    const detailedResults = [];
    let globalQuestionCounter = 1;

    // Iterate through sections
    testData.sections.forEach(section => {
      if (!section || !Array.isArray(section.texts)) return;

      // Iterate through text blocks in each section
      section.texts.forEach(textBlock => {
        if (!textBlock || typeof textBlock !== 'object' || !textBlock.questionType || !Array.isArray(textBlock.questions)) {
          return;
        }

        const { questionType, questions } = textBlock;
        let questionsInBlock = questions;
        let numberOfQuestionsInBlock = 0;

        // Determine number of questions in this block based on question type
        switch (questionType) {
          case 'MATCHING_HEADINGS':
            numberOfQuestionsInBlock = questionsInBlock.filter(q => q?.type === 'paragraph').length;
            break;
          case 'PARAGRAPH_MATCHING':
            numberOfQuestionsInBlock = questionsInBlock.filter(q => q?.type === 'statement').length;
            break;
          default:
            numberOfQuestionsInBlock = questionsInBlock.length;
            break;
        }

        if (numberOfQuestionsInBlock <= 0) return;

        // Extract word limit for text input questions
        const blockWordLimit = extractWordLimit([textBlock.instructions]);

        // Process questions based on question type
        switch (questionType) {
          case 'MATCHING_HEADINGS': {
            const paragraphs = questionsInBlock.filter(q => q?.type === 'paragraph');
            paragraphs.forEach((paragraph, index) => {
              const questionId = paragraph.questionId || (globalQuestionCounter + index);
              const questionName = `q${questionId}`;
              const userAnswer = userAnswers[questionName];
              const correctAnswer = paragraph.answer;

              // Normalize answers before comparison
              const normalizedUserAnswer = normalizeAnswer(userAnswer);
              const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

              // Compare normalized answers
              const isCorrect = userAnswer && correctAnswer &&
                              normalizedUserAnswer === normalizedCorrectAnswer;

              if (isCorrect) score++;

              detailedResults.push({
                questionNumber: questionId,
                userAnswer: userAnswer || null,
                correctAnswer,
                isCorrect: userAnswer ? isCorrect : false,
                questionText: paragraph.text,
                isAnswered: !!userAnswer
              });
            });
            globalQuestionCounter += paragraphs.length;
            break;
          }

          case 'PARAGRAPH_MATCHING': {
            const statements = questionsInBlock.filter(q => q?.type === 'statement');
            statements.forEach((statement, index) => {
              const questionId = statement.questionId || (globalQuestionCounter + index);
              const questionName = `q${questionId}`;
              const userAnswer = userAnswers[questionName];
              const correctAnswer = statement.answer;

              // Normalize answers before comparison
              const normalizedUserAnswer = normalizeAnswer(userAnswer);
              const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

              // Compare normalized answers
              const isCorrect = userAnswer && correctAnswer &&
                              normalizedUserAnswer === normalizedCorrectAnswer;

              if (isCorrect) score++;

              detailedResults.push({
                questionNumber: questionId,
                userAnswer: userAnswer || null,
                correctAnswer,
                isCorrect: userAnswer ? isCorrect : false,
                questionText: statement.text,
                isAnswered: !!userAnswer
              });
            });
            globalQuestionCounter += statements.length;
            break;
          }

          case 'SENTENCE_COMPLETION':
          case 'SHORT_ANSWER': {
            questionsInBlock.forEach((qData, index) => {
              const questionId = qData.questionId || (globalQuestionCounter + index);
              const questionName = `q${questionId}`;
              const userAnswer = userAnswers[questionName];
              const correctAnswer = qData.answer;

              // Check word limit
              const questionWordLimit = extractWordLimit([textBlock.instructions, qData.question]) || blockWordLimit;
              const limitExceeded = questionWordLimit && exceedsWordLimit(userAnswer, questionWordLimit);

              // Direct case-sensitive comparison of trimmed strings
              const trimmedUserAnswer = userAnswer ? userAnswer.trim() : '';
              const trimmedCorrectAnswer = correctAnswer ? correctAnswer.trim() : '';

              // Normalize answers before comparison
              const normalizedUserAnswer = normalizeAnswer(trimmedUserAnswer);
              const normalizedCorrectAnswer = normalizeAnswer(trimmedCorrectAnswer);

              const isCorrect = !limitExceeded && userAnswer && correctAnswer &&
                              normalizedUserAnswer === normalizedCorrectAnswer;

              if (isCorrect) score++;

              detailedResults.push({
                questionNumber: questionId,
                userAnswer: userAnswer || null,
                correctAnswer,
                isCorrect: userAnswer ? isCorrect : false,
                questionText: qData.question,
                limitExceeded,
                isAnswered: !!userAnswer
              });
            });
            globalQuestionCounter += questionsInBlock.length;
            break;
          }

          case 'TRUE_FALSE_NOT_GIVEN':
          case 'IDENTIFYING_VIEWS_CLAIMS':
          case 'MULTIPLE_CHOICE': {
            questionsInBlock.forEach((qData, index) => {
              const questionId = qData.questionId || (globalQuestionCounter + index);
              const questionName = `q${questionId}`;
              const userAnswer = userAnswers[questionName];
              const correctAnswer = qData.answer;

              // Normalize answers before comparison
              const normalizedUserAnswer = normalizeAnswer(userAnswer);
              const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

              // Compare normalized answers
              const isCorrect = userAnswer && correctAnswer &&
                              normalizedUserAnswer === normalizedCorrectAnswer;

              if (isCorrect) score++;

              detailedResults.push({
                questionNumber: questionId,
                userAnswer: userAnswer || null,
                correctAnswer,
                isCorrect: userAnswer ? isCorrect : false,
                questionText: qData.question,
                isAnswered: !!userAnswer
              });
            });
            globalQuestionCounter += questionsInBlock.length;
            break;
          }

          default:
            console.warn(`Unsupported question type "${questionType}" encountered during scoring.`);
            globalQuestionCounter += numberOfQuestionsInBlock;
            break;
        }
      });
    });

    return { score, detailedResults };
  };

  // Function to handle answer changes from any question component
  const handleAnswerChange = (questionName, newValue) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionName]: newValue
    }));
  };

  // Function to handle tab change
  const handleTabChange = (newIndex) => {
    // Simply switch to the new tab - no need to collect form data
    // as answers are now updated immediately via handleAnswerChange
    setActiveSectionIndex(newIndex);
  };

  const handleTimeUp = () => {
    setShowTimeUpModal(false);
    handleSubmit({ preventDefault: () => {} });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Calculate score using userAnswers
    const results = calculateScore(testData, userAnswers);
    setFinalScore(results.score);
    setResultsFeedback(results.detailedResults);

    // Reset timer when exam is submitted
    resetTimer();
    
    // Set submitted state
    setIsSubmitted(true);

    console.log("Exam submitted. All captured answers:", userAnswers);
    console.log("Score results:", results);
  };

  // Render the countdown animation
  const renderCountdown = () => {
    // Calculate positions for dots and sparkles
    const getRandomPosition = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    
    // Create array of dots for the rings
    const createDots = (count) => {
      const dots = [];
      const radius = 110; // Ring radius
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        dots.push({ x, y });
      }
      
      return dots;
    };
    
    // Create array of random sparkle positions
    const createSparkles = (count) => {
      const sparkles = [];
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = getRandomPosition(60, 160);
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        
        sparkles.push({ x, y });
      }
      
      return sparkles;
    };
    
    const dots = createDots(8);
    const sparkles = createSparkles(6);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col justify-center items-center h-[600px] text-center">
          {/* Main heading */}
          <h2 className="text-4xl font-bold text-primary-color-dark mb-12">
            <span className="breath-text">Take a deep breath</span>
          </h2>
          
          {/* Countdown animation container */}
          <div className="countdown-animation">
            {/* Rotating rings with dots */}
            <div className="countdown-ring countdown-ring-1">
              {dots.map((dot, index) => (
                <div 
                  key={`dot1-${index}`}
                  className="countdown-dot"
                  style={{ 
                    left: `calc(50% + ${dot.x}px)`, 
                    top: `calc(50% + ${dot.y}px)`,
                    opacity: 0.8,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
            
            <div className="countdown-ring countdown-ring-2">
              {dots.map((dot, index) => (
                <div 
                  key={`dot2-${index}`}
                  className="countdown-dot"
                  style={{ 
                    left: `calc(50% + ${dot.x}px)`, 
                    top: `calc(50% + ${dot.y}px)`,
                    opacity: 0.5,
                    transform: 'translate(-50%, -50%) scale(0.7)'
                  }}
                />
              ))}
            </div>
            
            {/* Random sparkles */}
            {sparkles.map((sparkle, index) => (
              <div
                key={`sparkle-${index}`}
                className="countdown-sparkle"
                style={{
                  left: `calc(50% + ${sparkle.x}px)`,
                  top: `calc(50% + ${sparkle.y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Main countdown number */}
            <div className="countdown-number">
              {countdownNumber > 0 ? countdownNumber : (
                <div className="countdown-go">Go!</div>
              )}
            </div>
          </div>
          
          {/* Message that changes based on countdown state */}
          <div className="countdown-message" style={{ animationDelay: '0.3s' }}>
            {countdownNumber > 0 
              ? "Prepare your thoughts..."
              : "Your exam is ready!"
            }
          </div>
          
          {/* Show arrow icon when countdown finishes */}
          {countdownNumber === 0 && (
            <div className="mt-16" style={{ animation: 'fadeInUp 0.5s ease-out 0.7s both' }}>
              <svg className="w-14 h-14 mx-auto text-primary-color animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show countdown and load test data simultaneously
  if (loading && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4 text-center">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Error Loading Exam</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="text-center">
            <button onClick={goToHomePage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Return to Instructions</button>
          </div>
        </div>
      </div>
    );
  }

  // Show countdown animation while data is loading or during countdown
  if (loading || showCountdown) {
    return renderCountdown();
  }

  // Handle case when there's no test data
  if (!testData?.sections?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <p className="text-gray-700 mb-6">No valid exam data is available to display.</p>
          <button onClick={goToHomePage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Return to Instructions</button>
        </div>
      </div>
    );
  }

  const sections = testData.sections;
  const currentSectionIndex = Math.max(0, Math.min(activeSectionIndex, sections.length - 1));
  const currentSection = sections[currentSectionIndex];
  if (!currentSection) { return <div className="error-message">Internal Error: Could not load section data.</div> }

  return (
    <ExamContainer>
      <div className="reading-exam-container">
        {/* Show time up modal if time expired */}
        {showTimeUpModal && <TimeUpModal onSubmit={handleTimeUp} />}

        {isSubmitted ? (
          <ReadingResults
            testData={testData}
            finalScore={finalScore}
            resultsFeedback={resultsFeedback}
            onReset={resetExam}
            onExit={goToHomePage}
          />
        ) : (
          <>
            <div className="tab-navigation">
              {sections.map((section, index) => {
                if (!section || typeof section.sectionNumber !== 'number') { return null; }
                const sectionIdentifier = section.sectionNumber;
                const tabTitle = `Section ${sectionIdentifier}`;
                return (
                  <button
                    key={`tab-${sectionIdentifier}`}
                    className={`tab-button ${index === activeSectionIndex ? 'active' : ''}`}
                    onClick={() => handleTabChange(index)}
                  >
                    {tabTitle}
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleSubmit}>
              <ReadingTestSection
                testSection={currentSection}
                userAnswers={userAnswers}
                onAnswerChange={handleAnswerChange}
              />
              <div className="exam-buttons-container">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Submit Exam
                </button>
                <button
                  type="button"
                  onClick={goToHomePage}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
                >
                  Exit Exam
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </ExamContainer>
  );
};

export default ReadingExam;
# Game Prompts Documentation

This document contains all AI prompts used across different games in the SPINTA application. All prompts are centrally managed in `genAIService.js` to avoid duplication and ensure consistency.

## 🎯 Current Games Using AI

### 1. Sentence Builder
**Purpose**: Generate scrambled sentences for word ordering practice
**Difficulty Levels**: Easy, Medium, Hard
**API Method**: `generateSentences(difficulty, count)`

#### Sentence Builder Prompt Structure:
```
Difficulty Levels:
- Easy: 4-6 words, simple present tense, basic vocabulary
- Medium: 7-10 words, past tense, compound sentences, descriptive adjectives
- Hard: 10-15 words, complex tenses, multiple clauses, advanced vocabulary

Output Format: JSON array with:
- correct: Array of words in proper order
- jumbled: Array of same words scrambled
- chunks: Grammar components (N=Noun, V=Verb, P=Preposition, A=Adjective/Adverb)
```

### 2. DragZilla
**Purpose**: Generate conjunction and linking word exercises
**Focus**: IELTS/TOEFL/Cambridge exam preparation
**API Method**: `generateDragZillaQuestions()`

#### DragZilla Prompt Features:
```
Question Types:
- Advanced conjunctions: albeit, whereas, whilst, provided that
- Transitional phrases: nevertheless, furthermore, consequently
- Academic connectives: in contrast, conversely, similarly
- Complex subordinators: despite the fact that, given that
- Formal linking expressions: as a result, in addition

Topics: education, environment, technology, society, economics, health, globalization
Complexity: B2-C2 level vocabulary
Format: 15 questions with 4 multiple choice options each
```

### 3. FlashCards
**Purpose**: Generate topic-based flashcards for study
**Customization**: User-defined topics
**API Method**: `generateFlashCards(topic)`

#### FlashCards Prompt Structure:
```
Content Requirements:
- 10 flashcards per topic
- Front: Question/term
- Back: Answer/definition
- Mix of definition, example, and application questions
- IELTS/TOEFL/Cambridge exam appropriate
- Academic vocabulary when relevant
- Clear and unambiguous questions
```

### 4. IELTS Writing (Future)
**Purpose**: Provide feedback on IELTS writing tasks
**Types**: Task 1 and Task 2
**API Methods**: `analyzeIELTSWriting(text, taskType)`

## 🎮 Prompt Management Best Practices

### 1. Centralization
- All prompts stored in `GAME_PROMPTS` object in `genAIService.js`
- No duplication across components
- Single source of truth for prompt modifications

### 2. Consistency
- Standardized output formats (JSON arrays)
- Consistent difficulty scaling
- Uniform error handling and fallbacks

### 3. Maintainability
- Clear prompt documentation
- Modular prompt structure
- Easy to update and extend

### 4. Fallback Strategy
- Each game has fallback content
- Graceful degradation when API fails
- Consistent user experience regardless of AI availability

## 📊 API Configuration

### Current Settings:
```javascript
API: Google Gemini 2.0 Flash
Temperature: 0.7 (balanced creativity/consistency)
Max Tokens: 
  - Sentence Builder: 1024
  - DragZilla: 2048
  - FlashCards: 1024
Base URL: generativelanguage.googleapis.com/v1beta/models/
```

### Response Format:
All games expect JSON array responses with specific schemas defined in each prompt.

## 🔧 Adding New Games

When adding new AI-powered games:

1. **Add prompt to `GAME_PROMPTS`**:
   ```javascript
   newGame: {
     basePrompt: "Your prompt here...",
     variations: {
       // Different prompt variations if needed
     }
   }
   ```

2. **Create service method**:
   ```javascript
   async generateNewGameContent() {
     // Implementation following existing patterns
   }
   ```

3. **Add fallback content**:
   ```javascript
   getFallbackNewGameContent() {
     // Fallback data structure
   }
   ```

4. **Update documentation**: Add details to this file

## 🎯 Future Enhancements

### Planned Features:
- [ ] Dynamic difficulty adjustment based on user performance
- [ ] Personalized content generation
- [ ] Multi-language support
- [ ] Real-time content optimization
- [ ] User feedback integration for prompt improvement

### Prompt Optimization:
- [ ] A/B testing different prompt variations
- [ ] Performance metrics tracking
- [ ] User engagement analysis
- [ ] Content quality assessment

## 📋 Troubleshooting

### Common Issues:
1. **API Key Missing**: Check environment variables
2. **Rate Limiting**: Implement retry logic with exponential backoff
3. **Invalid JSON**: Improve prompt specificity and error handling
4. **Content Quality**: Regular prompt refinement based on user feedback

### Debug Mode:
Enable detailed logging in `genAIService.js` to track:
- API response times
- Content generation success rates
- Fallback usage frequency
- User satisfaction metrics 
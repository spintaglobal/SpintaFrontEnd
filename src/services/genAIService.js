// Browser-compatible GenAI service using Gemini REST API directly
import { logger } from '../utils/globalLogger.js';
import { checkEnvironment, logProductionError } from '../utils/envCheck.js';

// Centralized Prompt Management System
const GAME_PROMPTS = {
  // Sentence Builder Prompts
  sentenceBuilder: {
    basePrompt: `Generate scrambled sentences for IELTS/TOEFL/Cambridge English exam practice.

Difficulty Levels:
- Easy (Band 5-6/TOEFL 60-78/B1-B2): 
  * 6-8 words
  * Academic collocations (conduct research, analyze data, significant impact)
  * Present perfect, passive voice, basic conditionals
  * Topics: education, technology, environment

- Medium (Band 6.5-7/TOEFL 79-93/B2-C1):
  * 9-12 words
  * Complex noun phrases, phrasal verbs, transitional phrases
  * Mixed conditionals, subjunctive mood, cleft sentences
  * Topics: globalization, social issues, scientific developments
  * Include: however, furthermore, consequently, despite, although

- Hard (Band 7.5-9/TOEFL 94-120/C1-C2):
  * 13-18 words
  * Academic hedging language, nominalization, sophisticated vocabulary
  * Inverted conditionals, participle clauses, reduced relative clauses
  * Topics: abstract concepts, philosophical arguments, nuanced analysis
  * Include: notwithstanding, albeit, insofar as, whereby, henceforth

Sentence Types to Generate:
1. Cause-effect relationships
2. Compare-contrast structures
3. Hypothesis and speculation
4. Data interpretation statements
5. Academic arguments with evidence
6. Process descriptions
7. Critical evaluation statements

Output Format: JSON array with:
- correct: Array of words in proper order
- jumbled: Array of same words scrambled
- chunks: Grammar components (N=Noun, V=Verb, P=Preposition, A=Adjective/Adverb, C=Conjunction, D=Determiner, M=Modal, R=Pronoun)`
  },

  // DragZilla (Conjunction Game) Prompts
  dragzilla: {
    basePrompt: `Generate exactly 15 English grammar questions for IELTS/TOEFL/Cambridge exam preparation focusing on advanced conjunctions, transitional phrases, and linking words. Each question should be an academic-style sentence with a blank space (represented as ______) where the conjunction/linking word should go.

For each question, provide:
- A sentence using academic vocabulary and exam-relevant topics (education, environment, technology, society, economics, health, globalization)
- 4 multiple choice options (one correct, three plausible distractors that test common errors)
- The correct answer

Format as JSON array with this exact structure:
[
  {
    "id": 1,
    "text": "The government implemented stringent environmental regulations; ______, many industries struggled to comply with the new standards.",
    "choices": ["consequently", "nevertheless", "furthermore", "meanwhile"],
    "answer": "consequently"
  }
]

Include a mix of:
- Advanced conjunctions: albeit, whereas, whilst, provided that, insofar as
- Transitional phrases: nevertheless, furthermore, consequently, moreover, nonetheless
- Academic connectives: in contrast, conversely, similarly, accordingly, hence
- Complex subordinators: despite the fact that, in spite of, given that, on the grounds that
- Formal linking expressions: as a result, in addition, on the other hand, for instance

Ensure sentences:
- Use B2-C2 level vocabulary appropriate for academic writing
- Mirror the complexity found in IELTS Academic Writing Task 2, TOEFL Independent Writing, or Cambridge CAE/CPE
- Test understanding of subtle differences between similar conjunctions
- Include topics frequently appearing in these exams

Return ONLY the JSON array with no additional text.`
  },

  // FlashCards Prompts
  flashcards: {
    basePrompt: (topic) => `Generate exactly 10 flashcard items for studying: "${topic}". 
Format each flashcard as a JSON object with "front" (question/term) and "back" (answer/definition) properties. 
Make them educational, clear, and fun. Return ONLY the JSON array with no additional text.

Requirements:
- Questions should test key concepts, vocabulary, or skills related to "${topic}"
- Answers should be concise but comprehensive
- Include a mix of definition questions, example requests, and application questions
- Make content appropriate for IELTS/TOEFL/Cambridge exam preparation
- Use academic vocabulary when relevant
- Ensure questions are clear and unambiguous

Example format:
[
  {
    "front": "What is the definition of 'sustainability' in environmental context?",
    "back": "Meeting present needs without compromising the ability of future generations to meet their own needs"
  }
]`
  },

  // WordDrop Game Prompts
  wordDrop: {
    basePrompt: `You are creating a vocabulary learning game called "WordDrop Challenge". Your task is to:

1. FIRST, randomly select ONE topic from these categories:
   - Sports & Athletics (cricket, football, tennis, basketball, swimming, etc.)
   - Technology & Computing (smartphones, software, internet, AI, programming, etc.)
   - Business & Finance (marketing, investment, entrepreneurship, banking, etc.)
   - Science & Research (biology, chemistry, physics, experiments, discoveries, etc.)
   - Travel & Tourism (destinations, hotels, transportation, culture, etc.)
   - Food & Cooking (cuisine, ingredients, techniques, restaurants, etc.)
   - Environment & Nature (climate, wildlife, conservation, sustainability, etc.)
   - Arts & Entertainment (music, movies, painting, literature, theater, etc.)
   - Health & Medicine (wellness, treatment, diagnosis, fitness, nutrition, etc.)
   - Education & Learning (teaching, studying, exams, universities, skills, etc.)

2. After selecting a topic, generate exactly 8 vocabulary-focused fill-in-the-blank sentences using specialized terms from that topic.

3. Create a word bank with 10-12 words (including 8 correct answers + 2-4 distractor words from the same topic).

REQUIREMENTS:
- Sentences should test knowledge of topic-specific vocabulary
- Include descriptive adjectives, technical terms, and action words related to the topic
- Make sentences contextually rich and educational
- Words should be challenging but learnable (B2-C1 level)
- Each sentence should have exactly ONE blank space marked as ______
- Provide clear context clues in each sentence

FORMAT: Return ONLY a JSON object with this exact structure:
{
  "topic": "Selected Topic Name",
  "description": "Brief description of the topic (1-2 sentences)",
  "wordBank": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10"],
  "sentences": [
    {
      "id": 1,
      "text": "The cricket team's ______ performance in the final match secured their victory in the championship.",
      "answer": "outstanding",
      "isActive": true
    }
  ]
}

EXAMPLE (Sports topic):
{
  "topic": "Sports & Athletics",
  "description": "Explore the dynamic world of sports with vocabulary covering competitions, techniques, equipment, and athletic achievements.",
  "wordBank": ["spectacular", "endurance", "strategy", "momentum", "agility", "coordination", "technique", "champion", "opponent", "tournament"],
  "sentences": [
    {
      "id": 1,
      "text": "The gymnast's ______ routine earned her a perfect score from all judges.",
      "answer": "spectacular",
      "isActive": true
    },
    {
      "id": 2,
      "text": "Marathon runners need exceptional ______ to complete the 26-mile race.",
      "answer": "endurance",
      "isActive": true
    }
  ]
}

Generate content now with rich vocabulary that will help learners master topic-specific terminology:`
  },

  // IELTS Writing Feedback Prompts
  ieltsWriting: {
    task1: `Analyze this IELTS Writing Task 1 response using official IELTS criteria...`,
    task2: `Evaluate this IELTS Writing Task 2 essay using the four assessment criteria...`
  }
};

class GenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
    // Check environment on initialization
    const envStatus = checkEnvironment();
    
    if (!this.apiKey) {
      logger.error('VITE_GEMINI_API_KEY not found in environment variables');
      logger.error('Environment status:', envStatus);
    } else {
      logger.log('GenAI Service initialized successfully');
    }
  }

  async generateSentences(difficulty = 'easy', count = 5) {
    if (!this.apiKey) {
      logger.error('No API key available for GenAI service, using fallback sentences');
      return this.getFallbackSentences(difficulty, count);
    }

    try {
      const prompt = this.createPrompt(difficulty, count);
      
      logger.log(`Making API request to: ${this.baseUrl}`);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const errorMsg = `API request failed: ${response.status} ${response.statusText} - ${errorText}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        const errorMsg = 'Invalid response format from API';
        logger.error(errorMsg, data);
        throw new Error(errorMsg);
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      const sentences = this.parseSentenceResponse(generatedText);
      
      if (sentences.length === 0) {
        const errorMsg = 'No valid sentences generated';
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      logger.log(`Successfully generated ${sentences.length} sentences`);
      return sentences;
    } catch (error) {
      logger.error('Error generating sentences with GenAI:', error.message);
      return this.getFallbackSentences(difficulty, count);
    }
  }

  createPrompt(difficulty, count) {
    return `${GAME_PROMPTS.sentenceBuilder.basePrompt}

Generate exactly ${count} sentences for ${difficulty.toUpperCase()} difficulty level.

REQUIREMENTS:
1. Each sentence must be grammatically correct and meaningful
2. Use appropriate vocabulary for ${difficulty} level English learners
3. Ensure words can be logically scrambled and unscrambled
4. Avoid contractions, punctuation, or special characters
5. Use lowercase words only

For each sentence, provide:
- correct: Array of words in proper sentence order
- jumbled: Array of same words in scrambled order (MUST be different from correct order)
- chunks: Grammar components (N=Noun, V=Verb, P=Preposition, A=Adjective/Adverb, C=Conjunction, D=Determiner, M=Modal, R=Pronoun)

Format as valid JSON array:
[
  {
    "correct": ["the", "research", "has", "demonstrated", "significant", "impact"],
    "jumbled": ["demonstrated", "research", "impact", "the", "significant", "has"],
    "chunks": [
      {"words": ["the"], "type": "D"},
      {"words": ["research"], "type": "N"},
      {"words": ["has", "demonstrated"], "type": "V"},
      {"words": ["significant"], "type": "A"},
      {"words": ["impact"], "type": "N"}
    ]
  }
]

CRITICAL RULES:
- Return ONLY the JSON array, no other text
- Ensure jumbled order is truly scrambled (different from correct)
- All chunks must cover every word exactly once
- Use realistic, educational sentences
- Test that sentences make logical sense

Generate ${count} sentences now:`;
  }

  parseSentenceResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      let cleanText = responseText.trim();
      
      // Remove any markdown code block formatting
      cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      cleanText = cleanText.replace(/```\s*/, '');
      
      // Find JSON array in the response
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.warn('No JSON array found in response:', responseText.substring(0, 200) + '...');
        return [];
      }

      const sentences = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the response
      const validSentences = sentences.map(sentence => {
        // Ensure all required fields exist and are arrays
        const correct = Array.isArray(sentence.correct) ? sentence.correct : [];
        const jumbled = Array.isArray(sentence.jumbled) ? sentence.jumbled : correct.slice();
        const chunks = Array.isArray(sentence.chunks) ? sentence.chunks : [];
        
        // If jumbled is same as correct, shuffle it
        if (JSON.stringify(jumbled) === JSON.stringify(correct)) {
          const shuffled = [...correct];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return { correct, jumbled: shuffled, chunks };
        }
        
        return { correct, jumbled, chunks };
      }).filter(sentence => 
        sentence.correct.length > 0 && 
        sentence.jumbled.length === sentence.correct.length
      );

      logger.log('Successfully parsed sentences:', validSentences.length);
      return validSentences;
    } catch (error) {
      logger.error('Error parsing GenAI response:', error.message);
      logger.log('Raw response:', responseText.substring(0, 200) + '...');
      return [];
    }
  }

  getFallbackSentences(difficulty, count) {
    const fallbackSentences = {
      easy: [
        {
          jumbled: ["cat", "the", "sleeps"],
          correct: ["the", "cat", "sleeps"],
          chunks: [
            { words: ["the", "cat"], type: "N" },
            { words: ["sleeps"], type: "V" }
          ]
        },
        {
          jumbled: ["runs", "dog", "fast", "the"],
          correct: ["the", "dog", "runs", "fast"],
          chunks: [
            { words: ["the", "dog"], type: "N" },
            { words: ["runs", "fast"], type: "V" }
          ]
        },
        {
          jumbled: ["is", "sun", "bright", "the"],
          correct: ["the", "sun", "is", "bright"],
          chunks: [
            { words: ["the", "sun"], type: "N" },
            { words: ["is", "bright"], type: "V" }
          ]
        },
        {
          jumbled: ["plays", "child", "the", "happily"],
          correct: ["the", "child", "plays", "happily"],
          chunks: [
            { words: ["the", "child"], type: "N" },
            { words: ["plays", "happily"], type: "V" }
          ]
        },
        {
          jumbled: ["sings", "bird", "beautifully", "the"],
          correct: ["the", "bird", "sings", "beautifully"],
          chunks: [
            { words: ["the", "bird"], type: "N" },
            { words: ["sings", "beautifully"], type: "V" }
          ]
        }
      ],
      medium: [
        {
          jumbled: ["quickly", "ran", "dog", "the", "park", "the", "in"],
          correct: ["the", "dog", "ran", "quickly", "in", "the", "park"],
          chunks: [
            { words: ["the", "dog"], type: "N" },
            { words: ["ran", "quickly"], type: "V" },
            { words: ["in", "the", "park"], type: "P" }
          ]
        },
        {
          jumbled: ["birds", "beautiful", "the", "trees", "tall", "in", "sang", "the"],
          correct: ["the", "beautiful", "birds", "sang", "in", "the", "tall", "trees"],
          chunks: [
            { words: ["the", "beautiful", "birds"], type: "N" },
            { words: ["sang"], type: "V" },
            { words: ["in", "the", "tall", "trees"], type: "P" }
          ]
        },
        {
          jumbled: ["children", "the", "playground", "played", "yesterday", "in", "the"],
          correct: ["the", "children", "played", "in", "the", "playground", "yesterday"],
          chunks: [
            { words: ["the", "children"], type: "N" },
            { words: ["played"], type: "V" },
            { words: ["in", "the", "playground"], type: "P" },
            { words: ["yesterday"], type: "A" }
          ]
        },
        {
          jumbled: ["book", "interesting", "read", "she", "the", "quietly"],
          correct: ["she", "read", "the", "interesting", "book", "quietly"],
          chunks: [
            { words: ["she"], type: "N" },
            { words: ["read"], type: "V" },
            { words: ["the", "interesting", "book"], type: "N" },
            { words: ["quietly"], type: "A" }
          ]
        },
        {
          jumbled: ["flowers", "garden", "bloom", "spring", "the", "in", "during"],
          correct: ["the", "flowers", "bloom", "in", "the", "garden", "during", "spring"],
          chunks: [
            { words: ["the", "flowers"], type: "N" },
            { words: ["bloom"], type: "V" },
            { words: ["in", "the", "garden"], type: "P" },
            { words: ["during", "spring"], type: "P" }
          ]
        }
      ],
      hard: [
        {
          jumbled: ["excitedly", "letter", "friend", "her", "wrote", "she", "to", "best", "her", "morning", "this"],
          correct: ["she", "excitedly", "wrote", "a", "letter", "to", "her", "best", "friend", "this", "morning"],
          chunks: [
            { words: ["she"], type: "N" },
            { words: ["excitedly", "wrote"], type: "V" },
            { words: ["a", "letter"], type: "N" },
            { words: ["to", "her", "best", "friend"], type: "P" },
            { words: ["this", "morning"], type: "P" }
          ]
        },
        {
          jumbled: ["carefully", "professor", "the", "complex", "explained", "theory", "students", "to", "his"],
          correct: ["the", "professor", "carefully", "explained", "the", "complex", "theory", "to", "his", "students"],
          chunks: [
            { words: ["the", "professor"], type: "N" },
            { words: ["carefully", "explained"], type: "V" },
            { words: ["the", "complex", "theory"], type: "N" },
            { words: ["to", "his", "students"], type: "P" }
          ]
        },
        {
          jumbled: ["musicians", "talented", "performed", "concert", "hall", "the", "beautifully", "in", "the"],
          correct: ["the", "talented", "musicians", "performed", "beautifully", "in", "the", "concert", "hall"],
          chunks: [
            { words: ["the", "talented", "musicians"], type: "N" },
            { words: ["performed", "beautifully"], type: "V" },
            { words: ["in", "the", "concert", "hall"], type: "P" }
          ]
        },
        {
          jumbled: ["scientist", "breakthrough", "discovered", "important", "laboratory", "an", "in", "her"],
          correct: ["the", "scientist", "discovered", "an", "important", "breakthrough", "in", "her", "laboratory"],
          chunks: [
            { words: ["the", "scientist"], type: "N" },
            { words: ["discovered"], type: "V" },
            { words: ["an", "important", "breakthrough"], type: "N" },
            { words: ["in", "her", "laboratory"], type: "P" }
          ]
        },
        {
          jumbled: ["architecture", "ancient", "tourists", "the", "admired", "building", "magnificent"],
          correct: ["the", "tourists", "admired", "the", "magnificent", "ancient", "architecture", "building"],
          chunks: [
            { words: ["the", "tourists"], type: "N" },
            { words: ["admired"], type: "V" },
            { words: ["the", "magnificent", "ancient", "architecture", "building"], type: "N" }
          ]
        }
      ]
    };

    const sentences = fallbackSentences[difficulty] || fallbackSentences.easy;
    return sentences.slice(0, Math.min(count, sentences.length));
  }

  getFallbackDragZillaQuestions() {
    return [
      {
        id: 1,
        text: "I like pizza ______ I don't like mushrooms.",
        choices: ["but", "because", "when", "then"],
        answer: "but"
      },
      {
        id: 2,
        text: "______ it rains, we will stay inside.",
        choices: ["If", "and", "or", "yet"],
        answer: "If"
      },
      {
        id: 3,
        text: "She studied hard ______ she passed the test.",
        choices: ["so", "although", "while", "unless"],
        answer: "so"
      },
      {
        id: 4,
        text: "We went to the park ______ played on the swings.",
        choices: ["and", "because", "before", "yet"],
        answer: "and"
      },
      {
        id: 5,
        text: "______ I finish my homework, I can watch TV.",
        choices: ["After", "But", "So", "Unless"],
        answer: "After"
      },
      {
        id: 6,
        text: "He was tired ______ he went to bed early.",
        choices: ["because", "or", "and", "unless"],
        answer: "because"
      },
      {
        id: 7,
        text: "I want to go swimming ______ the pool is closed.",
        choices: ["but", "when", "if", "therefore"],
        answer: "but"
      },
      {
        id: 8,
        text: "______ the bell rings, it's time for lunch.",
        choices: ["When", "So", "And", "Unless"],
        answer: "When"
      },
      {
        id: 9,
        text: "We can eat pizza ______ we can eat hamburgers.",
        choices: ["or", "because", "although", "hence"],
        answer: "or"
      },
      {
        id: 10,
        text: "______ she was sick, she went to school.",
        choices: ["Although", "So", "And", "Hence"],
        answer: "Although"
      },
      {
        id: 11,
        text: "I ate a sandwich, ______ I was still hungry.",
        choices: ["yet", "when", "after", "since"],
        answer: "yet"
      },
      {
        id: 12,
        text: "______ you finish your vegetables you may have dessert.",
        choices: ["If", "so", "but", "hence"],
        answer: "If"
      },
      {
        id: 13,
        text: "The sun was shining brightly, ______ the wind was cold.",
        choices: ["yet", "when", "because", "therefore"],
        answer: "yet"
      },
      {
        id: 14,
        text: "______ he practice he will improve.",
        choices: ["If", "but", "or", "hence"],
        answer: "If"
      },
      {
        id: 15,
        text: "I read a book ______ I went to bed.",
        choices: ["and", "when", "If", "hence"],
        answer: "and"
      }
    ];
  }

  getFallbackFlashCards(topic) {
    return Array.from({ length: 10 }, (_, i) => ({
      front: `Sample Question ${i + 1} for ${topic}`,
      back: `Sample Answer ${i + 1} for ${topic}`
    }));
  }

  getFallbackWordDropContent() {
    return {
      topic: "Technology & Computing",
      description: "Explore essential technology vocabulary used in modern computing, software development, and digital communication.",
      wordBank: [
        { id: 1, text: 'hardware', isUsed: false },
        { id: 2, text: 'database', isUsed: false },
        { id: 3, text: 'interface', isUsed: false },
        { id: 4, text: 'firewall', isUsed: false },
        { id: 5, text: 'bandwidth', isUsed: false },
        { id: 6, text: 'encryption', isUsed: false },
        { id: 7, text: 'algorithm', isUsed: false },
        { id: 8, text: 'cloud', isUsed: false },
        { id: 9, text: 'software', isUsed: false },
        { id: 10, text: 'network', isUsed: false }
      ],
      sentences: [
        {
          id: 1,
          text: "The computer's ______ includes components like the processor, memory, and hard drive.",
          answer: 'hardware',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 2,
          text: "The company's ______ stores all customer information and transaction records securely.",
          answer: 'database',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 3,
          text: "The user-friendly ______ makes it easy for people to navigate through the application.",
          answer: 'interface',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 4,
          text: "The ______ protects the company's internal systems from unauthorized access.",
          answer: 'firewall',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 5,
          text: "High-speed internet requires sufficient ______ to handle multiple video calls simultaneously.",
          answer: 'bandwidth',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 6,
          text: "The ______ ensures that sensitive data is protected from hackers and cyber threats.",
          answer: 'encryption',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 7,
          text: "The new ______ processes data more efficiently than the previous version.",
          answer: 'algorithm',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        },
        {
          id: 8,
          text: "Companies are moving their data to the ______ for better accessibility and cost efficiency.",
          answer: 'cloud',
          droppedWord: null,
          isCorrect: null,
          isActive: true
        }
      ]
    };
  }

  async generateAdaptiveSentences(userPerformance) {
    const { correctAnswers, totalAnswers, averageTime } = userPerformance;
    const accuracy = correctAnswers / totalAnswers;
    
    let difficulty = 'easy';
    if (accuracy > 0.8 && averageTime < 30) {
      difficulty = 'hard';
    } else if (accuracy > 0.6) {
      difficulty = 'medium';
    }

    console.log(`Generating adaptive sentences with difficulty: ${difficulty} (accuracy: ${accuracy.toFixed(2)}, avgTime: ${averageTime.toFixed(1)}s)`);
    return await this.generateSentences(difficulty, 3);
  }

  // DragZilla - Generate conjunction/linking word questions
  async generateDragZillaQuestions() {
    if (!this.apiKey) {
      logger.error('No API key available for DragZilla questions, using fallback');
      return this.getFallbackDragZillaQuestions();
    }

    try {
      logger.log('Generating DragZilla conjunction questions...');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: GAME_PROMPTS.dragzilla.basePrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const generatedQuestions = JSON.parse(jsonMatch[0]);
          return generatedQuestions.map((q, index) => ({
            ...q,
            id: index + 1
          }));
        }
      }
      
      throw new Error("Couldn't parse questions from response");
    } catch (error) {
      logger.error('Error generating DragZilla questions:', error.message);
      return this.getFallbackDragZillaQuestions();
    }
  }

  // FlashCards - Generate flashcards for any topic
  async generateFlashCards(topic) {
    if (!this.apiKey) {
      logger.error('No API key available for FlashCards, using fallback');
      return this.getFallbackFlashCards(topic);
    }

    try {
      logger.log(`Generating FlashCards for topic: ${topic}`);
      
      const prompt = GAME_PROMPTS.flashcards.basePrompt(topic);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      throw new Error("Couldn't parse flashcards from response");
    } catch (error) {
      logger.error('Error generating FlashCards:', error.message);
      return this.getFallbackFlashCards(topic);
    }
  }

  // WordDrop - Generate vocabulary-based fill-in-the-blank questions
  async generateWordDropContent() {
    if (!this.apiKey) {
      logger.error('No API key available for WordDrop content, using fallback');
      return this.getFallbackWordDropContent();
    }

    try {
      logger.log('Generating WordDrop vocabulary content...');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: GAME_PROMPTS.wordDrop.basePrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
            topP: 0.9,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const generatedContent = JSON.parse(jsonMatch[0]);
          
          // Ensure the content has the correct structure
          if (generatedContent.wordBank && generatedContent.sentences) {
            // Transform the sentences to match our component's expected format
            const transformedSentences = generatedContent.sentences.map(sentence => ({
              ...sentence,
              droppedWord: null,
              isCorrect: null,
              isActive: true
            }));

            // Transform words to match the component's expected format
            const transformedWordBank = generatedContent.wordBank.map((word, index) => ({
              id: index + 1,
              text: word,
              isUsed: false
            }));

            logger.log(`Generated WordDrop content for topic: ${generatedContent.topic}`);
            
            return {
              topic: generatedContent.topic,
              description: generatedContent.description,
              wordBank: transformedWordBank,
              sentences: transformedSentences
            };
          }
        }
      }
      
      throw new Error("Couldn't parse WordDrop content from response");
    } catch (error) {
      logger.error('Error generating WordDrop content:', error.message);
      return this.getFallbackWordDropContent();
    }
  }

  // Test method to verify API connection
  async testConnection() {
    if (!this.apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello" if you can hear me.'
            }]
          }]
        })
      });

      if (response.ok) {
        return { success: true, message: 'API connection successful' };
      } else {
        return { success: false, error: `API returned ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateIELTSWritingFeedback(prompt) {
    if (!this.apiKey) {
      logger.error('No API key available for IELTS feedback, using fallback feedback');
      return this.getFallbackIELTSFeedback();
    }

    try {
      logger.log('Making IELTS writing feedback API request');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more consistent IELTS scoring
            maxOutputTokens: 4000,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        const errorMsg = `IELTS feedback API request failed with status ${response.status}: ${errorText}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        const errorMsg = "Received invalid response format from the AI service for IELTS feedback";
        logger.error(errorMsg, data);
        throw new Error(errorMsg);
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      logger.log('Successfully received IELTS feedback response from API');
      
      // Parse the JSON response
      let parsedFeedback;
      try {
        // First attempt: Try to extract JSON from markdown code blocks (```json ... ```)
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
          const jsonText = jsonMatch[1];
          try {
            parsedFeedback = JSON.parse(jsonText);
            logger.log('Successfully parsed IELTS feedback JSON from markdown blocks');
          } catch (jsonError) {
            logger.warn('Failed to parse JSON from markdown blocks, attempting to fix formatting');
            // Attempt to fix common JSON formatting issues
            let sanitizedJson = jsonText
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
              .replace(/'/g, '"')
              .replace(/,(\s*[}\]])/g, '$1');
            
            try {
              parsedFeedback = JSON.parse(sanitizedJson);
              logger.log('Successfully parsed IELTS feedback JSON after formatting fixes');
            } catch (repairError) {
              logger.error('Failed to parse JSON even after formatting fixes:', repairError.message);
              parsedFeedback = this.getFallbackIELTSFeedback();
            }
          }
        } else {
          // Try to find JSON without code blocks
          const possibleJson = generatedText.match(/(\{[\s\S]*\})/);
          
          if (possibleJson && possibleJson[1]) {
            try {
              parsedFeedback = JSON.parse(possibleJson[1]);
              logger.log('Successfully parsed IELTS feedback JSON without code blocks');
            } catch (rawJsonError) {
              logger.error('Failed to parse raw JSON from response:', rawJsonError.message);
              parsedFeedback = this.getFallbackIELTSFeedback();
            }
          } else {
            logger.error('No JSON found in IELTS feedback response');
            logger.log('Response text:', generatedText.substring(0, 500) + '...');
            parsedFeedback = this.getFallbackIELTSFeedback();
          }
        }
      } catch (e) {
        logger.error('Unexpected error parsing IELTS feedback response:', e.message);
        parsedFeedback = this.getFallbackIELTSFeedback();
      }

      return parsedFeedback;
    } catch (error) {
      logger.error('Error generating IELTS writing feedback:', error.message);
      return this.getFallbackIELTSFeedback();
    }
  }

  getFallbackIELTSFeedback() {
    return {
      task1: {
        criterion_scores: {
          task_achievement_response: { 
            score: "6.5", 
            feedback_points: [
              "Addresses the task appropriately",
              "Covers the main features of the graph/chart", 
              "Presents a clear overview"
            ] 
          },
          coherence_cohesion: { 
            score: "6.5", 
            feedback_points: [
              "Information is arranged coherently",
              "Uses cohesive devices effectively", 
              "Paragraphing is logical"
            ] 
          },
          lexical_resource: { 
            score: "6.5", 
            feedback_points: [
              "Uses adequate range of vocabulary",
              "Makes some errors in word choice/formation", 
              "Generally paraphrases successfully"
            ] 
          },
          grammatical_range_accuracy: { 
            score: "6.5", 
            feedback_points: [
              "Uses a mix of simple and complex sentences",
              "Makes some errors but meaning remains clear", 
              "Shows good control of grammar and punctuation"
            ] 
          }
        },
        overall_score: "6.5",
        strengths: ["Clear structure", "Appropriate response to the task", "Effective use of language"],
        improvements: ["Consider using more varied vocabulary", "Pay attention to complex grammatical structures", "Provide more detailed analysis of data"]
      },
      task2: {
        criterion_scores: {
          task_achievement_response: { 
            score: "7.0", 
            feedback_points: [
              "Addresses all parts of the task",
              "Presents a clear position throughout", 
              "Fully developed response"
            ] 
          },
          coherence_cohesion: { 
            score: "7.0", 
            feedback_points: [
              "Logical progression of ideas",
              "Uses a range of cohesive devices", 
              "Clear central topic in each paragraph"
            ] 
          },
          lexical_resource: { 
            score: "7.0", 
            feedback_points: [
              "Uses a range of vocabulary with flexibility",
              "Uses less common items with some awareness of style", 
              "Makes occasional errors in word choice"
            ] 
          },
          grammatical_range_accuracy: { 
            score: "7.0", 
            feedback_points: [
              "Uses a variety of complex structures",
              "Majority of sentences are error-free", 
              "Good control of grammar and punctuation"
            ] 
          }
        },
        overall_score: "7.0",
        strengths: ["Well-developed response", "Clear position throughout", "Good range of vocabulary"],
        improvements: ["Minor grammatical errors in complex sentences", "Further examples would strengthen arguments", "More precise word choice in some instances"]
      },
      final_score: "6.8",
      overall_feedback: "This is generated feedback as we couldn't process your submission. Your writing demonstrates a good understanding of the IELTS writing task requirements. To improve your score, focus on vocabulary precision and grammar in complex sentences."
    };
  }
}

export default new GenAIService(); 
// Fallback data for IELTS Speaking test in case API calls fail
const fallbackData = {
  "testId": "ILTS.SPKNG.GT.T2",
  "Part1": [
    "Let's talk about your accommodation. What kind of home do you live in?",
    "Do you plan to live there for a long time? Why or why not?",
    "What is your favourite room in your home? Why?",
    "How could your home be improved?"
  ],
  "Part2": {
    "title": "Describe a time when you were very pleased with a service you received from a company or business.",
    "cues": [
      "What service did you receive?",
      "When and where did you receive this service?",
      "What exactly did the person or company do that pleased you?",
      "And explain why you were so satisfied with the service."
    ],
    "final_question": "And say if you have used this service again since then."
  },
  "Part3": [
    "What are the most important aspects of good customer service, in your opinion?",
    "How has customer service changed in recent years compared to the past?",
    "In what ways can companies ensure they provide excellent service to all their customers?",
    "Do you think that good customer service is more important for some types of businesses than others? Why?"
  ]
};

export default fallbackData;
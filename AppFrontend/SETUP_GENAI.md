# Setting Up GenAI for WordTile Game

## Quick Setup

1. **Get your API key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Create .env file:**
   ```bash
   # In the AppFrontend directory, create a .env file
   cp env.example .env
   ```

3. **Add your API key:**
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## ✅ Fixed Issues

### Browser Compatibility
- **Removed Genkit dependencies** - They're Node.js only, not browser-compatible
- **Implemented direct Gemini REST API calls** - Works perfectly in browsers
- **Updated Content Security Policy** - Added missing Firebase and Google domains

### Error Resolution
- ❌ `AsyncLocalStorage is not a constructor` - **FIXED** by removing Genkit
- ❌ CSP violations for Firebase - **FIXED** by updating index.html CSP
- ❌ API connection issues - **FIXED** with proper REST API implementation

## Features Added

### 🧠 AI-Powered Questions
- Direct Gemini REST API integration (browser-compatible)
- Dynamic sentence generation based on difficulty
- Adaptive difficulty based on player performance
- Robust fallback to curated questions if AI is unavailable
- API connection testing and error handling

### 🧲 Magnetic Poetry Experience
- Smooth drag & drop with magnetic snapping
- Visual feedback with hover effects and animations
- Touch-friendly for mobile devices
- Sound effects for interactions
- Drop indicators show exactly where words will land

### 🎮 Enhanced UX/UI
- Beautiful gradients and modern design
- Progress indicators and streak tracking
- Loading animations while AI generates questions
- Comprehensive game statistics
- Floating particle effects for correct answers

### 📊 Performance Tracking
- Accuracy monitoring
- Speed tracking  
- Streak counting
- Adaptive difficulty adjustment
- Time bonus scoring

## How It Works

1. **Browser-Compatible API**: Uses Gemini REST API directly via fetch()
2. **Graceful Fallback**: Automatically uses curated questions if API fails
3. **Adaptive Learning**: Adjusts difficulty based on player performance
4. **Magnetic Interactions**: Words snap into place with smooth animations
5. **Multi-Device Support**: Works seamlessly on desktop and mobile
6. **CSP Compliant**: All API calls respect Content Security Policy

## API Testing

The service includes a built-in test method to verify API connectivity:

```javascript
// Test API connection
const result = await genAIService.testConnection();
console.log(result); // { success: true/false, message/error: "..." }
```

## Troubleshooting

### If you see browser errors:
1. **Check your API key** in the .env file
2. **Verify CSP** allows `generativelanguage.googleapis.com`
3. **Check browser console** for detailed error messages
4. **Fallback questions** will load automatically if API fails

### If questions don't generate:
- The game will automatically use curated fallback questions
- Check browser Network tab to see if API calls are being made
- Verify your Gemini API key has proper permissions

The game now works perfectly in browsers with true magnetic poetry interactions! 🧲✨ 
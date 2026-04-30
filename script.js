// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// AI and Web Search Integration
class AIIntegration {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://api.openai.com/v1';
        this.searchApiKey = '';
        this.searchEngineId = '';
    }

    // Enhanced AI-powered time estimation with topic and web analysis
    async getAIEstimation(taskData, webAnalysis = null) {
        let prompt = `As an expert in time management and education, estimate the time needed for this task:
        
        Task: ${taskData.taskName}
        Subject: ${taskData.subject}
        Type: ${taskData.workType}
        Difficulty: ${taskData.difficulty}
        Work Speed: ${taskData.workSpeed}`;
        
        // Add topic information if available
        if (taskData.topic) {
            prompt += `\nSpecific Topic: ${taskData.topic}`;
        }
        
        prompt += `\n\nConsider factors like complexity, research needs, topic specificity, and typical student challenges.`;
        
        // Add web analysis if available
        if (webAnalysis) {
            prompt += `\n\nWeb Analysis: ${webAnalysis.analysis}`;
            prompt += `\nRecommended difficulty based on web research: ${webAnalysis.difficulty} (${Math.round(webAnalysis.confidence * 100)}% confidence)`;
        }
        
        prompt += `\n\nRespond with just a number (in hours) between 0.5 and 20.`;

        // Always try AI estimation first, even without API key (for demo purposes)
        if (this.apiKey || true) { // Allow demo mode without API key
            try {
                // If no API key, simulate AI response with more variation
                if (!this.apiKey) {
                    return this.simulateAIResponse(taskData, webAnalysis);
                }
                
                const response = await fetch(`${this.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 50,
                        temperature: 0.7 // Increased for more variation
                    })
                });

                const data = await response.json();
                if (data.choices && data.choices[0]) {
                    const aiEstimate = parseFloat(data.choices[0].message.content.trim());
                    if (aiEstimate && aiEstimate > 0 && aiEstimate <= 20) {
                        return aiEstimate;
                    }
                }
            } catch (error) {
                console.log('AI API failed, using fallback:', error);
            }
        }

        return this.getFallbackEstimate(taskData, webAnalysis);
    }

    // Enhanced fallback estimation with more dynamic variation
    getFallbackEstimate(taskData, webAnalysis = null) {
        // Generate more varied base estimates based on task name complexity
        const taskComplexity = this.analyzeTaskComplexity(taskData.taskName, taskData.topic);
        
        const baseEstimates = {
            assignment: { easy: 2, medium: 4, hard: 6 },
            project: { easy: 6, medium: 10, hard: 15 },
            study: { easy: 1, medium: 2, hard: 3 },
            lab: { easy: 1.5, medium: 2.5, hard: 4 },
            reading: { easy: 0.8, medium: 1.5, hard: 2.5 },
            review: { easy: 0.8, medium: 1.2, hard: 2 }
        };

        const speedMultipliers = { slow: 1.3, normal: 1.0, fast: 0.8 };
        const subjectMultipliers = {
            math: 1.2, science: 1.1, english: 1.0, 
            history: 0.9, computer: 1.15, other: 1.0
        };

        // Use web analysis to adjust difficulty if available
        let effectiveDifficulty = taskData.difficulty;
        if (webAnalysis && webAnalysis.confidence > 0.6) {
            effectiveDifficulty = webAnalysis.difficulty;
        }

        let baseTime = baseEstimates[taskData.workType]?.[effectiveDifficulty] || 3;
        
        // Apply task complexity multiplier for more variation
        baseTime *= taskComplexity;
        baseTime *= speedMultipliers[taskData.workSpeed] || 1.0;
        baseTime *= subjectMultipliers[taskData.subject] || 1.0;

        // Add research time if web search suggests complexity
        if (webAnalysis && webAnalysis.difficulty === 'hard') {
            baseTime *= 1.2; // 20% extra time for complex tasks
        }

        return Math.round(baseTime * 10) / 10; // Round to 1 decimal
    }
    
    // Analyze task complexity based on name and topic
    analyzeTaskComplexity(taskName, topic = '') {
        const text = (taskName + ' ' + topic).toLowerCase();
        let complexity = 1.0;
        
        // Complexity indicators
        const complexityWords = {
            high: ['advanced', 'complex', 'difficult', 'challenging', 'graduate', 'research', 'thesis', 'dissertation', 'comprehensive'],
            medium: ['intermediate', 'practice', 'analysis', 'review', 'summary', 'essay'],
            low: ['basic', 'simple', 'intro', 'overview', 'quick', 'short', 'easy']
        };
        
        // Check for complexity words
        for (const [level, words] of Object.entries(complexityWords)) {
            if (words.some(word => text.includes(word))) {
                if (level === 'high') complexity *= 1.5;
                else if (level === 'medium') complexity *= 1.2;
                else if (level === 'low') complexity *= 0.8;
            }
        }
        
        // Add some randomness for natural variation
        complexity *= (0.9 + Math.random() * 0.2); // ±10% variation
        
        return complexity;
    }
    
    // Simulate AI response for demo mode without API key
    simulateAIResponse(taskData, webAnalysis = null) {
        // Create dynamic estimation based on all inputs
        let baseTime = 2.5; // Base time in hours
        
        // Adjust based on work type
        const workTypeMultipliers = {
            assignment: 1.0, project: 2.5, study: 0.8, 
            lab: 0.6, reading: 0.4, review: 0.5
        };
        baseTime *= workTypeMultipliers[taskData.workType] || 1.0;
        
        // Adjust based on difficulty
        const difficultyMultipliers = {
            easy: 0.7, medium: 1.0, hard: 1.8
        };
        baseTime *= difficultyMultipliers[taskData.difficulty] || 1.0;
        
        // Adjust based on work speed
        const speedMultipliers = {
            slow: 1.4, normal: 1.0, fast: 0.7
        };
        baseTime *= speedMultipliers[taskData.workSpeed] || 1.0;
        
        // Adjust based on subject
        const subjectMultipliers = {
            math: 1.3, science: 1.2, english: 1.0,
            history: 0.9, computer: 1.4, other: 1.0
        };
        baseTime *= subjectMultipliers[taskData.subject] || 1.0;
        
        // Add topic complexity
        if (taskData.topic) {
            const topicText = taskData.topic.toLowerCase();
            if (topicText.includes('advanced') || topicText.includes('complex')) {
                baseTime *= 1.5;
            } else if (topicText.includes('basic') || topicText.includes('intro')) {
                baseTime *= 0.8;
            }
        }
        
        // Add web analysis influence
        if (webAnalysis && webAnalysis.confidence > 0.5) {
            if (webAnalysis.difficulty === 'hard') baseTime *= 1.3;
            else if (webAnalysis.difficulty === 'easy') baseTime *= 0.9;
        }
        
        // Add natural variation (±15%)
        baseTime *= (0.85 + Math.random() * 0.3);
        
        // Ensure valid range
        return Math.max(0.5, Math.min(20, Math.round(baseTime * 10) / 10));
    }

    // Enhanced web search for study resources using topic-specific queries
    async searchStudyResources(taskName, subject, topic = '') {
        // Build topic-specific search query
        let query = topic ? 
            `${topic} ${subject} ${taskName} tutorial guide explanation` :
            `${taskName} ${subject} study resources tutorial guide`;
        
        // Try real web search first, fallback to mock results
        try {
            const realResults = await this.performRealSearch(query);
            if (realResults && realResults.length > 0) {
                return realResults;
            }
        } catch (error) {
            console.log('Real search failed, using fallback:', error);
        }
        
        // Enhanced fallback results with topic-specific resources
        const fallbackResults = this.generateTopicSpecificResources(taskName, subject, topic);

        return fallbackResults;
    }

    // Generate topic-specific educational resources
    generateTopicSpecificResources(taskName, subject, topic) {
        const topicText = topic || taskName;
        
        // Topic-specific resource templates
        const topicResources = [
            {
                title: `Khan Academy - ${topicText} ${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
                link: `https://www.khanacademy.org/search?search_query=${encodeURIComponent(topicText + ' ' + subject)}`,
                snippet: `Comprehensive ${subject} resources covering ${topicText} with video tutorials, practice exercises, and step-by-step explanations.`,
                type: 'tutorial',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            },
            {
                title: `YouTube - ${topicText} Deep Dive`,
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicText + ' ' + subject + ' explained')}`,
                snippet: `In-depth video tutorials and explanations for ${topicText} in ${subject} by expert educators and content creators.`,
                type: 'video',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            },
            {
                title: `Quizlet - ${topicText} Study Set`,
                link: `https://quizlet.com/search?q=${encodeURIComponent(topicText + ' ' + subject)}`,
                snippet: `Interactive flashcards, practice tests, and study games specifically for ${topicText} in ${subject}.`,
                type: 'practice',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            },
            {
                title: `Coursera - ${topicText} Specialization`,
                link: `https://www.coursera.org/search?query=${encodeURIComponent(topicText + ' ' + subject + ' course')}`,
                snippet: `Professional online courses and specializations covering ${topicText} and advanced ${subject} concepts.`,
                type: 'course',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            },
            {
                title: `Stack Exchange - ${topicText} Questions`,
                link: `https://stackexchange.com/search?q=${encodeURIComponent(topicText + ' ' + subject)}`,
                snippet: `Community Q&A with detailed answers to ${topicText} questions and ${subject} problems from experts.`,
                type: 'qa',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            }
        ];

        // Add subject-specific specialized resources
        if (subject === 'math') {
            topicResources.push({
                title: `Wolfram Alpha - ${topicText} Calculator`,
                link: `https://www.wolframalpha.com/input/?i=${encodeURIComponent(topicText)}`,
                snippet: `Computational engine for solving ${topicText} problems and visualizing mathematical concepts.`,
                type: 'tool',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
        } else if (subject === 'science') {
            topicResources.push({
                title: `PhET Simulations - ${topicText} Lab`,
                link: `https://phet.colorado.edu/en/simulations/search?query=${encodeURIComponent(topicText)}`,
                snippet: `Interactive science simulations for exploring ${topicText} concepts through virtual experiments.`,
                type: 'simulation',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
        } else if (subject === 'computer') {
            topicResources.push({
                title: `GeeksforGeeks - ${topicText} Tutorial`,
                link: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topicText)}`,
                snippet: `Comprehensive programming tutorials and articles for ${topicText} with code examples and explanations.`,
                type: 'tutorial',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
            topicResources.push({
                title: `W3Schools - ${topicText} Guide`,
                link: `https://www.w3schools.com/search/?search_query=${encodeURIComponent(topicText)}`,
                snippet: `Easy-to-understand tutorials and references for ${topicText} with interactive examples and exercises.`,
                type: 'tutorial',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
            topicResources.push({
                title: `GitHub - ${topicText} Projects`,
                link: `https://github.com/search?q=${encodeURIComponent(topicText + ' tutorial')}&type=repositories`,
                snippet: `Open source projects and code examples for learning ${topicText} through practical implementation.`,
                type: 'code',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
        } else if (subject === 'english') {
            topicResources.push({
                title: `SparkNotes - ${topicText} Analysis`,
                link: `https://www.sparknotes.com/search?q=${encodeURIComponent(topicText)}`,
                snippet: `Literature study guides and analysis for ${topicText} with summaries and character breakdowns.`,
                type: 'guide',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
        } else if (subject === 'history') {
            topicResources.push({
                title: `Khan Academy - ${topicText} History`,
                link: `https://www.khanacademy.org/humanities/history/search?search_query=${encodeURIComponent(topicText)}`,
                snippet: `Historical context and detailed explanations of ${topicText} with timelines and primary sources.`,
                type: 'documentary',
                difficulty: this.estimateResourceDifficulty(topicText, subject)
            });
        }
        
        // Add general resources that work for all subjects
        topicResources.push({
            title: `GeeksforGeeks - ${topicText} Learning`,
            link: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topicText + ' ' + subject)}`,
            snippet: `Detailed articles and tutorials on ${topicText} in ${subject} with practical examples and step-by-step guides.`,
            type: 'tutorial',
            difficulty: this.estimateResourceDifficulty(topicText, subject)
        });
        
        topicResources.push({
            title: `W3Schools - ${topicText} Reference`,
            link: `https://www.w3schools.com/search/?search_query=${encodeURIComponent(topicText + ' ' + subject)}`,
            snippet: `Quick reference guides and tutorials for ${topicText} concepts with interactive examples and code snippets.`,
            type: 'reference',
            difficulty: this.estimateResourceDifficulty(topicText, subject)
        });

        return topicResources;
    }

    // Perform real web search using DuckDuckGo API (free, no API key required)
    async performRealSearch(query) {
        try {
            const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
            const data = await response.json();
            
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                return data.RelatedTopics.slice(0, 5).map(topic => ({
                    title: topic.Text ? topic.Text.split(' - ')[0] : 'Study Resource',
                    link: topic.FirstURL || '#',
                    snippet: topic.Text || 'Educational resource for your studies',
                    type: 'web',
                    difficulty: 'medium'
                }));
            }
        } catch (error) {
            console.log('DuckDuckGo search failed:', error);
        }
        
        return null;
    }

    // Enhanced resource difficulty estimation considering topic specificity
    estimateResourceDifficulty(taskName, subject, topic = '') {
        const difficultyKeywords = {
            easy: ['introduction', 'basics', 'beginner', 'fundamentals', 'getting started', '101', 'basic'],
            hard: ['advanced', 'complex', 'difficult', 'challenge', 'expert', 'master', 'graduate', 'research'],
            medium: ['intermediate', 'practice', 'guide', 'tutorial', 'overview', 'applied']
        };
        
        // Include topic in difficulty analysis
        const searchText = (taskName + ' ' + subject + ' ' + topic).toLowerCase();
        
        for (const [level, keywords] of Object.entries(difficultyKeywords)) {
            if (keywords.some(keyword => searchText.includes(keyword))) {
                return level;
            }
        }
        
        // Topic-specific difficulty adjustments
        if (topic) {
            const advancedTopics = ['calculus', 'quantum', 'machine learning', 'algorithms', 'organic chemistry', 'constitutional law'];
            const basicTopics = ['arithmetic', 'basic grammar', 'intro to', 'elementary', 'beginner'];
            
            if (advancedTopics.some(adv => topic.toLowerCase().includes(adv))) {
                return 'hard';
            } else if (basicTopics.some(basic => topic.toLowerCase().includes(basic))) {
                return 'easy';
            }
        }
        
        return 'medium';
    }

    // Enhanced difficulty analysis using topic-specific web results
    async analyzeDifficultyFromWeb(taskName, subject, searchResults, topic = '') {
        if (!searchResults || searchResults.length === 0) {
            return null;
        }
        
        // Count difficulty indicators from search results
        const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
        
        searchResults.forEach(result => {
            if (result.difficulty) {
                difficultyCounts[result.difficulty]++;
            }
        });
        
        // Determine dominant difficulty
        const maxCount = Math.max(...Object.values(difficultyCounts));
        const dominantDifficulty = Object.keys(difficultyCounts).find(
            key => difficultyCounts[key] === maxCount
        );
        
        const topicText = topic ? ` for topic "${topic}"` : '';
        
        return {
            difficulty: dominantDifficulty,
            confidence: maxCount / searchResults.length,
            analysis: `Based on ${searchResults.length} topic-specific search results${topicText}, ${maxCount} suggest ${dominantDifficulty} difficulty level.`
        };
    }
}

// Natural Language Processing
class NLPProcessor {
    parseNaturalLanguage(input) {
        const taskData = {
            taskName: '',
            subject: '',
            workType: '',
            difficulty: '',
            workSpeed: '',
            deadline: ''
        };

        // Extract task name (usually the main subject)
        const taskPatterns = [
            /(?:finish|complete|do|work on)\s+(.+?)(?:\s+by|\s+before|\s+for|$)/i,
            /(.+?)(?:\s+assignment|project|homework|work|task)/i
        ];

        for (const pattern of taskPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                taskData.taskName = match[1].trim();
                break;
            }
        }

        // Extract subject
        const subjects = ['math', 'science', 'english', 'history', 'computer', 'biology', 'chemistry', 'physics'];
        for (const subject of subjects) {
            if (input.toLowerCase().includes(subject)) {
                taskData.subject = subject;
                break;
            }
        }

        // Extract work type
        if (input.toLowerCase().includes('project')) taskData.workType = 'project';
        else if (input.toLowerCase().includes('lab')) taskData.workType = 'lab';
        else if (input.toLowerCase().includes('study')) taskData.workType = 'study';
        else if (input.toLowerCase().includes('reading')) taskData.workType = 'reading';
        else if (input.toLowerCase().includes('review')) taskData.workType = 'review';
        else taskData.workType = 'assignment';

        // Extract difficulty
        if (input.toLowerCase().includes('hard') || input.toLowerCase().includes('difficult')) {
            taskData.difficulty = 'hard';
        } else if (input.toLowerCase().includes('easy') || input.toLowerCase().includes('simple')) {
            taskData.difficulty = 'easy';
        } else {
            taskData.difficulty = 'medium';
        }

        // Extract work speed
        if (input.toLowerCase().includes('slow') || input.toLowerCase().includes('take my time')) {
            taskData.workSpeed = 'slow';
        } else if (input.toLowerCase().includes('fast') || input.toLowerCase().includes('quick')) {
            taskData.workSpeed = 'fast';
        } else {
            taskData.workSpeed = 'normal';
        }

        // Extract deadline
        const datePatterns = [
            /by\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i,
            /before\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i,
            /on\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i
        ];

        for (const pattern of datePatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                const day = match[1].toLowerCase();
                const days = {
                    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
                    'friday': 5, 'saturday': 6, 'sunday': 0
                };
                
                const today = new Date();
                const targetDay = days[day];
                const currentDay = today.getDay();
                
                let daysUntilTarget = targetDay - currentDay;
                if (daysUntilTarget <= 0) daysUntilTarget += 7;
                
                const deadlineDate = new Date(today);
                deadlineDate.setDate(today.getDate() + daysUntilTarget);
                taskData.deadline = deadlineDate.toISOString().split('T')[0];
                break;
            }
        }

        return taskData;
    }
}

// Machine Learning Personalization
class MLPersonalization {
    constructor() {
        this.taskHistory = this.loadTaskHistory();
    }

    loadTaskHistory() {
        const stored = localStorage.getItem('taskHistory');
        return stored ? JSON.parse(stored) : [];
    }

    saveTaskHistory() {
        localStorage.setItem('taskHistory', JSON.stringify(this.taskHistory));
    }

    recordTask(taskData, estimatedTime, actualTime = null) {
        const record = {
            id: Date.now(),
            taskData,
            estimatedTime,
            actualTime,
            timestamp: new Date().toISOString(),
            accuracy: actualTime ? Math.abs(estimatedTime - actualTime) / actualTime : null
        };

        this.taskHistory.push(record);
        this.saveTaskHistory();
    }

    getPersonalizedEstimate(taskData) {
        const similarTasks = this.taskHistory.filter(task => {
            return task.taskData.subject === taskData.subject &&
                   task.taskData.workType === taskData.workType &&
                   task.taskData.difficulty === taskData.difficulty &&
                   task.taskData.workSpeed === taskData.workSpeed;
        });

        if (similarTasks.length === 0) return null;

        const avgRatio = similarTasks.reduce((sum, task) => {
            return sum + (task.actualTime / task.estimatedTime);
        }, 0) / similarTasks.length;

        return avgRatio;
    }
}

// Initialize AI and ML systems
const aiIntegration = new AIIntegration();
const nlpProcessor = new NLPProcessor();
const mlPersonalization = new MLPersonalization();

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form Handling and AI Time Estimation
const taskForm = document.getElementById('taskForm');
const scheduleResult = document.getElementById('scheduleResult');
const scheduleContent = document.getElementById('scheduleContent');

// Time estimation rules based on difficulty and work type
const timeEstimationRules = {
    assignment: {
        easy: { slow: 2.5, normal: 2, fast: 1.5 },
        medium: { slow: 4, normal: 3, fast: 2.5 },
        hard: { slow: 6, normal: 5, fast: 4 }
    },
    project: {
        easy: { slow: 8, normal: 6, fast: 5 },
        medium: { slow: 12, normal: 10, fast: 8 },
        hard: { slow: 18, normal: 15, fast: 12 }
    },
    study: {
        easy: { slow: 1.5, normal: 1, fast: 0.8 },
        medium: { slow: 2.5, normal: 2, fast: 1.5 },
        hard: { slow: 4, normal: 3, fast: 2.5 }
    },
    lab: {
        easy: { slow: 2, normal: 1.5, fast: 1.2 },
        medium: { slow: 3, normal: 2.5, fast: 2 },
        hard: { slow: 5, normal: 4, fast: 3 }
    },
    reading: {
        easy: { slow: 1, normal: 0.8, fast: 0.6 },
        medium: { slow: 2, normal: 1.5, fast: 1.2 },
        hard: { slow: 3, normal: 2.5, fast: 2 }
    },
    review: {
        easy: { slow: 1, normal: 0.8, fast: 0.6 },
        medium: { slow: 1.5, normal: 1.2, fast: 1 },
        hard: { slow: 2.5, normal: 2, fast: 1.5 }
    }
};

// Subject complexity multipliers
const subjectMultipliers = {
    math: 1.2,
    science: 1.1,
    english: 1.0,
    history: 0.9,
    computer: 1.15,
    other: 1.0
};

// Calculate estimated time for a task with web analysis integration
async function calculateEstimatedTime(taskData, webAnalysis = null) {
    const { workType, difficulty, workSpeed, subject } = taskData;
    
    // Check if AI is enabled
    const useAI = document.getElementById('useAI')?.checked;
    
    if (useAI) {
        // Get AI estimation with web analysis
        const aiEstimate = await aiIntegration.getAIEstimation(taskData, webAnalysis);
        
        // Apply ML personalization if available
        const personalizedRatio = mlPersonalization.getPersonalizedEstimate(taskData);
        const finalEstimate = personalizedRatio ? aiEstimate * personalizedRatio : aiEstimate;
        
        return Math.round(finalEstimate * 10) / 10;
    } else {
        // Use enhanced rule-based calculation with web analysis
        let baseTime = timeEstimationRules[workType][difficulty][workSpeed];
        let multiplier = subjectMultipliers[subject] || 1.0;
        
        // Apply web analysis adjustments
        if (webAnalysis && webAnalysis.confidence > 0.6) {
            // Adjust time based on web analysis difficulty
            const difficultyMultipliers = { easy: 0.8, medium: 1.0, hard: 1.3 };
            multiplier *= difficultyMultipliers[webAnalysis.difficulty] || 1.0;
        }
        
        // Add some randomness to simulate real-world variations
        const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
        
        return Math.round(baseTime * multiplier * randomFactor * 10) / 10; // Round to 1 decimal
    }
}

// Enhanced schedule generation with topic and web analysis integration
async function generateSchedule(taskData) {
    const { availableHours, deadline, taskName, subject, topic } = taskData;
    
    // Get web search results and analysis first if enabled
    let searchResults = [];
    let webAnalysis = null;
    const enableWebSearch = document.getElementById('enableWebSearch')?.checked;
    
    if (enableWebSearch) {
        searchResults = await aiIntegration.searchStudyResources(taskName, subject, topic);
        webAnalysis = await aiIntegration.analyzeDifficultyFromWeb(taskName, subject, searchResults, topic);
    }
    
    // Calculate estimated time with web analysis
    const estimatedTime = await calculateEstimatedTime(taskData, webAnalysis);
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
    
    // Calculate if task is feasible
    const totalAvailableHours = daysUntilDeadline * availableHours;
    const isFeasible = totalAvailableHours >= estimatedTime;
    
    // Generate daily schedule
    const schedule = [];
    let remainingTime = estimatedTime;
    let currentDay = 0;
    
    while (remainingTime > 0 && currentDay < daysUntilDeadline) {
        const dailyTime = Math.min(availableHours, remainingTime);
        const workDate = new Date(today);
        workDate.setDate(today.getDate() + currentDay);
        
        schedule.push({
            date: workDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: dailyTime,
            remaining: Math.max(0, remainingTime - dailyTime)
        });
        
        remainingTime -= dailyTime;
        currentDay++;
    }
    
    // Record task for ML learning
    mlPersonalization.recordTask(taskData, estimatedTime);
    
    return {
        taskName,
        topic,
        estimatedTime,
        totalAvailableHours,
        isFeasible,
        daysUntilDeadline,
        schedule,
        searchResults,
        webAnalysis,
        warning: !isFeasible ? `Warning: This task requires ${estimatedTime} hours but you only have ${totalAvailableHours} hours available. Consider adjusting your schedule or deadline.` : null
    };
}

// Format time display
function formatTime(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    if (minutes === 0) {
        return `${fullHours} hour${fullHours > 1 ? 's' : ''}`;
    }
    return `${fullHours} hour${fullHours > 1 ? 's' : ''} ${minutes} min`;
}

// Enhanced display schedule results with topic and web analysis
function displaySchedule(scheduleData) {
    const { taskName, topic, estimatedTime, totalAvailableHours, isFeasible, daysUntilDeadline, schedule, searchResults, webAnalysis, warning } = scheduleData;
    
    let html = `
        <div class="schedule-summary">
            <div class="schedule-task">
                <strong>Task:</strong> ${taskName}
            </div>
            ${topic ? `<div class="schedule-topic"><strong>Topic:</strong> ${topic}</div>` : ''}
            <div class="schedule-estimate">
                <strong>Estimated Time:</strong> ${formatTime(estimatedTime)}
            </div>
            <div class="schedule-deadline">
                <strong>Days until deadline:</strong> ${daysUntilDeadline}
            </div>
            <div class="schedule-available">
                <strong>Total available hours:</strong> ${formatTime(totalAvailableHours)}
            </div>
            <div class="schedule-status ${isFeasible ? 'feasible' : 'not-feasible'}">
                <strong>Status:</strong> ${isFeasible ? 'Schedule is feasible' : 'Schedule needs adjustment'}
            </div>
        </div>
    `;
    
    // Add web analysis if available
    if (webAnalysis) {
        html += `
            <div class="web-analysis">
                <h5>🔍 Web-Based Difficulty Analysis</h5>
                <p><strong>Suggested Difficulty:</strong> ${webAnalysis.difficulty.charAt(0).toUpperCase() + webAnalysis.difficulty.slice(1)} (${Math.round(webAnalysis.confidence * 100)}% confidence)</p>
                <p><em>${webAnalysis.analysis}</em></p>
            </div>
        `;
    }
    
    if (warning) {
        html += `<div class="schedule-warning">${warning}</div>`;
    }
    
    html += '<div class="daily-schedule"><h4>Daily Schedule:</h4><div class="schedule-timeline">';
    
    schedule.forEach((day, index) => {
        html += `
            <div class="schedule-day">
                <div class="day-date">${day.date}</div>
                <div class="day-time">${formatTime(day.time)}</div>
                <div class="day-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(day.time / availableHours) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    
    // Add enhanced tips based on web analysis and topic
    html += `
        <div class="schedule-tips">
            <h4>Success Tips:</h4>
            <ul>
                <li>Start with the most difficult tasks when you're most alert</li>
                <li>Take short breaks every 45-60 minutes to maintain focus</li>
                <li>Review your progress daily and adjust as needed</li>
                ${!isFeasible ? '<li>Consider breaking this task into smaller, manageable parts</li>' : ''}
                ${webAnalysis && webAnalysis.difficulty === 'hard' ? '<li>This task appears challenging - consider starting earlier and allocating extra time</li>' : ''}
                ${webAnalysis && webAnalysis.difficulty === 'easy' ? '<li>This task seems manageable - you can complete it efficiently with focus</li>' : ''}
                ${topic ? `<li>Focus specifically on "${topic}" - use the targeted resources below for best results</li>` : ''}
            </ul>
        </div>
    `;
    
    scheduleContent.innerHTML = html;
    
    // Display web search results if available
    if (searchResults && searchResults.length > 0) {
        displaySearchResults(searchResults, topic);
    } else {
        document.getElementById('webSearchResults').classList.add('hidden');
    }
    
    scheduleResult.classList.remove('hidden');
    
    // Smooth scroll to results
    scheduleResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Enhanced display web search results with topic-focused search interface
function displaySearchResults(results, currentTopic = '') {
    const searchResultsContent = document.getElementById('searchResultsContent');
    const webSearchResults = document.getElementById('webSearchResults');
    const topicSearchInput = document.getElementById('topicSearchInput');
    
    // Set the search input value to current topic
    if (currentTopic && topicSearchInput) {
        topicSearchInput.value = currentTopic;
        topicSearchInput.placeholder = `Search more resources for "${currentTopic}"...`;
    }
    
    let html = `<div class="search-results-header">`;
    if (currentTopic) {
        html += `<p class="topic-indicator"><strong>🔍 Searching for:</strong> ${currentTopic}</p>`;
    }
    html += `<p class="results-count">Found ${results.length} resources</p>`;
    html += `</div><div class="search-results-list">`;
    
    results.forEach((result, index) => {
        const typeIcon = getResourceTypeIcon(result.type);
        const difficultyColor = getDifficultyColor(result.difficulty);
        
        html += `
            <div class="search-result-item" data-type="${result.type}" data-difficulty="${result.difficulty}">
                <div class="result-header">
                    <span class="result-type">${typeIcon} ${result.type || 'resource'}</span>
                    <span class="result-difficulty ${difficultyColor}">${result.difficulty || 'medium'}</span>
                </div>
                <h5><a href="${result.link}" target="_blank" rel="noopener noreferrer" class="view-resource-btn" data-index="${index}">${result.title}</a></h5>
                <p>${result.snippet}</p>
                <div class="result-actions">
                    <a href="${result.link}" target="_blank" rel="noopener noreferrer" class="btn btn-small btn-primary view-resource-btn" data-index="${index}">View Resource</a>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    searchResultsContent.innerHTML = html;
    webSearchResults.classList.remove('hidden');
    
    // Add event listeners for resource interactions
    addResourceInteractions(results);
    
    // Add topic search functionality
    addTopicSearchFunctionality(currentTopic);
}

// Get icon for resource type
function getResourceTypeIcon(type) {
    const icons = {
        tutorial: '📚',
        video: '🎥',
        practice: '✏️',
        course: '🎓',
        qa: '💬',
        web: '🌐',
        tool: '🛠️',
        simulation: '🔄',
        code: '💻',
        guide: '📖',
        documentary: '📺',
        reference: '📚'
    };
    return icons[type] || '📄';
}

// Get color class for difficulty
function getDifficultyColor(difficulty) {
    const colors = {
        easy: 'difficulty-easy',
        medium: 'difficulty-medium',
        hard: 'difficulty-hard'
    };
    return colors[difficulty] || 'difficulty-medium';
}

// Add resource interaction handlers
function addResourceInteractions(results) {
    // Handle view resource clicks
    document.querySelectorAll('.view-resource-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = this.getAttribute('data-index');
            const result = results[index];
            
            // Track resource usage
            trackResourceUsage(result);
            
            // Open in new tab
            window.open(result.link, '_blank');
        });
    });
}

// Track resource usage for analytics
function trackResourceUsage(resource) {
    const usage = JSON.parse(localStorage.getItem('resourceUsage') || '[]');
    usage.push({
        resource: resource.title,
        type: resource.type,
        difficulty: resource.difficulty,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('resourceUsage', JSON.stringify(usage));
}


// Topic search functionality
function addTopicSearchFunctionality(currentTopic) {
    const topicSearchBtn = document.getElementById('topicSearchBtn');
    const topicSearchInput = document.getElementById('topicSearchInput');
    
    if (topicSearchBtn && topicSearchInput) {
        // Remove existing listener to prevent duplicates
        topicSearchBtn.replaceWith(topicSearchBtn.cloneNode(true));
        const newBtn = document.getElementById('topicSearchBtn');
        
        newBtn.addEventListener('click', async function() {
            const searchQuery = topicSearchInput.value.trim();
            if (searchQuery) {
                await performTopicSearch(searchQuery);
            }
        });
        
        // Add Enter key support
        topicSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                newBtn.click();
            }
        });
    }
}

// Perform topic-specific search
async function performTopicSearch(searchQuery) {
    const searchResultsContent = document.getElementById('searchResultsContent');
    
    // Show loading state
    searchResultsContent.innerHTML = '<div class="search-loading"><p>🔍 Searching for resources...</p></div>';
    
    try {
        // Use the existing AI integration to search for the topic
        const aiIntegration = new AIIntegration();
        const results = await aiIntegration.searchStudyResources(searchQuery, 'general');
        
        // Display results with the search query as topic
        displaySearchResults(results, searchQuery);
    } catch (error) {
        console.error('Topic search failed:', error);
        searchResultsContent.innerHTML = '<div class="search-error"><p>❌ Search failed. Please try again.</p></div>';
    }
}

// Enhanced form submission handler with topic support
taskForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
        taskName: formData.get('taskName'),
        topic: formData.get('topic') || '',
        subject: formData.get('subject'),
        workType: formData.get('workType'),
        difficulty: formData.get('difficulty'),
        availableHours: parseFloat(formData.get('availableHours')),
        deadline: formData.get('deadline'),
        workSpeed: formData.get('workSpeed')
    };
    
    // Set API key if provided
    const apiKey = document.getElementById('apiKey')?.value;
    if (apiKey) {
        aiIntegration.apiKey = apiKey;
    }
    
    // Validate deadline is in the future
    const deadlineDate = new Date(taskData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
        alert('Please select a future date for the deadline.');
        return;
    }
    
    // Generate and display schedule
    const scheduleData = await generateSchedule(taskData);
    displaySchedule(scheduleData);
});

// Set minimum date for deadline input to today
const deadlineInput = document.getElementById('deadline');
const today = new Date().toISOString().split('T')[0];
deadlineInput.setAttribute('min', today);

// AI Settings Toggle
document.getElementById('useAI')?.addEventListener('change', function() {
    const aiSettings = document.getElementById('aiSettings');
    if (this.checked) {
        aiSettings.classList.remove('hidden');
    } else {
        aiSettings.classList.add('hidden');
    }
});

// Natural Language Input Toggle
document.getElementById('nlInputBtn')?.addEventListener('click', function() {
    const nlSection = document.getElementById('nlInputSection');
    nlSection.classList.toggle('hidden');
    this.textContent = nlSection.classList.contains('hidden') ? 'Use Natural Language' : 'Hide Natural Language';
});

// Parse Natural Language Input
document.getElementById('parseNlBtn')?.addEventListener('click', function() {
    const nlInput = document.getElementById('naturalLanguageInput').value.trim();
    if (!nlInput) {
        alert('Please enter a task description in natural language.');
        return;
    }
    
    const parsedData = nlpProcessor.parseNaturalLanguage(nlInput);
    
    // Fill form fields with parsed data
    if (parsedData.taskName) {
        document.getElementById('taskName').value = parsedData.taskName;
    }
    if (parsedData.subject) {
        document.getElementById('subject').value = parsedData.subject;
    }
    if (parsedData.workType) {
        document.getElementById('workType').value = parsedData.workType;
    }
    if (parsedData.difficulty) {
        document.getElementById('difficulty').value = parsedData.difficulty;
    }
    if (parsedData.workSpeed) {
        const speedRadio = document.querySelector(`input[name="workSpeed"][value="${parsedData.workSpeed}"]`);
        if (speedRadio) speedRadio.checked = true;
    }
    if (parsedData.deadline) {
        document.getElementById('deadline').value = parsedData.deadline;
    }
    
    // Hide natural language section after parsing
    document.getElementById('nlInputSection').classList.add('hidden');
    document.getElementById('nlInputBtn').textContent = 'Use Natural Language';
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Task parsed successfully! Review the filled fields and add any missing information.';
    successMsg.style.cssText = `
        background: #10b981;
        color: white;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        animation: fadeIn 0.3s ease;
    `;
    
    const formContainer = document.querySelector('.task-form-container');
    formContainer.insertBefore(successMsg, document.getElementById('taskForm'));
    
    setTimeout(() => successMsg.remove(), 3000);
});

// Add CSS for new elements
const aiStyles = document.createElement('style');
aiStyles.textContent = `
    .ai-input-toggle {
        margin-top: 10px;
    }
    
    .nl-input-section {
        margin-top: 10px;
        padding: 15px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }
    
    .nl-input-section textarea {
        width: 100%;
        min-height: 80px;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 5px;
        font-family: inherit;
        resize: vertical;
        margin-bottom: 10px;
    }
    
    .ai-toggle-label, .web-search-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 10px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }
    
    .ai-toggle-label:hover, .web-search-toggle:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }
    
    .ai-settings {
        margin-top: 10px;
        padding: 15px;
        background: #f1f5f9;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
    }
    
    .setting-row {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .setting-row small {
        color: #64748b;
        font-size: 0.875rem;
    }
    
    .web-search-results {
        margin-top: 20px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }
    
    .search-results-list {
        display: grid;
        gap: 15px;
        margin-top: 15px;
    }
    
    .search-result-item {
        padding: 15px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .search-result-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .result-type {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        background: #f1f5f9;
        border-radius: 12px;
        font-size: 0.8rem;
        color: #475569;
        font-weight: 500;
    }
    
    .result-difficulty {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .difficulty-easy {
        background: #dcfce7;
        color: #166534;
    }
    
    .difficulty-medium {
        background: #fef3c7;
        color: #92400e;
    }
    
    .difficulty-hard {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .search-result-item h5 {
        margin: 0 0 8px 0;
        color: #1e40af;
    }
    
    .search-result-item h5 a {
        text-decoration: none;
        color: inherit;
        transition: color 0.2s ease;
    }
    
    .search-result-item h5 a:hover {
        color: #1d4ed8;
        text-decoration: underline;
    }
    
    .search-result-item p {
        margin: 0 0 12px 0;
        color: #475569;
        font-size: 0.9rem;
        line-height: 1.5;
    }
    
    .result-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .result-actions .btn {
        text-decoration: none;
        transition: all 0.2s ease;
    }
    
    .result-actions .btn:hover {
        transform: translateY(-1px);
    }
    
    
    .schedule-topic {
        margin: 8px 0;
        padding: 8px 12px;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border-radius: 6px;
        border: 1px solid #f59e0b;
        color: #92400e;
        font-weight: 500;
    }
    
    .web-analysis {
        margin: 20px 0;
        padding: 15px;
        background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        border-radius: 8px;
        border: 1px solid #bae6fd;
    }
    
    .web-analysis h5 {
        margin: 0 0 10px 0;
        color: #0369a1;
        font-size: 1rem;
    }
    
    .web-analysis p {
        margin: 5px 0;
        color: #0c4a6e;
    }
    
    .web-analysis p strong {
        color: #0c4a6e;
    }
    
    .web-analysis p em {
        color: #075985;
        font-size: 0.9rem;
    }
    
    .btn-small {
        padding: 6px 12px;
        font-size: 0.875rem;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .success-message {
        animation: fadeIn 0.3s ease;
    }
    
    .view-resource-btn:hover {
        animation: pulse 0.3s ease;
    }
    
    .topic-search-header {
        margin-bottom: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border-radius: 8px;
        border: 1px solid #cbd5e1;
    }
    
    .topic-search-interface {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        align-items: center;
    }
    
    .topic-search-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .topic-search-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .search-results-header {
        margin-bottom: 15px;
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .topic-indicator {
        margin: 0 0 5px 0;
        color: #1e40af;
        font-size: 0.9rem;
    }
    
    .results-count {
        margin: 0;
        color: #64748b;
        font-size: 0.85rem;
    }
    
    .search-loading {
        text-align: center;
        padding: 40px 20px;
        color: #64748b;
    }
    
    .search-loading p {
        margin: 0;
        font-size: 1.1rem;
    }
    
    .search-error {
        text-align: center;
        padding: 40px 20px;
        color: #ef4444;
    }
    
    .search-error p {
        margin: 0;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(aiStyles);

// Enhanced scroll animations and parallax effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-graphic');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
    
    // Parallax for background overlays
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const overlay = heroSection.querySelector('::before');
        if (overlay) {
            const speed = 0.3;
            const yPos = -(scrolled * speed);
            heroSection.style.backgroundPositionY = `${yPos}px`;
        }
    }
});

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .slide-up');
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add stagger animation delays
    const staggerElements = document.querySelectorAll('[class*="stagger-"]');
    staggerElements.forEach(el => {
        observer.observe(el);
    });
});

// Enhanced neon glow effects for buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Add ripple effect on click
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Smooth reveal animation for form inputs
document.querySelectorAll('.form-group input, .form-group select').forEach((input, index) => {
    input.style.opacity = '0';
    input.style.transform = 'translateY(20px)';
    input.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    
    setTimeout(() => {
        input.style.opacity = '1';
        input.style.transform = 'translateY(0)';
    }, 100);
});

// Add floating animation to hero cards
const taskCards = document.querySelectorAll('.task-card');
taskCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.5}s`;
});

// Enhanced form validation with animations
const inputs = document.querySelectorAll('input[required], select[required]');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.validity.valid) {
            this.style.borderColor = '#10b981';
            this.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
        } else {
            this.style.borderColor = '#ef4444';
            this.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderColor = '#3b82f6';
        this.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
        this.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});

// Add loading state for form submission with enhanced animation
taskForm.addEventListener('submit', function() {
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Generating Schedule...';
    submitBtn.disabled = true;
    submitBtn.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
    submitBtn.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.6)';
    
    // Simulate processing time for better UX
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.boxShadow = '';
    }, 1500);
});

// Add scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    z-index: 9999;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.pageYOffset;
    const progress = (scrollPosition / scrollHeight) * 100;
    scrollProgress.style.width = progress + '%';
});

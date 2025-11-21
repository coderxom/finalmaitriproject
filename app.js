// MAITRI - AI Companion for Astronauts
// Main Application JavaScript

class MAITRIApp {
    constructor() {
        this.astronauts = [
            {
                name: "Sunita Williams",
                agency: "NASA", 
                mission: "Extended ISS Mission",
                duration: "9 months",
                specialization: "Flight Engineer",
                psychological_profile: "High resilience, potential isolation stress"
            },
            {
                name: "Butch Wilmore", 
                agency: "NASA",
                mission: "Extended ISS Mission", 
                duration: "9 months",
                specialization: "Commander",
                psychological_profile: "Leadership stress, crew responsibility"
            },
            {
                name: "Nick Hague",
                agency: "NASA",
                mission: "ISS Expedition", 
                duration: "6 months",
                specialization: "Flight Engineer",
                psychological_profile: "Experienced, stable mental health"
            },
            {
                name: "Don Pettit",
                agency: "NASA",
                mission: "ISS Expedition",
                duration: "6 months", 
                specialization: "Mission Specialist",
                psychological_profile: "Creative, needs intellectual stimulation"
            },
            {
                name: "Anne McClain",
                agency: "NASA",
                mission: "Crew-10",
                duration: "6 months",
                specialization: "Commander", 
                psychological_profile: "Military background, stress resilient"
            },
            {
                name: "Zena Cardman",
                agency: "NASA", 
                mission: "Crew-11",
                duration: "6 months",
                specialization: "Mission Specialist",
                psychological_profile: "First flight, adaptation anxiety potential"
            }
        ];

        this.currentAstronaut = null;
        this.emotionDetectionActive = false;
        this.voiceDetectionActive = false;
        this.audioContext = null;
        this.mediaStream = null;
        this.charts = {};
        
        this.init();
    }

    init() {
        this.populateAstronautSelector();
        this.setupEventListeners();
        this.updateMissionDay();
        // Initialize charts after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    populateAstronautSelector() {
        const select = document.getElementById('astronautSelect');
        if (select) {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            this.astronauts.forEach(astronaut => {
                const option = document.createElement('option');
                option.value = astronaut.name;
                option.textContent = `${astronaut.name} - ${astronaut.agency}`;
                select.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        // Astronaut selection
        const astronautSelect = document.getElementById('astronautSelect');
        if (astronautSelect) {
            astronautSelect.addEventListener('change', (e) => {
                this.selectAstronaut(e.target.value);
            });
        }

        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Emergency button
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.showEmergencyModal();
            });
        }

        // Modal close
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideEmergencyModal();
            });
        }

        // Emergency level buttons
        document.querySelectorAll('.emergency-level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleEmergencyAlert(e.currentTarget.dataset.level);
            });
        });

        // Voice analysis toggle
        const voiceToggle = document.getElementById('voiceToggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                this.toggleVoiceAnalysis();
            });
        }

        // Chat functionality
        const sendMessage = document.getElementById('sendMessage');
        if (sendMessage) {
            sendMessage.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Counseling topics
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCounselingTopic(e.target.dataset.topic);
            });
        });

        // Modal background click to close
        const emergencyModal = document.getElementById('emergencyModal');
        if (emergencyModal) {
            emergencyModal.addEventListener('click', (e) => {
                if (e.target.id === 'emergencyModal') {
                    this.hideEmergencyModal();
                }
            });
        }
    }

    selectAstronaut(name) {
        if (!name) {
            this.hideAstronautProfile();
            return;
        }

        this.currentAstronaut = this.astronauts.find(a => a.name === name);
        if (this.currentAstronaut) {
            this.showAstronautProfile();
            this.simulateEmotionDetection();
        }
    }

    showAstronautProfile() {
        const welcomeSection = document.getElementById('welcomeSection');
        const profileSection = document.getElementById('profileSection');
        const navigationTabs = document.getElementById('navigationTabs');

        if (welcomeSection) welcomeSection.classList.add('hidden');
        if (profileSection) profileSection.classList.remove('hidden');
        if (navigationTabs) navigationTabs.classList.remove('hidden');

        // Update profile information
        const astronautName = document.getElementById('astronautName');
        const astronautMission = document.getElementById('astronautMission');
        const astronautDuration = document.getElementById('astronautDuration');
        const astronautSpecialization = document.getElementById('astronautSpecialization');

        if (astronautName) astronautName.textContent = this.currentAstronaut.name;
        if (astronautMission) astronautMission.textContent = this.currentAstronaut.mission;
        if (astronautDuration) astronautDuration.textContent = this.currentAstronaut.duration;
        if (astronautSpecialization) astronautSpecialization.textContent = this.currentAstronaut.specialization;
    }

    hideAstronautProfile() {
        const welcomeSection = document.getElementById('welcomeSection');
        const profileSection = document.getElementById('profileSection');
        const navigationTabs = document.getElementById('navigationTabs');

        if (welcomeSection) welcomeSection.classList.remove('hidden');
        if (profileSection) profileSection.classList.add('hidden');
        if (navigationTabs) navigationTabs.classList.add('hidden');

        this.currentAstronaut = null;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Initialize specific tab content
        if (tabName === 'emotion') {
            this.initializeEmotionDetection();
        }
    }

    updateMissionDay() {
        // Simulate mission day calculation
        const startDate = new Date('2024-06-01');
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const missionDayElement = document.getElementById('missionDay');
        if (missionDayElement) {
            missionDayElement.textContent = daysDiff;
        }
    }

    async initializeEmotionDetection() {
        try {
            const video = document.getElementById('videoElement');
            if (!video) return;

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            video.srcObject = stream;
            this.mediaStream = stream;
            
            video.addEventListener('loadedmetadata', () => {
                this.startEmotionDetection();
            });
        } catch (error) {
            console.log('Camera not available, using simulation mode');
            this.simulateEmotionDetection();
        }
    }

    startEmotionDetection() {
        this.simulateEmotionDetection();
    }

    simulateEmotionDetection() {
        const emotions = ['Happy', 'Neutral', 'Calm', 'Focused', 'Tired'];
        
        const updateEmotion = () => {
            if (this.currentAstronaut) {
                const emotion = emotions[Math.floor(Math.random() * emotions.length)];
                const stressLevel = Math.random() * 100;
                
                const currentEmotionElement = document.getElementById('currentEmotion');
                const stressMeterFill = document.getElementById('stressMeterFill');
                
                if (currentEmotionElement) {
                    currentEmotionElement.textContent = emotion;
                }
                
                if (stressMeterFill) {
                    stressMeterFill.style.width = `${stressLevel}%`;
                }
                
                // Update emotion results in emotion tab
                const emotionsDiv = document.getElementById('faceEmotions');
                if (emotionsDiv) {
                    emotionsDiv.innerHTML = `
                        <div class="emotion-item">
                            <span>Current: ${emotion}</span>
                            <span class="confidence">${(Math.random() * 40 + 60).toFixed(1)}%</span>
                        </div>
                        <div class="emotion-item">
                            <span>Stress Level: ${stressLevel.toFixed(1)}%</span>
                        </div>
                    `;
                }
            }
        };
        
        // Update immediately and then every 3 seconds
        updateEmotion();
        setInterval(updateEmotion, 3000);
    }

    async toggleVoiceAnalysis() {
        const button = document.getElementById('voiceToggle');
        
        if (!this.voiceDetectionActive) {
            try {
                this.simulateVoiceAnalysis();
                this.voiceDetectionActive = true;
                if (button) {
                    button.textContent = 'Stop Voice Analysis';
                    button.classList.remove('btn--primary');
                    button.classList.add('btn--secondary');
                }
            } catch (error) {
                console.log('Microphone not available, using simulation');
            }
        } else {
            this.voiceDetectionActive = false;
            if (button) {
                button.textContent = 'Start Voice Analysis';
                button.classList.remove('btn--secondary');
                button.classList.add('btn--primary');
            }
        }
    }

    simulateVoiceAnalysis() {
        const canvas = document.getElementById('voiceCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            if (!this.voiceDetectionActive) return;
            
            ctx.fillStyle = 'rgb(19, 52, 59)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Simulate audio bars
            for (let i = 0; i < 20; i++) {
                const barHeight = Math.random() * 80;
                const x = i * 15;
                
                ctx.fillStyle = `rgb(50, 184, 198)`;
                ctx.fillRect(x, canvas.height - barHeight, 12, barHeight);
            }
            
            // Simulate voice metrics
            this.updateVoiceMetrics(Math.random() * 100);
            
            setTimeout(() => requestAnimationFrame(draw), 100);
        };
        
        draw();
    }

    updateVoiceMetrics(avgFrequency) {
        const pitch = Math.floor(avgFrequency * 2 + 80);
        const speechRate = Math.floor(Math.random() * 50 + 150);
        const stressLevel = avgFrequency > 50 ? 'High' : avgFrequency > 25 ? 'Medium' : 'Low';
        
        const pitchValue = document.getElementById('pitchValue');
        const speechRateElement = document.getElementById('speechRate');
        const stressIndicator = document.getElementById('stressIndicator');
        
        if (pitchValue) pitchValue.textContent = `${pitch} Hz`;
        if (speechRateElement) speechRateElement.textContent = `${speechRate} WPM`;
        
        if (stressIndicator) {
            stressIndicator.textContent = stressLevel;
            stressIndicator.className = `status status--${stressLevel === 'High' ? 'error' : stressLevel === 'Medium' ? 'warning' : 'success'}`;
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
        }, 1000);
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👨‍🚀' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = {
            default: [
                "I understand you're dealing with the unique challenges of space. Can you tell me more about what you're experiencing?",
                "It's completely normal to feel this way during extended missions. Many astronauts experience similar emotions.",
                "Let's work through this together. What specific aspect would you like to focus on?",
                "Your mental health is just as important as your physical health in space. I'm here to support you."
            ],
            isolation: [
                "Feeling isolated is one of the most common challenges astronauts face. The distance from Earth and loved ones can be overwhelming.",
                "Many astronauts find it helpful to maintain regular communication schedules with family and to create personal rituals that connect them to Earth.",
                "Would you like to try a visualization exercise where we imagine you're back on Earth with your loved ones?"
            ],
            sleep: [
                "Sleep disruption is very common in space due to the 16 sunrises and sunsets you experience each day.",
                "Let's work on establishing a consistent sleep routine. Have you been following the recommended sleep hygiene protocols?",
                "I can guide you through some relaxation techniques specifically designed for the space environment."
            ],
            stress: [
                "The stress of space missions is intense - you're handling complex operations while being far from support systems.",
                "Let's practice some breathing exercises. In space, controlled breathing can help regulate both your physical and mental state.",
                "Remember, experiencing stress doesn't mean you're not capable. It means you're human."
            ]
        };
        
        // Simple keyword detection for responses
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('lonely') || lowerMessage.includes('isolated') || lowerMessage.includes('miss')) {
            return responses.isolation[Math.floor(Math.random() * responses.isolation.length)];
        } else if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('rest')) {
            return responses.sleep[Math.floor(Math.random() * responses.sleep.length)];
        } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
            return responses.stress[Math.floor(Math.random() * responses.stress.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    }

    selectCounselingTopic(topic) {
        // Remove active class from all topic buttons
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected topic
        const topicButton = document.querySelector(`[data-topic="${topic}"]`);
        if (topicButton) {
            topicButton.classList.add('active');
        }
        
        // Add topic-specific message
        const topicMessages = {
            isolation: "I understand you'd like to talk about feelings of isolation and homesickness. This is one of the most common challenges for astronauts. What specific aspects of isolation are affecting you most?",
            sleep: "Sleep and circadian rhythm issues are very common in space. The microgravity environment and unusual light cycles can really disrupt your natural sleep patterns. How has your sleep been lately?",
            stress: "Managing stress and anxiety in the confined space environment requires special techniques. I'm here to help you develop coping strategies. What's been your main source of stress recently?",
            cognitive: "Cognitive function can be affected by the space environment, radiation, and stress. It's important to maintain mental sharpness for mission success. Have you noticed any changes in your thinking or memory?",
            relationships: "Crew relationships are crucial for mission success and personal well-being. Living in close quarters for months can create unique interpersonal challenges. How are things going with your crewmates?",
            performance: "Performance concerns are natural given the high-stakes nature of your mission. The pressure to excel while managing personal challenges can be overwhelming. What aspects of performance are worrying you?",
            communication: "Staying connected with Earth is vital for your psychological well-being. Communication delays and technical issues can make you feel even more isolated. How have your communications with home been?",
            general: "I'm here for whatever you'd like to discuss. Whether it's mission-related stress, personal concerns, or just need someone to talk to - I'm here to listen and support you."
        };
        
        if (topicMessages[topic]) {
            this.addChatMessage(topicMessages[topic], 'ai');
        }
    }

    initializeCharts() {
        // Emotion Chart
        const emotionCtx = document.getElementById('emotionChart');
        if (emotionCtx) {
            this.charts.emotion = new Chart(emotionCtx, {
                type: 'line',
                data: {
                    labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                    datasets: [
                        {
                            label: 'Happiness',
                            data: [7, 6, 8, 7, 9, 8, 7],
                            borderColor: '#1FB8CD',
                            backgroundColor: 'rgba(31, 184, 205, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Stress',
                            data: [3, 4, 2, 3, 1, 2, 3],
                            borderColor: '#B4413C',
                            backgroundColor: 'rgba(180, 65, 60, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });
        }

        // Mood Chart
        const moodCtx = document.getElementById('moodChart');
        if (moodCtx) {
            this.charts.mood = new Chart(moodCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Daily Mood Score',
                        data: [7.2, 6.8, 8.1, 7.5, 8.3, 7.9, 8.0],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });
        }

        // Sleep Chart
        const sleepCtx = document.getElementById('sleepChart');
        if (sleepCtx) {
            this.charts.sleep = new Chart(sleepCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Sleep Hours',
                        data: [6.2, 5.8, 7.1, 6.5, 5.9, 7.3, 6.8],
                        backgroundColor: '#FFC185',
                        borderColor: '#D2BA4C',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });
        }

        // Stress Chart
        const stressCtx = document.getElementById('stressChart');
        if (stressCtx) {
            this.charts.stress = new Chart(stressCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Low Stress', 'Medium Stress', 'High Stress'],
                    datasets: [{
                        data: [60, 30, 10],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    showEmergencyModal() {
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideEmergencyModal() {
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleEmergencyAlert(level) {
        const alerts = {
            medium: "Medium alert activated. Initiating supportive counseling session and monitoring protocols.",
            high: "High alert activated. Emergency counseling protocols engaged. Crew notification being considered.",
            critical: "CRITICAL alert activated. Immediate intervention protocols initiated. Ground control has been notified."
        };

        alert(alerts[level] || "Emergency alert activated.");
        this.hideEmergencyModal();
        
        // Switch to counseling tab for immediate support
        this.switchTab('counseling');
        this.addChatMessage(`Emergency alert (${level}) has been triggered. I'm here to provide immediate support. Please tell me what's happening.`, 'ai');
    }
}

// Global functions for entertainment features
function startCounseling() {
    if (window.app) {
        window.app.switchTab('counseling');
        window.app.addChatMessage("I'm ready to provide counseling support. What would you like to talk about today?", 'ai');
    }
}

function breathingExercise() {
    alert("🫁 Breathing Exercise\n\nInhale for 4 counts... Hold for 4 counts... Exhale for 6 counts...\n\nRepeat this cycle 5 times. This helps activate your parasympathetic nervous system and reduce stress in the space environment.");
}

function viewEarth() {
    alert("🌍 Virtual Earth View\n\nImagine looking out of the cupola window... You can see the beautiful blue marble of Earth below, with swirling white clouds and the thin atmosphere protecting all life. The aurora dances at the poles, and city lights twinkle like stars on the night side.");
}

function viewEarthLive() {
    alert("🌍 Live Earth View\n\nConnecting to ISS Earth observation cameras... You would see real-time views of Earth from your current orbital position. This feature helps maintain your connection to home and provides the therapeutic benefits of Earth observation.");
}

function weatherUpdates() {
    alert("🌤️ Weather Updates\n\nCurrent weather in your hometown:\nTemperature: 72°F\nConditions: Partly cloudy\nWind: Light breeze from the west\n\nYour family reports it's a beautiful day with blue skies and comfortable temperatures.");
}

function familyPhotos() {
    alert("📸 Family Photos\n\nViewing recent photos from home... Your family has been staying busy and sending love. They're proud of your mission and counting down the days until your return.");
}

function newsUpdates() {
    alert("📰 Earth News\n\nToday's positive headlines from Earth:\n• Scientific breakthrough in renewable energy\n• International cooperation on climate initiatives\n• Community celebrates local heroes\n• Arts and culture events bringing people together");
}

function spaceTrivia() {
    const questions = [
        {
            question: "How long does it take the ISS to orbit Earth once?",
            answer: "Approximately 90 minutes! You see 16 sunrises and sunsets each day."
        },
        {
            question: "What percentage of your body weight is lost in the first few days in microgravity?",
            answer: "About 1-2% due to fluid redistribution. Your cardiovascular system adapts to the weightless environment."
        },
        {
            question: "How far is the ISS from Earth's surface?",
            answer: "About 408 kilometers (254 miles) above Earth in low Earth orbit."
        }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    alert(`🚀 Space Trivia\n\n${randomQuestion.question}\n\n${randomQuestion.answer}`);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MAITRIApp();
});

// Handle page visibility changes to pause/resume detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.app) {
        window.app.emotionDetectionActive = false;
        window.app.voiceDetectionActive = false;
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app && window.app.mediaStream) {
        window.app.mediaStream.getTracks().forEach(track => track.stop());
    }
});
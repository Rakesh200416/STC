import api from '../utils/api';

// Mock AI service that simulates realistic question generation
export const generateAIQuestion = async (testType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const mockQuestions = {
    MCQ: [
      {
        question: "What is the time complexity of binary search algorithm?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctOption: "B",
        marks: 2,
      },
      {
        question: "Which of the following is not a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correctOption: "C",
        marks: 1,
      },
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correctOption: "B",
        marks: 1,
      },
      {
        question: "Which HTTP method is used to update existing data?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctOption: "C",
        marks: 2,
      },
    ],
    Long: [
      {
        question: "Explain the concept of Object-Oriented Programming and its four main principles. Provide examples for each principle.",
        marks: 10,
      },
      {
        question: "Describe the differences between SQL and NoSQL databases. When would you choose one over the other?",
        marks: 8,
      },
      {
        question: "What is the purpose of version control systems? Explain the benefits of using Git in software development.",
        marks: 6,
      },
      {
        question: "Discuss the importance of responsive web design and explain three key techniques to achieve it.",
        marks: 8,
      },
    ],
    Coding: [
      {
        question: "Write a function that finds the maximum element in an array of integers. The function should handle edge cases like empty arrays.",
        expectedOutput: "Function should return the maximum number in the array, or handle empty array appropriately",
        marks: 5,
      },
      {
        question: "Implement a function that checks if a given string is a palindrome. Ignore case sensitivity and spaces.",
        expectedOutput: "Function should return true for palindromes like 'A man a plan a canal Panama', false otherwise",
        marks: 6,
      },
      {
        question: "Create a function that calculates the factorial of a given number using recursion.",
        expectedOutput: "Function should return n! for positive integers, handle edge cases for 0 and negative numbers",
        marks: 4,
      },
      {
        question: "Write a function that merges two sorted arrays into a single sorted array without using built-in sort methods.",
        expectedOutput: "Function should efficiently merge [1,3,5] and [2,4,6] into [1,2,3,4,5,6]",
        marks: 7,
      },
    ],
  };

  const questions = mockQuestions[testType];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return randomQuestion;
};

// Enhanced AI chat function for STC Assistant
export const chatWithAI = async (message, userName, userEmail, userRole = 'student') => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    const lowerMessage = message.toLowerCase();
    
    // Time-based greeting
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };
    
    // Check for greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('hai') || lowerMessage.includes('hola') || lowerMessage.includes('namaste')) {
      return `${getCurrentGreeting()} ${userName}! I'm STC Assistant, your Smart Test Center AI helper. How can I assist you today?`;
    }
    
    // Check for registration/signup questions
    if (lowerMessage.includes('register') || lowerMessage.includes('signup') || lowerMessage.includes('sign up') || 
        lowerMessage.includes('create account') || lowerMessage.includes('new account')) {
      return `To register for Smart Test Center, please visit our signup page: http://localhost:3001/signup\n\n` +
             `You can create an account as either a student or mentor. After registration, you'll be able to access all the features based on your role.`;
    }
    
    // Check for test-related questions
    if (lowerMessage.includes('test') || lowerMessage.includes('exam')) {
      if (userRole === 'mentor') {
        return `As a mentor, you can create and manage tests:\n\n` +
               `1. Go to your dashboard and click "Add Test"\n` +
               `2. Fill in test details like name, duration, and number of questions\n` +
               `3. Add questions (MCQ, Long Answer, or Coding)\n` +
               `4. Publish the test for students to take\n\n` +
               `You can view student results and performance analytics in the "View Results" section.`;
      } else {
        return `As a student, you can take tests assigned to you:\n\n` +
               `1. Go to "My Tests" in your dashboard\n` +
               `2. Select a test and click "Take Test"\n` +
               `3. Complete the test within the time limit\n` +
               `4. View your results in "My Scores"\n\n` +
               `Remember to allow camera access as it's required for monitoring during the test.`;
      }
    }
    
    // Check for results/scores questions
    if (lowerMessage.includes('result') || lowerMessage.includes('score') || lowerMessage.includes('grade')) {
      if (userRole === 'mentor') {
        return `As a mentor, you can view student results:\n\n` +
               `1. Go to your dashboard and click "View Results"\n` +
               `2. See all student submissions for tests you've created\n` +
               `3. View detailed performance analytics\n` +
               `4. Track student progress over time\n\n` +
               `You can also download results for record keeping.`;
      } else {
        return `As a student, you can view your test results:\n\n` +
               `1. Go to "My Scores" in your dashboard\n` +
               `2. See all your completed tests with scores\n` +
               `3. View detailed feedback and performance analysis\n` +
               `4. Track your progress over time\n\n` +
               `Results are available immediately after test submission.`;
      }
    }
    
    // Check for assignment questions
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      if (userRole === 'mentor') {
        return `As a mentor, you can create and manage assignments:\n\n` +
               `1. Go to "Assignments" in your dashboard\n` +
               `2. Click "Create New Assignment"\n` +
               `3. Upload PDF files and set due dates\n` +
               `4. Assign to specific students or all students\n\n` +
               `Students can download and submit assignments through their dashboard.`;
      } else {
        return `As a student, you can view and submit assignments:\n\n` +
               `1. Go to "Assignments" in your dashboard\n` +
               `2. View all assignments assigned to you\n` +
               `3. Download PDF files and complete work\n` +
               `4. Submit before the due date\n\n` +
               `You'll receive notifications when new assignments are posted.`;
      }
    }
    
    // Check for notification questions
    if (lowerMessage.includes('notification') || lowerMessage.includes('alert') || lowerMessage.includes('message')) {
      if (userRole === 'mentor') {
        return `As a mentor, you can send notifications to students:\n\n` +
               `1. Go to "Notifications" in your dashboard\n` +
               `2. Click "Create New Notification"\n` +
               `3. Write your message and set priority\n` +
               `4. Send to specific students or all students\n\n` +
               `You can track read receipts and student reactions.`;
      } else {
        return `As a student, you can view notifications from mentors:\n\n` +
               `1. Check the notifications section in your dashboard\n` +
               `2. View all messages from your mentors\n` +
               `3. React to notifications with emojis\n` +
               `4. Mark as read when you've seen them\n\n` +
               `You'll receive alerts when new notifications are sent.`;
      }
    }
    
    // Check for "why STC" questions
    if (lowerMessage.includes('why') && (lowerMessage.includes('stc') || lowerMessage.includes('smart test'))) {
      return `Smart Test Center offers several key benefits:\n\n` +
             `✅ AI-Powered Question Generation - Create tests automatically\n` +
             `✅ Intelligent Proctoring - Monitor students during tests\n` +
             `✅ Multi-Question Types - MCQ, Long Answer, and Coding questions\n` +
             `✅ Performance Analytics - Detailed results and progress tracking\n` +
             `✅ Assignment Management - PDF upload/download system\n` +
             `✅ Real-time Notifications - Instant communication\n` +
             `✅ Role-based Access - Separate dashboards for students, mentors, and admins\n\n` +
             `This makes STC the complete solution for online testing and learning management.`;
    }
    
    // Check for general questions about STC
    if (lowerMessage.includes('what is stc') || lowerMessage.includes('what does stc') || 
        (lowerMessage.includes('stc') && lowerMessage.includes('do')) || lowerMessage.includes('explain stc')) {
      return `Smart Test Center (STC) is a comprehensive online testing and learning management platform designed for educational institutions.\n\n` +
             `Key Features:\n` +
             `🔹 Automated Test Creation - Generate questions using AI\n` +
             `🔹 Secure Exam Environment - Camera monitoring to prevent cheating\n` +
             `🔹 Multiple Question Types - Support for MCQs, essays, and coding problems\n` +
             `🔹 Instant Results - Automatic grading with detailed feedback\n` +
             `🔹 Progress Tracking - Monitor performance over time\n` +
             `🔹 Assignment System - PDF upload/download for homework\n` +
             `🔹 Communication Tools - Real-time notifications between mentors and students\n\n` +
             `STC streamlines the entire testing process, making it efficient for educators and engaging for students.`;
    }
    
    // Check for benefits questions
    if (lowerMessage.includes('benefit') || lowerMessage.includes('advantage') || lowerMessage.includes('feature')) {
      return `Smart Test Center provides these key benefits:\n\n` +
             `🔹 Automated Test Creation - Save time with AI-generated questions\n` +
             `🔹 Secure Testing Environment - Camera monitoring prevents cheating\n` +
             `🔹 Flexible Question Types - Support for MCQ, essays, and coding\n` +
             `🔹 Instant Grading - Automatic scoring with detailed feedback\n` +
             `🔹 Progress Tracking - Monitor performance over time\n` +
             `🔹 Easy Communication - Notification system for quick updates\n` +
             `🔹 Mobile Responsive - Access from any device\n\n` +
             `These features make online testing efficient and effective.`;
    }
    
    // Default response with help options
    return `I'm STC Assistant, here to help you with Smart Test Center. I can assist with:\n\n` +
           `• Registration and account setup\n` +
           `• Taking and creating tests\n` +
           `• Viewing results and scores\n` +
           `• Managing assignments\n` +
           `• Using notifications\n` +
           `• Understanding STC benefits\n\n` +
           `You can ask me specific questions like:\n` +
           `• "How do I register for STC?"\n` +
           `• "How do I create a test?"\n` +
           `• "How do I view my results?"\n` +
           `• "What are the benefits of STC?"\n\n` +
           `What would you like to know more about?`;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return "I'm sorry, I'm having trouble responding right now. Please try again later or visit our help section for more information.";
  }
};
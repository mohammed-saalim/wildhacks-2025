/// <reference types="cypress" />

describe('MockMate Home Page', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('displays the hero section with title and subtitle', () => {
      cy.contains('Welcome to MockMate').should('be.visible');
      cy.contains('Smart, AI-powered interview preparation').should('be.visible');
    });
  
    it('renders the Get Started button and navigates correctly', () => {
      cy.contains('Get Started')
        .should('be.visible')
        .click();
  
      cy.url().should('include', '/interview-setup');
    });
  
    it('displays all feature sections with images and text', () => {
      const featureTitles = [
        'AI-Powered Interview Sessions',
        'Personalized Feedback & Insights',
        'Smart Resume Context Matching',
      ];
  
      featureTitles.forEach(title => {
        cy.contains(title).should('be.visible');
      });
  
      cy.get('img').should('have.length.at.least', 3);
    });
  });
  
  describe('Interview Setup Page', () => {
    beforeEach(() => {
      cy.visit('/interview-setup');
    });
  
    it('displays the setup header', () => {
      cy.contains('Interview Setup').should('exist');
      cy.contains('Select a Job Description').should('exist');
    });
  
    it('opens dropdown and selects job role', () => {
      cy.get('[data-testid="job-select"]').click();
      cy.contains('Backend Engineer at FinTech').click();
      cy.get('[data-testid="job-select"]').should('contain', 'Backend Engineer at FinTech');
    });
  
    it('switches to custom JD and types content', () => {
      cy.get('[data-testid="job-select"]').click();
      cy.contains('Custom Job Description').click();
  
      cy.contains('Enter your custom Job Description').should('exist');
  
      cy.get('[data-testid="custom-jd-input"]')
      .type('Prompt Engineer at OpenAI')
      .should('have.value', 'Prompt Engineer at OpenAI');
    });
  
    it('toggles the voice switch', () => {
      cy.get('input[type="checkbox"]').check({ force: true }).should('be.checked');
      cy.get('input[type="checkbox"]').uncheck({ force: true }).should('not.be.checked');
    });
  
    it('navigates to /interview on start', () => {
      cy.get('[data-testid="job-select"]').click();
      cy.contains('Data Scientist at HealthAI').click();
  
      cy.contains('Start Interview').click();
      cy.url().should('include', '/interview');
    });

    it('navigates to interview, then home via navbar and stops camera', () => {
        // Start interview from setup
        cy.get('[data-testid="job-select"]').click();
        cy.contains('Frontend Developer at SaaS Co.').click();
        cy.contains('Start Interview').click();
      
        cy.url().should('include', '/interview');
      
        // Confirm camera running
        cy.get('video').should('exist');
      
        // Navigate home via navbar (MockMate logo or Home button)
        cy.contains('MockMate').click(); // Logo
        // Or: cy.contains('Home').click(); // Navbar button
      
        // Confirm we’re on home
        cy.url().should('eq', 'http://localhost:3000/');
      
        // Confirm camera stopped
        cy.get('video').should('not.exist');
      });
      
  });
  
  describe('/interview', () => {
    beforeEach(() => {
      cy.intercept('POST', '**gemini-1.5-flash:generateContent**', {
        fixture: 'interview.json'
      }).as('mockGenerateQuestions');
  
      cy.visit('/interview');
    });
  
    it('renders the first AI question from mocked Gemini', () => {
      cy.wait('@mockGenerateQuestions');
      cy.contains('Interviewer: Tell me about yourself.').should('be.visible');
    });
  
    it('types an answer and clicks Next Question', () => {
        cy.wait('@mockGenerateQuestions');
        cy.contains('Start Interview').click();
      
        // Answer first question
        cy.get('textarea:visible')
          .should('have.attr', 'placeholder', 'Type or speak your answer...')
          .type('I am a passionate frontend developer with React experience.')
          .should('have.value', 'I am a passionate frontend developer with React experience.');
      
        cy.contains('Next Question').click();
      
        // 👇 Load the expected second question from fixture
        cy.fixture('interview.json').then((mock) => {
          const secondQuestion = mock.candidates[0].content.parts[0].text
            .split('\n')
            .filter(Boolean)[1]; // get 2nd line
          cy.contains(`Interviewer: ${secondQuestion}`).should('be.visible');
        });
      });
      
  
    it('finishes interview after answering two questions', () => {
      cy.wait('@mockGenerateQuestions');
      cy.contains('Start Interview').click();
  
      // Answer 1
      cy.get('textarea:visible')
        .clear()
        .type('First answer');
      cy.contains('Next Question').click();
  
      // Answer 2
      cy.get('textarea:visible')
        .clear()
        .type('Second answer');
      cy.contains('Finish Interview').click();
  
      // ✅ You may want to intercept feedback call here if needed
      cy.url().should('include', '/feedback');
    });
      
      
  });


  // --- REAL API TEST (No intercept!) ---

  describe('Real network call for gemini api', ()=> {
  it('calls Gemini for real using custom JD and gets 200', () => {
    cy.visit('/interview-setup');
  
    cy.get('[data-testid="job-select"]').click();
    cy.contains('Custom Job Description').click();
  
    cy.contains('Enter your custom Job Description').should('exist');
    cy.get('[data-testid="custom-jd-input"]')
      .type('Prompt Engineer at OpenAI')
      .should('have.value', 'Prompt Engineer at OpenAI');
  
    cy.intercept(
      'POST',
      '**/v1beta/models/gemini-1.5-flash:generateContent*'
    ).as('realGeminiCall');
  
    cy.wait(500); // Optional: to avoid race condition
    cy.contains('Start Interview').click();
  
    cy.wait('@realGeminiCall', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

});
  

  //evaluate endpoint
  describe('Feedback Page - Gemini Evaluation (Real API)', () => {
    it('completes interview and shows Gemini evaluation content', () => {
      // Visit interview setup
      cy.visit('/interview-setup');
  
      // Select predefined role
      cy.get('[data-testid="job-select"]').click();
      cy.contains('Frontend Developer at SaaS Co.').click();
  
      // Click setup "Start Interview"
      cy.contains('Start Interview').click();
  
      // ✅ Click second Start Interview inside actual /interview page
      cy.contains('Start Interview').should('be.visible').click();
  
      // Wait for the first AI question
      cy.contains('Interviewer:').should('exist');
  
      // Type answer for question 1
      cy.get('textarea:visible')
        .should('have.attr', 'placeholder', 'Type or speak your answer...')
        .clear()
        .type('haha');
  
      // Go to next question
      cy.contains('Next Question').click();
  
      // Type answer for question 2
      cy.get('textarea:visible')
        .should('have.attr', 'placeholder', 'Type or speak your answer...')
        .clear()
        .type('haha');
  
      // Submit and go to feedback
      cy.contains('Finish Interview').click();
  
      // Wait for feedback page
      cy.url().should('include', '/feedback');
  
      // ✅ Confirm Gemini evaluation summary text is rendered
      cy.get('[data-testid="gemini-summary-text"]')
        .invoke('text')
        .should('have.length.greaterThan', 10);
  
      // ✅ Confirm Gemini score shows a percentage
      cy.get('[data-testid="gemini-score"]')
        .invoke('text')
        .should('match', /^\d+%$/);
    });
  });
  
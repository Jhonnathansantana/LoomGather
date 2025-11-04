// src/levantamiento.js
import { supabase } from './supabaseClient.js';
import { getCurrentUser } from './auth.js';

// --- STATE ---
// We keep track of the current state of the questionnaire
let questions = [];
let currentQuestionIndex = 0;
let assessmentId = null;
let currentUser = null;

// --- DOM ELEMENTS ---
// We get references to the DOM elements we'll be interacting with
const questionContainer = document.getElementById('contenedor-pregunta');
const nextButton = document.querySelector('.question-navigation .button-primary');
const backButton = document.querySelector('.question-navigation .button-secondary');
const sectionNav = document.querySelector('.levantamiento-nav ul');

/**
 * Initializes the assessment process when the page loads.
 */
async function initializeAssessment() {
    // 1. Authenticate User: Ensure a user is logged in. Redirect if not.
    currentUser = await getCurrentUser();
    if (!currentUser) {
        console.error('No user logged in. Redirecting to login page.');
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Ensure a client exists to associate the assessment with.
        // If no clients exist, create a default one for this test.
        let { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id')
            .limit(1)
            .single();

        if (clientError && clientError.code !== 'PGRST116') { // Ignore 'exact one row' error if table is empty
             throw new Error(`Error checking for clients: ${clientError.message}`);
        }

        if (!client) {
            const { data: newClient, error: newClientError } = await supabase
                .from('clients')
                .insert({ name: 'Cliente de Prueba (Auto-generado)' })
                .select('id')
                .single();
            if (newClientError) throw new Error(`Error creating dummy client: ${newClientError.message}`);
            client = newClient;
        }

        // 3. Create a new Assessment record in Supabase.
        // This record groups all answers for this session.
        const { data: newAssessment, error: assessmentError } = await supabase
            .from('assessments')
            .insert({
                consultant_id: currentUser.id,
                client_id: client.id,
                questionnaire_id: 1, // Hardcoded to our V1 questionnaire
            })
            .select('id')
            .single();

        if (assessmentError) throw new Error(`Error creating assessment: ${assessmentError.message}`);
        assessmentId = newAssessment.id;
        console.log(`Assessment started with ID: ${assessmentId}`);

        // 4. Fetch all questions for the questionnaire from Supabase.
        const { data: fetchedQuestions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('questionnaire_id', 1)
            .order('order_index', { ascending: true });

        if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
        questions = fetchedQuestions;

        // 5. Start the questionnaire by rendering the first question.
        if (questions.length > 0) {
            // We will implement renderQuestion in the next step.
            // For now, it's a placeholder.
            renderQuestion(currentQuestionIndex);
        } else {
            questionContainer.innerHTML = '<p>No se encontraron preguntas para este cuestionario.</p>';
            nextButton.disabled = true;
        }

    } catch (error) {
        console.error('Initialization failed:', error);
        questionContainer.innerHTML = `<p class="error">Error al iniciar el levantamiento: ${error.message}</p>`;
    }
}

/**
 * Renders a question dynamically in the DOM based on its type.
 * @param {number} index - The index of the question to render from the `questions` array.
 */
function renderQuestion(index) {
    if (index < 0 || index >= questions.length) {
        console.error("Invalid question index.");
        return;
    }
    const question = questions[index];

    // 1. Clear previous content
    questionContainer.innerHTML = '';

    // 2. Create the question wrapper
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    // 3. Create and append the question label
    const label = document.createElement('label');
    label.htmlFor = `question-${question.id}`;
    label.textContent = question.text;
    questionDiv.appendChild(label);

    // 4. Create the appropriate input field based on the question type
    let inputElement;
    switch (question.type) {
        case 'single_choice':
            inputElement = document.createElement('select');
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione una opción...';
            inputElement.appendChild(defaultOption);
            question.options.forEach(optionText => {
                const option = document.createElement('option');
                option.value = optionText;
                option.textContent = optionText;
                inputElement.appendChild(option);
            });
            break;

        case 'number':
            inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.placeholder = 'Ingrese un número...';
            break;

        case 'text':
        default:
            inputElement = document.createElement('textarea');
            inputElement.rows = 5;
            inputElement.placeholder = 'Escriba aquí...';
            break;
    }
    inputElement.id = `question-${question.id}`;
    inputElement.name = `question-${question.id}`;
    questionDiv.appendChild(inputElement);

    // 5. Append the fully formed question to the container
    questionContainer.appendChild(questionDiv);

    // 6. Update UI elements like buttons and navigation
    updateNavigationUI(index);
}


/**
 * Updates the state of the navigation buttons and the section highlight.
 * @param {number} index - The current question index.
 */
function updateNavigationUI(index) {
    // Update button visibility and text
    backButton.disabled = index === 0;
    if (index === questions.length - 1) {
        nextButton.textContent = 'Finalizar';
    } else {
        nextButton.textContent = 'Siguiente';
    }

    // Update section highlight (simple logic for now)
    const sections = sectionNav.querySelectorAll('li');
    sections.forEach(li => li.classList.remove('active'));
    // This logic assumes 1 section for every 1 questions for demo purposes
    const sectionIndex = Math.floor(index / 1); // Change 1 to questions_per_section if needed
    if (sections[sectionIndex]) {
        sections[sectionIndex].classList.add('active');
    }
}


/**
 * Saves the current question's answer to the Supabase database.
 */
async function saveCurrentAnswer() {
    const question = questions[currentQuestionIndex];
    const inputElement = document.getElementById(`question-${question.id}`);

    if (!inputElement) {
        console.error("Could not find input element for the current question.");
        return;
    }

    const answerValue = inputElement.value;

    // Don't save an empty value unless the user has explicitly cleared a previous answer.
    // A more robust implementation might check if an answer already exists.
    if (!answerValue) {
        console.log("No answer provided, skipping save.");
        return; // Or handle as an explicit 'null' answer
    }

    const { error } = await supabase
        .from('answers')
        .upsert({
            assessment_id: assessmentId,
            question_id: question.id,
            value: answerValue
        }, {
            onConflict: 'assessment_id, question_id'
        });

    if (error) {
        console.error('Error saving answer:', error);
        // In a real app, you'd want to show a user-friendly error message here.
    } else {
        console.log(`Answer for question ${question.id} saved successfully.`);
    }
}


/**
 * Handles the logic for the "Siguiente" / "Finalizar" button.
 */
async function handleNextQuestion() {
    await saveCurrentAnswer();

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    } else {
        // This was the last question.
        alert('¡Levantamiento completado!');
        window.location.href = 'dashboard.html';
    }
}

/**
 * Handles the logic for the "Anterior" button.
 */
function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
        // Note: We are not saving the current answer when going back.
        // This is a design choice. The user must click "Siguiente" to save.
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
}


// --- EVENT LISTENERS ---
// Start the initialization process once the page content has loaded.
document.addEventListener('DOMContentLoaded', initializeAssessment);

// Attach event listeners to the navigation buttons.
nextButton.addEventListener('click', handleNextQuestion);
backButton.addEventListener('click', handlePreviousQuestion);

// --- EVENT LISTENERS ---
// Start the initialization process once the page content has loaded.
document.addEventListener('DOMContentLoaded', initializeAssessment);

let currentStep = 'setup';
let studentCount = 0;
let questionCount = 0;
let correctAnswers = [];
let studentData = [];
let analysisResults = null;

// DOM elements
const setupSection = document.getElementById('setupSection');
const dataSection = document.getElementById('dataSection');
const resultsSection = document.getElementById('resultsSection');
const resetBtn = document.getElementById('resetBtn');

// Step indicators
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showSection('setup');
});

function initializeEventListeners() {
    // Setup form
    document.getElementById('setupForm').addEventListener('submit', handleSetupSubmit);
    
    // Data entry
    document.getElementById('toggleAnswersBtn').addEventListener('click', toggleCorrectAnswers);
    document.getElementById('importBtn').addEventListener('click', handleImportData);
    document.getElementById('generateSampleBtn').addEventListener('click', generateSampleData);
    document.getElementById('backToSetupBtn').addEventListener('click', () => showSection('setup'));
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
    
    // Results
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
    document.getElementById('backToDataBtn').addEventListener('click', () => showSection('data'));
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetApp);
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    document.getElementById(section + 'Section').classList.add('active');
    
    // Update progress steps
    updateProgressSteps(section);
    
    // Show/hide reset button
    resetBtn.style.display = section === 'setup' ? 'none' : 'block';
    
    currentStep = section;
}

function updateProgressSteps(activeStep) {
    const steps = [step1, step2, step3];
    const stepNames = ['setup', 'data', 'results'];
    
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (stepNames[index] === activeStep || stepNames.indexOf(activeStep) > index) {
            step.classList.add('active');
        }
    });
    
    // Update step lines
    const stepLines = document.querySelectorAll('.step-line');
    stepLines.forEach((line, index) => {
        line.classList.remove('active');
        if (stepNames.indexOf(activeStep) > index) {
            line.classList.add('active');
        }
    });
}

function handleSetupSubmit(e) {
    e.preventDefault();
    
    const studentCountInput = document.getElementById('studentCount');
    const questionCountInput = document.getElementById('questionCount');
    const correctAnswersInput = document.getElementById('correctAnswers');
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    const students = parseInt(studentCountInput.value);
    const questions = parseInt(questionCountInput.value);
    const answers = correctAnswersInput.value.toUpperCase().replace(/\s/g, '');
    
    if (!students || students < 5) {
        showError('studentCountError', 'Minimal 5 siswa diperlukan untuk analisis yang valid');
        hasErrors = true;
    }
    
    if (!questions || questions < 5) {
        showError('questionCountError', 'Minimal 5 soal diperlukan untuk analisis yang valid');
        hasErrors = true;
    }
    
    if (!answers) {
        showError('correctAnswersError', 'Kunci jawaban harus diisi');
        hasErrors = true;
    } else if (answers.length !== questions) {
        showError('correctAnswersError', `Kunci jawaban harus ${questions} karakter`);
        hasErrors = true;
    } else {
        const validOptions = ['A', 'B', 'C', 'D', 'E'];
        const invalidAnswers = answers.split('').filter(answer => !validOptions.includes(answer));
        if (invalidAnswers.length > 0) {
            showError('correctAnswersError', 'Kunci jawaban hanya boleh berisi A, B, C, D, atau E');
            hasErrors = true;
        }
    }
    
    if (!hasErrors) {
        studentCount = students;
        questionCount = questions;
        correctAnswers = answers.split('');
        
        initializeStudentData();
        setupDataTable();
        showSection('data');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
        error.textContent = '';
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error');
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = errorElement.previousElementSibling;
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
}

function initializeStudentData() {
    studentData = Array.from({ length: studentCount }, (_, i) => ({
        name: `Siswa ${i + 1}`,
        answers: Array(questionCount).fill('')
    }));
    
    // Update data info
    document.getElementById('dataInfo').textContent = `${studentCount} siswa, ${questionCount} soal`;
}

function setupDataTable() {
    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead tr');
    const tbody = document.getElementById('dataTableBody');
    
    // Clear existing content
    thead.innerHTML = '<th class="name-column">Nama Siswa</th>';
    tbody.innerHTML = '';
    
    // Add question headers
    for (let i = 0; i < questionCount; i++) {
        const th = document.createElement('th');
        th.className = 'question-column';
        th.textContent = i + 1;
        thead.appendChild(th);
    }
    
    // Add student rows
    studentData.forEach((student, studentIndex) => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = student.name;
        nameInput.placeholder = `Siswa ${studentIndex + 1}`;
        nameInput.addEventListener('input', (e) => {
            studentData[studentIndex].name = e.target.value;
        });
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);
        
        // Answer cells
        for (let questionIndex = 0; questionIndex < questionCount; questionIndex++) {
            const answerCell = document.createElement('td');
            const answerInput = document.createElement('input');
            answerInput.type = 'text';
            answerInput.className = 'answer-input';
            answerInput.value = student.answers[questionIndex];
            answerInput.maxLength = 1;
            answerInput.placeholder = '-';
            answerInput.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                e.target.value = value;
                studentData[studentIndex].answers[questionIndex] = value;
                updateAnswerInputStyle(e.target, value, questionIndex);
            });
            answerCell.appendChild(answerInput);
            row.appendChild(answerCell);
        }
        
        tbody.appendChild(row);
    });
    
    // Setup correct answers display
    setupCorrectAnswersDisplay();
}

function updateAnswerInputStyle(input, value, questionIndex) {
    input.classList.remove('correct', 'error');
    
    if (value === correctAnswers[questionIndex]) {
        input.classList.add('correct');
    } else if (value && !['A', 'B', 'C', 'D', 'E'].includes(value)) {
        input.classList.add('error');
    }
}

function setupCorrectAnswersDisplay() {
    const answersGrid = document.getElementById('answersGrid');
    answersGrid.innerHTML = '';
    
    correctAnswers.forEach((answer, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <span class="answer-number">${index + 1}.</span>
            <span class="answer-value">${answer}</span>
        `;
        answersGrid.appendChild(answerItem);
    });
}

function toggleCorrectAnswers() {
    const display = document.getElementById('correctAnswersDisplay');
    const btn = document.getElementById('toggleAnswersBtn');
    const isVisible = display.style.display !== 'none';
    
    display.style.display = isVisible ? 'none' : 'block';
    btn.querySelector('span').textContent = isVisible ? 'Tampilkan Kunci' : 'Sembunyikan Kunci';
}

function handleImportData() {
    const pasteData = document.getElementById('pasteData').value.trim();
    
    if (!pasteData) {
        alert('Silakan masukkan data terlebih dahulu');
        return;
    }
    
    try {
        const lines = pasteData.split('\n');
        
        lines.forEach((line, lineIndex) => {
            if (lineIndex < studentCount && line.trim()) {
                const parts = line.split('\t');
                if (parts.length >= 2) {
                    studentData[lineIndex].name = parts[0].trim();
                    const answersString = parts[1].trim().toUpperCase().replace(/\s/g, '');
                    studentData[lineIndex].answers = answersString.split('').slice(0, questionCount);
                    
                    // Fill remaining answers if needed
                    while (studentData[lineIndex].answers.length < questionCount) {
                        studentData[lineIndex].answers.push('');
                    }
                }
            }
        });
        
        // Update table
        updateDataTable();
        document.getElementById('pasteData').value = '';
        
    } catch (error) {
        alert('Format data tidak valid. Pastikan menggunakan format: Nama[TAB]Jawaban');
    }
}

function generateSampleData() {
    const sampleAnswers = ['A', 'B', 'C', 'D', 'E'];
    
    studentData.forEach((student, index) => {
        student.name = `Siswa ${index + 1}`;
        student.answers = Array.from({ length: questionCount }, () => 
            sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)]
        );
    });
    
    updateDataTable();
}

function updateDataTable() {
    const tbody = document.getElementById('dataTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, studentIndex) => {
        const nameInput = row.querySelector('input[type="text"]:not(.answer-input)');
        const answerInputs = row.querySelectorAll('.answer-input');
        
        nameInput.value = studentData[studentIndex].name;
        
        answerInputs.forEach((input, questionIndex) => {
            input.value = studentData[studentIndex].answers[questionIndex];
            updateAnswerInputStyle(input, input.value, questionIndex);
        });
    });
}

function handleAnalyze() {
    // Validate data
    if (!validateStudentData()) {
        return;
    }
    
    // Calculate analysis
    analysisResults = calculateAnalysis();
    
    // Update results info
    document.getElementById('resultsInfo').textContent = `${studentData.length} siswa, ${questionCount} soal`;
    
    // Display results
    displayResults();
    showSection('results');
}

function validateStudentData() {
    let hasErrors = false;
    const validOptions = ['A', 'B', 'C', 'D', 'E'];
    
    studentData.forEach((student, studentIndex) => {
        if (!student.name.trim()) {
            alert(`Nama siswa ${studentIndex + 1} harus diisi`);
            hasErrors = true;
            return;
        }
        
        student.answers.forEach((answer, answerIndex) => {
            if (!answer || !validOptions.includes(answer.toUpperCase())) {
                alert(`Jawaban siswa ${studentIndex + 1} soal ${answerIndex + 1} harus diisi dengan A/B/C/D/E`);
                hasErrors = true;
                return;
            }
        });
    });
    
    return !hasErrors;
}

function calculateAnalysis() {
    const difficulty = calculateDifficulty();
    const discrimination = calculateDiscrimination();
    const validity = calculateValidity();
    const reliability = calculateReliability();
    
    const itemStats = correctAnswers.map((_, index) => ({
        questionNumber: index + 1,
        difficulty: difficulty[index],
        discrimination: discrimination[index],
        validity: validity[index],
        category: categorizeItem(difficulty[index], discrimination[index], validity[index])
    }));
    
    return {
        difficulty,
        discrimination,
        validity,
        reliability,
        itemStats
    };
}

function calculateDifficulty() {
    const totalStudents = studentData.length;
    
    return correctAnswers.map((correctAnswer, questionIndex) => {
        const correctCount = studentData.filter(student => 
            student.answers[questionIndex]?.toUpperCase() === correctAnswer
        ).length;
        
        return correctCount / totalStudents;
    });
}

function calculateDiscrimination() {
    // Calculate total scores for each student
    const studentScores = studentData.map(student => {
        return student.answers.reduce((score, answer, index) => {
            return score + (answer?.toUpperCase() === correctAnswers[index] ? 1 : 0);
        }, 0);
    });
    
    // Sort students by total score (descending)
    const sortedIndices = studentScores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.index);
    
    // Get 27% top and bottom groups
    const groupSize = Math.ceil(studentData.length * 0.27);
    const topGroup = sortedIndices.slice(0, groupSize);
    const bottomGroup = sortedIndices.slice(-groupSize);
    
    return correctAnswers.map((correctAnswer, questionIndex) => {
        // Count correct answers in top group
        const topCorrect = topGroup.filter(studentIndex => 
            studentData[studentIndex].answers[questionIndex]?.toUpperCase() === correctAnswer
        ).length;
        
        // Count correct answers in bottom group
        const bottomCorrect = bottomGroup.filter(studentIndex => 
            studentData[studentIndex].answers[questionIndex]?.toUpperCase() === correctAnswer
        ).length;
        
        // Calculate discrimination index
        const pTop = topCorrect / groupSize;
        const pBottom = bottomCorrect / groupSize;
        
        return pTop - pBottom;
    });
}

function calculateValidity() {
    // Calculate total scores for each student
    const totalScores = studentData.map(student => {
        return student.answers.reduce((score, answer, index) => {
            return score + (answer?.toUpperCase() === correctAnswers[index] ? 1 : 0);
        }, 0);
    });
    
    // Calculate mean of total scores
    const meanTotal = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
    
    return correctAnswers.map((correctAnswer, questionIndex) => {
        // Get item scores (1 for correct, 0 for incorrect)
        const itemScores = studentData.map(student => 
            student.answers[questionIndex]?.toUpperCase() === correctAnswer ? 1 : 0
        );
        
        // Calculate mean of item scores
        const meanItem = itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length;
        
        // Calculate covariance
        const covariance = itemScores.reduce((sum, itemScore, index) => {
            return sum + (itemScore - meanItem) * (totalScores[index] - meanTotal);
        }, 0) / (itemScores.length - 1);
        
        // Calculate standard deviations
        const stdItem = Math.sqrt(
            itemScores.reduce((sum, score) => sum + Math.pow(score - meanItem, 2), 0) / (itemScores.length - 1)
        );
        
        const stdTotal = Math.sqrt(
            totalScores.reduce((sum, score) => sum + Math.pow(score - meanTotal, 2), 0) / (totalScores.length - 1)
        );
        
        // Calculate correlation coefficient (validity)
        if (stdItem === 0 || stdTotal === 0) return 0;
        return covariance / (stdItem * stdTotal);
    });
}

function calculateReliability() {
    const n = correctAnswers.length; // number of items
    const totalScores = studentData.map(student => {
        return student.answers.reduce((score, answer, index) => {
            return score + (answer?.toUpperCase() === correctAnswers[index] ? 1 : 0);
        }, 0);
    });
    
    // Calculate variance of total scores
    const meanTotal = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
    const varianceTotal = totalScores.reduce((sum, score) => {
        return sum + Math.pow(score - meanTotal, 2);
    }, 0) / (totalScores.length - 1);
    
    // Calculate sum of p*q for each item
    const sumPQ = correctAnswers.reduce((sum, correctAnswer, questionIndex) => {
        const correctCount = studentData.filter(student => 
            student.answers[questionIndex]?.toUpperCase() === correctAnswer
        ).length;
        
        const p = correctCount / studentData.length; // proportion correct
        const q = 1 - p; // proportion incorrect
        
        return sum + (p * q);
    }, 0);
    
    // KR-20 formula
    if (varianceTotal === 0) return 0;
    return (n / (n - 1)) * (1 - (sumPQ / varianceTotal));
}

function categorizeItem(difficulty, discrimination, validity) {
    // Categorize based on discrimination index primarily
    if (discrimination >= 0.4) return 'Sangat Baik';
    if (discrimination >= 0.3) return 'Baik';
    if (discrimination >= 0.2) return 'Cukup';
    if (discrimination >= 0.1) return 'Kurang';
    return 'Sangat Kurang';
}

function displayResults() {
    // Update summary cards
    const avgDifficulty = analysisResults.difficulty.reduce((a, b) => a + b, 0) / analysisResults.difficulty.length;
    const avgDiscrimination = analysisResults.discrimination.reduce((a, b) => a + b, 0) / analysisResults.discrimination.length;
    const avgValidity = analysisResults.validity.reduce((a, b) => a + b, 0) / analysisResults.validity.length;
    
    document.getElementById('avgDifficulty').textContent = avgDifficulty.toFixed(2);
    document.getElementById('avgDiscrimination').textContent = avgDiscrimination.toFixed(2);
    document.getElementById('avgValidity').textContent = avgValidity.toFixed(2);
    document.getElementById('reliability').textContent = analysisResults.reliability.toFixed(3);
    
    // Display summary table
    displaySummaryTable();
    
    // Display metric cards for each tab
    displayDifficultyCards();
    displayDiscriminationCards();
    displayValidityCards();
    displayReliabilityTab();
}

function displaySummaryTable() {
    const tbody = document.getElementById('summaryTableBody');
    tbody.innerHTML = '';
    
    analysisResults.itemStats.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.questionNumber}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${item.difficulty.toFixed(3)}</span>
                    <span class="metric-card-category ${getDifficultyClass(item.difficulty)}" style="font-size: 12px;">
                        (${getDifficultyLabel(item.difficulty)})
                    </span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${item.discrimination.toFixed(3)}</span>
                    <span class="metric-card-category ${getDiscriminationClass(item.discrimination)}" style="font-size: 12px;">
                        (${getDiscriminationLabel(item.discrimination)})
                    </span>
                </div>
            </td>
            <td>${item.validity.toFixed(3)}</td>
            <td>
                <span class="category-badge ${getCategoryClass(item.category)}">
                    ${item.category}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function displayDifficultyCards() {
    const container = document.getElementById('difficultyCards');
    container.innerHTML = '';
    
    analysisResults.difficulty.forEach((difficulty, index) => {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-card-header">
                <span class="metric-card-title">Soal ${index + 1}</span>
                <span class="metric-card-category ${getDifficultyClass(difficulty)}">
                    ${getDifficultyLabel(difficulty)}
                </span>
            </div>
            <div class="metric-card-value">${difficulty.toFixed(3)}</div>
            <div class="metric-progress">
                <div class="metric-progress-bar" style="width: ${difficulty * 100}%; background: #9CAF88;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function displayDiscriminationCards() {
    const container = document.getElementById('discriminationCards');
    container.innerHTML = '';
    
    analysisResults.discrimination.forEach((discrimination, index) => {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-card-header">
                <span class="metric-card-title">Soal ${index + 1}</span>
                <span class="metric-card-category ${getDiscriminationClass(discrimination)}">
                    ${getDiscriminationLabel(discrimination)}
                </span>
            </div>
            <div class="metric-card-value">${discrimination.toFixed(3)}</div>
            <div class="metric-progress">
                <div class="metric-progress-bar" style="width: ${Math.max(0, discrimination) * 100}%; background: #3b82f6;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function displayValidityCards() {
    const container = document.getElementById('validityCards');
    container.innerHTML = '';
    
    analysisResults.validity.forEach((validity, index) => {
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-card-header">
                <span class="metric-card-title">Soal ${index + 1}</span>
                <span class="metric-card-category ${getValidityClass(validity)}">
                    ${getValidityLabel(validity)}
                </span>
            </div>
            <div class="metric-card-value">${validity.toFixed(3)}</div>
            <div class="metric-progress">
                <div class="metric-progress-bar" style="width: ${Math.max(0, validity) * 100}%; background: #8b5cf6;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function displayReliabilityTab() {
    const reliability = analysisResults.reliability;
    
    document.getElementById('reliabilityValue').textContent = reliability.toFixed(3);
    document.getElementById('reliabilityCategory').textContent = getReliabilityLabel(reliability);
    document.getElementById('reliabilityCategory').className = `category ${getReliabilityClass(reliability)}`;
    document.getElementById('reliabilityProgress').style.width = `${Math.max(0, reliability) * 100}%`;
}

// Helper functions for categorization
function getDifficultyClass(difficulty) {
    if (difficulty >= 0.7) return 'easy';
    if (difficulty >= 0.3) return 'medium';
    return 'hard';
}

function getDifficultyLabel(difficulty) {
    if (difficulty >= 0.7) return 'Mudah';
    if (difficulty >= 0.3) return 'Sedang';
    return 'Sukar';
}

function getDiscriminationClass(discrimination) {
    if (discrimination >= 0.4) return 'excellent';
    if (discrimination >= 0.3) return 'good';
    if (discrimination >= 0.2) return 'fair';
    return 'poor';
}

function getDiscriminationLabel(discrimination) {
    if (discrimination >= 0.4) return 'Sangat Baik';
    if (discrimination >= 0.3) return 'Baik';
    if (discrimination >= 0.2) return 'Cukup';
    return 'Kurang';
}

function getValidityClass(validity) {
    if (validity >= 0.3) return 'excellent';
    if (validity >= 0.2) return 'fair';
    return 'poor';
}

function getValidityLabel(validity) {
    if (validity >= 0.3) return 'Valid';
    if (validity >= 0.2) return 'Cukup';
    return 'Kurang';
}

function getReliabilityClass(reliability) {
    if (reliability >= 0.8) return 'excellent';
    if (reliability >= 0.6) return 'good';
    if (reliability >= 0.4) return 'fair';
    return 'poor';
}

function getReliabilityLabel(reliability) {
    if (reliability >= 0.8) return 'Sangat Tinggi';
    if (reliability >= 0.6) return 'Tinggi';
    if (reliability >= 0.4) return 'Cukup';
    return 'Rendah';
}

function getCategoryClass(category) {
    switch (category.toLowerCase()) {
        case 'sangat baik': return 'excellent';
        case 'baik': return 'good';
        case 'cukup': return 'fair';
        case 'kurang': return 'poor';
        case 'sangat kurang': return 'poor';
        default: return 'fair';
    }
}

function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function downloadCSV() {
    if (!analysisResults) return;
    
    const csvContent = [
        ['No Soal', 'Tingkat Kesukaran', 'Daya Pembeda', 'Validitas', 'Kategori'],
        ...analysisResults.itemStats.map(item => [
            item.questionNumber,
            item.difficulty.toFixed(3),
            item.discrimination.toFixed(3),
            item.validity.toFixed(3),
            item.category
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analisis_butir_soal.csv';
    link.click();
}

function resetApp() {
    currentStep = 'setup';
    studentCount = 0;
    questionCount = 0;
    correctAnswers = [];
    studentData = [];
    analysisResults = null;
    
    // Clear forms
    document.getElementById('setupForm').reset();
    document.getElementById('pasteData').value = '';
    
    // Clear errors
    clearErrors();
    
    showSection('setup');
}
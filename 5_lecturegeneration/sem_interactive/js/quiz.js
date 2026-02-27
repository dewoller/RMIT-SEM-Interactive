// ABOUTME: Reusable quiz engine that renders multiple-choice questions with immediate feedback.
// ABOUTME: Quiz data is defined per-section and wired to containers via data attributes.

(function () {
    'use strict';

    var quizData = {
        'data-types': [
            {
                question: "A patient's temperature (e.g., 37.2 degrees C)",
                options: ['Continuous', 'Categorical', 'Dichotomous'],
                correct: 0,
                explanations: {
                    0: 'Correct! Temperature is measured on a continuous scale with meaningful intervals.',
                    1: 'Not quite. Temperature has meaningful numerical distances between values, making it continuous.',
                    2: 'Not quite. Temperature is not limited to two categories \u2014 it is a continuous measurement.'
                }
            },
            {
                question: 'Qualifications (BS, MS, PhD)',
                options: ['Continuous', 'Categorical', 'Dichotomous'],
                correct: 1,
                explanations: {
                    0: 'Not quite. Degree types are named categories, not numbers on a continuous scale.',
                    1: 'Correct! Qualifications are distinct categories with no inherent numerical order.',
                    2: 'Not quite. There are more than two categories here.'
                }
            },
            {
                question: 'Whether someone completed therapy (yes/no)',
                options: ['Continuous', 'Categorical', 'Dichotomous'],
                correct: 2,
                explanations: {
                    0: 'Not quite. Completion status has only two possible values, not a continuous range.',
                    1: 'Close, but since there are exactly two categories this is more specifically dichotomous.',
                    2: 'Correct! Yes/No is a classic dichotomous variable with exactly two outcomes.'
                }
            },
            {
                question: 'Maslach Burnout Inventory score',
                options: ['Continuous', 'Categorical', 'Dichotomous'],
                correct: 0,
                explanations: {
                    0: 'Correct! The MBI produces a numerical score that can take a range of values.',
                    1: 'Not quite. The MBI score is a number with meaningful distances between values.',
                    2: 'Not quite. The score covers a continuous range, not just two categories.'
                }
            },
            {
                question: 'Type of therapy received (CBT, DBT, ACT)',
                options: ['Continuous', 'Categorical', 'Dichotomous'],
                correct: 1,
                explanations: {
                    0: 'Not quite. Therapy types are named groups without meaningful numerical order.',
                    1: 'Correct! Different therapy types are distinct categories.',
                    2: 'Not quite. There are three categories listed here, not just two.'
                }
            }
        ],
        'latent-variables': [
            {
                question: 'Which of these is a LATENT variable?',
                options: [
                    'Age (in years)',
                    'Depression (measured by BDI score)',
                    'Self-esteem (the underlying construct)',
                    'GPA'
                ],
                correct: 2,
                explanations: {
                    0: 'Age is directly observed and measured \u2014 it is not latent.',
                    1: 'The BDI score is an observed indicator. Depression itself could be latent, but the score is directly measured.',
                    2: 'Correct! Self-esteem is a construct we cannot measure directly \u2014 we infer it from observable indicators.',
                    3: 'GPA is directly calculated from grades \u2014 it is an observed variable.'
                }
            },
            {
                question: 'In the burnout example, which are the observed indicators?',
                options: [
                    'Burnout itself',
                    'Exhaustion, detachment, and reduced accomplishment',
                    'The latent construct',
                    'The error terms'
                ],
                correct: 1,
                explanations: {
                    0: 'Burnout is the latent variable \u2014 the thing we cannot observe directly.',
                    1: 'Correct! These three dimensions are what we actually measure to infer the latent construct of burnout.',
                    2: 'A latent construct is what we are trying to measure, not what we observe.',
                    3: 'Error terms represent unexplained variance, not observed indicators.'
                }
            },
            {
                question: 'Why does SEM need latent variables?',
                options: [
                    'To make models more complicated',
                    'Because some psychological constructs cannot be measured directly',
                    'To reduce the number of variables',
                    'They are optional decorations'
                ],
                correct: 1,
                explanations: {
                    0: 'Complexity is not the goal \u2014 latent variables serve a substantive purpose.',
                    1: 'Correct! Many psychological phenomena (intelligence, anxiety, personality) are constructs inferred from multiple observable measures.',
                    2: 'Latent variables can actually increase the number of parameters in a model.',
                    3: 'Latent variables are central to what makes SEM distinct from ordinary regression.'
                }
            }
        ],
        'assumption-violations': [
            {
                question: 'Scenario: A researcher has 95 participants and wants to test a model with 8 latent variables and 32 indicators. What is the problem?',
                options: [
                    'Too many latent variables',
                    'Inadequate sample size',
                    'Multicollinearity',
                    'Non-normal data'
                ],
                correct: 1,
                explanations: {
                    0: 'The number of latent variables is not inherently a problem, but the sample size relative to the model complexity is.',
                    1: 'Correct! A model this complex needs far more than 95 participants. A common rule of thumb suggests at least 5-10 cases per estimated parameter.',
                    2: 'There is no indication of multicollinearity in this scenario.',
                    3: 'The scenario does not describe a normality issue.'
                }
            },
            {
                question: 'Scenario: Two variables in the model correlate at r = 0.92. Both are included as separate predictors. What is the problem?',
                options: [
                    'Inadequate sample size',
                    'Violation of normality',
                    'Multicollinearity',
                    'Incorrect model specification'
                ],
                correct: 2,
                explanations: {
                    0: 'Sample size is not the issue described here.',
                    1: 'The scenario describes high correlation, not non-normal distributions.',
                    2: 'Correct! A correlation of 0.92 between two predictors indicates severe multicollinearity, which can make parameter estimates unstable.',
                    3: 'While the model might benefit from combining these variables, the direct issue is multicollinearity.'
                }
            },
            {
                question: "Scenario: The researcher's data show severe positive skew (most scores clustered at the low end). What is the problem?",
                options: [
                    'Multicollinearity',
                    'Inadequate sample size',
                    'Violation of the normality assumption',
                    'Too many indicators'
                ],
                correct: 2,
                explanations: {
                    0: 'Skewness is about distribution shape, not inter-variable correlation.',
                    1: 'The issue here is about the shape of the distribution, not the number of participants.',
                    2: 'Correct! Severe skew violates the multivariate normality assumption required by standard SEM estimation methods like Maximum Likelihood.',
                    3: 'The number of indicators is not related to distributional skew.'
                }
            }
        ],
        'model-fit': [
            {
                question: 'Which fit index should be close to 1.0 for a good model?',
                options: ['Chi-square', 'CFI', 'RMSEA', 'SRMR'],
                correct: 1,
                explanations: {
                    0: 'Chi-square is a test statistic \u2014 you want a non-significant p-value (> 0.05), not a value close to 1.',
                    1: 'Correct! CFI (Comparative Fit Index) ranges from 0 to 1, with values above 0.95 indicating good fit.',
                    2: 'RMSEA should be low (below 0.06), not close to 1.',
                    3: 'SRMR should be low (below 0.06), not close to 1.'
                }
            },
            {
                question: 'A model has CFI = 0.97, RMSEA = 0.04, SRMR = 0.03. How is the fit?',
                options: [
                    'Poor \u2014 the model should be rejected',
                    'Good \u2014 all indices meet standard thresholds',
                    'Mixed \u2014 some indices are good, others are not',
                    'Cannot determine without chi-square'
                ],
                correct: 1,
                explanations: {
                    0: 'These values actually indicate a well-fitting model.',
                    1: 'Correct! CFI > 0.95, RMSEA < 0.06, and SRMR < 0.06 all indicate good model fit.',
                    2: 'All three indices shown here meet the conventional thresholds for good fit.',
                    3: 'While chi-square is useful, the combination of CFI, RMSEA, and SRMR provides strong evidence of good fit.'
                }
            },
            {
                question: 'Why should you report multiple fit indices rather than just one?',
                options: [
                    'To make the paper longer',
                    'Different indices are sensitive to different types of model misspecification',
                    'Reviewers require exactly four indices',
                    'One index is always unreliable'
                ],
                correct: 1,
                explanations: {
                    0: 'Reporting multiple indices serves a methodological purpose, not a page-count one.',
                    1: 'Correct! Each fit index captures a different aspect of model fit. For example, chi-square is sensitive to sample size while RMSEA accounts for model complexity.',
                    2: 'There is no fixed rule about reporting exactly four \u2014 the reason is about complementary information.',
                    3: 'Individual indices can be informative, but they each have limitations that others compensate for.'
                }
            }
        ]
    };

    function renderQuiz(containerId, quizKey) {
        var container = document.getElementById(containerId);
        if (!container || !quizData[quizKey]) return;

        var questions = quizData[quizKey];
        container.innerHTML = '';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Quiz: ' + quizKey.replace(/-/g, ' '));

        questions.forEach(function (q, qIndex) {
            var questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.setAttribute('role', 'group');
            questionDiv.setAttribute('aria-labelledby', containerId + '-q' + qIndex);

            var questionText = document.createElement('p');
            questionText.id = containerId + '-q' + qIndex;
            questionText.textContent = (qIndex + 1) + '. ' + q.question;
            questionDiv.appendChild(questionText);

            var optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';

            q.options.forEach(function (opt, optIndex) {
                var btn = document.createElement('button');
                btn.textContent = opt;
                btn.setAttribute('data-index', optIndex);
                btn.setAttribute('aria-label', opt);
                btn.addEventListener('click', function () {
                    handleAnswer(questionDiv, q, optIndex);
                });
                optionsDiv.appendChild(btn);
            });

            questionDiv.appendChild(optionsDiv);

            var feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'quiz-feedback';
            feedbackDiv.style.display = 'none';
            feedbackDiv.setAttribute('role', 'alert');
            questionDiv.appendChild(feedbackDiv);

            container.appendChild(questionDiv);
        });
    }

    function handleAnswer(questionDiv, q, selectedIndex) {
        var buttons = questionDiv.querySelectorAll('.quiz-options button');
        var feedback = questionDiv.querySelector('.quiz-feedback');

        // Disable all buttons
        buttons.forEach(function (btn) {
            btn.disabled = true;
        });

        var isCorrect = selectedIndex === q.correct;

        // Highlight selected button
        buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

        // Always highlight the correct answer
        if (!isCorrect) {
            buttons[q.correct].classList.add('correct');
        }

        // Show feedback
        feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = q.explanations[selectedIndex];
        feedback.style.display = 'block';
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(-8px)';

        // Animate in
        requestAnimationFrame(function () {
            feedback.style.transition = 'opacity 0.3s, transform 0.3s';
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });
    }

    // Initialize all quizzes on page load
    document.addEventListener('DOMContentLoaded', function () {
        var containers = document.querySelectorAll('.quiz-container[data-quiz]');
        containers.forEach(function (el) {
            var quizKey = el.getAttribute('data-quiz');
            renderQuiz(el.id, quizKey);
        });
    });
})();

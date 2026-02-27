// ABOUTME: D3.js interactive diagrams for variable relationships, decision trees, and SEM path models.
// ABOUTME: Each diagram lazy-loads via IntersectionObserver when its container scrolls into view.

(function () {
    'use strict';

    // Shared arrow marker definition
    function addArrowMarker(svg, id, color) {
        svg.append('defs').append('marker')
            .attr('id', id)
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 10)
            .attr('refY', 5)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', color);
    }

    // Tooltip helper
    function showTooltip(svg, x, y, text) {
        var group = svg.append('g').attr('class', 'diagram-tooltip-group');
        var padding = 8;
        var bg = group.append('rect')
            .attr('fill', '#2d2d2d')
            .attr('rx', 4)
            .attr('opacity', 0.9);
        var label = group.append('text')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .attr('font-family', '-apple-system, BlinkMacSystemFont, sans-serif')
            .attr('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', y - 12)
            .text(text);
        var bbox = label.node().getBBox();
        bg.attr('x', bbox.x - padding)
            .attr('y', bbox.y - padding / 2)
            .attr('width', bbox.width + padding * 2)
            .attr('height', bbox.height + padding);
    }

    function hideTooltip(svg) {
        svg.selectAll('.diagram-tooltip-group').remove();
    }

    // =========================================================================
    // Variable Relationships Diagram (Section 3)
    // =========================================================================
    function initVariableDiagram() {
        var container = d3.select('#diagram-variables');
        if (container.empty() || container.select('svg').size() > 0) return;

        var width = 600, height = 300;
        var svg = container.append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('role', 'img')
            .attr('aria-label', 'Diagram showing independent variable predicting dependent variable, with options to add mediator and moderator');

        addArrowMarker(svg, 'arrow-var', '#2563eb');

        // IV rectangle
        var ivX = 80, ivY = 130, boxW = 150, boxH = 50;
        svg.append('rect').attr('x', ivX).attr('y', ivY).attr('width', boxW).attr('height', boxH)
            .attr('rx', 8).attr('fill', '#eff6ff').attr('stroke', '#2563eb').attr('stroke-width', 2);
        svg.append('text').attr('x', ivX + boxW / 2).attr('y', ivY + 20).attr('text-anchor', 'middle')
            .attr('font-size', '13px').attr('font-weight', '600').attr('fill', '#2563eb').text('Therapy Type');
        svg.append('text').attr('x', ivX + boxW / 2).attr('y', ivY + 38).attr('text-anchor', 'middle')
            .attr('font-size', '11px').attr('fill', '#6b7280').text('(Independent Variable)');

        // DV rectangle
        var dvX = 370, dvY = 130;
        svg.append('rect').attr('x', dvX).attr('y', dvY).attr('width', boxW).attr('height', boxH)
            .attr('rx', 8).attr('fill', '#f0fdf4').attr('stroke', '#16a34a').attr('stroke-width', 2);
        svg.append('text').attr('x', dvX + boxW / 2).attr('y', dvY + 20).attr('text-anchor', 'middle')
            .attr('font-size', '13px').attr('font-weight', '600').attr('fill', '#16a34a').text('Depression Score');
        svg.append('text').attr('x', dvX + boxW / 2).attr('y', dvY + 38).attr('text-anchor', 'middle')
            .attr('font-size', '11px').attr('fill', '#6b7280').text('(Dependent Variable)');

        // Direct arrow IV -> DV
        var directPath = svg.append('line')
            .attr('class', 'direct-path')
            .attr('x1', ivX + boxW).attr('y1', ivY + boxH / 2)
            .attr('x2', dvX).attr('y2', dvY + boxH / 2)
            .attr('stroke', '#2563eb').attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow-var)');

        // Hover tooltips on boxes
        svg.selectAll('rect').on('mouseover', function () {
            var el = d3.select(this);
            var cx = +el.attr('x') + +el.attr('width') / 2;
            var cy = +el.attr('y');
            var isIV = cx < width / 2;
            showTooltip(svg, cx, cy, isIV
                ? 'IV: The variable you manipulate or predict from'
                : 'DV: The variable you measure as an outcome');
        }).on('mouseout', function () {
            hideTooltip(svg);
        });

        // Controls
        var controls = container.append('div').attr('class', 'controls');
        var explanationDiv = container.append('div').attr('class', 'diagram-explanation').attr('aria-live', 'polite');

        var mediatorBtn = controls.append('button').text('Add Mediator Variable').attr('aria-label', 'Add a mediator variable to the diagram');
        var moderatorBtn = controls.append('button').text('Add Moderator Variable').attr('aria-label', 'Add a moderator variable to the diagram');

        mediatorBtn.on('click', function () {
            mediatorBtn.attr('disabled', true);
            // Fade out direct path
            directPath.transition().duration(400).attr('opacity', 0);

            // Mediator oval
            var medX = width / 2, medY = 50;
            var medGroup = svg.append('g').attr('opacity', 0);
            medGroup.append('ellipse').attr('cx', medX).attr('cy', medY).attr('rx', 70).attr('ry', 25)
                .attr('fill', '#fefce8').attr('stroke', '#f59e0b').attr('stroke-width', 2);
            medGroup.append('text').attr('x', medX).attr('y', medY - 5).attr('text-anchor', 'middle')
                .attr('font-size', '12px').attr('font-weight', '600').attr('fill', '#b45309').text('Coping Strategy');
            medGroup.append('text').attr('x', medX).attr('y', medY + 12).attr('text-anchor', 'middle')
                .attr('font-size', '10px').attr('fill', '#6b7280').text('(Mediator)');

            // Arrow IV -> Mediator
            medGroup.append('line')
                .attr('x1', ivX + boxW).attr('y1', ivY)
                .attr('x2', medX - 50).attr('y2', medY + 20)
                .attr('stroke', '#f59e0b').attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow-var)');

            // Arrow Mediator -> DV
            medGroup.append('line')
                .attr('x1', medX + 50).attr('y1', medY + 20)
                .attr('x2', dvX).attr('y2', dvY)
                .attr('stroke', '#f59e0b').attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow-var)');

            medGroup.transition().duration(600).attr('opacity', 1);
            explanationDiv.text('A mediator explains HOW the IV affects the DV. Therapy may reduce depression through improved coping strategies.');
        });

        moderatorBtn.on('click', function () {
            moderatorBtn.attr('disabled', true);

            var modX = width / 2, modY = 250;
            var modGroup = svg.append('g').attr('opacity', 0);
            modGroup.append('ellipse').attr('cx', modX).attr('cy', modY).attr('rx', 65).attr('ry', 25)
                .attr('fill', '#fdf2f8').attr('stroke', '#ec4899').attr('stroke-width', 2);
            modGroup.append('text').attr('x', modX).attr('y', modY - 5).attr('text-anchor', 'middle')
                .attr('font-size', '12px').attr('font-weight', '600').attr('fill', '#be185d').text('Social Support');
            modGroup.append('text').attr('x', modX).attr('y', modY + 12).attr('text-anchor', 'middle')
                .attr('font-size', '10px').attr('fill', '#6b7280').text('(Moderator)');

            // Dashed arrow from moderator to the path midpoint
            var midX = (ivX + boxW + dvX) / 2;
            var midY = ivY + boxH / 2;
            modGroup.append('line')
                .attr('x1', modX).attr('y1', modY - 25)
                .attr('x2', midX).attr('y2', midY + 10)
                .attr('stroke', '#ec4899').attr('stroke-width', 2)
                .attr('stroke-dasharray', '6,3')
                .attr('marker-end', 'url(#arrow-var)');

            modGroup.transition().duration(600).attr('opacity', 1);
            explanationDiv.text('A moderator changes the STRENGTH or DIRECTION of the IV\u2192DV relationship. Social support may buffer the effect of therapy type on depression.');
        });
    }

    // =========================================================================
    // Statistical Test Decision Tree (Section 4)
    // =========================================================================
    function initDecisionTree() {
        var container = d3.select('#diagram-decision-tree');
        if (container.empty() || container.select('svg').size() > 0) return;

        var treeData = {
            question: 'What type is my DV?',
            children: [
                {
                    answer: 'Continuous',
                    question: 'What type is my IV?',
                    children: [
                        {
                            answer: 'Categorical (2 groups)',
                            question: 'Are parametric assumptions met?',
                            children: [
                                { answer: 'Yes', result: 'Independent t-test', description: 'Compares means between two independent groups' },
                                { answer: 'No', result: 'Mann-Whitney U', description: 'Non-parametric alternative to independent t-test' }
                            ]
                        },
                        {
                            answer: 'Categorical (3+ groups)',
                            question: 'Are parametric assumptions met?',
                            children: [
                                { answer: 'Yes', result: 'ANOVA', description: 'Compares means across three or more groups' },
                                { answer: 'No', result: 'Kruskal-Wallis', description: 'Non-parametric alternative to one-way ANOVA' }
                            ]
                        },
                        {
                            answer: 'Continuous',
                            question: 'Are parametric assumptions met?',
                            children: [
                                { answer: 'Yes', result: 'Pearson correlation', description: 'Measures linear association between two continuous variables' },
                                { answer: 'No', result: 'Spearman correlation', description: 'Rank-based correlation, robust to non-normality' }
                            ]
                        }
                    ]
                },
                {
                    answer: 'Categorical',
                    result: 'Chi-square test',
                    description: 'Tests association between two categorical variables'
                }
            ]
        };

        var width = 600, height = 400;
        var svg = container.append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('role', 'img')
            .attr('aria-label', 'Interactive decision tree for choosing a statistical test');

        var state = { currentNode: treeData, path: [] };

        function renderTree() {
            svg.selectAll('*').remove();

            var node = state.currentNode;
            var startY = 30;

            // Show breadcrumb path
            if (state.path.length > 0) {
                state.path.forEach(function (step, i) {
                    svg.append('text')
                        .attr('x', 20).attr('y', 20 + i * 18)
                        .attr('font-size', '11px').attr('fill', '#6b7280')
                        .text((i + 1) + '. ' + step.question + ' \u2192 ' + step.answer);
                });
                startY = 20 + state.path.length * 18 + 20;
            }

            if (node.result) {
                // Leaf node — show result
                var resultGroup = svg.append('g');
                resultGroup.append('rect')
                    .attr('x', width / 2 - 140).attr('y', startY)
                    .attr('width', 280).attr('height', 70)
                    .attr('rx', 10).attr('fill', '#f0fdf4').attr('stroke', '#16a34a').attr('stroke-width', 2);
                resultGroup.append('text')
                    .attr('x', width / 2).attr('y', startY + 28)
                    .attr('text-anchor', 'middle').attr('font-size', '16px').attr('font-weight', '700').attr('fill', '#16a34a')
                    .text(node.result);
                resultGroup.append('text')
                    .attr('x', width / 2).attr('y', startY + 50)
                    .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#6b7280')
                    .text(node.description);
                return;
            }

            // Question node
            svg.append('rect')
                .attr('x', width / 2 - 150).attr('y', startY)
                .attr('width', 300).attr('height', 44)
                .attr('rx', 8).attr('fill', '#eff6ff').attr('stroke', '#2563eb').attr('stroke-width', 2);
            svg.append('text')
                .attr('x', width / 2).attr('y', startY + 27)
                .attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', '600').attr('fill', '#2563eb')
                .text(node.question);

            // Answer buttons
            var btnStartY = startY + 70;
            var btnCount = node.children.length;
            var btnW = 170, btnH = 40, gap = 15;
            var totalW = btnCount * btnW + (btnCount - 1) * gap;
            var startX = (width - totalW) / 2;

            node.children.forEach(function (child, i) {
                var bx = startX + i * (btnW + gap);
                var btnGroup = svg.append('g').style('cursor', 'pointer');

                btnGroup.append('rect')
                    .attr('x', bx).attr('y', btnStartY)
                    .attr('width', btnW).attr('height', btnH)
                    .attr('rx', 6).attr('fill', 'white').attr('stroke', '#d1d5db').attr('stroke-width', 1.5);

                btnGroup.append('text')
                    .attr('x', bx + btnW / 2).attr('y', btnStartY + 25)
                    .attr('text-anchor', 'middle').attr('font-size', '13px').attr('fill', '#2d2d2d')
                    .text(child.answer);

                // Line from question to button
                svg.append('line')
                    .attr('x1', width / 2).attr('y1', startY + 44)
                    .attr('x2', bx + btnW / 2).attr('y2', btnStartY)
                    .attr('stroke', '#d1d5db').attr('stroke-width', 1);

                btnGroup.on('mouseover', function () {
                    btnGroup.select('rect').attr('stroke', '#2563eb').attr('fill', '#f8faff');
                }).on('mouseout', function () {
                    btnGroup.select('rect').attr('stroke', '#d1d5db').attr('fill', 'white');
                }).on('click', function () {
                    state.path.push({ question: node.question, answer: child.answer });
                    state.currentNode = child;
                    renderTree();
                });
            });
        }

        renderTree();

        // Reset button
        var controls = container.append('div').attr('class', 'controls');
        controls.append('button').text('Reset').attr('aria-label', 'Reset decision tree to start').on('click', function () {
            state.currentNode = treeData;
            state.path = [];
            renderTree();
        });
    }

    // =========================================================================
    // SEM Path Model Diagram (Section 6)
    // =========================================================================
    function initSEMPathModel() {
        var container = d3.select('#diagram-sem-model');
        if (container.empty() || container.select('svg').size() > 0) return;

        var width = 620, height = 380;
        var svg = container.append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('role', 'img')
            .attr('aria-label', 'SEM path model diagram showing latent and observed variables with build-up animation');

        addArrowMarker(svg, 'arrow-sem', '#2563eb');

        var step = 0;
        var maxStep = 4;

        // Latent variables (ovals)
        var latents = [
            { id: 'Stress', x: 100, y: 100, color: '#dc2626' },
            { id: 'Anxiety', x: 310, y: 60, color: '#f59e0b' },
            { id: 'Coping', x: 100, y: 260, color: '#16a34a' },
            { id: 'Performance', x: 520, y: 180, color: '#2563eb' }
        ];

        // Observed indicators per latent
        var indicators = {
            'Stress': [
                { label: 'Work demands', x: -70, y: -55 },
                { label: 'Time pressure', x: -90, y: 0 },
                { label: 'Role conflict', x: -70, y: 55 }
            ],
            'Anxiety': [
                { label: 'Worry', x: -30, y: -60 },
                { label: 'Tension', x: 30, y: -60 },
                { label: 'Restlessness', x: 80, y: -30 }
            ],
            'Coping': [
                { label: 'Problem-solving', x: -80, y: -30 },
                { label: 'Support seeking', x: -90, y: 25 },
                { label: 'Avoidance', x: -70, y: 60 }
            ],
            'Performance': [
                { label: 'GPA', x: 60, y: -50 },
                { label: 'Completion rate', x: 80, y: 0 },
                { label: 'Satisfaction', x: 60, y: 50 }
            ]
        };

        // Structural paths
        var paths = [
            { from: 'Stress', to: 'Performance', coef: '-0.35' },
            { from: 'Stress', to: 'Anxiety', coef: '0.62' },
            { from: 'Coping', to: 'Performance', coef: '0.28' },
            { from: 'Coping', to: 'Anxiety', coef: '-0.41' }
        ];

        var layers = {
            latents: svg.append('g').attr('class', 'layer-latents'),
            indicators: svg.append('g').attr('class', 'layer-indicators').attr('opacity', 0),
            structural: svg.append('g').attr('class', 'layer-structural').attr('opacity', 0),
            errors: svg.append('g').attr('class', 'layer-errors').attr('opacity', 0),
            coefficients: svg.append('g').attr('class', 'layer-coefficients').attr('opacity', 0)
        };

        // Draw latent variables
        latents.forEach(function (lv) {
            layers.latents.append('ellipse')
                .attr('cx', lv.x).attr('cy', lv.y).attr('rx', 55).attr('ry', 22)
                .attr('fill', lv.color + '15').attr('stroke', lv.color).attr('stroke-width', 2);
            layers.latents.append('text')
                .attr('x', lv.x).attr('y', lv.y + 5).attr('text-anchor', 'middle')
                .attr('font-size', '12px').attr('font-weight', '600').attr('fill', lv.color)
                .text(lv.id);
        });

        // Draw indicators
        latents.forEach(function (lv) {
            var inds = indicators[lv.id];
            inds.forEach(function (ind) {
                var ix = lv.x + ind.x, iy = lv.y + ind.y;
                layers.indicators.append('rect')
                    .attr('x', ix - 42).attr('y', iy - 10).attr('width', 84).attr('height', 20)
                    .attr('rx', 3).attr('fill', '#f8f8f6').attr('stroke', '#d1d5db').attr('stroke-width', 1);
                layers.indicators.append('text')
                    .attr('x', ix).attr('y', iy + 4).attr('text-anchor', 'middle')
                    .attr('font-size', '9px').attr('fill', '#6b7280').text(ind.label);
                // Measurement arrow
                layers.indicators.append('line')
                    .attr('x1', lv.x + (ind.x > 0 ? 55 : -55) * (Math.abs(ind.x) > 50 ? 0.7 : 0.5))
                    .attr('y1', lv.y + ind.y * 0.3)
                    .attr('x2', ix + (ind.x > 0 ? -42 : 42))
                    .attr('y2', iy)
                    .attr('stroke', '#d1d5db').attr('stroke-width', 1)
                    .attr('marker-end', 'url(#arrow-sem)');
            });
        });

        // Draw structural paths
        function getLatent(id) { return latents.find(function (l) { return l.id === id; }); }
        paths.forEach(function (p) {
            var from = getLatent(p.from), to = getLatent(p.to);
            layers.structural.append('line')
                .attr('x1', from.x + 55).attr('y1', from.y)
                .attr('x2', to.x - 55).attr('y2', to.y)
                .attr('stroke', '#2563eb').attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow-sem)');
        });

        // Draw error terms
        latents.forEach(function (lv) {
            if (lv.id === 'Stress' || lv.id === 'Coping') return; // exogenous
            layers.errors.append('circle')
                .attr('cx', lv.x + 55).attr('cy', lv.y - 25).attr('r', 8)
                .attr('fill', 'white').attr('stroke', '#6b7280').attr('stroke-width', 1);
            layers.errors.append('text')
                .attr('x', lv.x + 55).attr('y', lv.y - 22).attr('text-anchor', 'middle')
                .attr('font-size', '9px').attr('fill', '#6b7280').text('e');
        });

        // Draw path coefficients
        paths.forEach(function (p) {
            var from = getLatent(p.from), to = getLatent(p.to);
            var mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2 - 10;
            layers.coefficients.append('text')
                .attr('x', mx).attr('y', my).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#2563eb')
                .text(p.coef);
        });

        // Step-through animation
        var controls = container.append('div').attr('class', 'controls');
        var stepLabels = [
            'Latent variables shown',
            'Observed indicators added',
            'Structural paths added',
            'Error terms added',
            'Path coefficients shown'
        ];
        var infoDiv = container.append('div').attr('class', 'diagram-explanation').attr('aria-live', 'polite').text(stepLabels[0]);

        var nextBtn = controls.append('button').text('Next Step').attr('aria-label', 'Show next layer of the SEM diagram');
        var resetBtn = controls.append('button').text('Reset').attr('aria-label', 'Reset SEM diagram to first step');

        nextBtn.on('click', function () {
            step++;
            if (step >= maxStep) nextBtn.attr('disabled', true);
            var layerOrder = ['indicators', 'structural', 'errors', 'coefficients'];
            layers[layerOrder[step - 1]].transition().duration(500).attr('opacity', 1);
            infoDiv.text(stepLabels[step]);
        });

        resetBtn.on('click', function () {
            step = 0;
            nextBtn.attr('disabled', null);
            ['indicators', 'structural', 'errors', 'coefficients'].forEach(function (key) {
                layers[key].attr('opacity', 0);
            });
            infoDiv.text(stepLabels[0]);
        });
    }

    // =========================================================================
    // Lazy Loading via IntersectionObserver
    // =========================================================================
    var initialized = {};

    function lazyInit(id, initFn) {
        if (initialized[id]) return;
        var el = document.getElementById(id);
        if (!el) return;
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    initialized[id] = true;
                    initFn();
                    obs.disconnect();
                }
            });
        }, { threshold: 0.1 });
        obs.observe(el);
    }

    document.addEventListener('DOMContentLoaded', function () {
        lazyInit('diagram-variables', initVariableDiagram);
        lazyInit('diagram-decision-tree', initDecisionTree);
        lazyInit('diagram-sem-model', initSEMPathModel);
    });
})();

// ABOUTME: Interactive simulations for fit index exploration and BKS SEM model visualization.
// ABOUTME: Uses D3.js for rendering and real-time slider-driven updates.

(function () {
    'use strict';

    // =========================================================================
    // Fit Index Explorer (Section 8)
    // =========================================================================
    function initFitExplorer() {
        var container = d3.select('#sim-fit-explorer');
        if (container.empty() || container.select('.slider-group').size() > 0) return;

        container.html('');

        // Sliders
        var sliders = [
            { id: 'sample-size', label: 'Sample Size', min: 50, max: 2000, value: 500, step: 50 },
            { id: 'model-complexity', label: 'Model Complexity (parameters)', min: 5, max: 50, value: 15, step: 1 },
            { id: 'misspecification', label: 'Misspecification Level', min: 0, max: 1, value: 0.1, step: 0.05 }
        ];

        sliders.forEach(function (s) {
            var group = container.append('div').attr('class', 'slider-group');
            group.append('label').attr('for', 'slider-' + s.id).html(
                s.label + ': <span class="slider-value" id="val-' + s.id + '">' + s.value + '</span>'
            );
            group.append('input')
                .attr('type', 'range')
                .attr('id', 'slider-' + s.id)
                .attr('min', s.min)
                .attr('max', s.max)
                .attr('value', s.value)
                .attr('step', s.step)
                .attr('aria-label', s.label)
                .on('input', updateDisplay);
        });

        // Fit index display cards
        var display = container.append('div').attr('class', 'fit-display');

        var cards = [
            { id: 'card-chi', label: 'Chi-square (p-value)', valueId: 'fit-chi' },
            { id: 'card-cfi', label: 'CFI', valueId: 'fit-cfi' },
            { id: 'card-rmsea', label: 'RMSEA', valueId: 'fit-rmsea' },
            { id: 'card-srmr', label: 'SRMR', valueId: 'fit-srmr' }
        ];

        cards.forEach(function (c) {
            var card = display.append('div').attr('class', 'fit-card').attr('id', c.id);
            card.append('div').attr('class', 'value').attr('id', c.valueId).text('--');
            card.append('div').attr('class', 'label').text(c.label);
        });

        // BKS reference row
        container.append('div')
            .attr('class', 'bks-reference')
            .attr('id', 'bks-reference')
            .style('margin-top', '1rem')
            .style('font-size', '0.85rem')
            .style('color', '#6b7280')
            .text('Loading BKS model reference values...');

        // Load BKS reference data
        fetch('data/bks_excerpt.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var fit = data.sem_results.fit_indices;
                var ref = d3.select('#bks-reference');
                ref.html(
                    '<strong>BKS Model Reference:</strong> ' +
                    'Chi-square p=' + formatVal(fit.chi2_p_value || fit['chi2_p-value']) +
                    ', CFI=' + formatVal(fit.cfi) +
                    ', RMSEA=' + formatVal(fit.rmsea) +
                    ', SRMR=' + formatVal(fit.srmr)
                );
            })
            .catch(function () {
                d3.select('#bks-reference').text('(BKS reference data not available)');
            });

        // Initial update
        updateDisplay();

        function updateDisplay() {
            var n = +document.getElementById('slider-sample-size').value;
            var p = +document.getElementById('slider-model-complexity').value;
            var m = +document.getElementById('slider-misspecification').value;

            // Update slider value displays
            document.getElementById('val-sample-size').textContent = n;
            document.getElementById('val-model-complexity').textContent = p;
            document.getElementById('val-misspecification').textContent = m.toFixed(2);

            var fit = approximateFitIndices(n, p, m);

            // Update values
            document.getElementById('fit-chi').textContent =
                fit.chiSquare.toFixed(1) + ' (p=' + fit.pValue.toFixed(3) + ')';
            document.getElementById('fit-cfi').textContent = fit.cfi.toFixed(3);
            document.getElementById('fit-rmsea').textContent = fit.rmsea.toFixed(3);
            document.getElementById('fit-srmr').textContent = fit.srmr.toFixed(3);

            // Update card colors
            setCardClass('card-chi', fit.pValue >= 0.05 ? 'good' : fit.pValue >= 0.01 ? 'ok' : 'poor');
            setCardClass('card-cfi', fit.cfi >= 0.95 ? 'good' : fit.cfi >= 0.90 ? 'ok' : 'poor');
            setCardClass('card-rmsea', fit.rmsea <= 0.05 ? 'good' : fit.rmsea <= 0.08 ? 'ok' : 'poor');
            setCardClass('card-srmr', fit.srmr <= 0.05 ? 'good' : fit.srmr <= 0.08 ? 'ok' : 'poor');
        }
    }

    function approximateFitIndices(sampleSize, nParams, misspec) {
        var df = Math.max(1, nParams - 5);
        var chiSquare = df * (1 + misspec * 3) * (sampleSize / 200);

        // Simplified chi-square p-value approximation using normal approximation
        var z = Math.sqrt(2 * chiSquare) - Math.sqrt(2 * df - 1);
        var pValue = Math.max(0, Math.min(1, 0.5 * (1 - erf(z / Math.SQRT2))));

        var cfi = Math.max(0, Math.min(1, 1 - misspec * 0.8 - (nParams / 200)));
        var rmsea = Math.max(0, misspec * 0.15 + (nParams / sampleSize) * 0.5);
        var srmr = Math.max(0, misspec * 0.12 + (nParams / sampleSize) * 0.3);

        return { chiSquare: chiSquare, pValue: pValue, cfi: cfi, rmsea: rmsea, srmr: srmr, df: df };
    }

    // Error function approximation (Abramowitz and Stegun)
    function erf(x) {
        var sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        var t = 1.0 / (1.0 + 0.3275911 * x);
        var y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
        return sign * y;
    }

    function setCardClass(cardId, cls) {
        var el = document.getElementById(cardId);
        el.className = 'fit-card ' + cls;
    }

    function formatVal(v) {
        if (v === null || v === undefined) return 'N/A';
        return Number(v).toFixed(3);
    }

    // =========================================================================
    // BKS SEM Model Visualization (Section 10)
    // =========================================================================
    function initBKSModel() {
        var container = d3.select('#sim-bks-model');
        if (container.empty() || container.select('svg').size() > 0) return;

        container.html('');

        // Load data
        fetch('data/bks_excerpt.json')
            .then(function (r) { return r.json(); })
            .then(function (data) { renderBKSModel(container, data); })
            .catch(function () {
                container.html('<p style="color: var(--muted);">Could not load BKS model data. Run the Python pipeline first.</p>');
            });
    }

    function renderBKSModel(container, data) {
        var width = 650, height = 420;
        var svg = container.append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('role', 'img')
            .attr('aria-label', 'SEM path diagram of BKS personality model with path coefficients');

        // Arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrow-bks')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 10).attr('refY', 5)
            .attr('markerWidth', 8).attr('markerHeight', 8)
            .attr('orient', 'auto-start-reverse')
            .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 Z').attr('fill', '#2563eb');

        var sem = data.sem_results;
        var descs = data.variable_descriptions;
        var stats = data.descriptive_stats;

        // Layout positions
        var personalityX = 310, personalityY = 200;

        // OCEAN indicators (left and above)
        var indicators = [
            { name: 'opennessvariable', short: 'Openness', x: 90, y: 80 },
            { name: 'consciensiousnessvariable', short: 'Conscientiousness', x: 90, y: 150 },
            { name: 'extroversionvariable', short: 'Extroversion', x: 90, y: 220 },
            { name: 'agreeablenessvariable', short: 'Agreeableness', x: 90, y: 290 }
        ];

        // Exogenous predictors
        var neuroticism = { name: 'neuroticismvariable', short: 'Neuroticism', x: 310, y: 50 };
        var totalfetish = { name: 'totalfetishcategory', short: 'Fetish Categories', x: 530, y: 50 };

        // Endogenous outcome
        var powerless = { name: 'powerlessnessvariable', short: 'Powerlessness', x: 530, y: 340 };

        // Draw measurement model (indicators -> Personality)
        indicators.forEach(function (ind) {
            // Rectangle for indicator
            svg.append('rect')
                .attr('x', ind.x - 65).attr('y', ind.y - 14)
                .attr('width', 130).attr('height', 28)
                .attr('rx', 4).attr('fill', '#f8f8f6').attr('stroke', '#d1d5db');
            svg.append('text')
                .attr('x', ind.x).attr('y', ind.y + 4).attr('text-anchor', 'middle')
                .attr('font-size', '11px').attr('fill', '#2d2d2d').text(ind.short);

            // Arrow indicator -> Personality
            svg.append('line')
                .attr('x1', ind.x + 65).attr('y1', ind.y)
                .attr('x2', personalityX - 55).attr('y2', personalityY)
                .attr('stroke', '#9ca3af').attr('stroke-width', 1.5)
                .attr('marker-end', 'url(#arrow-bks)');

            // Factor loading label
            var loading = findEstimate(sem.factor_loadings, 'Personality', ind.name);
            if (loading !== null) {
                var mx = (ind.x + 65 + personalityX - 55) / 2;
                var my = (ind.y + personalityY) / 2 - 6;
                svg.append('text')
                    .attr('x', mx).attr('y', my).attr('text-anchor', 'middle')
                    .attr('font-size', '10px').attr('fill', '#6b7280').text(loading.toFixed(2));
            }
        });

        // Draw Personality latent (oval)
        svg.append('ellipse')
            .attr('cx', personalityX).attr('cy', personalityY).attr('rx', 55).attr('ry', 24)
            .attr('fill', '#eff6ff').attr('stroke', '#2563eb').attr('stroke-width', 2);
        svg.append('text')
            .attr('x', personalityX).attr('y', personalityY + 5).attr('text-anchor', 'middle')
            .attr('font-size', '13px').attr('font-weight', '600').attr('fill', '#2563eb').text('Personality');

        // Draw Neuroticism (exogenous predictor)
        drawRect(svg, neuroticism.x, neuroticism.y, neuroticism.short, '#fef2f2', '#dc2626');

        // Arrow Neuroticism -> Personality
        svg.append('line')
            .attr('x1', neuroticism.x).attr('y1', neuroticism.y + 14)
            .attr('x2', personalityX).attr('y2', personalityY - 24)
            .attr('stroke', '#dc2626').attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow-bks)');
        var nCoef = findPathCoef(sem.path_coefficients, 'Personality', 'neuroticismvariable');
        if (nCoef !== null) {
            svg.append('text')
                .attr('x', (neuroticism.x + personalityX) / 2 - 20).attr('y', (neuroticism.y + 14 + personalityY - 24) / 2)
                .attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#dc2626').text(nCoef.toFixed(3));
        }

        // Draw Fetish Categories (exogenous)
        drawRect(svg, totalfetish.x, totalfetish.y, totalfetish.short, '#f8f8f6', '#6b7280');

        // Draw Powerlessness (endogenous outcome)
        drawRect(svg, powerless.x, powerless.y, powerless.short, '#fefce8', '#f59e0b');

        // Arrow Personality -> Powerlessness
        svg.append('line')
            .attr('x1', personalityX + 55).attr('y1', personalityY + 10)
            .attr('x2', powerless.x - 65).attr('y2', powerless.y)
            .attr('stroke', '#2563eb').attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow-bks)');
        var pCoef = findPathCoef(sem.path_coefficients, 'powerlessnessvariable', 'Personality');
        if (pCoef !== null) {
            svg.append('text')
                .attr('x', (personalityX + 55 + powerless.x - 65) / 2).attr('y', (personalityY + powerless.y) / 2 - 8)
                .attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#2563eb').text(pCoef.toFixed(3));
        }

        // Arrow Neuroticism -> Powerlessness
        svg.append('line')
            .attr('x1', neuroticism.x + 50).attr('y1', neuroticism.y + 14)
            .attr('x2', powerless.x - 30).attr('y2', powerless.y - 14)
            .attr('stroke', '#dc2626').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
            .attr('marker-end', 'url(#arrow-bks)');
        var nPCoef = findPathCoef(sem.path_coefficients, 'powerlessnessvariable', 'neuroticismvariable');
        if (nPCoef !== null) {
            svg.append('text')
                .attr('x', (neuroticism.x + 50 + powerless.x - 30) / 2 + 10)
                .attr('y', (neuroticism.y + 14 + powerless.y - 14) / 2)
                .attr('font-size', '10px').attr('fill', '#dc2626').text(nPCoef.toFixed(3));
        }

        // Arrow TotalFetish -> Powerlessness
        svg.append('line')
            .attr('x1', totalfetish.x).attr('y1', totalfetish.y + 14)
            .attr('x2', powerless.x).attr('y2', powerless.y - 14)
            .attr('stroke', '#6b7280').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
            .attr('marker-end', 'url(#arrow-bks)');
        var fCoef = findPathCoef(sem.path_coefficients, 'powerlessnessvariable', 'totalfetishcategory');
        if (fCoef !== null) {
            svg.append('text')
                .attr('x', totalfetish.x + 15).attr('y', (totalfetish.y + 14 + powerless.y - 14) / 2)
                .attr('font-size', '10px').attr('fill', '#6b7280').text(fCoef.toFixed(3));
        }

        // Error term on Powerlessness
        svg.append('circle')
            .attr('cx', powerless.x + 70).attr('cy', powerless.y).attr('r', 10)
            .attr('fill', 'white').attr('stroke', '#6b7280');
        svg.append('text')
            .attr('x', powerless.x + 70).attr('y', powerless.y + 4).attr('text-anchor', 'middle')
            .attr('font-size', '10px').attr('fill', '#6b7280').text('e');

        // Fit indices summary bar
        var fitBar = container.append('div')
            .style('margin-top', '1rem')
            .style('display', 'flex')
            .style('gap', '1.5rem')
            .style('justify-content', 'center')
            .style('flex-wrap', 'wrap')
            .style('font-size', '0.85rem');

        var fit = sem.fit_indices;
        var fitItems = [
            { label: 'Chi-square', value: fit.chi_square || fit.chi2, threshold: null },
            { label: 'CFI', value: fit.cfi, threshold: 0.95 },
            { label: 'RMSEA', value: fit.rmsea, threshold: 0.06 },
            { label: 'SRMR', value: fit.srmr, threshold: 0.06 }
        ];

        fitItems.forEach(function (item) {
            var color = '#6b7280';
            if (item.threshold !== null && item.value !== null) {
                if (item.label === 'CFI') {
                    color = item.value >= item.threshold ? '#16a34a' : '#dc2626';
                } else {
                    color = item.value <= item.threshold ? '#16a34a' : '#dc2626';
                }
            }
            fitBar.append('span')
                .style('color', color)
                .html('<strong>' + item.label + ':</strong> ' + formatVal(item.value));
        });

        // N info
        fitBar.append('span')
            .style('color', '#6b7280')
            .html('<strong>N:</strong> ' + stats.n);

        // Controls
        var controls = container.append('div').attr('class', 'controls').style('margin-top', '1rem');

        // What-if mode
        var whatIfActive = false;
        var removedPaths = [];
        var whatIfBtn = controls.append('button').text('Explore: Remove a Path').attr('aria-label', 'Enter what-if mode to remove paths from the model');
        var resetBtn = controls.append('button').text('Reset Model').attr('aria-label', 'Restore all removed paths');
        var whatIfInfo = container.append('div').attr('class', 'diagram-explanation').attr('aria-live', 'polite');

        whatIfBtn.on('click', function () {
            whatIfActive = !whatIfActive;
            whatIfBtn.text(whatIfActive ? 'Exit What-If Mode' : 'Explore: Remove a Path');
            if (whatIfActive) {
                whatIfInfo.text('Click any arrow to remove that path and see how it might affect model fit.');
                svg.selectAll('line[stroke="#2563eb"], line[stroke="#dc2626"], line[stroke="#6b7280"]')
                    .style('cursor', 'pointer')
                    .on('click', function () {
                        if (!whatIfActive) return;
                        var line = d3.select(this);
                        removedPaths.push(line.node().cloneNode(true));
                        line.transition().duration(300).attr('opacity', 0).remove();
                        whatIfInfo.text('Path removed. Removing structural paths generally worsens model fit, as the model can no longer explain variance along that pathway. Real re-estimation would be needed for exact new fit indices.');
                    });
            } else {
                whatIfInfo.text('');
                svg.selectAll('line').style('cursor', 'default').on('click', null);
            }
        });

        resetBtn.on('click', function () {
            // Simplest reset: re-render
            container.html('');
            renderBKSModel(container, data);
        });
    }

    function drawRect(svg, x, y, label, fill, stroke) {
        svg.append('rect')
            .attr('x', x - 65).attr('y', y - 14)
            .attr('width', 130).attr('height', 28)
            .attr('rx', 4).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5);
        svg.append('text')
            .attr('x', x).attr('y', y + 4).attr('text-anchor', 'middle')
            .attr('font-size', '11px').attr('font-weight', '600').attr('fill', stroke).text(label);
    }

    function findEstimate(loadings, from, to) {
        for (var i = 0; i < loadings.length; i++) {
            if (loadings[i].from === from && loadings[i].to === to) {
                return loadings[i].estimate;
            }
        }
        return null;
    }

    function findPathCoef(paths, from, to) {
        for (var i = 0; i < paths.length; i++) {
            if (paths[i].from === from && paths[i].to === to) {
                return paths[i].estimate;
            }
        }
        return null;
    }

    function formatVal(v) {
        if (v === null || v === undefined) return 'N/A';
        return Number(v).toFixed(3);
    }

    // =========================================================================
    // Lazy Loading
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
        lazyInit('sim-fit-explorer', initFitExplorer);
        lazyInit('sim-bks-model', initBKSModel);
    });
})();

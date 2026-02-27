// ABOUTME: Handles scroll progress bar, active section highlighting, and smooth scroll navigation.
// ABOUTME: Uses IntersectionObserver for performant section tracking.

document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.getElementById('progress-bar');
    const nav = document.getElementById('main-nav');
    const navLinks = nav.querySelectorAll('a');
    const sections = document.querySelectorAll('main section');

    // --- Progress Bar ---
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                progressBar.style.width = percent + '%';
                progressBar.setAttribute('aria-valuenow', Math.round(percent));
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- Active Section Tracking ---
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(function (link) {
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px'
    });

    sections.forEach(function (section) {
        observer.observe(section);
    });

    // --- Smooth Scroll on Nav Click ---
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Glossary Toggle ---
    const glossary = document.getElementById('glossary');
    const glossaryToggle = document.getElementById('glossary-toggle');
    if (glossary && glossaryToggle) {
        glossaryToggle.addEventListener('click', function () {
            const isOpen = glossary.classList.toggle('open');
            glossaryToggle.setAttribute('aria-expanded', isOpen);
        });
    }
});

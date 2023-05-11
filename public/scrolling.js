gsap.registerPlugin(ScrollTrigger);

const sections = document.querySelectorAll('li');

sections.forEach(section => {
    gsap.fromTo(section.children, {y: '+=200', opacity: 0}, {y: 0, opacity: 1, duration: 2, ease: 'easeInOut', scrollTrigger: {
        trigger: section,
        start: 'top 80%',
    }});  
});


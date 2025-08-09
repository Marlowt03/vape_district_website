// JavaScript for Vape District website
// Handles mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Reviews slider functionality
  const reviewSlides = document.querySelectorAll('.review-slide');
  const prevBtn = document.querySelector('.reviews-slider .prev');
  const nextBtn = document.querySelector('.reviews-slider .next');
  if (reviewSlides && reviewSlides.length) {
    let currentIndex = 0;
    // Helper to display the current review
    const showReview = (index) => {
      reviewSlides.forEach((slide, i) => {
        slide.classList.remove('active');
      });
      reviewSlides[index].classList.add('active');
    };
    // Navigate to previous/next review
    const goPrev = () => {
      currentIndex = (currentIndex - 1 + reviewSlides.length) % reviewSlides.length;
      showReview(currentIndex);
    };
    const goNext = () => {
      currentIndex = (currentIndex + 1) % reviewSlides.length;
      showReview(currentIndex);
    };
    // Attach event listeners if buttons exist
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    // Auto-advance every 15 seconds
    setInterval(goNext, 15000);
  }

  // Brand logos slider functionality
  const brandSlides = document.querySelectorAll('.brand-slide');
  const prevBrandBtn = document.querySelector('.brand-carousel .prev');
  const nextBrandBtn = document.querySelector('.brand-carousel .next');
  if (brandSlides && brandSlides.length) {
    let currentBrandIndex = 0;
    // Helper to display the current brand slide
    const showBrand = (index) => {
      brandSlides.forEach((slide) => {
        slide.classList.remove('active');
      });
      brandSlides[index].classList.add('active');
    };
    const goBrandPrev = () => {
      currentBrandIndex = (currentBrandIndex - 1 + brandSlides.length) % brandSlides.length;
      showBrand(currentBrandIndex);
    };
    const goBrandNext = () => {
      currentBrandIndex = (currentBrandIndex + 1) % brandSlides.length;
      showBrand(currentBrandIndex);
    };
    if (prevBrandBtn) prevBrandBtn.addEventListener('click', goBrandPrev);
    if (nextBrandBtn) nextBrandBtn.addEventListener('click', goBrandNext);
    // Initialise the first slide
    showBrand(currentBrandIndex);
    // Auto-advance every 15 seconds
    setInterval(goBrandNext, 15000);
  }
});
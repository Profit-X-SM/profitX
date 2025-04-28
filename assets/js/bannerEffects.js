// ProfitX Banner and Interactive Elements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle system if particles.js is loaded
    if (typeof particlesJS !== 'undefined') {
      initParticles();
    } else {
      // Fallback to simpler animation if particles.js isn't loaded
      createFloatingIcons();
    }
    
    // Initialize score bar animations
    initScoreBars();
    
    // Add event listeners for interactive elements
    setupInteractions();
  });
  
  // Initialize particle system
  function initParticles() {
    particlesJS('particles-container', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#ffffff'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },
        },
        opacity: {
          value: 0.5,
          random: true,
          animation: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          animation: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#4c94e8',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  }
  
  // Create floating cryptocurrency icons as a fallback animation
  function createFloatingIcons() {
    const banner = document.getElementById('banner');
    const icons = ['₿', 'Ξ', '₮', '◎', 'Ł', '₳', '₱']; // Crypto symbols
    const iconCount = 10;
    
    for (let i = 0; i < iconCount; i++) {
      const icon = document.createElement('div');
      icon.className = 'crypto-icon';
      icon.textContent = icons[Math.floor(Math.random() * icons.length)];
      
      // Random positioning
      icon.style.top = `${Math.random() * 100}%`;
      icon.style.left = `${Math.random() * 100}%`;
      icon.style.fontSize = `${Math.random() * 2 + 1}rem`;
      
      // Random animation delay and duration
      icon.style.animationDelay = `${Math.random() * 5}s`;
      icon.style.animationDuration = `${Math.random() * 10 + 5}s`;
      
      banner.appendChild(icon);
    }
  }
  
  // Initialize score bar animations
  function initScoreBars() {
    const bars = document.querySelectorAll('.bar');
    
    bars.forEach(bar => {
      const value = bar.getAttribute('data-tooltip');
      bar.style.setProperty('--bar-width', value);
      
      // Add animation when scrolled into view
      observeElement(bar, () => {
        bar.classList.add('animate');
      });
    });
  }
  
  // Set up interactions for interactive elements
  function setupInteractions() {
    // Token search functionality
    const searchButton = document.querySelector('button[onclick="searchToken()"]');
    if (searchButton) {
      searchButton.addEventListener('click', searchToken);
    }
    
    // Hover effects for news cards
    const newsCards = document.querySelectorAll('.box.feature');
    newsCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.querySelector('h3').style.color = '#4c94e8';
      });
      
      card.addEventListener('mouseleave', function() {
        this.querySelector('h3').style.color = '';
      });
    });
    
    // Add scroll animations
    observeElements('.box.highlight, .box.feature, .box.post', 'fade-in');
  }
  
  // Intersection Observer helper
  function observeElement(element, callback) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(element);
  }
  
  // Observe multiple elements
  function observeElements(selector, className) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    elements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // Token search functionality
  function searchToken() {
    const tokenAddress = document.getElementById('tokenSearch').value;
    if (!tokenAddress) {
      alert('Please enter a token address');
      return;
    }
    
    // Show loading state
    const searchButton = document.querySelector('button[onclick="searchToken()"]');
    const originalText = searchButton.textContent;
    searchButton.textContent = 'Searching...';
    searchButton.disabled = true;
    
    // In a real implementation, this would make an API call
    // For demo purposes, we'll just simulate a search delay
    setTimeout(() => {
      // Generate random scores for demo
      const momentum = Math.floor(Math.random() * 40) + 60; // 60-100
      const liquidity = Math.floor(Math.random() * 50) + 50; // 50-100
      const social = Math.floor(Math.random() * 60) + 40; // 40-100
      const tokenomics = Math.floor(Math.random() * 50) + 50; // 50-100
      const credibility = Math.floor(Math.random() * 70) + 30; // 30-100
      
      // Create a new row in the table
      const tbody = document.querySelector('table tbody');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${tokenAddress.substring(0, 8)}...${tokenAddress.substring(tokenAddress.length - 6)}</td>
        <td><div class="bar momentum" data-tooltip="${momentum}%"></div></td>
        <td><div class="bar liquidity" data-tooltip="${liquidity}%"></div></td>
        <td><div class="bar social" data-tooltip="${social}%"></div></td>
        <td><div class="bar tokenomics" data-tooltip="${tokenomics}%"></div></td>
        <td><div class="bar credibility" data-tooltip="${credibility}%"></div></td>
      `;
      
      // Add the new row with animation
      row.style.opacity = '0';
      tbody.prepend(row);
      
      // Animate bars
      const bars = row.querySelectorAll('.bar');
      bars.forEach(bar => {
        const value = bar.getAttribute('data-tooltip');
        bar.style.setProperty('--bar-width', value);
        bar.classList.add('animate');
      });
      
      // Fade in the row
      setTimeout(() => {
        row.style.transition = 'opacity 0.5s';
        row.style.opacity = '1';
      }, 100);
      
      // Reset button
      searchButton.textContent = originalText;
      searchButton.disabled = false;
    }, 1500);
  }
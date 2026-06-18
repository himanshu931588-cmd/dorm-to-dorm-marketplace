// Vercel Web Analytics Integration
// This script initializes Vercel Analytics for the application

// Using the global window.va API for vanilla JavaScript projects
window.va = window.va || function () { 
  (window.vaq = window.vaq || []).push(arguments); 
};

// Optional: Configure beforeSend if you need to filter events
// window.va('beforeSend', (event) => {
//   // Filter events if needed
//   return event;
// });

// Load the Vercel Analytics script
(function() {
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();

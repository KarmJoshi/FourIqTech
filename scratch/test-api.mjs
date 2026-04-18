import fetch from 'node-fetch';

fetch('http://localhost:3848/api/settings', {
  method: 'POST', 
  headers: {'Content-Type': 'application/json'}, 
  body: JSON.stringify({agentModels: {manager: ['gemini-3.1-pro-preview'], scanner: ['gemini-1.5-pro']}})
})
.then(res => res.json())
.then(console.log)
.catch(console.error);

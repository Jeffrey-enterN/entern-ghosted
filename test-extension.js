#!/usr/bin/env node

/**
 * Extension integration test script
 * 
 * This script simulates the API responses that would be received by the browser extension
 * when it makes requests to the server. It allows testing the extension without having
 * to actually install it in a browser.
 */

const http = require('http');

// Sample company data for testing
const testCompanies = {
  'example corp': {
    id: 1,
    name: 'Example Corp',
    ghostingRate: 35,
    totalReports: 42,
    stageBreakdown: {
      'Initial Application': 10,
      'After Phone Screen': 25,
      'After First Interview': 45,
      'After Multiple Interviews': 15,
      'After Final Round': 5,
      'After Verbal Offer': 0
    },
    recentReports: [
      { stage: 'After First Interview', date: '2023-03-15', comment: 'Never heard back after interview' }
    ]
  },
  'tech innovations': {
    id: 2,
    name: 'Tech Innovations',
    ghostingRate: 12,
    totalReports: 18,
    stageBreakdown: {
      'Initial Application': 40,
      'After Phone Screen': 30,
      'After First Interview': 20,
      'After Multiple Interviews': 10,
      'After Final Round': 0,
      'After Verbal Offer': 0
    },
    recentReports: [
      { stage: 'After Phone Screen', date: '2023-04-02', comment: 'No response after HR call' }
    ]
  },
  'global systems': {
    id: 3,
    name: 'Global Systems',
    ghostingRate: 68,
    totalReports: 75,
    stageBreakdown: {
      'Initial Application': 5,
      'After Phone Screen': 15,
      'After First Interview': 25,
      'After Multiple Interviews': 40,
      'After Final Round': 10,
      'After Verbal Offer': 5
    },
    recentReports: [
      { stage: 'After Multiple Interviews', date: '2023-03-28', comment: 'Ghosted after three rounds' }
    ]
  }
};

// Create a simple HTTP server to simulate the API
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Handle API endpoints
  if (pathname === '/api/companies/stats' && req.method === 'GET') {
    // Get company stats by name
    const companyName = url.searchParams.get('name')?.toLowerCase();
    
    if (!companyName) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Company name is required' }));
      return;
    }
    
    // Find matching company (allowing partial match for testing)
    const matchedCompany = Object.keys(testCompanies).find(key => key.includes(companyName));
    
    if (matchedCompany) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(testCompanies[matchedCompany]));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Company not found' }));
    }
  } 
  else if (pathname === '/api/reports' && req.method === 'POST') {
    // Handle report submission
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Report submitted:', data);
        
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          id: Math.floor(Math.random() * 1000),
          ...data,
          created_at: new Date().toISOString()
        }));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  else if (pathname === '/api/reporters' && req.method === 'GET') {
    // Return mock reporter list
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([
      { id: 'abcd1234', reports: 3 },
      { id: 'efgh5678', reports: 1 }
    ]));
  }
  else {
    // Handle unknown endpoints
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Available test companies:');
  Object.keys(testCompanies).forEach(key => {
    console.log(`- ${testCompanies[key].name} (ghosting rate: ${testCompanies[key].ghostingRate}%)`);
  });
  console.log('\nTry testing with:');
  console.log(`curl "http://localhost:${PORT}/api/companies/stats?name=example"`);
  console.log(`curl -X POST -H "Content-Type: application/json" -d '{"companyName":"New Co","stage":"After Phone Screen","reporterId":"test123"}' http://localhost:${PORT}/api/reports`);
  console.log('\nPress Ctrl+C to stop');
});
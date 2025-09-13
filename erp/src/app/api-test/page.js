'use client';

import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import { apiService } from '../../services/apiService';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testEndpoints = [
    { name: 'Admission Stats', endpoint: '/admissions/stats', method: 'GET' },
    { name: 'All Admissions', endpoint: '/admissions', method: 'GET' },
    { name: 'Test Admission Creation', endpoint: '/admissions/create', method: 'POST', data: {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      programme_applied: 'Computer Science'
    }}
  ];

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    const results = [];

    for (const test of testEndpoints) {
      try {
        const startTime = Date.now();
        let response;
        
        if (test.method === 'GET') {
          response = await apiService.request(test.endpoint);
        } else if (test.method === 'POST') {
          response = await apiService.request(test.endpoint, {
            method: 'POST',
            body: JSON.stringify(test.data)
          });
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;

        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'success',
          duration: `${duration}ms`,
          response: JSON.stringify(response, null, 2)
        });
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'error',
          error: error.message,
          response: null
        });
      }
      
      setTestResults([...results]);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
  };

  const testDirectUrl = async () => {
    const url = 'https://script.google.com/macros/s/AKfycbwR-NWiU-VN8sui6vyx2l9NWt8CpcYRWqNSB8ObnIcB-56msjtES0j4KunP7LZ6rqiG/exec?path=admissions/stats';
    
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      const data = await response.text();
      console.log('Direct URL Response:', data);
      
      if (data.includes('Moved Temporarily')) {
        alert('API is redirecting. This is expected behavior for Google Apps Script.');
      } else {
        alert('Direct URL test successful!');
      }
    } catch (error) {
      console.error('Direct URL test failed:', error);
      alert(`Direct URL test failed: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Connection Test</h1>
          <p className="text-gray-600 mt-2">
            Test the connection to the Google Apps Script API
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">API Configuration</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Base URL:</strong> https://script.google.com/macros/s/AKfycbwR-NWiU-VN8sui6vyx2l9NWt8CpcYRWqNSB8ObnIcB-56msjtES0j4KunP7LZ6rqiG/exec</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                <p><strong>CORS Mode:</strong> Enabled</p>
              </div>
              <div className="mt-4 space-x-4">
                <Button onClick={runTests} disabled={testing}>
                  {testing ? 'Testing...' : 'Run API Tests'}
                </Button>
                <Button variant="secondary" onClick={testDirectUrl}>
                  Test Direct URL
                </Button>
              </div>
            </CardContent>
          </Card>

          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Test Results</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{result.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status === 'success' ? `✓ ${result.duration}` : '✗ Failed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Endpoint:</strong> {result.endpoint}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 mb-2">
                          <strong>Error:</strong> {result.error}
                        </p>
                      )}
                      {result.response && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Response Data</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {result.response}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
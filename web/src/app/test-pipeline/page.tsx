'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  details?: Record<string, unknown>;
  error?: string;
}

interface PipelineTestResults {
  timestamp: string;
  tests: TestResult[];
  summary: {
    successful: number;
    total: number;
    successRate: string;
    allPassed: boolean;
  };
}

export default function PipelineTestPage() {
  const [results, setResults] = useState<PipelineTestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setTestProgress('Initializing tests...');
    
    try {
      setTestProgress('Running pipeline tests...');
      const response = await fetch('/api/test-pipeline');
      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`);
      }
      
      setTestProgress('Processing results...');
      const data = await response.json();
      setResults(data);
      setTestProgress('Tests completed!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setTestProgress('');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pipeline-test-results-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  useEffect(() => {
    runTests();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        runTests();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loading]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Video/Audio Processing Pipeline Test</h1>
        <p className="text-gray-600 mb-4">
          This page tests all components of the video/audio processing pipeline including FFmpeg, 
          OpenAI Whisper, AWS S3, and content analysis services.
        </p>        <div className="flex gap-2 mb-4">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Tests Again'}
          </Button>
          {results && (
            <Button variant="outline" onClick={exportResults}>
              Export Results
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-300' : ''}
          >
            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
          </Button>
        </div>
        {loading && testProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">🔄 {testProgress}</p>
          </div>
        )}
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">❌ Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.successful}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.summary.total - results.summary.successful}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{results.summary.successRate}</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
              <div className="mt-4">
                <Badge variant={results.summary.allPassed ? "default" : "destructive"}>
                  {results.summary.allPassed ? "All Tests Passed ✅" : "Some Tests Failed ❌"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {results.tests.map((test, index) => (
              <Card key={index} className={test.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{test.name}</span>
                    <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                      {test.status === 'success' ? '✅ Success' : '❌ Error'}
                    </Badge>
                  </CardTitle>
                </CardHeader>                <CardContent>
                  {test.status === 'success' && test.details && (
                    <div className="space-y-2">
                      {Object.entries(test.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="font-medium text-sm">{key}:</span>
                          <span className="text-gray-600 text-sm max-w-md text-right">
                            {typeof value === 'object' ? (
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              String(value)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {test.status === 'error' && (
                    <div className="space-y-3">
                      <div className="text-red-600">
                        <strong>Error:</strong> {test.error}
                      </div>
                      {/* Add specific troubleshooting tips */}
                      {test.name.includes('FFmpeg') && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                          <strong>💡 Fix:</strong> Install FFmpeg: 
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded">choco install ffmpeg</code>
                        </div>
                      )}
                      {test.name.includes('OpenAI') && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                          <strong>💡 Fix:</strong> Add OPENAI_API_KEY to your .env.local file. 
                          Get your API key from{' '}
                          <a href="https://platform.openai.com/api-keys" className="text-blue-600 underline">
                            OpenAI Platform
                          </a>
                        </div>
                      )}
                      {test.name.includes('AWS') && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                          <strong>💡 Fix:</strong> Configure AWS credentials in .env.local:
                          <br />
                          AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Setup Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Install FFmpeg (Windows):</h3>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    choco install ffmpeg
                  </code>
                  <p className="text-xs text-gray-600 mt-1">
                    Or download from <a href="https://ffmpeg.org/download.html" className="text-blue-600 underline">ffmpeg.org</a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">2. Create .env.local file:</h3>
                  <code className="block bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
{`# Copy from .env.example and fill in your values
OPENAI_API_KEY=your_openai_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name`}
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Test individual components:</h3>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    node test-processing-pipeline.js
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Environment Setup Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Documentation:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>📖 Complete guide: <code className="bg-gray-100 px-1 py-0.5 rounded">VIDEO_AUDIO_TESTING_GUIDE.md</code></li>
                    <li>⚙️ Environment template: <code className="bg-gray-100 px-1 py-0.5 rounded">.env.example</code></li>
                    <li>🧪 CLI testing: <code className="bg-gray-100 px-1 py-0.5 rounded">test-processing-pipeline.js</code></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Test Results:</h3>
                  <p className="text-sm text-gray-600">
                    Last tested: {new Date(results.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total processing time: {results.tests.length} tests completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

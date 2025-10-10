import React, { useState } from 'react';
import type { StandaloneContentAnalysis, User } from '../types';
import { analyzeStandaloneContent } from '../services/geminiService';
import Loader from '../components/Loader';
import { SparklesIcon, ContentAnalyzerIcon } from '../components/Icons';

const PerformanceScoreBar: React.FC<{ name: string; score: number }> = ({ name, score }) => {
    const width = `${score}%`;
    let bgColor = 'bg-green-500';
    if (score < 70) bgColor = 'bg-yellow-500';
    if (score < 40) bgColor = 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-text-muted dark:text-gray-400">{name}</span>
                <span className="text-sm font-bold text-text-main dark:text-gray-200">{score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`${bgColor} h-2.5 rounded-full`} style={{ width }}></div>
            </div>
        </div>
    );
};

const PlatformChart: React.FC<{ data: { platform: string, score: number }[] }> = ({ data }) => {
    const maxValue = 100;
    return (
        <div className="space-y-4">
            {data.map(({ platform, score }) => (
                <div key={platform} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-muted dark:text-gray-400 w-28 text-right">{platform}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div 
                            className="bg-primary h-4 rounded-full text-white text-xs flex items-center justify-end pr-2" 
                            style={{ width: `${(score / maxValue) * 100}%` }}
                        >
                            {score}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AnalysisResult: React.FC<{ analysis: StandaloneContentAnalysis; url: string }> = ({ analysis, url }) => {
    const metadata = [
      { key: 'type', label: 'Type' },
      { key: 'format', label: 'Format' },
      { key: 'tone', label: 'Tone' },
      { key: 'targetAudience', label: 'Target Audience' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 shadow-lg animate-fadeInUp dark:border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-text-main dark:text-gray-50">📝 Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {metadata.map(item => (
                <div key={item.key}>
                    <p className="capitalize text-text-muted dark:text-gray-400">{item.label}</p>
                    <p className="font-semibold text-text-main dark:text-gray-200">{analysis.metadata[item.key as keyof typeof analysis.metadata]}</p>
                </div>
            ))}
            {analysis.metadata.postStatus === 'Published' ? (
                <div>
                    <p className="text-text-muted dark:text-gray-400">Posting Time</p>
                    <p className="font-semibold text-text-main dark:text-gray-200">{analysis.metadata.postingTime}</p>
                </div>
            ) : (
                <div>
                    <p className="text-text-muted dark:text-gray-400">Best Time to Post</p>
                    <p className="font-semibold text-text-main dark:text-gray-200">{analysis.metadata.bestTimeToPost}</p>
                </div>
            )}
             <div>
                <p className="text-text-muted dark:text-gray-400">Status</p>
                <p className={`font-semibold ${analysis.metadata.postStatus === 'Published' ? 'text-green-600' : 'text-yellow-600'}`}>{analysis.metadata.postStatus}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 shadow-lg animate-fadeInUp dark:border-gray-700" style={{ animationDelay: '100ms' }}>
          <h3 className="font-bold text-lg mb-4 text-text-main dark:text-gray-50">🚀 Performance Scores</h3>
          <div className="space-y-4">
            {analysis.performanceScores.map(score => <PerformanceScoreBar key={score.name} {...score} />)}
          </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 shadow-lg animate-fadeInUp dark:border-gray-700" style={{ animationDelay: '200ms' }}>
          <h3 className="font-bold text-lg mb-4 text-text-main dark:text-gray-50">📊 Platform Suitability</h3>
          <PlatformChart data={analysis.platformSuitability} />
        </div>
      </div>
    );
};


interface ContentAnalyzerPageProps {
    user: User | null;
}

const ContentAnalyzerPage: React.FC<ContentAnalyzerPageProps> = ({ user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis1, setAnalysis1] = useState<StandaloneContentAnalysis | null>(null);
    const [analysis2, setAnalysis2] = useState<StandaloneContentAnalysis | null>(null);
    const [url1, setUrl1] = useState('');
    const [url2, setUrl2] = useState('');

    const handleAnalyze = async () => {
        if (!url1.trim() && !url2.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysis1(null);
        setAnalysis2(null);

        const promises = [];
        if (url1.trim()) {
            promises.push(analyzeStandaloneContent(url1).then(setAnalysis1));
        }
        if (url2.trim()) {
            promises.push(analyzeStandaloneContent(url2).then(setAnalysis2));
        }

        try {
            await Promise.all(promises);
        } catch (e) {
            setError("Failed to analyze content. The AI may be busy, or the content is unsupported.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setUrl1('');
        setUrl2('');
        setAnalysis1(null);
        setAnalysis2(null);
        setError(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-main dark:text-gray-50 flex items-center gap-3">
                    <ContentAnalyzerIcon className="w-8 h-8 text-primary" />
                    Content Analyzer
                </h1>
                <p className="text-text-muted dark:text-gray-400 mt-1">
                    Welcome, <span className="font-bold text-text-main dark:text-gray-100">{user?.username}</span>! Paste URLs to compare content performance.
                </p>
            </header>

            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 shadow-lg space-y-4 dark:border-gray-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="url1" className="text-sm font-medium text-text-muted dark:text-gray-400">Content URL 1 (e.g., posted video)</label>
                        <input id="url1" type="url" value={url1} onChange={e => setUrl1(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-text-main focus:ring-primary focus:border-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <div>
                        <label htmlFor="url2" className="text-sm font-medium text-text-muted dark:text-gray-400">Content URL 2 (e.g., new video)</label>
                        <input id="url2" type="url" value={url2} onChange={e => setUrl2(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-text-main focus:ring-primary focus:border-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white" placeholder="https://storage.com/draft.mp4" />
                    </div>
                </div>
                <div className="flex gap-4 pt-2">
                    <button onClick={handleClear} className="w-1/3 flex items-center justify-center bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Clear
                    </button>
                    <button onClick={handleAnalyze} disabled={isLoading || (!url1.trim() && !url2.trim())} className="w-2/3 flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                        {isLoading ? 'Analyzing...' : <><SparklesIcon className="w-5 h-5 mr-2" /> Compare & Analyze</>}
                    </button>
                </div>
            </div>
            
            {isLoading && <Loader />}
            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}

            {!isLoading && !error && (analysis1 || analysis2) &&
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {analysis1 ? <AnalysisResult analysis={analysis1} url={url1} /> : <div></div>}
                    {analysis2 ? <AnalysisResult analysis={analysis2} url={url2} /> : <div></div>}
                </div>
            }

            {!isLoading && !error && !analysis1 && !analysis2 &&
                <div className="text-center py-16 px-6 bg-surface-light dark:bg-surface-dark rounded-lg border border-gray-200 shadow-lg dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-text-main dark:text-gray-100">Ready for Analysis</h3>
                    <p className="text-text-muted dark:text-gray-400 mt-2">Enter one or two content URLs above to get started.</p>
                </div>
            }
        </div>
    );
};

export default ContentAnalyzerPage;
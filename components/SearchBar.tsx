"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        console.log("Search initiated with query:", query);
        setLoading(true);
        try {
            console.log("Making API request...");
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.trim() }),
            });
            
            console.log("API response status:", res.status);
            const data = await res.json();
            console.log("API response data:", data);
            
            if (data.error) {
                setResponse(`Error: ${data.error}`);
            } else {
                setResponse(data.response || "Sorry, I couldn't find an answer to that.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setResponse("Sorry, there was an error processing your request.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8 w-full">
            {/* Search Input & Button */}
            <div className="flex items-center w-full bg-white rounded-2xl border border-gray-200 p-2 shadow-lg hover:border-gray-300 transition-all">
                <div className="flex-grow flex items-center px-4">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        className="w-full bg-transparent text-gray-800 text-lg placeholder-gray-400 focus:outline-none"
                        placeholder="Ask anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center shadow-md"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Search'
                    )}
                </button>
            </div>

            {/* Answer Display */}
            {response && (
                <div className="w-full rounded-2xl bg-white border border-gray-200 p-8 shadow-lg animate-fadeIn">
                    <div className="flex items-center mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <h2 className="text-gray-800 font-medium">AI Response</h2>
                    </div>
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                        <ReactMarkdown
                            components={{
                                code(props) {
                                    const {className, children, ...rest} = props;
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                        <SyntaxHighlighter
                                            {...(rest as SyntaxHighlighterProps)}
                                            style={tomorrow}
                                            language={match[1]}
                                            PreTag="div"
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...rest}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {response}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

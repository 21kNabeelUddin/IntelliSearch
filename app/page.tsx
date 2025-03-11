"use client";
import "./globals.css";
import SearchBar from "@components/SearchBar";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#E8E6E3] p-8">
            {/* Title */}
            <div className="text-center mb-12 w-full max-w-4xl">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                    IntelliSearch
                </h1>
                <p className="text-gray-600 text-xl">
                    Powered by TogetherAI
                </p>
                <a 
                    href="https://github.com/21kNabeelUddin/IntelliSearch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 text-lg mt-2 inline-flex items-center gap-2 hover:text-gray-800 transition-colors"
                >
                    <span>Fully Open Sourced</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                </a>
            </div>

            {/* Search Bar Component */}
            <div className="w-full max-w-4xl px-4">
                <SearchBar />
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl px-4">
                <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                    <div className="text-3xl mb-3">🚀</div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-2">Lightning Fast</h3>
                    <p className="text-gray-600">Get instant answers to your questions</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                    <div className="text-3xl mb-3">🤖</div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-2">AI-Powered</h3>
                    <p className="text-gray-600">Advanced AI technology for accurate results</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-200">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-2">Precise Answers</h3>
                    <p className="text-gray-600">Direct and relevant responses every time</p>
                </div>
            </div>

            {/* Footer Divider */}
            <div className="w-full max-w-4xl mt-16 border-t border-gray-300"></div>

            {/* Footer */}
            <footer className="text-gray-500 text-sm mt-8 flex flex-col items-center gap-2">
                <p>Powered by Advanced AI Technology</p>
                <a 
                    href="https://github.com/21kNabeelUddin/IntelliSearch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>Star on GitHub</span>
                </a>
            </footer>
        </main>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, X } from 'lucide-react';

interface IncomingEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  category: string;
  body: string;
}

interface SimilarScenario {
  scenario: string;
  similarity: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    incomingEmail: IncomingEmail;
    suggestedReply: string;
    similarScenarios: SimilarScenario[];
  };
}

interface SuggestedReplyDisplayProps {
  apiResponse: ApiResponse;
  onClose?: () => void;
  autoCloseDuration?: number; // in seconds
}

export default function SuggestedReplyDisplay({ 
  apiResponse, 
  onClose,
  autoCloseDuration = 10 
}: SuggestedReplyDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(autoCloseDuration);

  const { incomingEmail, suggestedReply, similarScenarios } = apiResponse.data;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onClose?.();
            return autoCloseDuration;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, onClose, autoCloseDuration]);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Mail size={24} />
            <h2 className="text-2xl font-bold">Suggested Reply</h2>
          </div>
          <p className="text-sm text-purple-100">
            Auto-closing in {countdown} seconds
          </p>
        </div>

        {/* Email Context */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-semibold text-gray-600 w-24">From:</span>
              <span className="text-gray-800">{incomingEmail.from}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-24">To:</span>
              <span className="text-gray-800">{incomingEmail.to}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-24">Subject:</span>
              <span className="text-gray-800">{incomingEmail.subject}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-24">Date:</span>
              <span className="text-gray-800">
                {new Date(incomingEmail.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-24">Category:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                incomingEmail.category === 'Spam' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {incomingEmail.category}
              </span>
            </div>
          </div>
        </div>

        {/* Reply Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Generated Reply</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {suggestedReply}
            </pre>
          </div>
        </div>

        {/* Similar Scenarios */}
        {similarScenarios && similarScenarios.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Similar Scenarios</h3>
            <div className="space-y-2">
              {similarScenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-gray-700">{scenario.scenario}</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {scenario.similarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / autoCloseDuration) * 100}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
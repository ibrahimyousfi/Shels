'use client';

import { useState, useEffect } from 'react';
import BusinessImpactSection from './IssueItem/BusinessImpactSection';
import ExplainFixSection from './IssueItem/ExplainFixSection';
import SmartFixSection from './IssueItem/SmartFixSection';
import ReasoningChainSection from './IssueItem/ReasoningChainSection';
import ActionButtons from './IssueItem/ActionButtons';
import IssueHeader from './IssueItem/IssueHeader';

interface IssueItemProps {
  issue: any;
  cachedData?: {
    explainFix?: any;
    smartFix?: any;
    reasoningChain?: any;
    businessImpact?: any;
  };
  sessionId?: string;
  onExplainFix: () => Promise<any>;
  onSmartFix: () => Promise<any>;
  onReasoningChain: () => Promise<any>;
}

interface BusinessImpact {
  impactScore?: number;
  priority?: string;
  explanation?: string;
  estimatedCost?: any;
  businessMetrics?: any;
  realWorldExample?: string;
}

export default function IssueItem({ issue, cachedData = {}, sessionId, onExplainFix, onSmartFix, onReasoningChain }: IssueItemProps) {
  const [loading, setLoading] = useState<'explain' | 'smart' | 'reasoning' | null>(null);
  const [businessImpact, setBusinessImpact] = useState<BusinessImpact | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    explain: boolean;
    smart: boolean;
    reasoning: boolean;
  }>({
    explain: false,
    smart: false,
    reasoning: false
  });
  
  // Read directly from cachedData (no local state caching)
  const localData = {
    explainFix: cachedData?.explainFix,
    smartFix: cachedData?.smartFix,
    reasoningChain: cachedData?.reasoningChain
  };
  
  useEffect(() => {
    // Try to load from cachedData first
    if (cachedData?.businessImpact) {
      setBusinessImpact(cachedData.businessImpact);
      return;
    }
    
    // Load business impact on mount
    if (issue && !businessImpact && !loadingImpact) {
      loadBusinessImpact();
    }
  }, [issue, cachedData]);

  const getIssueKey = () => {
    return `${issue.file}-${issue.type}-${issue.severity}-${issue.description.substring(0, 50)}`;
  };

  const loadBusinessImpact = async () => {
    setLoadingImpact(true);
    try {
      const response = await fetch('/api/business-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue })
      });
      const data = await response.json();
      if (data.success && data.impact) {
        setBusinessImpact(data.impact);
        
        // Save to session
        if (sessionId) {
          await saveBusinessImpactToSession(data.impact);
        }
      }
    } catch (error) {
      console.error('Failed to load business impact:', error);
    } finally {
      setLoadingImpact(false);
    }
  };

  const saveBusinessImpactToSession = async (impact: BusinessImpact) => {
    if (!sessionId) return;
    
    try {
      const issueKey = getIssueKey();
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessImpactData: {
            [issueKey]: impact
          }
        })
      });
    } catch (error) {
      console.error('Failed to save business impact to session:', error);
    }
  };

  const handleAction = async (action: 'explain' | 'smart' | 'reasoning', callback: () => Promise<any>) => {
    // If already cached, just expand
    if (action === 'explain' && localData.explainFix) {
      setExpandedSections(prev => ({ ...prev, explain: !prev.explain }));
      return;
    }
    if (action === 'smart' && localData.smartFix) {
      setExpandedSections(prev => ({ ...prev, smart: !prev.smart }));
      return;
    }
    if (action === 'reasoning' && localData.reasoningChain) {
      setExpandedSections(prev => ({ ...prev, reasoning: !prev.reasoning }));
      return;
    }

    // Otherwise, fetch and expand
    setLoading(action);
    try {
      const result = await callback();
      if (result) {
        // Data is saved to session by the callback, just expand the section
        if (action === 'explain') {
          setExpandedSections(prev => ({ ...prev, explain: true }));
        } else if (action === 'smart') {
          setExpandedSections(prev => ({ ...prev, smart: true }));
        } else if (action === 'reasoning') {
          setExpandedSections(prev => ({ ...prev, reasoning: true }));
        }
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border border-[#2f0012] rounded-lg p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <IssueHeader issue={issue} businessImpact={businessImpact || undefined} />
          <BusinessImpactSection businessImpact={businessImpact || undefined} />
        </div>
        <ActionButtons
          loading={loading}
          cachedData={localData}
          onExplainFix={() => handleAction('explain', onExplainFix)}
          onSmartFix={() => handleAction('smart', onSmartFix)}
          onReasoningChain={() => handleAction('reasoning', onReasoningChain)}
        />
      </div>
      
      <ExplainFixSection 
        explainFix={localData.explainFix} 
        isExpanded={expandedSections.explain}
        onClose={() => setExpandedSections(prev => ({ ...prev, explain: false }))}
      />
      <SmartFixSection 
        smartFix={localData.smartFix} 
        isExpanded={expandedSections.smart}
        onClose={() => setExpandedSections(prev => ({ ...prev, smart: false }))}
      />
      <ReasoningChainSection 
        reasoningChain={localData.reasoningChain} 
        isExpanded={expandedSections.reasoning}
        onClose={() => setExpandedSections(prev => ({ ...prev, reasoning: false }))}
      />
    </div>
  );
}

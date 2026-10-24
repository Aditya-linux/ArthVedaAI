import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/sentimentEngine';

// Sample SEC 10-K / 10-Q and Earnings call data for key companies
const COMPANY_REPORTS: Record<string, { company: string; reportType: string; period: string; sections: { title: string; content: string }[] }> = {
    'AAPL': {
        company: 'Apple Inc.',
        reportType: 'SEC Form 10-K (Annual Report)',
        period: 'Fiscal Year 2024-2025',
        sections: [
            {
                title: 'Item 7: Management’s Discussion and Analysis (MD&A)',
                content: `Total net sales increased significantly year-over-year, driven by record revenue in Services and continued resilience in iPhone and Mac shipments across emerging markets. Gross margin expanded by 180 basis points due to favorable services mix and cost savings in supply chain operations.\n\nOperating expenses increased moderately in research and development as the Company accelerated investments in Apple Intelligence and custom silicon architecture. Operating income reached record levels, demonstrating strong operating leverage and operational discipline.\n\nOperating cash flow remained exceptionally robust, allowing the Company to return over $28 billion to shareholders through dividends and share repurchases while maintaining an optimal net-neutral cash position.`
            },
            {
                title: 'Item 1A: Risk Factors & Geopolitical Exposure',
                content: `Global economic uncertainty, persistent inflationary pressures, and currency exchange volatility could adversely impact consumer purchasing power and premium device demand.\n\nConcentration of manufacturing operations and component suppliers in Greater China exposes the Company to supply disruptions, trade restrictions, export controls, and regional regulatory compliance risks.\n\nHeightened regulatory scrutiny in the European Union and the United States regarding digital marketplace fees and interoperability mandates could require structural business modifications and impact Services margins.`
            },
            {
                title: 'Q4 Earnings Call Highlights & Guidance',
                content: `Management expressed strong confidence in the commercial ramp of generative AI features across iPhone, iPad, and Mac platforms, projecting high single-digit revenue growth into the upcoming fiscal quarter.\n\nCustomer satisfaction across enterprise and consumer cohorts continues to exceed 98%, with active installed device base crossing 2.2 billion units globally.\n\nCapital expenditure outlook will expand prudently to support private cloud compute data centers while preserving free cash flow conversion efficiency.`
            }
        ]
    },
    'NVDA': {
        company: 'NVIDIA Corporation',
        reportType: 'SEC Form 10-K (Annual Report)',
        period: 'Fiscal Year 2025',
        sections: [
            {
                title: 'Item 7: Management’s Discussion and Analysis (MD&A)',
                content: `Data Center compute revenue surged by over 140% year-over-year, propelled by exponential enterprise and hyperscale demand for Blackwell and Hopper accelerated computing architectures.\n\nGross margin reached an industry-leading 75.8%, reflecting unprecedented pricing power, high software attach rates via NVIDIA AI Enterprise, and architectural leadership.\n\nCash flow from operations grew more than threefold, funding expanded wafer commitments with foundry partners and strategic investments in networking infrastructure.`
            },
            {
                title: 'Item 1A: Risk Factors & Supply Constraints',
                content: `Severe packaging and high-bandwidth memory (HBM3e) supply bottlenecks may constrain our ability to meet unprecedented market demand, potentially shifting customer deployments to alternative architectures.\n\nStrict US export restrictions on advanced semiconductors to China and Middle Eastern jurisdictions eliminate substantial market addressability and invite sovereign counter-measures.\n\nCustomer concentration remains elevated, with the top four cloud service providers accounting for a large portion of Data Center revenue, increasing vulnerability to capex digestion cycles.`
            },
            {
                title: 'Q4 Earnings Call & Architecture Roadmap',
                content: `CEO highlighted that Blackwell architecture is in full production with demand outstripping supply for several consecutive quarters.\n\nNetworking division revenues tripled, verifying that compute clusters are transitioning to Ethernet-based Spectrum-X infrastructure.\n\nGuidance provided for next quarter indicates sequential growth across all operating segments with sustained profitability.`
            }
        ]
    },
    'TSLA': {
        company: 'Tesla, Inc.',
        reportType: 'SEC Form 10-Q (Quarterly Report)',
        period: 'Q3 2025',
        sections: [
            {
                title: 'Item 7: Management’s Discussion and Analysis (MD&A)',
                content: `Automotive gross margin excluding regulatory credits stabilized, supported by reductions in cost of goods sold per vehicle and increased energy storage deployment volumes.\n\nEnergy storage business reached record deployment megawatt-hours, exhibiting higher gross margin percentage than the core automotive division and accelerating overall operating cash generation.\n\nFree cash flow remained positive despite significant capital allocations towards computing clusters for Full Self-Driving neural network training and Cybercab robotics.`
            },
            {
                title: 'Item 1A: Risk Factors & Regulatory Headwinds',
                content: `Intensifying price competition in key international markets, particularly China and Western Europe, continues to exert downward pressure on average vehicle selling prices and gross margins.\n\nUncertain timelines for autonomous driving regulatory approvals could delay the commercial monetization of unsupervised Full Self-Driving and Robotaxi fleet services.\n\nLitigation risk and investigations by safety regulators concerning driver-assistance features could generate unfavorable publicity and operational restrictions.`
            },
            {
                title: 'Earnings Call: Next-Gen Platform & Energy Scaling',
                content: `Management reaffirmed guidance for vehicle delivery expansion and highlighted the launch of affordable consumer platform variants scheduled for production next year.\n\nMegapack production facility in Shanghai is on track, expected to double total energy storage production capacity by year-end.\n\nSignificant breakthroughs in 4680 battery cell dry cathode production are yielding meaningful cost savings per kilowatt-hour.`
            }
        ]
    },
    'MSFT': {
        company: 'Microsoft Corporation',
        reportType: 'SEC Form 10-K (Annual Report)',
        period: 'Fiscal Year 2025',
        sections: [
            {
                title: 'Item 7: Management’s Discussion and Analysis (MD&A)',
                content: `Microsoft Cloud revenue surpassed $135 billion, up 23% in constant currency, driven by accelerated enterprise adoption of Azure AI and Copilot productivity suites.\n\nProductivity and Business Processes segment delivered steady double-digit growth, underpinned by Office 365 commercial seat expansions and ARPU gains.\n\nOperating margin expanded to 44.6%, reflecting strong top-line scale and cost efficiencies despite heavy infrastructure capital expenditures.`
            },
            {
                title: 'Item 1A: Risk Factors & Infrastructure Scaling',
                content: `Massive capital expenditure commitments in AI data center capacity, specialized GPUs, and power grid interconnects introduce asset utilization risk if enterprise monetization decelerates.\n\nCybersecurity threats and advanced persistent threat intrusions against cloud infrastructure could damage client trust, trigger substantial liabilities, and attract punitive regulatory actions.\n\nAntitrust inquiries in multiple jurisdictions concerning bundled productivity software and cloud licensing practices could restrict competitive distribution strategies.`
            },
            {
                title: 'Earnings Call: Cloud & Generative AI Momentum',
                content: `Azure AI customer count exceeded 60,000 organizations, with over half of the Fortune 500 actively leveraging Azure OpenAI Service APIs.\n\nCommercial bookings growth surged 19%, demonstrating long-term customer commitment to Microsoft's end-to-end tech stack.\n\nManagement reiterated capital expenditure discipline while continuing to invest aggressively in next-generation GPU clusters.`
            }
        ]
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'AAPL').toUpperCase();

    const reportData = COMPANY_REPORTS[symbol] || COMPANY_REPORTS['AAPL'];

    try {
        // Attempt to call the local FinBERT microservice /analyze-report endpoint
        const finbertResp = await fetch('http://localhost:8000/analyze-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company: reportData.company,
                symbol,
                report_type: reportData.reportType,
                sections: reportData.sections
            }),
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });

        if (finbertResp.ok) {
            const analyzed = await finbertResp.json();
            return NextResponse.json({
                ...analyzed,
                period: reportData.period,
                source: 'FinBERT Microservice (ProsusAI/finbert)'
            });
        }
    } catch {
        // Fallback to local financial NLP tokenizer if microservice is offline
    }

    // Local Fallback NLP Engine for Reports
    let totalBullish = 0;
    let totalBearish = 0;

    const sectionsAnalyzed = reportData.sections.map(sec => {
        const paragraphs = sec.content.split('\n\n').filter(p => p.trim().length > 0);
        const paraResults = paragraphs.map(p => {
            const s = analyzeSentiment(p);
            if (s.label === 'Bullish') totalBullish++;
            if (s.label === 'Bearish') totalBearish++;
            return {
                label: s.label,
                score: s.score,
                text_snippet: p.slice(0, 120) + '...'
            };
        });

        const secBullish = paraResults.filter(p => p.label === 'Bullish').length;
        const secBearish = paraResults.filter(p => p.label === 'Bearish').length;
        const secTotal = Math.max(paraResults.length, 1);
        const secScore = (secBullish - secBearish) / secTotal;

        return {
            section_title: sec.title,
            paragraphs_analyzed: paraResults.length,
            section_sentiment: secScore > 0.1 ? 'Bullish' : (secScore < -0.1 ? 'Bearish' : 'Neutral'),
            sentiment_score: parseFloat(secScore.toFixed(3)),
            paragraph_breakdown: paraResults,
            content: sec.content
        };
    });

    const grandTotal = Math.max(totalBullish + totalBearish, 1);
    const compositeIndex = (totalBullish - totalBearish) / grandTotal;
    const riskScore = Math.min(100, Math.max(0, (totalBearish / grandTotal) * 100));

    return NextResponse.json({
        company: reportData.company,
        symbol,
        report_type: reportData.reportType,
        period: reportData.period,
        overall_health: compositeIndex > 0.2 ? 'Robust / Positive' : (compositeIndex < -0.1 ? 'Cautionary / Risk Elevated' : 'Stable / Moderate'),
        composite_score: parseFloat(compositeIndex.toFixed(3)),
        financial_risk_index: parseFloat(riskScore.toFixed(1)),
        sections: sectionsAnalyzed,
        source: 'ArthVeda Financial NLP Engine (Fallback / Edge)'
    });
}

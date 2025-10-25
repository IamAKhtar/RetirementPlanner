import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initialInputs = {
  currentAge: 35,
  retirementAge: 48,
  expensesUntilAge: 85,
  currentSavings: 3500000,
  monthlyInvestment: 70000,
  stepUpRate: 0.05,
  postRetirementMonthlyExpense: 90000,
  inflationRate: 0.05,
  preRetirementReturn: 9.5,
  postRetirementReturn: 8.5
};

function calculateRetirement(inputs) {
  const {
    currentAge,
    retirementAge,
    expensesUntilAge,
    currentSavings,
    monthlyInvestment,
    stepUpRate,
    postRetirementMonthlyExpense,
    inflationRate,
    preRetirementReturn,
    postRetirementReturn
  } = inputs;
  
  const yearsToWork = retirementAge - currentAge;
  const yearsAfterRetirement = expensesUntilAge - retirementAge;

  const preReturnRate = preRetirementReturn / 100;
  const postReturnRate = postRetirementReturn / 100;

  let savings = currentSavings;
  let investmentContribution = monthlyInvestment * 12;
  let stepUpFactor = 1;

  let yearlyData = [];
  let chartData = [];

  for (let i = 0; i <= yearsToWork; i++) {
    const age = currentAge + i;
    const startingSavings = savings;
    
    if (i > 0) {
      stepUpFactor *= (1 + stepUpRate);
      investmentContribution = monthlyInvestment * 12 * stepUpFactor;
    }
    
    savings = savings * (1 + preReturnRate) + investmentContribution;
    const endingSavings = savings;
    
    yearlyData.push({
      age,
      startingSavings: Math.round(startingSavings),
      plannedExpenses: 0,
      additionalSavings: Math.round(investmentContribution),
      endingSavings: Math.round(endingSavings),
      status: 'Earning',
      warning: '',
      monthly: 0
    });
    
    chartData.push({ age, savings: Math.round(savings) });
  }

  let corpus = savings;
  let annualExpense = postRetirementMonthlyExpense * 12;
  let expenseData = [];
  let moneyRunsOutAge = null;
  let finalCorpus = 0;
  
  for (let i = 1; i <= yearsAfterRetirement; i++) {
    const age = retirementAge + i;
    const startingCorpus = corpus;
    annualExpense *= (1 + inflationRate);
    const monthlyExpense = Math.round(annualExpense / 12);
    
    corpus = corpus * (1 + postReturnRate) - annualExpense;
    
    let warning = '';
    if (corpus < annualExpense * 5 && corpus > 0) {
      warning = Math.round(corpus / annualExpense).toFixed(1);
    }
    
    const status = corpus <= 0 ? 'Dead' : 'Retired';
    
    if (corpus <= 0 && moneyRunsOutAge === null) {
      moneyRunsOutAge = age;
    }
    
    yearlyData.push({
      age,
      startingSavings: Math.round(startingCorpus),
      plannedExpenses: Math.round(annualExpense),
      additionalSavings: 0,
      endingSavings: Math.round(corpus > 0 ? corpus : 0),
      status,
      warning,
      monthly: monthlyExpense
    });
    
    expenseData.push({ 
      age, 
      remainingCorpus: Math.round(corpus > 0 ? corpus : 0), 
      annualExpense: Math.round(annualExpense) 
    });
    
    if (corpus > 0) {
      finalCorpus = corpus;
    }
    
    if (corpus <= 0) break;
  }

  const fundsLastUntilPlannedAge = moneyRunsOutAge === null || moneyRunsOutAge >= expensesUntilAge;
  
  return { 
    accumulation: chartData, 
    exhaustion: expenseData, 
    yearlyData,
    fundsLastUntilPlannedAge,
    moneyRunsOutAge,
    expensesUntilAge,
    finalCorpus: Math.round(finalCorpus)
  };
}

function formatINR(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(value);
}

function formatIndianNumber(value) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(value);
}

function formatYAxis(value) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(0)}L`;
  }
  return value.toString();
}

function formatTooltipValue(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${formatINR(value)}`;
}

function formatCorpusDisplay(value) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(1)} L`;
  }
  return formatINR(value);
}

export default function Home() {
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(calculateRetirement(initialInputs));
  const [showTable, setShowTable] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    const numValue = parseFloat(value.replace(/,/g, '')) || 0;
    setInputs(prev => ({ ...prev, [name]: numValue }));
  }

  function recalculate() {
    setResults(calculateRetirement(inputs));
  }

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    marginTop: '8px',
    border: '2px solid #cbd5e0',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    background: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    outline: 'none',
    color: '#1a202c'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: '0.3px',
    position: 'relative'
  };

  const InfoIcon = ({ tooltipId, tooltipText }) => {
    const isActive = activeTooltip === tooltipId;
    
    return (
      <span 
        style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}
        onMouseEnter={() => setActiveTooltip(tooltipId)}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        <span 
          style={{ 
            cursor: 'help', 
            fontSize: '16px', 
            color: isActive ? '#3182ce' : '#718096',
            transition: 'color 0.2s ease',
            userSelect: 'none',
            display: 'inline-block'
          }}
        >
          ℹ️
        </span>
        {isActive && (
          <span 
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              background: '#1a202c',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              zIndex: 10000,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              width: '280px',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '1.6',
              pointerEvents: 'none'
            }}
          >
            {tooltipText}
            <span style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #1a202c'
            }}></span>
          </span>
        )}
      </span>
    );
  };

  const faqs = [
    {
      question: "What is the Annual Step-up percentage?",
      answer: "Annual Step-up is the percentage by which you increase your monthly investment each year. For example, if you invest ₹10,000/month with a 10% step-up, next year you'll invest ₹11,000/month. This accounts for salary increments and helps build a larger retirement corpus."
    },
    {
      question: "What do Pre & Post Retirement Returns mean?",
      answer: "Pre-Retirement Return is the expected annual return on your investments while you're working (typically 9.5% for balanced portfolios). Post-Retirement Return is the expected return after retirement (typically 8.5%, more conservative). You can adjust these based on your investment strategy."
    },
    {
      question: "Should I include EPF/PPF in Monthly Investment?",
      answer: "Yes! Include all retirement savings: EPF/PPF contributions, SIPs, NPS, recurring deposits, and any other regular investments. This gives you a complete picture of your retirement readiness."
    },
    {
      question: "How accurate is the inflation rate of 5%?",
      answer: "India's inflation has averaged 4-6% over the past decade. The default 5% is a reasonable middle estimate. You can adjust this based on your expectations. Higher inflation means you'll need more savings for the same lifestyle."
    },
    {
      question: "What if my money runs out before my planned age?",
      answer: "If the calculator shows insufficient funds, you have three options: (1) Increase your monthly investments, (2) Reduce your expected monthly expenses after retirement, or (3) Plan to retire later. Small adjustments now can make a big difference!"
    }
  ];

  return (
    <main 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div style={{ maxWidth: 1400, margin: 'auto' }}>
        {/* Header */}
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '44px',
          fontWeight: '900',
          color: '#1a202c',
          marginBottom: '40px',
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <span style={{ fontSize: '44px' }}>⏰</span>
          Retirement Calculator
        </h1>
        
        {/* Input Section */}
        <section style={{ 
          background: '#ffffff',
          padding: '35px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
          border: '2px solid #e2e8f0'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 28, 
            fontSize: 24,
            fontWeight: '800',
            color: '#1a202c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '0.5px'
          }}>
            <span style={{ fontSize: '28px' }}>💼</span> Your Inputs
          </h2>
          
          {/* First Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span> Current Age
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="currentAge" 
                value={inputs.currentAge} 
                min={1} 
                max={120} 
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3182ce';
                  e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e0';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                }}
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏖️</span> Retirement Age
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="retirementAge" 
                value={inputs.retirementAge} 
                min={inputs.currentAge + 1} 
                max={120} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎯</span> Life Expectancy
                <InfoIcon 
                  tooltipId="lifeExpectancy" 
                  tooltipText="The age until which you want to plan your retirement expenses. Average life expectancy in India is 70-75 years."
                />
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="expensesUntilAge" 
                value={inputs.expensesUntilAge} 
                min={inputs.retirementAge + 1} 
                max={120} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💰</span> Current Savings (₹)
                <InfoIcon 
                  tooltipId="currentSavings" 
                  tooltipText="Total value of all your current savings and investments including EPF, PPF, Mutual Funds, Fixed Deposits, Stocks, Gold, and any other assets."
                />
              </span>
              <input 
                style={inputStyle} 
                type="text" 
                name="currentSavings" 
                value={formatIndianNumber(inputs.currentSavings)}
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
          </div>

          {/* Second Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 25 }}>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💵</span> Monthly Investment (₹)
                <InfoIcon 
                  tooltipId="monthlyInvestment" 
                  tooltipText="Total amount you invest every month towards retirement. Include all sources like SIP (Mutual Funds), EPF/PPF, NPS, recurring deposits, gold accumulation, etc."
                />
              </span>
              <input 
                style={inputStyle} 
                type="text" 
                name="monthlyInvestment" 
                value={formatIndianNumber(inputs.monthlyInvestment)}
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📈</span> Annual Step-up (%)
                <InfoIcon 
                  tooltipId="stepUpRate" 
                  tooltipText="Percentage increase in your monthly investment each year. For example, 5% means if you invest ₹10,000/month this year, you'll invest ₹10,500 next year. This helps keep pace with salary increments."
                />
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="stepUpRate" 
                value={inputs.stepUpRate * 100} 
                min={0} 
                max={50} 
                step={0.1} 
                onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏠</span> Monthly Expense
                <InfoIcon 
                  tooltipId="monthlyExpense" 
                  tooltipText="Your estimated monthly living expenses after retirement in today's value (will be adjusted for inflation automatically)."
                />
              </span>
              <input 
                style={inputStyle} 
                type="text" 
                name="postRetirementMonthlyExpense" 
                value={formatIndianNumber(inputs.postRetirementMonthlyExpense)}
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📊</span> Inflation Rate (%)
                <InfoIcon 
                  tooltipId="inflation" 
                  tooltipText="Average annual inflation rate. In India, it typically ranges between 4-6%. Default is 5%."
                />
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="inflationRate" 
                value={inputs.inflationRate * 100} 
                min={0} 
                max={100} 
                step={0.1} 
                onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
          </div>

          {/* Third Row - Return Rates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 25 }}>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📈</span> Pre-Retirement Return (%)
                <InfoIcon 
                  tooltipId="preReturnRate" 
                  tooltipText="Expected annual return on your investments while working. Based on your investment strategy. Default: 9.5% (balanced portfolio)."
                />
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="preRetirementReturn" 
                value={inputs.preRetirementReturn} 
                min={0} 
                max={30} 
                step={0.1} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📉</span> Post-Retirement Return (%)
                <InfoIcon 
                  tooltipId="postReturnRate" 
                  tooltipText="Expected annual return on your investments after retirement. Usually lower and more conservative. Default: 8.5%."
                />
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="postRetirementReturn" 
                value={inputs.postRetirementReturn} 
                min={0} 
                max={30} 
                step={0.1} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
          </div>

          {/* Calculate Button */}
          <button 
            onClick={recalculate}
            style={{ 
              width: '100%',
              padding: '18px 20px', 
              background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              cursor: 'pointer', 
              fontSize: 17, 
              fontWeight: '800',
              boxShadow: '0 6px 16px rgba(49, 130, 206, 0.4)',
              transition: 'all 0.3s ease',
              letterSpacing: '1px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(49, 130, 206, 0.5)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 16px rgba(49, 130, 206, 0.4)';
            }}
          >
            Calculate Retirement Plan
          </button>
        </section>

        {/* Status Banner */}
        <section style={{ 
          background: results.fundsLastUntilPlannedAge 
            ? 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)' 
            : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
          borderRadius: '16px',
          padding: '26px 32px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: results.fundsLastUntilPlannedAge
            ? '0 6px 16px rgba(56, 161, 105, 0.35)'
            : '0 6px 16px rgba(229, 62, 62, 0.35)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ 
            fontSize: 22, 
            fontWeight: '900', 
            marginBottom: 12,
            letterSpacing: '0.5px'
          }}>
            {results.fundsLastUntilPlannedAge ? '✓ Your Retirement Plan is Secure!' : '⚠ Warning: Insufficient Funds'}
          </div>
          <div style={{ 
            fontSize: 16,
            fontWeight: '600',
            lineHeight: '1.6'
          }}>
            {results.fundsLastUntilPlannedAge 
              ? (
                <>
                  Your savings will last until age {results.expensesUntilAge}.
                  <br />
                  <strong style={{ fontSize: '18px' }}>Estimated Inheritance: ₹{formatCorpusDisplay(results.finalCorpus)}</strong>
                </>
              )
              : (
                <>
                  Funds will run out at age {results.moneyRunsOutAge}.
                  <br />
                  <strong>Increase savings or reduce expenses to reach age {results.expensesUntilAge}.</strong>
                </>
              )
            }
          </div>
        </section>

        {/* Charts Section */}
        <section style={{ marginBottom: 40 }}>
          {/* Post-Retirement Corpus Chart */}
          <div style={{ 
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
            marginBottom: 30,
            border: '2px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 22, fontWeight: '900', color: '#1a202c', letterSpacing: '0.5px' }}>📉 Post-Retirement Corpus</h2>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={results.exhaustion} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="age" 
                  stroke="#4a5568" 
                  style={{ fontWeight: '600' }}
                  label={{ value: 'Age', position: 'bottom', offset: 10, style: { fontWeight: '700', fill: '#1a202c' } }}
                />
                <YAxis tickFormatter={formatYAxis} stroke="#4a5568" style={{ fontWeight: '600' }} />
                <Tooltip formatter={formatTooltipValue} contentStyle={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: '700' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontWeight: '700', paddingBottom: '20px' }} 
                />
                <Line type="monotone" dataKey="remainingCorpus" stroke="#e53e3e" strokeWidth={3} activeDot={{ r: 8 }} name="Remaining Corpus" />
                <Line type="monotone" dataKey="annualExpense" stroke="#dd6b20" strokeWidth={3} name="Annual Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Projected Savings Growth Chart */}
          <div style={{ 
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
            marginBottom: 30,
            border: '2px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 22, fontWeight: '900', color: '#1a202c', letterSpacing: '0.5px' }}>📈 Projected Savings Growth</h2>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={results.accumulation} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="age" 
                  stroke="#4a5568" 
                  style={{ fontWeight: '600' }}
                  label={{ value: 'Age', position: 'bottom', offset: 10, style: { fontWeight: '700', fill: '#1a202c' } }}
                />
                <YAxis tickFormatter={formatYAxis} stroke="#4a5568" style={{ fontWeight: '600' }} />
                <Tooltip formatter={formatTooltipValue} contentStyle={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: '700' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontWeight: '700', paddingBottom: '20px' }} 
                />
                <Line type="monotone" dataKey="savings" stroke="#3182ce" strokeWidth={3} activeDot={{ r: 8 }} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Toggle Button */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <button 
            onClick={() => setShowTable(!showTable)} 
            style={{ 
              padding: '14px 36px',
              background: '#ffffff',
              color: '#1a202c', 
              border: '2px solid #cbd5e0', 
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: '800',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px'
            }}
            onMouseOver={e => {
              e.target.style.borderColor = '#a0aec0';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.target.style.borderColor = '#cbd5e0';
              e.target.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {showTable ? '👁️ Hide' : '👁️ Show'} Detailed Year-by-Year Table
          </button>
        </div>

        {/* Table */}
        {showTable && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ 
              marginBottom: 22, 
              color: '#1a202c',
              fontSize: 26,
              fontWeight: '900',
              letterSpacing: '0.5px'
            }}>📊 Detailed Year-by-Year Breakdown</h2>
            <div style={{ 
              maxHeight: '600px', 
              overflowY: 'auto', 
              overflowX: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
              border: '2px solid #e2e8f0'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: 14, 
                backgroundColor: 'transparent'
              }}>
                <thead style={{ 
                  position: 'sticky', 
                  top: 0, 
                  zIndex: 10
                }}>
                  <tr style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', color: 'white' }}>
                    <th style={{ padding: '16px 14px', textAlign: 'left', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Age</th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>
                      Opening Balance
                      <InfoIcon 
                        tooltipId="openingBalance" 
                        tooltipText="Starting savings balance for this year"
                      />
                    </th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>
                      Expenses
                      <InfoIcon 
                        tooltipId="expensesCol" 
                        tooltipText="Annual living expenses (adjusted for inflation)"
                      />
                    </th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>
                      Contribution
                      <InfoIcon 
                        tooltipId="contribution" 
                        tooltipText="Amount added via new savings/investment"
                      />
                    </th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>
                      Closing Balance
                      <InfoIcon 
                        tooltipId="closingBalance" 
                        tooltipText="Final savings balance for this year"
                      />
                    </th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>
                      Years Left
                      <InfoIcon 
                        tooltipId="yearsLeft" 
                        tooltipText="Approx. years until funds run out"
                      />
                    </th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyData.map((row, idx) => {
                    const isRetired = row.status === 'Retired';
                    const isDead = row.status === 'Dead';
                    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f7fafc';
                    const highlightColor = (idx % 5 === 0 && idx > 0) ? '#fffbeb' : bgColor;
                    
                    return (
                      <tr key={idx} style={{ backgroundColor: highlightColor, transition: 'background-color 0.2s ease' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#edf2f7'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = highlightColor}
                      >
                        <td style={{ padding: '13px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: '800', color: '#1a202c', fontSize: '14px' }}>{row.age}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600', fontSize: '14px' }}>{formatINR(row.startingSavings)}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600', fontSize: '14px' }}>{formatINR(row.plannedExpenses)}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600', fontSize: '14px' }}>{formatINR(row.additionalSavings)}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: '800', color: isRetired ? '#e53e3e' : '#3182ce', fontSize: '14px' }}>{formatINR(row.endingSavings)}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: '800', color: isDead ? '#e53e3e' : isRetired ? '#dd6b20' : '#38a169', fontSize: '14px' }}>{row.status}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#e53e3e', fontWeight: '800', fontSize: '14px' }}>{row.warning}</td>
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600', fontSize: '14px' }}>{formatINR(row.monthly)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section style={{ 
          background: '#ffffff',
          padding: '35px',
          borderRadius: '16px',
          marginTop: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
          border: '2px solid #e2e8f0'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 28, 
            fontSize: 26,
            fontWeight: '900',
            color: '#1a202c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            letterSpacing: '0.5px'
          }}>
            <span style={{ fontSize: '28px' }}>❓</span> Frequently Asked Questions
          </h2>
          
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              style={{
                borderBottom: idx < faqs.length - 1 ? '1px solid #e2e8f0' : 'none',
                paddingBottom: '20px',
                marginBottom: '20px'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '12px 0'
                }}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1a202c',
                  flex: 1
                }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: '24px',
                  color: '#3182ce',
                  marginLeft: '16px',
                  transition: 'transform 0.3s ease',
                  transform: expandedFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
              {expandedFaq === idx && (
                <div style={{
                  padding: '16px 0',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#4a5568'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

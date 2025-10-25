import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initialInputs = {
  currentAge: 34,
  retirementAge: 40,
  expensesUntilAge: 85,
  currentSavings: 13000000,
  monthlyInvestment: 180000,
  stepUpRate: 0.1,
  postRetirementMonthlyExpense: 90000,
  inflationRate: 0.05  // Changed from 0.06 to 0.05 (5%)
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
    inflationRate
  } = inputs;

  const yearsToWork = retirementAge - currentAge;
  const yearsAfterRetirement = expensesUntilAge - retirementAge;

  const preRetirementReturn = 0.095;
  const postRetirementReturn = 0.085;

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

    savings = savings * (1 + preRetirementReturn) + investmentContribution;
    const endingSavings = savings;

    yearlyData.push({
      age,
      startingSavings: Math.round(startingSavings),
      plannedExpenses: 0,
      additionalExpenses: 0,
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

  for (let i = 1; i <= yearsAfterRetirement; i++) {
    const age = retirementAge + i;
    const startingCorpus = corpus;
    annualExpense *= (1 + inflationRate);
    const monthlyExpense = Math.round(annualExpense / 12);

    corpus = corpus * (1 + postRetirementReturn) - annualExpense;

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
      additionalExpenses: 0,
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

    if (corpus <= 0) break;
  }

  const fundsLastUntilPlannedAge = moneyRunsOutAge === null || moneyRunsOutAge >= expensesUntilAge;

  return { 
    accumulation: chartData, 
    exhaustion: expenseData, 
    yearlyData,
    fundsLastUntilPlannedAge,
    moneyRunsOutAge,
    expensesUntilAge
  };
}

function formatINR(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(value);
}

// Format currency for Y-axis in Lakhs and Crores
function formatYAxis(value) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(0)}L`;
  }
  return value.toString();
}

// Format tooltip values
function formatTooltipValue(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${formatINR(value)}`;
}

export default function Home() {
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(calculateRetirement(initialInputs));
  const [showTable, setShowTable] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  }

  function recalculate() {
    setResults(calculateRetirement(inputs));
  }

  function toggleTooltip(tooltipId) {
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId);
  }

  function closeTooltip() {
    setActiveTooltip(null);
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

  const tooltipStyle = {
    position: 'absolute',
    top: '-80px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a202c',
    color: 'white',
    padding: '12px 16px',
    paddingRight: '32px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '500',
    zIndex: 1000,
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
    maxWidth: '320px',
    minWidth: '280px',
    whiteSpace: 'normal',
    textAlign: 'left',
    lineHeight: '1.5'
  };

  const tooltipArrowStyle = {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid #1a202c'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    lineHeight: '1'
  };

  const InfoIcon = ({ tooltipId }) => (
    <span 
      style={{ 
        cursor: 'pointer', 
        fontSize: '16px', 
        color: activeTooltip === tooltipId ? '#3182ce' : '#718096',
        marginLeft: '4px',
        transition: 'color 0.2s ease'
      }}
      onClick={() => toggleTooltip(tooltipId)}
    >
      ℹ️
    </span>
  );

  return (
    <main style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: 1400, margin: 'auto' }}>
        {/* Header with Clock Icon */}
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
            <label style={{...labelStyle, position: 'relative'}}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎯</span> Life Expectancy
                <InfoIcon tooltipId="lifeExpectancy" />
              </span>
              {activeTooltip === 'lifeExpectancy' && (
                <div style={tooltipStyle}>
                  <button style={closeButtonStyle} onClick={closeTooltip}>×</button>
                  The age until which you want to plan your retirement expenses. Average life expectancy in India is 70-75 years.
                  <div style={tooltipArrowStyle}></div>
                </div>
              )}
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
              </span>
              <input 
                style={inputStyle} 
                type="number" 
                name="currentSavings" 
                value={inputs.currentSavings} 
                min={0} 
                step={100000} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
          </div>

          {/* Second Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 25 }}>
            <label style={{...labelStyle, position: 'relative'}}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💵</span> Monthly Investment (₹)
                <InfoIcon tooltipId="monthlyInvestment" />
              </span>
              {activeTooltip === 'monthlyInvestment' && (
                <div style={tooltipStyle}>
                  <button style={closeButtonStyle} onClick={closeTooltip}>×</button>
                  Total amount you invest every month towards retirement. Include all sources like SIP (Mutual Funds), EPF/PPF, NPS, recurring deposits, gold accumulation, etc.
                  <div style={tooltipArrowStyle}></div>
                </div>
              )}
              <input 
                style={inputStyle} 
                type="number" 
                name="monthlyInvestment" 
                value={inputs.monthlyInvestment} 
                min={0} 
                step={1000} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📈</span> Annual Step-up (%)
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
            <label style={{...labelStyle, position: 'relative'}}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏠</span> Monthly Expense
                <InfoIcon tooltipId="monthlyExpense" />
              </span>
              {activeTooltip === 'monthlyExpense' && (
                <div style={tooltipStyle}>
                  <button style={closeButtonStyle} onClick={closeTooltip}>×</button>
                  Your estimated monthly living expenses after retirement in today's value (will be adjusted for inflation automatically).
                  <div style={tooltipArrowStyle}></div>
                </div>
              )}
              <input 
                style={inputStyle} 
                type="number" 
                name="postRetirementMonthlyExpense" 
                value={inputs.postRetirementMonthlyExpense} 
                min={0} 
                step={1000} 
                onChange={handleChange} 
                onFocus={(e) => { e.target.style.borderColor = '#3182ce'; e.target.style.boxShadow = '0 0 0 4px rgba(49, 130, 206, 0.15)'; }} 
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'; }} 
              />
            </label>
            <label style={{...labelStyle, position: 'relative'}}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📊</span> Inflation Rate (%)
                <InfoIcon tooltipId="inflation" />
              </span>
              {activeTooltip === 'inflation' && (
                <div style={tooltipStyle}>
                  <button style={closeButtonStyle} onClick={closeTooltip}>×</button>
                  Average annual inflation rate. In India, it typically ranges between 4-6%. Default is 5%.
                  <div style={tooltipArrowStyle}></div>
                </div>
              )}
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
              ? `Your savings will last until age ${results.expensesUntilAge} as planned. You're on track!`
              : `Your funds will run out at age ${results.moneyRunsOutAge}. You need to increase savings or reduce expenses to reach age ${results.expensesUntilAge}.`
            }
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
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Starting Saving</th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Planned Expenses</th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Additional Expenses</th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Additional Savings</th>
                    <th style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Ending Savings</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '800', fontSize: '13px', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', letterSpacing: '0.5px' }}>Warning</th>
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
                        <td style={{ padding: '13px 14px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#2d3748', fontWeight: '600', fontSize: '14px' }}>{row.additionalExpenses > 0 ? formatINR(row.additionalExpenses) : '-'}</td>
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

        {/* Charts */}
        <section style={{ marginTop: 40 }}>
          <div style={{ 
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
            marginBottom: 30,
            border: '2px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 22, fontWeight: '900', color: '#1a202c', letterSpacing: '0.5px' }}>📈 Projected Savings Growth</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.accumulation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#4a5568" style={{ fontWeight: '600' }} />
                <YAxis tickFormatter={formatYAxis} stroke="#4a5568" style={{ fontWeight: '600' }} />
                <Tooltip formatter={formatTooltipValue} contentStyle={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: '700' }} />
                <Legend wrapperStyle={{ fontWeight: '700' }} />
                <Line type="monotone" dataKey="savings" stroke="#3182ce" strokeWidth={3} activeDot={{ r: 8 }} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ 
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.05)',
            border: '2px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 22, fontWeight: '900', color: '#1a202c', letterSpacing: '0.5px' }}>📉 Post-Retirement Corpus</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.exhaustion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#4a5568" style={{ fontWeight: '600' }} />
                <YAxis tickFormatter={formatYAxis} stroke="#4a5568" style={{ fontWeight: '600' }} />
                <Tooltip formatter={formatTooltipValue} contentStyle={{ background: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: '700' }} />
                <Legend wrapperStyle={{ fontWeight: '700' }} />
                <Line type="monotone" dataKey="remainingCorpus" stroke="#e53e3e" strokeWidth={3} activeDot={{ r: 8 }} name="Remaining Corpus" />
                <Line type="monotone" dataKey="annualExpense" stroke="#dd6b20" strokeWidth={3} name="Annual Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </main>
  );
}

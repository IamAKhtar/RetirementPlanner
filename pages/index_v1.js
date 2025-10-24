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
  inflationRate: 0.06
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

export default function Home() {
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(calculateRetirement(initialInputs));
  const [showTable, setShowTable] = useState(true);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  }

  function recalculate() {
    setResults(calculateRetirement(inputs));
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    marginTop: '8px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    outline: 'none',
    color: '#1a202c'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748',
    letterSpacing: '0.3px'
  };

  return (
    <main style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: 1400, margin: 'auto' }}>
        {/* Header */}
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '42px',
          fontWeight: '800',
          color: '#1a202c',
          marginBottom: '40px',
          letterSpacing: '-1px'
        }}>
          Retirement Planner
        </h1>

        {/* Input Section */}
        <section style={{ 
          background: '#ffffff',
          padding: '35px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 25, 
            fontSize: 22,
            fontWeight: '700',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>💼</span> Your Inputs
          </h2>

          {/* First Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
            <label style={labelStyle}>
              Current Age
              <input 
                style={inputStyle} 
                type="number" 
                name="currentAge" 
                value={inputs.currentAge} 
                min={18} 
                max={100} 
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4299e1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                }}
              />
            </label>
            <label style={labelStyle}>
              Retirement Age
              <input style={inputStyle} type="number" name="retirementAge" value={inputs.retirementAge} min={18} max={100} onChange={handleChange} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
            <label style={labelStyle}>
              Expenses Planned Until Age
              <input style={inputStyle} type="number" name="expensesUntilAge" value={inputs.expensesUntilAge} min={inputs.retirementAge + 1} max={120} onChange={handleChange} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
            <label style={labelStyle}>
              Current Savings (₹)
              <input style={inputStyle} type="number" name="currentSavings" value={inputs.currentSavings} min={0} step={100000} onChange={handleChange} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
          </div>

          {/* Second Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 25 }}>
            <label style={labelStyle}>
              Monthly Investment (₹)
              <input style={inputStyle} type="number" name="monthlyInvestment" value={inputs.monthlyInvestment} min={0} step={1000} onChange={handleChange} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
            <label style={labelStyle}>
              Step-up Every Year (%)
              <input style={inputStyle} type="number" name="stepUpRate" value={inputs.stepUpRate * 100} min={0} max={50} step={0.1} onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
            <label style={labelStyle}>
              Post-Retirement Monthly Expense (₹)
              <input style={inputStyle} type="number" name="postRetirementMonthlyExpense" value={inputs.postRetirementMonthlyExpense} min={0} step={1000} onChange={handleChange} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
            <label style={labelStyle}>
              Inflation Rate (%)
              <input style={inputStyle} type="number" name="inflationRate" value={inputs.inflationRate * 100} min={0} max={20} step={0.1} onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} onFocus={(e) => { e.target.style.borderColor = '#4299e1'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }} />
            </label>
          </div>

          {/* Calculate Button */}
          <button 
            onClick={recalculate}
            style={{ 
              width: '100%',
              padding: '16px 20px', 
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              cursor: 'pointer', 
              fontSize: 16, 
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(66, 153, 225, 0.4)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(66, 153, 225, 0.5)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(66, 153, 225, 0.4)';
            }}
          >
            Calculate Retirement Plan
          </button>
        </section>

        {/* Status Banner */}
        <section style={{ 
          background: results.fundsLastUntilPlannedAge 
            ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
            : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: results.fundsLastUntilPlannedAge
            ? '0 4px 14px rgba(72, 187, 120, 0.3)'
            : '0 4px 14px rgba(245, 101, 101, 0.3)',
          color: 'white'
        }}>
          <div style={{ 
            fontSize: 20, 
            fontWeight: '800', 
            marginBottom: 10,
            letterSpacing: '0.3px'
          }}>
            {results.fundsLastUntilPlannedAge ? '✓ Your Retirement Plan is Secure!' : '⚠ Warning: Insufficient Funds'}
          </div>
          <div style={{ 
            fontSize: 15,
            fontWeight: '500',
            opacity: 0.95
          }}>
            {results.fundsLastUntilPlannedAge 
              ? `Your savings will last until age ${results.expensesUntilAge} as planned. You're on track!`
              : `Your funds will run out at age ${results.moneyRunsOutAge}. You need to increase savings or reduce expenses to reach age ${results.expensesUntilAge}.`
            }
          </div>
        </section>

        {/* Toggle Button */}
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <button 
            onClick={() => setShowTable(!showTable)} 
            style={{ 
              padding: '12px 32px',
              background: '#ffffff',
              color: '#2d3748', 
              border: '2px solid #e2e8f0', 
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.target.style.borderColor = '#cbd5e0';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={e => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            {showTable ? '👁️ Hide' : '👁️ Show'} Detailed Year-by-Year Table
          </button>
        </div>

        {/* Table */}
        {showTable && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ 
              marginBottom: 20, 
              color: '#1a202c',
              fontSize: 24,
              fontWeight: '700'
            }}>📊 Detailed Year-by-Year Breakdown</h2>
            <div style={{ 
              maxHeight: '600px', 
              overflowY: 'auto', 
              overflowX: 'auto',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
              border: '1px solid #e2e8f0'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: 13, 
                backgroundColor: 'transparent'
              }}>
                <thead style={{ 
                  position: 'sticky', 
                  top: 0, 
                  zIndex: 10
                }}>
                  <tr style={{ background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', color: 'white' }}>
                    <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Age</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Starting Saving</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Planned Expenses</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Additional Expenses</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Additional Savings</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Ending Savings</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Status</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Warning</th>
                    <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>Monthly</th>
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
                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#1a202c' }}>{row.age}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#4a5568' }}>{formatINR(row.startingSavings)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#4a5568' }}>{formatINR(row.plannedExpenses)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#4a5568' }}>{row.additionalExpenses > 0 ? formatINR(row.additionalExpenses) : '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#4a5568' }}>{formatINR(row.additionalSavings)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: '700', color: isRetired ? '#e53e3e' : '#3182ce' }}>{formatINR(row.endingSavings)}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: '700', color: isDead ? '#e53e3e' : isRetired ? '#dd6b20' : '#38a169' }}>{row.status}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#e53e3e', fontWeight: '700' }}>{row.warning}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#4a5568' }}>{formatINR(row.monthly)}</td>
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
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
            marginBottom: 30,
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 20, marginTop: 0, marginBottom: 20, fontWeight: '700', color: '#1a202c' }}>📈 Projected Savings Growth</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.accumulation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip formatter={value => formatINR(value)} contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#3182ce" strokeWidth={3} activeDot={{ r: 8 }} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ 
            background: '#ffffff',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: 20, marginTop: 0, marginBottom: 20, fontWeight: '700', color: '#1a202c' }}>📉 Post-Retirement Corpus</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.exhaustion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip formatter={value => formatINR(value)} contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
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

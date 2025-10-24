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
    padding: '12px 15px',
    marginTop: '8px',
    border: '2px solid rgba(0, 112, 243, 0.2)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a2332',
    letterSpacing: '0.3px'
  };

  return (
    <main style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: 1400, margin: 'auto' }}>
        {/* Header with 3D effect */}
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '48px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '40px',
          textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
          letterSpacing: '-1px'
        }}>
          Retirement Planner
        </h1>

        {/* Input Section with Glassmorphism */}
        <section style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '35px',
          borderRadius: '24px',
          marginBottom: '35px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.3)',
          transform: 'translateZ(0)'
        }}>
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 25, 
            fontSize: 24,
            fontWeight: '700',
            color: '#1a2332',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ 
              fontSize: '28px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>💼</span> Your Inputs
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
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'}
              />
            </label>
            <label style={labelStyle}>
              Retirement Age
              <input style={inputStyle} type="number" name="retirementAge" value={inputs.retirementAge} min={18} max={100} onChange={handleChange} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
            <label style={labelStyle}>
              Expenses Planned Until Age
              <input style={inputStyle} type="number" name="expensesUntilAge" value={inputs.expensesUntilAge} min={inputs.retirementAge + 1} max={120} onChange={handleChange} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
            <label style={labelStyle}>
              Current Savings (₹)
              <input style={inputStyle} type="number" name="currentSavings" value={inputs.currentSavings} min={0} step={100000} onChange={handleChange} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
          </div>

          {/* Second Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 25 }}>
            <label style={labelStyle}>
              Monthly Investment (₹)
              <input style={inputStyle} type="number" name="monthlyInvestment" value={inputs.monthlyInvestment} min={0} step={1000} onChange={handleChange} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
            <label style={labelStyle}>
              Step-up Every Year (%)
              <input style={inputStyle} type="number" name="stepUpRate" value={inputs.stepUpRate * 100} min={0} max={50} step={0.1} onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
            <label style={labelStyle}>
              Post-Retirement Monthly Expense (₹)
              <input style={inputStyle} type="number" name="postRetirementMonthlyExpense" value={inputs.postRetirementMonthlyExpense} min={0} step={1000} onChange={handleChange} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
            <label style={labelStyle}>
              Inflation Rate (%)
              <input style={inputStyle} type="number" name="inflationRate" value={inputs.inflationRate * 100} min={0} max={20} step={0.1} onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} onFocus={(e) => e.target.style.borderColor = '#667eea'} onBlur={(e) => e.target.style.borderColor = 'rgba(0, 112, 243, 0.2)'} />
            </label>
          </div>

          {/* Calculate Button with 3D effect */}
          <button 
            onClick={recalculate}
            style={{ 
              width: '100%',
              padding: '18px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '14px',
              cursor: 'pointer', 
              fontSize: 18, 
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4), inset 0 -2px 0 rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5), inset 0 -2px 0 rgba(0,0,0,0.2)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4), inset 0 -2px 0 rgba(0,0,0,0.2)';
            }}
          >
            Calculate Retirement Plan
          </button>
        </section>

        {/* Status Banner with premium styling */}
        <section style={{ 
          background: results.fundsLastUntilPlannedAge 
            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
            : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
          border: 'none',
          borderRadius: '20px',
          padding: '25px 30px',
          marginBottom: '35px',
          textAlign: 'center',
          boxShadow: results.fundsLastUntilPlannedAge
            ? '0 15px 40px rgba(17, 153, 142, 0.3)'
            : '0 15px 40px rgba(235, 51, 73, 0.3)',
          color: 'white',
          transform: 'translateZ(0)'
        }}>
          <div style={{ 
            fontSize: 22, 
            fontWeight: '800', 
            marginBottom: 12,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px'
          }}>
            {results.fundsLastUntilPlannedAge ? '✓ Your Retirement Plan is Secure!' : '⚠ Warning: Insufficient Funds'}
          </div>
          <div style={{ 
            fontSize: 16,
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
              padding: '14px 35px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#1a2332', 
              border: '2px solid rgba(102, 126, 234, 0.3)', 
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: '700',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }}
          >
            {showTable ? '👁️ Hide' : '👁️ Show'} Detailed Year-by-Year Table
          </button>
        </div>

        {/* Table with 3D styling */}
        {showTable && (
          <section style={{ marginBottom: 45 }}>
            <h2 style={{ 
              marginBottom: 20, 
              color: 'white',
              fontSize: 26,
              fontWeight: '700',
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)'
            }}>📊 Detailed Year-by-Year Breakdown</h2>
            <div style={{ 
              maxHeight: '600px', 
              overflowY: 'auto', 
              overflowX: 'auto',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.3)'
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
                  zIndex: 10,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Age</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Starting Saving</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Planned Expenses</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Additional Expenses</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Additional Savings</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Ending Savings</th>
                    <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Status</th>
                    <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Warning</th>
                    <th style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '700', position: 'sticky', top: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyData.map((row, idx) => {
                    const isRetired = row.status === 'Retired';
                    const isDead = row.status === 'Dead';
                    const bgColor = idx % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(245,247,250,0.8)';
                    const highlightColor = (idx % 5 === 0 && idx > 0) ? 'rgba(255,250,205,0.9)' : bgColor;

                    return (
                      <tr key={idx} style={{ backgroundColor: highlightColor, transition: 'all 0.2s ease' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = highlightColor}
                      >
                        <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#1a2332' }}>{row.age}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#4a5568' }}>{formatINR(row.startingSavings)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#4a5568' }}>{formatINR(row.plannedExpenses)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#4a5568' }}>{row.additionalExpenses > 0 ? formatINR(row.additionalExpenses) : '-'}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#4a5568' }}>{formatINR(row.additionalSavings)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 'bold', color: isRetired ? '#e53e3e' : '#667eea' }}>{formatINR(row.endingSavings)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 'bold', color: isDead ? '#e53e3e' : isRetired ? '#ed8936' : '#38a169' }}>{row.status}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#e53e3e', fontWeight: 'bold' }}>{row.warning}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#4a5568' }}>{formatINR(row.monthly)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Charts with premium styling */}
        <section style={{ marginTop: 45 }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            marginBottom: 35,
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 20, fontWeight: '700', color: '#1a2332' }}>📈 Projected Savings Growth</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.accumulation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="age" stroke="#4a5568" />
                <YAxis stroke="#4a5568" />
                <Tooltip formatter={value => formatINR(value)} contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#667eea" strokeWidth={3} activeDot={{ r: 8 }} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h2 style={{ fontSize: 22, marginTop: 0, marginBottom: 20, fontWeight: '700', color: '#1a2332' }}>📉 Post-Retirement Corpus</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.exhaustion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="age" stroke="#4a5568" />
                <YAxis stroke="#4a5568" />
                <Tooltip formatter={value => formatINR(value)} contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="remainingCorpus" stroke="#eb3349" strokeWidth={3} activeDot={{ r: 8 }} name="Remaining Corpus" />
                <Line type="monotone" dataKey="annualExpense" stroke="#ed8936" strokeWidth={3} name="Annual Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </main>
  );
}

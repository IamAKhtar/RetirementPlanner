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

  // Investment Return assumptions pre- and post-retirement
  const preRetirementReturn = 0.095;
  const postRetirementReturn = 0.085;

  let savings = currentSavings;
  let investmentContribution = monthlyInvestment * 12;
  let stepUpFactor = 1;

  let yearlyData = [];
  let chartData = [];

  // Pre-retirement accumulation
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

  // Post-retirement expenditure
  let corpus = savings;
  let annualExpense = postRetirementMonthlyExpense * 12;
  let expenseData = [];

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

  return { accumulation: chartData, exhaustion: expenseData, yearlyData };
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
  const [showTable, setShowTable] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  }

  function recalculate() {
    setResults(calculateRetirement(inputs));
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    fontWeight: '500',
    color: '#333'
  };

  return (
    <main style={{ maxWidth: 1400, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0070f3', marginBottom: 30 }}>Retirement Planner</h1>

      {/* Input Section - Grid Layout */}
      <section style={{ backgroundColor: '#f9f9f9', padding: 25, borderRadius: 8, marginBottom: 30 }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>Your Inputs</h2>

        {/* First Row - 4 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 15 }}>
          <label style={labelStyle}>
            Current Age
            <input style={inputStyle} type="number" name="currentAge" value={inputs.currentAge} min={18} max={100} onChange={handleChange} />
          </label>
          <label style={labelStyle}>
            Retirement Age
            <input style={inputStyle} type="number" name="retirementAge" value={inputs.retirementAge} min={18} max={100} onChange={handleChange} />
          </label>
          <label style={labelStyle}>
            Expenses Planned Until Age
            <input style={inputStyle} type="number" name="expensesUntilAge" value={inputs.expensesUntilAge} min={inputs.retirementAge + 1} max={120} onChange={handleChange} />
          </label>
          <label style={labelStyle}>
            Current Savings (₹)
            <input style={inputStyle} type="number" name="currentSavings" value={inputs.currentSavings} min={0} step={100000} onChange={handleChange} />
          </label>
        </div>

        {/* Second Row - 4 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
          <label style={labelStyle}>
            Monthly Investment (₹)
            <input style={inputStyle} type="number" name="monthlyInvestment" value={inputs.monthlyInvestment} min={0} step={1000} onChange={handleChange} />
          </label>
          <label style={labelStyle}>
            Step-up Every Year (%)
            <input style={inputStyle} type="number" name="stepUpRate" value={inputs.stepUpRate * 100} min={0} max={50} step={0.1} onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} />
          </label>
          <label style={labelStyle}>
            Post-Retirement Monthly Expense (₹)
            <input style={inputStyle} type="number" name="postRetirementMonthlyExpense" value={inputs.postRetirementMonthlyExpense} min={0} step={1000} onChange={handleChange} />
          </label>
          <label style={labelStyle}>
            Inflation Rate (%)
            <input style={inputStyle} type="number" name="inflationRate" value={inputs.inflationRate * 100} min={0} max={20} step={0.1} onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} />
          </label>
        </div>

        {/* Calculate Button */}
        <button 
          onClick={recalculate}
          style={{ 
            width: '100%',
            padding: '15px 20px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer', 
            fontSize: 16, 
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.target.style.backgroundColor = '#0051cc'}
          onMouseOut={e => e.target.style.backgroundColor = '#0070f3'}
        >
          Calculate
        </button>
      </section>

      {/* Charts Section - Side by Side */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        {/* Chart 1: Projected Savings Growth */}
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 15 }}>Projected Savings Growth</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={results.accumulation} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Savings', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => formatINR(value)} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0070f3" strokeWidth={2} activeDot={{ r: 6 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Post-Retirement Corpus */}
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 15 }}>Post-Retirement Corpus</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={results.exhaustion} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Corpus', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => formatINR(value)} />
              <Legend />
              <Line type="monotone" dataKey="remainingCorpus" stroke="#d32f2f" strokeWidth={2} activeDot={{ r: 6 }} name="Remaining Corpus" />
              <Line type="monotone" dataKey="annualExpense" stroke="#f57c00" strokeWidth={2} name="Annual Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Toggle Button for Table */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button 
          onClick={() => setShowTable(!showTable)} 
          style={{ 
            padding: '12px 30px', 
            backgroundColor: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold'
          }}
        >
          {showTable ? 'Hide' : 'Show'} Detailed Year-by-Year Table
        </button>
      </div>

      {/* Detailed Table */}
      {showTable && (
        <section style={{ marginTop: 20, overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 15 }}>Detailed Year-by-Year Breakdown</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#0070f3', color: 'white' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderRight: '1px solid #fff' }}>Age</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #fff' }}>Starting Saving</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #fff' }}>Planned Expenses<br/>(post-tax)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #fff' }}>Additional Expenses<br/>(post-tax)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #fff' }}>Additional Savings</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #fff' }}>Ending Savings</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #fff' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #fff' }}>Warning</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Monthly</th>
              </tr>
            </thead>
            <tbody>
              {results.yearlyData.map((row, idx) => {
                const isRetired = row.status === 'Retired';
                const isDead = row.status === 'Dead';
                const bgColor = idx % 2 === 0 ? '#f9f9f9' : 'white';
                const highlightColor = (idx % 5 === 0 && idx > 0) ? '#fffacd' : bgColor;

                return (
                  <tr key={idx} style={{ backgroundColor: highlightColor }}>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>{row.age}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{formatINR(row.startingSavings)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{formatINR(row.plannedExpenses)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{row.additionalExpenses > 0 ? formatINR(row.additionalExpenses) : '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{formatINR(row.additionalSavings)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold', color: isRetired ? '#d32f2f' : '#0070f3' }}>{formatINR(row.endingSavings)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #ddd', fontWeight: 'bold', color: isDead ? '#d32f2f' : isRetired ? '#f57c00' : '#4caf50' }}>{row.status}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #ddd', color: '#d32f2f', fontWeight: 'bold' }}>{row.warning}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{formatINR(row.monthly)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

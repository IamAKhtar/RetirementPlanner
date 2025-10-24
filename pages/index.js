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

  return (
    <main style={{ maxWidth: 1200, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Retirement Planner</h1>

      <section style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 30 }}>
        <form style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8 }} onSubmit={e => { e.preventDefault(); recalculate(); }}>
          <h2 style={{ marginTop: 0 }}>Your Inputs</h2>
          <label>Current Age<input type="number" name="currentAge" value={inputs.currentAge} min={18} max={100} onChange={handleChange} /></label>
          <label>Retirement Age<input type="number" name="retirementAge" value={inputs.retirementAge} min={18} max={100} onChange={handleChange} /></label>
          <label>Expenses Planned Until Age<input type="number" name="expensesUntilAge" value={inputs.expensesUntilAge} min={inputs.retirementAge + 1} max={120} onChange={handleChange} /></label>
          <label>Current Savings (₹)<input type="number" name="currentSavings" value={inputs.currentSavings} min={0} step={100000} onChange={handleChange} /></label>
          <label>Monthly Investment (₹)<input type="number" name="monthlyInvestment" value={inputs.monthlyInvestment} min={0} step={1000} onChange={handleChange} /></label>
          <label>Step-up Every Year (%)<input type="number" name="stepUpRate" value={inputs.stepUpRate * 100} min={0} max={50} step={0.1} onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} /></label>
          <label>Post-Retirement Monthly Expense (₹)<input type="number" name="postRetirementMonthlyExpense" value={inputs.postRetirementMonthlyExpense} min={0} step={1000} onChange={handleChange} /></label>
          <label>Inflation Rate (%)<input type="number" name="inflationRate" value={inputs.inflationRate * 100} min={0} max={20} step={0.1} onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} /></label>
          <button type="submit" style={{ marginTop: 10, padding: '12px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>Calculate</button>
        </form>

        <section style={{ flex: '2 1 500px' }}>
          <div style={{ marginBottom: 20 }}>
            <button 
              onClick={() => setShowTable(!showTable)} 
              style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 15 }}
            >
              {showTable ? 'Hide' : 'Show'} Detailed Year-by-Year Table
            </button>
          </div>

          <h2>Projected Savings Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.accumulation} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: 0 }} />
              <YAxis label={{ value: 'Savings (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => formatINR(value)} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0070f3" strokeWidth={2} activeDot={{ r: 6 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>

          <h2 style={{ marginTop: 40 }}>Post-Retirement Corpus</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.exhaustion} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: 0 }} />
              <YAxis label={{ value: 'Corpus (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => formatINR(value)} />
              <Legend />
              <Line type="monotone" dataKey="remainingCorpus" stroke="#d32f2f" strokeWidth={2} activeDot={{ r: 6 }} name="Remaining Corpus" />
              <Line type="monotone" dataKey="annualExpense" stroke="#f57c00" strokeWidth={2} name="Annual Expense" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </section>

      {showTable && (
        <section style={{ marginTop: 40, overflowX: 'auto' }}>
          <h2>Detailed Year-by-Year Breakdown</h2>
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

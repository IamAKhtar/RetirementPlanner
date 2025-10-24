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
  const preRetirementReturn = 0.095; // blended assumed pre-retirement return
  const postRetirementReturn = 0.085; // blended assumed post-ret return

  let savings = currentSavings;
  let investmentContribution = monthlyInvestment * 12;
  let stepUpFactor = 1;

  let data = [];

  // Pre-retirement accumulation
  for (let i = 0; i <= yearsToWork; i++) {
    if (i > 0) {
      stepUpFactor *= (1 + stepUpRate);
      investmentContribution = monthlyInvestment * 12 * stepUpFactor;
    }
    savings = savings * (1 + preRetirementReturn) + investmentContribution;
    data.push({ age: currentAge + i, savings: Math.round(savings) });
  }

  // Post-retirement expenditure and corpus decline
  let corpus = savings;
  let annualExpense = postRetirementMonthlyExpense * 12;
  let expenseData = [];
  for (let i = 1; i <= yearsAfterRetirement; i++) {
    annualExpense *= (1 + inflationRate);
    corpus = corpus * (1 + postRetirementReturn) - annualExpense;
    expenseData.push({ age: retirementAge + i, remainingCorpus: Math.round(corpus), annualExpense: Math.round(annualExpense) });
    if (corpus <= 0) break;
  }

  return { accumulation: data, exhaustion: expenseData };
}

export default function Home() {
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(calculateRetirement(initialInputs));

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  }

  function recalculate() {
    setResults(calculateRetirement(inputs));
  }

  return (
    <main style={{ maxWidth: 960, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Retirement Planner</h1>
      <section style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <form style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }} onSubmit={e => { e.preventDefault(); recalculate(); }}>
          <label>Current Age<input type="number" name="currentAge" value={inputs.currentAge} min={18} max={100} onChange={handleChange} /></label>
          <label>Retirement Age<input type="number" name="retirementAge" value={inputs.retirementAge} min={18} max={100} onChange={handleChange} /></label>
          <label>Expenses Planned Until Age<input type="number" name="expensesUntilAge" value={inputs.expensesUntilAge} min={inputs.retirementAge + 1} max={120} onChange={handleChange} /></label>
          <label>Current Savings (₹)<input type="number" name="currentSavings" value={inputs.currentSavings} min={0} step={1000} onChange={handleChange} /></label>
          <label>Monthly Investment (₹)<input type="number" name="monthlyInvestment" value={inputs.monthlyInvestment} min={0} step={1000} onChange={handleChange} /></label>
          <label>Step-up in Savings Every Year (%)<input type="number" name="stepUpRate" value={inputs.stepUpRate * 100} min={0} max={50} step={0.1} onChange={e => setInputs(prev => ({ ...prev, stepUpRate: parseFloat(e.target.value) / 100 }))} /></label>
          <label>Post-Retirement Monthly Expense (Today's Rate, ₹)<input type="number" name="postRetirementMonthlyExpense" value={inputs.postRetirementMonthlyExpense} min={0} step={100} onChange={handleChange} /></label>
          <label>Inflation Rate (%)<input type="number" name="inflationRate" value={inputs.inflationRate * 100} min={0} max={20} step={0.1} onChange={e => setInputs(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) / 100 }))} /></label>
          <button type="submit" style={{ marginTop: 10, padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Calculate</button>
        </form>

        <section style={{ flex: '2 1 500px' }}>
          <h2>Projected Savings Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.accumulation} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: 0 }} />
              <YAxis label={{ value: 'Savings (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => new Intl.NumberFormat('en-IN').format(value)} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0070f3" activeDot={{ r: 8 }} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
          <h2 style={{ marginTop: 40 }}>Post-Retirement Corpus Exhaustion</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.exhaustion} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: 0 }} />
              <YAxis label={{ value: 'Corpus (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={value => new Intl.NumberFormat('en-IN').format(value)} />
              <Legend />
              <Line type="monotone" dataKey="remainingCorpus" stroke="#d32f2f" activeDot={{ r: 8 }} name="Remaining Corpus" />
              <Line type="monotone" dataKey="annualExpense" stroke="#f57c00" name="Annual Expense" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </section>
    </main>
  );
}
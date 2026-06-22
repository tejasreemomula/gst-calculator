import { useState, useMemo } from "react";

export default function App() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(18);
  const [isInclusive, setIsInclusive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Common GST rates list
  const gstRates = [0, 5, 12, 18, 28];

  // Perform tax calculations based on the input amount, rate, and calculation mode
  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;

    let originalAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (isInclusive) {
      // Inclusive of GST: Amount = Total, find Net and Tax
      // Total = Net * (1 + rate / 100)
      // Net = Total / (1 + rate / 100)
      totalAmount = amt;
      originalAmount = amt / (1 + r / 100);
      gstAmount = amt - originalAmount;
    } else {
      // Exclusive of GST: Amount = Net, add Tax to find Total
      originalAmount = amt;
      gstAmount = (amt * r) / 100;
      totalAmount = amt + gstAmount;
    }

    // CGST and SGST split (generally 50/50 in dual GST systems)
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;

    return {
      original: originalAmount,
      gst: gstAmount,
      cgst: cgstAmount,
      sgst: sgstAmount,
      total: totalAmount,
    };
  }, [amount, rate, isInclusive]);

  // Format currency helpers (INR)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Copy result action
  const handleCopy = () => {
    const calculationType = isInclusive ? "Inclusive of GST (Tax Removed)" : "Exclusive of GST (Tax Added)";
    const textToCopy = `--- GST Calculation Summary ---
Calculation Type: ${calculationType}
GST Rate: ${rate}%
-----------------------------
Original Amount  : ${formatCurrency(calculations.original)}
GST Amount       : ${formatCurrency(calculations.gst)}
  - CGST (50%)   : ${formatCurrency(calculations.cgst)}
  - SGST (50%)   : ${formatCurrency(calculations.sgst)}
-----------------------------
Total Amount     : ${formatCurrency(calculations.total)}
-----------------------------
Calculated via GST Calculator
`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Calculate percentage of GST vs Original for visual indicator
  const gstPercentage = useMemo(() => {
    const total = calculations.total;
    if (total === 0) return 0;
    return (calculations.gst / total) * 100;
  }, [calculations]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none animate-float-delayed"></div>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Tax Calculator
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent tracking-tight">
              GST Calculator
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Easily compute Goods and Services Tax in Indian Rupees with detailed breakdowns and inclusive/exclusive toggle options.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="glass-card rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 transition-all duration-300 hover:border-emerald-500/25">
            
            {/* Calculation Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsInclusive(false)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isInclusive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                GST Exclusive (Add GST)
              </button>
              <button
                type="button"
                onClick={() => setIsInclusive(true)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isInclusive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                GST Inclusive (Remove GST)
              </button>
            </div>

            {/* Inputs Block */}
            <div className="space-y-4">
              
              {/* Input Amount */}
              <div className="space-y-1.5">
                <label htmlFor="amount" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount in Rupees (₹)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-lg font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    className="block w-full pl-9 pr-12 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* GST Rate Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="rate" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    GST Rate (%)
                  </label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {gstRates.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRate(r)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        rate === r
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>

                {/* Select Dropdown fallback as required */}
                <div className="relative mt-2">
                  <select
                    id="rate"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all appearance-none cursor-pointer"
                  >
                    <option value={0}>0% GST Rate</option>
                    <option value={5}>5% GST Rate</option>
                    <option value={12}>12% GST Rate</option>
                    <option value={18}>18% GST Rate</option>
                    <option value={28}>28% GST Rate</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-850 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Original Amount</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(calculations.original)}</span>
              </div>

              {/* Sub Tax Breakdown (CGST/SGST) */}
              {rate > 0 && (
                <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      Total GST ({rate}%)
                    </span>
                    <span className="text-emerald-400 font-semibold">+{formatCurrency(calculations.gst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pl-3">
                    <span className="text-slate-500">CGST ({(rate / 2).toFixed(1)}%)</span>
                    <span className="text-slate-400">{formatCurrency(calculations.cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pl-3">
                    <span className="text-slate-500">SGST ({(rate / 2).toFixed(1)}%)</span>
                    <span className="text-slate-400">{formatCurrency(calculations.sgst)}</span>
                  </div>
                </div>
              )}

              {/* Graphical Proportion Indicator */}
              {rate > 0 && amount > 0 && (
                <div className="pt-2">
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden flex">
                    <div
                      className="bg-slate-400 transition-all duration-500"
                      style={{ width: `${100 - gstPercentage}%` }}
                      title="Net Amount Proportion"
                    ></div>
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${gstPercentage}%` }}
                      title="GST Amount Proportion"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Net Amount ({Math.round(100 - gstPercentage)}%)</span>
                    <span>GST ({Math.round(gstPercentage)}%)</span>
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-slate-800 pt-3.5 flex justify-between items-end">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isInclusive ? "Tax inclusive sum" : "Net amount + tax"}
                  </span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {formatCurrency(calculations.total)}
                </span>
              </div>
            </div>

            {/* Copy Action Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!amount}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed group active:scale-[0.98]"
              >
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Result
              </button>

              {/* Toast Popover Alert */}
              {copied && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied Report to Clipboard!
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer & Branding */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 px-4 z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Author Credits Card */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              MT
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designed By</p>
              <h2 className="text-sm font-bold text-slate-200">Momula Tejasree</h2>
              <a href="mailto:momulatejasree@gmail.com" className="text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors">
                momulatejasree@gmail.com
              </a>
            </div>
          </div>

          {/* Core External Hero Brand Action Button */}
          <div className="w-full md:w-auto">
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 border border-emerald-500/30 hover:border-emerald-500/80 bg-slate-950 hover:bg-emerald-950/20 text-emerald-400 font-bold text-sm rounded-xl tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/40 active:scale-95 text-center cursor-pointer"
            >
              Built for Digital Heroes
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}
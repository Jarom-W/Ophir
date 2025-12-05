import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
PlusCircle,
Trash2,
Clock,
Mail,
Zap,
DollarSign,
TrendingUp,
LineChart,
Target,
FileText,
} from "lucide-react";
import "../styles/services.css";

// --- Types ---
interface Criterion {
id: number;
type: "price" | "dividend" | "technical" | "fundamental";
field?: string;
condition?: string;
value?: string;
}

interface Alert {
alert_name: string;
creator_id: number;
created_on: Date;
id: number;
criteria: Criterion[];
}

// --- CriterionRow Component ---
interface CriterionRowProps {
criterion: Criterion;
update: (id: number, field: keyof Criterion, value: string) => void;
remove: (id: number) => void;
}

const TYPE_ICONS = {
price: DollarSign,
dividend: Target,
technical: LineChart,
fundamental: FileText,
};

const FUNDAMENTAL_FIELDS = [
{ group: "Balance Sheet", fields: [
"Assets", "Current Assets", "Cash and Cash Equivalents",
"Accounts Receivable", "Inventory", "Marketable Securities (Current)",
"Marketable Securities (Noncurrent)", "Property, Plant & Equipment",
"Accumulated Depreciation", "Goodwill", "Intangible Assets",
"Other Assets (Current)", "Other Assets (Noncurrent)", "Liabilities",
"Current Liabilities", "Long Term Debt", "Accounts Payable",
"Accrued Expenses", "Operating Lease Liability (Current)",
"Operating Lease Liability (Noncurrent)", "Finance Lease Liability (Current)",
"Finance Lease Liability (Noncurrent)", "Equity", "Retained Earnings",
"Common Stock", "Preferred Stock"
]
},
{ group: "Income Statement", fields: [
"Revenue", "Cost of Revenue", "Gross Profit", "Operating Expenses",
"Research and Development", "Selling, General & Administrative",
"Operating Income", "Interest Expense", "Income Before Tax",
"Income Tax Expense", "Net Income", "Noncontrolling Interest",
"Other Nonoperating Income", "Equity Investment Gain/Loss"
]
},
{ group: "Cash Flow", fields: [
"Net Cash from Operating Activities", "Net Cash from Investing Activities",
"Net Cash from Financing Activities", "Capital Expenditures",
"Dividends Paid", "Stock Repurchases", "Debt Issuance Proceeds",
"Equity Issuance Proceeds"
]
},
{ group: "Ratios", fields: [
"Current Ratio", "Debt-to-Equity", "Gross Margin",
"Operating Margin", "Net Margin"
]
}
];

const CriterionRow: React.FC<CriterionRowProps> = ({ criterion, update, remove }) => {
const Icon = TYPE_ICONS[criterion.type];

return (
<motion.div
layout
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: "auto" }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.3 }}
className="criterion-row"
> <div className="criterion-type-label"> <Icon className="criterion-icon" />
{criterion.type} </div>

  {criterion.type === "fundamental" && (
    <select
      className="field-menu"
      value={criterion.field || ""}
      onChange={(e) => update(criterion.id, "field", e.target.value)}
    >
      <option value="" disabled>Select Field</option>
      {FUNDAMENTAL_FIELDS.map(group => (
        <optgroup label={group.group} key={group.group}>
          {group.fields.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )}

  <select
    className="conditional-menu"
    value={criterion.condition || ""}
    onChange={(e) => update(criterion.id, "condition", e.target.value)}
  >
    <option value="" disabled>Select Condition</option>
    <option value="greater_than">is/are more than</option>
    <option value="equal_to">is/are exactly</option>
    <option value="less_than">is/are less than</option>
  </select>

  <input
    type="text"
    placeholder="Target Value"
    className="criterion-input input-value"
    value={criterion.value || ""}
    onChange={(e) => update(criterion.id, "value", e.target.value)}
  />

  <button
    onClick={() => remove(criterion.id)}
    className="btn-remove-criterion"
    title="Remove Criterion"
  >
    <Trash2 className="icon-remove" />
  </button>
</motion.div>

);
};

export default function App() {
const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
const [criteria, setCriteria] = useState<Criterion[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [alertName, setAlertName] = useState("");

const addCriterion = (type: Criterion["type"]) => {
setCriteria([
...criteria,
{ id: Date.now(), type, condition: "", value: "", field: "" },
]);
};

const updateCriterion = (id: number, field: keyof Criterion, value: string) => {
setCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
};

const removeCriterion = (id: number) => {
setCriteria(prev => prev.filter(c => c.id !== id));
};

const handleSave = () => {
setIsLoading(true);
setTimeout(() => {
console.log("Saving Configuration:", { alertName, frequency, criteria });
setIsLoading(false);
}, 1500);
};

const isCriteriaEmpty = criteria.length === 0;

return ( <div className="app-container"> <div className="main-content">
{/* Header */}
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="header-section"
> <div> <h1 className="main-title"> <Zap className="title-icon" />
Build Intelligent Alerts </h1> <p className="subtitle">
Define your criteria, set your schedule, and receive smart, curated stock updates. </p> </div>
</motion.div>

    {/* STEP 1: Frequency Selector */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-panel step-panel"
    >
      <h2 className="step-title">
        <span className="step-number">1.</span>
        <Clock className="step-icon" />
        Notification Schedule
      </h2>
      <p className="step-description">
        Choose how often you want to receive an email summary of any triggered alerts.
      </p>

      <div className="frequency-selector">
        {["daily", "weekly"].map((f) => (
          <button
            key={f}
            onClick={() => setFrequency(f as "daily" | "weekly")}
            className={`btn-frequency ${frequency === f ? "btn-frequency-active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>

    {/* STEP 2: Alert Name */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-panel step-panel"
    >
      <h2 className="step-title">
        <span className="step-number">2.</span>
        <FileText className="step-icon" />
        Give your Alert a name
      </h2>
      <input
        type="text"
        placeholder="Buffett's Best"
        value={alertName}
        onChange={(e) => setAlertName(e.target.value)}
      />
    </motion.div>

    {/* STEP 3: Criteria Builder */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-panel step-panel"
    >
      <h2 className="step-title">
        <span className="step-number">3.</span>
        <TrendingUp className="step-icon" />
        Define Alert Criteria
      </h2>
      <p className="step-description">
        Add rules that must be met to trigger an alert.
      </p>

      <div className="criteria-buttons">
        {[
          { label: "Price Target", type: "price", icon: DollarSign },
          { label: "Dividend Change", type: "dividend", icon: Target },
          { label: "Technical Signal", type: "technical", icon: LineChart },
          { label: "Fundamental Shift", type: "fundamental", icon: FileText },
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.type}
              onClick={() => addCriterion(btn.type as Criterion["type"])}
              className="btn-add-criterion"
              title={`Add ${btn.label} criterion`}
            >
              <Icon className="btn-icon" />
              {btn.label}
            </button>
          );
        })}
      </div>

      <div className="criteria-list">
        <AnimatePresence>
          {criteria.length > 0 ? (
            criteria.map((c) => (
              <CriterionRow
                key={c.id}
                criterion={c}
                update={updateCriterion}
                remove={removeCriterion}
              />
            ))
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <PlusCircle className="empty-state-icon" />
              <p className="empty-state-text">
                Start by clicking one of the categories above to build your first alert criterion.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* STEP 4: Review & Launch */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="summary-panel card-panel step-panel"
    >
      <h2 className="step-title">
        <span className="step-number">4.</span>
        Review & Launch
      </h2>

      <div className="summary-details">
        <div className="summary-metrics">
          <p>
            <span className="summary-label">Schedule:</span>{" "}
            <span className="summary-value">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</span>
          </p>
          <p>
            <span className="summary-label">Total Criteria:</span>{" "}
            <span className="summary-value">{criteria.length} {criteria.length === 1 ? "Rule" : "Rules"} Defined</span>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || isCriteriaEmpty}
          className={`btn-save ${isCriteriaEmpty ? "btn-disabled" : ""}`}
        >
          {isLoading ? (
            <>
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="spinner-path"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Mail className="btn-icon" />
              Save and Activate Alerts
            </>
          )}
        </button>

        {isCriteriaEmpty && (
          <p className="error-message">
            * Please add at least one criterion to activate alerts.
          </p>
        )}
      </div>
    </motion.div>
  </div>
</div>

);
}


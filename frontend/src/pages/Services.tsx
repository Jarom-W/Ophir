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


interface AlertCriterion {
  id: number;
  type: "price" | "dividend" | "technical" | "fundamental";
  condition: string;
  value: string;
}

const TYPE_ICONS = {
  price: DollarSign,
  dividend: Target,
  technical: LineChart,
  fundamental: FileText,
};

// --- Alert Criterion Row Component ---
const CriterionRow = ({ criterion, update, remove }) => {
  const Icon = TYPE_ICONS[criterion.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="criterion-row"
    >
      {/* Type Label and Icon */}
      <div className="criterion-type-label">
        <Icon className="criterion-icon" />
        {criterion.type}
      </div>

      {/* Condition Input */}
      <input
        type="text"
        placeholder="Condition (e.g., > 150, crosses above 50-day EMA)"
        className="criterion-input input-condition"
        value={criterion.condition}
        onChange={(e) => update(criterion.id, "condition", e.target.value)}
      />

      {/* Value Input */}
      <input
        type="text"
        placeholder="Target Value"
        className="criterion-input input-value"
        value={criterion.value}
        onChange={(e) => update(criterion.id, "value", e.target.value)}
      />

      {/* Delete Button */}
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

// --- Main App Component ---
export default function App() {
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [criteria, setCriteria] = useState<AlertCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addCriterion = (type: AlertCriterion["type"]) => {
    setCriteria([
      ...criteria,
      { id: Date.now(), type, condition: "", value: "" },
    ]);
  };

  const updateCriterion = (
    id: number,
    field: keyof AlertCriterion,
    value: string
  ) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCriterion = (id: number) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log("Saving Configuration:", { frequency, criteria });
      setIsLoading(false);
    }, 1500);
  };

  const isCriteriaEmpty = criteria.length === 0;

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="header-section"
        >
          <div>
            <h1 className="main-title">
              <Zap className="title-icon" />
              Build Intelligent Alerts
            </h1>
            <p className="subtitle">
              Define your criteria, set your schedule, and receive smart, curated
              stock updates.
            </p>
          </div>
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
            Choose how often you want to receive an email summary of any triggered
            alerts.
          </p>

          <div className="frequency-selector">
            {["daily", "weekly"].map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f as "daily" | "weekly")}
                className={`btn-frequency ${
                  frequency === f ? "btn-frequency-active" : ""
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* STEP 2: Criteria Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-panel step-panel"
        >
          <h2 className="step-title">
            <span className="step-number">2.</span>
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
              {
                label: "Fundamental Shift",
                type: "fundamental",
                icon: FileText,
              },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.type}
                  onClick={() =>
                    addCriterion(btn.type as AlertCriterion["type"])
                  }
                  className="btn-add-criterion"
                  title={`Add ${btn.label} criterion`}
                >
                  <Icon className="btn-icon" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Criteria List */}
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
                    Start by clicking one of the categories above to build your
                    first alert criterion.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* STEP 3: Summary and Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="summary-panel card-panel step-panel"
        >
          <h2 className="step-title">

            <span className="step-number">3.

            </span>
            Review & Launch

          </h2>


          <div className="summary-details">
            <div className="summary-metrics">
              <p>
                <span className="summary-label">Schedule:</span>{" "}
                <span className="summary-value">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </span>{" "}
                delivery.
              </p>
              <p>
                <span className="summary-label">Total Criteria:</span>{" "}
                <span className="summary-value">
                  {criteria.length} {criteria.length === 1 ? "Rule" : "Rules"}{" "}
                  Defined.
                </span>
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading || isCriteriaEmpty}
              className={`btn-save ${
                isCriteriaEmpty ? "btn-disabled" : ""
              }`}
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
                    <path
                      className="spinner-fill"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
          </div>
          {isCriteriaEmpty && (
            <p className="error-message">
              * Please add at least one criterion to activate alerts.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}


use serde_json::json;
use std::collections::HashMap;

pub fn map_us_gaap_to_rich(data: &HashMap<String, f64>) -> serde_json::Value {
    json!({
        "balance_sheet": {
            "assets": data.get("us-gaap:Assets").copied().unwrap_or(0.0),
            "current_assets": data.get("us-gaap:AssetsCurrent").copied().unwrap_or(0.0),
            "cash_and_cash_equivalents": data.get("us-gaap:CashAndCashEquivalentsAtCarryingValue").copied().unwrap_or(0.0),
            "accounts_receivable": data.get("us-gaap:AccountsReceivableNetCurrent").copied().unwrap_or(0.0),
            "inventory": data.get("us-gaap:InventoryNet").copied().unwrap_or(0.0),
            "marketable_securities_current": data.get("us-gaap:MarketableSecuritiesCurrent").copied().unwrap_or(0.0),
            "marketable_securities_noncurrent": data.get("us-gaap:MarketableSecuritiesNoncurrent").copied().unwrap_or(0.0),
            "property_plant_equipment": data.get("us-gaap:PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetBeforeAccumulatedDepreciationAndAmortization").copied().unwrap_or(0.0),
            "accumulated_depreciation": data.get("us-gaap:PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAccumulatedDepreciationAndAmortization").copied().unwrap_or(0.0),
            "goodwill": data.get("us-gaap:Goodwill").copied().unwrap_or(0.0),
            "intangible_assets": data.get("us-gaap:OtherLongTermInvestments").copied().unwrap_or(0.0),
            "other_assets_current": data.get("us-gaap:OtherAssetsCurrent").copied().unwrap_or(0.0),
            "other_assets_noncurrent": data.get("us-gaap:OtherAssetsNoncurrent").copied().unwrap_or(0.0),
            "liabilities": data.get("us-gaap:Liabilities").copied().unwrap_or(0.0),
            "current_liabilities": data.get("us-gaap:LiabilitiesCurrent").copied().unwrap_or(0.0),
            "long_term_debt": data.get("us-gaap:LongTermDebtNoncurrent").copied().unwrap_or(0.0),
            "accounts_payable": data.get("us-gaap:AccountsPayableCurrent").copied().unwrap_or(0.0),
            "accrued_expenses": data.get("us-gaap:AccruedLiabilitiesCurrent").copied().unwrap_or(0.0),
            "operating_lease_liability_current": data.get("us-gaap:OperatingLeaseLiabilityCurrent").copied().unwrap_or(0.0),
            "operating_lease_liability_noncurrent": data.get("us-gaap:OperatingLeaseLiabilityNoncurrent").copied().unwrap_or(0.0),
            "finance_lease_liability_current": data.get("us-gaap:FinanceLeaseLiabilityCurrent").copied().unwrap_or(0.0),
            "finance_lease_liability_noncurrent": data.get("us-gaap:FinanceLeaseLiabilityNoncurrent").copied().unwrap_or(0.0),
            "equity": data.get("us-gaap:StockholdersEquity").copied().unwrap_or(0.0),
            "retained_earnings": data.get("us-gaap:RetainedEarningsAccumulatedDeficit").copied().unwrap_or(0.0),
            "common_stock": data.get("us-gaap:CommonStocksIncludingAdditionalPaidInCapital").copied().unwrap_or(0.0),
            "preferred_stock": data.get("us-gaap:PreferredStockParOrStatedValuePerShare").copied().unwrap_or(0.0)
        },
        "income_statement": {
            "revenue": data.get("us-gaap:Revenues").copied().unwrap_or(0.0),
            "cost_of_revenue": data.get("us-gaap:CostOfRevenue").copied().unwrap_or(0.0),
            "gross_profit": data.get("us-gaap:Revenues").copied().unwrap_or(0.0) - data.get("us-gaap:CostOfRevenue").copied().unwrap_or(0.0),
            "operating_expenses": data.get("us-gaap:OperatingExpenses").copied().unwrap_or(0.0),
            "research_and_development": data.get("us-gaap:ResearchAndDevelopmentExpense").copied().unwrap_or(0.0),
            "selling_general_administrative": data.get("us-gaap:SellingAndMarketingExpense").copied().unwrap_or(0.0),
            "operating_income": data.get("us-gaap:OperatingIncomeLoss").copied().unwrap_or(0.0),
            "interest_expense": data.get("us-gaap:InterestExpenseNonoperating").copied().unwrap_or(0.0),
            "income_before_tax": data.get("us-gaap:IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest").copied().unwrap_or(0.0),
            "income_tax_expense": data.get("us-gaap:IncomeTaxExpenseBenefit").copied().unwrap_or(0.0),
            "net_income": data.get("us-gaap:NetIncomeLoss").copied().unwrap_or(0.0),
            "noncontrolling_interest": data.get("us-gaap:NoncontrollingInterestInVariableInterestEntity").copied().unwrap_or(0.0),
            "other_nonoperating_income": data.get("us-gaap:OtherNonoperatingIncomeExpense").copied().unwrap_or(0.0),
            "equity_investment_gain_loss": data.get("us-gaap:EquitySecuritiesFvNiGainLoss").copied().unwrap_or(0.0)
        },
        "cash_flow": {
            "net_cash_from_operating": data.get("us-gaap:NetCashProvidedByUsedInOperatingActivities").copied().unwrap_or(0.0),
            "net_cash_from_investing": data.get("us-gaap:NetCashProvidedByUsedInInvestingActivities").copied().unwrap_or(0.0),
            "net_cash_from_financing": data.get("us-gaap:NetCashProvidedByUsedInFinancingActivities").copied().unwrap_or(0.0),
            "capital_expenditures": data.get("us-gaap:PaymentsToAcquirePropertyPlantAndEquipment").copied().unwrap_or(0.0),
            "dividends_paid": data.get("us-gaap:PaymentsOfDividends").copied().unwrap_or(0.0),
            "stock_repurchases": data.get("us-gaap:PaymentsForRepurchaseOfCommonStock").copied().unwrap_or(0.0),
            "debt_issuance_proceeds": data.get("us-gaap:ProceedsFromDebtNetOfIssuanceCosts").copied().unwrap_or(0.0),
            "equity_issuance_proceeds": data.get("us-gaap:ProceedsFromMinorityShareholders").copied().unwrap_or(0.0)
        },
        "leases": {
            "finance_lease_asset": data.get("us-gaap:FinanceLeaseRightOfUseAsset").copied().unwrap_or(0.0),
            "finance_lease_amortization": data.get("us-gaap:FinanceLeaseRightOfUseAssetAmortization").copied().unwrap_or(0.0),
            "operating_lease_asset": data.get("us-gaap:OperatingLeaseRightOfUseAsset").copied().unwrap_or(0.0),
            "operating_lease_cost": data.get("us-gaap:OperatingLeaseCost").copied().unwrap_or(0.0)
        },
        "derivatives": {
            "derivative_assets": data.get("us-gaap:DerivativeAssets").copied().unwrap_or(0.0),
            "derivative_liabilities": data.get("us-gaap:DerivativeLiabilities").copied().unwrap_or(0.0),
            "derivative_gain_loss": data.get("us-gaap:DerivativeGainLossOnDerivativeNet").copied().unwrap_or(0.0)
        },
        "equity": {
            "share_based_compensation": data.get("us-gaap:ShareBasedCompensation").copied().unwrap_or(0.0),
            "stock_issued": data.get("us-gaap:SharesIssued").copied().unwrap_or(0.0),
            "stock_repurchased": data.get("us-gaap:StockRepurchasedAndRetiredDuringPeriodShares").copied().unwrap_or(0.0),
            "additional_paid_in_capital": data.get("us-gaap:CommonStocksIncludingAdditionalPaidInCapital").copied().unwrap_or(0.0)
        },
        "other_comprehensive_income": {
            "aoci_net_of_tax": data.get("us-gaap:AccumulatedOtherComprehensiveIncomeLossNetOfTax").copied().unwrap_or(0.0),
            "foreign_currency_translation": data.get("us-gaap:OtherComprehensiveIncomeLossForeignCurrencyTransactionAndTranslationAdjustmentNetOfTax").copied().unwrap_or(0.0),
            "cash_flow_hedges": data.get("us-gaap:OtherComprehensiveIncomeLossCashFlowHedgeGainLossAfterReclassificationAndTax").copied().unwrap_or(0.0),
            "unrealized_gains_on_securities": data.get("us-gaap:OtherComprehensiveIncomeUnrealizedHoldingGainLossOnSecuritiesArisingDuringPeriodNetOfTax").copied().unwrap_or(0.0)
        },
        "ratios": {
            "current_ratio": match (data.get("us-gaap:AssetsCurrent"), data.get("us-gaap:LiabilitiesCurrent")) {
                (Some(a), Some(l)) if *l != 0.0 => Some(a / l),
                _ => Some(0.0),
            },
            "debt_to_equity": match (data.get("us-gaap:Liabilities"), data.get("us-gaap:StockholdersEquity")) {
                (Some(l), Some(e)) if *e != 0.0 => Some(l / e),
                _ => Some(0.0),
            },
            "gross_margin": match (data.get("us-gaap:Revenues"), data.get("us-gaap:CostOfRevenue")) {
                (Some(r), Some(c)) if *r != 0.0 => Some((r - c)/ r),
                _ => Some(0.0),
            },
            "operating_margin": match (data.get("us-gaap:OperatingIncomeLoss"), data.get("us-gaap:Revenues")) {
                (Some(op), Some(r)) if *r != 0.0 => Some(op / r),
                _ => Some(0.0),
            },
            "net_margin": match (data.get("us-gaap:NetIncomeLoss"), data.get("us-gaap:Revenues")) {
                (Some(net), Some(r)) if *r != 0.0 => Some(net / r),
                _ => Some(0.0),
            }
        }
    })
}



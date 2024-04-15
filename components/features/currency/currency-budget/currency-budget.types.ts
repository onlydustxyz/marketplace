import { Money } from "utils/Money/Money";

import { components } from "src/__generated/api";

export namespace TCurrencyBudget {
  export interface BudgetInfoRowProps {
    label: string;
    amount: number;
    currency: Money.Currency;
  }
  export interface CurrencyBudgetProps {
    selectedBudget?: components["schemas"]["BudgetResponse"];
    rewardAmount: string;
  }
}
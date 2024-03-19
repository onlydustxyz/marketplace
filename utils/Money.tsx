import { components } from "src/__generated/api";

/**
 * Namespace for handling money-related operations.
 * @namespace Money
 */
export namespace Money {
  export type Currency = components["schemas"]["ShortCurrencyResponse"];

  export interface IFormat {
    amount?: number | null;
    currency?: Currency;
    options?: {
      showCurrency?: boolean;
      locale?: string;
      currencyClassName?: string;
      prefixAmountWithTilde?: boolean;
      notation?: "standard" | "scientific" | "engineering" | "compact";
    };
  }

  export interface IFromSchema {
    code?: string | null;
    id?: string | null;
    name?: string | null;
    logoUrl?: string | null;
    decimals?: number | null;
  }

  /**
   * Represents the US Dollar currency.
   * @type {Currency}
   */
  export const USD: Currency = {
    id: "c2b27e1c-e070-42b2-82b3-7dd21f5193c6",
    code: "USD",
    name: "US Dollar",
    logoUrl: "https://staging-onlydust-app-images.s3.eu-west-1.amazonaws.com/f171e9690f6658e106a049cd62843ec4.png",
    decimals: 0,
  };

  /**
   * Mapping of currency codes to arrays of code.
   * @type {Object.<string, string[]>}
   */
  export const CodeMapping = {
    USD: ["USD"],
  };

  /**
   * Formats the given amount of money.
   * @param {IFormat} param0 - The format options.
   * @returns {{string: string, html: JSX.Element}} The formatted money.
   */
  export function format({ amount, currency, options }: IFormat) {
    if (amount === null || amount === undefined || !currency) {
      return {
        string: "N/A",
        html: <span>N/A</span>,
      };
    }

    const { showCurrency = true, locale = "en-US", currencyClassName, prefixAmountWithTilde, notation } = options || {};

    const withCurrency = (str: string) => {
      if (showCurrency) {
        return `${str} ${currency.code}`;
      }

      return str;
    };

    const withTilde = (str: string) => {
      if (prefixAmountWithTilde) {
        return `~${str}`;
      }

      return str;
    };

    /** need this to have fixed decimal places for compact notation */
    const maximumFractionDigits = notation === "compact" ? 1 : currency?.decimals;

    const formattedNumber = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      notation,
    })
      .format(amount)
      .toLowerCase();

    const string = withCurrency(withTilde(formattedNumber));

    const html = (
      <span>
        {withTilde(formattedNumber)}
        {showCurrency ? <span className={currencyClassName}>&nbsp;{currency.code}</span> : null}
      </span>
    );

    return {
      string,
      html,
    };
  }

  /**
   * Checks if the given currency is USD.
   * @param {Currency} currency - The currency to check.
   * @returns {boolean} Whether the currency is USD.
   */
  export function isUsd(currency?: Currency) {
    if (!currency) return false;

    return Money.CodeMapping.USD.includes(currency.code);
  }

  /**
   * Creates a currency object from schema properties.
   * @param {IFromSchema} props - The properties of the currency.
   * @returns {Currency} The currency object.
   */
  export function fromSchema(props: IFromSchema): Currency {
    return {
      id: props.id || "",
      code: props.code || "",
      name: props.name || "",
      logoUrl: props.logoUrl || "",
      decimals: props.decimals || 0,
    };
  }
}

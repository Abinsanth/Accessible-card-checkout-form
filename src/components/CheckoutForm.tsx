import { useState, type SubmitEvent } from "react";
import {
  detectNetwork,
  formatCardNumber,
  formatExpiry,
  hasValidLength,
  isValidCvv,
  isValidExpiry,
  isValidName,
  luhnCheck,
  toDigits,
} from "../lib/card";

type Errors = {
  cardNumber?: string;
  name?: string;
  expiry?: string;
  cvv?: string;
};

const networkLabel = { visa: "Visa", mastercard: "Mastercard", amex: "Amex" };

const inputClass = "mt-1 w-full rounded border border-slate-400 px-3 py-2";
const errorClass = "mt-1 text-sm text-red-700";

export default function CheckoutForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const network = detectNetwork(toDigits(cardNumber));

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the page reloading
    const digits = toDigits(cardNumber);
    const found: Errors = {};

    if (!hasValidLength(digits))
      found.cardNumber = "Card number must be 16 digits (15 for Amex).";
    else if (!luhnCheck(digits))
      found.cardNumber = "This card number isn't valid. Check for typos.";
    if (!isValidName(name)) found.name = "Enter the name shown on the card.";
    if (!isValidExpiry(expiry))
      found.expiry =
        "Enter a valid expiry date in MM/YY that isn't in the past.";
    if (!isValidCvv(cvv, digits))
      found.cvv =
        network === "amex" ? "CVV must be 4 digits." : "CVV must be 3 digits.";

    setErrors(found);
    setSuccess(Object.keys(found).length === 0);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4"
    >
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="card-number">Card number</label>
          {network && (
            <span className="rounded bg-slate-200 px-2 py-0.5 text-sm font-semibold">
              {networkLabel[network]}
            </span>
          )}
        </div>
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          className={inputClass}
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        />
        {errors.cardNumber && <p className={errorClass}>{errors.cardNumber}</p>}
      </div>

      <div>
        <label htmlFor="name">Cardholder name</label>
        <input
          id="name"
          type="text"
          autoComplete="cc-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="expiry">Expiry date (MM/YY)</label>
        <input
          id="expiry"
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          className={inputClass}
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
        />
        {errors.expiry && <p className={errorClass}>{errors.expiry}</p>}
      </div>

      <div>
        <label htmlFor="cvv">CVV</label>
        <input
          id="cvv"
          type="text"
          inputMode="numeric"
          autoComplete="cc-csc"
          className={inputClass}
          value={cvv}
          onChange={(e) => setCvv(toDigits(e.target.value).slice(0, 4))}
        />
        {errors.cvv && <p className={errorClass}>{errors.cvv}</p>}
      </div>

      <button
        type="submit"
        className="rounded bg-blue-700 px-4 py-3 font-semibold text-white"
      >
        Pay
      </button>
      {success && (
        <p className="rounded bg-green-100 p-3 text-green-800">
          Card details look valid. Nothing was sent or stored.
        </p>
      )}
    </form>
  );
}

import { useRef, useState, type SubmitEvent } from "react";
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

const inputClass =
  "mt-1 w-full rounded border border-slate-400 px-3 py-2 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 " +
  "aria-invalid:border-red-700";
const errorClass = "mt-1 text-sm text-red-700";

export default function CheckoutForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const network = detectNetwork(toDigits(cardNumber));

  const cardNumberRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the page reloading
    const digits = toDigits(cardNumber);
    const found: Errors = {};

    if (!hasValidLength(digits))
      found.cardNumber = "Card number must be 16 digits (15 for Amex).";
    else if (!luhnCheck(digits))
      found.cardNumber = "This card number isn't valid. Check for typos.";
    if (!isValidName(name))
      found.name = name.trim()
        ? "Name can't contain numbers."
        : "Enter the name shown on the card.";
    if (!isValidExpiry(expiry))
      found.expiry =
        "Enter a valid expiry date in MM/YY that isn't in the past.";
    if (!isValidCvv(cvv, digits))
      found.cvv =
        network === "amex" ? "CVV must be 4 digits." : "CVV must be 3 digits.";

    setErrors(found);
    setSuccess(Object.keys(found).length === 0);

    if (found.cardNumber) cardNumberRef.current?.focus();
    else if (found.name) nameRef.current?.focus();
    else if (found.expiry) expiryRef.current?.focus();
    else if (found.cvv) cvvRef.current?.focus();
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
          ref={cardNumberRef}
          id="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          className={inputClass}
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          aria-invalid={!!errors.cardNumber}
          aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
        />
        <div aria-live="polite">
          {errors.cardNumber && (
            <p id="card-number-error" className={errorClass}>
              {errors.cardNumber}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="name">Cardholder name</label>
        <input
          ref={nameRef}
          id="name"
          type="text"
          autoComplete="cc-name"
          maxLength={50}
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <div aria-live="polite">
          {errors.name && (
            <p id="name-error" className={errorClass}>
              {errors.name}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="expiry">Expiry date (MM/YY)</label>
        <input
          ref={expiryRef}
          id="expiry"
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          className={inputClass}
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          aria-invalid={!!errors.expiry}
          aria-describedby={errors.expiry ? "expiry-error" : undefined}
        />
        <div aria-live="polite">
          {errors.expiry && (
            <p id="expiry-error" className={errorClass}>
              {errors.expiry}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cvv">CVV</label>
        <input
          ref={cvvRef}
          id="cvv"
          type="text"
          inputMode="numeric"
          autoComplete="cc-csc"
          className={inputClass}
          value={cvv}
          onChange={(e) => setCvv(toDigits(e.target.value).slice(0, 4))}
          aria-invalid={!!errors.cvv}
          aria-describedby={errors.cvv ? "cvv-error" : undefined}
        />
        <div aria-live="polite">
          {errors.cvv && (
            <p id="cvv-error" className={errorClass}>
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Pay
      </button>
      <div role="status">
        {success && (
          <p className="rounded bg-green-100 p-3 text-green-800">
            Card details look valid. Nothing was sent or stored.
          </p>
        )}
      </div>
    </form>
  );
}

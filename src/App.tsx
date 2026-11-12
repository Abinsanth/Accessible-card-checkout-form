import CheckoutForm from "./components/CheckoutForm";
import logo from "./assets/logo.svg";

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" width={40} height={40} />
          <h1 className="text-2xl font-bold text-blue-700">Checkout</h1>
        </div>
        <CheckoutForm />
      </div>
    </main>
  );
}
export default App;

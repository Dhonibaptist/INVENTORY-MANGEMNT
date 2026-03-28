import { useState, useRef } from 'react';
import { productAPI, billingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [paymentMode, setPaymentMode] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef();

  const searchProducts = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await productAPI.getAll({ search: q, limit: 8 });
      setSearchResults(res.data.products);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    searchProducts(e.target.value);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    try {
      const res = await productAPI.getByBarcode(barcodeInput.trim());
      addToCart(res.data.product);
      setBarcodeInput('');
      barcodeRef.current?.focus();
    } catch {
      toast.error('Product not found for barcode: ' + barcodeInput);
      setBarcodeInput('');
    }
  };

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) { toast.error('Out of stock!'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        if (existing.qty >= product.stockQuantity) { toast.error('Max stock reached'); return prev; }
        return prev.map(i => i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
    setSearch('');
    setSearchResults([]);
    toast.success(`${product.name} added`, { duration: 1500 });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.product._id === id ? { ...i, qty: Math.min(qty, i.product.stockQuantity) } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product._id !== id));

  const subtotal = cart.reduce((s, i) => s + i.product.sellingPrice * i.qty, 0);
  const totalTax = cart.reduce((s, i) => s + (i.product.sellingPrice * i.qty * (i.product.taxRate / 100)), 0);
  const grandTotal = subtotal + totalTax - (parseFloat(discount) || 0);
  const change = (parseFloat(amountPaid) || 0) - grandTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (paymentMode === 'cash' && parseFloat(amountPaid) < grandTotal) {
      toast.error('Amount paid is less than grand total'); return;
    }
    setSubmitting(true);
    try {
      const res = await billingAPI.create({
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        items: cart.map(i => ({ product: i.product._id, quantity: i.qty, discount: i.discount })),
        paymentMode,
        amountPaid: parseFloat(amountPaid) || grandTotal,
        totalDiscount: parseFloat(discount) || 0,
      });
      setLastBill(res.data.bill);
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setDiscount(0);
      setAmountPaid('');
      toast.success(`Bill #${res.data.bill.billNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Billing failed');
    } finally { setSubmitting(false); }
  };

  const downloadPDF = async (billId) => {
    try {
      const res = await billingAPI.getPDF(billId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${billId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF generation failed'); }
  };

  return (
    <div className="animate-fade-in h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">POS Billing</h1>
        <p className="text-gray-400 text-sm">Point of sale — scan, add to cart, checkout</p>
      </div>

      {lastBill && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-emerald-400 font-semibold">✅ Bill Created: {lastBill.billNumber}</p>
            <p className="text-sm text-gray-400">Grand Total: ₹{lastBill.grandTotal?.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadPDF(lastBill._id)} className="btn-secondary text-xs">⬇ Download PDF</button>
            <button onClick={() => setLastBill(null)} className="text-gray-500 hover:text-gray-300 text-xs">✕ Dismiss</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Product search + Barcode */}
        <div className="lg:col-span-3 space-y-4">
          {/* Barcode scanner simulation */}
          <div className="card border border-sky-500/20 bg-sky-500/5">
            <p className="text-xs text-sky-400 font-semibold mb-2 uppercase tracking-wider">📷 Barcode Scanner</p>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <input
                ref={barcodeRef}
                className="input flex-1 font-mono"
                placeholder="Scan or type barcode and press Enter…"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary px-4">Add</button>
            </form>
            <p className="text-xs text-gray-500 mt-2">Focus here and scan barcode — product adds instantly</p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              className="input"
              placeholder="🔍  Search product by name…"
              value={search}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 bg-gray-900 border border-gray-700 rounded-xl mt-1 shadow-2xl overflow-hidden">
                {searchResults.map(p => (
                  <button
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-100">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category?.name} · Stock: {p.stockQuantity} {p.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-sky-400">₹{p.sellingPrice}</p>
                      {p.stockQuantity === 0 && <p className="text-xs text-red-400">Out of stock</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-200 text-sm">Cart ({cart.length} items)</h3>
              {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear All</button>}
            </div>
            {cart.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm">Cart is empty. Search or scan a product.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {cart.map(item => {
                  const total = item.product.sellingPrice * item.qty + (item.product.sellingPrice * item.qty * item.product.taxRate / 100);
                  return (
                    <div key={item.product._id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">₹{item.product.sellingPrice} × {item.qty} {item.product.taxRate > 0 && `+ ${item.product.taxRate}% tax`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.product._id, item.qty - 1)} className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors flex items-center justify-center">−</button>
                        <span className="text-sm font-semibold text-gray-100 w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.product._id, item.qty + 1)} className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors flex items-center justify-center">+</button>
                      </div>
                      <p className="text-sm font-bold text-sky-400 w-20 text-right">₹{total.toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.product._id)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-200 text-sm">Customer Details</h3>
            <input className="input" placeholder="Customer Name (optional)" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            <input className="input" placeholder="Phone (optional)" type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
          </div>

          {/* Payment */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-200 text-sm">Payment</h3>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'upi', 'card'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${paymentMode === mode ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}`}
                >
                  {mode === 'cash' ? '💵' : mode === 'upi' ? '📱' : '💳'} {mode.toUpperCase()}
                </button>
              ))}
            </div>
            <div>
              <label className="label">Discount (₹)</label>
              <input className="input" type="number" step="0.01" min="0" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0.00" />
            </div>
            {paymentMode === 'cash' && (
              <div>
                <label className="label">Amount Received (₹)</label>
                <input className="input" type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0.00" />
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="card space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tax</span><span>₹{totalTax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Discount</span><span>−₹{parseFloat(discount).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-white text-lg">
              <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
            </div>
            {paymentMode === 'cash' && amountPaid && (
              <div className={`flex justify-between text-sm font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>Change</span><span>₹{change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span> : `💳 Checkout — ₹${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/SideBar';
import Footer from './Layouts/Footer';

// Asset Icons Imports - Stepping up 2 levels to reach the src directory
import nameIcon from '../../assets/Owner/Billing/name_icon.svg'; 
import categoryIcon from '../../assets/Owner/Billing/category_icon.svg';
import priceIcon from '../../assets/Owner/Billing/price_icon.svg';
import discountIcon from '../../assets/Owner/Billing/discount_icon.svg';
import taxesIcon from '../../assets/Owner/Billing/taxes_icon.svg';
import amountIcon from '../../assets/Owner/Billing/amount_icon.svg';
import downloadIcon from '../../assets/Owner/Billing/download_icon.svg';

const Billing = () => {
    // Form structural inputs state management
    const [searchClient, setSearchClient] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [amount, setAmount] = useState('450');
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState('');
    const [taxes, setTaxes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Phonepe');
    const [invoiceNote, setInvoiceNote] = useState('');

    // Historical ledger transaction records state matching the layout grid
    const [billingHistory] = useState([
        {
            id: 'inv_1001',
            name: 'Mitesh Waghmode',
            description: 'Hair cut and Shaving',
            date: '02-05-2026',
            amount: '₹ 450',
            method: 'Phonepe'
        }
    ]);

    const handleQuantityIncrement = () => setQuantity(prev => prev + 1);
    const handleQuantityDecrement = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    const handleSubmitInvoice = (e) => {
        e.preventDefault();
        console.log("Submitting Invoice System Data:", {
            searchClient, selectedService, amount, quantity,
            discount, taxes, paymentMethod, invoiceNote
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between text-gray-800 antialiased">
            {/* GLOBAL TOP NAVIGATION PANEL */}
            <Navbar />

            {/* TWO COLUMN INTEGRATION BODY WRAPPER CONTAINER */}
            <div className="flex flex-1 w-full items-stretch">
                
                {/* PRIMARY WORKSPACE FLOW NAVIGATION CONTROL */}
                <Sidebar activeTab="Billing" />

                {/* ACTIVE SUBSYSTEM MONITOR DISPLAY CANVAS ENVIRONMENT */}
                <main className="flex-1 min-w-0 p-6 md:p-8 bg-white border-l border-gray-200 space-y-8">
                    
                    {/* Header Action Section Block Tab Trigger */}
                    <div className="max-w-4xl mx-auto border-b border-gray-100 pb-2">
                        <div className="inline-flex items-center space-x-2 text-[13px] font-bold text-gray-900 border-b-2 border-[#FF0B01] pb-2 cursor-pointer">
                            <span className="text-[15px] font-normal">+</span>
                            <span>BILLING</span>
                        </div>
                    </div>

                    {/* INVOICE CONSTRUCTOR CONFIGURATOR CARD PANEL */}
                    <div className="max-w-4xl mx-auto border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                        <form onSubmit={handleSubmitInvoice} className="space-y-5">
                            
                            {/* Input Form Segment 1: Client Identity & Target Service Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={nameIcon} alt="name" className="w-4 h-4 object-contain" />
                                    </span>
                                    <input
                                        type="text"
                                        value={searchClient}
                                        onChange={(e) => setSearchClient(e.target.value)}
                                        placeholder="Search By Name, Number"
                                        className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={categoryIcon} alt="category" className="w-4 h-4 object-contain" />
                                    </span>
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-500"
                                    >
                                        <option value="">Select Service</option>
                                        <option value="haircut">Hair cut and Shaving</option>
                                        <option value="spa">Hair Spa Treatments</option>
                                        <option value="facial">Facial Glow Pack</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-[8px]">▼</span>
                                </div>
                            </div>

                            {/* Input Form Segment 2: Financial Operational Values & Quantity Step Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={amountIcon} alt="price" className="w-4 h-4 object-contain" />
                                    </span>
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Amount"
                                        className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                                
                                {/* Specialized Quantity Counter Module Wrapper */}
                                <div className="flex items-center space-x-2 justify-start">
                                    <button
                                        type="button"
                                        onClick={handleQuantityDecrement}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md text-gray-600 font-bold hover:bg-gray-200 text-[14px] select-none"
                                    >
                                        —
                                    </button>
                                    <span className="w-10 text-center font-bold text-[12px] text-gray-800">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleQuantityIncrement}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md text-gray-600 font-bold hover:bg-gray-200 text-[14px] select-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Input Form Segment 3: Deductible Discounts & Government Matrix Taxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={discountIcon} alt="discount" className="w-4 h-4 object-contain" />
                                    </span>
                                    <select
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-500"
                                    >
                                        <option value="">Discount</option>
                                        <option value="5">5% Off</option>
                                        <option value="10">10% Off</option>
                                        <option value="fixed">Flat ₹50</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-[8px]">▼</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={taxesIcon} alt="tax" className="w-4 h-4 object-contain" />
                                    </span>
                                    <select
                                        value={taxes}
                                        onChange={(e) => setTaxes(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-500"
                                    >
                                        <option value="">Taxes</option>
                                        <option value="5">GST 5%</option>
                                        <option value="12">GST 12%</option>
                                        <option value="18">GST 18%</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-[8px]">▼</span>
                                </div>
                            </div>

                            <hr className="border-gray-100 my-2" />

                            {/* Subtotal Financial Calculation Summary Block Row */}
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-900 px-1 tracking-tight">
                                <span>AMOUNT PAYABLE</span>
                                <span>₹ {parseInt(amount || 0) * quantity}</span>
                            </div>

                            {/* Input Form Segment 4: Total Cost Calculation & Gateway Sub-channels */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <img src={priceIcon} alt="amount" className="w-4 h-4 object-contain" />
                                    </span>
                                    <select
                                        value={amount}
                                        disabled
                                        className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFA] text-[11px] font-bold border border-gray-200 rounded-lg appearance-none text-gray-700 focus:outline-none cursor-not-allowed"
                                    >
                                        <option value={amount}>{parseInt(amount || 0) * quantity}</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-[8px]">▼</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFA] text-[11px] font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 appearance-none text-gray-700"
                                    >
                                        <option value="Phonepe">Phonepe</option>
                                        <option value="GPay">Google Pay</option>
                                        <option value="Cash">Cash payment</option>
                                        <option value="Card">Credit/Debit Card</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none text-[8px]">▼</span>
                                </div>
                            </div>

                            {/* Input Form Segment 5: Invoice Note */}
                            <div className="relative">
                                <textarea
                                    value={invoiceNote}
                                    onChange={(e) => setInvoiceNote(e.target.value)}
                                    placeholder="Note"
                                    rows="2"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] text-[11px] font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none placeholder-gray-400"
                                />
                            </div>

                            {/* Action Submission Trigger Controllers */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-[#FF0B01] text-white font-bold text-[12px] rounded-lg shadow-sm hover:bg-red-700 transition-colors uppercase tracking-wider"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-[12px] rounded-lg shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* RECENT HISTORICAL INVOICES LEDGER DATA TABULAR MATRIX */}
                    <div className="max-w-4xl mx-auto overflow-x-auto">
                        <table className="w-full border-collapse min-w-[650px]">
                            
                            {/* Data Grid Section Row Headers */}
                            <thead>
                                <tr className="bg-[#EFEFEF]/60 text-left text-[11px] font-bold text-gray-800 tracking-wider">
                                    <th className="py-2.5 px-4 rounded-l-lg">Billing Name</th>
                                    <th className="py-2.5 px-4">Description</th>
                                    <th className="py-2.5 px-4">Date</th>
                                    <th className="py-2.5 px-4">Amount</th>
                                    <th className="py-2.5 px-4">payment method</th>
                                    <th className="py-2.5 pr-4 text-center rounded-r-lg w-24"></th>
                                </tr>
                            </thead>

                            {/* Iterative Ledger History Data Rows */}
                            <tbody className="divide-y divide-gray-100">
                                {billingHistory.map((invoice) => (
                                    <tr key={invoice.id} className="text-[11px] font-semibold text-gray-700 hover:bg-gray-50/40 transition-colors">
                                        <td className="py-4 px-4 text-gray-900 font-bold">
                                            {invoice.name}
                                        </td>
                                        <td className="py-4 px-4 font-medium text-gray-600 max-w-[180px] truncate">
                                            {invoice.description}
                                        </td>
                                        <td className="py-4 px-4 font-medium text-gray-500">
                                            {invoice.date}
                                        </td>
                                        <td className="py-4 px-4 text-gray-900 font-bold">
                                            {invoice.amount}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-gray-800">
                                            {invoice.method}
                                        </td>
                                        <td className="py-4 pr-4 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => console.log(`Downloading target document schema node: ${invoice.id}`)}
                                                className="inline-flex items-center space-x-1 border border-gray-300 rounded px-2 py-0.5 text-[9px] text-gray-600 font-bold hover:bg-gray-50 shadow-xs transition-colors"
                                            >
                                                <img src={downloadIcon} alt="download" className="w-3 h-3 object-contain" />
                                                <span className="tracking-tighter">Download</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                </main>
            </div>

            {/* GLOBAL REUSABLE APPLICATION FOOTER PANEL */}
            <Footer />
        </div>
    );
}

export default Billing;
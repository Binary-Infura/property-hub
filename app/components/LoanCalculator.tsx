'use client';

import React, { useState, useEffect } from 'react';

export default function LoanCalculator() {
    const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        calculateEMI();
    }, [loanAmount, interestRate, tenure]);

    const calculateEMI = () => {
        const p = loanAmount;
        const r = interestRate / 12 / 100;
        const n = tenure * 12;

        if (r === 0) {
            const calculatedEmi = p / n;
            setEmi(Math.round(calculatedEmi));
            setTotalInterest(0);
            setTotalAmount(p);
            return;
        }

        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmt = emiValue * n;
        const totalInt = totalAmt - p;

        setEmi(Math.round(emiValue));
        setTotalInterest(Math.round(totalInt));
        setTotalAmount(Math.round(totalAmt));
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <section className="py-20 md:py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-pulse"></div>

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Plan Your Purchase
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Use our interactive loan calculator to estimate your monthly installments and plan your dream home.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center bg-gray-50 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                    {/* Inputs Section */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-700 font-semibold">Loan Amount</label>
                                <span className="text-blue-600 font-bold text-lg">{formatCurrency(loanAmount)}</span>
                            </div>
                            <input
                                type="range"
                                min="100000"
                                max="100000000"
                                step="100000"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>1L</span>
                                <span>10Cr</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-700 font-semibold">Interest Rate (p.a)</label>
                                <span className="text-blue-600 font-bold text-lg">{interestRate}%</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>5%</span>
                                <span>20%</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-700 font-semibold">Tenure (Years)</label>
                                <span className="text-blue-600 font-bold text-lg">{tenure} Yrs</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="1"
                                value={tenure}
                                onChange={(e) => setTenure(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>1 Yr</span>
                                <span>30 Yrs</span>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-inner border border-gray-100 flex flex-col justify-center space-y-8 h-full">
                        <div className="text-center">
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Monthly EMI</p>
                            <h3 className="text-5xl font-extrabold text-blue-600 mb-2">
                                {formatCurrency(emi)}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Total Interest</p>
                                <p className="font-bold text-gray-800">{formatCurrency(totalInterest)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                <p className="font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <a
                                href="/consultation"
                                className="w-full block text-center bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95"
                            >
                                Get Expert Advice
                            </a>
                            <p className="text-[10px] text-gray-400 mt-4 text-center italic">
                                *Calculations are based on the inputs provided and may vary upon actual bank terms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

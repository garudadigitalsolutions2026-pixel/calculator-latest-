/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, History, Settings, Moon, Sun } from 'lucide-react';

type Operation = '+' | '-' | '*' | '/' | null;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const calculate = useCallback((first: number, second: number, op: Operation): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second !== 0 ? first / second : 0;
      default: return second;
    }
  }, []);

  const handleNumber = useCallback((num: string) => {
    setDisplay(prev => {
      if (shouldResetDisplay) {
        setShouldResetDisplay(false);
        return num;
      }
      return prev === '0' ? num : prev + num;
    });
  }, [shouldResetDisplay]);

  const handleOperation = useCallback((op: Operation) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setPreviousValue(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setShouldResetDisplay(true);
  }, [display, previousValue, operation, calculate]);

  const handleEqual = useCallback(() => {
    if (previousValue === null || !operation) return;
    const current = parseFloat(display);
    const result = calculate(previousValue, current, operation);
    const calculationString = `${previousValue} ${operation} ${current} = ${result}`;
    setHistory(prev => [calculationString, ...prev].slice(0, 10));
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  }, [display, previousValue, operation, calculate]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  }, []);

  const handlePercentage = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) * -1));
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (e.key === '+') handleOperation('+');
      if (e.key === '-') handleOperation('-');
      if (e.key === '*') handleOperation('*');
      if (e.key === '/') handleOperation('/');
      if (e.key === 'Enter' || e.key === '=') handleEqual();
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === '.') {
        setDisplay(prev => prev.includes('.') ? prev : prev + '.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperation, handleEqual, handleClear, handleBackspace]);

  const Button = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    children: ReactNode, 
    onClick: () => void, 
    className?: string,
    variant?: 'default' | 'operator' | 'action'
  }) => {
    const variants = {
      default: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100',
      operator: 'bg-orange-500 hover:bg-orange-400 text-white',
      action: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`h-16 md:h-20 rounded-2xl text-xl font-medium transition-colors flex items-center justify-center ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 font-sans">
      <div className="w-full max-w-md aspect-[9/19] md:aspect-auto md:h-[800px] glass rounded-[3rem] overflow-hidden flex flex-col relative shadow-2xl shadow-black/50 border-zinc-800">
        
        {/* Top Bar */}
        <div className="p-6 flex justify-between items-center z-20">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <History className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 flex flex-col justify-end p-8 text-right relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={previousValue + (operation || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-zinc-500 text-lg font-mono mb-2 h-7"
            >
              {previousValue !== null && `${previousValue} ${operation || ''}`}
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            layoutId="display"
            className="text-6xl md:text-7xl font-mono font-medium tracking-tighter overflow-hidden text-ellipsis"
          >
            {display}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-zinc-900/50 backdrop-blur-md rounded-t-[2.5rem] border-t border-white/5">
          <Button onClick={handleClear} variant="action">AC</Button>
          <Button onClick={handleToggleSign} variant="action">+/-</Button>
          <Button onClick={handlePercentage} variant="action">%</Button>
          <Button onClick={() => handleOperation('/')} variant="operator">÷</Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperation('*')} variant="operator">×</Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleOperation('-')} variant="operator">−</Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleOperation('+')} variant="operator">+</Button>

          <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
          <Button onClick={() => { if (!display.includes('.')) setDisplay(prev => prev + '.'); }}>.</Button>
          <Button onClick={handleEqual} variant="operator">=</Button>
        </div>

        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-zinc-950 z-30 p-8 pt-20 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold">History</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {history.length === 0 ? (
                  <p className="text-zinc-500 text-center mt-20">No history yet</p>
                ) : (
                  history.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="text-right p-4 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="text-zinc-400 text-sm mb-1">Calculation</div>
                      <div className="text-xl font-mono">{item}</div>
                    </motion.div>
                  ))
                )}
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="mt-4 p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors"
                >
                  Clear History
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home Indicator (iOS style) */}
        <div className="h-1.5 w-32 bg-zinc-800 rounded-full mx-auto mb-2 mt-4 opacity-50" />
      </div>
    </div>
  );
}

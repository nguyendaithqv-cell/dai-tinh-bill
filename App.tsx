
import React, { useState, useEffect, useRef } from 'react';
import { BillItem } from './types';
import NumberPad from './components/NumberPad';
import { parseReceiptWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [editingItem, setEditingItem] = useState<BillItem | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const historyEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(val);
  };

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  // Evaluate simple expressions like "4*20000" safely
  const evaluateInput = (input: string): number => {
    try {
      // Basic sanitization: only allow digits, ., *, /
      const cleanInput = input.replace(/[^0-9.*\/-]/g, '');
      if (!cleanInput) return 0;
      
      // Use Function instead of eval for slightly better control, though still careful
      // For a simple pub calculator, we can also manually parse but this is efficient
      const result = new Function(`return ${cleanInput}`)();
      return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const handleInput = (val: string) => {
    if (currentInput.length > 20) return;
    
    // Prevent starting with operators
    if (currentInput === '' && ['*', '/', '.'].includes(val)) return;
    
    // Prevent consecutive operators
    const lastChar = currentInput.slice(-1);
    if (['*', '/', '.'].includes(lastChar) && ['*', '/', '.'].includes(val)) return;

    setCurrentInput(prev => prev + val);
  };

  const handleDeleteInput = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  const handleClearInput = () => {
    setCurrentInput('');
  };

  const handleConfirmItem = (isNegative: boolean = false) => {
    const calculatedValue = evaluateInput(currentInput);
    if (calculatedValue !== 0) {
      const amount = isNegative ? -Math.abs(calculatedValue) : Math.abs(calculatedValue);
      const newItem: BillItem = {
        id: crypto.randomUUID(),
        amount,
        timestamp: Date.now(),
        label: isNegative ? `Trừ bớt` : (currentInput.includes('*') || currentInput.includes('/') ? `Tính: ${currentInput.replace('*', 'x').replace('/', '÷')}` : `Món ${items.length + 1}`)
      };
      setItems(prev => [...prev, newItem]);
      setCurrentInput('');
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const startEdit = (item: BillItem) => {
    setEditingItem(item);
    setEditValue(Math.abs(item.amount).toString());
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const newVal = parseFloat(editValue);
    if (!isNaN(newVal)) {
      const isNegative = editingItem.amount < 0;
      setItems(prev => prev.map(it => 
        it.id === editingItem.id 
        ? { ...it, amount: isNegative ? -newVal : newVal } 
        : it
      ));
      setEditingItem(null);
    }
  };

  const resetAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ hóa đơn này?')) {
      setItems([]);
      setCurrentInput('');
    }
  };

  const shareSummary = () => {
    if (items.length === 0) return;
    const summary = items.map((item, idx) => 
      `${idx + 1}. ${item.label}: ${formatCurrency(item.amount)}`
    ).join('\n');
    const finalMsg = `${summary}\n------------------\nTỔNG CỘNG: ${formatCurrency(total)}`;
    
    navigator.clipboard.writeText(finalMsg).then(() => {
      alert("Đã sao chép nội dung hóa đơn!");
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const results = await parseReceiptWithAI(base64);
        
        const newItems: BillItem[] = results.map(r => ({
          id: crypto.randomUUID(),
          amount: r.amount,
          label: r.label,
          timestamp: Date.now()
        }));
        
        setItems(prev => [...prev, ...newItems]);
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Lỗi khi quét ảnh. Vui lòng thử lại!");
      setIsScanning(false);
    }
  };

  const displayInput = currentInput.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ');
  const previewValue = evaluateInput(currentInput);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 shadow-2xl overflow-hidden relative border-x border-slate-800">
      {/* Header */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-calculator text-slate-900"></i>
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">Đại tính <span className="text-amber-500">bill</span></h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-800 rounded-xl text-slate-300 active:bg-slate-700 transition-colors"
            title="Quét hóa đơn"
          >
            <i className="fa-solid fa-camera"></i>
          </button>
          <button 
            onClick={resetAll}
            className="p-2.5 bg-rose-900/30 text-rose-400 rounded-xl active:bg-rose-900/50 transition-colors"
            title="Làm mới"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </header>

      {/* History Area */}
      <main className="flex-1 overflow-y-auto p-4 hide-scrollbar space-y-3 bg-slate-950">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <i className="fa-solid fa-receipt text-3xl"></i>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">Danh sách món</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className={`group flex justify-between items-center p-3 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                  item.amount < 0 
                  ? 'bg-rose-900/10 border-rose-900/30' 
                  : 'bg-slate-900/50 border-slate-800/50'
                } animate-in fade-in slide-in-from-right-4`}
              >
                <div 
                  className="flex-1 flex flex-col cursor-pointer"
                  onClick={() => startEdit(item)}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.amount < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    #{idx + 1} {item.label} <i className="fa-solid fa-pencil ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </span>
                  <span className={`text-lg font-black tabular-nums ${item.amount < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-rose-500 active:scale-90 transition-transform"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        <div ref={historyEndRef} className="h-4" />
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="absolute inset-0 bg-slate-950/80 z-[60] flex items-end justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg uppercase tracking-wider">Sửa giá món</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white">
                <i className="fa-solid fa-circle-xmark text-2xl"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Giá mới (VND):</label>
              <input 
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-3xl font-black text-amber-500 text-center focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setEditingItem(null)}
                className="py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold uppercase active:scale-95 transition-transform"
              >
                Hủy
              </button>
              <button 
                onClick={saveEdit}
                className="py-4 bg-amber-500 text-slate-900 rounded-2xl font-bold uppercase active:scale-95 transition-transform"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center space-y-4 backdrop-blur-md">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-amber-500/20 rounded-full"></div>
             <div className="absolute inset-0 w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-amber-500 font-black tracking-widest text-lg text-glow">AI SCANNING</p>
            <p className="text-slate-500 text-xs">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      )}

      {/* Totals Section */}
      <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center mb-2">
           <div className="flex flex-col flex-1">
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Biểu thức</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-400 tabular-nums truncate max-w-[150px]">
                  {displayInput || '0'}
                </span>
                {currentInput.match(/[*/]/) && (
                  <span className="text-sm font-bold text-amber-500/80">
                    = {formatCurrency(previewValue)}
                  </span>
                )}
              </div>
           </div>
           <button 
            onClick={shareSummary}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-amber-500 text-xs font-bold border border-amber-500/20 active:scale-95 transition-all shadow-sm"
           >
             <i className="fa-solid fa-share-nodes"></i>
             GỬI BILL
           </button>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
          <span className="text-white font-black text-lg">TỔNG CỘNG:</span>
          <span className="text-3xl font-black text-amber-500 tabular-nums drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Numpad */}
      <NumberPad 
        onInput={handleInput} 
        onClear={handleClearInput} 
        onDelete={handleDeleteInput} 
        onConfirm={handleConfirmItem} 
      />
    </div>
  );
};

export default App;

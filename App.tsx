
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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
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
    // Kiểm tra xem đã cài vào màn hình chính chưa (chế độ standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone) {
      const hasSeenGuide = localStorage.getItem('hasSeenInstallGuide');
      if (!hasSeenGuide) {
        setShowInstallGuide(true);
      }
    }
  }, [items]);

  const evaluateInput = (input: string): number => {
    try {
      const cleanInput = input.replace(/[^0-9.*\/-]/g, '');
      if (!cleanInput) return 0;
      const result = new Function(`return ${cleanInput}`)();
      return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const handleInput = (val: string) => {
    if (currentInput.length > 20) return;
    if (currentInput === '' && ['*', '/', '.'].includes(val)) return;
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
        try {
          const base64 = event.target?.result as string;
          const results = await parseReceiptWithAI(base64);
          
          if (results.length === 0) {
            alert("AI không tìm thấy số tiền nào trong ảnh. Anh hãy chụp rõ hơn nhé!");
          } else {
            const newItems: BillItem[] = results.map(r => ({
              id: crypto.randomUUID(),
              amount: r.amount,
              label: r.label,
              timestamp: Date.now()
            }));
            setItems(prev => [...prev, ...newItems]);
          }
        } catch (innerErr: any) {
          alert(innerErr.message || "Lỗi khi AI đang xử lý.");
        } finally {
          setIsScanning(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        alert("Lỗi khi đọc file ảnh từ điện thoại.");
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Đã có lỗi xảy ra. Anh vui lòng thử lại!");
      setIsScanning(false);
    }
  };

  const closeGuide = () => {
    setShowInstallGuide(false);
    localStorage.setItem('hasSeenInstallGuide', 'true');
  };

  const displayInput = currentInput.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ');
  const previewValue = evaluateInput(currentInput);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 shadow-2xl overflow-hidden relative border-x border-slate-800">
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
            <i className="fa-solid fa-calculator text-slate-900 text-sm"></i>
          </div>
          <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">Đại tính <span className="text-amber-500">bill</span></h1>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-800 rounded-lg text-slate-300 active:bg-slate-700 transition-colors"
          >
            <i className="fa-solid fa-camera text-sm"></i>
          </button>
          <button 
            onClick={resetAll}
            className="p-2 bg-rose-900/30 text-rose-400 rounded-lg active:bg-rose-900/50 transition-colors"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      </header>

      <main className="flex-1 overflow-y-auto p-3 hide-scrollbar space-y-2 bg-slate-950">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <i className="fa-solid fa-receipt text-2xl opacity-30"></i>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 text-center px-8">Danh sách trống</p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className={`flex justify-between items-center p-3.5 rounded-xl border transition-all active:scale-[0.97] ${
                  item.amount < 0 
                  ? 'bg-rose-950/20 border-rose-900/40' 
                  : 'bg-slate-900/60 border-slate-800/80'
                } animate-in fade-in slide-in-from-right-2`}
              >
                <div className="flex-1 min-w-0 pr-3 cursor-pointer" onClick={() => startEdit(item)}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[11px] font-extrabold uppercase tracking-wide truncate ${item.amount < 0 ? 'text-rose-400' : 'text-amber-500/80'}`}>
                      {item.label}
                    </span>
                    <i className="fa-solid fa-pencil text-[8px] text-slate-600"></i>
                  </div>
                  <div className={`text-xl font-black tabular-nums leading-none ${item.amount < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {formatCurrency(item.amount)}
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 active:text-rose-500 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        <div ref={historyEndRef} className="h-2" />
      </main>

      {/* Install Guide Overlay for iPhone */}
      {showInstallGuide && (
        <div className="absolute inset-0 bg-slate-950/90 z-[100] flex items-end justify-center pb-20 p-6 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full text-center relative animate-in slide-in-from-bottom-10">
            <div className="w-16 h-1 w-12 bg-slate-700 rounded-full mx-auto mb-6"></div>
            <i className="fa-solid fa-mobile-screen-button text-4xl text-amber-500 mb-4"></i>
            <h2 className="text-xl font-black text-white mb-2">Cài đặt App vào máy</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Anh Đại bấm vào nút <i className="fa-solid fa-share-from-square mx-1"></i> (Chia sẻ) bên dưới, sau đó chọn <b>"Thêm vào màn hình chính"</b> để cài đặt App nhé!
            </p>
            <button 
              onClick={closeGuide}
              className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="absolute inset-0 bg-slate-950/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-sm uppercase">Sửa giá món</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <input 
              type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-2xl font-black text-amber-500 text-center mb-4 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditingItem(null)} className="py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold uppercase">Hủy</button>
              <button onClick={saveEdit} className="py-3 bg-amber-500 text-slate-900 rounded-xl text-sm font-bold uppercase">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-500 font-black tracking-widest text-sm uppercase">Đang quét bill...</p>
        </div>
      )}

      <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 shadow-2xl shrink-0">
        <div className="flex justify-between items-center mb-2">
           <div className="min-w-0 flex-1">
              <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest block mb-0.5">Đang nhập</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-300 tabular-nums truncate">
                  {displayInput || '0'}
                </span>
                {currentInput.match(/[*/]/) && (
                  <span className="text-xs font-bold text-amber-500 shrink-0">
                    = {formatCurrency(previewValue)}
                  </span>
                )}
              </div>
           </div>
           <button 
            onClick={shareSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 rounded-lg text-slate-900 text-[10px] font-black uppercase active:scale-95 transition-all shadow-lg"
           >
             <i className="fa-solid fa-share-nodes"></i>
             Gửi Bill
           </button>
        </div>
        
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/50">
          <span className="text-white font-extrabold text-sm uppercase">Tổng:</span>
          <span className="text-2xl font-black text-amber-500 tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="shrink-0 bg-slate-900">
        <NumberPad 
          onInput={handleInput} 
          onClear={handleClearInput} 
          onDelete={handleDeleteInput} 
          onConfirm={handleConfirmItem} 
        />
      </div>
    </div>
  );
};

export default App;

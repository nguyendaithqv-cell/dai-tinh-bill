
import React from 'react';

interface NumberPadProps {
  onInput: (val: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onConfirm: (isNegative?: boolean) => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onInput, onClear, onDelete, onConfirm }) => {
  const numberButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '000', '.'
  ];

  const operators = [
    { label: '÷', value: '/' },
    { label: '×', value: '*' }
  ];

  return (
    <div className="flex flex-col bg-slate-900 border-t border-slate-800 pb-8 px-2 pt-2">
      {/* Operators Row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {operators.map((op) => (
          <button
            key={op.value}
            onClick={() => onInput(op.value)}
            className="flex items-center justify-center text-xl font-bold p-3 rounded-xl bg-indigo-600 text-white shadow-lg active:scale-95 transition-all"
          >
            {op.label}
          </button>
        ))}
        <button onClick={onDelete} className="flex items-center justify-center text-xl font-bold p-3 rounded-xl bg-slate-700 text-white shadow-lg active:scale-95 transition-all">
          <i className="fa-solid fa-delete-left"></i>
        </button>
        <button onClick={onClear} className="flex items-center justify-center text-xl font-bold p-3 rounded-xl bg-rose-600 text-white shadow-lg active:scale-95 transition-all">
          C
        </button>
      </div>

      <div className="flex gap-2">
        {/* Number Grid */}
        <div className="grid grid-cols-3 gap-2 flex-[3]">
          {numberButtons.map((btn) => (
            <button
              key={btn}
              onClick={() => onInput(btn)}
              className="flex items-center justify-center text-xl font-bold p-4 rounded-xl bg-slate-800 text-white shadow-md border border-slate-700/50 active:scale-95 transition-all"
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Big Action Column */}
        <div className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => onConfirm(true)} 
            className="flex-1 flex flex-col items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg hover:bg-orange-500 active:scale-95 transition-all p-2"
          >
            <i className="fa-solid fa-minus text-xl mb-1"></i>
            <span className="text-[10px] font-bold">TRỪ</span>
          </button>
          <button 
            onClick={() => onConfirm(false)} 
            className="flex-[2] flex flex-col items-center justify-center rounded-xl bg-amber-500 text-slate-900 shadow-lg hover:bg-amber-400 active:scale-95 transition-all p-2"
          >
            <i className="fa-solid fa-plus text-2xl mb-1 font-black"></i>
            <span className="text-xs font-black">THÊM</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;

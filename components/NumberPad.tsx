
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
    <div className="flex flex-col bg-slate-950 border-t border-slate-800 pb-2 px-1.5 pt-1.5">
      {/* Operators Row - Slimmer */}
      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
        {operators.map((op) => (
          <button
            key={op.value}
            onClick={() => onInput(op.value)}
            className="flex items-center justify-center text-lg font-bold py-2.5 rounded-lg bg-indigo-600 text-white active:bg-indigo-500 transition-all"
          >
            {op.label}
          </button>
        ))}
        <button onClick={onDelete} className="flex items-center justify-center text-lg rounded-lg bg-slate-700 text-white active:bg-slate-600 transition-all">
          <i className="fa-solid fa-delete-left"></i>
        </button>
        <button onClick={onClear} className="flex items-center justify-center text-lg font-bold rounded-lg bg-rose-600 text-white active:bg-rose-500 transition-all">
          C
        </button>
      </div>

      <div className="flex gap-1.5">
        {/* Number Grid - Compact */}
        <div className="grid grid-cols-3 gap-1.5 flex-[3]">
          {numberButtons.map((btn) => (
            <button
              key={btn}
              onClick={() => onInput(btn)}
              className="flex items-center justify-center text-xl font-bold py-3.5 rounded-lg bg-slate-800 text-white border border-slate-700/30 active:bg-slate-700 transition-all"
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Action Column - Slimmer but tall */}
        <div className="flex flex-col gap-1.5 flex-1">
          <button 
            onClick={() => onConfirm(true)} 
            className="flex-1 flex flex-col items-center justify-center rounded-lg bg-orange-600 text-white active:bg-orange-500 transition-all px-1"
          >
            <i className="fa-solid fa-minus text-sm mb-0.5"></i>
            <span className="text-[9px] font-black uppercase">Trừ</span>
          </button>
          <button 
            onClick={() => onConfirm(false)} 
            className="flex-[2] flex flex-col items-center justify-center rounded-lg bg-amber-500 text-slate-950 active:bg-amber-400 transition-all px-1"
          >
            <i className="fa-solid fa-plus text-xl mb-0.5 font-black"></i>
            <span className="text-[10px] font-black uppercase">Thêm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;

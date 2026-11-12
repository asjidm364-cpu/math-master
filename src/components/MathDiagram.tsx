import React from 'react';

interface MathDiagramProps {
  type?: 'triangle' | 'rectangle' | 'circle' | 'fraction_pie';
  props?: Record<string, number | string>;
}

export const MathDiagram: React.FC<MathDiagramProps> = ({ type, props }) => {
  if (!type || !props) return null;

  if (type === 'rectangle') {
    const length = props.length || 8;
    const width = props.width || 5;

    return (
      <div className="flex flex-col items-center justify-center my-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto">
        <div className="text-xs font-semibold text-slate-500 mb-1">Width = {width}</div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-500 [writing-mode:vertical-lr] rotate-180">
            Length = {length}
          </div>
          <div className="w-36 h-24 bg-indigo-100/70 border-2 border-indigo-500 rounded-md flex items-center justify-center relative shadow-inner">
            <span className="text-xs font-bold text-indigo-700">Area = ?</span>
            {/* Right angle marks */}
            <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-indigo-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'triangle') {
    const a1 = props.angle1;
    const a2 = props.angle2;
    const base = props.base;
    const height = props.height;

    return (
      <div className="flex flex-col items-center justify-center my-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto">
        <svg viewBox="0 0 160 110" className="w-40 h-28">
          <polygon
            points="80,15 20,95 140,95"
            className="fill-emerald-100/70 stroke-emerald-600 stroke-2"
          />
          {a1 && (
            <text x="35" y="88" className="text-[10px] fill-emerald-800 font-bold">
              {a1}°
            </text>
          )}
          {a2 && (
            <text x="110" y="88" className="text-[10px] fill-emerald-800 font-bold">
              {a2}°
            </text>
          )}
          {a1 && a2 && (
            <text x="75" y="38" className="text-[11px] fill-amber-700 font-bold">
              ?°
            </text>
          )}
          {base && (
            <text x="70" y="105" className="text-[10px] fill-slate-700 font-semibold">
              b = {base}
            </text>
          )}
          {height && (
            <>
              <line x1="80" y1="15" x2="80" y2="95" stroke="#059669" strokeDasharray="3,3" strokeWidth="1.5" />
              <text x="85" y="55" className="text-[10px] fill-slate-700 font-semibold">
                h = {height}
              </text>
            </>
          )}
        </svg>
      </div>
    );
  }

  if (type === 'fraction_pie') {
    const num = Number(props.numerator) || 3;
    const den = Number(props.denominator) || 8;

    const slices = [];
    const angleStep = 360 / den;
    const radius = 45;
    const cx = 55;
    const cy = 55;

    for (let i = 0; i < den; i++) {
      const startAngle = (i * angleStep - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * angleStep - 90) * (Math.PI / 180);

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const isShaded = i < num;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      slices.push(
        <path
          key={i}
          d={pathData}
          className={`${
            isShaded ? 'fill-indigo-500 stroke-indigo-600' : 'fill-slate-100 stroke-slate-300'
          } stroke-1`}
        />
      );
    }

    return (
      <div className="flex items-center justify-center gap-3 my-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto">
        <svg viewBox="0 0 110 110" className="w-24 h-24">
          {slices}
        </svg>
        <div className="text-xs font-semibold text-slate-600">
          <div className="text-indigo-600 font-bold">{num} shaded parts</div>
          <div>out of {den} total</div>
        </div>
      </div>
    );
  }

  return null;
};

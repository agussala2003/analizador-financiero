import { fmtDate, pct } from "../../utils/financial";
import CalculatorIcon from "./CalculatorIcon";

export default function MobileDividendCard({ item, onOpenCalculator }) {
  return (
    <article className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
           <h4 className="text-base font-semibold text-white tracking-wide">
             {item.symbol}
           </h4>
           <button onClick={() => onOpenCalculator(item)} className="text-blue-400 hover:text-blue-300" title="Calcular dividendo">
             <CalculatorIcon className="w-4 h-4" />
           </button>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">Dividendo</div>
          <div className="text-lg font-semibold text-white">${item.dividend ?? "—"}</div>
          <div className="text-xs text-gray-400">Rend.: {pct(item.yield)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div className="space-y-1">
          <div className="text-gray-400 text-xs">Fecha Ex-Div</div>
          <div className="text-gray-200">{fmtDate(item.date)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400 text-xs">Record</div>
          <div className="text-gray-200">{fmtDate(item.recordDate)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400 text-xs">Pago</div>
          <div className="text-gray-200">{fmtDate(item.paymentDate)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400 text-xs">Declaración</div>
          <div className="text-gray-200">{fmtDate(item.declarationDate)}</div>
        </div>
      </div>
    </article>
  );
}
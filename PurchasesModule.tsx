import React, { useState } from 'react';
import { Smartphone, Database, Key, GitBranch, Copy, Check } from 'lucide-react';
import { ALL_TABLE_SCHEMAS } from '../../data/appsheetSpecs';

export const AppSheetSchemaModule: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState(ALL_TABLE_SCHEMAS[0].sheetName);
  const [copied, setCopied] = useState(false);

  const activeSpec = ALL_TABLE_SCHEMAS.find((t) => t.sheetName === selectedTable) || ALL_TABLE_SCHEMAS[0];
  const primaryKeyCol = activeSpec.columns.find((c) => c.isPrimaryKey)?.columnName || 'ID';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(ALL_TABLE_SCHEMAS, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
              Module 24
            </span>
            <h2 className="text-xl font-bold text-slate-900">Google AppSheet Database & Schema Architecture</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production specification for deploying "Hayat Haven Enterprise ERP" on Google AppSheet + Google Sheets / Excel.
          </p>
        </div>

        <button
          onClick={handleCopyJson}
          className="flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-800 cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied Schema JSON!' : 'Copy Complete AppSheet Spec JSON'}</span>
        </button>
      </div>

      {/* AppSheet Architecture Key Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Key className="h-4 w-4 text-blue-600" />
            <span>Key Column Rule</span>
          </div>
          <p className="text-[11px] text-blue-800">
            Every sheet uses <code className="font-bold">UNIQUEID()</code> as Primary Key. Never use auto-increment integers.
          </p>
        </div>

        <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
            <GitBranch className="h-4 w-4 text-purple-600" />
            <span>Ref & IsPartOf Rule</span>
          </div>
          <p className="text-[11px] text-purple-800">
            Sales Order Items & Purchase Items set <code className="font-bold">IsPartOf = TRUE</code> linked to Parent Orders.
          </p>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Dual Compatibility</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Native formulas match standard Excel <code className="font-bold">SUMIFS / VLOOKUP</code> expressions.
          </p>
        </div>
      </div>

      {/* Table Specs Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Table Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1 max-h-[600px] overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 block">
            24 ERP Database Sheets
          </span>
          {ALL_TABLE_SCHEMAS.map((table) => (
            <button
              key={table.sheetName}
              onClick={() => setSelectedTable(table.sheetName)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                selectedTable === table.sheetName
                  ? 'bg-blue-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{table.sheetName}</span>
              <span className="text-[10px] opacity-75 font-mono">{table.columns.length} cols</span>
            </button>
          ))}
        </div>

        {/* Selected Sheet Schema Detail */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Sheet Mapping & Column Definitions
              </span>
              <h3 className="text-base font-bold text-slate-900">{activeSpec.sheetName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeSpec.description}</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Primary Key: <code className="text-blue-900 font-extrabold">{primaryKeyCol}</code>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Column Name</th>
                  <th className="py-2.5 px-3 font-semibold">AppSheet Type</th>
                  <th className="py-2.5 px-3 font-semibold">Ref Relation</th>
                  <th className="py-2.5 px-3 font-semibold">Is Part Of</th>
                  <th className="py-2.5 px-3 font-semibold">Formula / Expression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {activeSpec.columns.map((col) => (
                  <tr key={col.columnName} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
                      {col.columnName}
                      {col.isPrimaryKey && (
                        <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-bold">KEY</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          col.appSheetType === 'Ref'
                            ? 'bg-purple-100 text-purple-900'
                            : col.appSheetType === 'Price' || col.appSheetType === 'Decimal'
                            ? 'bg-emerald-100 text-emerald-900'
                            : col.appSheetType === 'Enum'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {col.appSheetType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{col.refRelationship || col.foreignKeys || '-'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      {col.isPartOfRelationship ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          TRUE (IsPartOf)
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{col.suggestedFormula || col.initialValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

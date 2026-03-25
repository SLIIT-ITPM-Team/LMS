import React from 'react';

const SelectField = ({ label, name, value, onChange, options = [], error }) => {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-200'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

export default SelectField;

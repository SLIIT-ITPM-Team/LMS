import React from 'react';

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  rightAdornment,
}) => {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2.5 text-sm outline-none transition focus:ring-2 ${
            Icon ? 'pl-10' : 'pl-3'
          } ${rightAdornment ? 'pr-10' : 'pr-3'} ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-200'
          }`}
        />
        {rightAdornment ? <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightAdornment}</div> : null}
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

export default InputField;

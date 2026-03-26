import React, { useEffect, useState } from 'react';
import LoadingButton from '../form/LoadingButton';
import InputField from '../form/InputField';
import SelectField from '../form/SelectField';

const defaultState = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  department: '',
};

const UserModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  initialData,
  departments = [],
}) => {
  const isEdit = Boolean(initialData?._id);
  const [form, setForm] = useState(defaultState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || 'student',
      department: initialData?.department?._id || initialData?.department || '',
    });
    setErrors({});
  }, [open, initialData]);

  if (!open) return null;

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!isEdit && form.password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit User' : 'Add User'}</h3>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          {!isEdit ? (
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
          ) : null}

          <SelectField
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Admin', value: 'admin' },
            ]}
          />

          <SelectField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            options={[
              { label: 'Select Department', value: '' },
              ...departments.map((dept) => ({ label: dept.name, value: dept._id })),
            ]}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <LoadingButton type="submit" loading={loading} className="w-auto px-5">
              {isEdit ? 'Update User' : 'Create User'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

import PaginatedResource from '../../components/admin/PaginatedResource'
import FormField from '../../components/ui/FormField'
import { ROLE_LABEL } from '../../context/authContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDateTime } from '../../lib/format'

/** Disalin dari `newPasswordSchema` backend. */
const passwordRules = {
  minLength: { value: 8, message: 'Password minimal 8 karakter' },
  maxLength: { value: 72, message: 'Password maksimal 72 karakter' },
  validate: {
    letter: (value) => !value || /[A-Za-z]/.test(value) || 'Password harus mengandung huruf',
    digit: (value) => !value || /\d/.test(value) || 'Password harus mengandung angka',
  },
}

const rules = {
  name: {
    required: 'Nama wajib diisi',
    minLength: { value: 2, message: 'Nama minimal 2 karakter' },
    maxLength: { value: 100, message: 'Nama maksimal 100 karakter' },
  },
  email: {
    required: 'Email wajib diisi',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
  },
}

export default function Users() {
  const { user } = useAuth()

  return (
    <PaginatedResource
      title="Pengguna"
      description="Akun yang boleh masuk panel admin."
      endpoint="/admin/users"
      label="Pengguna"
      emptyDescription="Tambahkan akun untuk memberi akses panel."
      searchPlaceholder="Nama atau email"
      minWidth="48rem"
      sortable={false}
      filterControls={[
        {
          key: 'role',
          label: 'Peran',
          options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
        },
        {
          key: 'isActive',
          label: 'Status',
          options: [
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ],
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Nama',
          render: (row) => (
            <>
              <span className="flex items-center gap-2 font-medium text-ink-900">
                {row.name}
                {row.id === user.id && (
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.6875rem] font-medium text-ink-600">
                    Anda
                  </span>
                )}
              </span>
              <span className="block text-xs text-ink-500">{row.email}</span>
            </>
          ),
        },
        {
          key: 'role',
          label: 'Peran',
          headerClassName: 'w-32',
          render: (row) => <span className="text-ink-600">{ROLE_LABEL[row.role] ?? row.role}</span>,
        },
        {
          key: 'lastLoginAt',
          label: 'Login terakhir',
          headerClassName: 'w-44',
          render: (row) => (
            <span className="text-ink-600">{formatDateTime(row.lastLoginAt) ?? 'Belum pernah'}</span>
          ),
        },
      ]}
      defaultValues={{ name: '', email: '', password: '', role: 'EDITOR' }}
      toFormValues={(row) => ({
        name: row.name,
        email: row.email,
        password: '',
        role: row.role,
      })}
      toPayload={(values) => ({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        role: values.role,
        // Password kosong saat mengubah berarti "biarkan seperti sekarang";
        // backend menolak string kosong, jadi kuncinya tidak ikut dikirim.
        ...(values.password ? { password: values.password } : {}),
      })}
      fields={({ register, formState: { errors } }, { isNew }) => (
        <>
          <FormField id="user-name" label="Nama" required error={errors.name?.message}>
            {(props) => (
              <input type="text" data-autofocus {...props} {...register('name', rules.name)} />
            )}
          </FormField>

          <FormField id="user-email" label="Email" required error={errors.email?.message}>
            {(props) => (
              <input type="email" autoComplete="off" {...props} {...register('email', rules.email)} />
            )}
          </FormField>

          <FormField id="user-role" label="Peran" required>
            {(props) => (
              <select {...props} {...register('role')}>
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField
            id="user-password"
            label="Password"
            required={isNew}
            hint={
              isNew
                ? 'Minimal 8 karakter, mengandung huruf dan angka.'
                : 'Kosongkan bila password tidak diganti.'
            }
            error={errors.password?.message}
          >
            {(props) => (
              <input
                type="password"
                autoComplete="new-password"
                {...props}
                {...register('password', {
                  ...passwordRules,
                  ...(isNew && { required: 'Password wajib diisi' }),
                })}
              />
            )}
          </FormField>
        </>
      )}
    />
  )
}

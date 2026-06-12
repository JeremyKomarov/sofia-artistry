export default function FieldRow({ label, value, onChange, type = 'text', rows, hint }) {
  if (type === 'checkbox') {
    return (
      <div className="admin-field">
        <label className="admin-field__checkbox">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{label}</span>
        </label>
        {hint && <span className="admin-field__hint">{hint}</span>}
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          rows={rows || 3}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <span className="admin-field__hint">{hint}</span>}
    </div>
  );
}

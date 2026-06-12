'use client';

export default function ArrayEditor({ items, onAdd, onRemove, renderItem, addLabel }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="admin-array-item">
          <span className="admin-array-item__num">{i + 1}</span>
          <div>{renderItem(item, i)}</div>
          <button
            type="button"
            className="admin-array-item__remove"
            onClick={() => onRemove(i)}
            aria-label={`Remove item ${i + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onAdd}>
        + {addLabel || 'Add Item'}
      </button>
    </div>
  );
}

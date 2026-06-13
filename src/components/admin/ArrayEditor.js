'use client';
import { useState, useRef, useEffect } from 'react';

export default function ArrayEditor({ items, onAdd, onRemove, renderItem, addLabel, getLabel }) {
  const [openItems, setOpenItems] = useState(new Set());
  const prevLengthRef = useRef(items.length);

  useEffect(() => {
    if (items.length > prevLengthRef.current) {
      const newIndex = items.length - 1;
      setOpenItems(prev => new Set([...prev, newIndex]));
    }
    prevLengthRef.current = items.length;
  }, [items.length]);

  function toggleItem(i) {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleRemove(i) {
    setOpenItems(prev => {
      const next = new Set();
      for (const idx of prev) {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      }
      return next;
    });
    onRemove(i);
  }

  function itemLabel(item, i) {
    if (getLabel) return getLabel(item, i) || `#${i + 1}`;
    return `#${i + 1}`;
  }

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openItems.has(i);
        return (
          <div key={i} className={`admin-array-item${isOpen ? ' admin-array-item--open' : ''}`}>
            <div className="admin-array-item__header">
              <button
                type="button"
                className="admin-array-item__toggle"
                onClick={() => toggleItem(i)}
                aria-expanded={isOpen}
              >
                <span className="admin-array-item__num">{itemLabel(item, i)}</span>
                <span className="admin-array-item__chevron">▼</span>
              </button>
              <button
                type="button"
                className="admin-array-item__remove"
                onClick={() => handleRemove(i)}
                aria-label={`Remove item ${i + 1}`}
              >
                Remove
              </button>
            </div>
            {isOpen && (
              <div className="admin-array-item__body">{renderItem(item, i)}</div>
            )}
          </div>
        );
      })}
      <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onAdd}>
        + {addLabel || 'Add Item'}
      </button>
    </div>
  );
}

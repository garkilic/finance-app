import { useState, useRef, useEffect } from 'react'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  type?: 'text' | 'number'
}

export function InlineEdit({ value, onSave, placeholder = '—', className = '', inputClassName = '', type = 'text' }: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setEditing(false); setDraft(value) }
        }}
        className={`bg-white border border-stone-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-full ${inputClassName}`}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-stone-100 rounded px-1 -mx-1 transition-colors ${value ? '' : 'text-stone-400 italic'} ${className}`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  )
}

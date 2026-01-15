import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          return saved as unknown as T
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error)
        }
      }
    }
    return initialValue
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, state as string)
    }
  }, [key, state])

  return [state, setState] as const
}

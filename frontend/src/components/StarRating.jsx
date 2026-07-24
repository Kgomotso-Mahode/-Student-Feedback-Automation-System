import { useState } from 'react'
import './StarRating.css'

export default function StarRating({ value, onChange, max = 5 }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        return (
          <button
            key={starValue}
            type="button"
            className={`star ${starValue <= (hover || value) ? 'star-active' : ''}`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            ★
          </button>
        )
      })}
      {value > 0 && <span className="star-label">{value} / {max}</span>}
    </div>
  )
}

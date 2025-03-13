"use client"

import { useEffect } from "react"
import "./Dialog.css"

function Dialog({ title, description, children, onClose }) {
  useEffect(() => {
    // Prevent scrolling when dialog is open
    document.body.style.overflow = "hidden"

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          {description && <p className="dialog-description">{description}</p>}
        </div>
        <div className="dialog-content">{children}</div>
        <button className="dialog-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default Dialog


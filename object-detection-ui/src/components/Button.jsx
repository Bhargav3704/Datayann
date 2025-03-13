"use client"
import "./Button.css"

function Button({ children, onClick, className = "", variant = "default", disabled = false }) {
  return (
    <button
      className={`button ${variant} ${className} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button


import "./Card.css"

function Card({ title, description, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {description && <p className="card-description">{description}</p>}
      </div>
      <div className="card-content">{children}</div>
    </div>
  )
}

export default Card


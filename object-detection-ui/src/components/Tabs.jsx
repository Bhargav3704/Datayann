"use client"
import "./Tabs.css"

function Tabs({ activeTab, onTabChange, tabs, children }) {
  return (
    <div className="tabs-container">
      <div className="tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">{children}</div>
    </div>
  )
}

export default Tabs


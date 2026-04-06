import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/vite.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>TrapEx</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Score: {count}
        </button>
        <p>
          Click to increase your score!
        </p>
      </div>
      <p className="read-the-docs">
        This is a simple responsive game example.
      </p>
    </>
  )
}

export default App
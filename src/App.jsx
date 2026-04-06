import { useState } from 'react'
import logo from './logo.png'
import catJumpscare from './cat.jpeg'
import './App.css'

function App() {
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [phase, setPhase] = useState('intro')
  const [selectedSkin, setSelectedSkin] = useState('default')
  const [count, setCount] = useState(0)
  const [level, setLevel] = useState(1)
  const [jumpscare, setJumpscare] = useState(false)
  const [goodClicked, setGoodClicked] = useState(0)
  const [buttons, setButtons] = useState([])
  const [lives, setLives] = useState(5)

  const goToSetup = () => setPhase('setup')
  const startGame = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setPlayerName(trimmed)
    setPhase('skin-select')
  }

  const selectSkin = (skin) => {
    setSelectedSkin(skin)
    setPhase('play')
    setLives(5)
    generateButtons()
  }

  const generateButtons = () => {
    const types = ['good', 'good', 'good', 'good', 'good', 'savior', 'troll', 'troll', 'troll', 'troll']
    const shuffled = types.sort(() => Math.random() - 0.5)
    setButtons(shuffled.map((type, index) => ({ id: index, type, clicked: false })))
    setGoodClicked(0)
  }

  const handleButtonClick = (id) => {
    const button = buttons.find(b => b.id === id)
    if (button.clicked) return

    const newButtons = buttons.map(b => b.id === id ? { ...b, clicked: true } : b)
    setButtons(newButtons)

    if (button.type === 'good') {
      setGoodClicked(prev => prev + 1)
      setCount(prev => prev + 10)
      if (goodClicked + 1 >= 5) {
        setTimeout(() => {
          setLevel(prev => prev + 1)
          generateButtons()
        }, 1000)
      }
    } else if (button.type === 'savior') {
      setCount(prev => prev + 50)
      setLives(prev => prev + 2)
      setLevel(prev => prev + 1)
      setTimeout(() => {
        generateButtons()
      }, 1000)
    } else if (button.type === 'troll') {
      const newLives = lives - 1
      setLives(newLives)
      setJumpscare(true)
      setTimeout(() => {
        setJumpscare(false)
        if (newLives <= 0) {
          setPhase('game-over')
        }
      }, 2000)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <img src={logo} className="logo" alt="TrapEx logo" />
        <div className="hero-copy">
          <span className="eyebrow">Game</span>
          <h1>TrapEx</h1>
          <p>Un demo modern, responsive și distractiv construit cu React și Vite.</p>
        </div>
      </header>

      <main className="content">
        {phase === 'intro' && (
          <section className="card start-panel">
            <div className="start-panel-copy">
              <h2>Pornește aventura</h2>
              <p>Am creat un spațiu elegant și fluid pentru începutul jocului. Apasă Start și alege-ți numele de jucător.</p>
            </div>
            <button className="start-btn" onClick={goToSetup}>
              Start
            </button>
          </section>
        )}

        {phase === 'setup' && (
          <section className="card setup-panel">
            <h2>Setează numele jucătorului</h2>
            <p>Introdu un nickname pentru sesiunea ta TrapEx.</p>
            <input
              className="player-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Nume jucător"
            />
            <button className="play-btn" onClick={startGame} disabled={!nameInput.trim()}>
              Joacă acum
            </button>
          </section>
        )}

        {phase === 'skin-select' && (
          <section className={`card skin-panel ${selectedSkin}`}>
            <h2>Selectează skinul</h2>
            <p>Alege skinul pentru masă și butoane.</p>
            <div className="skin-options">
              <button className="skin-btn" onClick={() => selectSkin('default')}>
                Default
              </button>
              <button className="skin-btn" onClick={() => selectSkin('dark')}>
                Dark
              </button>
              <button className="skin-btn" onClick={() => selectSkin('neon')}>
                Neon
              </button>
            </div>
          </section>
        )}

        {phase === 'play' && (
          <section className={`card game-panel ${selectedSkin}`}>
            <div className="game-header">
              <h2>{playerName} - Nivel {level}</h2>
              <div className="stats">
                <span>Score: {count}</span>
                <span>{'❤️'.repeat(lives)}</span>
              </div>
            </div>
            <div className="table">
              {buttons.map(button => (
                <button
                  key={button.id}
                  className={`table-btn ${button.type} ${button.clicked ? 'clicked' : ''}`}
                  onClick={() => handleButtonClick(button.id)}
                  disabled={button.clicked}
                >
                  {button.clicked ? (button.type === 'good' ? '✓' : button.type === 'savior' ? '★' : 'X') : '?'}
                </button>
              ))}
            </div>
          </section>
        )}

        {phase === 'game-over' && (
          <section className="card game-over-panel">
            <div className="game-over-content">
              <h2>� Game Over 💔</h2>
              <p>Scor final: {count}</p>
              <p>Nivel atins: {level}</p>
              <button className="restart-btn" onClick={() => {
                setPhase('intro')
                setLives(5)
                setCount(0)
                setLevel(1)
                setGoodClicked(0)
                setButtons([])
              }}>
                Începe din nou
              </button>
            </div>
          </section>
        )}
      </main>

      {jumpscare && (
        <div className="jumpscare">
          <div className="jumpscare-content">
            <img src={catJumpscare} alt="Scary cat" className="cat-image" />
            <p>💔 BOO! 💔</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

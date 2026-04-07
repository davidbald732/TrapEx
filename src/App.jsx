import { useState, useEffect } from 'react'
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
  const [coins, setCoins] = useState(0)
  const [ownedSkins, setOwnedSkins] = useState(['default'])
  const [shopOpen, setShopOpen] = useState(false)
  const [previewSkin, setPreviewSkin] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [questsOpen, setQuestsOpen] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [registrationDate, setRegistrationDate] = useState('')
  const [questStatus, setQuestStatus] = useState({
    clickMaster: { current: 0, goal: 50, reward: 25, completed: false, claimed: false },
    levelChampion: { current: 1, goal: 10, reward: 50, completed: false, claimed: false },
    skinCollector: { current: 1, goal: 5, reward: 100, completed: false, claimed: false },
    speedRunner: { current: 0, goal: 1, reward: 30, completed: false, claimed: false },
    fullHealth: { current: 1, goal: 5, reward: 75, completed: false, claimed: false },
  })
  const [levelStartTime, setLevelStartTime] = useState(null)
  const [fullHealthActive, setFullHealthActive] = useState(true)
  const [fullHealthProgress, setFullHealthProgress] = useState(1)

  useEffect(() => {
    const savedCoins = localStorage.getItem('trapex-coins')
    const savedSkins = localStorage.getItem('trapex-skins')
    const savedHighScore = localStorage.getItem('trapex-highscore')
    const savedRegDate = localStorage.getItem('trapex-regdate')
    if (savedCoins) setCoins(parseInt(savedCoins))
    if (savedSkins) setOwnedSkins(JSON.parse(savedSkins))
    if (savedHighScore) setHighScore(parseInt(savedHighScore))
    if (savedRegDate) setRegistrationDate(savedRegDate)
  }, [])

  useEffect(() => {
    localStorage.setItem('trapex-coins', coins.toString())
  }, [coins])

  useEffect(() => {
    localStorage.setItem('trapex-skins', JSON.stringify(ownedSkins))
  }, [ownedSkins])

  useEffect(() => {
    setQuestStatus(prev => ({
      ...prev,
      skinCollector: {
        ...prev.skinCollector,
        current: ownedSkins.length,
        completed: ownedSkins.length >= prev.skinCollector.goal,
      },
    }))
  }, [ownedSkins])

  useEffect(() => {
    localStorage.setItem('trapex-highscore', highScore.toString())
  }, [highScore])

  useEffect(() => {
    if (registrationDate) {
      localStorage.setItem('trapex-regdate', registrationDate)
    }
  }, [registrationDate])

  const goToSetup = () => setPhase('setup')
  const startGame = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setPlayerName(trimmed)
    if (!registrationDate) {
      setRegistrationDate(new Date().toLocaleDateString())
    }
    resetQuestsForNewGame()
    setPhase('skin-select')
  }

  const selectSkin = (skin) => {
    setSelectedSkin(skin)
    setPhase('play')
    setLives(5)
    generateButtons()
  }

  const updateQuestStatus = (id, updates) => {
    setQuestStatus(prev => {
      const quest = prev[id]
      if (!quest) return prev
      const updated = { ...quest, ...updates }
      if (updated.current >= updated.goal) {
        updated.completed = true
      }
      return { ...prev, [id]: updated }
    })
  }

  const resetQuestsForNewGame = () => {
    setQuestStatus(prev => ({
      ...prev,
      clickMaster: { ...prev.clickMaster, current: 0, completed: false },
      levelChampion: { ...prev.levelChampion, current: 1, completed: false },
      speedRunner: { ...prev.speedRunner, current: 0, completed: false },
      fullHealth: { ...prev.fullHealth, current: 1, completed: false },
    }))
    setFullHealthActive(true)
    setFullHealthProgress(1)
    setLevelStartTime(Date.now())
  }

  const claimQuest = (id) => {
    setQuestStatus(prev => {
      const quest = prev[id]
      if (!quest || !quest.completed || quest.claimed) return prev
      setCoins(prevCoins => prevCoins + quest.reward)
      return { ...prev, [id]: { ...quest, claimed: true } }
    })
  }

  const generateButtons = () => {
    setLevelStartTime(Date.now())
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
      const nextGoodClicked = goodClicked + 1
      setGoodClicked(nextGoodClicked)
      setCount(prev => prev + 10)
      setCoins(prev => prev + 10)
      updateQuestStatus('clickMaster', { current: Math.min(nextGoodClicked, 50) })

      if (nextGoodClicked >= 5) {
        const nextLevel = level + 1
        const elapsed = levelStartTime ? (Date.now() - levelStartTime) / 1000 : Infinity
        if (elapsed <= 10) {
          updateQuestStatus('speedRunner', { current: 1 })
        }
        updateQuestStatus('levelChampion', { current: nextLevel })
        if (fullHealthActive) {
          setFullHealthProgress(nextLevel)
          updateQuestStatus('fullHealth', { current: nextLevel })
        }

        setTimeout(() => {
          setLevel(prev => prev + 1)
          setCoins(prev => prev + 20)
          generateButtons()
        }, 1000)
      }
    } else if (button.type === 'savior') {
      const nextLevel = level + 1
      const elapsed = levelStartTime ? (Date.now() - levelStartTime) / 1000 : Infinity
      if (elapsed <= 10) {
        updateQuestStatus('speedRunner', { current: 1 })
      }
      setCount(prev => prev + 50)
      setLives(prev => prev + 2)
      setLevel(nextLevel)
      setCoins(prev => prev + 15)
      updateQuestStatus('levelChampion', { current: nextLevel })
      if (fullHealthActive) {
        setFullHealthProgress(nextLevel)
        updateQuestStatus('fullHealth', { current: nextLevel })
      }
      setTimeout(() => {
        generateButtons()
      }, 1000)
    } else if (button.type === 'troll') {
      const newLives = lives - 1
      setLives(newLives)
      setFullHealthActive(false)
      setJumpscare(true)
      setTimeout(() => {
        setJumpscare(false)
        if (newLives <= 0) {
          setPhase('game-over')
        }
      }, 2000) 
    }
  }

  const buySkin = (skin, cost) => {
    if (coins >= cost && !ownedSkins.includes(skin)) {
      setCoins(prev => prev - cost)
      setOwnedSkins(prev => [...prev, skin])
      setSelectedSkin(skin)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <img src={logo} className="logo" alt="TrapEx logo" />
        <div className="hero-copy">
          <span className="eyebrow">Epic Adventure Game</span>
          <h1>TrapEx</h1>
          <p>Experience the ultimate click challenge! Test your reflexes, unlock amazing skins, and conquer every level in this thrilling React-powered adventure.</p>
        </div>
      </header>

      <main className="content">
        {phase === 'intro' && (
          <section className="card start-panel">
            <div className="start-panel-copy">
              <h2>Ready for the Challenge?</h2>
              <p>Enter the TrapEx arena! Choose your player name and prepare for an epic journey filled with surprises, rewards, and stunning visual themes.</p>
            </div>
            <button className="start-btn" onClick={goToSetup}>
              Start Adventure
            </button>
          </section>
        )}

        {phase === 'setup' && (
          <section className="card setup-panel">
            <h2>Choose Your Identity</h2>
            <p>Create your legendary TrapEx username and step into the arena!</p>
            <input
              className="player-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
            />
            <button className="play-btn" onClick={startGame} disabled={!nameInput.trim()}>
              Begin Quest
            </button>
          </section>
        )}

        {phase === 'skin-select' && (
          <section className={`card skin-panel ${selectedSkin}`}>
            <h2>Choose Your Style</h2>
            <p>Select a visual theme that matches your personality and enhances your gaming experience!</p>
            <div className="skin-options">
              {ownedSkins.includes('default') && <button className="skin-btn" onClick={() => selectSkin('default')}>
                Default
              </button>}
              {ownedSkins.includes('dark') && <button className="skin-btn" onClick={() => selectSkin('dark')}>
                Dark
              </button>}
              {ownedSkins.includes('neon') && <button className="skin-btn" onClick={() => selectSkin('neon')}>
                Neon
              </button>}
              {ownedSkins.includes('fire') && <button className="skin-btn" onClick={() => selectSkin('fire')}>
                Fire
              </button>}
              {ownedSkins.includes('ice') && <button className="skin-btn" onClick={() => selectSkin('ice')}>
                Ice
              </button>}
              {ownedSkins.includes('galaxy') && <button className="skin-btn" onClick={() => selectSkin('galaxy')}>
                Galaxy
              </button>}
              {ownedSkins.includes('rainbow') && <button className="skin-btn" onClick={() => selectSkin('rainbow')}>
                Rainbow
              </button>}
              {ownedSkins.includes('matrix') && <button className="skin-btn" onClick={() => selectSkin('matrix')}>
                Matrix
              </button>}
              {ownedSkins.includes('cyberpunk') && <button className="skin-btn" onClick={() => selectSkin('cyberpunk')}>
                Cyberpunk
              </button>}
              {ownedSkins.includes('retro') && <button className="skin-btn" onClick={() => selectSkin('retro')}>
                Retro
              </button>}
            </div>
          </section>
        )}

        {phase === 'play' && (
          <section className={`card game-panel ${selectedSkin}`}>
            <div className="game-header">
              <h2>{playerName} - Level {level}</h2>
              <div className="stats">
                <span>Score: {count}</span>
                <span>Coins: {coins} 🪙</span>
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
            <button className="shop-btn" onClick={() => setShopOpen(true)}>
              🛒 Shop
            </button>
          </section>
        )}

        {phase === 'game-over' && (
          <section className="card game-over-panel">
            <div className="game-over-content">
              <h2>Game Over 💔</h2>
              <p>Final Score: {count}</p>
              <p>Levels Reached: {level}</p>
              {count > highScore && <p className="new-highscore">🎉 New High Score! 🎉</p>}
              <button className="restart-btn" onClick={() => {
                if (count > highScore) {
                  setHighScore(count)
                }
                setPhase('intro')
                setLives(5)
                setCount(0)
                setLevel(1)
                setGoodClicked(0)
                setButtons([])
              }}>
                Play Again
              </button>
            </div>
          </section>
        )}
      </main>

      {phase === 'play' && (
        <>
          <button className="quests-btn" onClick={() => setQuestsOpen(true)} title="Quests">
            📜 Quests
          </button>
          <button className="profile-btn" onClick={() => setProfileOpen(true)} title="Profile">
            👤 {playerName}
          </button>
        </>
      )}

      {profileOpen && (
        <div className="profile-overlay" onClick={() => setProfileOpen(false)}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Player Profile</h3>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-label">Player:</span>
                <span className="stat-value">{playerName}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Coins:</span>
                <span className="stat-value">{coins} 🪙</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Selected Skin:</span>
                <span className="stat-value">{selectedSkin.charAt(0).toUpperCase() + selectedSkin.slice(1)}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">High Score:</span>
                <span className="stat-value">{highScore}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Member Since:</span>
                <span className="stat-value">{registrationDate || 'Today'}</span>
              </div>
            </div>
            <button className="close-profile-btn" onClick={() => setProfileOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {questsOpen && (
        <div className="quests-overlay" onClick={() => setQuestsOpen(false)}>
          <div className="quests-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Daily Quests</h3>
            <div className="quests-list">
              {[
                { id: 'clickMaster', title: '🎯 Click Master', description: 'Click 50 correct buttons in one game' },
                { id: 'levelChampion', title: '🏆 Level Champion', description: 'Reach level 10 in a single game' },
                { id: 'skinCollector', title: '💎 Skin Collector', description: 'Own 5 different skins' },
                { id: 'speedRunner', title: '🔥 Speed Runner', description: 'Complete a level in under 10 seconds' },
                { id: 'fullHealth', title: '❤️ Survivor', description: 'Reach level 5 with all 5 lives' },
              ].map(({ id, title, description }) => {
                const quest = questStatus[id]
                const remaining = Math.max(quest.goal - quest.current, 0)
                const progressText = quest.completed
                  ? 'Completat!'
                  : id === 'speedRunner'
                    ? 'Mai ai 1 nivel rapid'
                    : id === 'fullHealth'
                      ? fullHealthActive
                        ? `Nivel actual: ${fullHealthProgress}/5`
                        : 'Ai pierdut o viață în această încercare'
                      : `Mai ai ${remaining} ${id === 'clickMaster' ? 'clicuri' : id === 'levelChampion' ? 'nivel(e)' : 'skinuri'}`

                return (
                  <div key={id} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                    <h4>{title}</h4>
                    <p>{description}</p>
                    <div className="quest-progress">{progressText}</div>
                    <span className="quest-reward">Reward: {quest.reward} 🪙</span>
                    <div className="quest-status">
                      {quest.completed ? (
                        quest.claimed ? (
                          <span className="quest-claimed">Recompensă primită</span>
                        ) : (
                          <button className="claim-quest-btn" onClick={() => claimQuest(id)}>
                            Primește {quest.reward} 🪙
                          </button>
                        )
                      ) : (
                        <span className="quest-not-completed">Neîndeplinit</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="close-quests-btn" onClick={() => setQuestsOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {shopOpen && (
        <div className="shop-overlay" onClick={() => setShopOpen(false)}>
          <div className="shop-panel" onClick={(e) => e.stopPropagation()}>
            <h3>🛒 Shop</h3>
            <p>Coins: {coins} 🪙</p>
            
            {previewSkin && (
              <div className="skin-preview">
                <div className="preview-header">
                  <h4>Preview: {previewSkin.charAt(0).toUpperCase() + previewSkin.slice(1)} Skin</h4>
                  <button 
                    className="close-preview-btn" 
                    onClick={() => setPreviewSkin(null)}
                    title="Close Preview"
                  >
                    ✕
                  </button>
                </div>
                <div className={`preview-panel ${previewSkin}`}>
                  <div className="preview-stats">
                    <span>Score: 999</span>
                    <span>Coins: 999 🪙</span>
                    <span>❤️❤️❤️❤️❤️</span>
                  </div>
                  <div className="preview-table">
                    <button className={`preview-btn ${previewSkin}`}>✓</button>
                    <button className={`preview-btn ${previewSkin}`}>?</button>
                    <button className={`preview-btn ${previewSkin}`}>?</button>
                    <button className={`preview-btn ${previewSkin}`}>?</button>
                    <button className={`preview-btn ${previewSkin}`}>★</button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="shop-items">
              {!ownedSkins.includes('dark') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Dark Skin - 50 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('dark')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('dark', 50)}
                    disabled={coins < 50}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('neon') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Neon Skin - 100 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('neon')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('neon', 100)}
                    disabled={coins < 100}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('fire') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Fire Skin - 150 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('fire')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('fire', 150)}
                    disabled={coins < 150}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('ice') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Ice Skin - 200 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('ice')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('ice', 200)}
                    disabled={coins < 200}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('galaxy') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Galaxy Skin - 300 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('galaxy')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('galaxy', 300)}
                    disabled={coins < 300}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('rainbow') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Rainbow Skin - 400 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('rainbow')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('rainbow', 400)}
                    disabled={coins < 400}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('matrix') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Matrix Skin - 500 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('matrix')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('matrix', 500)}
                    disabled={coins < 500}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('cyberpunk') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Cyberpunk Skin - 600 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('cyberpunk')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('cyberpunk', 600)}
                    disabled={coins < 600}
                  >
                    Buy
                  </button>
                </div>
              )}
              {!ownedSkins.includes('retro') && (
                <div className="shop-item">
                  <div className="skin-info">
                    <span>Retro Skin - 700 🪙</span>
                    <button 
                      className="preview-btn-small" 
                      onClick={() => setPreviewSkin('retro')}
                      title="Preview"
                    >
                      👁️
                    </button>
                  </div>
                  <button 
                    className="buy-btn" 
                    onClick={() => buySkin('retro', 700)}
                    disabled={coins < 700}
                  >
                    Buy
                  </button>
                </div>
              )}
            </div>
            <button className="close-shop-btn" onClick={() => setShopOpen(false)}>Close</button>
          </div>
        </div>
      )}

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

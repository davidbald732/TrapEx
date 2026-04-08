import { useState, useEffect } from 'react'
import logo from './logo.png'
import catJumpscare from './cat.jpeg'
import './App.css'

function App() {
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [phase, setPhase] = useState('intro')
  const [selectedSkin, setSelectedSkin] = useState('default')
  const [selectedMode, setSelectedMode] = useState('classic')
  const [count, setCount] = useState(0)
  const [level, setLevel] = useState(1)
  const [jumpscare, setJumpscare] = useState(false)
  const [goodClicked, setGoodClicked] = useState(0)
  const [buttons, setButtons] = useState([])
  const [lives, setLives] = useState(5)
  const [coins, setCoins] = useState(0)
  const [ownedSkins, setOwnedSkins] = useState(['default'])
  const [shopOpen, setShopOpen] = useState(false)
  const [previewBox, setPreviewBox] = useState(null)
  const [shopMessage, setShopMessage] = useState('')
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
  const [gameTimer, setGameTimer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [combo, setCombo] = useState(0)
  const [currentRank, setCurrentRank] = useState(0)
  const [showRankUp, setShowRankUp] = useState(false)
  const ranks = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum', 'Champion', 'Grand Champion']

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
    setPhase('mode-select')
  }

  const selectMode = (mode) => {
    setSelectedMode(mode)
    setPhase('skin-select')
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
    setCombo(0)
    setCurrentRank(0)
  }

  const skinBoxes = [
    { id: 'common', emoji: '🟦', title: 'Common Box', description: 'Contains one Common skin: perfect for new players.', cost: 100, skins: ['dark', 'neon', 'shadow', 'spark'] },
    { id: 'rare', emoji: '🟪', title: 'Rare Box', description: 'Contains one Rare skin with stylish effects.', cost: 250, skins: ['fire', 'ice', 'galaxy', 'ember', 'aura'] },
    { id: 'epic', emoji: '🟧', title: 'Epic Box', description: 'Contains one Epic skin for collectors.', cost: 500, skins: ['rainbow', 'matrix', 'cyberpunk', 'retro', 'vapor', 'solar'] },
    { id: 'mystery', emoji: '🎁', title: 'Mystery Box', description: 'Contains any available skin. Anything can drop!', cost: 800, skins: ['dark', 'neon', 'shadow', 'spark', 'fire', 'ice', 'galaxy', 'ember', 'aura', 'rainbow', 'matrix', 'cyberpunk', 'retro', 'vapor', 'solar'] },
  ]

  const openBox = (box) => {
    if (coins < box.cost) {
      setShopMessage(`❌ Nu ai destui ${box.id === 'mystery' ? 'bani' : '🪙'} pentru cutia ${box.title}.`)
      return
    }
    setCoins(prev => prev - box.cost)
    const possible = box.skins.filter((skin) => !ownedSkins.includes(skin))
    const pool = possible.length > 0 ? possible : box.skins
    const randomSkin = pool[Math.floor(Math.random() * pool.length)]

    if (!ownedSkins.includes(randomSkin)) {
      setOwnedSkins(prev => [...prev, randomSkin])
      setShopMessage(`🎉 Ai deschis ${box.emoji} ${box.title}! Ai obținut skinul ${randomSkin}.`)
    } else {
      setShopMessage(`🎁 Ai deschis ${box.emoji} ${box.title}, dar ai primit un skin deja deblocat: ${randomSkin}.`)
    }

    setSelectedSkin(randomSkin)
    setPreviewBox(null)
  }

  const previewBoxData = skinBoxes.find((b) => b.id === previewBox)

  const claimQuest = (id) => {
    setQuestStatus(prev => {
      const quest = prev[id]
      if (!quest || !quest.completed || quest.claimed) return prev
      setCoins(prevCoins => prevCoins + quest.reward)
      return { ...prev, [id]: { ...quest, claimed: true } }
    })
  }

  const selectSkin = (skin) => {
    setSelectedSkin(skin)
    setPhase('play')
    setLives(5)
    generateButtons()
    if (selectedMode === 'time') {
      setTimeLeft(600)
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setPhase('game-over')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setGameTimer(timer)
    }
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
          if (selectedMode === 'ranked' && (level + 1) % 10 === 0 && (level + 1) > 0) {
            setCurrentRank(prev => {
              const newRank = Math.min(prev + 1, ranks.length - 1)
              if (newRank === ranks.length - 1 && !ownedSkins.includes('hardworker')) {
                setOwnedSkins(prevSkins => [...prevSkins, 'hardworker'])
              }
              setShowRankUp(true)
              setTimeout(() => setShowRankUp(false), 3000)
              return newRank
            })
          }
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
      if (selectedMode !== 'hardcore') {
        setLives(prev => prev + 2)
      }
      setLevel(nextLevel)
      setCoins(prev => prev + 15)
      updateQuestStatus('levelChampion', { current: nextLevel })
      if (fullHealthActive) {
        setFullHealthProgress(nextLevel)
        updateQuestStatus('fullHealth', { current: nextLevel })
      }
      setCombo(prev => prev + 1)
      setTimeout(() => {
        setLevel(nextLevel)
        setCoins(prev => prev + 15)
        updateQuestStatus('levelChampion', { current: nextLevel })
        if (fullHealthActive) {
          setFullHealthProgress(nextLevel)
          updateQuestStatus('fullHealth', { current: nextLevel })
        }
        if (selectedMode === 'ranked' && nextLevel % 10 === 0 && nextLevel > 0) {
          setCurrentRank(prev => {
            const newRank = Math.min(prev + 1, ranks.length - 1)
            if (newRank === ranks.length - 1 && !ownedSkins.includes('hardworker')) {
              setOwnedSkins(prevSkins => [...prevSkins, 'hardworker'])
            }
            setShowRankUp(true)
            setTimeout(() => setShowRankUp(false), 3000)
            return newRank
          })
        }
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
          if (gameTimer) clearInterval(gameTimer)
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

        {phase === 'mode-select' && (
          <section className="card mode-panel">
            <h2>Select Game Mode</h2>
            <p>Choose your challenge level and playstyle!</p>
            <div className="mode-options">
              <button className="mode-btn classic" onClick={() => selectMode('classic')}>
                🎮 Classic<br/>
                <small>Standard gameplay with life regeneration</small>
              </button>
              <button className="mode-btn hardcore" onClick={() => selectMode('hardcore')}>
                💀 Hardcore<br/>
                <small>No life regeneration - survive or die!</small>
              </button>
              <button className="mode-btn time" onClick={() => selectMode('time')}>
                ⏱️ Time Attack<br/>
                <small>10 minutes to reach the highest level possible</small>
              </button>
              <button className="mode-btn ranked" onClick={() => selectMode('ranked')}>
                🏆 Ranked<br/>
                <small>Climb the ranks every 10 levels!</small>
              </button>
            </div>
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
              {ownedSkins.includes('shadow') && <button className="skin-btn" onClick={() => selectSkin('shadow')}>
                Shadow
              </button>}
              {ownedSkins.includes('spark') && <button className="skin-btn" onClick={() => selectSkin('spark')}>
                Spark
              </button>}
              {ownedSkins.includes('ember') && <button className="skin-btn" onClick={() => selectSkin('ember')}>
                Ember
              </button>}
              {ownedSkins.includes('aura') && <button className="skin-btn" onClick={() => selectSkin('aura')}>
                Aura
              </button>}
              {ownedSkins.includes('vapor') && <button className="skin-btn" onClick={() => selectSkin('vapor')}>
                Vapor
              </button>}
              {ownedSkins.includes('solar') && <button className="skin-btn" onClick={() => selectSkin('solar')}>
                Solar
              </button>}
              {ownedSkins.includes('hardworker') && <button className="skin-btn" onClick={() => selectSkin('hardworker')}>
                Hard Worker
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
                {selectedMode === 'time' && <span>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>}
                {selectedMode === 'ranked' && <span>🏆 {ranks[currentRank]}</span>}
              </div>
            </div>
            <div className="combo-display">
              <span className="combo-text">🔥 Combo: {combo}</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${(goodClicked / 5) * 100}%` }}></div>
              <span className="progress-text">{goodClicked}/5</span>
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
            {showRankUp && (
              <div className="rank-up-notification">
                <div className="rank-up-content">
                  🏆 YOU RANKED UP! 🏆
                  <div className="rank-up-rank">{ranks[currentRank]}</div>
                </div>
              </div>
            )}
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
            
            {previewBoxData && (
              <div className="skin-preview">
                <div className="preview-header">
                  <h4>{previewBoxData.title}</h4>
                  <button 
                    className="close-preview-btn" 
                    onClick={() => setPreviewBox(null)}
                    title="Close Preview"
                  >
                    ✕
                  </button>
                </div>
                <div className="preview-panel box-preview">
                  <p>{previewBoxData.description}</p>
                  <p>Posibile skinuri din cutie:</p>
                  <div className="box-skin-list">
                    {previewBoxData.skins.map((skin) => (
                      <span key={skin} className={`box-skin ${ownedSkins.includes(skin) ? 'owned' : ''}`}>
                        {skin.charAt(0).toUpperCase() + skin.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {shopMessage && <div className="shop-message">{shopMessage}</div>}

            <div className="shop-items">
              {skinBoxes.map((box) => (
                <div key={box.id} className={`shop-item box-${box.id}`}>
                  <div className="box-info">
                    <span className="box-title">{box.emoji} {box.title}</span>
                    <span className="box-cost">{box.cost} 🪙</span>
                  </div>
                  <p className="box-description">{box.description}</p>
                  <div className="shop-actions">
                    <button 
                      className="preview-btn-small" 
                      onClick={() => { setPreviewBox(box.id); setShopMessage('') }}
                      title="Preview"
                    >
                      👁️ Preview
                    </button>
                    <button 
                      className="buy-btn" 
                      onClick={() => openBox(box)}
                      disabled={coins < box.cost}
                    >
                      Open Box
                    </button>
                  </div>
                </div>
              ))}
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

import { useState, useEffect, useCallback } from 'react'
import { 
  Sparkles, 
  Users, 
  ClipboardList, 
  Hash, 
  FileText, 
  UserCheck,
  RefreshCw, 
  Gamepad2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react'
import Logo from './Logo'

const FEATURES = [
  {
    Icon: Sparkles,
    title: "AI Syllabus Parser",
    description: "Upload your PDF and let AI handle the heavy lifting. Automatically generate units and topics in seconds."
  },
  {
    Icon: Users,
    title: "Unified Class Sync",
    description: "Keep every student on the same page. Toggle current topics and the entire class moves with you instantly."
  },
  {
    Icon: ClipboardList,
    title: "Contextual Homework",
    description: "Assign tasks directly linked to topics. Students find everything they need in one place, reducing confusion."
  },
  {
    Icon: Hash,
    title: "Instant Enrollment",
    description: "Skip the setup headaches. Shared 6-character codes let students join and start learning immediately."
  },
  {
    Icon: FileText,
    title: "Rich Material Library",
    description: "Attach PDFs, videos, and links to any topic. A centralized hub for all your learning resources."
  },
  {
    Icon: UserCheck,
    title: "Dual Role Freedom",
    description: "Be a teacher in your own class and a student in another. No account switching required."
  }
]

const SYMBOLS = ['📚', '🧪', '🎓', '✨', '📝', '🧠', '🔬', '🔭']

export default function LoadingScreen({ isBackendError, onRetry }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [cards, setCards] = useState(() => 
    [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
  )
  const [flipped, setFlipped] = useState([])
  const [solved, setSolved] = useState([])
  const [matches, setMatches] = useState(0)

  // Carousel logic
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % FEATURES.length)
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)

  // Game logic: Initialize board
  const initializeGame = useCallback(() => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    setCards(shuffled)
    setFlipped([])
    setSolved([])
    setMatches(0)
  }, [])

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return
    
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      const firstCard = cards.find(c => c.id === newFlipped[0])
      const secondCard = cards.find(c => c.id === newFlipped[1])
      
      if (firstCard.emoji === secondCard.emoji) {
        setSolved((prev) => [...prev, ...newFlipped])
        setFlipped([])
        setMatches(m => m + 1)
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0c] text-white overflow-y-auto overflow-x-hidden">
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start lg:justify-center p-4 sm:p-6 py-12 relative">
        {/* Background Glows (Core Clef Green) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mt-8 lg:mt-0 mb-16 lg:mb-0">
        
        {/* Left Side: Communication & Showcase */}
        <div className="flex flex-col space-y-8 relative">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
              Cold-starting Server
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Our servers are cold-starting to get your space ready. This usually takes 2-5 minutes on the free tier. 
              Hang tight, excellence is worth the wait!
            </p>
          </div>

          {/* 3D Feature Carousel Wrapper */}
          <div className="relative group/carousel hidden sm:block">
            <div className="relative h-64 lg:h-72 perspective-1000 preserve-3d">
              {FEATURES.map((feature, index) => {
                const diff = index - currentSlide
                const rotation = diff * 45
                const isActive = index === currentSlide
                const opacity = isActive ? 1 : 0
                const zIndex = isActive ? 20 : 0
                const translateZ = isActive ? 0 : -200
                const { Icon } = feature

                return (
                  <div 
                    key={index}
                    style={{
                      transform: `rotateY(${rotation}deg) translateZ(${translateZ}px)`,
                      opacity: opacity,
                      zIndex: zIndex,
                    }}
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-md transition-all duration-700 ease-in-out backface-hidden flex flex-col justify-center"
                  >
                    <div className="mb-3 lg:mb-4"><Icon className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" /></div>
                    <h3 className="text-lg lg:text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm lg:text-base">{feature.description}</p>
                    
                    {/* Inner active glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-green-500/5 rounded-3xl pointer-events-none" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* External Navigation Controls (Negative offset to sit outside alignment) */}
            <button 
              onClick={handlePrev} 
              className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-green-500/10 hover:border-green-500/30 border border-white/5 rounded-full text-white/40 hover:text-green-500 transition-all z-30 group"
            >
              <ChevronLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute -right-16 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-green-500/10 hover:border-green-500/30 border border-white/5 rounded-full text-white/40 hover:text-green-500 transition-all z-30 group"
            >
              <ChevronRight className="w-6 h-6 group-active:scale-90 transition-transform" />
            </button>

            {/* Pagination & Pause */}
            <div className="absolute -bottom-10 left-0">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="text-white/30 hover:text-green-500 transition-colors"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
              </button>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-center lg:justify-start space-x-3 text-sm font-medium pt-4 sm:pt-12">
            {isBackendError ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>The server is taking longer than usual...</span>
                </div>
                <button 
                  onClick={onRetry}
                  className="flex items-center px-6 py-3 bg-white/10 hover:bg-green-500/10 hover:text-green-500 rounded-xl transition-all border border-white/10 hover:border-green-500/30 active:scale-95 text-white w-fit"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-green-500">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="animate-pulse opacity-80">Monitoring server pulse...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Mini-Game */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gamepad2 className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Beat the Wait!</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">Match all educational pairs to clear the board</p>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl relative shadow-green-500/5">
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || solved.includes(card.id)
              return (
                <div
                  key={card.id}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  style={{ perspective: '1000px' }}
                >
                  <button
                    type="button"
                    onClick={() => handleCardClick(card.id)}
                    style={{
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      WebkitTransformStyle: 'preserve-3d',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      WebkitTransition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      willChange: 'transform'
                    }}
                    className="relative w-full h-full cursor-pointer appearance-none border-0 bg-transparent p-0"
                  >
                    {/* Front face */}
                    <div
                      style={{
                        transform: 'rotateY(0deg) translateZ(1px)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        opacity: isFlipped ? 0 : 1,
                        transition: 'opacity 0.18s ease 0.12s'
                      }}
                      className="absolute inset-0 bg-white/10 border-2 border-white/5 rounded-2xl flex items-center justify-center shadow-lg hover:bg-white/15 transition-colors"
                    >
                    </div>

                    {/* Back face */}
                    <div 
                      style={{
                        transform: 'rotateY(180deg) translateZ(1px)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        opacity: isFlipped ? 1 : 0,
                        transition: 'opacity 0.18s ease 0.12s'
                      }}
                      className="absolute inset-0 bg-green-600/20 border-2 border-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      {card.emoji}
                    </div>
                  </button>
                </div>
              )
            })}

            {/* Completion Overlay */}
            {matches === SYMBOLS.length && (
              <div className="absolute inset-0 bg-green-500/90 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 z-50">
                <div className="bg-white rounded-full p-4 mb-4 text-green-600 text-4xl shadow-xl">🎓</div>
                <h3 className="text-2xl font-black mb-1 text-white uppercase tracking-tighter">Lesson Complete!</h3>
                <p className="text-white/90 mb-4 text-sm font-medium">Perfect match! You're ready to learn.</p>
                <button 
                  onClick={initializeGame}
                  className="px-6 py-2 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                >
                  Replay
                </button>
              </div>
            )}
          </div>
          
          <div className="flex space-x-12 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">
            <div className="flex flex-col items-center">
              <span className="text-green-500 text-2xl mb-1">{matches}</span>
              <span>Matches</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10 pl-12">
              <span className="text-white text-2xl mb-1">{SYMBOLS.length}</span>
              <span>Target</span>
            </div>
          </div>
        </div>

      </div>

        {/* Footer Branding */}
        <div className="absolute bottom-6 flex flex-col items-center space-y-3 opacity-20 group hover:opacity-100 transition-all duration-500 select-none cursor-default">
          <Logo />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/50 group-hover:text-green-500 transition-colors text-center">keep your class in sync</span>
        </div>
      </div>
    </div>
  )
}

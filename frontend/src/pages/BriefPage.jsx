import { useState, useEffect, useRef } from 'react'

// ─── Icons ───────────────────────────────────────────────────────────────────
const SparkleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /></svg>
)

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
)

const CheckCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)

// ─── Product Info Data ───────────────────────────────────────────────────────
const productInfo = {
  logo: {
    name: 'Logo Design',
    price: 199,
    questions: [
      { text: "What's your business name?", quickReplies: null },
      { text: "What style do you prefer?", quickReplies: ['Modern', 'Minimalist', 'Playful', 'Luxury', 'Professional', 'Authentic'] },
      { text: "Do you have any colors in mind, or should I suggest based on your industry?", quickReplies: ['Suggest for me', 'Warm colors', 'Cool colors', 'Black & white', 'Colorful'] },
      { text: "Any symbols, icons, or concepts you'd like me to incorporate?", quickReplies: ['No preference', 'Abstract', 'Letter mark', 'Icon + text', 'Emblem'] },
    ],
  },
  website: {
    name: 'Landing Page',
    price: 349,
    questions: [
      { text: "What's your business name?", quickReplies: null },
      { text: "What does your business do? (brief description)", quickReplies: null },
      { text: "Who's your target audience?", quickReplies: ['Young adults (18-30)', 'Professionals (30-50)', 'Families', 'Students', 'General public'] },
      { text: "What's the main goal of the page?", quickReplies: ['Sell a product', 'Collect emails', 'Book a service', 'Showcase work', 'Brand awareness'] },
      { text: "Any colors or style preferences?", quickReplies: ['Modern & clean', 'Bold & vibrant', 'Elegant & minimal', 'Dark & techy', 'Warm & friendly'] },
    ],
  },
  social: {
    name: 'Social Media Kit',
    price: 199,
    questions: [
      { text: "What's your business name?", quickReplies: null },
      { text: "Which platforms do you use?", quickReplies: ['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Multiple'] },
      { text: "What kind of content do you usually post?", quickReplies: ['Product photos', 'Behind the scenes', 'Tips & advice', 'Promotions', 'Mixed content'] },
      { text: "Who's your target audience?", quickReplies: ['Young adults (18-30)', 'Professionals (30-50)', 'Families', 'Students', 'General public'] },
      { text: "What tone do you want?", quickReplies: ['Professional', 'Casual', 'Playful', 'Inspirational', 'Educational'] },
    ],
  },
  branding: {
    name: 'Full Brand Identity',
    price: 399,
    questions: [
      { text: "What's your business name?", quickReplies: null },
      { text: "What does your business do?", quickReplies: null },
      { text: "Describe your brand personality in 3 words.", quickReplies: ['Modern, Clean, Trustworthy', 'Bold, Creative, Energetic', 'Elegant, Minimal, Premium', 'Friendly, Approachable, Fun', 'Professional, Reliable, Smart'] },
      { text: "Who's your target audience?", quickReplies: ['Young adults (18-30)', 'Professionals (30-50)', 'Families', 'Students', 'General public'] },
      { text: "Any colors or styles you love or hate?", quickReplies: ['No preference', 'Love earth tones', 'Love bright colors', 'Prefer monochrome', 'Let AI decide'] },
    ],
  },
}

// Business type quick replies
const businessTypeReplies = ['Restaurant', 'Tech startup', 'E-commerce', 'Agency', 'Fitness', 'Real estate', 'Education', 'Other']

// Chat states
const STATES = {
  ASK_QUESTIONS: 'ask_questions',
  ASK_BUSINESS_TYPE: 'ask_business_type',
  UPLOAD_PHOTOS: 'upload_photos',
  CONFIRM: 'confirm',
}

// ─── Helper Functions ────────────────────────────────────────────────────────
function getInitialMessages(selectedProducts) {
  const productNames = selectedProducts
    .map(id => productInfo[id]?.name)
    .filter(Boolean)
  
  if (productNames.length === 1) {
    return `Perfect! Let's create your **${productNames[0]}**. 🎯\n\nI'll ask you a few questions to make sure it's exactly what you need.`
  }
  
  return `Great choices! You selected: **${productNames.join('**, **')}**. 🎯\n\nI'll ask you a few questions for each service. Let's start with the first one.`
}

function getQuestionsForProduct(productId) {
  return productInfo[productId]?.questions || []
}

function getQuestionText(productId, questionIndex) {
  const questions = getQuestionsForProduct(productId)
  const q = questions[questionIndex]
  return q?.text || q || ''
}

function getQuestionQuickReplies(productId, questionIndex) {
  const questions = getQuestionsForProduct(productId)
  const q = questions[questionIndex]
  return q?.quickReplies || null
}

// ─── Render Markdown-like Bold ───────────────────────────────────────────────
function renderText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// ─── Bot Avatar Component ────────────────────────────────────────────────────
function BotAvatar({ size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20`}>
      <SparkleIcon size={size === 'sm' ? 12 : 14} className="text-white" />
    </div>
  )
}

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4 animate-fadeIn">
      <BotAvatar />
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/40 rounded-2xl rounded-tl-md px-4 py-3 shadow-xl shadow-black/10">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BriefPage({ onNavigate }) {
  const [selectedProducts, setSelectedProducts] = useState([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [businessType, setBusinessType] = useState('')
  const [awaitingBusinessType, setAwaitingBusinessType] = useState(false)
  const [awaitingPhotos, setAwaitingPhotos] = useState(false)
  const [photos, setPhotos] = useState([])
  const [chatState, setChatState] = useState(STATES.ASK_QUESTIONS)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load selected products
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('__SELECTED_PRODUCTS__') || '[]')
      if (stored.length === 0) {
        onNavigate('products')
        return
      }
      setSelectedProducts(stored)
      
      const greeting = getInitialMessages(stored)
      const firstProduct = stored[0]
      
      setMessages([
        { role: 'bot', text: greeting },
        { role: 'bot', text: `Let's start with your **${productInfo[firstProduct]?.name}**.\n\n${getQuestionText(firstProduct, 0)}`, quickReplies: getQuestionQuickReplies(firstProduct, 0) },
      ])
    } catch {
      onNavigate('products')
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const getCurrentQuestions = () => {
    const productId = selectedProducts[currentProductIndex]
    return getQuestionsForProduct(productId)
  }

  const showSummary = () => {
    const total = selectedProducts.reduce((sum, id) => sum + (productInfo[id]?.price || 0), 0)
    const photoCount = photos.length

    const summary = `Here's what I'll create for you:\n\n${selectedProducts.map(id => {
      const p = productInfo[id]
      const productAnswers = Object.entries(answers)
        .filter(([k]) => k.startsWith(id))
        .map(([, v]) => v)
      const mainAnswer = productAnswers[0] || 'N/A'
      return `✅ **${p?.name}** — $${p?.price}\n   For: ${mainAnswer}`
    }).join('\n\n')}\n\n💼 Business: **${businessType}**\n\n📸 Photos: **${photoCount} uploaded**\n\n💰 **Total: $${total}**\n\nReady to launch? Your AI agents will generate everything in minutes!`

    setMessages(prev => [...prev, {
      role: 'bot',
      text: summary,
      quickReplies: ['🚀 Launch Now', '✏️ Edit'],
    }])
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      
      setPhotos(prev => [...prev, { url: base64, description: '', name: file.name }])
      
      setMessages(prev => [...prev, {
        role: 'user',
        text: `📸 Uploaded: ${file.name}`,
        isPhoto: true,
        photoUrl: base64,
      }])
      
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "What's in this photo? Give a short description (e.g., \"baguette\", \"storefront\", \"chef\")",
        awaitingPhotoDescription: true,
      }])
    }
    reader.readAsDataURL(file)
  }

  const processUserInput = async (userMessage) => {
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 600 + Math.random() * 500))

    if (awaitingBusinessType && !businessType) {
      setBusinessType(userMessage)
      setAwaitingBusinessType(false)
      setAwaitingPhotos(true)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "One more thing! Do you have any photos you'd like to add to your website?\n\n📸 Examples: product photos, storefront, team, etc.",
        quickReplies: ['Yes, I have photos', 'No photos needed'],
      }])
      setIsTyping(false)
      inputRef.current?.focus()
      return
    }

    if (businessType && (userMessage.toLowerCase().includes('launch') || userMessage.includes('🚀'))) {
      const total = selectedProducts.reduce((sum, id) => sum + (productInfo[id]?.price || 0), 0)
      const productNames = selectedProducts.map(id => productInfo[id]?.name).join(', ')
      
      const firstAnswers = selectedProducts.map(id => {
        const productAnswers = Object.entries(answers)
          .filter(([k]) => k.startsWith(id))
          .map(([, v]) => v)
        return productAnswers.join('. ')
      }).join('. ')

      const finalData = {
        clientName: Object.values(answers)[0] || 'Client',
        businessType: businessType,
        description: `${productNames}. ${firstAnswers}. Business type: ${businessType}`,
        needs: selectedProducts,
        calculatedPrice: total,
        photos: photos,
      }
      localStorage.setItem('__BRIEF_DATA__', JSON.stringify(finalData))
      setIsTyping(false)
      onNavigate('workflow')
      return
    }

    const productId = selectedProducts[currentProductIndex]
    const questions = getCurrentQuestions()

    const key = `${productId}_q${currentQuestionIndex}`
    setAnswers(prev => ({ ...prev, [key]: userMessage }))

    const nextQuestionIndex = currentQuestionIndex + 1

    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: getQuestionText(productId, nextQuestionIndex),
        quickReplies: getQuestionQuickReplies(productId, nextQuestionIndex),
      }])
    } else if (currentProductIndex < selectedProducts.length - 1) {
      const nextProductIndex = currentProductIndex + 1
      const nextProductId = selectedProducts[nextProductIndex]
      const nextProduct = productInfo[nextProductId]

      setCurrentProductIndex(nextProductIndex)
      setCurrentQuestionIndex(0)

      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Now let's work on your **${nextProduct?.name}**.\n\n${getQuestionText(nextProductId, 0)}`,
        quickReplies: getQuestionQuickReplies(nextProductId, 0),
      }])
    } else {
      setAwaitingBusinessType(true)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Almost done! What type of business is this for?",
        quickReplies: businessTypeReplies,
      }])
    }

    setIsTyping(false)
    inputRef.current?.focus()
  }

  const handleUserMessage = async (msg) => {
    if (isTyping) return

    // Waiting for photo decision
    if (awaitingPhotos) {
      if (msg.toLowerCase().includes('yes') || msg.toLowerCase().includes('photos')) {
        setAwaitingPhotos(false)
        setChatState(STATES.UPLOAD_PHOTOS)
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "Great! Please upload your photos one by one. For each photo, add a short description.\n\n📎 Click the upload button below to add your first photo.",
          showUploadButton: true,
        }])
      } else {
        setAwaitingPhotos(false)
        showSummary()
      }
      setIsTyping(false)
      return
    }

    // Waiting for photo description
    if (chatState === STATES.UPLOAD_PHOTOS && messages[messages.length - 1]?.awaitingPhotoDescription) {
      const lastPhoto = photos[photos.length - 1]
      if (lastPhoto) {
        setPhotos(prev => prev.map((p, i) => 
          i === prev.length - 1 ? { ...p, description: msg } : p
        ))
        
        setMessages(prev => [...prev, { role: 'user', text: msg }])
        
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `Photo labeled as "${msg}" ✅\n\nDo you have more photos to add?`,
          quickReplies: ['Add another photo', 'Done, continue'],
        }])
      }
      setIsTyping(false)
      return
    }

    // Check quick replies for photo flow
    if (chatState === STATES.UPLOAD_PHOTOS) {
      const lowerMsg = msg.toLowerCase()
      if (lowerMsg.includes('add another') || lowerMsg.includes('more photos')) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "Please upload your next photo.",
          showUploadButton: true,
        }])
        setIsTyping(false)
        return
      } else if (lowerMsg.includes('done') || lowerMsg.includes('continue')) {
        showSummary()
        setIsTyping(false)
        return
      }
    }

    // Waiting for business type
    if (awaitingBusinessType && !businessType) {
      setBusinessType(msg)
      setAwaitingBusinessType(false)
      setAwaitingPhotos(true)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "One more thing! Do you have any photos you'd like to add to your website?\n\n📸 Examples: product photos, storefront, team, etc.",
        quickReplies: ['Yes, I have photos', 'No photos needed'],
      }])
      setIsTyping(false)
      return
    }

    // Launch or regular input
    if (businessType) {
      const lowerMsg = msg.toLowerCase()
      if (lowerMsg.includes('launch') || lowerMsg.includes('🚀') || lowerMsg.includes('go') || lowerMsg.includes('start') || lowerMsg.includes('pay')) {
        const total = selectedProducts.reduce((sum, id) => sum + (productInfo[id]?.price || 0), 0)
        const productNames = selectedProducts.map(id => productInfo[id]?.name).join(', ')
        
        const firstAnswers = selectedProducts.map(id => {
          const productAnswers = Object.entries(answers)
            .filter(([k]) => k.startsWith(id))
            .map(([, v]) => v)
          return productAnswers.join('. ')
        }).join('. ')

        const finalData = {
          clientName: Object.values(answers)[0] || 'Client',
          businessType: businessType,
          description: `${productNames}. ${firstAnswers}. Business type: ${businessType}`,
          needs: selectedProducts,
          calculatedPrice: total,
          photos: photos,
        }
        localStorage.setItem('__BRIEF_DATA__', JSON.stringify(finalData))
        onNavigate('workflow')
        return
      }
      return
    }

    processUserInput(msg)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    handleUserMessage(input)
    setInput('')
  }

  const total = selectedProducts.reduce((sum, id) => sum + (productInfo[id]?.price || 0), 0)
  const progress = businessType ? 100 :
    Math.round(((currentProductIndex * 100 + (currentQuestionIndex + 1) * (100 / getCurrentQuestions().length)) / selectedProducts.length))

  const currentProduct = selectedProducts[currentProductIndex] ? productInfo[selectedProducts[currentProductIndex]] : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f17]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform"><ArrowLeft /></span>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5">
            <BotAvatar size="sm" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-white leading-tight">AI Assistant</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total</div>
              <div className="text-sm font-semibold text-white">${total}</div>
            </div>
          </div>
        </div>
        
        <div className="h-[2px] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6">
          {currentProduct && !businessType && (
            <div className="flex items-center justify-center mb-6 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                <CheckCircle />
                <span className="font-medium">{currentProduct.name}</span>
                <span className="text-gray-500">•</span>
                <span className="text-violet-400 font-semibold">${currentProduct.price}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1 animate-fadeIn`}
                  style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                >
                  {!isUser && (
                    <div className="mr-3 mt-1">
                      <BotAvatar />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
                    {/* Photo preview */}
                    {msg.isPhoto && msg.photoUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-gray-700/30">
                        <img src={msg.photoUrl} alt="Uploaded" className="max-h-48 object-cover" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md shadow-violet-500/10'
                        : 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 text-gray-200 rounded-bl-md shadow-black/20'
                    }`}>
                      <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Quick Replies & Upload Button */}
            {!isTyping && messages.length > 0 && (() => {
              const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot')
              
              // Quick Replies
              if (lastBotMsg?.quickReplies) {
                const lastMsgIdx = messages.indexOf(lastBotMsg)
                const hasUserReply = messages.slice(lastMsgIdx + 1).some(m => m.role === 'user')
                if (!hasUserReply) {
                  return (
                    <div className="ml-11 mt-3 mb-2 animate-fadeIn">
                      <div className="flex flex-wrap gap-2">
                        {lastBotMsg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleUserMessage(reply)}
                            className="group relative px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[13px] text-gray-300 hover:bg-violet-500/15 hover:border-violet-500/30 hover:text-violet-200 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5 active:scale-[0.97]"
                            style={{ animationDelay: `${i * 40}ms` }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }
              }
              
              // Upload Button
              if (lastBotMsg?.showUploadButton) {
                const lastMsgIdx = messages.indexOf(lastBotMsg)
                const hasUserReply = messages.slice(lastMsgIdx + 1).some(m => m.role === 'user')
                if (!hasUserReply) {
                  return (
                    <div className="ml-11 mt-3 mb-2 animate-fadeIn">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-[13px] text-violet-200 hover:bg-violet-500/25 transition-all duration-200 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        📷 Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                }
              }
              return null
            })()}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      {!businessType ? (
        <div className="sticky bottom-0 bg-[#0f0f17]/90 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-3xl mx-auto px-5 py-4">
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-1 focus-within:border-violet-500/40 focus-within:bg-white/[0.07] transition-all duration-200 shadow-xl shadow-black/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={isTyping ? "AI is thinking..." : "Type your answer..."}
                  disabled={isTyping}
                  className="flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-40"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    input.trim() && !isTyping
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <SparkleIcon size={10} className="text-gray-600" />
              <p className="text-[10px] text-gray-600">
                Powered by Nemotron 3 Ultra • Zero humans involved
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Launch / Edit Buttons */
        <div className="sticky bottom-0 bg-[#0f0f17]/90 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-3xl mx-auto px-5 py-4">
            <div className="flex gap-3">
              <button
                onClick={() => handleUserMessage('🚀 Launch Now')}
                disabled={isTyping}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                🚀 Launch Now
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                ✏️ Edit
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <SparkleIcon size={10} className="text-gray-600" />
              <p className="text-[10px] text-gray-600">
                Powered by Nemotron 3 Ultra • Zero humans involved
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

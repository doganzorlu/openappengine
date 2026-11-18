import React, { useState, useEffect } from 'react'

interface AnimatedHeadlineProps {
  prefixText?: string
  words?: string[]
  suffixText?: string
  accentColor?: string
  align?: 'left' | 'center' | 'right'
}

export const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({
  prefixText = 'Müzikle ',
  words = ['Gelişiyoruz', 'Umut Oluyoruz', 'Büyüyoruz', 'Birleşiyoruz'],
  suffixText = '',
  accentColor = '#4F46E5',
  align = 'center',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const wordList = words.length > 0 ? words : ['Büyüyoruz']

  useEffect(() => {
    const currentWord = wordList[currentWordIndex % wordList.length]
    const typingSpeed = isDeleting ? 45 : 90
    const pauseDelay = 1800

    if (!isDeleting && displayedText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDelay)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % wordList.length)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? prev.slice(0, -1) : currentWord.slice(0, prev.length + 1)
      )
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, currentWordIndex, wordList])

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'

  return (
    <div className={`w-full my-5 ${alignClass}`}>
      <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
        {prefixText && <span>{prefixText}</span>}
        <span
          style={{ color: accentColor }}
          className="inline-block border-b-4 border-current pb-1 min-w-[60px]"
        >
          {displayedText}
          <span className="animate-pulse opacity-80">|</span>
        </span>
        {suffixText && <span> {suffixText}</span>}
      </h2>
    </div>
  )
}

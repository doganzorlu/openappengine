import React, { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  title: string
  artist?: string
  audioUrl: string
  coverUrl?: string
  accentColor?: string
  bgColor?: string
  textColor?: string
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title = 'Piyano Sonatı No. 1',
  artist = 'Beril Zorlu',
  audioUrl = '',
  coverUrl,
  accentColor = '#FFB92C',
  bgColor = '#0F172A',
  textColor = '#FFFFFF',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const mins = Math.floor(secs / 60)
    const rem = Math.floor(secs % 60)
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`
  }

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="rounded-3xl p-5 sm:p-6 my-4 shadow-xl border border-white/10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-5 transition-all"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Cover / Vinyl Art */}
      <div className="relative shrink-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-lg border-2 border-white/20 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          />
        ) : (
          <div
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-white/10 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            🎵
          </div>
        )}

        {/* Small Play Badge */}
        <button
          type="button"
          onClick={togglePlay}
          style={{ backgroundColor: accentColor, color: '#0F172A' }}
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-sm font-bold hover:scale-110 transition cursor-pointer"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Track Info & Progress */}
      <div className="flex-1 w-full min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold truncate leading-tight">
              {title}
            </h4>
            {artist && (
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {artist}
              </p>
            )}
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="text-gray-400 hover:text-white text-base transition p-1"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Seek Bar */}
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{ accentColor }}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

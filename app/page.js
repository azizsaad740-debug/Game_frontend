'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useState, useRef } from 'react'
import { paymentAPI } from '@/lib/api'

// --- HeroSlider Component ---
const HeroSlider = ({ banners }) => {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000)
    return () => clearInterval(timerRef.current)
  }, [banners.length])

  return (
    <div className="relative w-full h-[460px] overflow-hidden rounded-lg border border-white/10 shadow-2xl group">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          <div
            className="w-full h-full bg-cover bg-center flex flex-col items-start justify-center p-8 md:p-12 relative"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(13, 12, 24, 0.9) 0%, rgba(13, 12, 24, 0.2) 100%), url("${banner.url}")`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 via-transparent to-[#10b981]/10 animate-gradient-shift opacity-30"></div>

            <div className={`flex flex-col gap-4 max-w-md relative z-20 transition-all duration-700 transform ${index === current ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <p className="text-[#10b981] text-sm font-bold uppercase tracking-widest text-shadow-emerald">{banner.tagline}</p>
              <h2 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">{banner.title}</h2>
              <Link
                href={banner.link}
                className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center rounded-md h-12 px-6 bg-[#10b981] text-white text-sm font-bold hover:bg-[#059669] transition-all shadow-glow-emerald hover:scale-110 active:scale-95"
              >
                Şimdi Oyna
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i)
              clearInterval(timerRef.current)
            }}
            className={`w-3 h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-[#10b981] w-8' : 'bg-white/30 hover:bg-white/50'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

// --- PromotionModal Component ---
const PromotionModal = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hidePromoModal', 'true')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#151328] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJFdt_egz5gHLlu-FTOvLZ6GGptOc1EJj71POiCjeDrnMJjkzMvosLXXgK5hUf531IsvMXp6RHYJ_UG6va5bWKdRw7cipUb2LpBgEYuCbIw8YzVmblbTkKs1cjRkNEdU52NUIc1soBkGcFx5u_RvSBouV9UJ5Lj0hirahoJTQHTQk5JMYK77pvjnIFdGy3Yfzo-pZLkCFGgUDmsaW4SdPst-LML4p1l7bymtZx_-CR08BXhFn8aK0aM1oIqjCr-F4NoFFC2wYqaZI"
          alt="Promotion"
          className="w-full aspect-[4/5] object-cover"
        />

        <div className="p-6 text-center">
          <h3 className="text-2xl font-black text-white mb-2">Haftalık %25 Kayıp Bonusu!</h3>
          <p className="text-white/70 mb-6">Tüm kayıplarınızın %25'i her Pazartesi anında hesabınızda.</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#10b981] text-white font-bold rounded-lg shadow-glow-emerald hover:bg-[#059669] transition-all"
            >
              Hemen Yararlan
            </button>

            <label className="flex items-center justify-center gap-2 text-white/50 text-sm cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={() => setDontShowAgain(!dontShowAgain)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#10b981] focus:ring-[#10b981]"
              />
              Bir daha gösterme
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

const JackpotCounter = () => {
  const [jackpot, setJackpot] = useState(12845672.45)

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + (Math.random() * 0.5))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative group overflow-hidden rounded-xl border border-[#10b981]/30 bg-black/60 p-4 shadow-glow-emerald animate-pulse-slow">
      <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 via-transparent to-[#10b981]/10 animate-gradient-shift opacity-30"></div>
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-1">MEGA JACKPOT</p>
        <div className="text-3xl md:text-4xl font-black text-white flex items-baseline gap-1">
          <span className="text-[#10b981]">₺</span>
          {jackpot.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}

const LiveWinnersTicker = () => {
  const [winners, setWinners] = useState([
    { user: 'us***12', amount: '₺14,250', game: 'Sweet Bonanza', time: '2s ago' },
    { user: 'ba***88', amount: '₺8,100', game: 'Aviator', time: '5s ago' },
    { user: 'ca***44', amount: '₺25,000', game: 'Gates of Olympus', time: '8s ago' },
    { user: 'me***01', amount: '₺5,400', game: 'Zeppelin', time: '12s ago' },
    { user: 'se***99', amount: '₺42,000', game: 'Big Bass Splash', time: '15s ago' },
    { user: 'ay***22', amount: '₺12,300', game: 'Sugar Rush', time: '20s ago' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const newWinner = {
        user: `${Math.random().toString(36).substring(2, 4)}***${Math.floor(Math.random() * 100)}`,
        amount: `₺${(Math.floor(Math.random() * 50) * 100 + 500).toLocaleString('tr-TR')}`,
        game: ['Aviator', 'Zeppelin', 'Sweet Bonanza', 'Gates of Olympus'][Math.floor(Math.random() * 4)],
        time: 'Just now'
      }
      setWinners(prev => [newWinner, ...prev.slice(0, 5)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-black/40 border-y border-white/5 py-3 overflow-hidden">
      <div className="flex items-center gap-6 animate-ticker whitespace-nowrap px-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-[#10b981] rounded text-[10px] font-black text-white shrink-0 shadow-glow-emerald">
          <span className="material-symbols-outlined text-xs">emoji_events</span>
          SON KAZANANLAR
        </div>
        {winners.map((winner, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0 group">
            <span className="text-[11px] font-bold text-white/40">{winner.user}</span>
            <span className="text-xs font-black text-[#10b981] group-hover:scale-110 transition-transform">{winner.amount}</span>
            <span className="text-[10px] font-medium text-white/30 italic">{winner.game}</span>
            <div className="h-1 w-1 rounded-full bg-white/10 mx-2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [gameProviders, setGameProviders] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [showPromo, setShowPromo] = useState(false)

  const banners = [
    {
      url: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/sports_betting_banner_1767128036161.png',
      tagline: 'SPOR BAHİSLERİ',
      title: 'En Yüksek Oranlarla Kazanmaya Başla!',
      link: '/sports'
    },
    {
      url: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/live_casino_banner_1767128051180.png',
      tagline: 'CANLI CASINO',
      title: 'Gerçek Kurpiyerler ile Eşsiz Bir Deneyim',
      link: '/play/crazy-time'
    },
    {
      url: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/slot_games_banner_1767128068288.png',
      tagline: 'SLOT OYUNLARI',
      title: '%30 Kayıp Bonusu ile Slotlarda Şansını Dene',
      link: '/play/sweet-bonanza'
    }
  ]

  // Default payment methods fallback (with proper logos)
  const defaultPaymentMethods = [
    { id: 'papara', name: 'Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '200₺', available: true },
    { id: 'jeton', name: 'Jeton', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv96O1SbNqWATvQvL9l61h0u8wOp57jNAjFSVQAFYTrTo2HZqp6TzeA-RsvY9IBMO2jmezGHNDg0r0UBGKTozMLIkXQZo4k89DDK4R925SzIBZoX7IFIfWPM9y85U-DzzJHmvdJSwsq4XgxZ5_FpWKPD-vhK4WIz3UbvBrkOCVke5Wp8jlFJ9JdF_vAvWuMMG1OIrluFqn59xjqYgcApwSTwURRkPJmbWN1HEunMVTTwljV0qeTacLthvGA5ZeesL-OomL8hHzrcs', min: '200₺', available: true },
    { id: 'payfix', name: 'Payfix', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '25₺', available: true },
    { id: 'aninda-papara', name: 'Aninda Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '1₺', available: true },
    { id: 'hizli-papara', name: 'Hizli Papara', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', min: '50₺', available: true },
    { id: 'aninda-havale', name: 'Aninda Havale', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '250₺', available: true },
    { id: 'banka-havalesi', name: 'Banka Havalesi', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', min: '250₺', available: true },
    { id: 'mefete', name: 'MEFETE', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_QZPkcEwRgV2w29ueS8OBBJfim6_mPkVEjpxC1ArE5gg38siNYQu9zatW3xQjjNXElC6uaSnT_8wzIShR_bjRBdeN-JkpkWeV_pjXHkGH1ZrDibNf247kJoP-9QxR0QA2Zy2gIg0n4G_WqK1OUPjC3hnz9LRT4IhgBT0GTfkudTS38lm8peLtaiDaRCyiiGd2INgtFLy74hcenW-Fs65OXDh_-ICby-tcDeKe-KXlRyigL3OeYYWHGR6K31Z7sv189tPfFbglRtg', min: '20₺', available: true },
  ]

  // Default game providers fallback
  const defaultGameProviders = [
    { id: 'pragmatic-play', name: 'Pragmatic Play', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3kwS4yyM7hQZ4Qf9EzLOPpWlojJppui1Gjv9a8q7EmCAYfGxS8LaMn9jRpKLwbcLY-BQ40DHVnaElyo7jHY0DE7v3V16kzdakcyLADBsAtCc8Jmaheg9ntYoYtCOexD_c2vltciWwFicWGdUlexOkhYB0wVz2iIY5dnXH04gxrUc9QiYDJ-_vyVGWEwaTN7mKGduSQ71r2iMfmXrAPrN7JMnnfiQrOZPoB9z3oIsrk1PxcoK9hp6iLP7jb6DBkgcxo-XSMUoIxUk', available: true },
    { id: 'amusnet', name: 'Amusnet', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk', available: true },
    { id: 'egt-digital', name: 'EGT Digital', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM', available: true },
    { id: 'hacksaw-gaming', name: 'Hacksaw Gaming', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4', available: true },
    { id: 'evolution', name: 'Evolution', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLViOFoCPPyIH92cUFJxjd9eQ7OK5lhwvXpJOVIaGjRgLOVhlBop6EC2HJaRfysVcPbHIfIH5QAbLMAaAjks3vJXhnTucNrRTPCkBOHiqy9jKVCE5y9Oa2d7yOM2bKr0YdSG1ivRPKfmMMTERUWiOLWh0HMIxWDPq8LFtaArBJHZuNdLfuyf4FRGIzh6o5OmY1wNghWYSRHQvjE4T-3gt8caWVEasL_BJFrJ4YYBNWC81GTl_hbJvur6q9C1Q5-erfmJ5Aufi8uxE', available: true },
    { id: 'ezugi', name: 'Ezugi', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA2VZQxDW8ohkuCpe0yXlCQ-WwyzFV_0UgNWe0q6-d-mFqS9IYxLNVYGP1l0ZgF_OsK7WbSTKvP6-rMGb36qMLsQF4RtFA9-fuQhXzgeMCoK5P7JwObTL7C--5K4RI5icxiJdWQW9_97lU1em5U6-V4KTzcXpJbAaXf2pm-P7EMXgUao6CpbOZboJ2s1vFF8onp_HfRatKgjBfjynB76i8xmHfoWmyvOYUnLl8QWLw1rYAlrgEW1GMx2I-XPZhk5bhzzUqbQ54DmY', available: true },
  ]

  // Fetch payment methods dynamically
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentAPI.getDepositMethods()
        const methods = response.data?.methods || response.data || []

        const mappedMethods = methods.map(method => {
          const defaultMethod = defaultPaymentMethods.find(d =>
            d.id === method.id ||
            d.name.toLowerCase() === method.name?.toLowerCase() ||
            (method.nameEn && d.name.toLowerCase() === method.nameEn.toLowerCase())
          )

          return {
            id: method.id || method.name?.toLowerCase().replace(/\s+/g, '-'),
            name: method.name || method.nameEn || 'Unknown',
            logo: method.image || defaultMethod?.logo || 'https://via.placeholder.com/150',
            min: method.min || '100₺',
            available: method.available !== false,
          }
        })
        setPaymentMethods(mappedMethods.length > 0 ? mappedMethods : defaultPaymentMethods)
      } catch (error) {
        console.error('Failed to fetch payment methods:', error)
        setPaymentMethods(defaultPaymentMethods)
      } finally {
        setLoadingPaymentMethods(false)
      }
    }
    fetchPaymentMethods()
  }, [])

  // Fetch game providers
  useEffect(() => {
    setTimeout(() => {
      setGameProviders(defaultGameProviders)
      setLoadingProviders(false)
    }, 300)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    if (!localStorage.getItem('hidePromoModal')) {
      setTimeout(() => setShowPromo(true), 2000)
    }

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.fade-in-on-scroll').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const gameCategories = [
    { id: 'sports', title: 'SPOR BAHİSLERİ', image: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/sports_betting_banner_1767128036161.png' },
    { id: 'crazy-time', title: 'CANLI CASINO', image: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/live_casino_banner_1767128051180.png' },
    { id: 'sweet-bonanza', title: 'SLOT OYUNLARI', image: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/slot_games_banner_1767128068288.png' },
    { id: 'aviator', title: 'AVIATOR', image: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/aviator_game_card_1767128157076.png' },
    { id: 'zeppelin', title: 'ZEPPELIN', image: 'file:///C:/Users/Saada/.gemini/antigravity/brain/2f4400fc-ab13-430a-8cf0-c35f6971832d/zeppelin_game_card_1767128173215.png' },
  ]

  const trendingGames = [
    { id: 'gates-of-olympus', title: 'Gates of Olympus', provider: 'Pragmatic Play', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY', badge: 'POPÜLER' },
    { id: 'sweet-bonanza', title: 'Sweet Bonanza', provider: 'Pragmatic Play', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY', badge: 'YENİ' },
    { id: 'starburst', title: 'Starburst', provider: 'NetEnt', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY' },
    { id: 'dog-house', title: 'The Dog House', provider: 'Pragmatic Play', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY' },
  ]

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-[#151328]">
      <div className="layout-container flex h-full grow flex-col w-full">
        <div className="flex flex-1 justify-center w-full">
          <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1 mx-auto navbar-spacing">
            <Navbar />

            <main className="flex-1 w-full">
              {/* Hero Slider */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <HeroSlider banners={banners} />
              </div>

              {/* Statistics & Jackpot Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-6 fade-in-on-scroll">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: t('home.activeUsers'), value: '50K+', icon: 'groups' },
                      { label: t('home.totalBets'), value: '2M+', icon: 'sports_score' },
                      { label: t('home.dailyPayouts'), value: '₺500K+', icon: 'payments' },
                      { label: t('home.securityScore'), value: '99.9%', icon: 'shield_check' }
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg border border-white/5 card-glow transform transition-all duration-300 hover:scale-105">
                        <span className="material-symbols-outlined text-[#10b981] mb-2">{stat.icon}</span>
                        <span className="text-white text-xl font-black">{stat.value}</span>
                        <span className="text-white/50 text-xs font-bold uppercase">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-4">
                    <JackpotCounter />
                  </div>
                </div>
              </div>

              {/* Game Categories */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white text-2xl font-bold tracking-tight text-gradient">
                    {t('home.exploreCategories')}
                  </h2>
                  <div className="h-[2px] flex-1 mx-6 bg-gradient-to-r from-[#10b981]/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {gameCategories.map((category, index) => {
                    const getCategoryLink = (category) => {
                      if (category.id === 'sports') return '/sports';
                      return `/play/${category.id}`;
                    };
                    const getCategoryTitle = (title) => {
                      if (title === 'SPOR BAHİSLERİ') return t('home.sportsBetting');
                      if (title === 'SLOT OYUNLARI') return t('home.slotGames');
                      if (title === 'SANAL SPORLAR') return t('home.virtualSports');
                      if (title === 'CRASH OYUNLARI') return t('home.crashGames');
                      return title;
                    };

                    return (
                      <Link
                        key={index}
                        href={getCategoryLink(category)}
                        className="group relative flex flex-col items-center justify-end overflow-hidden rounded-xl aspect-[4/5] card-hover border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105"
                      >
                        <img
                          src={category.image}
                          alt={category.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                        <div className="absolute inset-0 bg-[#10b981]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 p-6 w-full text-center transform transition-transform duration-500 group-hover:-translate-y-2">
                          <h3 className="text-white text-sm font-black uppercase tracking-widest text-shadow-glow">
                            {getCategoryTitle(category.title)}
                          </h3>
                          <div className="mt-2 h-1 w-0 bg-[#10b981] mx-auto transition-all duration-500 group-hover:w-16 shadow-glow-emerald"></div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Trending Games Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 bg-white/5 fade-in-on-scroll">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white text-2xl font-bold text-gradient">{t('home.trendingNow')}</h2>
                  <Link href="/slots" className="text-[#10b981] text-sm font-bold hover:underline flex items-center gap-1 group">
                    {t('home.seeAll')} <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>

                <div className="relative">
                  <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide no-scrollbar">
                    {trendingGames.map((game) => (
                      <div key={game.id} className="flex-shrink-0 w-64 group cursor-pointer animate-float" style={{ animationDelay: `${game.id * 0.2}s` }}>
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 card-hover transform transition-all duration-300 hover:scale-110">
                          <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Link href={`/play/${game.id}`}>
                              <span className="material-symbols-outlined text-white text-4xl transform scale-50 group-hover:scale-100 transition-transform cursor-pointer">play_circle</span>
                            </Link>
                          </div>
                          {game.badge && (
                            <span className="absolute top-2 left-2 bg-[#10b981] text-white text-[10px] font-black px-2 py-1 rounded shadow-glow-emerald">
                              {game.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 px-1">
                          <h4 className="text-white text-sm font-bold truncate group-hover:text-[#10b981] transition-colors">{game.title}</h4>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{game.provider}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex-shrink-0 w-8"></div>
                  </div>
                </div>
              </div>

              {/* Call to Action Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div className="bg-gradient-to-r from-[#10b981]/20 via-[#059669]/20 to-[#10b981]/20 rounded-lg p-8 md:p-12 border border-white/10 card-hover glass text-center transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group">
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 via-transparent to-[#10b981]/10 animate-gradient-shift opacity-30"></div>

                  <div className="relative z-10">
                    <h2 className="text-white text-3xl md:text-4xl font-black mb-4 text-shadow-emerald transform transition-all duration-300 group-hover:scale-105">
                      Hemen Başlayın ve Kazanmaya Başlayın!
                    </h2>
                    <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto transform transition-all duration-300 group-hover:text-white">
                      Binlerce oyun, hızlı ödemeler ve güvenli platform ile eğlencenin tadını çıkarın.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => router.push('/deposit')}
                        className="bg-[#10b981] text-white text-lg font-bold px-8 py-3 rounded-md hover:bg-[#059669] transition-all duration-300 hover:scale-110 shadow-glow-emerald transform hover:-translate-y-1"
                      >
                        Hemen Yatır
                      </button>
                      <button
                        onClick={() => router.push('/slots')}
                        className="bg-transparent border-2 border-white text-white text-lg font-bold px-8 py-3 rounded-md hover:bg-white/10 transition-all duration-300 hover:scale-110 transform hover:-translate-y-1"
                      >
                        Oyunları Keşfet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TV Games & Lucky Wheel Section */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#10b981] animate-bounce">live_tv</span>
                    <h2 className="text-white text-2xl font-bold tracking-tight text-gradient-emerald">
                      {t('home.tvGamesHeader')}
                    </h2>
                  </div>
                  <Link href="/tv-games" className="text-white/40 text-xs font-bold hover:text-[#10b981] transition-colors">TÜMÜNÜ GÖR</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { id: 'tv-bet', title: 'TV BET', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjPNLqQFPxRhlnwXsXC31ZpGayc1URQmJHAaKr6iVluWvhIARqkjLtDSu0eXi8SMabkf3FiWO2qwjEwPmWJUjY_wjlFpFXr55SvTDz_eV3LaZ6arpNvKYFAhb9OZSOtKsxyiC-tY3VJI9PuGw8TeDIJe4hLUHNLwypPvCMbicRAn49H03QwEOaEvJZ1TzxqjZ2dPT7wSgMYZhSZlBGG1szQ9c0dFP5Z6nwgbNE1CXVAVdvXa2b0rzPf1npQqAypXFeW1SWa1rrNJU' },
                    { id: 'lotto', title: 'LOTTO', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLViOFoCPPyIH92cUFJxjd9eQ7OK5lhwvXpJOVIaGjRgLOVhlBop6EC2HJaRfysVcPbHIfIH5QAbLMAaAjks3vJXhnTucNrRTPCkBOHiqy9jKVCE5y9Oa2d7yOM2bKr0YdSG1ivRPKfmMMTERUWiOLWh0HMIxWDPq8LFtaArBJHZuNdLfuyf4FRGIzh6o5OmY1wNghWYSRHQvjE4T-3gt8caWVEasL_BJFrJ4YYBNWC81GTl_hbJvur6q9C1Q5-erfmJ5Aufi8uxE' },
                    { id: 'wheel-of-fortune', title: 'WHEEL OF FORTUNE', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8qmSEpnangbZPsEjVrL4-T_QPnQkwNw-hEeOmBbriCBPZ0rAdek9_QXP3OxhpJ4TT1Vv-sFc9RtkrNVz9okC-aMPyaeFOghAFXTt0ggedS8eftCzprVzWRuleHIcF8813i6rAJ1Ef8s0yzVx3TbeeaVLXcLBvLkt-jpxGRC4e7fSDs-pKcyTVXvmCSqAqkKGxFsznPC_WtVn-pl4HY-lYn6vFERfeOA4G3uX_-npkmhkZ8b242jMomzQMvGI35c1jqJFlNcMCqCY' },
                    { id: 'keno', title: 'KENO', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxL1mseMlK2-RLOjovS4IIJ0pwn3Nvdm_yIiJltXUeUrWycM84O2-syNPpKZ4QoyXyLmqRmsdts_-Crvliv3zi5_DabbcAGW5_i1oZTRAFUKy0FJDHiNsM_XDdwAiCKz-VTEVjK6IL4_eHbK1Uavg71T2aS7BRPUiKr6ylEEvKe4jpgb3TauZzHWPFju1QBLhy49KoC5l67zEAZdYC3GMcDvMatAW3YSX79vAwNP6NgkW-l-NOj4a4xZZvm7eCwS7W4kF42-dDTA' }
                  ].map((game, i) => (
                    <Link key={i} href={`/play/${game.id}`} className="group relative overflow-hidden rounded-xl aspect-video border border-white/5 card-hover">
                      <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="text-white text-sm font-black tracking-widest uppercase">{game.title}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-4 py-2 bg-[#10b981] text-white text-[10px] font-black rounded shadow-glow-emerald">OYNA</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Game Providers Grid */}
              <div className="px-4 sm:px-6 lg:px-8 py-10 fade-in-on-scroll border-t border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-white text-2xl font-bold text-gradient-emerald">Oyun Sağlayıcıları</h2>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
                  {defaultGameProviders.map((provider, index) => (
                    <div key={index} className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/5 card-hover">
                      <img src={provider.logo} alt={provider.name} className="max-h-8 object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <Footer />
            </main>
          </div>
        </div>
      </div>

      <PromotionModal isOpen={showPromo} onClose={() => setShowPromo(false)} />

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .animate-ticker { 
          animation: ticker 30s linear infinite; 
          display: flex;
          width: fit-content;
        }
        .animate-ticker:hover { animation-play-state: paused; }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { animation: gradient-shift 3s ease infinite; background-size: 200% 100%; }
        
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        
        .text-gradient-emerald {
          background: linear-gradient(135deg, #fff 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

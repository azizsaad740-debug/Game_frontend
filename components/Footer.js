'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-10 bg-[#1f1d37] mt-10 w-full">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-white mb-4">{t('home.help')}</h3>
          <ul className="space-y-2">
            <li><Link className="text-sm text-white/70 hover:text-white transition-all hover:translate-x-1 inline-block" href="/help/faq">{t('home.faq')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-all hover:translate-x-1 inline-block" href="/help/payment-options">{t('home.paymentOptions')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-all hover:translate-x-1 inline-block" href="/help/contact">{t('home.contactUs')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">{t('home.aboutUs')}</h3>
          <ul className="space-y-2">
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/about/bonus-rules">{t('home.generalBonusRules')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/about/responsible-gaming">{t('home.responsibleGaming')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/about/privacy-policy">{t('home.privacyPolicy')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">{t('home.termsAndConditions')}</h3>
          <ul className="space-y-2">
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/terms/general">{t('home.generalTerms')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/terms/sports-betting">{t('home.sportsBettingRules')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">{t('home.statistics')}</h3>
          <ul className="space-y-2">
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/stats/results">{t('home.results')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/stats/statistics">{t('home.statisticsLink')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">{t('home.promotions')}</h3>
          <ul className="space-y-2">
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/promotions?category=sports">{t('home.sportBonus')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/promotions?category=casino">{t('home.casinoBonus')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/promotions?category=freespin">{t('home.freespinBonus')}</Link></li>
            <li><Link className="text-sm text-white/70 hover:text-white transition-colors" href="/promotions?category=general">{t('home.generalBonus')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 relative z-10">
        <h3 className="text-center font-bold text-white mb-6 text-gradient">{t('home.regulationsAndPartners')}</h3>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 opacity-70 hover:opacity-100 transition-opacity duration-300">
          <img alt="MaksiPara Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3kwS4yyM7hQZ4Qf9EzLOPpWlojJppui1Gjv9a8q7EmCAYfGxS8LaMn9jRpKLwbcLY-BQ40DHVnaElyo7jHY0DE7v3V16kzdakcyLADBsAtCc8Jmaheg9ntYoYtCOexD_c2vltciWwFicWGdUlexOkhYB0wVz2iIY5dnXH04gxrUc9QiYDJ-_vyVGWEwaTN7mKGduSQ71r2iMfmXrAPrN7JMnnfiQrOZPoB9z3oIsrk1PxcoK9hp6iLP7jb6DBkgcxo-XSMUoIxUk" />
          <img alt="Aninda Havale Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4" />
          <img alt="Envoy Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk" />
          <img alt="Jeton Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv96O1SbNqWATvQvL9l61h0u8wOp57jNAjFSVQAFYTrTo2HZqp6TzeA-RsvY9IBMO2jmezGHNDg0r0UBGKTozMLIkXQZo4k89DDK4R925SzIBZoX7IFIfWPM9y85U-DzzJHmvdJSwsq4XgxZ5_FpWKPD-vhK4WIz3UbvBrkOCVke5Wp8jlFJ9JdF_vAvWuMMG1OIrluFqn59xjqYgcApwSTwURRkPJmbWN1HEunMVTTwljV0qeTacLthvGA5ZeesL-OomL8hHzrcs" />
          <img alt="Papara Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM" />
          <img alt="MEFETE Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_QZPkcEwRgV2w29ueS8OBBJfim6_mPkVEjpxC1ArE5gg38siNYQu9zatW3xQjjNXElC6uaSnT_8wzIShR_bjRBdeN-JkpkWeV_pjXHkGH1ZrDibNf247kJoP-9QxR0QA2Zy2gIg0n4G_WqK1OUPjC3hnz9LRT4IhgBT0GTfkudTS38lm8peLtaiDaRCyiiGd2INgtFLy74hcenW-Fs65OXDh_-ICby-tcDeKe-KXlRyigL3OeYYWHGR6K31Z7sv189tPfFbglRtg" />
          <img alt="Aninda Kredi Karti Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3kwS4yyM7hQZ4Qf9EzLOPpWlojJppui1Gjv9a8q7EmCAYfGxS8LaMn9jRpKLwbcLY-BQ40DHVnaElyo7jHY0DE7v3V16kzdakcyLADBsAtCc8Jmaheg9ntYoYtCOexD_c2vltciWwFicWGdUlexOkhYB0wVz2iIY5dnXH04gxrUc9QiYDJ-_vyVGWEwaTN7mKGduSQ71r2iMfmXrAPrN7JMnnfiQrOZPoB9z3oIsrk1PxcoK9hp6iLP7jb6DBkgcxo-XSMUoIxUk" />
          <img alt="Bitcoin Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_QZPkcEwRgV2w29ueS8OBBJfim6_mPkVEjpxC1ArE5gg38siNYQu9zatW3xQjjNXElC6uaSnT_8wzIShR_bjRBdeN-JkpkWeV_pjXHkGH1ZrDibNf247kJoP-9QxR0QA2Zy2gIg0n4G_WqK1OUPjC3hnz9LRT4IhgBT0GTfkudTS38lm8peLtaiDaRCyiiGd2INgtFLy74hcenW-Fs65OXDh_-ICby-tcDeKe-KXlRyigL3OeYYWHGR6K31Z7sv189tPfFbglRtg" />
          <img alt="FastCash Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk" />
          <img alt="Payfix Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRLnCRDbvF49AdXxAytYRof2OBbII4_iVQGoCJJQG-KSAPj__dGcqYXdW4RSsKISR1NEcyxIGYb_rMuR8AnLwSN4GGNm0da23s9F61Tw24Oa1pnmctKIZe_3NGTkz8waCrbqBXJoHdTxWCN4kwrLFqYUdOEbCwXQBNhhkeWpHzckt8gqLEGh6uApxucdhfzlILsqTAYUae46wc2MGsbm6GI7YXSv_OtOtha68q_Ls4z4jI-pAqhFKocJFT0UA6QcLTfdw1sNJjQy4" />
          <img alt="PeP Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv96O1SbNqWATvQvL9l61h0u8wOp57jNAjFSVQAFYTrTo2HZqp6TzeA-RsvY9IBMO2jmezGHNDg0r0UBGKTozMLIkXQZo4k89DDK4R925SzIBZoX7IFIfWPM9y85U-DzzJHmvdJSwsq4XgxZ5_FpWKPD-vhK4WIz3UbvBrkOCVke5Wp8jlFJ9JdF_vAvWuMMG1OIrluFqn59xjqYgcApwSTwURRkPJmbWN1HEunMVTTwljV0qeTacLthvGA5ZeesL-OomL8hHzrcs" />
          <img alt="Paycell Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM" />
          <img alt="Aninda Papara Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrUOWIw-W1huRgXhguTyN9rXCVw-1rQqWcmcb5Kb9qURdaMi2B-4k6WdQJlltVW8HJaBz_kBD5l93hKYoeMVgHM13a4EAIEWQDidbhEHah4jXewTtIxb9zZeOIBJ7r0rpQdHTAI8ol0cSKRvx84dYjhDlEBCWIuTfrW0RFQUOSA43iOSOUJhiLTZWqpvdWwg64zg3Q6bWKTouX77aKaOtVhx34KZH9-tcY9KLsLCeen4hAr3fE-b08WysDtEIuApiJ9gr9LLZ5USM" />
          <img alt="Tosla Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPXSfIOH2zDcB7mCKHsxEv2BqCSqiSAt9_dfPw0cDd5c-zBHS8KCKOetJL2qg-DOZgoXz7_UuMNf3YQj8vquRCHLk5XP_6-PsSJawl2-gOd5Le_-NizI_uNGSS6SWPbGnB5zh2xm4sCp2KwTVwnSEE8ytIkWZaQNwFlf5ScG9vgymq4RVKzpdowc0sTSJ4IyddWme_fTE4m2iu5-Jg4rzgK58OQM8Ck9ZqyBRuyIMGFHEVwb0TvRtwmyFAQ2eFoxpqX1eBxwX5xBk" />
          <img alt="RocketPay Logo" className="h-6 hover-scale transition-transform duration-300 cursor-pointer hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv96O1SbNqWATvQvL9l61h0u8wOp57jNAjFSVQAFYTrTo2HZqp6TzeA-RsvY9IBMO2jmezGHNDg0r0UBGKTozMLIkXQZo4k89DDK4R925SzIBZoX7IFIfWPM9y85U-DzzJHmvdJSwsq4XgxZ5_FpWKPD-vhK4WIz3UbvBrkOCVke5Wp8jlFJ9JdF_vAvWuMMG1OIrluFqn59xjqYgcApwSTwURRkPJmbWN1HEunMVTTwljV0qeTacLthvGA5ZeesL-OomL8hHzrcs" />
        </div>
      </div>
    </footer>
  )
}


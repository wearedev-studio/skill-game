import './Header.css';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: 'ru' | 'en') => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="site-header">
      <div className="logo">Игровая Платформа</div>
      <nav>
        <a href="#games">{t('header.games')}</a>
        <a href="#tournaments">{t('header.tournaments')}</a>
        <a href="#faq">{t('header.faq')}</a>
      </nav>
      <div className="controls">
        <div className="lang-switcher">
          <button onClick={() => changeLanguage('ru')} disabled={i18n.language === 'ru'}>RU</button>
          <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>EN</button>
        </div>
        <button className="cta-button">{t('header.play_button')}</button>
      </div>
    </header>
  );
};
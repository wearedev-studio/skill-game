import './Hero.css';
import { useTranslation } from 'react-i18next';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button className="cta-button-large">{t('hero.join_button')}</button>
    </section>
  );
};
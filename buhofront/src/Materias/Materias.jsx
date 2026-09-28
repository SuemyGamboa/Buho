import { useState } from 'react';
import './Materias.css';


const Materias = () => {
  const [activeTab, setActiveTab] = useState('inicio');
   <button onClick={() => navigate('/')}>
    Volver al inicio
  </button>

  const speakTitle = (text, btn) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      if (btn) {
        btn.classList.add('scale-110');
        setTimeout(() => btn.classList.remove('scale-110'), 600);
      }
    }
  };

  const playVoiceGreeting = (btn) => {
    speakTitle(
      '¡Hola Mateo! Hoy tienes 3 misiones listas. ¿Listo para ganar tus 3 estrellas?',
      btn
    );
  };

  const materias = [
    {
      id: 'matematicas',
      badge: 'Números mágicos',
      badgeColor: 'primary',
      titulo: 'Matemáticas 🔢',
      descripcion: 'Números, sumas y figuras mágicas',
      icono: 'calculate',
      gradient: 'linear-gradient(135deg, #4d96ff, #fed33a)',
      shadowColor: '#005db8',
      colorFondo: '#4d96ff',
      colorTexto: '#ffffff',
      shadowBoton: '#005db8',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAylv7SXjm7PTHs3IiAVF195ROm6mZ_2NUpof5FtV8HFQF1svLJiavXTKzn7yVvdOTXc6cttyTWfpUGDvbIHxETmUxMC7knGUXmIE_DUDBEuX5hA3uzZX3al7hNO_6kYYUrfTFY-BxDUBXdBYe6U9ivcr0xSwAWgCM_PfYlmjY1IgtJZM-JJ-utOzIQinMSMjgmMBNvlUHcJxQVH2V9A92dFRWq_kqiyRA_E2QH79RmPopp1Sl4Z830',
      ubicacion: 'Isla de la Geometría',
      insignia: 'Nivel Bronce',
      insigniaIcono: 'military_tech',
      insigniaColor: '#725c00',
      progreso: '4 de 10 actividades',
      porcentaje: 40,
      progresoColor: '#4d96ff',
      botonTexto: 'JUGAR AHORA',
    },
    {
      id: 'espanol',
      badge: 'Letras saltarinas',
      badgeColor: 'tertiary',
      titulo: 'Español y Lectura 📚',
      descripcion: 'Letras, palabras y cuentos',
      icono: 'auto_stories',
      gradient: 'linear-gradient(135deg, #ff6064, #fed33a)',
      shadowColor: '#b52330',
      colorFondo: '#4d96ff',
      colorTexto: '#ffffff',
      shadowBoton: '#005db8',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvMvtREpbP4skCzoYL8_RMwg2LvPxV-Fd0pcVFY5GrH1vKhKEJf6RWfc1QQdxezt3Fcw7dVtJqoBlrQIxMP-4kmIiB_N90L94C_Hylow5S459jadwoEJdmNGfbJkjvPdKNA3HQhTbTniFH0245UeKBD2mEFgUeuxQ2qykssxxRV_FK-vNHGspzO9erjUs8fpNwY_P8KhDpQjLLi5s2WaSPy1E-O4PTeD067V9Vhzp4_uADlZuMBe3D',
      ubicacion: 'Bosque de las Palabras',
      insignia: 'Insignia Brillante',
      insigniaIcono: 'verified',
      insigniaColor: '#ff6064',
      progreso: '6 de 10 actividades',
      porcentaje: 60,
      progresoColor: '#ff6064',
      botonTexto: 'JUGAR AHORA',
    },
    {
      id: 'ciencias',
      badge: 'Mundo explorador',
      badgeColor: 'green',
      titulo: 'Ciencias Naturales 🌱',
      descripcion: 'Planetas, animales y naturaleza',
      icono: 'potted_plant',
      gradient: 'linear-gradient(135deg, #4ECB71, #fed33a)',
      shadowColor: '#2b8244',
      colorFondo: '#4ECB71',
      colorTexto: '#ffffff',
      shadowBoton: '#2b8244',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl39B4DMEtZHecdmojIYeBBvN8qBdDH8Y5xeFnrx0wG38bMr_PCzcSwoNP6EVTzaBg_f2xjbyXUnOQHnHsyX1NsCEp-dnnb_CeZY0e3cSw4WvzK_u_PrENtHTX9gjhE3SYTn4Fx7RurHunwGoatM0C7NFV4ZaGxJ30VZ8ZvE02U2e-YQw5PWwxdmiWrg5cEDwhsFvSXK4bZdsaIvGcc5Vaxy8y_YMY9dWconvNpitk-PWRjcHtDzhl',
      ubicacion: 'Valle Verde y Galáctico',
      insignia: 'Brote Aventurero',
      insigniaIcono: 'eco',
      insigniaColor: '#4ECB71',
      progreso: '2 de 10 actividades',
      porcentaje: 20,
      progresoColor: '#4ECB71',
      botonTexto: 'JUGAR AHORA',
    },
  ];

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'materias', label: 'Materias', icon: 'category' },
    { id: 'misiones', label: 'Misiones', icon: 'flag_circle' },
    { id: 'mi-album', label: 'Mi Álbum', icon: 'stars' },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo">
            <img
              alt="ChikiAprende Star Mascot Logo"
              className="home-logo-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwzJVNzeHvFNvvM0CiEx1lhJV-snEp55z2tG0DQ5TD3nyuArINXr1ciDa-iilEURIZnxWu1RGPD_reaULq8rNR-8D3vS46yz7BauNFjnUa6CwZr4mqb6OgubM9N2Qm3bfe3wONnu_e6P5mYcdeDv77SMf-v_EgqMbW7rPi79SzJqz83sU3UPVZBS0XDXfXdx44GYPO81Lk3WubHx_O0TCVaP9i-fbRBspny-tNtF1EyUjwLXmtIwh1"
            />
            <div className="home-logo-text">
              <span className="home-logo-title">ChikiAprende</span>
              <span className="home-logo-badge">Nivel 3 🌟</span>
            </div>
          </div>
          <div className="home-stats">
            <div className="stat-pill stat-yellow">
              <span>⭐</span>
              <span className="stat-value">140</span>
            </div>
            <div className="stat-pill stat-red">
              <span>🔥</span>
              <span className="stat-badge">5d</span>
            </div>
            <div className="stat-pill stat-blue">
              <span>💎</span>
              <span className="stat-value">45</span>
            </div>
            <div className="home-profile">
              <img
                alt="Profile"
                className="home-profile-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrqJtk5JfToQsrTgKSBorn05eIhUxdZEqsQrf4stKvBeD_yfr0-JG60GafyTMhTHcKhuGCytDcbYarTi5bOUjOZX11zDiKhzkHnwlRaiBO4uT3Lh7_ucvKS0iSsDSwiWrcZW5yyWzaIO9Yggu10NVa9xtEdeMAliveMSgZ7mp9HSC0Yp2o1UKGyszb6X-UqtYYA68lHRZMPKxyq4GzTsu_hAMmLRYAzEVXW7mwx8_33q2maD2Gwza9"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="home-main">
        <div className="home-content">
          {/* Saludo */}
          <section className="greeting-card">
            <div className="greeting-text">
              <h1 className="greeting-name">¡Hola Mateo! 👋</h1>
              <p className="greeting-info">
                <span className="pulse-dot"></span>
                Hoy tienes <strong>3 misiones</strong> listas
              </p>
            </div>
            <button
              aria-label="Escuchar saludo"
              className="voice-btn voice-btn-yellow"
              onClick={(e) => playVoiceGreeting(e.currentTarget)}
              type="button"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
            </button>
          </section>

          {/* Misión del día */}
          <section className="mission-card">
            <div className="mission-header">
              <div className="mission-title-group">
                <div className="mission-icon-wrapper">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    emoji_events
                  </span>
                </div>
                <span className="mission-title">Misión del día</span>
              </div>
              <span className="mission-badge">2 / 3 ⭐</span>
            </div>
            <p className="mission-desc">
              ¿Listo para ganar 3 estrellas hoy? ⭐⭐⭐
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '66.6%' }}></div>
              <div className="progress-label">66%</div>
            </div>
          </section>

          {/* Mis Materias */}
          <section className="materias-section">
            <div className="materias-header">
              <h2 className="materias-title">Mis Materias</h2>
              <span className="materias-badge">Aventuras Activas</span>
            </div>

            {materias.map((m) => (
              <article key={m.id} className="materia-card">
                <div className="materia-top">
                  <div className="materia-info">
                    <div
                      className="materia-icon"
                      style={{
                        background: m.gradient,
                        boxShadow: `0 4px 0 ${m.shadowColor}`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {m.icono}
                      </span>
                    </div>
                    <div className="materia-title-group">
                      <span
                        className={`materia-badge materia-badge-${m.badgeColor}`}
                      >
                        {m.badge}
                      </span>
                      <h3 className="materia-name">{m.titulo}</h3>
                    </div>
                  </div>
                  <button
                    aria-label={`Leer ${m.titulo}`}
                    className="voice-btn voice-btn-small"
                    style={{ color: m.shadowColor }}
                    onClick={(e) =>
                      speakTitle(`${m.titulo}: ${m.descripcion}`, e.currentTarget)
                    }
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      volume_up
                    </span>
                  </button>
                </div>

                <p className="materia-desc">{m.descripcion}</p>

                <div className="materia-image-wrapper">
                  <img alt={m.titulo} className="materia-image" src={m.img} />
                  <div className="materia-image-overlay"></div>
                  <span className="materia-image-label">{m.ubicacion}</span>
                </div>

                <div className="materia-progress-box">
                  <div className="materia-progress-info">
                    <span
                      className="material-symbols-outlined materia-progress-icon"
                      style={{
                        color: m.insigniaColor,
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      {m.insigniaIcono}
                    </span>
                    <div className="materia-progress-text">
                      <span className="materia-progress-title">
                        {m.insignia}
                      </span>
                      <span className="materia-progress-sub">{m.progreso}</span>
                    </div>
                  </div>
                  <div className="mini-progress">
                    <div
                      className="mini-progress-fill"
                      style={{
                        width: `${m.porcentaje}%`,
                        background: m.progresoColor,
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  className="play-btn"
                  style={{
                    background: m.colorFondo,
                    color: m.colorTexto,
                    boxShadow: `0 5px 0 ${m.shadowBoton}`,
                  }}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                  {m.botonTexto}
                </button>
              </article>
            ))}
          </section>
        </div>
      </main>

      {/* NAV INFERIOR */}
      <nav className="home-nav">
        <div className="home-nav-content">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${activeTab === t.id ? 'nav-item-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="material-symbols-outlined nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Materias;
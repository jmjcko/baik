export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--primary-blue)',
            }}
          >
            bAIk
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '2px 8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--primary-blue)',
              borderRadius: '4px',
            }}
          >
            Universal AI Cycling Hub
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500 }}>
          <a href="#bike-fitting">Bike Fitting</a>
          <a href="#diagnostics">Servis & Diagnostika</a>
          <a href="#video-tips">Videorady</a>
          <a href="#ai-assistant">AI Asistent</a>
          <a href="#components">Komponenty</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '64px 32px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-1px',
              lineHeight: 1.15,
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            Inteligentní cyklistické centrum poháněné umělou inteligencí
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Optimalizujte svůj posed, diagnostikujte závady krok za krokem a získejte přesná
            doporučení komponent přímo pro vaši geometrii rámu a jízdní styl.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '24px',
          }}
        >
          {/* Card 1: AI Bike Fitting */}
          <article
            id="bike-fitting"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                }}
              >
                Ergonomie & Geometrie
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '8px 0 12px',
                  color: 'var(--text-primary)',
                }}
              >
                AI Bike Fitting
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Analýza tělesných proporcí, nastavení výšky sedla, dosahu řídítek a sklonu kufrů pro
                maximální výkon bez bolesti zad a kolen.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                }}
              >
                Spustit měření [PŘIPRAVENO K IMPLEMENTACI]
              </span>
            </div>
          </article>

          {/* Card 2: Diagnostics & Maintenance */}
          <article
            id="diagnostics"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                }}
              >
                Servisní asistent
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '8px 0 12px',
                  color: 'var(--text-primary)',
                }}
              >
                Diagnostika & Údržba
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Průvodce řešením pazvuků, seřízením řazení a odvzdušněním brzd se strukturovanými
                kontrolními seznamy.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                }}
              >
                Diagnostikovat závadu [PŘIPRAVENO K IMPLEMENTACI]
              </span>
            </div>
          </article>

          {/* Card 3: Video Tips */}
          <article
            id="video-tips"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                }}
              >
                Vizuální postupy
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '8px 0 12px',
                  color: 'var(--text-primary)',
                }}
              >
                Videorady & Manuály
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Ověřené videonávody indexované podle konkrétního modelu kola, řady komponent a typu
                závady.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                }}
              >
                Procházet videonávody [PŘIPRAVENO K IMPLEMENTACI]
              </span>
            </div>
          </article>

          {/* Card 4: AI Cycling Consultant */}
          <article
            id="ai-assistant"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                }}
              >
                Konzultace & Trénink
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '8px 0 12px',
                  color: 'var(--text-primary)',
                }}
              >
                Cyklistický AI Asistent
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Interaktivní dialog o tlaku v pláštích, tréninkových zónách, výživě a řešení
                specifických technických dotazů.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                }}
              >
                Zahájit konverzaci [PŘIPRAVENO K IMPLEMENTACI]
              </span>
            </div>
          </article>

          {/* Card 5: Component Compatibility */}
          <article
            id="components"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                }}
              >
                Napojení na bAIright
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '8px 0 12px',
                  color: 'var(--text-primary)',
                }}
              >
                Výběr komponent & kompatibilita
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Inteligentní ověření kompatibility kazet, řetězů, středových složení a brzdových
                kotoučů pro vaše konkrétní kolo.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                }}
              >
                Ověřit kompatibilitu [PŘIPRAVENO K IMPLEMENTACI]
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          padding: '24px 32px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>bAIk — Universal AI Cycling Intelligence Hub</span>
        <span>Standard: Google Material Design • AIRE SDLC</span>
      </footer>
    </main>
  );
}

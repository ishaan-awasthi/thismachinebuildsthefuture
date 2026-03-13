import { Link } from 'react-router-dom'

export default function ManifestoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0B09', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        background: '#0D0B09', borderBottom: '1px solid #2A2018',
      }}>
        <div style={{ height: '4px', background: '#D42B1E' }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px clamp(1.5rem, 6vw, 5rem)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
            letterSpacing: '0.04em', color: '#F0EBE3', lineHeight: 1,
            textTransform: 'uppercase', margin: 0,
          }}>
            THIS MACHINE BUILDS THE FUTURE
          </h1>
          <Link to="/"
            style={{ color: '#7A7470', textDecoration: 'none', fontSize: '13px', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '24px', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F0EBE3'; e.currentTarget.style.borderBottom = '1px solid #D42B1E' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7A7470'; e.currentTarget.style.borderBottom = 'none' }}
          >&gt;&gt; return home</Link>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{
        flex: 1,
        paddingTop: '110px',
        paddingBottom: '80px',
        paddingLeft: 'clamp(1.5rem, 8vw, 6rem)',
        paddingRight: 'clamp(1.5rem, 8vw, 6rem)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          <div style={{ fontSize: '18px', lineHeight: '1.7', color: '#F0EBE3', fontFamily: 'var(--font-mono)' }}>

            <ChapterHeading>CHAPTER I: THIS MACHINE</ChapterHeading>
            <p style={{ marginBottom: '2.5rem' }}>
              ThisMachineBuildsTheFuture.com (or TMBTF, as we will succinctly refer to it for the purposes of this manifesto) is a collective experiment in AI behavior. The design features a simplified chatbot interface to converse and interact with an LLM. However, before getting access to the bot, every visitor must give their own answer to the same question: "Artificial intelligence is here to stay, and we're already using it to build the present. But how should we use it to build the future? How do you think AI ought to behave?" Their thoughts are then added to a growing public timeline-dataset used by the chatbot to rewrite its own system prompt, yielding an LLM that voices the combined aspirations and motivations of its contributors.
            </p>

            <ChapterHeading>CHAPTER II: THE MYOPIC SCRIBE</ChapterHeading>
            <p style={{ marginBottom: '2.5rem' }}>
              Let's travel back in time, almost six centuries. In 1440, German goldsmith Johannes Gutenberg perfected the movable-type printing press. His unprecedented invention had the potential to revolutionize communication itself — which it eventually did go on to do by inadvertently providing the impetus to the European Printing Revolution — yet Gutenberg himself "lived in the scribe's time" and solely used his new technology to reproduce copies of older manuscripts (Jarvis). In an unfortunately similar fashion, we presently approach AI as an attempt to recreate the intricacies of the human condition. Instead, what if it could be something entirely different, something we have not yet conceived? The specifics of that question are impossible to answer without a shift in our mindset itself in regards to AI, but TMBTF both accelerates and crowdsources that process, since users have to consider (and coauthor) the future of AI rather than just its present. And if one desires access to the agora, they must first make a contribution of their own to its discourse.
            </p>

            <ChapterHeading>CHAPTER III: AN AUTHENTIC ARTIFICIALITY</ChapterHeading>
            <p style={{ marginBottom: '2.5rem' }}>
              A common view held by opponents of generative technologies is that the output of any AI is exactly that: artificial. Yet this does not detract from the authenticity of a medium such as TMBTF, nor from the text it produces. Written language itself is an artificial construct, yet it has become one of the most essential tools for preserving and expanding knowledge across generations (Ong). This perspective offers a more forgiving lens: perhaps its writing is synthetic, but so is all writing. The key, as Ong says, is whether we properly interiorize, and whether we equip AI to serve mankind's potential without replacing it. TMBTF embodies this principle by elevating human influence to the most meaningful part of the design architecture.
            </p>

            <ChapterHeading>CHAPTER IV: SENSE IN NUMBERS</ChapterHeading>
            <p style={{ marginBottom: '2.5rem' }}>
              Yet meaning is not the same as purpose, and just as leading linguistics, ethicists, and engineers warn, generative AI tools lack such "communicative intent" (Bender). Such analysis is irrefutably correct, and we cannot readily fix this — but we can put humans back in control of it. TMBTF still lacks its own internal goals, emotions, or mental states, but it ends up carrying the aggregated intent of its community (which is arguably more interesting than an artificial "personality" anyway). Over time, the bot will become a reflection of thousands of tiny human fingerprints, forming an amalgamated philosophy to drive the AI — a machine shaped not by specific intention, but by plurality and community.
            </p>

            <ChapterHeading>CHAPTER V: BUILDING THE FUTURE</ChapterHeading>
            <p style={{ marginBottom: '2rem' }}>
              Blending inspirations of the past, faculties of the present, and motivations of the future, TMBTF illustrates AI reimagined. Through democratized purpose, axiological legitimacy, and communicative intent, the site's loud assertion holds true; this machine builds the future. But there's a more quiet corollary to that proclamation — it needs your help.
            </p>

          </div>

          {/* Citations */}
          <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '2px solid #D42B1E' }}>
            <div style={{ color: '#7A7470', fontSize: '12px', lineHeight: '1.8', fontFamily: 'var(--font-mono)' }}>
              <p style={{ marginBottom: '10px' }}>
                Bender, Emily, et al. "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?" <em>Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency</em>, 1 Mar. 2021, pp. 610–623.
              </p>
              <p style={{ marginBottom: '10px' }}>
                Jarvis, Jeff. <em>The Gutenberg Parenthesis</em>. Bloomsbury Publishing USA, 1 June 2023.
              </p>
              <p>
                Ong, Walter J. <em>Orality and Literacy: Technologizing of the Word</em>. 1982. Oxon, Routledge, 2012.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function ChapterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.4rem',
        letterSpacing: '0.03em',
        color: '#D42B1E',
        lineHeight: 1,
        margin: '0 0 10px 0',
      }}>
        {children}
      </p>
      <div style={{ height: '2px', background: '#2A2018', width: '100%' }} />
    </div>
  )
}

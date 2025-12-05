import { Link } from 'react-router-dom'

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-base-bg flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-5 md:px-10 z-10 border-b border-border" style={{ backgroundColor: '#0A0A0A' }}>
        <h1 className="text-headline text-2xl md:text-3xl text-base-text">
          THIS MACHINE BUILDS THE FUTURE
        </h1>
        <Link
          to="/"
          className="text-primary-text hover:text-cyan hover:underline transition-all duration-200 text-sm md:text-base"
          style={{ textDecoration: 'none' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '2px solid #00F0FF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = 'none'
          }}
        >
          return home
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 pt-20 px-12 md:px-24 py-16 md:py-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-base-text" style={{ fontSize: '20px', lineHeight: '1.6' }}>
            <p className="mb-6">
              ThisMachineBuildsTheFuture.com (or TMBTF, as we will succinctly refer to it for the purposes of this manifesto) is a collective experiment in AI behavior. The project features a simplified chatbot interface to converse and interact with an LLM. However, before getting access to the bot, every visitor must give their own answer to the same question: "Artificial intelligence is here to stay, and we're already using it to build the present. But how should we use it to build the future? How do you think AI ought to behave?" Their thoughts are then added to a growing public timeline-dataset used to rewrite the chatbot's system prompt, producing an LLM representing the combined aspirations and motivations of its contributors.
            </p>
            
            <p className="mb-6">
              Just as users' personal philosophies are observed in producing the future of TMBTF, the project itself had three main inspirations. The first of these dates back almost six centuries to 1440, when German goldsmith Johannes Gutenberg invented the movable-type printing press. However, despite having the potential to revolutionize communication itself — which it eventually did go on to do by inadvertently providing the impetus to the European Printing Revolution — Gutenberg himself "lived in the scribe's time" and solely used his new technology to reproduce copies of older manuscripts (Jarvis). In similar fashion, we presently treat AI as an attempt to recreate the intricacies of the human condition. Instead, what if it could be something entirely different that we have not yet considered? The specifics of that question are impossible to answer without a shift in our mindset itself in regards to AI; TMBTF accelerates this process by forcing users to consider the future of AI rather than just its present, and if one desires access to the agora, they must first make a contribution of their own.
            </p>
            
            <p className="mb-6">
              A common view held by opponents of generative technologies is that the output of any AI is exactly that: artificial. Yet this does not detract from the authenticity of a medium such as TMBTF, nor from the text it produces. Written language itself is an artificial construct, yet it has become one of the most essential tools for preserving and expanding knowledge across generations (Ong). That perspective helps us see AI differently: perhaps its writing is synthetic, but so is all writing. The key, as Ong says, is whether we properly interiorize, and whether we make it serve human understanding instead of letting it replace it. TMBTF embodies this principle by holding human influence as the most important part of the design architecture.
            </p>
            
            <p className="mb-6">
              Yet meaning is not the same as purpose, and as key linguistics, ethicists, and engineers argue, generative AI tools lack such "communicative intent" (Bender). They are correct, and we cannot readily fix this — but we can put humans back in control of it. TMBTF still lacks its own internal goals, emotions, or mental states, but it ends up carrying the aggregated intent of its community (which is arguably more interesting than an artificial "personality" anyway). Over time, the bot will become a reflection of thousands of tiny human fingerprints, forming an amalgamated philosophy to drive the AI — a machine shaped not by specific intention, but by plurality and community.
            </p>
            
            <p className="mb-6">
              Blending inspirations of the past, faculties of the present, and motivations of the future, TMBTF illustrates AI reimagined. Through democratized purpose, axiological legitimacy, and communicative intent, the site's loud assertion holds true; this machine builds the future. But there's a more quiet corollary to that proclamation — it needs your help.
            </p>
          </div>

          {/* Citations */}
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid #00F0FF' }}>
            <div className="text-secondary-text" style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <p className="mb-3">
                Bender, Emily, et al. "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?" <em>Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency</em>, 1 Mar. 2021, pp. 610–623, https://doi.org/10.1145/3442188.3445922.
              </p>
              <p className="mb-3">
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

interface IntroOverlayProps {
  onBegin: () => void
}

// The opening frame: the thesis of the whole atlas in a few sentences.
export default function IntroOverlay({ onBegin }: IntroOverlayProps) {
  return (
    <div className="intro">
      <div className="intro-card">
        <p className="intro-kicker">ANE ATLAS · THE LAND BETWEEN EMPIRES</p>
        <h1>The Levant, 1200–539 BCE</h1>
        <p className="intro-thesis">
          Israel and Judah were not chosen lands in a vacuum. They were geopolitical speed bumps on
          the world's busiest highway — squeezed between the Nile and Mesopotamia, marched through by
          every empire that wanted to reach the other side.
        </p>
        <p className="intro-voice">
          This map tells two stories at once. <em>The text says</em> — the biblical narrative as the
          scribes wrote it. <em>The ground says</em> — what the archaeology and the inscriptions
          actually show. Drag the year. Watch a tribal storm god's kingdoms shrink, pay tribute,
          and vanish.
        </p>
        <button className="intro-begin" onClick={onBegin}>
          Begin the journey
        </button>
      </div>
    </div>
  )
}

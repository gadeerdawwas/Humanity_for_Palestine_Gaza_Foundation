export function TatreezDivider() {
  return (
    <div className="tatreez-divider" aria-hidden="true">
      <span className="divider-diamond" />
      <span className="divider-line" />
      <span className="divider-diamond red" />
      <span className="divider-line short" />
      <span className="divider-diamond gold" />
    </div>
  );
}

export function StitchedLine() {
  return (
    <svg className="stitched-line" viewBox="0 0 330 30" fill="none" aria-hidden="true">
      <path className="stitched-path" d="M2 15h56l9-9 9 18 9-18 9 9h58l9-9 9 18 9-18 9 9h72" stroke="#146C43" strokeWidth="1.5" />
      <path className="stitched-accent" d="M3 15h55M203 15h58" stroke="#C31F2B" strokeWidth="2" />
      <circle className="stitched-dot" cx="285" cy="15" r="3" fill="#C69A46" />
      <circle className="stitched-dot second" cx="300" cy="15" r="2" fill="#C69A46" />
    </svg>
  );
}

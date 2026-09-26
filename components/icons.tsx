type P = { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const, 'aria-hidden': true });

export const MenuIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 7h18M3 12h18M3 17h18" /></svg>);
export const BagIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 8h14l-1 13H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const CloseIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 5l14 14M19 5L5 19" /></svg>);
export const ArrowIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>);
export const TruckIcon = ({ size }: P) => (<svg {...base(size)}><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>);
export const SunIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const LockIcon = ({ size }: P) => (<svg {...base(size)}><rect x="5" y="11" width="14" height="10" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);

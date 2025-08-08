import { Link, NavLink } from "react-router-dom";

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass">
        <nav className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Hotel Booking Home">
            <span className="text-lg font-semibold tracking-tight">StayVibe</span>
          </Link>
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <NavLink to="/" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/check-in" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"}>
                Digital Check-in
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;

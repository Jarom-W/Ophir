import { Link } from "react-router-dom";

export default function Navbar() {
	return (
		<nav>
			<Link to="/">Home</Link> |{" "}
			<Link to="/finance">Analyze</Link> |{" "}
			<Link to="/apps">Apps</Link> |{" "}
			<Link to="/about">About</Link>
		</nav>
	);
}

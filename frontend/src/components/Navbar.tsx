import { Link } from "react-router-dom";
import "../styles/global.css"

export default function Navbar() {
	return (
		<div className="links-array">
			<div className="primary-links">
		<nav>
			<Link to="/welcome">Home</Link> {" "}
			<Link to="/services">Services</Link> {" "}
			<Link to="/finance">Analyze</Link> {" "}
			<Link to="/apps">Apps</Link> {" "}
			<Link to="/about">About</Link>
		</nav>
			</div>

			<div className="logout-links">
				<nav>
				<Link to="/">Logout</Link>
				</nav>
			</div>
		</div>
		
	);
}

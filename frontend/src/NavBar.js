import React from "react";
import { Container, Navbar, Nav} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function NavBar() {
	return (
		<Navbar expand="lg" bg="light" variant="light">
			<Container>
				<Navbar.Brand href="/">Free Stuff</Navbar.Brand>
				<Nav className="me-auto">                  
					<Nav.Link href="/submit">Submit a Product</Nav.Link>
				</Nav>
                <form class="d-flex">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                </input>
                <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
			</Container>
		</Navbar>
	);
}

export default NavBar;

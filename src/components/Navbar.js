import { Link } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
  background: #101522;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  box-shadow: 0px 2px 10px rgba(0,0,0,0.3);
`;

const Logo = styled.h2`
  color: #00c98d;
`;

const NavLinks = styled.div`
  a {
    color: #f5f5f5;
    margin: 0 10px;
    font-weight: 500;
    transition: 0.3s;

    &:hover {
      color: #00c98d;
    }
  }
`;

export default function Navbar() {
  return (
    <Nav>
      <Logo>CashPilot ✈️</Logo>
      <NavLinks>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transações</Link>
        <Link to="/categories">Categorias</Link>
        <Link to="/fixed">Gastos Fixos</Link>
      </NavLinks>
    </Nav>
  );
}

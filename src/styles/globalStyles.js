import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Poppins", sans-serif;
    background-color: #0b0f19;
    color: #f5f5f5;
  }

  h1, h2, h3 {
    color: #00c98d;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default GlobalStyle;

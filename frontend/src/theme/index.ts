import { createTheme } from "@mui/material/styles";

export const getTheme = (darkMode: boolean) => {
  return createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2", // Professional Blue
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#9c27b0", // Purple
        light: "#ba68c8",
        dark: "#7b1fa2",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f7",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? "0 4px 20px 0 rgba(0,0,0,0.5)"
              : "0 4px 20px 0 rgba(0,0,0,0.05)",
          },
        },
      },
    },
  });
};

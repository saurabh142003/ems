import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 15,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h3" color="text.primary" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          You do not have the permissions required to view this page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;

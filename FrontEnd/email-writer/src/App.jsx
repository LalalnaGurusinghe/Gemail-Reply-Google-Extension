import React, { useState } from "react";
import "./App.css";
import {
  Box,
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";

const App = () => {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false); // New state for Snackbar

  const handleSubmit = async () => {
    if (!emailContent) {
      setError("Please provide email content.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedReply("");

    try {
      const response = await axios.post("http://localhost:8080/api/email/generate", {
        emailContent,
        tone: tone || "Professional",
      });
      setGeneratedReply(typeof response.data === "string" ? response.data : JSON.stringify(response.data));
    } catch (error) {
      setError("Failed to generate reply. Please check if the backend is running.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply).then(() => {
      setOpenSnackbar(true); // Open Snackbar on successful copy
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
      setError("Failed to copy to clipboard.");
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Email Assistant
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            label="Tone (Optional)"
            disabled={loading}
          >
            <MenuItem value="">None (Default: Professional)</MenuItem>
            <MenuItem value="Professional">Professional</MenuItem>
            <MenuItem value="Friendly">Friendly</MenuItem>
            <MenuItem value="Casual">Casual</MenuItem>
            <MenuItem value="Formal">Formal</MenuItem>
            <MenuItem value="Optimistic">Optimistic</MenuItem>
            <MenuItem value="Supportive">Supportive</MenuItem>
            <MenuItem value="Sympathetic">Sympathetic</MenuItem>
            <MenuItem value="Assertive">Assertive</MenuItem>
            <MenuItem value="Respectful">Respectful</MenuItem>
            <MenuItem value="Motivational">Motivational</MenuItem>
            <MenuItem value="Understanding">Understanding</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Box sx={{ mx: 3, mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {generatedReply && (
        <Box sx={{ mx: 3 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Generated Reply
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            label="Generated Reply"
            value={generatedReply}
            disabled
            sx={{
              "& .MuiInputBase-input": {
                fontWeight: "bold",
              },
              mb: 2,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyToClipboard}
            disabled={loading}
            sx={{ mt: 2, mb: 2 }}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          Content copied to clipboard!
        </Alert>
      </Snackbar>

      <Box sx={{ mx: 3, mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          This app is powered by Gemini 2.0 Flash.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Developed by Lalana
        </Typography>
      </Box>
    </Container>
  );
};

export default App;
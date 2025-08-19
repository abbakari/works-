import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Paper,
  Container,
  Fade,
  Slide,
  CircularProgress,
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountCircle
} from '@mui/icons-material';
import { keyframes, styled } from '@mui/material/styles';

// Create yellow theme
const yellowTheme = createTheme({
  palette: {
    primary: {
      main: '#FFD700', // Gold/Yellow
      dark: '#FFA000',
      light: '#FFECB3',
    },
    secondary: {
      main: '#FF6F00', // Orange accent
    },
    background: {
      default: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FF8F00 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#FFD700',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFD700',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
        },
      },
    },
  },
});

// Floating animation keyframes
const floatAnimation = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(2deg);
  }
  66% {
    transform: translateY(-10px) rotate(-1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

// Sliding animation keyframes
const slideAnimation = keyframes`
  0% {
    transform: translateX(-100vw);
  }
  50% {
    transform: translateX(50vw);
  }
  100% {
    transform: translateX(-100vw);
  }
`;

// Styled components
const YellowBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 30%, #FF8F00 70%, #FFB300 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const SuperdollText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '10%',
  fontSize: '4rem',
  fontWeight: 900,
  color: '#FFD700',
  textShadow: '3px 3px 6px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.5)',
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  zIndex: 1,
  fontFamily: 'Arial, sans-serif',
  background: 'linear-gradient(45deg, #FFD700, #FFA000, #FFD700)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
    top: '10%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
    position: 'relative',
    top: 'auto',
    left: 'auto',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const MovingSuperdoll = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: '30%',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#FFD700',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  animation: `${slideAnimation} 15s linear infinite`,
  zIndex: 1,
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 160, 0, 0.05))',
    borderRadius: 20,
    pointerEvents: 'none',
  },
}));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signUp, error, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(yellowTheme.breakpoints.down('sm'));

  // Reset loading states on mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Add timeout protection
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      console.warn('Auth timeout - resetting loading state');
    }, 10000);

    try {
      if (isSignUp) {
        if (signUp) {
          await signUp(email, password, fullName);
          // After successful signup, automatically sign in
          await login(email, password);
        }
      } else {
        await login(email, password);
      }
      clearTimeout(timeoutId);
      navigate('/dashboard');
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset loading state if there's an error
  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  return (
    <ThemeProvider theme={yellowTheme}>
      <CssBaseline />
      <YellowBackground>
        {/* Moving Superdoll Text */}
        <MovingSuperdoll variant="h2">
          ✨ superdoll ✨
        </MovingSuperdoll>
        
        {/* Floating Superdoll Text */}
        <SuperdollText variant="h1">
          superdoll
        </SuperdollText>

        <Container 
          maxWidth="sm" 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Fade in={true} timeout={1000}>
            <GlassCard elevation={0} sx={{ width: '100%', maxWidth: 400 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Slide direction="down" in={true} timeout={800}>
                    <Box>
                      <AccountCircle 
                        sx={{ 
                          fontSize: 80, 
                          color: 'primary.main',
                          mb: 2,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }} 
                      />
                      <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, #FFD700, #FF8F00)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        STMBudget
                      </Typography>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Welcome Back!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sign in to access your dashboard
                      </Typography>
                    </Box>
                  </Slide>
                </Box>

                <Slide direction="up" in={true} timeout={1000}>
                  <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="primary" />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                          },
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      margin="normal"
                      variant="outlined"
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ color: 'primary.main' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                          },
                        }
                      }}
                    />

                    {error && (
                      <Fade in={true}>
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                              fontSize: '0.9rem'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Authentication Error
                          </Typography>
                          {error}
                          {error.includes('HTTP error') && (
                            <Box sx={{ mt: 1, fontSize: '0.8rem' }}>
                              <Typography variant="caption" display="block">
                                • Make sure you have created a Supabase account
                              </Typography>
                              <Typography variant="caption" display="block">
                                • Check your email and password
                              </Typography>
                            </Box>
                          )}
                        </Alert>
                      </Fade>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading || authLoading}
                      sx={{
                        py: 1.5,
                        mb: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #FFD700, #FF8F00)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FFA000, #FF6F00)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 215, 0, 0.5)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isLoading || authLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          Signing in...
                        </Box>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    {(isLoading || authLoading) && (
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => {
                          setIsLoading(false);
                          console.log('Login state reset manually');
                        }}
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          textTransform: 'none',
                        }}
                      >
                        Reset if stuck
                      </Button>
                    )}
                  </Box>
                </Slide>

                <Box sx={{ mt: 3 }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 600, mb: 1 }}>
                      Getting Started
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      • Create an account using Supabase Auth
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      • Each role has different access levels
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      • Contact admin for role assignments
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </GlassCard>
          </Fade>
        </Container>

        {/* Additional floating elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '1.5rem',
            animation: `${floatAnimation} 8s ease-in-out infinite`,
            animationDelay: '2s',
            zIndex: 1,
          }}
        >
          ⭐
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            fontSize: '2rem',
            animation: `${floatAnimation} 10s ease-in-out infinite`,
            animationDelay: '4s',
            zIndex: 1,
          }}
        >
          ✨
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '20%',
            fontSize: '1.2rem',
            animation: `${floatAnimation} 7s ease-in-out infinite`,
            animationDelay: '1s',
            zIndex: 1,
          }}
        >
          💫
        </Box>
      </YellowBackground>
    </ThemeProvider>
  );
};

export default Login;

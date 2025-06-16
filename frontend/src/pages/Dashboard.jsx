import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
  ListItemText,
  Fade,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { jobService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  Applied: 'primary',
  Interview: 'info',
  Offer: 'success',
  Rejected: 'error',
  Accepted: 'success',
};

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, logout, userName } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated, navigate]);

  const fetchJobs = async () => {
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const filteredJobs = selectedTab === 'All'
    ? jobs
    : jobs.filter(job => job.status === selectedTab);

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': {
                color: '#90caf9',
              },
            }}
            onClick={() => navigate('/jobs')}
          >
            Job Tracker
          </Typography>
          <Tooltip title="Profile Menu">
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#90caf9' }}>
                {userName ? userName.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {userName || 'Profile'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate('/jobs')}>
              <ListItemIcon>
                <WorkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Jobs</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1a237e' }}>
          Dashboard
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4,
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 100,
                '&.Mui-selected': {
                  color: '#1a237e',
                  fontWeight: 'bold',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1a237e',
              },
            }}
          >
            <Tab 
              label={`All (${jobs.length})`} 
              value="All" 
            />
            {Object.entries(statusCounts).map(([status, count]) => (
              <Tab
                key={status}
                label={`${status} (${count})`}
                value={status}
              />
            ))}
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ color: '#1a237e' }}>
                      {job.company}
                    </Typography>
                    <Chip
                      label={job.status}
                      color={statusColors[job.status] || 'default'}
                      size="small"
                      sx={{
                        '& .MuiChip-label': {
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {job.position}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Applied: {new Date(job.appliedDate).toLocaleDateString()}
                  </Typography>
                  {job.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {job.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredJobs.length === 0 && (
          <Paper
            sx={{
              p: 4,
              mt: 4,
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <WorkIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No {selectedTab === 'All' ? '' : selectedTab} job applications
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {selectedTab === 'All' 
                ? 'Click the "Add Job" button to start tracking your applications'
                : `No jobs with status "${selectedTab}" found`}
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Dashboard; 
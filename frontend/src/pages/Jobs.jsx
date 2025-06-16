import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  MenuItem,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { jobService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'];

const validationSchema = Yup.object({
  company: Yup.string().required('Company name is required'),
  position: Yup.string().required('Position is required'),
  status: Yup.string().required('Status is required'),
  appliedDate: Yup.date().required('Applied date is required'),
  notes: Yup.string(),
});

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('Failed to fetch jobs. Please try again.');
    }
  };

  const handleOpen = (job) => {
    setEditingJob(job || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingJob(null);
    formik.resetForm();
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardClick = () => {
    handleProfileMenuClose();
    navigate('/dashboard');
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const formik = useFormik({
    initialValues: {
      company: editingJob?.company || '',
      position: editingJob?.position || '',
      status: editingJob?.status || '',
      appliedDate: editingJob?.appliedDate || new Date().toISOString().split('T')[0],
      notes: editingJob?.notes || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingJob?.id) {
          await jobService.updateJob(editingJob.id, values);
          setSuccess('Job updated successfully!');
        } else {
          await jobService.addJob(values);
          setSuccess('Job added successfully!');
        }
        handleClose();
        fetchJobs();
      } catch (error) {
        console.error('Error saving job:', error);
        setError(error.response?.data || 'Failed to save job. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobService.deleteJob(id);
        setSuccess('Job deleted successfully!');
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        setError('Failed to delete job. Please try again.');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': {
                color: '#e8eaf6',
              },
              transition: 'color 0.3s ease',
            }}
            onClick={() => navigate('/jobs')}
          >
            Job Tracker
          </Typography>
          <Tooltip title="Profile Menu" arrow>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#e8eaf6',
                  color: '#1a237e',
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 0.3s ease',
                }}
              >
                {userName ? userName[0].toUpperCase() : <PersonIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => navigate('/dashboard')}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.04)',
                },
                transition: 'background-color 0.3s ease',
              }}
            >
              <ListItemIcon>
                <DashboardIcon fontSize="small" sx={{ color: '#1a237e' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  sx: { color: '#1a237e' }
                }}
              />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogoutClick}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                },
                transition: 'background-color 0.3s ease',
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{
                  sx: { color: '#d32f2f' }
                }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#1a237e' }}>
            Job Applications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#283593',
              },
            }}
          >
            Add Job
          </Button>
        </Box>

        <Grid container spacing={3}>
          {jobs.map((job) => (
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
                  <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                    {job.company}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {job.position}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Status: {job.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Applied: {new Date(job.appliedDate).toLocaleDateString()}
                  </Typography>
                  {job.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {job.notes}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleOpen(job)} 
                        size="small"
                        sx={{
                          color: '#1a237e',
                          '&:hover': {
                            backgroundColor: 'rgba(26, 35, 126, 0.1)',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDelete(job.id)} 
                        size="small" 
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {jobs.length === 0 && (
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
              No job applications yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Click the "Add Job" button to start tracking your applications
            </Typography>
          </Paper>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
            {editingJob ? 'Edit Job Application' : 'Add Job Application'}
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                id="company"
                name="company"
                label="Company"
                value={formik.values.company}
                onChange={formik.handleChange}
                error={formik.touched.company && Boolean(formik.errors.company)}
                helperText={formik.touched.company && formik.errors.company}
                margin="normal"
              />
              <TextField
                fullWidth
                id="position"
                name="position"
                label="Position"
                value={formik.values.position}
                onChange={formik.handleChange}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
                margin="normal"
              />
              <TextField
                fullWidth
                id="status"
                name="status"
                select
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
                margin="normal"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                id="appliedDate"
                name="appliedDate"
                label="Applied Date"
                type="date"
                value={formik.values.appliedDate}
                onChange={formik.handleChange}
                error={formik.touched.appliedDate && Boolean(formik.errors.appliedDate)}
                helperText={formik.touched.appliedDate && formik.errors.appliedDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                margin="normal"
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleClose}
                sx={{
                  color: '#1a237e',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={formik.isSubmitting}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#283593',
                  },
                }}
              >
                {editingJob ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Jobs; 
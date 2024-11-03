import { ReactNode, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  EmojiEvents as PrizeIcon,
  Logout as LogoutIcon,
  CorporateFare as InstitutionIcon,
  Timeline as TimelineIcon,
  PeopleAlt,
} from '@mui/icons-material';
import { IToken } from '../../interfaces/token';

interface IProps {
  children: ReactNode;
  token?: IToken | null;
}

const drawerWidth = 240;

export const LayoutDashboard = ({ children }: IProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Usuários', path: '/usuarios', icon: <PersonIcon /> },
    { text: 'Prêmios', path: '/premios', icon: <PrizeIcon /> },
    { text: 'Instituição', path: '/instituicao', icon: <InstitutionIcon /> },
    { text: 'História', path: '/historia', icon: <TimelineIcon /> },
    { text: 'Parceiros', path: '/parceiros', icon: <PeopleAlt /> },


  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', zIndex: 0 }}>
      <List sx={{ flexGrow: 1,  }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema Gestão - Página Casa da Paz
          </Typography>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/"
            onClick={() => localStorage.clear()}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, zIndex: 0 }}>
        <Box
          component="nav"
          sx={{ 
            width: { md: drawerWidth }, 
            flexShrink: { md: 0 },
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                height: '100%',
              },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                position: 'relative',
                height: '100%',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100%',
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ pl: 3, pr: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
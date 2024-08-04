'use client';

import React, { useState, useEffect } from 'react';
import { query, collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Box, Stack, Typography, Modal, TextField, Button, Paper, Container, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Dashboard icon for navigation
import ListIcon from '@mui/icons-material/List'; // Icon for pantry listing
import { firestore } from '@/firebase'; // Ensure this is the correct path to your firebase setup file
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from '@/firebase';

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const googleProvider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    if (user) {
      updatePantry();
    }
  }, [user]);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = docs.docs.map(doc => ({
      name: doc.data().name,
      quantity: doc.data().quantity,
      id: doc.id
    }));
    setPantry(pantryList);
  };

  const handleAddOrUpdateItem = async () => {
    const docRef = doc(firestore, 'pantry', itemName);
    await setDoc(docRef, { name: itemName, quantity: parseInt(quantity, 10) }, { merge: true });
    updatePantry();
    handleClose();
  };

  const handleRemoveItem = async (id) => {
    await deleteDoc(doc(firestore, 'pantry', id));
    updatePantry();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setQuantity(1);
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginOpen(false); // Close the modal on successful login
      setEmail('');
      setPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setLoginOpen(false);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const loginModal = (
    <Modal open={loginOpen} onClose={() => setLoginOpen(false)}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper', p: 4, border: '2px solid #000', boxShadow: 24,
        display: 'flex', flexDirection: 'column', gap: 2
      }}>
        <Typography variant="h6" color="primary">Login</Typography>
        <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {authError && <Typography color="error">{authError}</Typography>}
        <Button fullWidth variant="contained" onClick={handleLogin}>Login</Button>
      </Box>
    </Modal>
  );

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pantry Manager
          </Typography>
          {!user ? (
            <Button color="inherit" onClick={() => setLoginOpen(true)}>Login</Button>
          ) : (
            <Button color="inherit" onClick={() => auth.signOut()}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <List>
          <ListItem button>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={handleOpen}>
            <ListItemIcon><ListIcon /></ListItemIcon>
            <ListItemText primary="Manage Pantry" />
          </ListItem>
        </List>
      </Drawer>
      {loginModal}
      {!user ? (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Please log in to manage your pantry</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleGoogleSignIn}>Login with Google</Button>
        </Box>
      ) : (
        <React.Fragment>
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Welcome to Pantry Manager</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>Get Started</Button>
          </Box>
          <Modal open={open} onClose={handleClose}>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
              display: 'flex', flexDirection: 'column', gap: 2
            }}>
              <Typography variant="h6" color="primary">Add or Update Item</Typography>
              <TextField fullWidth label="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} />
              <TextField fullWidth label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
              <Button fullWidth variant="contained" onClick={handleAddOrUpdateItem}>Add/Update</Button>
              <Button
  variant="contained"
  onClick={() => fetchRecipes(pantry.map(item => item.name).join(','))}
>
  Get Recipe Suggestions
</Button>
            </Box>



          </Modal>
          <Paper elevation={3} sx={{ my: 4, p: 2 }}>
            {pantry.length > 0 ? pantry.map(item => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
                <Typography>{item.name} - Quantity: {item.quantity}</Typography>
                <Button variant="outlined" color="error" onClick={() => handleRemoveItem(item.id)}>Remove</Button>
              </Box>
            )) : <Typography>No items in pantry.</Typography>}
          </Paper>
        </React.Fragment>
      )}
    </Container>
  );
}

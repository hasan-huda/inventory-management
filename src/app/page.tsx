'use client'

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, AppBar, Toolbar, Paper, Grid, Container } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { firestore } from '@/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

interface InventoryItem {
  name: string;
  quantity: number;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList: InventoryItem[] = []
    docs.forEach((doc) => {
      const data = doc.data() as Omit<InventoryItem, 'name'>; // Exclude 'name' from the type
      inventoryList.push({ name: doc.id, ...data })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item: string) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data() as InventoryItem
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item: string) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data() as InventoryItem
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filteredItems = inventory.filter(item => item.name.toLowerCase().includes(searchTerm));
    setFilteredInventory(filteredItems);
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addItem(itemName)
      setItemName('')
      handleClose()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      bgcolor="#f7f9fc"
      p={2}
    >
      <AppBar position="fixed" sx={{ width: '100vw' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hasan's Pantry Tracker
          </Typography>
          <Button color="inherit" onClick={handleOpen}>
            <AddIcon />
            Add New Item
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* This is a placeholder to keep the content below the AppBar */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Add Item
          </Typography>
          <Stack spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Container>
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Inventory Items
          </Typography>
          <TextField
            id="search"
            label="Search Items"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            sx={{ mb: 3 }}
          />
          <Grid container spacing={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {name.charAt(0).toUpperCase() +
                      name.slice(1)}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                  >
                    Quantity: {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<RemoveIcon />}
                    onClick={() => removeItem(name)}
                    sx={{ mt: 2 }}
                  >
                    Remove
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

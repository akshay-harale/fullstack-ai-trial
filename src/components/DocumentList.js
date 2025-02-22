import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemButton, Paper } from '@mui/material';
import { styled } from '@mui/system';
import config from '../config';

const DocumentItem = styled(ListItemButton)(({ active }) => ({
  borderRadius: 4,
  marginBottom: 4,
  backgroundColor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: active ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

const DocumentList = ({ onDocumentSelect, currentDocumentId, refreshList }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/documents`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          console.error('Failed to fetch documents:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, [refreshList]);

  return (
    <List sx={{ p: 0 }}>
      {documents.map(document => (
        <DocumentItem
          key={document._id}
          active={currentDocumentId === document._id}
          onClick={() => onDocumentSelect(document._id, document.title)}
        >
          <ListItemText 
            primary={document.title}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: currentDocumentId === document._id ? 500 : 400,
                color: currentDocumentId === document._id ? '#1976d2' : 'inherit',
              },
            }}
          />
        </DocumentItem>
      ))}
    </List>
  );
};

export default DocumentList;

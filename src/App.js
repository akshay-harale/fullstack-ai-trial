import React, { useState, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Grid, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import TextEditor from './components/TextEditor';
import DocumentList from './components/DocumentList';
import config from './config';

const MainContainer = styled(Container)`
  padding-top: 80px;
  max-width: 100% !important;
`;

const Sidebar = styled(Box)`
  background-color: #e3f2fd;
  padding: 20px;
  height: calc(100vh - 80px);
  position: fixed;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const EditorContainer = styled(Box)`
  margin-left: 120px;
  margin-right: 300px;
  padding: 20px;
`;

const DocumentListContainer = styled(Box)`
  background-color: #e3f2fd;
  position: fixed;
  right: 0;
  top: 64px;
  width: 300px;
  height: calc(100vh - 64px);
  padding: 20px;
  overflow-y: auto;
`;

const StyledAppBar = styled(AppBar)`
  background-color: #1976d2;
`;

const NavButton = styled(Button)`
  color: white;
  text-transform: none;
  margin: 0 10px;
`;

const App = () => {
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [refreshList, setRefreshList] = useState(false);
  const editorRef = useRef(null);

  const handleDocumentSelect = (documentId, title) => {
    setCurrentDocumentId(documentId);
    setDocumentTitle(title);
  };

 const handleNewDocument = () => {
    setCurrentDocumentId(null);
    setDocumentTitle('');
    if (editorRef.current && editorRef.current.resetEditor) {
      editorRef.current.resetEditor();
    }
  };

  const handleDocumentSave = () => {
    setRefreshList(prev => !prev);
    handleNewDocument();
  };

  const handleDeleteDocument = async () => {
    if (currentDocumentId) {
      try {
        const response = await fetch(`${config.apiUrl}/documents/${currentDocumentId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          console.log('Document deleted successfully!');
          setRefreshList(prev => !prev);
          setCurrentDocumentId(null);
          setDocumentTitle('');
        } else {
          console.error('Failed to delete document:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  return (
    <Box>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Document Editor
          </Typography>
          <NavButton startIcon={<HomeIcon />}>
            Home
          </NavButton>
          <NavButton startIcon={<EditIcon />}>
            Editor
          </NavButton>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      <MainContainer>
        <Sidebar>
          <Button
            variant="contained"
            onClick={handleDocumentSave}
            sx={{ mb: 2, width: '100%' }}
            startIcon={<SaveIcon />}
          >
            New
          </Button>
        </Sidebar>

        <EditorContainer>
          <TextEditor
            documentId={currentDocumentId}
            documentTitle={documentTitle}
            key={currentDocumentId}
            onDocumentSave={handleDocumentSave}
            onTitleChange={setDocumentTitle}
            editorRef={editorRef}
          />
        </EditorContainer>

        <DocumentListContainer>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Documents
          </Typography>
          <DocumentList
            onDocumentSelect={handleDocumentSelect}
            currentDocumentId={currentDocumentId}
            refreshList={refreshList}
          />
        </DocumentListContainer>
      </MainContainer>
    </Box>
  );
};

export default App;

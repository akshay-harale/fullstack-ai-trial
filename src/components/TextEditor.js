import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createEditor, Transforms, Text, Editor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { styled } from '@mui/system';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useImperativeHandle } from 'react';
import config from '../config';

const EditorContainer = styled(Box)`
  border: none;
  border-radius: 4px;
  background: white;
  margin-left: 20px;
`;

const Toolbar = styled(Box)`
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 5px;
  align-items: center;
`;

const StyledButton = styled(Button)`
  && {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    text-transform: none;
    &:hover {
      background: #f0f0f0;
    }
    &.active {
      background: #e6e6e6;
    }
  }
`;

const EditorContent = styled(Box)`
  padding: 20px;
  min-height: 300px;
`;

const SaveButton = styled(StyledButton)`
  && {
    margin-left: auto;
    background: #4CAF50;
    color: white;
    border: none;
    &:hover {
      background: #45a049;
    }
  }
`;

const DeleteButton = styled(StyledButton)`
  && {
    background: #f44336;
    color: white;
    border: none;
    &:hover {
      background: #d32f2f;
    }
  }
`;

const ImageWrapper = styled('div')`
  position: relative;
  display: inline-block;
`;

const ImageResizeHandle = styled('div')`
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
`;

const ImageElement = ({ attributes, children, element, editor }) => {
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(element.width || '100%');

  const handleResizeStart = (e) => {
    e.preventDefault();
    setResizing(true);
  };

  const handleResize = (e) => {
    if (!resizing) return;
    setWidth(e.clientX - e.target.offsetLeft);
  };

  const handleResizeEnd = useCallback(() => {
    setResizing(false);
    Transforms.setNodes(
      editor,
      { width: width },
      { at: [], match: (n) => n.type === 'image' }
    );
  }, [editor, width]);

  useEffect(() => {
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResize, handleResizeEnd, resizing]);

  return (
    <div {...attributes} style={{ margin: '8px 0', position: 'relative' }}>
      <ImageWrapper>
        <div contentEditable={false} style={{ position: 'relative', marginBottom: '8px' }}>
          <img
            src={element.url}
            alt=""
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: '400px',
              margin: '0 auto',
              width: width,
            }}
          />
          <ImageResizeHandle onMouseDown={handleResizeStart}>
            </ImageResizeHandle>
        </div>
        {children}
      </ImageWrapper>
    </div>
  );
};

const TextEditor = ({ documentId, documentTitle, onDocumentSave, onTitleChange, editorRef }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'Start typing here...' }],
    },
  ]);
  const [title, setTitle] = useState(documentTitle || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(editorRef, () => ({
    resetEditor: () => {
      setValue([
        {
          type: 'paragraph',
          children: [{ text: 'Start typing here...' }],
        },
      ]);
    },
    undo: () => editor.undo(),
    redo: () => editor.redo(),
  }));

  useEffect(() => {
    if (documentTitle !== title && onTitleChange) {
      onTitleChange(title);
    }
  }, [title, onTitleChange]);

  useEffect(() => {
    if (!documentId) {
      setValue([
        {
          type: 'paragraph',
          children: [{ text: 'Start typing here...' }],
        },
      ]);
      setTitle('');
      return;
    }

    setLoading(true);
    const fetchDocument = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/documents/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          try {
            const content = JSON.parse(data.content);
            setValue(content);
          } catch (e) {
            console.error("Error parsing document content", e);
          }
        } else {
          console.error('Failed to fetch document:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const generateUniqueTitle = () => {
    const timestamp = new Date().getTime();
    return `New Document ${timestamp}`;
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const url = documentId
        ? `${config.apiUrl}/documents/${documentId}`
        : `${config.apiUrl}/documents`;
      
      const method = documentId ? 'PUT' : 'POST';
      const saveTitle = title || generateUniqueTitle();

      // Update image widths in content before saving
      const updatedValue = value.map(node => {
        if (node.type === 'image' && node.width) {
          return { ...node, width: node.width };
        }
        return node;
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: saveTitle,
          content: JSON.stringify(updatedValue),
        }),
      });

      if (response.ok) {
        console.log(documentId ? 'Document updated successfully!' : 'New document created!');
        if (onDocumentSave) {
          onDocumentSave();
        }
      } else {
        console.error('Failed to save document:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;

    try {
      const response = await fetch(`${config.apiUrl}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Document deleted successfully!');
        if (onDocumentSave) {
          onDocumentSave();
        }
      } else {
        console.error('Failed to delete document:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'image':
        return <ImageElement {...props} editor={editor} />;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, [editor]);

  const renderLeaf = useCallback(props => {
    const { attributes, children, leaf } = props;
    let element = children;

    if (leaf.bold) {
      element = <strong>{element}</strong>;
    }
    if (leaf.italic) {
      element = <em>{element}</em>;
    }
    if (leaf.underline) {
      element = <u>{element}</u>;
    }

    return <span {...attributes}>{element}</span>;
  }, []);

  const toggleFormat = format => {
    const isActive = isFormatActive(format);
    if (editor.selection) {
      Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        {
          at: editor.selection,
          match: Text.isText,
          split: true,
        }
      );
    }
  };

  const isFormatActive = format => {
    const [match] = Editor.nodes(editor, {
      match: n => n[format] === true,
      mode: 'all',
    });
    return !!match;
  };

  const insertImage = useCallback(
    url => {
      try {
        Transforms.insertNodes(editor, {
          type: 'image',
          url,
          children: [{ text: '' }],
        });
        Transforms.insertNodes(editor, {
          type: 'paragraph',
          children: [{ text: '' }],
        });
        Transforms.move(editor);
      } catch (error) {
        console.error('Error inserting image:', error);
      }
    },
    [editor]
  );

  const handleImageUpload = useCallback(
    event => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          insertImage(e.target.result);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
      }
    },
    [insertImage]
  );

  if (loading) {
    return (
      <EditorContainer>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <TextField
        fullWidth
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Document Title"
        variant="outlined"
        margin="normal"
      />
      <Slate 
        editor={editor} 
        initialValue={value}
        onChange={newValue => setValue(newValue)}
      >
        <Toolbar>
          <IconButton
            onMouseDown={e => {
              e.preventDefault();
              toggleFormat('bold');
            }}
            className={isFormatActive('bold') ? 'active' : ''}
          >
            <FormatBoldIcon />
          </IconButton>
          <IconButton
            onMouseDown={e => {
              e.preventDefault();
              toggleFormat('italic');
            }}
            className={isFormatActive('italic') ? 'active' : ''}
          >
            <FormatItalicIcon />
          </IconButton>
          <IconButton
            onMouseDown={e => {
              e.preventDefault();
              toggleFormat('underline');
            }}
            className={isFormatActive('underline') ? 'active' : ''}
          >
            <FormatUnderlinedIcon />
          </IconButton>
          <FormControl sx={{ m: 1, minWidth: 80 }} size="small">
            <InputLabel id="font-family-label">Font</InputLabel>
            <Select
              labelId="font-family-label"
              id="font-family-select"
              value=""
              label="Font"
            >
              <MenuItem value="">
                <em>Arial</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            onClick={() => editor.undo()}
            aria-label="undo"
          >
            <UndoIcon />
          </IconButton>
          <IconButton
            onClick={() => editor.redo()}
            aria-label="redo"
          >
            <RedoIcon />
          </IconButton>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <StyledButton component="span" startIcon={<InsertPhotoIcon />}>Add Image</StyledButton>
          </label>
          <SaveButton onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}>
            {saving ? 'Saving...' : (documentId ? 'Save Changes' : 'Save New')}
          </SaveButton>
          {documentId && (
            <DeleteButton onClick={handleDelete} startIcon={<DeleteIcon />}>Delete</DeleteButton>
          )}
        </Toolbar>
        <EditorContent>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start typing..."
            style={{ minHeight: '150px' }}
          />
        </EditorContent>
      </Slate>
    </EditorContainer>
  );
};

export default TextEditor;

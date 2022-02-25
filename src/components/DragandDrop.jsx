import React, {useMemo, useEffect} from "react";
import {useDropzone} from 'react-dropzone';


const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const focusedStyle = {
    borderColor: '#fcd15a'
  };
  
  const acceptStyle = {
    borderColor: '#fcd15a'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

export default function DragandDrop(props){
    
    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
      } = useDropzone();
    const files = acceptedFiles.map(file => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
      </li>
    ));
    useEffect(() => {
    if(acceptedFiles){
        props.parentCallback(acceptedFiles);
      }
      }, [acceptedFiles]);
      
  
    
      const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
      }), [
        isFocused,
        isDragAccept,
        isDragReject
      ]);
    
  
    return (
      <section className="container">
        <div className="container">
      <div {...getRootProps({style})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop your dataset file here, or click to select a file</p>
      </div>
    </div>
        <aside>
          <h4>File</h4>
          <ul>{files}</ul>
        </aside>
        
      </section>

    );
  }
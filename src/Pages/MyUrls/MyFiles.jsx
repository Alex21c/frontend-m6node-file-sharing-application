import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../../Components/NavBar/Navbar";
import { ContextFileSharingApp } from "../../Components/Context/ContextFileSharingApp";
import SuccessAndErrorMsg, {showError, hideError, showSuccess} from "../../Components/Notifications/SuccessAndErrorMsg";
import SimpleSnackbar, {useSetInitialStateSnackbar, openTheSnackBar} from "../../Components/MUI/SimpleSnackBar";
import userEvent from "@testing-library/user-event";

export default function MyFiles(){
  let {stateContextFileSharingApp, stateSuccessAndErrorMsg, updateStateSuccessAndErrorMsg, apiEndPointUrls} = useContext(ContextFileSharingApp);
  const [open, setOpen] = useSetInitialStateSnackbar();
  let [stateFilesUploadedByUser, setStateFilesUploadedByUser] = useState(null);
  const refADownloadFile = useRef(null);

  const [snackbarState, setSnackbarState] = useState({
    msg: "File Shareable URL, Successfully Copied inside yours device clipboard!",
    successOrError: "success"
  });
  // useEffect(()=>{console.log(snackbarState)}, [snackbarState]);

  // useEffect(()=>{
  //   console.log(stateFilesUploadedByUser);
  // }, [stateFilesUploadedByUser]);

  useEffect(()=>{
    document.title="My Files";
    hideError(updateStateSuccessAndErrorMsg);

    // Make a api call to get all the urls
    getAllTheFilesUploadedByCurrentUser();
  }, []);

  function utilFormatTimestamp(timestamp) {
    // Create a new Date object with the provided timestamp
    const date = new Date(timestamp);

    // Array of weekday names
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Array of month names
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get the weekday, day, month, year, hours, and minutes
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Pad minutes with leading zero if necessary
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    // Format the final date string
    const formattedDate = `${weekday}, ${day} ${month} ${year}, ${hours}:${minutesStr}${ampm}`;

    return formattedDate;
}


  async function getAllTheFilesUploadedByCurrentUser(){
    // send request to the server
    try {      
      // i need to make send request to backend to authenticate
        const headers = {
          "auth-token": stateContextFileSharingApp['auth-token']
        };
        
        const requestOptions = {          
          headers: headers
        };
 

        let response = await fetch(apiEndPointUrls.file['get-all-the-files-uploaded-by-current-user'], requestOptions);
        response = await response.json();  
        // console.log(response);     
        
        if(!response){
          showError(updateStateSuccessAndErrorMsg, 'Unable to Fetch files list from Server !');
          return;
        }
      // if sucess: false
        if(!response.success){          
          showSuccess(updateStateSuccessAndErrorMsg, response.message);
          return;
        }
      // here is the shortedURL
        hideError(updateStateSuccessAndErrorMsg); // if any
      // show it user and allow copying
      // console.log(response.data)
      
      setStateFilesUploadedByUser(response.data);
      
    } catch (error) {      
      console.log(error.message);
      showError(updateStateSuccessAndErrorMsg, 'Unable to List files, please try again after some time!');
    }


  }
  async function handleDeleteURLRequest(fileUniqueID){    
    // console.log(fileUniqueID);
    // return ;
    // send request to the server
    try {      
      // i need to make send request to backend to authenticate
        const headers = {
          "Content-Type": "application/json",
          "auth-token": stateContextFileSharingApp['auth-token']
        };
        
        const requestOptions = {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            fileUniqueID
          })
        };
 

        let response = await fetch(apiEndPointUrls.file['delete-file'], requestOptions);

        if(!response){
          // showError(updateStateSuccessAndErrorMsg, 'Unable to Delete Record!');
          setSnackbarState({
            msg: "Unable to Delete File!",
            successOrError : "error"
          });
          
          openTheSnackBar(setOpen);
          return;
        }
        response = await response.json();      

      // if sucess: false
        if(!response.success){                    
          setSnackbarState({
            msg: response.message,
            successOrError : "error"
          });
          
          openTheSnackBar(setOpen);
          return;
        }
      // here is the shortedURL
        hideError(updateStateSuccessAndErrorMsg); // if any

      // Notify user successfully deleted 
          setSnackbarState({
            msg: "File Deleted Successfully!",
            successOrError : "success"
          });
          
          openTheSnackBar(setOpen);     
          
      // now refetch the records
      setStateFilesUploadedByUser(null); 
      getAllTheFilesUploadedByCurrentUser();
      
    } catch (error) {      
      console.log(error.message);
      setSnackbarState({
        msg: "Failed to Delete the File!",
        successOrError : "error"
      });
      
      openTheSnackBar(setOpen);
    }


  }

  async function copyTextToClipboard(shareableLink){
    // shareableLink = shareableLink.replace('HOSTNAME', apiEndPointUrls.hostname);
    
    await navigator.clipboard.writeText(shareableLink); 
    setSnackbarState({
      msg: "File Shareable URL, Successfully Copied inside yours device clipboard!",
      successOrError: "success"
    });

    openTheSnackBar(setOpen);
  }

  function handleDownloadFileReq(shareableLink){
    // console.log(shareableLink);
    // return;
    refADownloadFile.current.href=shareableLink;    
    refADownloadFile.current.click();    

  }

  return (
    <div className="pageWrapper mt-[2rem] pt-[1rem] p-[2rem] max-w-[120rem]  m-auto rounded-md  text-[1.2rem] text-stone-200 flex flex-col gap-[2rem] items-center">
      {
        snackbarState && <SimpleSnackbar open={open} setOpen={setOpen} snackbarState={snackbarState}/>
      }
      

      <Navbar/>
      {
        stateContextFileSharingApp?.['auth-token'] ? 
         (
          <>
              <h2 className='text-[1.8rem] flex flex-col gap-[.2rem] items-center' >
                <i className="fa-solid fa-file text-[2.5rem] hover:text-yellow-300 transition"></i>
                <span className="font-medium">File Sharing App</span>                
              </h2>
              <SuccessAndErrorMsg  stateSuccessAndErrorMsg={stateSuccessAndErrorMsg}/> 

              {
                stateFilesUploadedByUser &&       
                stateFilesUploadedByUser.map(document=>{
                  return (
                  <div key={document.fileUniqueID} className="flex gap-[1rem] p-[1rem] rounded-md shadow-md bg-slate-700 shadow-green-300" >
                    <dl className="w-[30rem] flex flex-col gap-[.5rem]">
                      <div className="flex gap-[.8rem]">
                          <dt className="font-medium text-stone-400">Traffic</dt>
                          <dd>{document.traffic}</dd>
                      </div>
                      <div className="flex gap-[.8rem]">
                        <dt className="font-medium text-stone-400">File Name</dt>
                        <dd className="italic">
                          {document.fileName}    
                        </dd>
                      </div>
                      <div className="flex gap-[.8rem]">
                          <dt className="font-medium text-stone-400">Uploaded On</dt>
                          <dd>{utilFormatTimestamp(document.createdAt)}</dd>
                      </div>                      

                      

                    </dl>
                    <div className="flex gap-[.8rem] flex-col max-w-[15rem] ">
                    <button   
                        onClick={(event)=>{              
                          // console.log('download btn clicked !');            
                          handleDownloadFileReq(document.fileTrackableShareableLink)
                        }} 
                        className="select-none flex gap-[.5rem] items-center justify-center outline outline-2 outline-amber-50  hover:bg-emerald-300 transition cursor-pointer  rounded-full px-[.5rem] py-[.2rem]  hover:text-slate-900 text-slate-50    text-[1.5rem]  bg-emerald-500 ">        
                        <i title="Download File" className="cursor-pointer fa-sharp fa-solid fa-file "></i>
                        <span className="text-[1.3rem]">Download</span>                       
                      </button>
                      <a href="#" ref={refADownloadFile} className="displayNone">hi there</a>

                      <button   
                        onClick={()=>{
                          copyTextToClipboard(document.fileTrackableShareableLink, apiEndPointUrls)
                        }} 
                        className="select-none  items-center justify-center outline outline-2 outline-amber-50  hover:bg-emerald-300 transition cursor-pointer  rounded-full px-[.5rem] py-[.2rem]  hover:text-slate-900 text-slate-50    text-[1.5rem]  bg-emerald-500  flex gap-[.5rem] ">        
                        <i title="Copy Shareable Link" className="cursor-pointer fa-sharp fa-solid fa-link "></i>
                        <span className="text-[1.3rem]">Share</span>
                      </button>

                      <button 
                        title="DELETE Permanently!"
                        onClick={
                        (event)=>{
                          // console.log(event.target);
                          handleDeleteURLRequest(event.target.getAttribute('file-unique-id'));
                        }
                        } 
                        file-unique-id={document.fileUniqueID} className="outline outline-2 outline-amber-50 bg-red-500 hover:bg-red-300 transition cursor-pointer  rounded-full  px-[5rem] py-[.2rem]   hover:text-slate-900 text-slate-50 text-[1.5rem] flex gap-[.5rem] items-center">
                        <i className="fa-solid fa-trash" file-unique-id={document.fileUniqueID} ></i>
                        <span className="text-[1.3rem]" file-unique-id={document.fileUniqueID}>Delete</span>
                      </button>
                      

                    </div>       
                  </div>             
                  )
                })       
    
              }

            



        </>

        ) : (
          <div className="flex flex-col gap-[.5rem]"> 
            <h2 className='text-[1.8rem]'>You are not logged in !</h2>
          </div>

        )
      } 
    </div>
    
  );
}
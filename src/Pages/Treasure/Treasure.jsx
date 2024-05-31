import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../../Components/NavBar/Navbar";
import { ContextFileSharingApp } from "../../Components/Context/ContextFileSharingApp";
import SuccessAndErrorMsg, {showError, hideError} from "../../Components/Notifications/SuccessAndErrorMsg";
import SimpleSnackbar, {useSetInitialStateSnackbar, openTheSnackBar} from "../../Components/MUI/SimpleSnackBar";
import CircularProgressInfinite from "../../Components/MUI/CircularProgressInfinite";
export default function Treasure(){

  let {stateContextFileSharingApp, stateSuccessAndErrorMsg, updateStateSuccessAndErrorMsg, apiEndPointUrls} = useContext(ContextFileSharingApp);
  const [open, setOpen] = useSetInitialStateSnackbar();
  const [snackbarState, setSnackbarState] = useState({
    msg: "File URL Successfully Copied inside yours device clipboard!",
    successOrError: "success"
  });

  const [stateUploading, setStateUploading] = useState(false);

  let [stateUploadedFileShareableURL, updateStateUploadedFileShareableURL] = useState(null);

  useEffect(()=>{
    document.title="Home : File Sharing App";
    hideError(updateStateSuccessAndErrorMsg);
  }, []);

  let refFile = useRef(null);
  
  async function dummyUpload(delay=5000){
    return new Promise((resolve, rejected)=>{
        setTimeout(()=>{
          resolve();
        },delay);
      });
    
  }

  async function uploadFile(file){

      
      // await dummyUpload();      



    // return;
    // console.log(file);
    // return;
    // send request to the server
    try {      
      // upload begin
          setStateUploading(true);

      // i need to make send request to backend to authenticate
        const formData = new FormData();
        formData.append('fileName', file);
      // console.log(formData);
      // console.log(fileName)
      //   return;
        const headers = {          
          "auth-token": stateContextFileSharingApp['auth-token']
        };
        
        const requestOptions = {
          method: "POST",
          headers: headers,
          body: formData
        };
 

        let response = await fetch(apiEndPointUrls.file['upload-file'], requestOptions);
        if(!response){
          showError(updateStateSuccessAndErrorMsg, 'Unable to upload file!');
          return;
        }
        response = await response.json();        
      // if sucess: false
        if(!response.success){          
          showError(updateStateSuccessAndErrorMsg, response.message);
          return;
        }
      // here is the shortedURL
        hideError(updateStateSuccessAndErrorMsg); // if any
      // show it user and allow copying
        updateStateUploadedFileShareableURL(response.shareableLink);
      
    } catch (error) {      
      console.log(error.message);
      showError(updateStateSuccessAndErrorMsg, 'Failed to Sign In');
    } finally{
      // upload completed
        setStateUploading(false);
    }

  }


  function handleRequestUploadFile(event){
    event.preventDefault();    

// console.log(refFile);

    // return;

    // Safeguard
      if(refFile.current.value === ""){
        return;
      }
      // console.log(refFile.current.files[0]);
      uploadFile(refFile.current.files[0]);
    
  } 

  async function copyTextToClipboard(){

    await navigator.clipboard.writeText(stateUploadedFileShareableURL); 
    openTheSnackBar(setOpen);
  }

  return (
    <div className="pageWrapper mt-[2rem] pt-[1rem] p-[2rem] max-w-[120rem]  m-auto rounded-md  text-[1.2rem] text-stone-200 flex flex-col gap-[2rem] items-center">
      <SimpleSnackbar open={open} setOpen={setOpen} snackbarState={snackbarState}/>
      <Navbar/>
      <h2 className='text-[1.8rem] flex flex-col gap-[.2rem] items-center mt-[-2rem]' >
          <i className="fa-solid fa-file text-[2.5rem] hover:text-yellow-300 transition"></i>
          <span className="font-medium">File Sharing App</span>                
      </h2>

      {
        
        stateContextFileSharingApp?.['auth-token'] ? 
         (
          <>


             
              {
                stateUploadedFileShareableURL ?
                <div className="flex  flex-col gap-[.5rem] w-[30rem]">
                  <div className="flex gap-[.5rem]">
                    <textarea readOnly value={stateUploadedFileShareableURL} type="text" placeholder="ShortedURL" className=" text-stone-700 transition focus:outline focus:outline-2 focus:outline-green-500 p-[1rem] pr-[3rem] rounded-md bg-stone-300 relative w-[100%] h-[6rem]" name='shortedURL'>                      
                    </textarea>
                    <button onClick={copyTextToClipboard} className="select-none wrapperGeneratePassword flex gap-[1rem] items-center justify-center outline outline-2 outline-amber-50  hover:bg-yellow-400 transition cursor-pointer px-[1rem] py-[.5rem] rounded-md hover:text-white text-slate-900    text-[2rem]  bg-yellow-300 ">        
                    <i title="Copy URL" className="cursor-pointer fa-sharp fa-solid fa-copy "></i>
                    </button>
                  </div>

                  <button onClick={()=>updateStateUploadedFileShareableURL(null)} className="outline-amber-50 bg-yellow-300 hover:bg-yellow-500 transition cursor-pointer px-[1.3rem] py-[.3rem] rounded-md hover:text-slate-50 text-stone-700 text-[1.5rem] flex gap-[.5rem] items-center justify-center">
                        <i className="fa-solid fa-file  text-[2rem]"></i>
                        <span className="text-[1.5rem] font-medium">Upload Another File</span>
                      </button>
                  
                </div>
                :
                <form className="flex flex-col gap-[.5rem] w-[30rem] mt-[-.5rem] " method="post" >
                  
                  <input ref={refFile} className="mb-[.5rem] text-sm  border border-gray-300 rounded-lg cursor-pointer  dark:text-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-[.5rem]" id="fileName" type="file"/>
                  <SuccessAndErrorMsg  stateSuccessAndErrorMsg={stateSuccessAndErrorMsg}/> 
                  {
                    stateUploading ? 
                    <CircularProgressInfinite/>
                    :
                    <button onClick={handleRequestUploadFile} className="outline-amber-50 bg-yellow-300 hover:bg-yellow-500 transition cursor-pointer px-[1.3rem] py-[.3rem] rounded-md hover:text-slate-50 text-stone-700 text-[1.5rem] flex gap-[.5rem] items-center justify-center">
                          <i className="fa-solid fa-file  text-[2rem]"></i>
                          <span className="text-[1.5rem] font-medium">Upload File</span>
                        </button>
                  }
               </form>     

              }
              
              

            



</>

        ) : (
          <div className="flex flex-col gap-[.5rem]"> 
            <h2 className='text-[1.7rem] italic '>You're not logged in !</h2>
          </div>

        )
      } 
    </div>
    
  );
}
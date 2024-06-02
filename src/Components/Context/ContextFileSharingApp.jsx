
import { createContext, useEffect, useState } from "react";
export const ContextFileSharingApp = createContext(null);



async function performHandshakeWithServer(apiEndPointUrls, setStateContextFileSharingApp){
  try {
    console.log('performing handshake with server');
    // throw new Error('testing')
      
    const requestOptions = {
      method: "GET"
    };    
    let response = await fetch(apiEndPointUrls.user['handshake'], requestOptions);
    if(!response){       
      throw new Error("Unable to to process current request!");
    }
    response = await response.json();        
    // console.log(response);
    // save it into state   
      const handshakeInfo= {
        success: response.success,
        timestamp: new Date()
      };

    // console.log(handshakeInfo);
    setStateContextFileSharingApp(previousState=>{
      return {
        ...previousState,
        handshakeInfo: handshakeInfo 
      }
    })


  } catch (error) {    
    console.log("ERROR: " + error.message);
    console.log('unable to perform handshake with the server!');
  }
}

function isTimeStamp10MinutesOlder(previousTimeStamp){
  // console.log(previousTimeStamp);
  previousTimeStamp = new Date(previousTimeStamp)
  let currentTimestamp = new Date();
  let tenMinues = 10*60*1000;
  // let tenMinues = 1000;
  let difference = currentTimestamp- previousTimeStamp;
  // console.log(difference)
  if(difference > tenMinues){
    return true;
  }else{
    return false;
  }

}

const ContextProviderFileSharingApp = ({children}) =>{
  let apiEndPointUrlsLocalhost = {
    hostname: "http://localhost:4000",
    user : {
      'sign-up': "http://localhost:4000/api/v1/user/sign-up",
      'sign-in': "http://localhost:4000/api/v1/user/sign-in",
      'validate-auth-token': "http://localhost:4000/api/v1/user/validate-auth-token",
      'handshake': "http://localhost:4000/api/v1/user/handshake/hello",
    },
    file: {      
      'upload-file': "http://localhost:4000/api/v1/file/upload-file",
      'delete-file': "http://localhost:4000/api/v1/file/delete-file",
      'download-file': "http://localhost:4000/api/v1/file/download-file/xy2scs5qufwtkd8pxbfo",
      'get-all-the-files-uploaded-by-current-user': "http://localhost:4000/api/v1/file/get-all-the-files-uploaded-by-current-user"
    }
  };

  let apiEndPointUrls = {
    hostname: "https://m6node-file-sharing-application.onrender.com",
    user : {
      'sign-up': "https://m6node-file-sharing-application.onrender.com/api/v1/user/sign-up",
      'sign-in': "https://m6node-file-sharing-application.onrender.com/api/v1/user/sign-in",
      'validate-auth-token': "https://m6node-file-sharing-application.onrender.com/api/v1/user/validate-auth-token",
      'handshake': "https://m6node-file-sharing-application.onrender.com/api/v1/user/handshake/hello",
    },
    file: {      
      'upload-file': "https://m6node-file-sharing-application.onrender.com/api/v1/file/upload-file",
      'delete-file': "https://m6node-file-sharing-application.onrender.com/api/v1/file/delete-file",
      'download-file': "https://m6node-file-sharing-application.onrender.com/api/v1/file/download-file/xy2scs5qufwtkd8pxbfo",
      'get-all-the-files-uploaded-by-current-user': "https://m6node-file-sharing-application.onrender.com/api/v1/file/get-all-the-files-uploaded-by-current-user"
    }
  };

  // testing
  apiEndPointUrls = apiEndPointUrlsLocalhost;

  let initialAppState = localStorage.getItem('Alex21CFileSharingApp');
  if(initialAppState){
    initialAppState = JSON.parse(initialAppState);
  }else{
    initialAppState = {
      handshakeInfo: {
        success: false,
        timestamp: new Date()
      }
    };
  }
  let [stateContextFileSharingApp, setStateContextFileSharingApp] = useState(initialAppState);
  let [stateWhoIsCurrentPage, updateStateWhoIsCurrentPage] = useState(null);
  let [stateUserAuthMetaData, updateStateUserAuthMetaData] = useState(null);
  let [stateSuccessAndErrorMsg, updateStateSuccessAndErrorMsg] = useState({
    style: {
      Success: "text-green-300 text-[1.5rem]",
      Error: "text-red-300 text-[1.5rem]"
    },
    msgType: "Success",
    msg: "",
    displayNone: 'displayNone'        
  
  });

  
  useEffect(()=>{
    // first check the local strogage about when was the last handshake performed
    // if more than 10 minutes have been passed then re perform handshake
      
      const makeAsyncCall = async ()=>{        
        await performHandshakeWithServer(apiEndPointUrls, setStateContextFileSharingApp);
      };
    
      let doIneedToPerformHandshake = false;
      if(stateContextFileSharingApp?.handshakeInfo){        
        // is it fresh or 10 minutes have been passed
          if(isTimeStamp10MinutesOlder(stateContextFileSharingApp?.handshakeInfo?.timestamp)){
            doIneedToPerformHandshake=true;
          }
        // just check, Is last time there was failure response in handshake?
          else if(stateContextFileSharingApp.handshakeInfo.success === false){
            doIneedToPerformHandshake=true;
          }
          
      }
  
      if(doIneedToPerformHandshake){
        makeAsyncCall();
      }
      
      

  }, []);

  
    useEffect(()=>{
      localStorage.setItem('Alex21CFileSharingApp', JSON.stringify(stateContextFileSharingApp));
     
        
    }, [stateContextFileSharingApp, apiEndPointUrls]);

 
  const contextValue = {
    stateWhoIsCurrentPage, updateStateWhoIsCurrentPage,
    stateUserAuthMetaData, updateStateUserAuthMetaData,
    stateSuccessAndErrorMsg, updateStateSuccessAndErrorMsg,
    stateContextFileSharingApp, setStateContextFileSharingApp,
    apiEndPointUrls
  };
 
  return (
    <ContextFileSharingApp.Provider value={contextValue}>
      {children}
    </ContextFileSharingApp.Provider>
  );
}

export default ContextProviderFileSharingApp;
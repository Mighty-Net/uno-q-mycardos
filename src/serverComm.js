// 'use strict';

export default class serverComm {
  constructor(url,method,request) {
    this.url = url;
    this.method = method;
    request = JSON.parse(request)
    request.timeOffset = g_timeoffset;  
    this.request = JSON.stringify(request);
    this.data = request;
  }
  fetch=(auth,apikey,onChunk,activeController)=>{
    return new Promise(resolve => {
      const controller = !activeController?new AbortController():activeController;
      let timeout = g_serverTimeout; //timeout in ms
      let httpcode = 999;
      let isTimeOut = false;
      const timeoutTimer = setTimeout(() => {controller.abort();isTimeOut=true;},timeout);
      let headers = {
        "Accept": 'application/json',
        'Content-Type':'application/json'
      };
      if(auth){
        headers['Authorization'] = "Bearer "+auth;
      }
      if(apikey){
        headers['apikey'] = apikey;
      }
      if(this.method.search(/get/i)==-1){
        // console.log(this.url)
        fetch(this.url,{
          method: this.method.toUpperCase(),
          headers: headers,
          body:this.request,
          signal:controller.signal
        }).then(async(response) => {
          clearTimeout(timeoutTimer);
          httpcode = response.status;
          // console.log(response,httpcode)
          if(!onChunk)return response.json();

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          const parseStreamLine = (line) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            try {
              const obj = JSON.parse(trimmed);
              // console.log(obj)
              onChunk(obj); // 逐段 callback
            } catch (e) {
              console.warn(e);
            }
          };
          while (true) {
            const { value, done } =  await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let idx;
            // console.log(buffer)
            while ((idx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              parseStreamLine(line);
            }
          }
          buffer += decoder.decode();
          parseStreamLine(buffer);
          return {status:0,msg:"StreamDone"};
        }).then((json) => {
          // console.log(json)
          if(httpcode==200){
            resolve(json);
          }
          else{
            resolve({status:httpcode,msg:"ServerFault"});
          }
        }).catch((error) => {
          clearTimeout(timeoutTimer);
          // console.log(error,this.url)
          if(error.name=="AbortError"){
            if(isTimeOut)resolve({status:999,msg:"Abort"});
            else{resolve({status:0,msg:"Abort"})}
          }
          else{
            resolve({status:-999,msg:error.message});
          }
          resolve(error);
        });
      }
      else{
        const queryString = Object.keys(this.data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.data[key])}`).join('&');
        if(queryString)this.url = this.url+"?"+queryString;
        fetch(this.url,{
          signal:controller.signal,
          headers: headers}).then((response) => {
            httpcode = response.status;
            return response.json();
        })
        .then((json) => {
          clearTimeout(timeoutTimer);
          resolve({status:httpcode,payload:json});
        })
        .catch((error) => {
          clearTimeout(timeoutTimer);
          // console.log(error)
          if(error.name=="AbortError"){
            resolve({status:999});
          }
          else{
            resolve({status:-999,msg:error.message});
          }
          resolve(error);
        });
      }  
    });
  }
  formDataFetch=(auth,apikey,files,activeController)=>{
    return new Promise(resolve => {
      const controller = !activeController?new AbortController():activeController;
      let timeout = g_serverTimeout; //timeout in ms
      let httpcode = 999;
      const formData = new FormData();
      Object.keys(this.data).forEach(key => {
        formData.append(key,this.data[key]);
      });
      if(files.length>0){
        files.forEach(file => {
          // console.log(file)
          const fid = file.fid??null;
          const uploadFile = file.fileInfo??file;
          if(fid)
            formData.append(`files[${fid}]`,uploadFile);
          else
            formData.append(`files[]`,uploadFile);
        });
      }
      // console.log(formData)
      // resolve({status:200,msg:formData});return false;

      const timeoutTimer = setTimeout(() => {controller.abort();},timeout);
      let headers = {
        "Accept": 'application/json'
      };
      if(auth){
        headers['Authorization'] = "Bearer "+auth;
      }
      if(apikey){
        headers['apikey'] = apikey;
      }
      fetch(this.url,{
        method:"POST",
        headers: headers,
        body:formData,
        signal:controller.signal
      }).then((response) => {
        clearTimeout(timeoutTimer);
        httpcode = response.status;
          return response.json()
      }).then((json) => {
        if(httpcode==200)resolve(json);
        else{
          resolve({status:httpcode,msg:"ServerFault"});
        }
      }).catch((error) => {
        clearTimeout(timeoutTimer);
        // console.log(error)
        if(error.name=="AbortError"){
          resolve({status:999,msg:"Abort"});
        }
        else{
          resolve({status:-999,msg:error.message});
        }
        resolve(error);
      });
    });
  }
}

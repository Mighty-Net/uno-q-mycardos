'use strict';
import serverComm from "@/serverComm";

export async function uoloadResolveVcard(data,files,controller)
{
  const NetWorking = new serverComm(`${import.meta.env.VITE_AIAPIURL}/uploadResolveVcard`,"POST",JSON.stringify(data));
  const response = await NetWorking.formDataFetch(null,import.meta.env.VITE_AIAPIKEY,files,controller);
  // console.log(response)
  if(response.status!=0)g_serverCommError = true;
  return response;
}
export async function saveVcard(data,controller)
{
  const NetWorking = new serverComm(`${import.meta.env.VITE_AIAPIURL}/saveVcard`,"POST",JSON.stringify(data));
  const response = await NetWorking.fetch(null,import.meta.env.VITE_AIAPIKEY,null,controller);
  // console.log(response)
  // ResponseErrorCheck(response);
  if(response.status!=0)g_serverCommError = true;
  return response;
}
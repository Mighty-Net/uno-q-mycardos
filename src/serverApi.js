'use strict';
import serverComm from "@/serverComm";

export async function uoloadResolveVcard(data,files,controller)
{
  const NetWorking = new serverComm(`${import.meta.env.VITE_AIAPIURL}/uploadResolveVcard`,"POST",JSON.stringify(data));
  const response = await NetWorking.formDataFetch(null,import.meta.env.VITE_AIAPIKEY,files,controller);
  // console.log(response)
  // ResponseErrorCheck(response);
  return response;
}
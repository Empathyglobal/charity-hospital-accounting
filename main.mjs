// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
import {mountPharmacy} from './src/pharmacy.mjs';
let dirty=false;
mountPharmacy({root:document.querySelector('#app'),setDirty:value=>{dirty=value;}});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});

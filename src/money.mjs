// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
// Explicit decimal scales support local currency policies without floating-point rounding.
function scale(decimals){if(!Number.isInteger(decimals)||decimals<0||decimals>6)throw Error('Choose 0–6 decimal places');return 10n**BigInt(decimals);}
export function parseMoney(value,decimals=2){
 const unit=scale(decimals),s=String(value);
 if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Use a nonnegative plain decimal amount');
 const [whole,fraction='']=s.split('.');if(fraction.length>decimals)throw Error('Too many decimal places');
 return BigInt(whole)*unit+BigInt(fraction.padEnd(decimals,'0')||'0');
}
export function formatMoney(minor,decimals=2){
 const unit=scale(decimals);if(typeof minor!=='bigint')throw Error('Use BigInt minor units');
 const sign=minor<0n?'-':'',n=minor<0n?-minor:minor;
 return sign+(n/unit).toString()+(decimals?'.'+(n%unit).toString().padStart(decimals,'0'):'');
}
export function reconcileCash(expected,counted){
 if(typeof expected!=='bigint'||typeof counted!=='bigint'||expected<0n||counted<0n)throw Error('Use nonnegative BigInt minor units');
 return {expected,counted,difference:counted-expected};
}

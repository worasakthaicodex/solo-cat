import {t as trUI,locale} from './i18n'
import houseIcon from './assets/house-icon-v3.webp'
import React from 'react'
import stickers from './assets/kao-stickers-v2.webp'
import rest from './assets/kao-rest-v2.webp'
import profile from './assets/kao-profile-v2.webp'
import peekReference from './assets/planner-peek-reference.webp'
import cheerReference from './assets/cheer-reference.webp'

const cells = { sit: [0,0], cheer: [1,0], work: [2,0], travel: [0,1], relax: [1,1], tired: [2,1], success: [0,2], hope: [1,2], peek: [2,2] }
export function CatSticker({ pose='sit', className='', label='' }) {
 if(pose==='peek')return <img className={`kao-sticker reference-sticker ${className}`} src={peekReference} alt={trUI(label)}/>
 if(pose==='cheer')return <img className={`kao-sticker reference-sticker ${className}`} src={cheerReference} alt={trUI(label)}/>
 const [x,y]=cells[pose]||cells.sit
 return <svg className={`kao-sticker ${className}`} viewBox={`${x*418+24} ${y*418+24} 370 370`} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true}><image href={stickers} width="1254" height="1254"/></svg>
}
export function RestCat({className=''}) {return <svg className={`kao-rest-art ${className}`} viewBox="245 300 1050 510" role="img" aria-label={trUI("แมวเก๋านอนเหยียดอุ้งเท้า ใส่แว่นกันแดด")}><image href={rest} width="1536" height="1024"/></svg>}
export function ProfileCat(){return <img src={profile} className="kao-profile-cat" alt={trUI("แมวเก๋าใส่แว่นกันแดด เอาอุ้งเท้าเท้าคาง")}/>}
import icons from './assets/kao-icons-v2.webp'
const iconCells={clock:[0,0],bag:[1,0],heartCalendar:[2,0],medal:[3,0],jar:[0,1],calendar:[1,1],money:[2,1],plane:[3,1],laptop:[0,2],chair:[1,2],popcorn:[2,2],house:[3,2]}
export function KaoIcon({name='jar'}) {if(name==='house')return <img src={houseIcon} className="kao-drawn-icon house-icon" alt=""/>;const [x,y]=iconCells[name]||iconCells.jar;return <svg className="kao-drawn-icon" viewBox={`${x*362} ${y*362} 362 362`} aria-hidden="true"><image href={icons} width="1448" height="1086"/></svg>}



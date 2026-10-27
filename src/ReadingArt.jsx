import React from 'react'
import atlas from './assets/reading-atlas-v2.webp'
const cells={read:0,goal:1,friends:2,happy:3,neutral:4,confused:5,complete:6,quiz:7,trophy:8}
export default function ReadingArt({name='read',className=''}){const n=cells[name]??0;return <span aria-hidden="true" className={'reading-art '+className} style={{backgroundImage:`url(${atlas})`,backgroundPosition:`${n%3*50}% ${Math.floor(n/3)*50}%`}}/>}

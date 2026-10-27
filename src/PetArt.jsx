import React from 'react'
import atlas from './assets/pet-care-atlas-v2-transparent.webp'
const cells={heart:0,food:1,medicine:2,grooming:3,vet:4,health:5,expense:6,contact:7,peek:8}
export default function PetArt({name='heart',className=''}){const n=cells[name]??0;return <span aria-hidden="true" className={'pet-art '+className} style={{backgroundImage:`url(${atlas})`,backgroundPosition:`${n%3*50}% ${Math.floor(n/3)*50}%`}}/>}

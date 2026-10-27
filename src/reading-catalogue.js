// Real edition metadata and cover references; no generated book covers.
export const bookLanguages = [
 ['tha','ไทย','Thai'],['eng','อังกฤษ','English'],['jpn','ญี่ปุ่น','Japanese'],
 ['chi','จีน','Chinese'],['kor','เกาหลี','Korean'],['fre','ฝรั่งเศส','French'],
 ['ger','เยอรมัน','German'],['spa','สเปน','Spanish'],['other','ภาษาอื่น','Other language'],
]
export const editionId = value => /^OL\d+M$/.test(value || '') ? value : ''
export const editionCover = value => editionId(value) ? `https://covers.openlibrary.org/b/olid/${value}-M.jpg?default=false` : ''
export async function findBookCovers({title,author,isbn,bookLanguage},signal){
 const cleanIsbn=(isbn||'').replace(/[\s-]/g,'')
 const params=new URLSearchParams({limit:'6',fields:'key,title,author_name,editions,editions.key,editions.title,editions.language,editions.cover_i,editions.isbn,editions.publisher,editions.publish_date'})
 if(cleanIsbn){
  if(!/^(?:\d{9}[\dXx]|\d{13})$/.test(cleanIsbn))throw Error('isbn')
  params.set('q',`isbn:${cleanIsbn}`)
 }else{
  params.set('title',title.trim())
  if(author.trim())params.set('author',author.trim())
  if(bookLanguage && bookLanguage!=='other')params.set('q',`language:${bookLanguage}`)
 }
 const response=await fetch('https://openlibrary.org/search.json?'+params,{signal,credentials:'omit',referrerPolicy:'no-referrer'})
 if(!response.ok)throw Error('lookup')
 const data=await response.json()
 return (data.docs||[]).flatMap(work=>(work.editions?.docs||[]).map(ed=>({
  edition:editionId(ed.key?.split('/').pop()),title:ed.title||work.title,
  author:(work.author_name||[]).join(', '),bookLanguage:ed.language?.[0]||'',
  isbn:ed.isbn?.find(x=>x.length===13)||ed.isbn?.[0]||'',
  publisher:ed.publisher?.[0]||'',year:ed.publish_date?.[0]||'',hasCover:ed.cover_i>0,
 }))).filter(b=>b.edition&&b.hasCover)
}

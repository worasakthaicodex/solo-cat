export function csvCell(value){
 let text=String(value??'');
 // Spreadsheet applications may evaluate user text as formulas, even in quoted cells.
 if(typeof value!=='number'&&/^[\s\uFEFF]*[=+@-]/.test(text))text="'"+text;
 return '"'+text.replaceAll('"','""')+'"';
}
export const csvDocument=rows=>'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');

export async function otWorkbook(rows){
 const {default:ExcelJS}=await import('exceljs');
 const book=new ExcelJS.Workbook();book.creator='Solo Cat';
 const sheet=book.addWorksheet('OT');
 for(const row of rows)sheet.addRow(row.map(value=>value??''));
 sheet.columns.forEach((column,index)=>{column.width=index===0?28:22});
 sheet.eachRow(row=>{row.font={name:'Tahoma',size:11};row.alignment={vertical:'top',wrapText:true};row.eachCell(cell=>{if(typeof cell.value==='number')cell.numFmt='0.00'})});
 sheet.getRow(1).font={name:'Tahoma',size:16,bold:true,color:{argb:'FFCB426D'}};
 sheet.views=[{state:'frozen',ySplit:3}];
 return book.xlsx.writeBuffer();
}

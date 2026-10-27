// Official directories checked 2026-09-21. Country must be selected explicitly;
// interface language is not evidence of the user's current location.
export const emergencyCountries=[
 {id:'TH',name:'ไทย',source:'https://thailand.go.th/issue-focus-detail/003_003',numbers:[['แจ้งเหตุด่วนเหตุร้าย','191'],['รถพยาบาลฉุกเฉิน','1669'],['ดับเพลิง','199'],['ตำรวจทางหลวง','1193']]},
 {id:'US',name:'สหรัฐอเมริกา',source:'https://www.911.gov/calling-911/frequently-asked-questions/',numbers:[['ตำรวจ / รถพยาบาล / ดับเพลิง','911']]},
 {id:'GB',name:'สหราชอาณาจักร',source:'https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers',numbers:[['ตำรวจ / รถพยาบาล / ดับเพลิง','999'],['หมายเลขฉุกเฉินสำรอง','112']]},
 {id:'SG',name:'สิงคโปร์',source:'https://www.gov.sg/contact-us/',numbers:[['รถพยาบาล / ดับเพลิง','995'],['ตำรวจ','999']]},
 {id:'AU',name:'ออสเตรเลีย',source:'https://www.triplezero.gov.au/',numbers:[['ตำรวจ / รถพยาบาล / ดับเพลิง','000']]},
 {id:'JP',name:'ญี่ปุ่น',source:'https://www.japan.travel/en/plan/emergencies/',numbers:[['รถพยาบาล / ดับเพลิง','119'],['ตำรวจ','110']]},
 {id:'OTHER',name:'ประเทศอื่น',numbers:[]}
]
export const emergencyFields=[['name','ชื่อที่ใช้ติดต่อ'],['contact','ผู้ติดต่อฉุกเฉิน'],['phone','เบอร์ผู้ติดต่อ'],['blood','กรุ๊ปเลือด'],['conditions','โรคประจำตัว / ข้อมูลสุขภาพ'],['allergies','การแพ้ยา / สิ่งที่แพ้'],['medicines','ยาที่ใช้อยู่'],['note','ข้อมูลสำหรับผู้ช่วยเหลือ']]

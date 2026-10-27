// Inbox entries are historical snapshots. Resolve their IDs against current
// records (including recurring occurrences) before opening personal details.
export function resolveNotificationItem(items,item,recurrence=globalThis.SoloRecurrence){
 if(!item?.due)return null
 const rows=recurrence.expand(items,item.due,item.due)
 return rows.find(row=>row.id===item.id)||null
}

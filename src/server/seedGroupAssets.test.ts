import { expect, it } from 'vitest'
import { MemoryStore } from './store'
import { seedReusableGroups } from './seedGroupAssets'
it('seeds four assets explicitly and idempotently without changing any existing product data',async()=>{
 const store=new MemoryStore();expect((await seedReusableGroups(store)).every(o=>o.status==='would-create')).toBe(true);expect((await store.query('questionGroupAssets',100)).items).toEqual([])
 expect((await seedReusableGroups(store,true)).filter(o=>o.status==='created')).toHaveLength(4)
 const first=(await store.query('questionGroupAssets',100)).items
 expect((await seedReusableGroups(store,true)).every(o=>o.status==='exists')).toBe(true);expect((await store.query('questionGroupAssets',100)).items).toEqual(first)
 expect(await store.forms()).toEqual([]);expect(await store.policies()).toEqual([]);expect(await store.schedules()).toEqual([]);expect(await store.evaluations()).toEqual([])
})

<template>
<v-container fluid>

<h2 class="mb-4">Jmeter Data Analitics</h2>

<v-row>
<v-col cols="12" md="6">
<v-file-input label="CSV BEFORE" accept=".csv" prepend-icon="mdi-file"
@update:modelValue="loadFile($event,'before')" />
<div v-if="beforeRaw" class="text-success">✔ Archivo BEFORE cargado</div>
</v-col>

<v-col cols="12" md="6">
<v-file-input label="CSV AFTER" accept=".csv" prepend-icon="mdi-file"
@update:modelValue="loadFile($event,'after')" /> 
<div v-if="afterRaw" class="text-success">✔ Archivo AFTER cargado</div>
</v-col>
</v-row>

<v-btn color="primary" class="my-4"
:disabled="!beforeRaw || !afterRaw"
@click="process">
Procesar archivos
</v-btn>

<!-- TODO LO DEMAS ORIGINAL -->
<div v-if="errorDiff !== null" class="mb-4 font-weight-bold">
Diferencia errores:
<span :class="diffErrorClass">
{{ errorArrow }} {{ errorDiff }} %
({{ totalErrorsBefore }} → {{ totalErrorsAfter }})
</span>
</div>

<div v-if="okCount" class="mb-2 font-weight-bold">
Total registros OK (200): {{ okCount }}
</div>

<v-data-table
v-if="rows.length"
:headers="headers"
:items="rows"
items-per-page="50"
class="elevation-1 mb-8">

<template #item.elapsedDiff="{ item }">
<span :class="diffClass(item.elapsedDiff)">
{{ format(item.elapsedDiff) }}
</span>
</template>

<template #item.latencyDiff="{ item }">
<span :class="diffClass(item.latencyDiff)">
{{ format(item.latencyDiff) }}
</span>
</template>

</v-data-table>

<!-- GRAFICO -->
<div v-if="chartReady" class="mb-8">
<h3>Evolución tiempos BEFORE vs AFTER</h3>
<div ref="chartDiv" style="height:420px"></div>
</div>

<v-text-field
v-if="errorBefore.length || errorAfter.length"
v-model="labelFilter"
label="Filtrar errores por label"
clearable
class="mb-3"
/>

<h3 v-if="filteredBefore.length">Errores agrupados BEFORE</h3>

<v-data-table
v-if="filteredBefore.length"
:headers="errorHeaders"
:items="filteredBefore"
items-per-page="50"
class="elevation-1 mb-8">

<template #item.responseCode="{ item }">
<span :class="codeClass(item.responseCode)">
{{ item.responseCode }}
</span>
</template>

</v-data-table>

<h3 v-if="filteredAfter.length">Errores agrupados AFTER</h3>

<v-data-table
v-if="filteredAfter.length"
:headers="errorHeaders"
:items="filteredAfter"
items-per-page="50">

<template #item.responseCode="{ item }">
<span :class="codeClass(item.responseCode)">
{{ item.responseCode }}
</span>
</template>

</v-data-table>

</v-container>
</template>

<script setup>
import Papa from 'papaparse'
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'

import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"

// ---------- DATA ----------
const beforeRaw=ref(null)
const afterRaw=ref(null)

const rows=ref([])
const errorBefore=ref([])
const errorAfter=ref([])

const labelFilter=ref('')
const okCount=ref(0)

const totalErrorsBefore=ref(0)
const totalErrorsAfter=ref(0)
const errorDiff=ref(null)

// ---------- HEADERS ----------
const headers = [
  { title: 'Label', value: 'label', sortable: true },
  { title: 'Response Code', value: 'responseCode', sortable: true },
  { title: 'Response Message', value: 'responseMessage', sortable: true },
  { title: 'Elapsed Before (ms)', value: 'elapsedBefore', sortable: true },
  { title: 'Elapsed After (ms)', value: 'elapsedAfter', sortable: true },
  { title: 'Elapsed Diff', value: 'elapsedDiff', sortable: true },
  { title: 'Latency Before (ms)', value: 'latencyBefore', sortable: true },
  { title: 'Latency After (ms)', value: 'latencyAfter', sortable: true },
  { title: 'Latency Diff', value: 'latencyDiff', sortable: true },
  { title: 'P95', value: 'p95', sortable: true },
  { title: 'P99', value: 'p99', sortable: true },
  { title: 'Std Dev', value: 'std', sortable: true }
]

const errorHeaders = [
  { title: 'Label', value: 'label', sortable: true },
  { title: 'Response Code', value: 'responseCode', sortable: true },
  { title: 'Response Message', value: 'responseMessage', sortable: true },
  { title: 'Count', value: 'count', sortable: true },
  { title: 'Fail %', value: 'failPercent', sortable: true }
]

// ---------- CHART ----------
const chartDiv=ref(null)
const chartReady=ref(false)
let root=null

function codeColor(code){
code=Number(code)
if(code>=500) return am5.color(0xc62828)
if(code>=400) return am5.color(0xef6c00)
if(code===200) return am5.color(0x2e7d32)
return am5.color(0x1565c0)
}

function buildChart(){

if(root){ root.dispose(); root=null }
if(!chartDiv.value) return

const before=beforeRaw.value||[]
const after=afterRaw.value||[]
if(!before.length && !after.length) return

root=am5.Root.new(chartDiv.value)
root.setThemes([am5themes_Animated.new(root)])

const chart=root.container.children.push(
am5xy.XYChart.new(root,{panX:true,panY:true,wheelX:"panX",wheelY:"zoomX"})
)

const datasetBefore=before.map((r,i)=>({
idx:String(i),
value:Number(r.elapsed)||0,
label:r.label||'',
code:Number(r.responseCode)||0
}))

const datasetAfter=after.map((r,i)=>({
idx:String(i),
value:Number(r.elapsed)||0,
label:r.label||'',
code:Number(r.responseCode)||0
}))

const xAxis=chart.xAxes.push(
am5xy.CategoryAxis.new(root,{
categoryField:"idx",
renderer:am5xy.AxisRendererX.new(root,{minGridDistance:30})
})
)

const yAxis=chart.yAxes.push(
am5xy.ValueAxis.new(root,{
renderer:am5xy.AxisRendererY.new(root,{})
})
)

xAxis.data.setAll(datasetBefore.length?datasetBefore:datasetAfter)

function makeSeries(name,data){

if(!data.length) return

const s=chart.series.push(
am5xy.LineSeries.new(root,{
name,
xAxis,
yAxis,
valueYField:"value",
categoryXField:"idx",
tooltip:am5.Tooltip.new(root,{
labelText:`${name}
Label:{label}
Code:{code}
Elapsed:{valueY} ms`
}),
turboMode:true
})
)

s.data.setAll(data)

s.strokes.template.adapters.add("stroke",(stroke,target)=>{
return codeColor(target.dataItem?.dataContext?.code)
})

s.bullets.push(()=>{
const c=am5.Circle.new(root,{radius:3,fill:am5.color(0xffffff),strokeWidth:2})
c.adapters.add("stroke",(stroke,target)=>{
return codeColor(target.dataItem?.dataContext?.code)
})
return am5.Bullet.new(root,{sprite:c})
})

}

makeSeries("BEFORE",datasetBefore)
makeSeries("AFTER",datasetAfter)

chart.set("cursor",am5xy.XYCursor.new(root,{}))
chart.children.push(am5.Legend.new(root,{})).data.setAll(chart.series.values)
}

onBeforeUnmount(()=>{ if(root) root.dispose() })

// ---------- LOAD ----------
function loadFile(value,type){
const file=Array.isArray(value)?value[0]:value
if(!file) return

Papa.parse(file,{
header:true,
dynamicTyping:true,
skipEmptyLines:true,
complete:r=>{
if(type==='before') beforeRaw.value=r.data
else afterRaw.value=r.data
}
})
}

// ---------- STATS ----------
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length
const std=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))}
const percentile=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(p/100*s.length)]??0}

const meanSafe=a=>a.length?Math.round(mean(a)):0
const stdSafe=a=>a.length?Math.round(std(a)):0
const percentileSafe=(a,p)=>a.length?Math.round(percentile(a,p)):0

function group(data){
const map={}
data.forEach(r=>{
const key=`${r.label}|${r.responseCode}|${r.responseMessage}`
if(!map[key]) map[key]={label:r.label,responseCode:r.responseCode,responseMessage:r.responseMessage,elapsed:[],latency:[]}
map[key].elapsed.push(Number(r.elapsed??r.Elapsed)||0)
map[key].latency.push(Number(r.Latency??r.latency)||0)
})
return map
}

function buildErrors(all){
const total=all.length||1
const map={}
let totalErrors=0

all.forEach(r=>{
const code=Number(r.responseCode)
const msg=String(r.responseMessage)

if(code===200 && msg.toUpperCase()==='OK') return
totalErrors++

const key=`${code}|${msg}|${r.label}`
if(!map[key]) map[key]={responseCode:code,responseMessage:msg,label:r.label,count:0}
map[key].count++
})

return{
rows:Object.values(map).map(e=>({...e,failPercent:((e.count/total)*100).toFixed(2)})),
totalErrors
}
}

// ---------- PROCESS ----------
async function process(){

const before=group(beforeRaw.value||[])
const after=group(afterRaw.value||[])

const keys=new Set([...Object.keys(before),...Object.keys(after)])

rows.value=[...keys].map(k=>{
const b=before[k]; const a=after[k]
const label=b?.label||a?.label
const code=b?.responseCode||a?.responseCode
const msg=b?.responseMessage||a?.responseMessage
if(!(Number(code)===200 && String(msg).toUpperCase()==='OK')) return null

const be=b?.elapsed||[]
const ae=a?.elapsed||[]
const bl=b?.latency||[]
const al=a?.latency||[]

return{
label,
responseCode:code,
responseMessage:msg,
elapsedBefore:meanSafe(be),
elapsedAfter:meanSafe(ae),
elapsedDiff:meanSafe(ae)-meanSafe(be),
latencyBefore:meanSafe(bl),
latencyAfter:meanSafe(al),
latencyDiff:meanSafe(al)-meanSafe(bl),
p95:percentileSafe(ae.length?ae:be,95),
p99:percentileSafe(ae.length?ae:be,99),
std:stdSafe(ae.length?ae:be),
}
}).filter(Boolean)

const all=[...(beforeRaw.value||[]),...(afterRaw.value||[])]
okCount.value=all.filter(r=>Number(r.responseCode)===200 && String(r.responseMessage).toUpperCase()==='OK').length

const beforeErrors=buildErrors(beforeRaw.value||[])
const afterErrors=buildErrors(afterRaw.value||[])

errorBefore.value=beforeErrors.rows
errorAfter.value=afterErrors.rows
totalErrorsBefore.value=beforeErrors.totalErrors
totalErrorsAfter.value=afterErrors.totalErrors

if(totalErrorsBefore.value===0 && totalErrorsAfter.value===0){
errorDiff.value=0
}else{
const diff=((totalErrorsAfter.value-totalErrorsBefore.value)/Math.max(totalErrorsBefore.value,1))*100
errorDiff.value=diff.toFixed(2)
}

// construir gráfico al final
chartReady.value=true
await nextTick()
buildChart()
}

// ---------- FILTERS ----------
const filteredBefore=computed(()=>{
if(!labelFilter.value) return errorBefore.value
return errorBefore.value.filter(e=>e.label?.toLowerCase().includes(labelFilter.value.toLowerCase()))
})

const filteredAfter=computed(()=>{
if(!labelFilter.value) return errorAfter.value
return errorAfter.value.filter(e=>e.label?.toLowerCase().includes(labelFilter.value.toLowerCase()))
})

// ---------- UI ----------
function diffClass(v){ if(v>0)return'text-error'; if(v<0)return'text-success'; return'' }
const format=v=>`${v} ms`
function codeClass(code){ if(code>=500)return'code-5xx'; if(code>=400)return'code-4xx'; return'' }

const errorArrow=computed(()=>errorDiff.value>0?'↑':errorDiff.value<0?'↓':'=')
const diffErrorClass=computed(()=>errorDiff.value>0?'text-error':errorDiff.value<0?'text-success':'')
</script>

<style scoped>
.text-error{color:#d32f2f;font-weight:bold}
.text-success{color:#2e7d32;font-weight:bold}
.code-4xx{color:#ef6c00;font-weight:bold}
.code-5xx{color:#c62828;font-weight:bold}
</style>
<template>
  <v-container fluid>

    <h2 class="mb-4">Jmeter Data Analitics</h2>

    <v-row>
      <v-col cols="12" md="6">
        <v-file-input
          label="CSV ANTES"
          accept=".csv"
          prepend-icon="mdi-file"
          @update:modelValue="loadFile($event, 'before')"
        />
        <div v-if="beforeRaw" class="text-success">✔ Archivo ANTES cargado</div>
      </v-col>

      <v-col cols="12" md="6">
        <v-file-input
          label="CSV DESPUES"
          accept=".csv"
          prepend-icon="mdi-file"
          @update:modelValue="loadFile($event, 'after')"
        />
        <div v-if="afterRaw" class="text-success">✔ Archivo DESPUES cargado</div>
      </v-col>
    </v-row>

    <v-btn
      color="primary"
      class="my-4"
      :disabled="!beforeRaw || !afterRaw"
      @click="process"
    >
      Procesar archivos
    </v-btn>

    <div v-if="okCount" class="mb-2 font-weight-bold">
      Total registros OK (200): {{ okCount }}
    </div>

    <!-- TABLA OK -->
    <v-data-table
      v-if="rows.length"
      :headers="headers"
      :items="rows"
      items-per-page="50"
      class="elevation-1 mb-8"
    >
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

    <!-- FILTRO ERRORES -->
    <v-text-field
      v-if="errorBefore.length || errorAfter.length"
      v-model="labelFilter"
      label="Filtrar errores por label"
      clearable
      class="mb-3"
    />

    <!-- DIFERENCIA GLOBAL ERRORES -->
    <div v-if="errorDiff !== null" class="mb-4 font-weight-bold">
      Diferencia errores:
      <span :class="diffErrorClass">
        {{ errorArrow }} 
        ({{ totalErrorsBefore }} → {{ totalErrorsAfter }})
      </span>
    </div>

    <!-- BEFORE -->
    <h3 v-if="filteredBefore.length" class="mb-2">Errores agrupados ANTES</h3>

    <v-data-table
      v-if="filteredBefore.length"
      :headers="errorHeaders"
      :items="filteredBefore"
      items-per-page="50"
      class="elevation-1 mb-8"
    >
      <template #item.responseCode="{ item }">
        <span :class="codeClass(item.responseCode)">
          {{ item.responseCode }}
        </span>
      </template>
    </v-data-table>

    <!-- AFTER -->
    <h3 v-if="filteredAfter.length" class="mb-2">Errores agrupados DESPUES</h3>

    <v-data-table
      v-if="filteredAfter.length"
      :headers="errorHeaders"
      :items="filteredAfter"
      items-per-page="50"
      class="elevation-1"
    >
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
import { ref, computed } from 'vue'

const beforeRaw = ref(null)
const afterRaw = ref(null)

const rows = ref([])
const errorBefore = ref([])
const errorAfter = ref([])

const labelFilter = ref('')
const okCount = ref(0)

const totalErrorsBefore = ref(0)
const totalErrorsAfter = ref(0)
const errorDiff = ref(null)

const headers = [
  { title: 'Label', key: 'label' },
  { title: 'Code', key: 'responseCode' },
  { title: 'Message', key: 'responseMessage' },
  { title: 'Elapsed Avg Antes', key: 'elapsedBefore' },
  { title: 'Elapsed Avg Despues', key: 'elapsedAfter' },
  { title: 'Elapsed Diff', key: 'elapsedDiff' },
  { title: 'Latency Avg Antes', key: 'latencyBefore' },
  { title: 'Latency Avg Despues', key: 'latencyAfter' },
  { title: 'Latency Diff', key: 'latencyDiff' },
  { title: 'P95 elapsed', key: 'p95' },
  { title: 'P99 elapsed', key: 'p99' },
  { title: 'StdDev elapsed', key: 'std' },
]

const errorHeaders = [
  { title: 'Code', key: 'responseCode' },
  { title: 'Message', key: 'responseMessage' },
  { title: 'Label', key: 'label' },
  { title: 'Cantidad', key: 'count' },
  { title: '% fallos', key: 'failPercent' },
]

// ---------- cargar ----------
function loadFile(value, type){
  const file = Array.isArray(value)?value[0]:value
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

// ---------- stats ----------
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length
const std=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))}
const percentile=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(p/100*s.length)]??0}

const meanSafe=a=>a.length?Math.round(mean(a)):0
const stdSafe=a=>a.length?Math.round(std(a)):0
const percentileSafe=(a,p)=>a.length?Math.round(percentile(a,p)):0

// ---------- agrupar tiempos ----------
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

// ---------- errores ----------
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
    if(!map[key]){
      map[key]={responseCode:code,responseMessage:msg,label:r.label,count:0}
    }
    map[key].count++
  })

  return { 
    rows:Object.values(map).map(e=>({
      ...e,
      failPercent:((e.count/total)*100).toFixed(2)
    })),
    totalErrors
  }
}

// ---------- procesar ----------
function process(){

  const before=group(beforeRaw.value||[])
  const after=group(afterRaw.value||[])

  const keys=new Set([...Object.keys(before),...Object.keys(after)])

  rows.value=[...keys]
    .map(k=>{
      const b=before[k]; const a=after[k]

      const label=b?.label||a?.label
      const code=b?.responseCode||a?.responseCode
      const msg=b?.responseMessage||a?.responseMessage

      if(!(Number(code)===200 && String(msg).toUpperCase()==='OK')) return null

      const be=b?.elapsed||[]
      const ae=a?.elapsed||[]
      const bl=b?.latency||[]
      const al=a?.latency||[]

      const baseElapsed=meanSafe(be)
      const newElapsed=meanSafe(ae)
      const baseLatency=meanSafe(bl)
      const newLatency=meanSafe(al)

      return{
        label,
        responseCode:code,
        responseMessage:msg,
        elapsedBefore:baseElapsed,
        elapsedAfter:newElapsed,
        elapsedDiff:newElapsed-baseElapsed,
        latencyBefore:baseLatency,
        latencyAfter:newLatency,
        latencyDiff:newLatency-baseLatency,
        p95:percentileSafe(ae.length?ae:be,95),
        p99:percentileSafe(ae.length?ae:be,99),
        std:stdSafe(ae.length?ae:be),
      }
    })
    .filter(Boolean)

  const all=[...(beforeRaw.value||[]),...(afterRaw.value||[])]

  okCount.value=all.filter(r =>
    Number(r.responseCode)===200 &&
    String(r.responseMessage).toUpperCase()==='OK'
  ).length

  const beforeErrors = buildErrors(beforeRaw.value||[])
  const afterErrors = buildErrors(afterRaw.value||[])

  errorBefore.value = beforeErrors.rows
  errorAfter.value = afterErrors.rows

  totalErrorsBefore.value = beforeErrors.totalErrors
  totalErrorsAfter.value = afterErrors.totalErrors

  if(totalErrorsBefore.value===0 && totalErrorsAfter.value===0){
    errorDiff.value = 0
  }else{
    const diff=((totalErrorsAfter.value-totalErrorsBefore.value)/Math.max(totalErrorsBefore.value,1))*100
    errorDiff.value = diff.toFixed(2)
  }
}

// ---------- filtros ----------
const filteredBefore=computed(()=>{
  if(!labelFilter.value) return errorBefore.value
  return errorBefore.value.filter(e =>
    e.label?.toLowerCase().includes(labelFilter.value.toLowerCase())
  )
})

const filteredAfter=computed(()=>{
  if(!labelFilter.value) return errorAfter.value
  return errorAfter.value.filter(e =>
    e.label?.toLowerCase().includes(labelFilter.value.toLowerCase())
  )
})

// ---------- UI ----------
function diffClass(v){
  if(v>0) return 'text-error'
  if(v<0) return 'text-success'
  return ''
}

const format=v=>`${v} ms`

function codeClass(code){
  if(code>=500) return 'code-5xx'
  if(code>=400) return 'code-4xx'
  return ''
}

const errorArrow = computed(()=>{
  if(errorDiff.value>0) return '↑'
  if(errorDiff.value<0) return '↓'
  return '='
})

const diffErrorClass = computed(()=>{
  if(errorDiff.value>0) return 'text-error'
  if(errorDiff.value<0) return 'text-success'
  return ''
})
</script>

<style scoped>
.text-error{color:#d32f2f;font-weight:bold}
.text-success{color:#2e7d32;font-weight:bold}
.code-4xx{color:#ef6c00;font-weight:bold}
.code-5xx{color:#c62828;font-weight:bold}
</style>

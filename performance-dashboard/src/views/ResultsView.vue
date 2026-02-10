<!-- <template>
  <v-container fluid>
    <h2>Consulta de Resultados Consolidados</h2>

    <v-data-table
      :headers="headers"
      :items="files"
      item-value="file"
      show-select
      v-model="selected"
      class="mb-4"
    />

    <v-btn
      color="primary"
      :disabled="selected.length !== 2"
      @click="compare"
    >
      Comparar seleccionados ({{ selected.length }})
    </v-btn>

    <v-table v-if="comparison" class="mt-6">
      <thead>
        <tr>
          <th>Métrica</th>
          <th>Antes</th>
          <th>Después</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in compareRows" :key="row.metric">
          <td>{{ row.metric }}</td>
          <td>{{ row.before }}</td>
          <td>{{ row.after }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>



<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  getConsolidatedList,
  compareConsolidated
} from '@/services/api'

const files = ref([])
const selected = ref([]) // ahora funciona con v-model
const comparison = ref(null)

const headers = [
  { title: 'Archivo', key: 'file' }
]

async function loadFiles() {
  const res = await getConsolidatedList()

  let list = []

  if (Array.isArray(res.data)) {
    list = res.data
  } else if (Array.isArray(res.data.files)) {
    list = res.data.files
  } else {
    throw new Error('Formato inesperado en /api/reports/list')
  }

  files.value = list.map(f => ({
    file: f
  }))
}

async function compare() {
  const [f1, f2] = selected.value

  console.log('Comparando:', f1, f2)

  const res = await compareConsolidated(f1, f2)
  comparison.value = res.data
}

// 🔍 DEBUG: ver qué devuelve Vuetify realmente
watch(selected, v => {
  console.log('Seleccionados reales:', v)
})

const compareRows = computed(() => {
  if (!comparison.value) return []

  return [
    { metric: 'minTime', before: comparison.value.before.minTime, after: comparison.value.after.minTime },
    { metric: 'maxTime', before: comparison.value.before.maxTime, after: comparison.value.after.maxTime },
    { metric: 'avgTime', before: comparison.value.before.avgTime, after: comparison.value.after.avgTime },
    { metric: 'p95', before: comparison.value.before.p95, after: comparison.value.after.p95 },
    { metric: 'p99', before: comparison.value.before.p99, after: comparison.value.after.p99 }
  ]
})

onMounted(loadFiles)
</script>
 -->


 <template>
  <v-container fluid>
    <h2>Consulta de Resultados Consolidados</h2>

    <!-- Tabla de archivos -->
    <v-data-table
      :headers="headers"
      :items="files"
      item-value="file"
      show-select
      v-model="selected"
      class="mb-4"
    />

    <v-btn
      color="primary"
      :disabled="selected.length !== 2"
      @click="compare"
      class="mb-6"
    >
      Comparar seleccionados ({{ selected.length }})
    </v-btn>

    <!-- Comparaciones -->
    <div v-if="comparison">

      <h3 class="mb-4">
        Comparación generada: {{ formatDate(comparison.generatedAt) }}
      </h3>

      <div
        v-for="(test, testName) in comparison.comparison"
        :key="testName"
        class="mb-10"
      >
        <h4 class="mb-2">{{ testName }}</h4>

        <v-table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Antes</th>
              <th>Después</th>
              <th>Diferencia</th>
              <th>Tendencia</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in buildRows(test)" :key="row.metric">
              <td>{{ row.metric }}</td>

              <td>{{ formatMs(row.before) }}</td>

              <td>{{ formatMs(row.after) }}</td>

              <td
                :class="diffClass(row.diff)"
              >
                {{ formatDiff(row.diff) }}
              </td>

              <td
                :class="trendClass(row.diff)"
              >
                {{ trendIcon(row.diff) }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Resumen extra -->
        <div class="mt-2 text-caption">
          Runs antes: {{ test.before.totalRuns }} |
          Runs después: {{ test.after.totalRuns }} |
          Fallos antes: {{ test.before.failed }} |
          Fallos después: {{ test.after.failed }}
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getConsolidatedList,
  compareConsolidated
} from '@/services/api'

const files = ref([])
const selected = ref([])
const comparison = ref(null)

const headers = [
  { title: 'Archivo', key: 'file' }
]

// --------------------
// Carga archivos
// --------------------
async function loadFiles() {
  const res = await getConsolidatedList()

  let list = []

  if (Array.isArray(res.data)) {
    list = res.data
  } else if (Array.isArray(res.data.files)) {
    list = res.data.files
  } else {
    throw new Error('Formato inesperado en /api/reports/list')
  }

  files.value = list.map(f => ({ file: f }))
}

// --------------------
// Comparar
// --------------------
async function compare() {
  const [f1, f2] = selected.value

  const res = await compareConsolidated(f1, f2)
  comparison.value = res.data
}

// --------------------
// Helpers UI
// --------------------
function buildRows(test) {
  return [
    { metric: 'minTime', before: test.before.minTime, after: test.after.minTime, diff: test.minDiff },
    { metric: 'maxTime', before: test.before.maxTime, after: test.after.maxTime, diff: test.maxDiff },
    { metric: 'avgTime', before: test.before.avgTime, after: test.after.avgTime, diff: test.avgDiff },
    { metric: 'p95', before: test.before.p95, after: test.after.p95, diff: test.p95Diff },
    { metric: 'p99', before: test.before.p99, after: test.after.p99, diff: test.p99Diff },
    { metric: 'failed', before: test.before.failed, after: test.after.failed, diff: test.failedDiff }
  ]
}

function formatMs(val) {
  if (typeof val !== 'number') return val
  return `${(val / 1000).toFixed(2)} s`
}

function formatDiff(val) {
  if (val === 0) return '0'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val} ms`
}

function diffClass(val) {
  if (val > 0) return 'text-error font-weight-bold'
  if (val < 0) return 'text-success font-weight-bold'
  return 'text-medium-emphasis'
}

function trendIcon(val) {
  if (val > 0) return '⬆ Empeora'
  if (val < 0) return '⬇ Mejora'
  return '➡ Igual'
}

function trendClass(val) {
  if (val > 0) return 'text-error'
  if (val < 0) return 'text-success'
  return 'text-medium-emphasis'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

onMounted(loadFiles)
</script>

<style scoped>
.text-error {
  color: #d32f2f;
}

.text-success {
  color: #2e7d32;
}

.text-medium-emphasis {
  color: #666;
}
</style>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2>Pruebas de Performance</h2>
      </v-col>
    </v-row>

    <!-- Botones de ejecución -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-btn block color="primary" @click="runTest('hotel')">
          Hotel Booking
        </v-btn>
      </v-col>

      <v-col cols="12" md="3">
        <v-btn block color="primary" @click="runTest('search')">
          Search Widget
        </v-btn>
      </v-col>

      <v-col cols="12" md="3">
        <v-btn block color="primary" @click="runTest('summary')">
          Reservation Summary
        </v-btn>
      </v-col>

      <v-col cols="12" md="3">
        <v-btn block color="primary" @click="runTest('display')">
          Display Reservation
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtro por fecha -->
    <v-row class="mb-2">
      <v-col cols="12" md="3">
        <v-text-field
          label="Desde (YYYY-MM-DD)"
          v-model="fromDate"
          type="date"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          label="Hasta (YYYY-MM-DD)"
          v-model="toDate"
          type="date"
        />
      </v-col>

      <v-col cols="12" md="3" class="d-flex align-end">
        <v-btn color="secondary" @click="loadPerformanceFiles">
          Refrescar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabla de resultados -->
    <v-data-table
      :headers="headers"
      :items="filteredReports"
      item-key="folder"
      class="elevation-1"
    >
      <template #item.html="{ item }">
        <v-btn
          v-for="file in item.html_files"
          :key="file"
          size="small"
          :href="buildReportUrl(item.folder, file)"
          target="_blank"
          rel="noopener"
          variant="text"
        >
          {{ file }}
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  runHotelBooking,
  runSearchWidget,
  runReservationSummary,
  runDisplayReservation,
  sendAgentReport,
  consolidateReports,
  getPerformanceFiles
} from '@/services/api'

// state
const reports = ref([])
const fromDate = ref('')
const toDate = ref('')
const loading = ref(false)

const headers = [
  { text: 'Test', value: 'test_type' },
  { text: 'Fecha', value: 'date' },
  { text: 'Carpeta', value: 'folder' },
  { text: 'Reportes HTML', value: 'html' }
]

function buildReportUrl(folder, file) {
  const base = import.meta.env.VITE_REPORTS_BASE_URL || 'http://localhost:3000/api'
  return `${base}/reports/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
}
// ========= Run Tests Flow =========

async function runTest(type) {
  loading.value = true
  try {
    let runRes

    switch (type) {
      case 'hotel':
        runRes = await runHotelBooking()
        break
      case 'search':
        runRes = await runSearchWidget()
        break
      case 'summary':
        runRes = await runReservationSummary()
        break
      case 'display':
        runRes = await runDisplayReservation()
        break
    }

    const testName = runRes.data.test_name

    await sendAgentReport(testName)
    await consolidateReports()

    await loadPerformanceFiles()
  } catch (err) {
    console.error('Error ejecutando prueba:', err)
    alert('Error ejecutando prueba de performance')
  } finally {
    loading.value = false
  }
}

// ========= Load Reports =========

async function loadPerformanceFiles() {
  const res = await getPerformanceFiles()
  reports.value = res.data
}

// ========= Date Filter =========

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    if (fromDate.value && r.date < fromDate.value) return false
    if (toDate.value && r.date > toDate.value) return false
    return true
  })
})

onMounted(() => {
  loadPerformanceFiles()
})
</script>

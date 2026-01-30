<template>
  <v-app>
    <v-main>
      <v-container>
        <h1>Playwright Reports Dashboard</h1>

        <ReportSelector @compare="onCompare" />

        <AvgComparisonChart :comparison="comparison" />

        <ComparisonTable :comparison="comparison" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { compareReports } from './api/reportsApi';

import ReportSelector from './components/ReportSelector.vue';
import AvgComparisonChart from './components/AvgComparisonChart.vue';
import ComparisonTable from './components/ComparisonTable.vue';

const comparison = ref(null);

async function onCompare({ a, b }) {
  const res = await compareReports(a, b);
  comparison.value = res.comparison;
}
</script>

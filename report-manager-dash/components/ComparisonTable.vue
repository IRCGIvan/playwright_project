<template>
  <v-table v-if="comparison">
    <thead>
      <tr>
        <th>Test</th>
        <th>Avg Δ</th>
        <th>P95 Δ</th>
        <th>P99 Δ</th>
        <th>Min Δ</th>
        <th>Max Δ</th>
        <th>Failed Δ</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(t, name) in comparison" :key="name">
        <td>{{ name }}</td>
        <td>{{ t.avgDiff }}</td>
        <td>{{ t.p95Diff }}</td>
        <td>{{ t.p99Diff }}</td>
        <td>{{ t.minDiff }}</td>
        <td>{{ t.maxDiff }}</td>
        <td>{{ t.failedDiff }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
defineProps({
  comparison: Object
});
</script>

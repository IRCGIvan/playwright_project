<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-select
        label="Reporte A"
        :items="files"
        v-model="a"
      />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        label="Reporte B"
        :items="files"
        v-model="b"
      />
    </v-col>

    <v-col cols="12" md="4" class="d-flex align-center">
      <v-btn
        color="primary"
        :disabled="!a || !b"
        @click="emitCompare"
      >
        Comparar
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getReportsList } from '../api/reportsApi';

const emit = defineEmits(['compare']);

const files = ref([]);
const a = ref('');
const b = ref('');

onMounted(async () => {
  files.value = await getReportsList();
});

function emitCompare() {
  emit('compare', { a: a.value, b: b.value });
}
</script>
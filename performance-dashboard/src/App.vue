<template>
  <v-app>
    <v-navigation-drawer>
      <v-list>

        <v-list-item to="/performance" router>
          <v-list-item-title>
            🧪 Pruebas de Performance
          </v-list-item-title>
        </v-list-item>

        <v-list-item to="/results" router>
          <v-list-item-title>
            📊 Consulta de Resultados
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>



<!-- <script setup></script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style> -->

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

        <v-list-item to="/jmeter" prepend-icon="mdi-file-chart" router>
          <v-list-item-title>
            Jmeter Data
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

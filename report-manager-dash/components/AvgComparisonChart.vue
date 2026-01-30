<template>
  <div id="avgChartDiv" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

let root = null;

const props = defineProps({
  comparison: Object
});

watch(
  () => props.comparison,
  (comparison) => {
    if (!comparison) return;

    if (root) root.dispose();

    root = am5.Root.new("avgChartDiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {})
    );

    const data = Object.entries(comparison).map(([name, t]) => ({
      test: name,
      before: t.before.avgTime,
      after: t.after.avgTime
    }));

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "test"
      })
    );
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {})
    );

    const makeSeries = (name, field) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: field,
          categoryXField: "test",
          tooltip: am5.Tooltip.new(root, {
            labelText: `${name}: {valueY} ms`
          })
        })
      );

      series.data.setAll(data);
    };

    makeSeries("Antes", "before");
    makeSeries("Después", "after");

    chart.children.push(am5.Legend.new(root, {}));
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (root) root.dispose();
});
</script>

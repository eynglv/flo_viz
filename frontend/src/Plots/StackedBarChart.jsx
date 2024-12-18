import * as d3 from "d3";
import { useEffect, useRef } from "react";

import {
  raceCategories,
  raceColorScale,
  incomeCategories,
  incomeColorScale,
  layers,
} from "../helpers/constants";

const StackedBarChart = ({
  data: fullData,
  selectedPark,
  type,
  width = 1200,
  height = 700,
  marginTop = 100,
  marginRight = 20,
  marginBottom = 50,
  marginLeft = 50,
}) => {
  const ref = useRef();

  const data = type === layers.Race ? fullData.race_data : fullData.income_data;
  const selectedParkData = data.filter((row) => row["name_2"] === selectedPark);

  const totalSelector =
    type === layers.Race ? "total_population" : "200_or_more";
  const domainCategories =
    type === layers.Race ? raceCategories : incomeCategories;
  const colorScale = type === layers.Race ? raceColorScale : incomeColorScale;

  const generator = d3
    .stack()
    .keys(Object.keys(domainCategories))
    .value((row, key) => +row[key] || 0);
  const series = generator(selectedParkData);

  const x = d3
    .scaleBand()
    .domain(
      d3.groupSort(
        selectedParkData,
        (D) => -d3.sum(D, (d) => d[totalSelector]),
        (d) => d.NAME
      )
    )
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([height - marginBottom, marginTop]);

  // append axes
  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call((g) => g.selectAll(".domain").remove());

    svgElement
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(5, "s"))
      .call((g) => g.selectAll(".domain").remove());
  }, [height, marginBottom, marginLeft, x, y]);

  // append bars
  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll()
      .data(series)
      .join("g")
      .attr("fill", (d) => colorScale[d.key][1])
      .selectAll("rect")
      .data((D) => D.map((d) => ((d.key = D.key), d)))
      .join("rect")
      // hmmm...
      .attr("x", (d) => x(d.data.NAME))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
  }, [colorScale, series, x, y]);

  // add legend
  useEffect(() => {
    const svgElement = d3.select(ref.current);
    const size = 20;
    const legendPadding = 10;
    const legendX = width - marginRight - size - legendPadding * 10;

    svgElement
      .selectAll("squares")
      .data(series)
      .enter()
      .append("rect")
      .attr("x", legendX)
      .attr("y", (d, i) => marginTop + i * (size + legendPadding))
      .attr("width", size)
      .attr("height", size)
      .attr("fill", (d) => colorScale[d.key][1]);

    svgElement
      .selectAll("labels")
      .data(series)
      .enter()
      .append("text")
      .attr("x", legendX + size + legendPadding)
      .attr("y", (d, i) => marginTop + i * (size + legendPadding) + size / 2)
      .style("fill", function (d) {
        return colorScale[d.key];
      })
      .text((d) => {
        return domainCategories[d.key];
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  }, [colorScale, domainCategories, marginRight, marginTop, series, width]);

  // add title
  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement
      .append("text")
      .text((d) => {
        const title = `${selectedPark} Census Distribution`;
        return title;
      })
      .attr("x", width / 3)
      .attr("y", 80)
      .attr("font-size", "20px");
  }, [selectedPark, width]);

  return <svg width={width} height={height} ref={ref} />;
};

export default StackedBarChart;

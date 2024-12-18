import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { incomeCategories, raceCategories } from "../helpers/constants";

const generateHierarchy = (data) => {
  const incomeKeys = Object.keys(incomeCategories);
  const raceKeys = Object.keys(raceCategories);

  const { income_data: incomeData, race_data: raceData } = data;
  const incomeReferencer = incomeData.reduce((accumulator, currVal) => {
    const { id, TRACTCE: tract } = currVal;
    const uniqueKey = id + "&" + tract;

    const stats = Object.fromEntries(
      incomeKeys.map((key) => [key, currVal[key]])
    );
    return {
      ...accumulator,
      [uniqueKey]: stats,
    };
  }, {});

  const raceReferencer = raceData.reduce((accumulator, currVal) => {
    const { id, TRACTCE: tract, total_population: totalPopulation } = currVal;
    const uniqueKey = id + "&" + tract;

    const stats = Object.fromEntries(
      raceKeys.map((key) => [key, parseFloat(currVal[key])])
    );

    return {
      ...accumulator,
      [uniqueKey]: { totalPopulation, ...stats },
    };
  }, {});

  const convertedIncomeValues = Object.fromEntries(
    Object.entries(incomeReferencer).map(([id, stats]) => {
      const totalPopulation = parseFloat(raceReferencer[id]["totalPopulation"]);

      const recalculatedValues = Object.fromEntries(
        Object.entries(stats).map(([key, percentage]) => [
          key,
          parseInt((parseFloat(percentage) / 100) * totalPopulation),
        ])
      );
      return [id, recalculatedValues];
    })
  );

  // the one with smaller length
  const firstRef =
    Object.keys(convertedIncomeValues).length >
    Object.keys(raceReferencer).length
      ? raceReferencer
      : convertedIncomeValues;

  // the one with larger length
  const secondRef =
    firstRef === convertedIncomeValues ? raceReferencer : convertedIncomeValues;

  const intersection = Object.entries(firstRef).map(([id, stats]) => {
    return {
      ...stats,
      ...secondRef[id],
    };
  });

  const sumValues = intersection.reduce((accumulator, currVal) => {
    for (const key in currVal) {
      if (key !== "totalPopulation") {
        accumulator[key] = (accumulator[key] || 0) + parseFloat(currVal[key]);
      }
    }
    return accumulator;
  }, {});

  const result = Object.entries(sumValues).map(([key, value]) => {
    const id = raceKeys.includes(key) ? `race.${key}` : `income.${key}`;
    return { id, value };
  });

  return result;
};

const DotDistribution = ({
  data: fullData,
  width = 1200,
  height = 1000,
  margin = 20,
  state,
}) => {
  const ref = useRef();

  const data = fullData[state];
  const hierarchy = generateHierarchy(data);

  const group = (d) => d.id.split(".")[0];
  const name = (d) => d.id.split(".")[1];

  const color = d3.scaleOrdinal(d3.schemePaired);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    const root = d3
      .pack()
      .size([width - 2 * margin, height - 2 * margin])
      .padding(3)(d3.hierarchy({ children: hierarchy }).sum((d) => d.value));

    const node = svgElement
      .attr("viewBox", [-margin, -margin, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .attr("text-anchor", "middle")
      .append("g")
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("fill-opacity", 0.7)
      .attr("fill", (d) => color(group(d.data)))
      .attr("r", (d) => d.r);

    node
      .append("text")
      .text((d) => {
        const key = name(d.data);
        const displayName = Object.keys(raceCategories).includes(key)
          ? raceCategories[key]
          : incomeCategories[key];
        return displayName;
      })
      .attr("dy", "0.3em")
      .style("font-size", (d) => `${Math.min(d.r / 3, 13)}px`)
      .style("fill", "#fff")
      .style("text-anchor", "middle");

    node
      .append("text")
      .text((d) => d.value.toLocaleString())
      .attr("x", 0)
      .attr("y", "2em")
      .style("font-size", "10px")
      .style("fill", "#fff");
  }, [color, height, hierarchy, margin, width]);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    svgElement
      .append("text")
      .text((d) => state)
      .attr("x", width / 2)
      .attr("y", margin * 2)
      .attr("font-size", "34px");
  }, [height, margin, state, width]);

  return <svg width={width} height={height} ref={ref} />;
};

export default DotDistribution;

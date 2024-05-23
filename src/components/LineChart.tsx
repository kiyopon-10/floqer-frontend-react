import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface DataPoint {
  year: number;
  jobs: number;
  avg_salary: number;
}

interface Props {
  data: DataPoint[];
  prop2: 'jobs' | 'avg_salary';
}

const LineGraph: React.FC<Props> = ({ data, prop2 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const margin = { top: 30, right: 40, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([d3.min(data, d => d.year)!, d3.max(data, d => d.year)!])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
              prop2 === 'jobs' ? d3.min(data, d => d.jobs)! : d3.min(data, d => d.avg_salary)!,
              prop2 === 'jobs' ? d3.max(data, d => d.jobs)! : d3.max(data, d => d.avg_salary)!
      ])
      .range([height - margin.bottom, margin.top]);

      const xAxis = (g: any) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format('d')));

    const yAxis = (g: any) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    const line = d3.line<DataPoint>()
      .x(d => x(d.year))
      .y(d => prop2 === 'jobs' ? y(d.jobs) : y(d.avg_salary));

    svg.selectAll('*').remove();

    svg.append('g')
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }, [data, prop2]);

  return <svg ref={svgRef} width={500} height={300} />;
};

export default LineGraph;

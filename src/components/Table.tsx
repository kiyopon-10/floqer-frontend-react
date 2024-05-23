import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';

import LineChart from './LineChart';


interface JobData {
  id: number;
  work_year: number;
  job_title: string;
  salary_in_usd: number;
}

interface YearlyStats {
  year: number;
  jobs: number;
  avg_salary: number;
}

interface jobTypeInteface {
    job_title: string;
    total_jobs: number
}

const App: React.FC = () => {
    const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
    const [yearData, setYearData] =  useState<jobTypeInteface[]>([]);
    const [sortBy, setSortBy] = useState<string>('year');
    const [apiData, setApiData] = useState<JobData[]>([])

    const [jobDataGraph, setJobDataGraph] = useState<YearlyStats[]>([]);

    const [year, setYear] = useState<number>(0)
    //var jobData: JobData[] = [];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get<JobData[]>('http://127.0.0.1:8000/api/jobdata/');
            const jobData = response.data;
            setApiData(jobData)
            console.log(jobData)

            const yearlyDataMap = new Map<number, { totalSalary: number; count: number }>();
            jobData.forEach((job) => {
                const { work_year, salary_in_usd } = job;
                if(yearlyDataMap.has(work_year)) {
                    const existingYearlyData = yearlyDataMap.get(work_year)!;
                    existingYearlyData.totalSalary += salary_in_usd;
                    existingYearlyData.count++;
                    yearlyDataMap.set(work_year, existingYearlyData);
                }

                else {
                    yearlyDataMap.set(work_year, { totalSalary: salary_in_usd, count: 1 });
                }
            });

            const yearlyStatsArray: YearlyStats[] = Array.from(yearlyDataMap, ([year, { totalSalary, count }]) => ({
                year,
                jobs: count,
                avg_salary: totalSalary / count,
            }));

            console.log(yearlyStatsArray)

            const sortedYearlyStats = yearlyStatsArray.sort((a, b) => {
                if(sortBy === 'year') {
                    return a.year - b.year;
                }
                else if (sortBy === 'jobs') {
                    return a.jobs - b.jobs;
                }
                else {
                    return a.avg_salary - b.avg_salary;
                }
            });

            setYearlyStats(sortedYearlyStats);

            setJobDataGraph(yearlyStatsArray.sort((a, b) => {
              return a.year - b.year;
            })); 
        } catch (error) {
            console.error('Error fetching data:', error);
        };
    }

    const handleSortChange = (event: SelectChangeEvent<string>) => {
      const sortBy = event.target.value;
      setSortBy(sortBy);
    
      const sortedYearlyStats = yearlyStats.slice().sort((a, b) => {
        return a[sortBy as keyof YearlyStats] - b[sortBy as keyof YearlyStats];
      });

      setYearlyStats(sortedYearlyStats);
    };

    const specificYearStats = (year: number)=>{
      alert(`Stats for ${year} is displayed. Scroll down.`)
        setYear(year)
        const filteredData = apiData.filter(job => job.work_year === year);

        const jobTypeDataMap = new Map<string, {count: number}>();
        filteredData.forEach((job) => {
            const { job_title } = job;
            if(jobTypeDataMap.has(job_title)) {
                const value = jobTypeDataMap.get(job_title)!;
                value.count++;
                jobTypeDataMap.set(job_title, value);
            }
            else {
                jobTypeDataMap.set(job_title, {count: 1});
            }
        });
        const jobTypeArray: jobTypeInteface[] = Array.from(jobTypeDataMap, ([job_title, { count }]) => ({
            job_title,
            total_jobs: count
        }));

        setYearData(jobTypeArray)

        console.log(year)
        console.log(yearData)
    }


  return (
    <div>
      <div className="App" style={{position: 'relative', left: '20vw'}}>
        <h1>Yearly Job Statistics</h1>
        <FormControl>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by-select"
            value={sortBy}
            onChange={handleSortChange}
            >
            <MenuItem value="year">Year</MenuItem>
            <MenuItem value="jobs">Number of Jobs</MenuItem>
            <MenuItem value="avg_salary">Average Salary (USD)</MenuItem>
          </Select>
        </FormControl>
        <TableContainer component={Paper} sx={{marginBottom: "8vh"}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Year</TableCell>
                <TableCell align="right">Number of Jobs</TableCell>
                <TableCell align="right">Average Salary (USD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yearlyStats.map(({ year, jobs, avg_salary }) => (
                <TableRow key={year} onClick={()=>{specificYearStats(year)}} style={{cursor: "pointer"}}>
                  <TableCell component="th" scope="row">
                    {year}
                  </TableCell>
                  <TableCell align="right">{jobs}</TableCell>
                  <TableCell align="right">${avg_salary.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div>
            <h2>Year vs Jobs</h2>
            <LineChart data={jobDataGraph} prop2="jobs"/>
          </div>
          <div>
            <h2>Year vs Avg Salary</h2>
            <LineChart data={jobDataGraph} prop2="avg_salary" />
          </div>
        </div>
        {
          year!==0 ?
          <div>
              <h1>{year} Data</h1>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Title</TableCell>
                      <TableCell align="right">Number of Jobs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yearData.map(({ job_title, total_jobs }) => (
                      <TableRow key={job_title}>
                        <TableCell component="th" scope="row">
                            {job_title}
                        </TableCell>
                        <TableCell align="right">{total_jobs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div> :
          null
        }
      </div>
    </div>
  );
};

export default App;



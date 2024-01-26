const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 5000;

app.use(express.json());


const file='./DataFile.csv';

const parseDate = (dateString) => {
    if (!dateString) {
      return null;
    }
  
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate) ? null : parsedDate;
  };

app.get('/analyze', (req, res) => {
  const employees = [];

  fs.createReadStream(file)
    .pipe(csv())
    .on('data', (row) => {
      employees.push(row);
    })
    .on('end', () => {
      const result = {
        consecutiveDays: analyzeConsecutiveDays(employees),
        timeBetweenShifts: analyzeTimeBetweenShifts(employees),
        longShifts: analyzeLongShifts(employees),
      };
     const resultString = JSON.stringify(result, null, 2)
      const outputData = "This is the content of the output file.";
      const filePath = 'output.txt';
     console.log(resultString);
      // Write to the file
      fs.writeFile(filePath, resultString, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log('File written successfully:', filePath);
        }
      });

      res.json(result);
    });
});




const analyzeConsecutiveDays = (employees) => {
    
    const result = [];
      employees.forEach((employee, index) => {
       
      const currentDate = employee.Time
    //   console.log("currentData",currentDate);
    //   console.log("original",employee.Time)

      let consecutiveCount = 1;
  
      for (let i = index + 1; i < employees.length ; i++) {
        
        if(employee['Position ID']===employees[i]['Position ID']){
            console.log("index i",i)
        const originalDate = employees[i].Time;
       // const diffInDays = calculateDateDifference(currentDate, originalDate);  

     const date1 = new Date(currentDate);
     const date2 = new Date(originalDate);
   
     // Calculate the time difference in milliseconds
    //console.log("date1", date1)
    // console.log("date2", date2)
       const timeDifference = Math.abs(date2 - date1)
      
     // Calculate the number of days
      const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
    //   console.log("daysDifference",daysDifference,);
    //   console.log("consecutiveCount",consecutiveCount);
        if (daysDifference === consecutiveCount) {
          consecutiveCount++;
        } else {
          break;
        }
       // console.log("consecutiveCount",consecutiveCount);
        if (consecutiveCount === 7) {
          result.push(employee);
          break; // No need to check further for this employee
        }
      }
      else{
        break;
      }
    }
    });
  //console.log(result);
    return result;
  };
  
  
  const analyzeTimeBetweenShifts = (employees) => {
    const result = [];
      employees.forEach((employee, index) => {
      const currentEndTime = new Date(employee['Time Out']);
      const nextStartTime = new Date(employees[index + 1]?.Time);
  
      if (nextStartTime) {
        const diffInHours = (nextStartTime - currentEndTime) / (1000 * 60 * 60);
  
        if (diffInHours < 10 && diffInHours > 1) {
          result.push(employee);
        }
      }
    });
  
    return result;
  };
  
  const analyzeLongShifts = (employees) => {
    return employees.filter((employee) => {
      const shiftHours = (new Date(employee['Time Out']) - new Date(employee['Time'])) / (1000 * 60 * 60);
      return shiftHours > 14;
    });
  };





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
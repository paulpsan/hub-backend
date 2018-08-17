"use strict";
import moment from "moment";
var meses = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

function setTotal(commits, series) {
  console.log(commits);
  let date;
  let count = 0;
  let dateAux = new Date(commits[0].fecha);
  for (const key in commits) {
    date = new Date(commits[key].fecha);
    if (date.getFullYear() === dateAux.getFullYear()) {
      count++;
    } else {
      series.push({
        name: moment(dateAux).format("YYYY"),
        value: count
      });
      count = 1;
      dateAux = new Date(date);
    }
  }
  series.push({
    name: moment(dateAux).format("YYYY"),
    value: count
  });
  return series;
}

function setYear(commits, series) {
  let date;
  let count = 0;
  let dateAux = new Date(commits[0].fecha);
  for (const key in commits) {
    date = new Date(commits[key].fecha);
    if (
      date.getMonth() === dateAux.getMonth() &&
      date.getFullYear() === dateAux.getFullYear()
    ) {
      count++;
    } else {
      series.push({
        name: new Date(dateAux),
        value: count
      });
      count = 1;
      dateAux = new Date(date);
    }
  }
  series.push({
    name: new Date(dateAux),
    value: count
  });
  return series;
}

function setMonth(commits, series) {
  let date;
  let count = 0;
  let dateAux = new Date(commits[0].fecha);
  for (const key in commits) {
    date = new Date(commits[key].fecha);
    if (
      date.getDay() === dateAux.getDay() &&
      date.getMonth() === dateAux.getMonth() &&
      date.getFullYear() === dateAux.getFullYear()
    ) {
      count++;
    } else {
      series.push({
        name: new Date(dateAux),
        value: count
      });
      count = 1;
      dateAux = new Date(date);
    }
  }
  series.push({
    name: new Date(dateAux),
    value: count
  });
  console.log(series);;
  return series;
}

function getCalendarData(commits) {
  moment.locale('es')
  console.log(commits[commits.length - 1].name);
  let calendarData = [];
  let cont = 0;
  let auxDate = new Date(commits[cont].name);
  let maxDate = new Date(commits[commits.length - 1].name);
  console.log(auxDate, maxDate);
  let todaysDay = maxDate.getDate();
  let thisMonday = new Date(
    maxDate.getFullYear(),
    maxDate.getMonth(),
    todaysDay - maxDate.getDay() + 1
  );
  let thisMondayDay = thisMonday.getDate();
  const thisMondayYear = thisMonday.getFullYear();
  const thisMondayMonth = thisMonday.getMonth();

  const getDate = d => {
    let date = new Date(thisMondayYear, thisMondayMonth, d);
    return date
  }
  let dateAgo = getDate(thisMondayDay - 364);
  while (dateAgo.getTime() > auxDate.getTime()) {
    cont++;
    auxDate = new Date(commits[cont].name);
  }
  for (let week = -52; week <= 0; week++) {
    const mondayDay = thisMondayDay + week * 7;
    const monday = getDate(mondayDay);

    const series = [];
    let value;
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      let date = getDate(mondayDay - 1 + dayOfWeek);
      if (
        date.getDate() === auxDate.getDate() &&
        date.getMonth() === auxDate.getMonth() &&
        date.getFullYear() === auxDate.getFullYear()
      ) {
        value = commits[cont].value;
        cont++;
        if (commits[cont]) {
          auxDate = new Date(commits[cont].name);
        }
      } else {
        value = 0;
      }
      date = moment(date);
      series.unshift({
        date,
        name: moment(date).format('dddd'),
        value
      });
    }
    // series.reverse();
    calendarData.push({
      name: monday.toString(),
      series
    });
  }
  console.log(calendarData);
  return calendarData;
}

function changeLanguage(data, format) {
  moment.locale('es');
  let resultado;
  resultado = data.map(function (data) {
    let objEs = {}
    objEs.name = moment(data.name).format(format);
    objEs.value = data.value
    return objEs;
  })
  return resultado;
}
class LineChart {
  static byCommits(data) {
    if (data) {
      console.log(data);
      let resp = {};
      let serieTotal = [];
      let serieYear = [];
      let serieMonth = [];
      resp.año = setTotal(data, serieTotal);
      resp.mes = setYear(data, serieYear);
      resp.total = setMonth(data, serieMonth);
      resp.heatMap = getCalendarData(resp.total);
      resp.mes = changeLanguage(resp.mes, "MMM YYYY");
      resp.total = changeLanguage(resp.total, "DD MMM YYY");
      return resp;
    }
    return null;
  }
}

export default LineChart;
async function init() {
// X range
var xs = d3.scaleLog().domain([10, 150]).range([ 0,  200]);
// Y range
var ys = d3.scaleLog().domain([10, 150]).range([200, 0]);
var margin = 50;

const data = await d3.csv('https://flunky.github.io/cars2017.csv');
const company_data = await d3.csv('https://drive.google.com/file/d/1hWLA_H31VW1ddxcK6iefu6MdTcVXpUd7/view?usp=sharing');
console.log(company_data[2]);

console.log(data[0])
//console.log(company_data[1])

d3.select('svg')
.append('g')
.attr('transform', "translate("+ margin +","+margin+")")
.selectAll()
.data(data)
.enter()
.append('circle')
.attr('cx', function(d,i) {return xs(parseInt(d.AverageCityMPG));})
.attr('cy', function(d,i) {return ys(parseInt(d.AverageHighwayMPG));})
.attr('r',  function(d,i) {return 2+ parseInt(d.EngineCylinders);} );

d3.select('svg')
.append('g')
.attr("transform","translate("+margin+","+margin+")")
.call(d3.axisLeft(ys)
             .tickValues([10,20,50,100])
             .tickFormat(d3.format("~s")));



d3.select('svg')
.append('g')
.attr('transform', "translate("+ margin +","+(300 - margin)+")")
.call(d3.axisBottom(xs)
             .tickValues([10,20,50,100])
             .tickFormat(d3.format("~s")));

}